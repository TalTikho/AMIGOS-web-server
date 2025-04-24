const mediaService = require('../services/mediaService');
const Media = require('../models/mediaModel');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const path = require('path');

/**
 * Handle file upload from HTTP request
 * Uses multer middleware to process the file
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with upload result or error
 */
const uploadFile = async (req, res) => {
    try {
        const uploadedFile = req.file;
        if (!uploadedFile) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const userId = req.params.userId;
        const { relatedTo, onModel, isPublic } = req.body;
        
        const result = await mediaService.uploadMedia(
            uploadedFile, 
            userId, 
            relatedTo || null, 
            onModel || null, 
            isPublic === 'true'
        );
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(201).json(result);
    } catch (error) {
        console.error("Error in upload file controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Get media details by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with media details or error
 */
const getMediaById = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.params.userId;
        
        const result = await mediaService.getMediaById(mediaId, userId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in get media by ID controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Download a media file
 * Sends the actual file for download with original filename
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} File download or error response
 */
const downloadMedia = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.params.userId;
        
        const result = await mediaService.getMediaById(mediaId, userId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        // Send file for download with original filename
        res.download(result.media.path, result.media.originalName);
    } catch (error) {
        console.error("Error in download media controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Stream media file (for embedding images/videos in app)
 * Added function to stream media content directly
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 * @returns {Object} Media stream or error response
 */
const streamMedia = async (req, res) => {
    try {
        const filename = req.params.filename;
        const userId = req.params.userId;
        // find media by filename (not ID)
        const media = await Media.findOne({ filename });
        
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }
        
        // check if media is public or if user is authorized
        if (!media.isPublic && (media.uploadedBy.toString() !== userId.toString())) {
            return res.status(403).json({ success: false, message: 'Unauthorized to access this media' });
        }
        
        // Set appropriate content type header
        res.setHeader('Content-Type', media.mimetype);
        
        // Stream the file
        res.sendFile(path.resolve(media.path));
    } catch (error) {
        console.error("Error in stream media controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Get all media for a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user's media list or error
 */
const getUserMedia = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const result = await mediaService.getUserMedia(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in get user media controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Get media related to a specific entity
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with related media list or error
 */
const getRelatedMedia = async (req, res) => {
    try {
        const relatedId = req.params.relatedId;
        const onModel = req.params.onModel;
        const userId = req.params.userId;
        
        const result = await mediaService.getRelatedMedia(relatedId, onModel, userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in get related media controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Delete a media file
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deletion result or error
 */
const deleteMedia = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.params.userId;
        
        const result = await mediaService.deleteMedia(mediaId, userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in delete media controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Update media metadata
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with update result or error
 */
const updateMedia = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.params.userId;
        const updates = req.body;
        
        const result = await mediaService.updateMedia(mediaId, userId, updates);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in update media controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * Link media to message
 * New function to associate existing media with a message
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with link result or error
 */
const linkMediaToMessage = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const messageId = req.params.messageId;
        const userId = req.params.userId;
        const result = await mediaService.linkMediaToMessage(mediaId, messageId, userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in link media to message controller:", error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

module.exports = {
    uploadSingle: upload.single('file'), // multer middleware for single file upload chat shi you know
    uploadFile,
    getMediaById,
    downloadMedia,
    streamMedia, // Added new function
    getUserMedia,
    getRelatedMedia,
    deleteMedia,
    updateMedia,
    linkMediaToMessage // Added new function
};