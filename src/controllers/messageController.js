const messageService = require('../services/messageService');
//const { uploadMedia } = require('../utils/fileUtils'); // import utility for handling file uploads

// Create new message (send)
const sendMessage = async (req, res) => {
  try {
    const text  = req.body.text;
    const chatId = req.params.chatId;
    const userId = req.params.userId;
    
    // // initialize media variables
    // let mediaType = 'none'; // default to no media
    // let mediaUrl = ''; // default empty URL
    // let fileName = ''; // default empty filename
    
    // // handle file upload if present in request
    // if (req.body.file) {
    //   // upload the file using utility function
    //   const uploadResult = await uploadMedia(req.file);
    //   mediaUrl = uploadResult.url; // get URL of uploaded file
    //   fileName = req.file.originalname; // save original filename
      
    //   // determine media type based on file mimetype
    //   if (req.file.mimetype.startsWith('image/')) {
    //     mediaType = 'image'; // image files
    //   } else if (req.file.mimetype.startsWith('video/')) {
    //     mediaType = 'video'; // video files
    //   } else {
    //     mediaType = 'file'; // other file types
    //   }
    // }
    
    const result = await messageService.sendMessage(
      chatId, 
      userId, 
      text, 
      // mediaType, 
      // mediaUrl, 
      // fileName
    );
    
    // handle service errors
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Controller error sending message:', error);
    return res.status(500).json({ success: false, message: 'Server error sending message'});
  }
};

// Get all messages in chat
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
    console.error('Controller error getting chat messages:', error);
    return res.status(500).json({ success: false, message: 'Server error getting chat messages' });
  }
};

// Edit message
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
    console.error('Controller error editing message:', error);
    return res.status(500).json({ success: false, message: 'Server error editing message'});
  }
};

// Delete message (from here we will use delete file, cuase its an additional method in delete message)
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
    console.error('Controller error deleting message:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting message'});
  }
};

// Mark message as seen
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
    console.error('Controller error marking message as seen:', error);
    return res.status(500).json({ success: false, message: 'Server error marking message as seen'});
  }
};

// Get unread message
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
    console.error('Controller error getting unread messages:', error);
    return res.status(500).json({ success: false, message: 'Server error getting unread messages'});
  }
};

module.exports = {
  sendMessage,
  getChatMessages,
  editMessage,
  deleteMessage,
  markMessageAsSeen,
  getUnreadMessages
};