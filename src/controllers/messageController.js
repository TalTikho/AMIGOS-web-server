const messageService = require('../services/messageService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Create new message (send)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new message result or error
 */
const sendMessage = async (req, res) => {
  try {
    const text  = req.body.text;
    const is_forwarded = req.body.is_forwarded;
    const chatId = req.params.chatId;
    const userId = req.params.userId;
    
    const result = await messageService.sendMessage(
      chatId, 
      userId, 
      text,
      is_forwarded
    );
    
    // handle service errors
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error sending message'});
  }
};

/**
 * Create a new message with media attachment
 * Uses multer middleware to handle file upload
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new message result or error
 */
const sendMediaMessage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const text = req.body.text || '';
    const is_forwarded = req.body.is_forwarded;
    const chatId = req.params.chatId;
    const userId = req.params.userId;
    
    const result = await messageService.sendMediaMessage(
      chatId,
      userId,
      text,
      req.file,
      is_forwarded
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error sending media message' });
  }
};

/**
 * Get all messages in chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id
 * @param {String} userId - the user id
 * @returns {Object} JSON response with nothing (success) or error
 */
const getChatMessages = async (req, res) => {
  try {
    const chatId  = req.params.chatId;
    const userId = req.params.userId;
    
    const result = await messageService.getChatMessages(chatId, userId);
    
    // handle service errors
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error getting chat messages' });
  }
};

/**
 * Edit message
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} messageId - the message id of the message we want to update
 * @param {String} userId - the user id to verify the message belongs to the user
 * @returns {Object} JSON response with result (success) or error
 */
const editMessage = async (req, res) => {
  try {
    const  messageId  = req.params.messageId;
    const text = req.body. text;
    const userId = req.params.userId;
    
    const result = await messageService.editMessage(messageId, userId, text);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error editing message'});
  }
};

/**
 * Delete message 
 * (from here we will use delete file, cause its an additional method in delete message)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} messageId - the message id of the message we want to delete
 * @param {String} userId - the user id to verify the message belongs to the user
 * @returns {Object} JSON response with result (success) or error
 */
const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.params.userId;
    
    const result = await messageService.deleteMessage(messageId, userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting message'});
  }
};

/**
 * Mark message as seen
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} messageId - the message id of the message we want to mark as seen
 * @param {String} userId - the user id to verify the message belongs to the user
 * @returns {Object} JSON response with result (success) or error
 */
const markMessageAsSeen = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.params.userId;

    const result = await messageService.markMessageAsSeen(messageId, userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error marking message as seen'});
  }
};

/**
 * Get unread message
 * returning all the unread messages
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id of the message we want to read
 * @param {String} userId - the user id to verify the unread messages that belong to the user
 * @returns {Object} JSON response with result (success) or error
 */
const getUnreadMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.params.userId;
    
    const result = await messageService.getUnreadMessages(chatId, userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error getting unread messages'});
  }
};

module.exports = {
  uploadSingle : upload.single('file'), // Multer middleware for file upload
  sendMessage,
  sendMediaMessage, // for media upload
  getChatMessages,
  editMessage,
  deleteMessage,
  markMessageAsSeen,
  getUnreadMessages
};