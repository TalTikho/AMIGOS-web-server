const User = require('../models/userModel');

/**
 * Create the user
 * getting all the parameters for the creation of new user
 * 
 * @returns {Object} Result with success or error message
 */
const createUser = async (username, password, email, profile_pic, status) => {
    const user = new User({
        username,
        password,
        email,
        profile_pic,
        status
    });

    // Save the new user to the database
    return await user.save();
};

/**
 * Checking if the user exist
 * 
 * @param {String} username - username of the user
 * @param {String} email - email of the user
 * @param {String} password - password of user making the request
 * @returns {Object} Result with success status or error message
 */
const isUserExist = async (username, email, password) => {
    // if didn't get the username or the error
    if ((!username && !email) || !password) {
        return {success: false, message: 'Didnt get username or/and password'};
    }

    try {
        // try to find the user by name and password and return it
        const user = await User.findOne({
            $or: [
                { username, password },
                { email, password }
            ]
        });
        if (user) {
            return {success: true};
        } else {
            return {success: false, message: 'User not found'};
        }
    } catch (error) {
        // if there was an error return false
        return {success: false, message: error.message};
    }
}

/**
 * Getting the wanted user
 * 
 * @param {String} username - username of the user
 * @param {String} email - email of the user
 * @param {String} password - password of user making the request
 * @returns {Object} Result with success status or error message
 */
const getUser = async (username, email, password) => {
    try {
        // try to find the user
        const user = await User.findOne({
            $or: [
                { username, password },
                { email, password }
            ]
        });

        if (!user) {
            // if the user now found return null
            return null;
        }
        // return the user
        return user;
    } catch (error) {
        throw new Error('Error fetching user by username and password: ' + error.message);
    }
};

/**
 * Getting the wanted user by ID
 * 
 * @param {String} userId - username of the user
 * @returns {Object} Result with user or error message
 */
const getUserById = async (userId) => {
    try {
        // try to get the user by the id
        const user = await User.findById(userId);
        if (!user) {
            // if the user is not exist return null
            return null;
        }
        return user;
    } catch (error) {
        // invalid id (cannot be cast to ObjectId)
        return null;
    }
};

/**
 * Adding contact 
 * 
 * @param {String} userId - Id of the user
 * @param {String} contactId - Id of the contact we want to add
 * @returns {Object} Result with success message or error message
 */
const addContact = async (userId, contactId) => {
    if (!userId || !contactId) {
        return { success: false, message: 'Missing userId or contactId' };
    }

    if (userId === contactId) {
        return { success: false, message: "You can't add yourself as a contact" };
    }

    try {
        const user = await User.findById(userId);
        const contact = await User.findById(contactId);

        if (!user || !contact) {
            return { success: false, message: 'User or contact not found' };
        }

        // Check if already in contacts
        if (user.contact.includes(contactId)) {
            return { success: false, message: 'Contact already added' };
        }

        user.contact.push(contactId);
        await user.save();

        return { success: true, message: 'Contact added successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

/**
 * Getting all the contact for a user 
 * 
 * @param {String} userId - Id of the user
 * @returns {Object} Result with contacts or error message
 */
const getUserContacts = async (userId) => {
    if (!userId) {
        return { success: false, message: 'Missing userId' };
    }

    try {
        // try to get the user
        const user = await getUserById(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        return { success: true, contacts: user.contact };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Searching for user 
 * 
 * @param {String} userId - Id of the user
 * @param {String} query - query of the search
 * @returns {Object} Result user or error message
 */
const searchUsers = async (query, userId) => {
    // if query is empty
    if (!query) {
        return { success: false, message: 'Query is required' };
    }

    try {
        // check if the user exist
        const user = await getUserById(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const users = await User.find({
            _id: { $ne: userId }, // not return this user
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('_id username email profile_pic');

        return { success: true, searchResult: users };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Deleting a contact 
 * 
 * @param {String} userId - Id of the user
 * @param {String} contactId - Id of the contact we want to delete
 * @returns {Object} Result with success message or error message
 */
const deleteUserContact = async (userId, contactId) => {
    // if one of the id are provided
    if (!userId || !contactId) {
        return { success: false, message: 'Missing userId or contactId' };
    }

    try {
        // get the user
        const user = await getUserById(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const contact = await getUserById(contactId);
        if (!contact) {
            return { success: false, message: 'Contact not found' };
        }

        // check if the contact id is really contact
        if (!user.contact.includes(contactId)) {
            return { success: false, message: 'Contact not found in user\'s contact list' };
        }

        // try to remove the contact id
        const result = await User.updateOne(
            { _id: userId },
            { $pull: { contact: contactId } }
        );

        // if the remove didnt worked
        if (result.nModified === 0) {
            return { success: false, message: 'Contact not found or already removed' };
        }

        return { success: true, message: 'Contact removed successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Adding contact 
 * 
 * @param {String} userId - Id of the user
 * @param {String} updateData - the content we want to update
 * @returns {Object} Result with updated user info or error message
 */
const updateUser = async (userId, updateData) => {
    try {
        // Get the user from the database (Mongoose document)
        const user = await getUserById(userId);
        if (!user) {
            return { success: false, message: "User not found" };
        }

        // Modify the user's fields directly
        Object.assign(user, updateData); // or user.fieldName = value;

        // Save the user document to persist the changes and trigger validation
        const updatedUser = await user.save();

        return { success: true, user: updatedUser };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

module.exports = { createUser,
    isUserExist,
    getUser,
    addContact,
    getUserById,
    getUserContacts,
    searchUsers,
    deleteUserContact,
    updateUser };
