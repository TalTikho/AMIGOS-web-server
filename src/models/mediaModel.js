const mongoose = require('mongoose');

/**
 * Media Model - Represents stored media files (images, videos, documents)
 * Used for storing files uploaded by users that can be associated with messages, chats, or users
 */
const mediaModel = new mongoose.Schema({
    // system-generated filename (UUID-based) to prevent conflicts
    filename: {
        type: String,
        required: true
    },
    // original name of the uploaded file
    originalName: {
        type: String,
        required: true
    },
    // MIME type of the file (e.g., image/jpeg, video/mp4)
    mimetype: {
        type: String,
        required: true
    },
    // File size in bytes
    size: {
        type: Number,
        required: true
    },
    // physical path where file is stored on the server
    path: {
        type: String,
        required: true
    },
    // public URL to access the file
    url: {
        type: String,
        required: true
    },
    // reference to the user who uploaded the file
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // dynamic reference to the entity this media is attached to (Chat, Message, User)
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },
    // specifies which model the relatedTo field references
    onModel: {
        type: String,
        enum: ['Chat', 'Message', 'User']
    },
    // controls whether the media is publicly accessible
    isPublic: {
        type: Boolean,
        default: false
    },
    // timestamp when the file was uploaded
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Media', mediaModel, 'media');