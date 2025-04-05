const mongoose = require("mongoose");
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
    manager:
    { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: [true, "Manager of the chat is required"],
    }, //the user who created the group
    messages:[
    {
        type: mongoose.Schema.Types.ObjectId, ref: 'message',
        default: [],
    }],
    members: 
    [{
        type: mongoose.Schema.Types.ObjectId, ref: 'users',
        //default: [this.manager],
    }], //list of the members in the chat
    createdAt: 
    { 
        type: Date, default: Date.now 
    }, //date of creation of the chat
});

module.exports = mongoose.model('chats', chatModel, 'chats');