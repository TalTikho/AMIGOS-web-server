const mongoose = require("mongoose");

/**
 * Chat Model - Represents chat 
 * Used for all the chat info- members, managers, messages and so 
 */
const chatModel = new mongoose.Schema({
    name:
    { 
        type: String,
        required: [true, "Name of the chat is required"],
    }, //name of the chat
    description:
     {
        type: String,
        default: '',
    }, //description of the chat
    is_group:
    { 
        type: Boolean,
        default: false,
    }, //tells if the chat is a group or a regular chat false for chat, true for group
    manager:[
    { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: [true, "Manager of the chat is required"],
        default: [] // for array of managers in a group
    }], //the user who created the group
    messages:[
    {
        type: mongoose.Schema.Types.ObjectId, ref: 'message',// need to change: from message to Message
        default: [],
    }],
    members: 
    [{
        type: mongoose.Schema.Types.ObjectId, ref: 'users', //  need to change: from eusers to User
        //default: [this.manager],
    }], //list of the members in the chat
    createdAt: 
    { 
        type: Date, default: Date.now 
    }, //date of creation of the chat
    photo: 
    {
        type: String,
    }
});

module.exports = mongoose.model('Chat', chatModel, 'chats'); // changed: 'Chat' model name to match standard from 'chats'