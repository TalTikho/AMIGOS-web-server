const Chat = require('../models/chatModel');
const User = require('../models/userModel');

// Creating the chat
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

// Returning all the chats for user
const getUserChats = async (userId) => {
    try {
        return await Chat.find({ members: userId }); // searching for the chat
    } catch (error) {
        //return { success: false, message: 'Failed to find all chats for the user (error)' };
        // check if the error is related to invalid ID format
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        console.error("Error in get user chats:", error);
        return { success: false, message: 'Failed to get the chats (error)' + error.message };
    }
};

// Returning wanted chat for user
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
        console.error("Error in get chat:", error);
        return { success: false, message: 'Failed to find the chat (error)' + error.message };
    }
};

// Updating chat
const updateChat = async (chatId, updates) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return { success: false, message: 'Chat not found' };
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

        await chat.save(); // Step 3: Save the changes

        return { success: true, message: 'Chat updated successfully' };
    } catch (error) {
        //return { success: false, message: 'Failed to update chat (error)' };
        // check if the error is related to invalid ID format
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        console.error("Error in update chat:", error);
        return { success: false, message: 'Failed to updarte the chat (error)' + error.message };
    }
};

// Adding a member to a chat
const addMember = async (chatId, userId) => {
    // did not get chatId or userId
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }
    try {
        const user = await User.findById(userId);// searching for the user
        const chat = await Chat.findById(chatId);// searching for the chat

        // check if user or chat exist
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        if (!chat) {
            return { success: false, message: 'Chat not found' };
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
        console.error("Error in adding Member:", error);
        return { success: false, message: 'Failed to add the member (error)' + error.message };
    }
};

// Addin new manager to the managers array
const addManager = async (chatId, userId) => {
    // did not get chatId or userId
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }
    try {
        const user = await User.findById(userId);// searching for the user
        const chat = await Chat.findById(chatId);// searching for the chat

        // check if user or chat exist
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        // check if already a manager
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
        console.error("Error in adding Manager:", error);
        return { success: false, message: 'Failed to add the manager (error)' + error.message };
    }
};

// Removing a member
const removeMember = async (chatId, userId) => {
    // check if chatId or userId are missing
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }

    try {
        const chat = await Chat.findById(chatId); // searching for the chat

        // did not found the chat
        if (!chat) {
            return { success: false, message: 'Chat not found' };
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
        
        console.error("Error in removeMember:", error);
        return { success: false, message: 'Failed to remove member: ' + error.message };
    }
};

//Remove manager from the array of managers
const removeManager = async (chatId, userId) => {
    // check if chatId or userId are missing
    if (!chatId || !userId) {
        return { success: false, message: 'Missing chatId or userId' };
    }

    try {
        const chat = await Chat.findById(chatId); // searching for the chat

        // did not found the chat
        if (!chat) {
            return { success: false, message: 'Chat not found' };
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
        
        console.error("Error in remove Manager:", error);
        return { success: false, message: 'Failed to remove manager: ' + error.message };
    }
};

// Leaving a chat according to user
const leaveChat = async (chatId, userId) => {
    try {
        const chat = await Chat.findById(chatId);
        
        // check if chat exists
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }
        
        // check if user is in the chat
        if (!chat.members.some(member => member.toString() === userId.toString())) {
            return { success: false, message: 'User not in chat' };
        }
        
        // special handling for manager leaving
        if (chat.manager.toString() === userId.toString()) {
            // if this user is the manager, we need to assign a new manager
            // Remove the user from members first
            chat.members = chat.members.filter(member => member.toString() !== userId.toString());
            
            // if there are still members left, assign the first one as the new manager
            if (chat.members.length > 0) {
                chat.manager = chat.members[0];
                await chat.save();
                return { success: true, message: 'Left chat and manager role transferred' };
            } else {
                // if no members left, you might want to delete the chat or handle differently
                await Chat.findByIdAndDelete(chatId);
                return { success: true, message: 'Left chat and chat was deleted (no members left)' };
            }
        } else {
            // if not the manager, use the regular removeMember function
            return await removeMember(chatId, userId);
        }
    } catch (error) {
        // handle invalid ID format errors
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId or userId format' };
        }
        
        console.error("Error in leaveChat:", error);
        return { success: false, message: 'Failed to leave chat: ' + error.message };
    }
};

// Deleting 
const deleteChat = async (chatId) => {
    // check if chatId is missing entirely
    if (!chatId) {
        return { success: false, message: 'Missing chatId' };
    }

    try {
        const chat = await Chat.findById(chatId); // searching for the chat
        
        // did not find the chat
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        await Chat.findByIdAndDelete(chatId); // deleting the chat
        return { success: true, message: 'Chat deleted successfully' };
    } catch (error) {
        // handle invalid ID format errors
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid chatId format' };
        }
        
        console.error("Error in deleteChat:", error);
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