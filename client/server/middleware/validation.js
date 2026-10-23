/**
 * Input validation and sanitization middleware for enquiries and items
 */

const validateEnquiryInput = (req, res, next) => {
  const { customerName, phone, eventDate, items, enquiryType, consentGiven } = req.body;

  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your full name (at least 2 characters).'
    });
  }

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid contact mobile number.'
    });
  }

  // Clean phone string
  const cleanedPhone = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit Indian mobile number (e.g. 18008903456).'
    });
  }

  if (!eventDate) {
    return res.status(400).json({
      success: false,
      message: 'Please select your proposed event date.'
    });
  }

  // Validate items if rental enquiry
  if (enquiryType === 'rental' && Array.isArray(items)) {
    for (const item of items) {
      if (!item.name || !item.quantity || parseInt(item.quantity, 10) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Requested items must include a valid item name and quantity greater than zero.'
        });
      }
    }
  }

  // Sanitize fields
  req.body.customerName = customerName.trim();
  req.body.phone = cleanedPhone;
  if (req.body.whatsappNumber) {
    req.body.whatsappNumber = req.body.whatsappNumber.replace(/[\s-]/g, '');
  }
  if (req.body.locality) {
    req.body.locality = req.body.locality.trim();
  }
  if (req.body.notes) {
    req.body.notes = req.body.notes.trim().slice(0, 1500);
  }

  next();
};

const validateItemInput = (req, res, next) => {
  const { name, category, description, availableQuantity, availabilityStatus } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Item name is required and must be at least 2 characters.'
    });
  }

  if (!category || typeof category !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'A category must be selected for the item.'
    });
  }

  if (!description || typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Item description is required.'
    });
  }

  if (availableQuantity !== undefined && (isNaN(availableQuantity) || parseInt(availableQuantity, 10) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Available quantity must be a non-negative number.'
    });
  }

  if (availabilityStatus && !['Available', 'Limited', 'Out of Stock'].includes(availabilityStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Availability status must be one of: Available, Limited, Out of Stock.'
    });
  }

  req.body.name = name.trim();
  req.body.category = category.trim();
  req.body.description = description.trim();
  req.body.availableQuantity = parseInt(availableQuantity, 10) || 0;

  next();
};

module.exports = {
  validateEnquiryInput,
  validateItemInput
};
