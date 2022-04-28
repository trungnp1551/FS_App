const express = require('express');
const router = express.Router();

const checkAuth = require('../auth/auth')
const UserController = require('../controllers/user')
const upload = require('./upload');


router
    .route('/')
    .get(UserController.getAll)
    .delete(UserController.deleteAll)

router
    .route('/signup')
    .post(UserController.signUp);

router
    .route('/login')
    .post(UserController.logIn)

router
    .route('/:userId')
    .get(/*checkAuth,*/ UserController.getOne)
    .delete(UserController.deleteOne)

router
    .route('/sendsms')
    .post(checkAuth, UserController.sendSms)

router
    .route('/:userId/addfriend/:accFriendId')
    .get(UserController.addFriend)

router
    .route('/:userId/upAvatar')
    .post(upload.single("avatar"),UserController.upAvatar)

router
    .route('/:userId/updateInfo')
    .post(UserController.updateInfo)

router
    .route('/:userId/getListFriend')
    .get(UserController.getListFriend)
    
module.exports = router;