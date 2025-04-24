const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authUser } = require('../controllers/authController');

// Upload a file
router.route('/upload/:userId')
    .post(authUser, mediaController.uploadSingle, mediaController.uploadFile),
    //post(authUser, mediaController.uploadSingle),

// Get media by ID
router.route('/:mediaId/find-media/:userId')
    .get(authUser, mediaController.getMediaById);

// Download media file
router.route('/:userId/download/:mediaId')
    .get(authUser, mediaController.downloadMedia);

// Stream media by filename (for embedding in app)
router.route('/:userId/stream/:filename')
    .get(authUser, mediaController.streamMedia);

// Get all media for a user
router.route('/user-media/:userId')
    .get(authUser, mediaController.getUserMedia);

// Get media related to specific entity (chat, message, etc)
router.route('/:userId/related/:relatedId/:onModel')
    .get(authUser, mediaController.getRelatedMedia);

// Delete media
router.route('/:userId/delete/:mediaId')
    .delete(authUser, mediaController.deleteMedia);

// Update media metadata
router.route('/:userId/update/:mediaId')
    .put(authUser, mediaController.updateMedia);

// Link media to message
router.route('/:userId/link/:mediaId/:messageId')
    .put(authUser, mediaController.linkMediaToMessage);

module.exports = router;