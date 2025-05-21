// import required models
const Message = require('../models/messageModel'); 
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Media = require('../models/mediaModel');

// Import media service functions
const mediaService = require('../services/mediaService');

//imported required functions for the file methods
const { fileUtils } = require('../utils/fileUtils');

/**
 * Sending new message
 * getting all the parameters for the creation of new message
 * 
 * @returns {Object} Result with success or error message
 */
const sendMessage = async (chatId, senderId, text, mediaType = 'none', mediaUrl = '', fileName = '') => {
  try {
    const chat = await Chat.findById(chatId); // searching for the chat
    const sender = await User.findById(senderId); // searching for the user

    if (!chat) {
      return { success: false, message: 'Chat not found' };
    }

    if (!sender) {
      return { success: false, message: 'Sender not found' }; 
    }

    // check if sender is a member of the chat
    if (!chat.members.some(memberId => memberId.toString() === senderId.toString())) {
      return { success: false, message: 'Sender is not a member of this chat' };
    }

    // create new message object
    const newMessage = new Message({
      chatId, 
      sender: senderId, 
      text,
      mediaType,
      mediaUrl,
      fileName,
      seenBy: [senderId] 
    });

    // save message, its here because I first checked that the sender is actually in the chat
    const savedMessage = await newMessage.save();
    
    // update chat with new message reference
    chat.messages.push(savedMessage._id);
    await chat.save();
    
    return { success: true, message: 'Message sent successfully', data: savedMessage};
  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid chatId or senderId format' };
    }

    return { success: false, message: 'Failed to send message: ' + error.message };
  }
};

/**
 * Send a message with media attachment
 * 
 * @param {String} chatId - ID of the chat
 * @param {String} senderId - ID of the sender
 * @param {String} text - Message text content
 * @param {Object} mediaFile - File object from multer
 * @returns {Object} Result with success status and message data
 */
const sendMediaMessage = async (chatId, senderId, text, mediaFile) => {
  try {
    const chat = await Chat.findById(chatId);
    const sender = await User.findById(senderId);

    if (!chat) {
      return { success: false, message: 'Chat not found' };
    }

    if (!sender) {
      return { success: false, message: 'Sender not found' }; 
    }

    // check if sender is a member of the chat
    if (!chat.members.some(memberId => memberId.toString() === senderId.toString())) {
      return { success: false, message: 'Sender is not a member of this chat' };
    }

    if (!mediaFile) {
      return { success: false, message: 'No media file provided' };
    }

    // determine media type based on file mimetype
    let mediaType = 'file'; // default
    if (mediaFile.mimetype.startsWith('image/')) {
      mediaType = 'image';
    } else if (mediaFile.mimetype.startsWith('video/')) {
      mediaType = 'video';
    }

    // upload media file using media service
    const mediaResult = await mediaService.uploadMedia(
      mediaFile,
      senderId,
      null, // will update with message ID after creation
      'Message',
      false // not public by default
    );

    if (!mediaResult.success) {
      return { success: false, message: 'Failed to upload media file: ' + mediaResult.message };
    }

    // create new message with media details
    const newMessage = new Message({
      chatId,
      sender: senderId,
      text: text || '',
      mediaType,
      mediaUrl: mediaResult.media.url,
      fileName: mediaResult.media.originalName,
      seenBy: [senderId]
    });

    // save message
    const savedMessage = await newMessage.save();

    // now link the media to this message
    await mediaService.updateMedia(mediaResult.media._id, senderId, {
      relatedTo: savedMessage._id,
      onModel: 'Message'
    });

    // update chat with new message reference
    chat.messages.push(savedMessage._id);
    await chat.save();

    return { 
      success: true, 
      message: 'Media message sent successfully', 
      data: savedMessage,
      media: mediaResult.media
    };
  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid chatId or senderId format' };
    }

    return { success: false, message: 'Failed to send media message: ' + error.message };
  }
};

