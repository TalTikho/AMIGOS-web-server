const userService = require('../services/userService');
const {parseSchemaErrors} = require("../utils/errorUtils");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Creating user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {body} body - all of what we insert to the user
 * @returns {Object} JSON response with new user (success) or error
 */
const createUser = async (req, res) => {
    try {
        // create the user using the user service
        const user = await userService.createUser(
            req.body.username,
            req.body.password,
            req.body.email,
            req.body.profile_pic,
            req.body.status
        );
        // return status 201 created
        return res.status(201).location(`api/users/${user._id}`).json();
    } catch (err) {
        return res.status(400).json({errors: parseSchemaErrors(err)});
    }
}

/**
 * Checking if user exists
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {body} body - all of what we search to find the specific user
 * @returns {Object} JSON response with users token (success) or error
 */
const isUserExist = async (req, res) => {
    // get the username or email and password
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // check if the user exist
    const userMsg = await userService.isUserExist(username, email, password);
    if (!userMsg.success) {
        // if the user is not exist
        return res.status(404).json({error: userMsg.message});
    }

    const user = await userService.getUser(username, email, password);
    const data = {timestamp: Date.now().toString(), user_id: user._id.toString()}
    const token = jwt.sign(data, JWT_SECRET)

    // return status 200 with the user token
    return res.status(200).json({token});
}

/**
 * Adding new contact 
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} contactId - the contact id we want to add 
 * @param {String} userId - the user id of the user 
 * @returns {Object} JSON response with message (success) or error
 */
const addContact = async (req, res) => {
    const contactId = req.params.contactId; // get the contact id from the params
    const userId = req.params.userId; // get the user id from the params CHANGED FROM HEADER

    // if didnt get something
    if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
    }
    if (!contactId || contactId.trim() === "") {
        return res.status(400).json({ error: 'Missing contact ID' });
    }

    try {
        // try to add the contact
        const result = await userService.addContact(userId, contactId);

        // if didnt success
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }

        // if success
        return res.status(200).json({ message: result.message });
    } catch (err) {
        return res.status(500).json({errors: parseSchemaErrors(err)});
    }
};

/**
 * eting the wanted user by id 
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} userId - the user id of the user 
 * @returns {Object} JSON response with message (success) or error
 */
const getUserById = async (req, res) => {
    // get the user by his ID from the service
    const user = await userService.getUserById(req.params.id);

    if (user == null) {
        // if the user not exist return not found
        return res.status(404).json({error: 'User not found'});
    }
    // exclude sensitive fields
    const userObj = user.toObject();
    delete userObj.password;

    // if the user exists return the user
    return res.status(200).json(userObj);
};

/**
 * Geting all the contacts for user 
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} userId - the user id of the user 
 * @returns {Object} JSON response with message (success) or error
 */
const getUserContacts = async (req, res) => {

    const contactsRes = await userService.getUserContacts(req.params.id);

    if (!contactsRes.success) {
        return res.status(404).json({error: contactsRes.message});
    }

    return res.status(200).json(contactsRes.contacts);
}

/**
 * Searching for user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} userId - the user id of the user 
 * @param {query} query - the query of the user 
 * @returns {Object} JSON response with message (success) or error
 */
const searchUsers = async (req, res) => {
    try {
        // get the query and the user id
        const query = req.query.q;
        const userId = req.params.id;

        // get the result from the service
        const result = await userService.searchUsers(query, userId);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }

        // return the search
        return res.status(200).json(result.searchResult);
    } catch (err) {
        return res.status(400).json({errors: parseSchemaErrors(err)});
    }
}

/**
 * Deleting contact for user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} userId - the user id of the user 
 * @param {String} contactId - the contact we want to delete 
 * @returns {Object} JSON response with nothing (success) or error
 */
const deleteUserContact = async (req, res) => {
    const userId = req.params.id;
    const contactId = req.params.contactId;

    try {
        // get the result from the service
        const result = await userService.deleteUserContact(userId, contactId);

        // if the remove didnt success
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }

        return res.status(201).json();
    } catch (err) {
        return res.status(400).json({errors: parseSchemaErrors(err)});
    }
}

/**
 * Updating info for user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} userId - the user id of the user 
 * @param {Body} body - the body with all the info we want to update 
 * @returns {Object} JSON response with nothing (success) or error
 */
const updateUser = async (req, res) => {
    // get the userId and the data
    const userId = req.params.id;
    const { username, email, profile_pic, password, status } = req.body;

    // if there are no data
    if (!username && !email && !profile_pic && !password && !status) {
        return res.status(400).json({ error: 'No data provided to update' });
    }

    try {
        // prepare the data
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (profile_pic) updateData.profile_pic = profile_pic;
        if (password) updateData.password = password;
        if (status) updateData.status = status;

        // update and get the result from the service
        const result = await userService.updateUser(userId, updateData);

        // if didnt success
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }

        return res.status(200).json(result.user);
    } catch (err) {
        return res.status(400).json({errors: parseSchemaErrors(err)});
    }
}

module.exports = { createUser,
    isUserExist,
    addContact,
    getUserById,
    getUserContacts,
    searchUsers,
    deleteUserContact,
    updateUser };