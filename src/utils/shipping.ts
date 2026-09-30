/**
 * Shipping helpers.
 * - realShipping: only shows courier / AWB details the admin actually entered
 *   (older orders were given sample values automatically - those are ignored).
 * - estimateDelivery: delivery window from the customer's pincode.
 */
type ShippingFields = { deliveryCourier?: string; trackingNumber?: string; currentLocation?: string };

const SAMPLE_COURIERS = /^(bluedart (express eco|botanical express))$/i;
const SAMPLE_AWB = /^(B4P|VB)-EXP-\d+$/i;
const SAMPLE_LOCATION = /bengaluru|central botanical nursery hub/i;

export const realShipping = (o: ShippingFields) => {
  const courier = (o.deliveryCourier || '').trim();
  const awb = (o.trackingNumber || '').trim();
  const location = (o.currentLocation || '').trim();
  return {
    courier: courier && !SAMPLE_COURIERS.test(courier) ? courier : '',
    awb: awb && !SAMPLE_AWB.test(awb) ? awb : '',
    location: location && !SAMPLE_LOCATION.test(location) ? location : '',
  };
};

export const COURIER_PENDING_TEXT = 'Courier and tracking details will appear here once your order is shipped.';

/** Delivery days by area - Lucknow nursery ships across India. */
export const DELIVERY_ZONES = [
  { name: 'Lucknow', test: (p: string) => p.startsWith('226'), min: 1, max: 2 },
  { name: 'Uttar Pradesh', test: (p: string) => /^2[0-8]/.test(p), min: 2, max: 4 },
  { name: 'Delhi NCR', test: (p: string) => p.startsWith('11') || /^12[12]/.test(p) || p.startsWith('201'), min: 3, max: 5 },
  { name: 'Rest of India', test: (_p: string) => true, min: 5, max: 8 },
];

const fmt = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export const estimateDelivery = (pincode: string, from = new Date()) => {
  const p = pincode.trim();
  if (!/^[1-9]\d{5}$/.test(p)) return null;
  // Delhi NCR checked before the wider UP range (Noida/Ghaziabad are 201xxx)
  const zone = [DELIVERY_ZONES[0], DELIVERY_ZONES[2], DELIVERY_ZONES[1], DELIVERY_ZONES[3]].find((z) => z.test(p))!;
  const a = new Date(from);
  a.setDate(a.getDate() + zone.min);
  const b = new Date(from);
  b.setDate(b.getDate() + zone.max);
  return { zone: zone.name, from: fmt(a), to: fmt(b) };
};
