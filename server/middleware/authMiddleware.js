const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kandhari_royal_secret_key_lucknow_2026';

// 1. Strict Administrator Guard
const requireAdminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Administrator authentication token is missing.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrator privileges required.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.'
    });
  }
};

// 2. Strict Customer Guard (Customer Portal)
const requireCustomerAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to your account to access your enquiries and conversation history.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.'
    });
  }
};

// 3. Optional Authentication (Extracts user if token present, permits guest if absent)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (e) {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = {
  requireAdminAuth,
  requireCustomerAuth,
  optionalAuth,
  JWT_SECRET
};
