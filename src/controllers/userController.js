const userService = require('../services/userService');
const {parseSchemaErrors} = require("../utils/errorUtils");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

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

const addContact = async (req, res) => {
    const contactId = req.params.contactId; // get the contact id from the params
    const userId = req.headers.user_id; // get the user id from the header

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

module.exports = { createUser, isUserExist, addContact };