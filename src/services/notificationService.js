const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// Creating a notification
const createNotification = async (recipientId, content, type, relatedTo, onModel) => {
    try {
        // validate that onModel is provided when relatedTo is provided
        // this ensures we know which collection to look in for the related document
        if (relatedTo && !onModel) {
            return { success: false, message: 'onModel is required when relatedTo is provided' };
        }

        const notification = new Notification({
            recipient: recipientId,      // id of the user receiving the notification
            content: content,            // text content of the notification
            type: type || 'system',      // type of notification with default fallback
            relatedTo: relatedTo,        // reference to related document (Chat, Message, User)
            onModel: onModel,            // specifies which model the relatedTo ID refers to
            isRead: false,               // new notifications are unread by default
            createdAt: Date.now()        // timestamp for when notification was created
        });
        
        const savedNotification = await notification.save();
        
        return { success: true, notification: savedNotification };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid userId format' };
        }
        return { success: false, message: 'Failed to create notification: ' + error.message };
    }
}

// Getting all notifications for a user
const getUserNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 });//maybe need to add limit or skip some notifications
        return { success: true, notifications: notifications };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid userId format' };
        }

        return { success: false, message: 'Failed to get notifications: ' + error.message };
    }
};

// Get unread notification count for a user
const getUnreadCount = async (userId) => {
    try {
        // check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        // count unread notifications
        const count = await Notification.countDocuments({ recipient: userId, isRead: false });
        
        return { success: true, count };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid userId format' };
        }
        
        return { success: false, message: 'Failed to get unread count: ' + error.message };
    }
};

// Mark a notification as read
const markAsRead = async (notificationId, userId) => {
    if (!notificationId) {
        return { success: false, message: 'Notification ID is required' };
    }

    try {
        const notification = await Notification.findById(notificationId);// searching for the notification
        const user = await User.findById(userId);// searching forthe user

        // check if notification exists
        if (!notification) {
            return { success: false, message: 'Notification not found' };
        }

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // count unread notifications
        const count = await Notification.countDocuments({ recipient: userId, isRead: false });

        //checking that there are messages to read
        if(count === 0){
            return { success: false, message: 'There are no notifications to mark as read' };
        }

        // checking that the notification belongs to the requesting user
        if (notification.recipient.toString() !== userId) {
            return { success: false, message: 'Unauthorized to mark this notification as read' };
        }

        // update the notification to mark it as read
        notification.isRead = true;
        await notification.save();

        return { success: true, message: 'Notification marked as read' };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid notificationId or userId format' };
        }
    
        return { success: false, message: 'Failed to mark notification as read: ' + error.message };
    }
};

// Delete a notification
const deleteNotification = async (notificationId, userId) => {
    if (!notificationId) {
        return { success: false, message: 'Notification ID is required' };
    }

    try {
        const notification = await Notification.findById(notificationId);// searching for the notification
        const user = await User.findById(userId);// searcing for the user

        // check if notification exists
        if (!notification) {
            return { success: false, message: 'Notification not found' };
        }

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // checking that the notification belongs to the requesting user
        if (notification.recipient.toString() !== userId) {
            return { success: false, message: 'Cant delete this notification, this isnt your notification' };
        }

        // Delete the notification
        await Notification.findByIdAndDelete(notificationId);
        
        return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid notificationId or userId format' };
        }
        
        return { success: false, message: 'Failed to delete notification: ' + error.message };
    }
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
    if (!userId) {
        return { success: false, message: 'User ID is required' };
    }

    try {
        const user = await User.findById(userId);// searching for the user

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // count unread notifications
        const count = await Notification.countDocuments({ recipient: userId, isRead: false });

        //checking that there are messages to read
        if(count === 0){
            return { success: false, message: 'There are no notifications to mark as read' };
        }
        // update all unread notifications for this user to read status
        // this is more efficient than fetching and updating each notification individually
        const result = await Notification.updateMany(
            { recipient: userId, isRead: false },  // filter: all unread notifications for this user
            { isRead: true }                       // update: mark as read
        );

        return { success: true, message: 'All notifications marked as read', count: result.modifiedCount };// number of notifications that were updated (debug shi)
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid userId format' };
        }
        
        return { success: false, message: 'Failed to mark all notifications as read: ' + error.message };
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead
};