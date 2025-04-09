// const express = require('express');
// const router = express.Router();
// const chatController = require('../controllers/chatController');

// router.route('/').post(chatController.createChat);

// module.exports = router;
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authUser } = require('../controllers/authController');

router.route('/')
    .post(authUser, chatController.createChat)
    .get(authUser, chatController.getUserChats);

router.route('/:chatId')
    .get(authUser, chatController.getChatById);

router.route('/:chatId/update')
    .put(authUser, chatController.updateChat);

router.route('/:chatId/add-member/:userId')
    .post(authUser, chatController.addMember);

router.route('/:chatId/add-manager/:userId')
    .post(authUser, chatController.addManager);

router.route('/:chatId/remove-manager/:userId')
    .delete(authUser, chatController.removeManager);

router.route('/:chatId/remove-member/:userId')
    .delete(authUser, chatController.removeMember);

router.route('/:chatId/leave')
    .delete(authUser, chatController.leaveChat);

router.route('/:chatId/delete')
    .delete(authUser, chatController.deleteChat);

module.exports = router;