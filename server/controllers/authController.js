const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');
const Item = require('../models/Item');
const Enquiry = require('../models/Enquiry');
const Conversation = require('../models/Conversation');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateId = (prefix = 'usr') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

// 1. POST /api/auth/register (Customer Registration)
const customerRegister = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check existing customer
    if (isMongoConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }
    } else {
      const localDb = getLocalDb();
      if (!localDb.users) localDb.users = [];
      const existing = localDb.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = generateId('cust');

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'customer',
      createdAt: new Date()
    };

    if (isMongoConnected()) {
      await User.create(newUser);
    } else {
      const localDb = getLocalDb();
      localDb.users.push(newUser);
      saveLocalStore();
    }

    const token = jwt.sign(
      { id: userId, name: newUser.name, email: cleanEmail, phone: cleanPhone, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'customer'
      },
      message: 'Account registered successfully.'
    });
  } catch (error) {
    console.error('Error during customer registration:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// 2. POST /api/auth/customer-login (Customer Login via Email or Phone)
const customerLogin = async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginId = (identifier || email || phone || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Mobile number or email, and password are required.' });
    }

    let user = null;
    let validPassword = false;

    if (isMongoConnected()) {
      user = await User.findOne({
        $or: [
          { email: loginId },
          { phone: loginId }
        ]
      });
      if (user) {
        validPassword = await user.comparePassword(password);
      }
    } else {
      const localDb = getLocalDb();
      if (!localDb.users) localDb.users = [];
      user = localDb.users.find(u => 
        (u.email && u.email.toLowerCase() === loginId) || 
        (u.phone && u.phone.toLowerCase() === loginId)
      );
      if (user) {
        validPassword = await bcrypt.compare(password, user.passwordHash);
      }
    }

    if (!user || !validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid mobile/email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer'
      },
      message: 'Logged in successfully.'
    });
  } catch (error) {
    console.error('Error during customer login:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// 3. GET /api/auth/my-enquiries (Customer Portal - View Own Enquiries)
const getCustomerEnquiries = async (req, res) => {
  try {
    const customerId = req.user.id;
    const customerPhone = req.user.phone;
    const customerEmail = req.user.email;

    let enquiries = [];
    if (isMongoConnected()) {
      const unclaimedQuery = {
        customerId: { $in: [null, ''] },
        $or: [
          ...(customerPhone ? [{ phone: customerPhone }] : []),
          ...(customerEmail ? [{ email: customerEmail }] : [])
        ]
      };

      const orConditions = [{ customerId: customerId }];
      if (unclaimedQuery.$or.length > 0) {
        orConditions.push(unclaimedQuery);
      }

      enquiries = await Enquiry.find({ $or: orConditions }).sort({ createdAt: -1 });
    } else {
      const localDb = getLocalDb();
      enquiries = (localDb.enquiries || []).filter(e => 
        e.customerId === customerId ||
        (!e.customerId && (
          (customerPhone && e.phone === customerPhone) ||
          (customerEmail && e.email && e.email.toLowerCase() === customerEmail.toLowerCase())
        ))
      );
    }

    return res.json({
      success: true,
      count: enquiries.length,
      enquiries
    });
  } catch (error) {
    console.error('Error fetching customer enquiries:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving enquiries.' });
  }
};

// 4. GET /api/auth/my-conversations (Customer Portal - View Own Chat Sessions)
const getCustomerConversations = async (req, res) => {
  try {
    const customerId = req.user.id;

    let conversations = [];
    if (isMongoConnected()) {
      conversations = await Conversation.find({ customerId }).sort({ lastActivityAt: -1 });
    } else {
      const localDb = getLocalDb();
      if (!localDb.conversations) localDb.conversations = [];
      conversations = localDb.conversations.filter(c => c.customerId === customerId);
    }

    return res.json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    console.error('Error fetching customer conversations:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving chat conversations.' });
  }
};

