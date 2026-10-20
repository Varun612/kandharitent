const { getLocalDb, saveLocalStore } = require('../config/db');

/**
 * GET /api/invoices
 * List all invoices/bills with optional filters
 */
const getInvoices = (req, res) => {
  try {
    const db = getLocalDb();
    const invoices = db.invoices || [];
    return res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    console.error('getInvoices error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving invoices' });
  }
};

/**
 * GET /api/invoices/:id
 * Retrieve single invoice details
 */
const getInvoiceById = (req, res) => {
  try {
    const db = getLocalDb();
    const invoice = (db.invoices || []).find(inv => inv.id === req.params.id || inv.invoiceNumber === req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    return res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('getInvoiceById error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving invoice' });
  }
};

/**
 * POST /api/invoices/generate
 * Generate official commercial invoice from booking / quotation
 */
const generateInvoice = (req, res) => {
  try {
    const { 
      enquiryId, 
      customerName, 
      phone, 
      billingAddress, 
      eventDate, 
      eventVenue, 
      serviceRequired, 
      items = [], 
      cartage = 0, 
      labour = 0, 
      discount = 0, 
      advancePaid = 0,
      notes = ''
    } = req.body;

    if (!customerName || !phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone are required' });
    }

    const db = getLocalDb();
    if (!db.invoices) db.invoices = [];

    // Calculate subtotal
    const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.lineTotal || (it.rate * it.quantity)) || 0), 0);
    const parsedCartage = parseFloat(cartage) || 0;
    const parsedLabour = parseFloat(labour) || 0;
    const parsedDiscount = parseFloat(discount) || 0;
    const grandTotal = Math.max(0, subtotal + parsedCartage + parsedLabour - parsedDiscount);
    const parsedAdvance = parseFloat(advancePaid) || 0;
    const balanceDue = Math.max(0, grandTotal - parsedAdvance);

    const year = new Date().getFullYear();
    const nextSeq = String(db.invoices.length + 1).padStart(4, '0');
    const invoiceNumber = `INV-${year}-${nextSeq}`;
    const invoiceId = invoiceNumber;

    let paymentStatus = 'Unpaid';
    if (balanceDue === 0 && grandTotal > 0) {
      paymentStatus = 'Fully Paid';
    } else if (parsedAdvance > 0) {
      paymentStatus = 'Partially Paid';
    }

    const invoice = {
      id: invoiceId,
      invoiceNumber,
      enquiryId: enquiryId || null,
      customerName,
      phone,
      billingAddress: billingAddress || 'Lucknow, Uttar Pradesh',
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      eventVenue: eventVenue || 'Dwarka Shri Lawn, Kanpur Road, Lucknow',
      serviceRequired: serviceRequired || 'Wedding Setup & Catering',
      items,
      subtotal,
      cartage: parsedCartage,
      labour: parsedLabour,
      discount: parsedDiscount,
      grandTotal,
      advancePaid: parsedAdvance,
      balanceDue,
      paymentStatus,
      createdAt: new Date().toISOString(),
      dueDate: eventDate || new Date().toISOString().split('T')[0],
      notes: notes || 'Official bill of Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow. Generator diesel by client.'
    };

    db.invoices.unshift(invoice);

    // If enquiryId exists, link invoice to enquiry
    if (enquiryId) {
      const enq = (db.enquiries || []).find(e => e.id === enquiryId);
      if (enq) {
        enq.invoiceId = invoiceNumber;
      }
    }

    saveLocalStore();

    return res.status(201).json({
      success: true,
      message: 'Official invoice generated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('generateInvoice error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating invoice' });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  generateInvoice
};
