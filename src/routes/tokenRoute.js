const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Check if user exists
router.route('/')
    .post(userController.isUserExist);

module.exports = router;