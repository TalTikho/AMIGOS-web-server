const authService = require('../services/authService');
const userService = require('../services/userService');
const User = require('../models/userModel');

/**
 * Authenticates a user with jwt.
 */
// const authUser = async (req, res, next) => {
//     if (req.headers.authorization) {
//         const token = req.headers.authorization.split(" ")[1]; // extract the token
//         const userId = await authService.authenticateUser(token);
//         if (!userId) {
//             return res.status(401).json({errors: authService.AuthFailedMsg});
//         }
//         // set userId for next middlewares
//         req.headers.user_id = userId;
//     } else {
//         return res.status(403).json({error: 'Auth token required'});
//     }
//
//     next();
// }

/**
 * Authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next 
 * @returns answer for authentiaction
 */
const authUser = async (req, res, next) => {
    const userId = req.headers.user_id;

    if (!userId) {
        return res.status(403).json({error: 'User ID required'});
    }

    try {
        // Check if the user with this userId exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({errors: 'Authentication failed (invalid user_id).'});
        }

        // Set the userId in the request for use in the controller
        req.user_id = userId;
    } catch (err) {
        return res.status(500).json({error: 'Internal server error'});
    }

    next();
};


module.exports = {authUser};
