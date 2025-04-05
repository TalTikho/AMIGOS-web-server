const Chat = require('../models/chatModel');

//creating the chat
const createChat = async(name, description, is_group, manager, messages, members, createdAt) => {
   
    const chat = new Chat({
        name: name,
        description: description,
        is_group: is_group,
        manager: manager,
        messages: messages,
        members: members || [manager],
        createdAt: createdAt
    })
    return await chat.save();
}
module.exports = {createChat};