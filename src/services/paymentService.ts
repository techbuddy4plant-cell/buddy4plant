/**
 * Razorpay online payments (UPI, cards, netbanking, wallets).
 * The order is created and the payment verified on our server (server.ts) - the secret key never
 * reaches the browser, and a payment only counts once the server has confirmed it with Razorpay.
 */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay]');
    const script = existing || document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.dataset.razorpay = '1';
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    if (!existing) document.body.appendChild(script);
  });
}

export interface PaymentConfig {
  enabled: boolean;
  keyId: string;
  mode: 'test' | 'live';
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    const res = await fetch('/api/razorpay/config');
    if (res.ok) return await res.json();
  } catch {
    /* server not reachable */
  }
  return { enabled: false, keyId: '', mode: 'test' };
}

export interface RazorpayPaymentSuccessData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifiedPayment {
  paymentId: string;
  orderId: string;
  method?: string;
  amount?: number;
}

/**
 * Opens Razorpay Checkout. Calls onSuccess only after our server has verified the payment.
 */
export async function processRazorpayCheckout({
  amount,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  onDismiss,
}: {
  amount: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (payment: VerifiedPayment) => void;
  onFailure: (errorMsg: string) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    onFailure('Could not load the payment window. Check your internet connection and try again.');
    return;
  }

  let order: { success: boolean; orderId?: string; amount?: number; currency?: string; keyId?: string; error?: string };
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt: orderNumber }),
    });
    order = await res.json();
  } catch {
    order = { success: false, error: 'Could not reach the payment server. Please try again.' };
  }
  if (!order.success || !order.orderId || !order.keyId) {
    onFailure(order.error || 'Could not start the payment.');
    return;
  }

  const logo = window.location.protocol === 'https:' ? `${window.location.origin}/logo.png` : undefined;
  const phone = customerPhone.replace(/\D/g, '').slice(-10);

  const options = {
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'Buddy4Plant',
    description: `Order ${orderNumber}`,
    ...(logo ? { image: logo } : {}),
    prefill: { name: customerName, email: customerEmail, contact: phone },
    notes: { order_number: orderNumber },
    theme: { color: '#13301B' },
    // UPI and cards shown first; netbanking and wallets stay available below
    config: {
      display: {
        blocks: {
          pref: { name: 'Pay using UPI or Card', instruments: [{ method: 'upi' }, { method: 'card' }] },
        },
        sequence: ['block.pref'],
        preferences: { show_default_blocks: true },
      },
    },
    retry: { enabled: true, max_count: 3 },
    handler: async (response: RazorpayPaymentSuccessData) => {
      try {
        const res = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        });
        const data = await res.json();
        if (res.ok && data.verified) {
          onSuccess({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id, method: data.method, amount: data.amount });
        } else {
          onFailure(
            `${data.error || 'We could not confirm your payment'}. If money was deducted, contact us with payment ID ${response.razorpay_payment_id}.`
          );
        }
      } catch {
        onFailure(`We could not confirm your payment. If money was deducted, contact us with payment ID ${response.razorpay_payment_id}.`);
      }
    },
    modal: {
      ondismiss: () => (onDismiss ? onDismiss() : onFailure('Payment was cancelled')),
      confirm_close: true,
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
      /* Razorpay shows the error and lets the customer retry inside the window */
    });
    rzp.open();
  } catch (err: any) {
    onFailure(err?.message || 'Could not open the payment window');
  }
}
