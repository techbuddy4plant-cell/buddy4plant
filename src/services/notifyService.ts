import { useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Order, Product } from '../types';

/**
 * WhatsApp / SMS messages (sent by the server, see netlify/functions/notify.mjs):
 *  - order details right after an order is placed
 *  - one reminder for a signed-in customer who left items in the cart or looked at products without ordering
 */

const ACTIVITY = 'cartActivity';
const VIEWED_KEY = 'b4p_recently_viewed';
const VIEWED_EVENT = 'b4p_product_viewed';
const ORDERED_EVENT = 'b4p_order_placed';

type Viewed = { id: string; name: string; slug: string };

const readViewed = (): Viewed[] => {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]');
  } catch {
    return [];
  }
};

/** Call when a product page is opened. */
export function recordProductView(p: Pick<Product, 'id' | 'name' | 'slug'>) {
  try {
    const list = [{ id: p.id, name: p.name, slug: p.slug }, ...readViewed().filter((x) => x.id !== p.id)].slice(0, 5);
    localStorage.setItem(VIEWED_KEY, JSON.stringify(list));
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event(VIEWED_EVENT));
}

/** Call right after an order is saved: sends the order details on WhatsApp/SMS and stops any reminder. */
export function orderPlaced(order: Pick<Order, 'id'>) {
  try {
    localStorage.removeItem(VIEWED_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(ORDERED_EVENT));
  void fetch('/api/notify/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: order.id }),
  }).catch(() => {
    /* the server's 30-minute check sends it later */
  });
}

/** Keeps the signed-in customer's cart / recently viewed products on the server so a reminder can be sent. */
export function useReminderTracking() {
  const { user, profile } = useAuth();
  const { items } = useCart();
  const timer = useRef<number | undefined>(undefined);
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const phone =
      profile?.phone ||
      profile?.addresses?.find((a) => a.isDefault)?.phone ||
      profile?.addresses?.[0]?.phone ||
      '';
    const name = profile?.displayName || user?.displayName || '';
    const sigKey = `b4p_activity_sig_${uid}`;

    const save = (extra: Record<string, unknown> = {}) => {
      const cart = items.map((i) => ({ id: i.product.id, name: i.product.name, qty: i.quantity }));
      const inCart = new Set(cart.map((c) => c.id));
      const viewed = readViewed().filter((x) => !inCart.has(x.id)).slice(0, 3);
      const sig = JSON.stringify([cart, viewed.map((x) => x.id), phone]);
      let old = '';
      try {
        old = localStorage.getItem(sigKey) || '';
      } catch {
        /* ignore */
      }
      if (sig === old && !Object.keys(extra).length) return; // nothing changed
      try {
        localStorage.setItem(sigKey, sig);
      } catch {
        /* ignore */
      }
      void setDoc(
        doc(db, ACTIVITY, uid),
        { uid, name, phone, cart, viewed, updatedAt: Date.now(), ...extra },
        { merge: true }
      ).catch(() => {
        /* reminders are optional */
      });
    };

    const later = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => save(), 4000);
    };
    const ordered = () => save({ orderedAt: Date.now(), cart: [], viewed: [] });

    later();
    window.addEventListener(VIEWED_EVENT, later);
    window.addEventListener(ORDERED_EVENT, ordered);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener(VIEWED_EVENT, later);
      window.removeEventListener(ORDERED_EVENT, ordered);
    };
  }, [uid, profile, items, user?.displayName]);
}
