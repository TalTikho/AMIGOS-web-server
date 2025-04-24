const notificationService = require('../services/notificationService');

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await notificationService.getUserNotifications(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in get user notifications controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const { recipientId, content, type, relatedTo, onModel } = req.body;
        
        if (!recipientId || !content) {
            return res.status(400).json({ success: false, message: 'Recipient ID and content are required'});
        }
        
        const result = await notificationService.createNotification(
            recipientId, content, type, relatedTo, onModel
        );
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(201).json(result);
    } catch (error) {
        console.error("Error in create notification controller:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const userId = req.params.userId;
        const result = await notificationService.markAsRead(notificationId, userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in mark as read controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const userId = req.params.userId;
        const result = await notificationService.deleteNotification(notificationId, userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in delete notification controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await notificationService.markAllAsRead(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in mark all as read controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// Get unread notification count for a user
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await notificationService.getUnreadCount(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in get unread count controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

module.exports = {
    getUserNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    getUnreadCount
};