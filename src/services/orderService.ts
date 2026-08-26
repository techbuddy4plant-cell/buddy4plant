import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { deductProductStock } from './productService';

const ORDERS_COLLECTION = 'orders';

// Notify active listeners across windows/tabs
function notifyLocalOrderUpdate(order: Order) {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('vb_order_live_update', { detail: order }));
    } catch (e) {
      // ignore
    }
  }
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'> & {
    id?: string;
    orderNumber?: string;
  }
): Promise<Order> {
  const timestamp = Date.now();
  const id = orderData.id || `ord-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = orderData.orderNumber || `B4P-${timestamp.toString().slice(-6)}`;

  const newOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    createdAt: timestamp,
    updatedAt: timestamp,
    deliveryCourier: orderData.deliveryCourier || 'BlueDart Express Eco',
    trackingNumber: orderData.trackingNumber || `B4P-EXP-${orderNumber.replace(/[^0-9]/g, '')}`,
    currentLocation: orderData.currentLocation || 'Bengaluru Central Botanical Nursery Hub',
    statusHistory: [
      {
        status: orderData.orderStatus || 'Pending',
        timestamp,
        location: 'Bengaluru Central Botanical Nursery Hub',
        note:
          orderData.paymentMethod === 'cod'
            ? 'Order placed with Cash on Delivery. Preparing specimen potting inspection.'
            : 'Order confirmed and paid. Botanical quality inspection initiated.'
      }
    ]
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await setDoc(docRef, newOrder);

    // Deduct stock for all items
    for (const item of newOrder.items) {
      await deductProductStock(item.productId, item.quantity);
    }

    notifyLocalOrderUpdate(newOrder);
    return newOrder;
  } catch (err) {
    console.error('Error creating order in Firestore, using local fallback:', err);
    // Fallback to local session storage cache
    try {
      const localOrders = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
      localOrders.unshift(newOrder);
      localStorage.setItem('vb_local_orders', JSON.stringify(localOrders));
      notifyLocalOrderUpdate(newOrder);
    } catch (e) {
      // ignore
    }
    return newOrder;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Order;
    }
  } catch (err) {
    console.warn('Error finding order by ID:', err);
  }

  // Check local fallback
  try {
    const localOrders: Order[] = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
    const found = localOrders.find((o) => o.id === id || o.orderNumber === id);
    if (found) return found;
  } catch (e) {
    // ignore
  }

  return null;
}

export async function getOrderByNumberOrPhone(orderIdentifier: string, phoneOrEmail?: string): Promise<Order | null> {
  const cleanIdent = orderIdentifier.trim().toUpperCase();
  const cleanContact = phoneOrEmail ? phoneOrEmail.trim().toLowerCase() : '';

  try {
    // Check by exact orderNumber
    const colRef = collection(db, ORDERS_COLLECTION);
    const q1 = query(colRef, where('orderNumber', '==', cleanIdent));
    const snap1 = await getDocs(q1);

    if (!snap1.empty) {
      const ord = snap1.docs[0].data() as Order;
      if (
        !cleanContact ||
        ord.customerEmail.toLowerCase() === cleanContact ||
        ord.customerPhone.replace(/[^0-9]/g, '') === cleanContact.replace(/[^0-9]/g, '')
      ) {
        return { id: snap1.docs[0].id, ...ord };
      }
    }

    // Check by doc ID
    const docRef = doc(db, ORDERS_COLLECTION, orderIdentifier.trim());
    const snap2 = await getDoc(docRef);
    if (snap2.exists()) {
      const ord = snap2.data() as Order;
      if (
        !cleanContact ||
        ord.customerEmail.toLowerCase() === cleanContact ||
        ord.customerPhone.replace(/[^0-9]/g, '') === cleanContact.replace(/[^0-9]/g, '')
      ) {
        return { id: snap2.id, ...ord };
      }
    }
  } catch (err) {
    console.warn('Firestore query error during order tracking:', err);
  }

  // Fallback to local
  try {
    const localOrders: Order[] = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
    const found = localOrders.find(
      (o) =>
        (o.orderNumber.toUpperCase() === cleanIdent || o.id === orderIdentifier.trim()) &&
        (!cleanContact ||
          o.customerEmail.toLowerCase() === cleanContact ||
          o.customerPhone.replace(/[^0-9]/g, '') === cleanContact.replace(/[^0-9]/g, ''))
    );
    if (found) return found;
  } catch (e) {
    // ignore
  }

  return null;
}

export async function getCustomerOrders(customerId: string, email?: string): Promise<Order[]> {
  const results: Order[] = [];
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const q = query(colRef, where('customerId', '==', customerId));
    const snap = await getDocs(q);
    snap.forEach((d) => results.push({ id: d.id, ...d.data() } as Order));

    if (email && results.length === 0) {
      const qEmail = query(colRef, where('customerEmail', '==', email));
      const snapEmail = await getDocs(qEmail);
      snapEmail.forEach((d) => results.push({ id: d.id, ...d.data() } as Order));
    }
  } catch (err) {
    console.warn('Error fetching customer orders:', err);
  }

  // Append local orders if any
  try {
    const localOrders: Order[] = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
    for (const lo of localOrders) {
      if (
        (lo.customerId === customerId || (email && lo.customerEmail === email)) &&
        !results.some((r) => r.id === lo.id)
      ) {
        results.push(lo);
      }
    }
  } catch (e) {
    // ignore
  }

  return results.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllOrders(): Promise<Order[]> {
  const results: Order[] = [];
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(colRef);
    snap.forEach((d) => results.push({ id: d.id, ...d.data() } as Order));
  } catch (err) {
    console.warn('Error fetching all orders from Firestore:', err);
  }

  // Include local orders
  try {
    const localOrders: Order[] = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
    for (const lo of localOrders) {
      if (!results.some((r) => r.id === lo.id)) {
        results.push(lo);
      }
    }
  } catch (e) {
    // ignore
  }

  return results.sort((a, b) => b.createdAt - a.createdAt);
}

export const getOrders = getAllOrders;

/**
 * Real-time listener for ALL orders in Admin Dashboard
 */
export function subscribeToAllOrders(onUpdate: (orders: Order[]) => void): () => void {
  let unsubFirestore: (() => void) | null = null;

  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    unsubFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        const firestoreOrders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        // Merge with local fallback
        const localOrders: Order[] = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
        const merged = [...firestoreOrders];
        for (const lo of localOrders) {
          if (!merged.some((m) => m.id === lo.id)) {
            merged.push(lo);
          }
        }
        merged.sort((a, b) => b.createdAt - a.createdAt);
        onUpdate(merged);
      },
      (err) => {
        console.warn('Firestore snapshot listener fallback:', err);
        getAllOrders().then(onUpdate);
      }
    );
  } catch (err) {
    console.warn('Could not establish Firestore listener for orders:', err);
    getAllOrders().then(onUpdate);
  }

  // Also listen for local custom live events
  const handleLocalUpdate = () => {
    getAllOrders().then(onUpdate);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('vb_order_live_update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('vb_order_live_update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
  };
}

/**
 * Real-time listener for a single order (used by customer Order Tracking page)
 */
export function subscribeToOrder(
  orderNumberOrId: string,
  onUpdate: (order: Order | null) => void
): () => void {
  let unsubFirestore: (() => void) | null = null;
  const cleanId = orderNumberOrId.trim();

  // Initial fetch
  getOrderByNumberOrPhone(cleanId).then((ord) => onUpdate(ord));

  try {
    // Listen to collection query for this order number or doc ID
    const colRef = collection(db, ORDERS_COLLECTION);
    const q = query(colRef, where('orderNumber', '==', cleanId.toUpperCase()));

    unsubFirestore = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const ord = { id: snap.docs[0].id, ...snap.docs[0].data() } as Order;
          onUpdate(ord);
        } else {
          // If not found by query, check local
          getOrderByNumberOrPhone(cleanId).then((ord) => onUpdate(ord));
        }
      },
      () => {
        getOrderByNumberOrPhone(cleanId).then((ord) => onUpdate(ord));
      }
    );
  } catch (err) {
    getOrderByNumberOrPhone(cleanId).then((ord) => onUpdate(ord));
  }

  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<Order>;
    if (
      customEvent.detail &&
      (customEvent.detail.id === cleanId ||
        customEvent.detail.orderNumber.toUpperCase() === cleanId.toUpperCase())
    ) {
      onUpdate(customEvent.detail);
    } else {
      getOrderByNumberOrPhone(cleanId).then((ord) => onUpdate(ord));
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('vb_order_live_update', handleLocalUpdate);
    window.addEventListener('storage', () => {
      getOrderByNumberOrPhone(cleanId).then((ord) => onUpdate(ord));
    });
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('vb_order_live_update', handleLocalUpdate);
    }
  };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  trackingNumber?: string,
  deliveryCourier?: string,
  currentLocation?: string
): Promise<void> {
  const timestamp = Date.now();
  let updatedOrder: Order | null = null;

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const ord = snap.data() as Order;
      const history = ord.statusHistory || [];
      history.push({
        status: newStatus,
        timestamp,
        location: currentLocation || ord.currentLocation || 'In Botanical Transit',
        note: note || `Fulfillment milestone updated to ${newStatus}`
      });

      const updateData: Partial<Order> = {
        orderStatus: newStatus,
        updatedAt: timestamp,
        statusHistory: history,
      };

      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (deliveryCourier !== undefined) updateData.deliveryCourier = deliveryCourier;
      if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
      if (newStatus === 'Delivered') {
        if (ord.paymentMethod === 'cod') {
          updateData.paymentStatus = 'paid';
        }
      }

      await updateDoc(docRef, updateData);
      updatedOrder = { ...ord, ...updateData };
    }
  } catch (err) {
    console.error('Error updating order status in Firestore:', err);
  }

  // Update local storage if present
  try {
    const localOrders: Order[] = JSON.parse(localStorage.getItem('vb_local_orders') || '[]');
    const idx = localOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx !== -1) {
      const ord = localOrders[idx];
      const history = ord.statusHistory || [];
      history.push({
        status: newStatus,
        timestamp,
        location: currentLocation || ord.currentLocation || 'In Botanical Transit',
        note: note || `Status updated to ${newStatus}`
      });
      ord.orderStatus = newStatus;
      ord.updatedAt = timestamp;
      ord.statusHistory = history;
      if (trackingNumber) ord.trackingNumber = trackingNumber;
      if (deliveryCourier) ord.deliveryCourier = deliveryCourier;
      if (currentLocation) ord.currentLocation = currentLocation;
      if (newStatus === 'Delivered' && ord.paymentMethod === 'cod') {
        ord.paymentStatus = 'paid';
      }
      localStorage.setItem('vb_local_orders', JSON.stringify(localOrders));
      updatedOrder = ord;
    }
  } catch (e) {
    // ignore
  }

  if (updatedOrder) {
    notifyLocalOrderUpdate(updatedOrder);
  }
}

export async function updateOrderTracking(
  orderId: string,
  deliveryCourier: string,
  trackingNumber: string,
  currentLocation?: string,
  customNote?: string
): Promise<void> {
  await updateOrderStatus(
    orderId,
    'Shipped',
    customNote || `Dispatched via ${deliveryCourier}. AWB Tracking Code: ${trackingNumber}`,
    trackingNumber,
    deliveryCourier,
    currentLocation || 'In Transit - Out of Regional Nursery Hub'
  );
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  razorpayPaymentId?: string
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: any = {
      paymentStatus,
      updatedAt: Date.now(),
    };
    if (razorpayPaymentId) {
      updateData.razorpayPaymentId = razorpayPaymentId;
    }
    if (paymentStatus === 'paid') {
      updateData.orderStatus = 'Confirmed';
    }
    await updateDoc(docRef, updateData);
  } catch (err) {
    console.error('Error updating payment status:', err);
  }
}
