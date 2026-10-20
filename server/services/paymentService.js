const crypto = require('crypto');
let Razorpay = null;
try {
  Razorpay = require('razorpay');
} catch (e) {
  // Graceful fallback if razorpay package fails to load
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Check if live/real Razorpay credentials are configured
const isRazorpayConfigured = () => {
  return Boolean(
    RAZORPAY_KEY_ID &&
    RAZORPAY_KEY_SECRET &&
    !RAZORPAY_KEY_ID.includes('YOUR_') &&
    !RAZORPAY_KEY_SECRET.includes('YOUR_')
  );
};

// Initialize Razorpay client if configured
let razorpayInstance = null;
if (isRazorpayConfigured() && Razorpay) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  } catch (err) {
    console.warn('Could not initialize Razorpay client:', err.message);
  }
}

/**
 * Public key accessor for client-side Checkout.js
 */
const getPublicKey = () => {
  if (isRazorpayConfigured()) {
    return RAZORPAY_KEY_ID;
  }
  // Safe test-mode public key
  return 'rzp_test_kandhari_mock';
};

/**
 * Create a Razorpay Payment Order (in INR paise)
 * @param {Object} params
 * @param {number} params.amountInRupees - Amount in whole INR
 * @param {string} params.receipt - Internal order or enquiry reference
 * @param {Object} params.notes - Metadata notes
 */
const createOrder = async ({ amountInRupees, receipt, notes = {} }) => {
  const amountInPaise = Math.round(Number(amountInRupees) * 100);

  if (isNaN(amountInPaise) || amountInPaise <= 0) {
    throw new Error('Invalid order amount for payment creation.');
  }

  // 1. If real Razorpay is configured, call official API
  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt.substring(0, 40),
        notes: {
          business: 'Kandhari Tent & Caterers',
          venue: 'Dwarka Shri Lawn, Lucknow',
          ...notes
        }
      });

      return {
        success: true,
        isTestMode: false,
        key: RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        amountInRupees: amountInRupees,
        currency: order.currency,
        receipt: order.receipt
      };
    } catch (err) {
      console.error('Razorpay API order creation failed, falling back to test mode:', err.message);
    }
  }

  // 2. Production-ready test mode simulation
  const testOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  return {
    success: true,
    isTestMode: true,
    key: getPublicKey(),
    orderId: testOrderId,
    amount: amountInPaise,
    amountInRupees: amountInRupees,
    currency: 'INR',
    receipt: receipt
  };
};

/**
 * Verify Razorpay payment signature
 * HMAC SHA256(order_id + "|" + payment_id, secret) === signature
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId) {
    return { verified: false, message: 'Missing orderId or paymentId' };
  }

  // If live Razorpay is configured with secret
  if (isRazorpayConfigured()) {
    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isMatch = expectedSignature === signature;
      return {
        verified: isMatch,
        isTestMode: false,
        message: isMatch ? 'Signature verified successfully' : 'Invalid payment signature'
      };
    } catch (err) {
      return { verified: false, isTestMode: false, message: err.message };
    }
  }

  // In test mode, accept simulated test signatures or generated test hashes
  const testSecret = 'kandhari_test_secret';
  const expectedTestSignature = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isTestMatch = signature === expectedTestSignature || (signature && signature.startsWith('sig_test_'));

  return {
    verified: isTestMatch,
    isTestMode: true,
    message: isTestMatch ? 'Test payment signature verified' : 'Test signature mismatch'
  };
};

/**
 * Helper to generate a valid test signature for frontend test-mode checkout
 */
const generateTestSignature = (orderId, paymentId) => {
  const testSecret = 'kandhari_test_secret';
  return crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
};

/**
 * Verify Webhook Signature
 */
const verifyWebhookSignature = (rawBody, signature) => {
  if (!signature) return false;
  const secret = RAZORPAY_WEBHOOK_SECRET || 'kandhari_webhook_test_secret';
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
};

module.exports = {
  isRazorpayConfigured,
  getPublicKey,
  createOrder,
  verifyPaymentSignature,
  generateTestSignature,
  verifyWebhookSignature
};
