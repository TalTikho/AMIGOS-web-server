const chatService = require('../services/chatService');
const {parseSchemaErrors} = require("../utils/errorUtils");
const createChat = async (req, res) => {
    try {
        // Validate the request body
        const chat = await chatService.createChat(
            req.body.name,
            req.body.description,
            req.body.is_group,
            req.body.manager,
            req.body.messages,
            req.body.members,
            req.body.createdAt,
        );
        return res.status(201).location(`api/chats/${chat._id}`).json();
    }
    // Catch any errors that occur during the execution of the function
    catch (err) {
        return res.status(400).json({ errors: parseSchemaErrors(err) });
    }

}

module.exports = { createChat };