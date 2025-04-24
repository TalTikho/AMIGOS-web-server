const mongoose = require('mongoose');

const notificationModel = new mongoose.Schema({
    // the user who will receive this notification
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // the text content of the notification that will be displayed to the user
    content: {
        type: String,
        required: true
    },
    // the category (type) of notification which can be used for filtering and display
    type: {
        type: String,
        enum: ['message', 'friend_request', 'system'],  // Restricts to these three allowed values
        default: 'system'
    },
    // reference to the related document (could be a Chat, Message, or User)
    // this allows the application to link directly to the relevant content (kfir look at this)
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'// this is a dynamic reference - uses onModel field to determine the model
    },
    // specifies which model the relatedTo field is referencing
    // this enables polymorphic relationships (references to different collections)
    onModel: {
        type: String,
        enum: ['Chat', 'Message', 'User']      // restricts to these three allowed models
    },
    // tracks whether the user has read this notification
    isRead: {
        type: Boolean,
        default: false// new notifications start as unread
    },
    // timestamp for when the notification was created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationModel, 'notification');