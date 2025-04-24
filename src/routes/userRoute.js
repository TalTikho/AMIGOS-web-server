const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authUser} = require('../controllers/authController');

//Create user
router.route('/')
    .post(userController.createUser);

//Add contact
router.route('/:userId/add-contact/:contactId')
    .post(authUser, userController.addContact)

//Get user
router.route('/:id')
    .get(authUser, userController.getUserById);

//Get all contacts for user
router.route('/:id/contacts')
    .get(authUser, userController.getUserContacts);

//Search for user
router.route('/:id/search')
    .get(authUser, userController.searchUsers);

//Delete user
router.route('/:id/remove-contact/:contactId')
    .delete(authUser, userController.deleteUserContact);

//Update user info
router.route('/:id/update')
    .put(authUser, userController.updateUser);

module.exports = router;