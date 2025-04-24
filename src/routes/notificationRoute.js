const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authUser } = require('../controllers/authController');

// Create a new notification
router.route('/create')
    .post(authUser, notificationController.createNotification);

// Get unread notification count for a user
router.route('/unread-count/:userId')
    .get(authUser, notificationController.getUnreadCount);
    
// Get all notifications for a user
router.route('/:userId')
    .get(authUser, notificationController.getUserNotifications);

// Mark a notification as read
router.route('/:notificationId/read/:userId')
    .put(authUser, notificationController.markAsRead);

// Delete a notification
router.route('/:notificationId/delete/:userId')
    .delete(authUser, notificationController.deleteNotification);

// Mark all notifications as read for a user
router.route('/read-all/:userId')
    .put(authUser, notificationController.markAllAsRead);

module.exports = router;