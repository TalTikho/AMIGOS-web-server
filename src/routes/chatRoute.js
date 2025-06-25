const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authUser } = require('../controllers/authController');

router.route('/')
    .post(authUser, chatController.createChat)

router.route('/:userId')
    .get(authUser, chatController.getUserChats);

router.route('/get-single-chat/:chatId')
    .get(authUser, chatController.getChatById);

router.route('/:chatId/update/:userId')
    .put(authUser, chatController.updateChat);

router.route('/:chatId/add-member/:userMemberId/:userId')
    .post(authUser, chatController.addMember);

router.route('/:chatId/add-manager/:managerId/:userId')
    .post(authUser, chatController.addManager);

router.route('/:chatId/remove-manager/:managerId/:userId')
    .delete(authUser, chatController.removeManager);

router.route('/:chatId/remove-member/:managerId/:userId')
    .delete(authUser, chatController.removeMember);

router.route('/:chatId/leave/:userId')
    .delete(authUser, chatController.leaveChat);

router.route('/:chatId/delete/:userId')
    .delete(authUser, chatController.deleteChat);

module.exports = router;