// 5. POST /api/auth/login (Admin Login)
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const envUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD || 'admin@kandhari2026';

    let userValid = false;
    let userId = 'admin-1';

    if (isMongoConnected()) {
      const user = await AdminUser.findOne({ username: cleanUsername });
      if (user) {
        userValid = await user.comparePassword(password);
        userId = user.id || user._id;
      }
    }

    if (!userValid) {
      const localUser = getLocalDb().adminUsers.find(u => u.username.toLowerCase() === cleanUsername);
      if (localUser) {
        const matchesLocal = await bcrypt.compare(password, localUser.passwordHash);
        if (matchesLocal) {
          userValid = true;
          userId = localUser.id;
        }
      }
      
      if (!userValid && cleanUsername === envUser && password === envPass) {
        userValid = true;
      }
    }

    if (!userValid) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    }

    const token = jwt.sign(
      { id: userId, username: cleanUsername, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        username: cleanUsername,
        role: 'admin'
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// 6. GET /api/auth/verify
const verifyAuth = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

// 7. GET /api/auth/stats (Admin Dashboard summary overview)
const getDashboardStats = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const totalItems = await Item.countDocuments();
      const availableItems = await Item.countDocuments({ availabilityStatus: 'Available' });
      const totalEnquiries = await Enquiry.countDocuments();
      const newEnquiries = await Enquiry.countDocuments({ status: 'New' });
      const underReview = await Enquiry.countDocuments({ status: 'Under Review' });
      const quotationPrepared = await Enquiry.countDocuments({ status: 'Quotation Prepared' });
      const confirmed = await Enquiry.countDocuments({ status: 'Confirmed' });
      const advancePending = await Enquiry.countDocuments({ status: 'Advance Pending' });
      const partiallyPaid = await Enquiry.countDocuments({ status: 'Partially Paid' });
      const fullyPaid = await Enquiry.countDocuments({ status: 'Fully Paid' });
      const completed = await Enquiry.countDocuments({ status: 'Completed' });
      const cancelled = await Enquiry.countDocuments({ status: 'Cancelled' });
      const contactedEnquiries = await Enquiry.countDocuments({ status: 'Contacted' });
      const inDiscussionEnquiries = await Enquiry.countDocuments({ status: 'In Discussion' });
      const quotedEnquiries = await Enquiry.countDocuments({ status: 'Quoted' });
      const convertedEnquiries = await Enquiry.countDocuments({ status: 'Converted' });
      const closedEnquiries = await Enquiry.countDocuments({ status: 'Closed' });

      return res.json({
        success: true,
        data: {
          totalItems,
          availableItems,
          totalEnquiries,
          newEnquiries,
          underReview,
          quotationPrepared,
          confirmed,
          advancePending,
          partiallyPaid,
          fullyPaid,
          completed,
          cancelled,
          contactedEnquiries,
          inDiscussionEnquiries,
          quotedEnquiries,
          convertedEnquiries,
          closedEnquiries
        }
      });
    }

    const db = getLocalDb();
    const items = db.items || [];
    const enquiries = db.enquiries || [];

    return res.json({
      success: true,
      data: {
        totalItems: items.length,
        availableItems: items.filter(it => it.availabilityStatus === 'Available').length,
        totalEnquiries: enquiries.length,
        newEnquiries: enquiries.filter(e => e.status === 'New').length,
        underReview: enquiries.filter(e => e.status === 'Under Review').length,
        quotationPrepared: enquiries.filter(e => e.status === 'Quotation Prepared').length,
        confirmed: enquiries.filter(e => e.status === 'Confirmed').length,
        advancePending: enquiries.filter(e => e.status === 'Advance Pending').length,
        partiallyPaid: enquiries.filter(e => e.status === 'Partially Paid').length,
        fullyPaid: enquiries.filter(e => e.status === 'Fully Paid').length,
        completed: enquiries.filter(e => e.status === 'Completed').length,
        cancelled: enquiries.filter(e => e.status === 'Cancelled').length,
        contactedEnquiries: enquiries.filter(e => e.status === 'Contacted').length,
        inDiscussionEnquiries: enquiries.filter(e => e.status === 'In Discussion').length,
        quotedEnquiries: enquiries.filter(e => e.status === 'Quoted').length,
        convertedEnquiries: enquiries.filter(e => e.status === 'Converted').length,
        closedEnquiries: enquiries.filter(e => e.status === 'Closed').length,
        // Workflow statuses
        pendingApproval: enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length,
        awaitingCustomerAcceptance: enquiries.filter(e => e.status === 'Approved — Awaiting Customer Acceptance').length,
        awaitingPayment: enquiries.filter(e => e.status === 'Approved — Awaiting Payment').length,
        paymentPending: enquiries.filter(e => e.status === 'Payment Pending').length,
        rejected: enquiries.filter(e => e.status === 'Rejected').length,
        totalCustomers: (db.users || []).length,
        totalRevenue: enquiries.reduce((sum, e) => sum + (Number(e.advancePaid) || 0), 0),
        totalOutstanding: enquiries.reduce((sum, e) => sum + (Number(e.balanceDue) || 0), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching statistics' });
  }
};

// 8. GET /api/auth/customers (Admin) - List all registered customers with metrics
const getAllCustomers = async (req, res) => {
  try {
    const db = getLocalDb();
    const users = db.users || [];
    const enquiries = db.enquiries || [];

    const customerList = users.map(u => {
      const userEnquiries = enquiries.filter(e => 
        e.customerId === u.id || 
        (e.email && e.email.toLowerCase() === u.email?.toLowerCase()) ||
        (e.phone && e.phone === u.phone)
      );

      const confirmedOrders = userEnquiries.filter(e => e.status === 'Confirmed' || e.status === 'Paid');
      const totalSpent = userEnquiries.reduce((sum, e) => sum + (Number(e.advancePaid) || 0), 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role || 'customer',
        createdAt: u.createdAt,
        totalEnquiries: userEnquiries.length,
        confirmedOrdersCount: confirmedOrders.length,
        totalSpent
      };
    });

    return res.json({
      success: true,
      count: customerList.length,
      data: customerList
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ success: false, message: 'Server error loading customers' });
  }
};

module.exports = {
  customerRegister,
  customerLogin,
  getCustomerEnquiries,
  getCustomerConversations,
  adminLogin,
  verifyAuth,
  getDashboardStats,
  getAllCustomers
};

