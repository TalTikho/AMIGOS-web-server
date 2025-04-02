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

module.exports = {createUser};