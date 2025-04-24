const express = require('express');
const router = express.Router();

// All useable routes 
const Users = require('./userRoute');
const Chats = require('./chatRoute');
const Message = require('./messageRoute');
const Notification = require('./notificationRoute');
const Media = require('./mediaRoute');
const tokens = require('./tokenRoute');

// Routes
router.use('/users', Users);
router.use('/chats', Chats);
router.use('/messages', Message);
router.use('/notification', Notification);
router.use('/media', Media);
router.use('/tokens', tokens);

module.exports = router;