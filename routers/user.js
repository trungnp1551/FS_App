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
    .route('/logout/:userId')
    .get(UserController.logOut)

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
    .route('/:userId/deletefriend/:accFriendId')
    .delete(UserController.deleteFriend)

router
    .route('/:userId/upAvatar')
    .post(upload.single("avatar"),UserController.upAvatar)

router
    .route('/sendImageMessage')
    .post(upload.single("image"),UserController.sendImage)

router
    .route('/:userId/updateInfo')
    .post(UserController.updateInfo)

router
    .route('/:userId/updateSetting')
    .post(UserController.updateSetting)

router
    .route('/:userId/changePassword')
    .post(UserController.changePassword)

router
    .route('/:userId/getListFriend')
    .get(UserController.getListFriend)
    
    
module.exports = router;