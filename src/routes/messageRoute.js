const express = require('express'); // import Express framework
const router = express.Router(); // create a router instance
const messageController = require('../controllers/messageController'); // import message controller
const { authUser } = require('../controllers/authController');
// const multer = require('multer'); // import multer for file upload handling

// // Configure multer for file uploads
// const storage = multer.memoryStorage(); // store files in memory temporarily
// const upload = multer({ 
//   storage, // Use the memory storage
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
//   fileFilter: (req, file, cb) => {
//     // Optional: Add file type restrictions here
//     // Example: if you only want to allow images
//     /*
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Only image files are allowed!'), false);
//     }
//     */
//     cb(null, true); // Accept all file types for now
//   }
// });

// Send a new message (supports media upload)
router.route('/:chatId/send/:userId')
  .post(authUser, messageController.sendMessage);// between we removed , upload.single('media')

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