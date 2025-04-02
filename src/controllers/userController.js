const userService = require('../services/userService');
const {parseSchemaErrors} = require("../utils/errorUtils");

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

module.exports = { createUser };