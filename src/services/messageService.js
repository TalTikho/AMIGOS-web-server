// import required models
const Message = require('../models/messageModel'); 
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

//impoorted required functions for the file methods
const { fileUtils } = require('../utils/fileUtils');
//const fs = require('fs');
//const path = require('path');

// send a new message (text, image, video, file)
const sendMessage = async (chatId, senderId, text, mediaType = 'none', mediaUrl = '', fileName = '') => {
  
  // if (chatId === undefined || senderId === undefined) {
  //   return { success: false, message: 'Missing chatId or senderId' };
  // }

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

    // save message, its here because I first checked that the sender in actually in the chat
    const savedMessage = await newMessage.save();
    chat.messages.push(savedMessage._id)
    await chat.save();
    return { success: true, message: 'Message sent successfully', data: savedMessage};
    

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid chatId or senderId format' };
    }

    console.error("Error sending message:", error);
    return { success: false, message: 'Failed to send message: ' + error.message };
  }
};

// Get all messages in a chat for user
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
    const messages = await Message.find({ chatId, isDeleted: false })
    .sort({ createdAt: 1 }) // sorting by creation time, oldest first (kfir look what i found!!!)

    // return messages to client
    return { success: true, data: messages };

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid chatId or userId format' };
    }
    console.error("Error getting chat messages:", error);
    return { success: false, message: 'Failed to get messages: ' + error.message };
  }
};

// Edit a message (only for sender) --- need to add verifgication for null message an to verify that the user exists and verify it a text message
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
    console.error("Error editing message:", error);
    return { success: false, message: 'Failed to edit message: ' + error.message };
  }
};

// Delete a message (sender only or admin for group)
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

    // if message has media, delete the file from storage
    if (message.mediaType !== 'none' && message.mediaUrl) {
      await fileUtils.deleteFileFromStorage(message.mediaUrl);
    }

    //if message already been deleted
    if (message.isDeleted === true) {
      return { success: false, message: 'Message has already been deleted' };
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
    console.error("Error deleting message:", error);
    return { success: false, message: 'Failed to delete message: ' + error.message };
  }
};

// mark a message as seen
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

    // check that only chat members can mark messages as seen --- idk if i need this because i kinda dont remember why i wrote this but for know we good
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
    console.error("Error marking message as seen:", error);
    return { success: false, message: 'Failed to mark message as seen: ' + error.message };
  }
};

// Get unread messages for a chat
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
    const unreadMessages = await Message.find({ chatId, isDeleted: false, seenBy: { $nin: [userId] } // nin means not in- I want to check that user is not in the seen array changed nin to ne (not equal)
    })
    .sort({ createdAt: 1 }) // sort by creation time, oldest first

    // return unread messages with count
    return { success: true, data: unreadMessages, count: unreadMessages.length }; // provide a count of unread messages

  } catch (error) {
    // handle invalid ID format errors
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return { success: false, message: 'Invalid chatId or userId format' };
    }

    console.error("Error getting unread messages:", error);
    return { success: false, message: 'Failed to get unread messages: ' + error.message };
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