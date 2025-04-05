const User = require('../models/userModel');

// create the user
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

const getUserById = async (userId) => {
    try {
        return await User.findById(userId);
    } catch (error) {
        return null;
    }
};

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

module.exports = { createUser, isUserExist, getUser, addContact, getUserById };
