const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authUser} = require('../controllers/authController');

router.route('/')
    .post(userController.createUser);

router.route('/add-contact/:contactId')
    .post(authUser, userController.addContact)

module.exports = router;