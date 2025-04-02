const express = require('express');
const router = express.Router();

const Users = require('./userRoute');


router.use('/users', Users);

module.exports = router;