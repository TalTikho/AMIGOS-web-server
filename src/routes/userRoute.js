const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authUser} = require('../controllers/authController');

router.route('/')
    .post(userController.createUser);

router.route('/add-contact/:contactId')
    .post(authUser, userController.addContact)

router.route('/:id')
    .get(authUser, userController.getUserById);

router.route('/:id/contacts')
    .get(authUser, userController.getUserContacts);

router.route('/:id/search')
    .get(authUser, userController.searchUsers);

router.route('/:id/remove-contact/:contactId')
    .delete(authUser, userController.deleteUserContact);

router.route('/:id/update')
    .put(authUser, userController.updateUser);

module.exports = router;