/**
 * Getting all messages in a chat for user
 * 
 * @param {String} chatId - ID of chat
 * @param {String} userId - ID of user making the request
 * @returns {Object} Result with all the messages the user sent in ASC or error message
 */
const getChatMessages = async (chatId, userId) => {
  
  if (!chatId || !userId) {
    return { success: false, message: 'Missing chatId or userId' };
  }

  try {
    const chat = await Chat.findById(chatId);
    const user = await User.findById(userId);

    if (!chat) {
      return { success: false, message: 'Chat not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // check if user is a member of the chat
    if (!chat.members.some(memberId => memberId.toString() === userId.toString())) {
      return { success: false, message: 'You are not a member of this chat' };
    }

    // Get messages that aren't deleted, sorted by creation time
    const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 }) // sorting by creation time, oldest first

    // for each message with media, check if media file exists
    for(const message of messages){
      if(message.mediaType != 'none' && message.mediaUrl){
        // find associated media record if exists
        const media = await Media.findOne({relatedTo: message._id, onModel: 'Message'});

        // adding media info to message if found
        if(media){
          media._doc.mediaInfo={
            id: media._id,
            mimetype: media.mimetype,
            size: media.size,
            isPublic: media.isPublic
          };
        }
      }
    }
    // return messages to client
    return { success: true, data: messages };

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid chatId or userId format' };
    }
    return { success: false, message: 'Failed to get messages: ' + error.message };
  }
};

/**
 * Edit a message (only for sender)
 * need to add verifgication for null message an to verify that the user exists and verify it a text message
 * 
 * @param {String} messageId - ID of message we want to update
 * @param {String} userId - ID of user making the request
 * @param {String} newText - the new text for the message
 * @returns {Object} Result with the updated messages the user sent or error message
 */
