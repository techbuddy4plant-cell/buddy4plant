import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API: Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Vana Botanica',
    timestamp: new Date().toISOString(),
  });
});

// API: Razorpay Create Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order amount' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If real keys are provided, call Razorpay Orders API
    if (keyId && keySecret && !keyId.includes('YOUR_')) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert to paise
          currency: 'INR',
          receipt: receipt || `rec_${Date.now()}`,
          payment_capture: 1,
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        return res.status(400).json({ success: false, error: orderData.error?.description || 'Razorpay order failed' });
      }

      return res.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId,
        isMock: false,
      });
    }

    // Seamless Sandbox/Simulator mode when keys are not yet configured in env
    const mockOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return res.json({
      success: true,
      orderId: mockOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      keyId: 'rzp_test_VanaBotanicaDemo',
      isMock: true,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Razorpay Verify Signature
app.post('/api/razorpay/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If live/test secret key exists, compute and verify HMAC SHA256
    if (keySecret && !keySecret.includes('YOUR_')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature === razorpay_signature) {
        return res.json({ verified: true });
      } else {
        return res.status(400).json({ verified: false, error: 'Signature mismatch' });
      }
    }

    // In simulator mode, automatically verify
    return res.json({ verified: true, isMock: true });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ verified: false, error: error.message || 'Verification Error' });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vana Botanica server running at http://localhost:${PORT}`);
  });
}

start();
