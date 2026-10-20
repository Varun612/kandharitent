const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const paymentService = require('../services/paymentService');
const { createNotification } = require('./notificationController');

/**
 * 1. POST /api/payments/create-order
 * Customer requests a payment order for an approved booking
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { enquiryId, paymentType = 'advance' } = req.body;

    if (!enquiryId) {
      return res.status(400).json({ success: false, message: 'Enquiry / Order ID is required.' });
    }

    const db = getLocalDb();
    const enquiry = (db.enquiries || []).find(e => e.id === enquiryId);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Customer authorization check (customer can only pay for their own order, or admin)
    if (req.user && req.user.role === 'customer') {
      const isOwner =
        (enquiry.customerId && enquiry.customerId === req.user.id) ||
        (enquiry.email && enquiry.email.toLowerCase() === req.user.email?.toLowerCase()) ||
        (enquiry.phone && (enquiry.phone === req.user.phone || enquiry.whatsappNumber === req.user.phone));

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this order.' });
      }
    }

    // Enforce Default Workflow Step D: Must be approved and accepted
    const allowedStatuses = ['Approved — Awaiting Payment', 'Payment Pending'];
    if (enquiry.status === 'Pending Admin Approval' || enquiry.status === 'New') {
      return res.status(400).json({
        success: false,
        message: 'This booking is currently pending admin review. Payment will be unlocked once Kandhari Tent confirms inventory and dates.'
      });
    }

    if (enquiry.status === 'Approved — Awaiting Customer Acceptance') {
      return res.status(400).json({
        success: false,
        message: 'A revised quotation is awaiting your review. Please accept the quotation in your portal before proceeding to payment.'
      });
    }

    if (enquiry.status === 'Confirmed' && enquiry.balanceDue === 0) {
      return res.status(400).json({
        success: false,
        message: 'This order is already fully paid and confirmed.'
      });
    }

    if (enquiry.status === 'Rejected' || enquiry.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot process payment for an order with status "${enquiry.status}".`
      });
    }

    // Determine payable amount
    // If advance payment: 50% of grandTotal or balanceDue
    const total = Number(enquiry.grandTotal || 0);
    const balance = Number(enquiry.balanceDue !== undefined ? enquiry.balanceDue : total);
    let amountToPay = total;

    if (paymentType === 'advance' && enquiry.advancePaid === 0 && total > 5000) {
      // 50% advance standard booking deposit
      amountToPay = Math.round(total * 0.5);
    } else if (balance > 0) {
      amountToPay = balance;
    }

    // Create Razorpay payment order
    const paymentOrder = await paymentService.createOrder({
      amountInRupees: amountToPay,
      receipt: `RCP-${enquiry.id.replace('ENQ-', '')}`,
      notes: {
        enquiryId: enquiry.id,
        customerName: enquiry.customerName,
        eventDate: enquiry.eventDate,
        paymentType
      }
    });

    // Mark enquiry status as Payment Pending
    enquiry.status = 'Payment Pending';
    enquiry.lastPaymentOrderId = paymentOrder.orderId;
    saveLocalStore();

    return res.json({
      success: true,
      data: {
        ...paymentOrder,
        enquiryId: enquiry.id,
        customerName: enquiry.customerName,
        customerEmail: enquiry.email || req.user?.email || '',
        customerPhone: enquiry.phone || req.user?.phone || '',
        eventDate: enquiry.eventDate,
        grandTotal: total,
        amountToPay
      }
    });
  } catch (err) {
    console.error('Error creating payment order:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error creating payment order' });
  }
};

/**
 * 2. POST /api/payments/verify
 * Verifies Razorpay payment signature and confirms order
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      enquiryId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    } = req.body;

    if (!enquiryId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing required payment verification parameters.' });
    }

    const db = getLocalDb();
    const enquiry = (db.enquiries || []).find(e => e.id === enquiryId);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Idempotent check: Prevent duplicate crediting
    if (!enquiry.paymentRecords) enquiry.paymentRecords = [];
    const existingPayment = enquiry.paymentRecords.find(p => p.paymentId === razorpay_payment_id);
    if (existingPayment) {
      return res.json({
        success: true,
        verified: true,
        message: 'Payment already verified and recorded.',
        data: enquiry
      });
    }

    // Verify cryptographic signature
    const verification = paymentService.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: verification.message || 'Payment verification failed: invalid signature.'
      });
    }

    // Calculate updated finances
    const paidAmount = Number(amount || enquiry.grandTotal || 0);
    const prevAdvance = Number(enquiry.advancePaid || 0);
    const newAdvance = prevAdvance + paidAmount;
    const newBalance = Math.max(0, Number(enquiry.grandTotal || 0) - newAdvance);

    const paymentRecord = {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: paidAmount,
      currency: 'INR',
      method: 'Razorpay',
      isTestMode: verification.isTestMode,
      status: 'Captured',
      verifiedAt: new Date().toISOString()
    };

    enquiry.paymentRecords.push(paymentRecord);
    enquiry.advancePaid = newAdvance;
    enquiry.balanceDue = newBalance;
    enquiry.paymentStatus = newBalance === 0 ? 'Fully Paid' : 'Partially Paid';
    enquiry.status = 'Confirmed';
    enquiry.confirmedAt = new Date().toISOString();

    saveLocalStore();

    // Trigger customer notification
    await createNotification({
      customerId: enquiry.customerId,
      enquiryId: enquiry.id,
      title: 'Payment Successful & Booking Confirmed! 🎉',
      message: `Your payment of ₹${paidAmount.toLocaleString('en-IN')} has been verified. Your booking for ${enquiry.eventDate} is officially Confirmed.`,
      type: 'payment_success'
    });

    return res.json({
      success: true,
      verified: true,
      message: 'Payment verified successfully! Your booking is confirmed.',
      data: enquiry
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
};

/**
 * 3. POST /api/payments/webhook
 * Authenticated webhook handler for Razorpay
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = JSON.stringify(req.body);

    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100;

      const db = getLocalDb();
      const enquiry = (db.enquiries || []).find(e => e.lastPaymentOrderId === orderId);

      if (enquiry) {
        if (!enquiry.paymentRecords) enquiry.paymentRecords = [];
        const exists = enquiry.paymentRecords.some(p => p.paymentId === paymentId);
        if (!exists) {
          enquiry.paymentRecords.push({
            paymentId,
            orderId,
            amount,
            currency: 'INR',
            method: 'Razorpay Webhook',
            isTestMode: false,
            status: 'Captured',
            verifiedAt: new Date().toISOString()
          });
          enquiry.advancePaid = (enquiry.advancePaid || 0) + amount;
          enquiry.balanceDue = Math.max(0, (enquiry.grandTotal || 0) - enquiry.advancePaid);
          enquiry.status = 'Confirmed';
          saveLocalStore();
        }
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};

/**
 * 4. POST /api/payments/record-offline (Admin only)
 * Auditable offline payment recording (Cash, Cheque, RTGS/NEFT)
 */