const editMessage = async (messageId, userId, newText) => {
  if (!messageId || !userId || !newText) {
    return { success: false, message: 'Missing messageId, userId or text' };
  }

  try {
    const message = await Message.findById(messageId);
    const user = await User.findById(userId);
    
    if (!message) {
      return { success: false, message: 'Message not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // verifying user is the sender of the message
    if (message.sender.toString() !== userId.toString()) {
      return { success: false, message: 'You can only edit your own messages' };
    }

    // cannot edit media messages - text only
    if (message.mediaType !== 'none') {
      return { success: false, message: 'Media messages cannot be edited' };
    }

    // update message fields
    message.text = newText; // set new text content
    message.updatedAt = Date.now(); // Update the "last edited" timestamp
    
    // save changes to database
    const updatedMessage = await message.save();

    // return success response with updated message
    return { success: true, message: 'Message edited successfully', data: updatedMessage };

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid messageId or userId format' };
    }
    return { success: false, message: 'Failed to edit message: ' + error.message };
  }
};

/**
 * Delete a message (only for sender/manager)
 * 
 * @param {String} messageId - ID of message we want to update
 * @param {String} userId - ID of user making the request
 * @returns {Object} Result with the message marked as deleted or error message
 */
const deleteMessage = async (messageId, userId) => {
  if (!messageId || !userId) {
    return { success: false, message: 'Missing messageId or userId' };
  }

  try {
    const message = await Message.findById(messageId);
    const chat = await Chat.findById(message.chatId);
    const user = await User.findById(userId);
    
    if (!message) {
      return { success: false, message: 'Message not found' };
    }

    if (!chat) {
      return { success: false, message: 'Associated chat not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const isSender = message.sender.toString() === userId.toString();
    var isManager = false;// FLAG

    // check if user is the sender or a manager of the chat
    if (chat.manager.some(managerId => managerId.toString() === userId.toString())) {
        isManager = true; // user is one of the managers
    }

    // allow sender or chat manager to delete messages
    if (!isSender && !isManager) {
      return { success: false, message: 'You can only delete your own messages or messages in chats you manage' };
    }

    //if message already been deleted
    if (message.isDeleted === true) {
      return { success: false, message: 'Message has already been deleted' };
    }

    // if message has media, delete the file from storage
    if (message.mediaType !== 'none' && message.mediaUrl) {
      //await fileUtils.deleteFileFromStorage(message.mediaUrl);
      try{
        // find the media
        const media = await Media.findOne({relatedTo: message._id, onModel: 'Message'});

        if(media){
          // delete media file and record
          await mediaService.deleteMedia(media._id, userId);
        }
        else if( message.mediaUrl){
          // fall back to fileUtils if eeded for backward compability
          await fileUtils.deleteFileFromStorage(message.mediaUrl);
        }
        
      }
      catch(mediaError) {
          console.error("Error deleting media: ", mediaError);
          // continue with message deletion even if media deletion fails
      }
    }

    // mark as delete the message
    message.isDeleted = true;
    await message.save();

    return { success: true, message: 'Message deleted successfully'};

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid messageId or userId format' };
    }
    return { success: false, message: 'Failed to delete message: ' + error.message };
  }
};

/**
 * mark a message as seen
 * 
 * @param {String} messageId - ID of message we want to update
 * @param {String} userId - ID of user making the request
 * @returns {Object} Result with the message marked as seen by the user or error message
 */
const markMessageAsSeen = async (messageId, userId) => {
  if (!messageId || !userId) {
    return { success: false, message: 'Missing messageId or userId' };
  }

  try {
    const message = await Message.findById(messageId);
    const chat = await Chat.findById(message.chatId);
    const user = await User.findById(userId);

    
    if (!message) {
      return { success: false, message: 'Message not found' };
    }

    if (!chat) {
      return { success: false, message: 'Associated chat not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // check that only chat members can mark messages as seen
    if (!chat.members.some(memberId => memberId.toString() === userId.toString())) {
      return { success: false, message: 'You are not a member of this chat' };
    }

    // check if user already saw the message to avoid duplicates
    if (message.seenBy.some(userSaw => userSaw.toString() === userId.toString())) {
      return { success: true, message: 'Message already marked as seen' };
    }

    // add user to seenBy array to mark as seen
    message.seenBy.push(userId);
    await message.save();

    // return success response
    return { success: true, message: 'Message marked as seen'};

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid messageId or userId format' };
    }
    return { success: false, message: 'Failed to mark message as seen: ' + error.message };
  }
};

/**
 * Get unread messages for a chat
 * 
 * @param {String} messageId - ID of message we want to update
 * @param {String} userId - ID of user making the request
 * @returns {Object} Result with all the messages that dont marked as seen by the user or error message
 */
const getUnreadMessages = async (chatId, userId) => {
  if (!chatId || !userId) {
    return { success: false, message: 'Missing chatId or userId' };
  }

  try {
    const chat = await Chat.findById(chatId);
    const user = await User.findById(userId);
    
    if (!chat) {
      return { success: false, message: 'Chat not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // verifying that only chat members can see messages
    if (!chat.members.some(memberId => memberId.toString() === userId.toString())) {
      return { success: false, message: 'You are not a member of this chat' };
    }

    // find messages not seen by this user
    const unreadMessages = await Message.find({ chatId, isDeleted: false, seenBy: { $nin: [userId] } // nin means not in- I want to check that user is not in the seen array
    })
    .sort({ createdAt: 1 }) // sort by creation time, oldest first

    // return unread messages with count
    return { success: true, data: unreadMessages, count: unreadMessages.length }; // provide a count of unread messages

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid chatId or userId format' };
    }

    return { success: false, message: 'Failed to get unread messages: ' + error.message };
  }
};

module.exports = {
  sendMessage,
  sendMediaMessage, // new function for media message
  getChatMessages,
  editMessage,
  deleteMessage,
  markMessageAsSeen,
  getUnreadMessages
};
