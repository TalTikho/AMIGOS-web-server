const Chat = require('../models/chatModel');
const User = require('../models/userModel');

/**
 * Creating the chat
 * getting all the parameters for the creation of nw chat
 * 
 * @returns {Object} Result with success or error message
 */
const createChat = async (name, description, is_group, manager, messages, members, createdAt, photo) => {

    const chat = new Chat({
        name: name,
        description: description,
        is_group: is_group,
        manager: manager,
        messages: messages,
        members: members || [manager],
        createdAt: createdAt,
        photo: photo
    });
    return await chat.save();
}

/**
 * Getting all the chats for user
 * 
 * @param {String} userId - ID of user making the request
 * @returns {Object} Result with all the chats the user is part of or error message
 */
const getUserChats = async (userId) => {
    try {
        return await Chat.find({ members: userId }); // searching for the chat
    } catch (error) {
        //return { success: false, message: 'Failed to find all chats for the user (error)' };
        // check if the error is related to invalid ID format
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        return { success: false, message: 'Failed to get the chats (error)' + error.message };
    }
};

/**
 * Getting the wanted chat for user
 * 
 * @param {String} userId - ID of user making the request
 * @returns {String} Result with the chat the user searched for or error message
 */
const getChatById = async (chatId) => {
    // if didn't get the chat id
    if (!chatId || chatId === "") {
        return { success: false, message: 'Didnt get chat id' };
    }

    try {
        // return await Chat.findById(chatId); //.populate('members').populate('messages');
        // try to find the user by name and password and return it
        const chat = await Chat.findById(chatId);// searching for the chat
        // able to find the chat
        if (chat) {
            return { success: true, chat: chat };
        }
        else {
            return { success: false, message: 'Chat not found' };
        }
    } catch (error) {
        //return { success: false, message: 'Failed to find chat (error)' };
        // check if the error is related to invalid ID format
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        return { success: false, message: 'Failed to find the chat (error)' + error.message };
    }
};

/**
 * Updating a chat
 * 
 * @param {String} chatId - ID of chat
 * @param {String} userId - ID of user making the request
 * @param {Body} updates - the field we want to update
 * @returns {String} Result with the updated chat the user wanted to update or error message
 */
const updateChat = async (chatId, userId, updates) => {
    try {
        const chat = await Chat.findById(chatId);
        const user = await User.findById(userId);

        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // check if a member
        if (!chat.members.some(memberId => memberId.toString() === userId)) {
            return { success: false, message: 'User not a member' };
        }

        // Update fields only if they were provided
        if (updates.name !== undefined) {
            chat.name = updates.name;
        }
        if (updates.description !== undefined) {
            chat.description = updates.description;
        }
        //checking if it a group chat
        if (chat.is_group === true) {
            //if it is a group chat, check if we want to change the photo
            if(updates.photo !== undefined) {
                chat.photo = updates.photo;
            }
        }

        await chat.save();

        return { success: true, message: 'Chat updated successfully' };
    } catch (error) {
        //return { success: false, message: 'Failed to update chat (error)' };
        // check if the error is related to invalid ID format
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        return { success: false, message: 'Failed to updarte the chat (error)' + error.message };
    }
};

/**
 * Adding a member to a chat
 * 
 * @param {String} chatId - ID of chat
 * @param {String} userId - ID of user we want to add to the members array
 * @param {String} userMemberId - Id of the member that wants to add a member
 * @returns {String} Result with the updated members array or error message
 */
const addMember = async (chatId, userMemberId, userId) => {
    // did not get chatId or userId
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }
    try {
        const user = await User.findById(userId);// searching for the user
        const chat = await Chat.findById(chatId);// searching for the chat
        const userMember = await User.findById(userMemberId);// searching for the user


        // check if user or chat exist
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        if (!userMember) {
            return { success: false, message: 'User (member) not found' };
        }

        // check if userMember is a member
        if (!chat.members.some(memberId => memberId.toString() === userMemberId)) {
            return { success: false, message: 'User (member) is not a member' };
        }

        // check if already a member
        if (chat.members.some(memberId => memberId.toString() === userId)) {
            return { success: false, message: 'User already a member' };
        }

        chat.members.push(userId);
        await chat.save();

        return { success: true, message: 'Member added successfully' };
    } catch (error) {
         // check if the error is related to invalid ID format
         if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        return { success: false, message: 'Failed to add the member (error)' + error.message };
    }
};

/**
 * Adding a manager to the managers array
 * 
 * @param {String} chatId - ID of chat
 * @param {String} userId - ID of user we want to add to the managers array
 * @param {String} managerId - Id of the manager that wants to add a manager
 * @returns {String} Result with the updated managers array or error message
 */
const addManager = async (chatId, managerId, userId) => {
    // did not get chatId or userId
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }
    try {
        const user = await User.findById(userId);// searching for the user
        const chat = await Chat.findById(chatId);// searching for the chat
        const manager = await User.findById(managerId);// searching for the user


        // check if user or chat exist
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        if (!manager) {
            return { success: false, message: 'Manager (user) not found' };
        }

        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        // convert objectId to string for comparison to check we actually got manager tot remove someone
        if (!chat.manager.some(manager => manager.toString() === managerId.toString())) {
            return { success: false, message: 'User entered as managerId is not a manager' };
        }

        // check if user enterd is already a manager
        if (chat.manager.some(managerId => managerId.toString() === userId.toString())) {
            return { success: false, message: 'User already a manager' };
        }

        // check if user is a member
        if (!chat.members.some(memberId => memberId.toString() === userId.toString())) {
            return { success: false, message: 'User must be a member before becoming a manager' };
        }

        chat.manager.push(userId);
        await chat.save();

        return { success: true, message: 'Manager added successfully' };
    } catch (error) {
         // check if the error is related to invalid ID format
         if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        return { success: false, message: 'Failed to add the manager (error)' + error.message };
    }
};

