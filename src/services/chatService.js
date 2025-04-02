const chat = require('..models/chat');

//creating the chat
const createChat = async(name_of_the_chat, description, is_group, manager, messages, members, createdAt) => {
   
    const chat = new chat({
        name_of_the_chat: name_of_the_chat,
        description: description,
        is_group: is_group,
        manager: manager,
        messages: messages,
        members: members,
        createdAt: createdAt
    })
    return await chat.save();
}
module.export = {createChat};