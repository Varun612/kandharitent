const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');

// Helper to create and record a notification
const createNotification = async ({ customerId, enquiryId, title, message, type = 'status_update' }) => {
  try {
    const notif = {
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
      customerId: customerId || null,
      enquiryId: enquiryId || null,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const db = getLocalDb();
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift(notif);
    saveLocalStore();
    return notif;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// GET /api/notifications/my-notifications (Customer)
const getMyNotifications = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const customerEmail = req.user?.email?.toLowerCase();
    const customerPhone = req.user?.phone;

    const db = getLocalDb();
    const allNotifs = db.notifications || [];

    // Filter notifications for this customer
    const userNotifs = allNotifs.filter(n => {
      if (customerId && n.customerId === customerId) return true;
      if (!n.customerId && n.enquiryId) {
        const enq = (db.enquiries || []).find(e => e.id === n.enquiryId);
        if (enq) {
          if (customerEmail && enq.email?.toLowerCase() === customerEmail) return true;
          if (customerPhone && (enq.phone === customerPhone || enq.whatsappNumber === customerPhone)) return true;
        }
      }
      return false;
    });

    const unreadCount = userNotifs.filter(n => !n.isRead).length;

    return res.json({
      success: true,
      count: userNotifs.length,
      unreadCount,
      data: userNotifs
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ success: false, message: 'Server error loading notifications' });
  }
};

// PUT /api/notifications/:id/read (Customer)
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getLocalDb();
    if (!db.notifications) db.notifications = [];

    const notif = db.notifications.find(n => n.id === id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notif.isRead = true;
    saveLocalStore();

    return res.json({ success: true, data: notif });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};

// PUT /api/notifications/read-all (Customer)
const markAllNotificationsRead = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const db = getLocalDb();
    if (!db.notifications) db.notifications = [];

    db.notifications.forEach(n => {
      if (customerId && n.customerId === customerId) {
        n.isRead = true;
      }
    });

    saveLocalStore();
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
