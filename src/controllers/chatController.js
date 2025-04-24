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

/**
 * Creating new chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new chat or error
 */
const createChat = async (req, res) => {
    try {
        const chat = await chatService.createChat(
            req.body.name,
            req.body.description,
            req.body.is_group,
            req.body.manager,
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

/**
 * Getting all the user`s chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} userId - the user id
 * @returns {Object} JSON response with all the chat the user has or error
 */
const getUserChats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const chats = await chatService.getUserChats(userId);
        return res.status(200).json(chats);
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

/**
 * Getting the chat by Id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id
 * @returns {Object} JSON response with wanted chat or error
 */
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

/**
 * Updating the wanted chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id
 * @param {String} userId - the user id
 * @param {body} body - all of what we update on the chat
 * @returns {Object} JSON response with nothing (success) or error
 */
const updateChat = async (req, res) => {
    try {
        const chat = await chatService.updateChat(req.params.chatId,req.params.userId, req.body);// updating the chat, added user to verify update for available chat 

        if (!chat.success) {
            return res.status(404).json({ error: chat.message })// couldnt update
        };

        return res.status(201).json();
    } catch (err) {
        return res.status(400).json({ error: parseSchemaErrors(err) });
    }
};

/**
 * Adding new member to the chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {chatId} chatId - the chat id
 * @param {String} userMemberId - the member of the chat
 * @param {String} userId - the user id we want to add to the chat
 * @returns {Object} JSON response with nothing (success) or error
 */
const addMember = async (req, res) => {
    try {
        const result = await chatService.addMember(req.params.chatId, req.params.userMemberId, req.params.userId);// adding new member to the chat

        if (!result.success) {
            return res.status(400).json({ error: result.message })// couldnt add
        };

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

/**
 * Adding new manager to the manager array
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id
 * @param {String} managerId - one of the managers of the chat
 * @param {String} userId - the user id we want to add as a manager
 * @returns {Object} JSON response with nothing (success) or error
 */
const addManager = async (req, res) => {
    try {
        const result = await chatService.addManager(req.params.chatId, req.params.managerId, req.params.userId);// adding new member to the chat

        if (!result.success) {
            return res.status(400).json({ error: result.message })// couldnt add
        };

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

/**
 * Removing a member from the chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id
 * @param {String} managerId - one of the managers of the chat
 * @param {String} userId - the user id we want to remove from the members
 * @returns {Object} JSON response with nothing (success) or error
 */
const removeMember = async (req, res) => {
    try {
        const result = await chatService.removeMember(req.params.chatId, req.params.managerId, req.params.userId);// removing a member from the chat only for managers

        if (!result.success) {
            return res.status(404).json({ error: result.message })// couldnt remove
        };

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

/**
 * Removing a manager from the chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id
 * @param {String} managerId - one of the managers of the chat
 * @param {String} userId - the user id we want to remove from the manaers
 * @returns {Object} JSON response with nothing (success) or error
 */
const removeManager = async (req, res) => {
    try {
        const result = await chatService.removeManager(req.params.chatId, req.params.managerId, req.params.userId);// removing a member from the chat

        if (!result.success) {
            return res.status(404).json({ error: result.message })// couldnt remove
        };

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
}; 

/**
 * Leaving a chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id for the chat we want to leave from
 * @param {String} userId - the user id that wants to leave the chat
 * @returns {Object} JSON response with nothing (success) or error
 */
const leaveChat = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await chatService.leaveChat(req.params.chatId, userId);// leaving chosen chat

        if (!result.success) {
            return res.status(404).json({ error: result.message });// couldnt leave
        }

        return res.status(200).json();
    } catch (err) {
        return res.status(404).json({ error: parseSchemaErrors(err) });
    }
};

/**
 * Deleting a chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} chatId - the chat id for the chat we want to leave from
 * @param {String} userId - the user id that wants to delete the chat
 * @returns {Object} JSON response with nothing (success) or error
 */
const deleteChat = async (req, res) => {
    try {
        const result = await chatService.deleteChat(req.params.chatId, req.params.userId);// deleting chat

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
    addManager, 
    removeMember,
    removeManager,
    leaveChat,
    deleteChat
};