const express = require('express');
const router = express.Router();

const Users = require('./userRoute');
const Chats = require('./chatRoute');
const Message = require('./messageRoute');
const tokens = require('./tokenRoute');

router.use('/users', Users);
router.use('/chats', Chats);
router.use('/messages', Message);
router.use('/tokens', tokens);


module.exports = router;