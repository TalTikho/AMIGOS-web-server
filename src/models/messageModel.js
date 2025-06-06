const mongoose = require('mongoose');

/**
 * Message Model - Represents stored message & files (images, videos, documents)
 * Used for storing messages
 */
const messageModel = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId, // reference to the Chat document
            ref: 'Chat', // specifies which model to reference
            required: true // field must be present when creating a new message
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId, // reference to the User document
            ref: 'User', // specifies the User model
            required: true // this field is mandatory
        },
        text: {
            type: String, // text content of the message
            default: '' // default value if no text is provided
        },
        mediaType: {
            type: String,
            enum: ['none', 'image', 'video', 'file'], // only these values are allowed
            default: 'none' // default to no media attachment
        },
        mediaUrl: {
            type: String, // URL link to the media file
            default: '' // empty by default
        },
        fileName: {
            type: String, // original filename of the attachment
            default: '' // empty by default
        },
        seenBy: [{
            type: mongoose.Schema.Types.ObjectId, // array of User IDs who have seen the message
            ref: 'User' // reference to User model
        }],
        createdAt: {
            type: Date, // timestamp when message was created
            default: Date.now // default to current time
        },
        updatedAt: {
            type: Date, // timestamp when message was last updated
            default: null // null by default until message is edited
        },
        isDeleted: {
            type: Boolean, // flag for soft deletion
            default: false // not deleted by default
        },
        is_forwarded: {
            type: Boolean,
            default: false
        }
    });

module.exports = mongoose.model('Message', messageModel , 'messages');