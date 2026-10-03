import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order, OrderStatus } from '../types';
import { updateOrderStatus } from './orderService';

export interface ShiprocketTracking {
  success: boolean;
  status: string;
  awb: string;
  courier: string;
  etd: string;
  location: string;
  trackUrl: string;
  activities: { date: string; activity: string; location: string }[];
  error?: string;
}

/** Save a few fields on the order (cloud + this browser's copy). */
async function patchOrder(order: Order, fields: Partial<Order>) {
  const data = { ...fields, updatedAt: Date.now() };
  try {
    await updateDoc(doc(db, 'orders', order.id), data as any);
  } catch (e) {
    console.warn('Could not save shipping details to the cloud order:', e);
  }
  try {
    const local: Order[] = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
    const i = local.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber);
    if (i !== -1) {
      local[i] = { ...local[i], ...data };
      localStorage.setItem('vb_local_orders', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('vb_order_live_update', { detail: local[i] }));
    }
  } catch {
    /* ignore */
  }
}

/** Sends a paid order to Shiprocket. Safe to call again - it does nothing if the order is already there. */
export async function pushOrderToShiprocket(order: Order): Promise<{ ok: boolean; error?: string }> {
  if (order.shiprocketOrderId) return { ok: true };
  if (order.paymentMethod !== 'razorpay' || order.paymentStatus !== 'paid') return { ok: false, error: 'Only orders paid online are sent automatically' };
  try {
    const res = await fetch('/api/shiprocket/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const d = await res.json();
    if (!res.ok || !d.success) {
      await patchOrder(order, { shiprocketError: String(d.error || 'Could not send to Shiprocket').slice(0, 300) });
      return { ok: false, error: d.error };
    }
    await patchOrder(order, {
      shiprocketOrderId: d.shiprocketOrderId,
      shiprocketShipmentId: d.shipmentId,
      shiprocketStatus: d.status,
      shiprocketError: '',
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the server' };
  }
}

/** Shiprocket status text -> the order steps shown on the website. */
function mapStatus(s: string): OrderStatus | null {
  const t = s.toUpperCase();
  if (/RTO|CANCEL|LOST|DAMAGED|UNDELIVERED/.test(t)) return null; // needs a human decision
  if (/^DELIVERED/.test(t)) return 'Delivered';
  if (/OUT FOR DELIVERY/.test(t)) return 'Out for Delivery';
  if (/IN TRANSIT|SHIPPED|PICKED UP|REACHED|DESTINATION HUB/.test(t)) return 'Shipped';
  if (/PICKUP|READY TO SHIP|AWB|MANIFEST|PACKED|INVOICED/.test(t)) return 'Packed';
  return null;
}
const RANK: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const lastSync = new Map<string, number>();

/**
 * Reads the latest courier / AWB / status from Shiprocket and saves it on the order,
 * so the tracking page, My Orders and the admin panel all show it.
 */
export async function syncShiprocket(order: Order, force = false): Promise<ShiprocketTracking | null> {
  if (!order.shiprocketOrderId && !order.shiprocketShipmentId) return null;
  if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded') return null;
  const seen = lastSync.get(order.id) || 0;
  if (!force && Date.now() - seen < 60_000) return null; // at most once a minute per order
  lastSync.set(order.id, Date.now());
  try {
    const q = new URLSearchParams({ order: order.shiprocketOrderId || '', shipment: order.shiprocketShipmentId || '' });
    const res = await fetch(`/api/shiprocket/track?${q}`);
    const t: ShiprocketTracking = await res.json();
    if (!res.ok || !t.success) return null;

    const fields: Partial<Order> = {};
    if (t.status && t.status !== order.shiprocketStatus) fields.shiprocketStatus = t.status;
    if (t.awb && t.awb !== order.trackingNumber) fields.trackingNumber = t.awb;
    if (t.courier && t.courier !== order.deliveryCourier) fields.deliveryCourier = t.courier;
    if (t.location && t.location !== order.currentLocation) fields.currentLocation = t.location;
    if (t.etd && t.etd !== order.estimatedDeliveryDate) fields.estimatedDeliveryDate = t.etd;
    if (t.trackUrl && t.trackUrl !== order.shiprocketTrackUrl) fields.shiprocketTrackUrl = t.trackUrl;
    if (Object.keys(fields).length) await patchOrder(order, fields);

    const next = t.status ? mapStatus(t.status) : null;
    if (next && RANK.indexOf(next) > RANK.indexOf(order.orderStatus)) {
      await updateOrderStatus(
        order.id,
        next,
        `${t.status}${t.courier ? ` - ${t.courier}` : ''}${t.awb ? ` (AWB ${t.awb})` : ''}`,
        t.awb || undefined,
        t.courier || undefined,
        t.location || undefined
      );
    }
    return t;
  } catch {
    return null;
  }
}