const recordOfflinePayment = async (req, res) => {
  try {
    const {
      enquiryId,
      amount,
      paymentMethod = 'Cash',
      referenceNumber = '',
      notes = ''
    } = req.body;

    if (!enquiryId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid enquiry ID and positive amount are required.' });
    }

    const db = getLocalDb();
    const enquiry = (db.enquiries || []).find(e => e.id === enquiryId);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const offlineAmount = Number(amount);
    const prevAdvance = Number(enquiry.advancePaid || 0);
    const newAdvance = prevAdvance + offlineAmount;
    const newBalance = Math.max(0, Number(enquiry.grandTotal || 0) - newAdvance);

    const paymentRecord = {
      paymentId: `OFFLINE-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      orderId: `MANUAL-${enquiry.id}`,
      amount: offlineAmount,
      currency: 'INR',
      method: paymentMethod,
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim(),
      recordedBy: req.user?.username || 'admin',
      isOffline: true,
      status: 'Recorded',
      verifiedAt: new Date().toISOString()
    };

    if (!enquiry.paymentRecords) enquiry.paymentRecords = [];
    enquiry.paymentRecords.push(paymentRecord);
    enquiry.advancePaid = newAdvance;
    enquiry.balanceDue = newBalance;
    enquiry.paymentStatus = newBalance === 0 ? 'Fully Paid' : 'Partially Paid';
    enquiry.status = 'Confirmed';

    saveLocalStore();

    // Notify customer
    await createNotification({
      customerId: enquiry.customerId,
      enquiryId: enquiry.id,
      title: 'Offline Payment Recorded & Confirmed',
      message: `An offline payment of ₹${offlineAmount.toLocaleString('en-IN')} (${paymentMethod}${referenceNumber ? ` Ref: ${referenceNumber}` : ''}) has been officially recorded by management. Your booking is Confirmed.`,
      type: 'payment_success'
    });

    return res.json({
      success: true,
      message: 'Offline payment recorded successfully.',
      data: enquiry
    });
  } catch (err) {
    console.error('Error recording offline payment:', err);
    return res.status(500).json({ success: false, message: 'Server error recording payment' });
  }
};

/**
 * 5. GET /api/payments/history/:enquiryId
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const db = getLocalDb();
    const enquiry = (db.enquiries || []).find(e => e.id === enquiryId);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      enquiryId: enquiry.id,
      grandTotal: enquiry.grandTotal,
      advancePaid: enquiry.advancePaid,
      balanceDue: enquiry.balanceDue,
      status: enquiry.status,
      payments: enquiry.paymentRecords || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error fetching payment history' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  recordOfflinePayment,
  getPaymentHistory
};
