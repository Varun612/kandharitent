const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireCustomerAuth } = require('../middleware/authMiddleware');

router.get('/', requireCustomerAuth, notificationController.getMyNotifications);
router.get('/my-notifications', requireCustomerAuth, notificationController.getMyNotifications);
router.put('/:id/read', requireCustomerAuth, notificationController.markNotificationRead);
router.put('/read-all', requireCustomerAuth, notificationController.markAllNotificationsRead);

module.exports = router;
