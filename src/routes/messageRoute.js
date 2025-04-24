const express = require('express'); 
const router = express.Router(); 
const messageController = require('../controllers/messageController');
const { authUser } = require('../controllers/authController');

// Send a new message (supports media upload)
router.route('/:chatId/send/:userId')
  .post(authUser, messageController.sendMessage);

// Send a media message (with file upload)
router.route('/media/:chatId/:userId')
    .post(authUser, messageController.uploadSingle, messageController.sendMediaMessage);

// Get all messages in a chat
router.route('/:chatId/chat/:userId')
  .get(authUser, messageController.getChatMessages);

// Edit a message
router.route('/:messageId/edit/:userId')
  .put(authUser, messageController.editMessage);

// Delete a message
router.route('/:messageId/delete/:userId')
  .delete(authUser, messageController.deleteMessage);

// Mark a message as seen
router.route('/:messageId/seen/:userId')
  .post(authUser, messageController.markMessageAsSeen);

// Get unread messages for a chat
router.route('/:chatId/unread/:userId')
  .get(authUser, messageController.getUnreadMessages);

module.exports = router;