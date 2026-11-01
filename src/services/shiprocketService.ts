import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order, OrderStatus } from '../types';
import { isAdminSession } from '../utils/adminSession';
import { authHeaders, orderKeyFor } from './apiAuth';

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

/**
 * Save a few fields on the order: this browser's copy, and the cloud order when an admin is signed in.
 * (For customers the server saves shipping details itself - the database doesn't let customers change orders.)
 */
async function patchOrder(order: Order, fields: Partial<Order>) {
  const data = { ...fields, updatedAt: Date.now() };
  if (isAdminSession()) {
    try {
      await updateDoc(doc(db, 'orders', order.id), data as any);
    } catch (e) {
      console.warn('Could not save shipping details to the cloud order:', e);
    }
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
  const eligible = order.paymentMethod === 'cod' || (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid');
  if (!eligible) return { ok: false, error: 'Only Cash on Delivery orders and orders paid online are sent' };
  if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded') return { ok: false, error: 'Order is cancelled' };
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
    // the server reads the order, asks Shiprocket and saves the latest details on the order
    const q = new URLSearchParams({ id: order.id });
    const key = orderKeyFor(order.id) || orderKeyFor(order.orderNumber);
    if (key) q.set('key', key);
    const res = await fetch(`/api/shiprocket/track?${q}`, { headers: await authHeaders() });
    const t: ShiprocketTracking & { orderStatus?: OrderStatus } = await res.json();
    if (!res.ok || !t.success) return null;
    // show it straight away in this browser
    const fields: Partial<Order> = {
      shiprocketStatus: t.status || order.shiprocketStatus,
      trackingNumber: t.awb || order.trackingNumber,
      deliveryCourier: t.courier || order.deliveryCourier,
      currentLocation: t.location || order.currentLocation,
      estimatedDeliveryDate: t.etd || order.estimatedDeliveryDate,
      shiprocketTrackUrl: t.trackUrl || order.shiprocketTrackUrl,
    };
    if (t.orderStatus) fields.orderStatus = t.orderStatus;
    try {
      window.dispatchEvent(new CustomEvent('vb_order_live_update', { detail: { ...order, ...fields } }));
    } catch {
      /* ignore */
    }
    return t;
  } catch {
    return null;
  }
}

/** Cancels the shipment on Shiprocket too (only possible before it ships). Finds the Shiprocket order even if its id was never saved here. */
export async function cancelOnShiprocket(order: Order): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/shiprocket/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ id: order.id, orderNumber: order.orderNumber, key: orderKeyFor(order.id) || orderKeyFor(order.orderNumber) }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.success) {
      if (!d.notOnShiprocket) await patchOrder({ ...order }, { shiprocketStatus: 'CANCELED' });
      return { ok: true };
    }
    // Shiprocket not set up / not reachable: the website order is still cancelled and the
    // 30-minute sync cancels it on Shiprocket later
    return { ok: false, error: d.error || 'Could not reach Shiprocket' };
  } catch {
    return { ok: false, error: 'Could not reach the server' };
  }
}

// ---------- admin controls (Admin > Orders) ----------
export interface CourierOption {
  id: number;
  name: string;
  rate: number;
  days: string;
  etd: string;
  rating: number;
  cod: boolean;
  surface: boolean;
}

/** Calls an admin-only Shiprocket action on the server (it checks the admin sign-in itself). */
export async function shiprocketAdmin<T = any>(op: string, body: Record<string, unknown> = {}): Promise<T & { success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/shiprocket/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ op, ...body }),
    });
    const d = await res.json().catch(() => ({}));
    return { success: false, ...d } as T & { success: boolean; error?: string };
  } catch {
    return { success: false, error: 'Could not reach the server' } as T & { success: boolean; error?: string };
  }
}
