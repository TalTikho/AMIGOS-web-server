const express = require('express');
const router = express.Router();

const Users = require('./userRoute');
const Chats = require('./chatRoute');


router.use('/users', Users);
router.use('/chats', Chats);


module.exports = router;