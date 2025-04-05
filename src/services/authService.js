const User = require('../models/userModel');
const jwt = require("jsonwebtoken");

const AuthFailedMsg = "Authentication failed (provide a valid user_id header).";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authenticates a user given its auth-token.
 * @param token jwt token.
 * @returns {Promise<string | null>} returns the user id upon success.
 */
const authenticateUser = async (token) => {
    if (!token) {
        return false;
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        return data.user_id;
    } catch (err) {
        return null;
    }
}

module.exports = {AuthFailedMsg, authenticateUser};