/**
 * Removing a member from a chat
 * 
 * @param {String} chatId - ID of chat
 * @param {String} userId - ID of user we want to remove from the members array
 * @param {String} managerId - Id of the manager that wants to remove a member
 * @returns {String} Result with the updated members array or error message
 */
const removeMember = async (chatId, managerId, userId) => {
    // check if chatId or userId are missing
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }

    try {
        const chat = await Chat.findById(chatId); // searching for the chat
        const manager = await User.findById(managerId);
        const user = await User.findById(userId);


        // did not found the chat
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        if (!manager) {
            return { success: false, message: 'Manager (user) not found' };
        }

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // convert objectId to string for comparison to check we actually got manager tot remove someone
        if (!chat.manager.some(manager => manager.toString() === managerId.toString())) {
            return { success: false, message: 'User entered as managerId is not a manager' };
        }

        //checking of manager wants to remove Himself
        if(managerId === userId) {
            return {success: false, message: 'you cant remove yourself from a group, you can leave'}
        }

        // convert objectId to string for comparison
        if (!chat.members.some(member => member.toString() === userId.toString())) {
            return { success: false, message: 'User not in chat' };
        }

        // filter out the user to be removed
        chat.members = chat.members.filter(member => member.toString() !== userId.toString());
        await chat.save();

        return { success: true, message: 'Member removed successfully' };
    } catch (error) {
        // handle invalid ID format errors
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        
        return { success: false, message: 'Failed to remove member: ' + error.message };
    }
};

/**
 * Removing a manager to the managers array
 * also checkingif the user was the only manager and updating accordingly
 * 
 * @param {String} chatId - ID of chat
 * @param {String} userId - ID of user we want to remove from the managers array
 * @param {String} managerId - Id of the manager that wants to remove a manager
 * @returns {String} Result with the updated managers array or error message
 */
const removeManager = async (chatId, managerId, userId) => {
    // check if chatId or userId are missing
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }

    try {
        const chat = await Chat.findById(chatId); // searching for the chat
        const user = await User.findById(userId);// searching for the user
        const manager = await User.findById(managerId);// searching for the manager in users


        // did not found the chat
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!manager) {
            return { success: false, message: 'Manager (user) not found' };
        }

        // convert objectId to string for comparison to check if manager is actually a manager
        if (!chat.manager.some(manager => manager.toString() === managerId.toString())) {
            return { success: false, message: 'User (as managerId) is not a manager' };
        }
        
        //checking of want to remove himself
        if(managerId === userId) {
            return { success: false, message: 'You cant remove yourself, you can leave' };
        }

        // convert objectId to string for comparison
        if (!chat.manager.some(manager => manager.toString() === userId.toString())) {
            return { success: false, message: 'User is not a manager' };
        }

        // filter out the user to be removed
        chat.manager = chat.manager.filter(manager => manager.toString() !== userId.toString());
        await chat.save();

        return { success: true, message: 'Manager removed successfully' };
    } catch (error) {
        // handle invalid ID format errors
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        
        return { success: false, message: 'Failed to remove manager: ' + error.message };
    }
};

/**
 * Leaving a chat according to user
 * 
 * @param {String} chatId - ID of chat we want to leave
 * @param {String} userId - ID of user who wants to leave
 * @returns {String} Result with the updated managers & members array or error message
 */
const leaveChat = async (chatId, userId) => {
    try {
        const chat = await Chat.findById(chatId);
        const user = await User.findById(userId);
        
        // check if chat exists
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // check if user is in the chat
        if (!chat.members.some(member => member.toString() === userId.toString())) {
            return { success: false, message: 'User not in chat' };
        }
        
        // special handling for manager leaving
        if (chat.manager.some(manager => manager.toString() === userId.toString())) {
            // if this user is the manager, we need to assign a new manager
            // Remove the user from members first
            chat.members = chat.members.filter(member => member.toString() !== userId.toString());
            
            // if there are still members left, and only one manager, assign the first one as the new manager
            if (chat.members.length > 0 && chat.manager.length === 1) {
                chat.manager = chat.members[0];
                await chat.save();
                return { success: true, message: 'Left chat and manager role transferred' };
            } else if (chat.members.length === 0) {
                // if no members left, you might want to delete the chat or handle differently
                await Chat.findByIdAndDelete(chatId);
                return { success: true, message: 'Left chat and chat was deleted (no members left)' };
            }
        } else {
            // if not the manager, use the regular removeMember function with first manager for function needs
            return await removeMember(chatId, chat.manager[0] ,userId);
        }
    } catch (error) {
        // handle invalid ID format errors
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        
        return { success: false, message: 'Failed to leave chat: ' + error.message };
    }
};

/**
 * Deleting a chat according to user
 * 
 * @param {String} chatId - ID of chat we want to delete
 * @param {String} userId - ID of user who wants to delte the chat
 * @returns {String} Result with the updated managers & members array or error message
 */
const deleteChat = async (chatId, userId) => {
    // check if chatId is missing entirely
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId' };
    }

    try {
        const chat = await Chat.findById(chatId); // searching for the chat
        const user = await User.findById(userId); // searching for the user

        
        // did not find the chat
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // check if user is in the chat
        if (!chat.members.some(member => member.toString() === userId.toString())) {
            return { success: false, message: 'User not in chat' };
        }

        await leaveChat(chatId,userId); // deleting the chat (more like leaving the chat)
        return { success: true, message: 'Chat deleted successfully' };
    } catch (error) {
        // handle invalid ID format errors
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId format' };
        }
        
        return { success: false, message: 'Failed to delete chat: ' + error.message };
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