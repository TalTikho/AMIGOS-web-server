// const chatService = require('../services/chatService');
// const {parseSchemaErrors} = require("../utils/errorUtils");
// const createChat = async (req, res) => {
//     try {
//         // Validate the request body
//         const chat = await chatService.createChat(
//     req.body.name,
//     req.body.description,
//     req.body.is_group,
//     req.body.manager,
//     req.body.messages,
//     req.body.members,
//     req.body.createdAt,
// );
//         return res.status(201).location(`api/chats/${chat._id}`).json();
//     }
//     // Catch any errors that occur during the execution of the function
//     catch (err) {
//         return res.status(400).json({ errors: parseSchemaErrors(err) });
//     }

// }

// module.exports = { createChat };
const chatService = require('../services/chatService');
const { parseSchemaErrors } = require("../utils/errorUtils");

// Creating new chat
const createChat = async (req, res) => {
    try {
        const chat = await chatService.createChat(
            req.body.name,
            req.body.description,
            req.body.is_group,
            req.headers.user_id, // I dont know if needed it, will replace the manager
            req.body.messages,
            req.body.members,
            req.body.createdAt,
            req.body.photo
        );
        return res.status(201).location(`/api/chats/${chat._id}`).json(chat);
    } catch (err) {
        return res.status(400).json({ errors: parseSchemaErrors(err) });
    }
};

// Getting all the user`s chat
const getUserChats = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        const chats = await chatService.getUserChats(userId);
        return res.status(200).json(chats);
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};
// Getting the chat by Id
const getChatById = async (req, res) => {
    try {
        const chat = await chatService.getChatById(req.params.chatId);// searching for the chat

        if (!chat.success) {
            return res.status(404).json({ error: chat.message })// couldnt find
        };

        return res.status(200).json(chat.chat);
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

// Updating the wanted chat
const updateChat = async (req, res) => {
    try {
        const chat = await chatService.updateChat(req.params.chatId, req.body);// updating the chat

        if (!chat.success) {
            return res.status(404).json({ error: chat.message })// couldnt update
        };

        return res.status(201).json();
    } catch (err) {
        return res.status(400).json({ error: parseSchemaErrors(err) });
    }
};
// Adding new member to the chat
const addMember = async (req, res) => {
    try {
        const result = await chatService.addMember(req.params.chatId, req.params.userId);// adding new member to the chat

        if (!result.success) {
            return res.status(400).json({ error: result.message })// couldnt add
        };

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

// Removing a member from the chat
const removeMember = async (req, res) => {
    try {
        const result = await chatService.removeMember(req.params.chatId, req.params.userId);// removing a member from the chat

        if (!result.success) {
            return res.status(404).json({ error: result.message })// couldnt remove
        };

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

// Leaving a chat
const leaveChat = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        const result = await chatService.leaveChat(req.params.chatId, userId);// leaving chosen chat

        if (!result.success) {
            return res.status(404).json({ error: result.message });// couldnt leave
        }

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

// Deleting a chat
const deleteChat = async (req, res) => {
    try {
        const result = await chatService.deleteChat(req.params.chatId);// deleting chat

        if (!result.success) {
            return res.status(404).json({ error: result.message })// couldnt delete
        };

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

module.exports = {
    createChat,
    getUserChats,
    getChatById,
    updateChat,
    addMember,
    removeMember,
    leaveChat,
    deleteChat
};