const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('../models/user')
//const Image = require('../models/image')
const Setting = require('../models/setting')

//const Nexmo = require('nexmo')
const jwt = require('jsonwebtoken')
require('dotenv').config()
// const cloudinary = require('../routers/cloudinary')
const vonage = require('../routers/vonage')

//const Vonage = require('@vonage/server-sdk')

const ImageController = require('../controllers/image')
const { set } = require('../app')
// const express = require('express')
// const { json } = require('express/lib/response')
//const express = require('express')

// const vonage = new Vonage({
//   apiKey: process.env.API_KEY,
//   apiSecret: process.env.API_SECRET
// })


exports.getAll = (req, res) => {
    User.find()
        .then(data => {
            res.status(200).json({
                message: 'get all',
                data,
            })
        })
}

exports.getOne = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const avatarUrl = await ImageController.getUrl(user.avatarId)

        const temp = {
            userId: user._id,
            username: user.username,
            avatarUrl: avatarUrl,
            recentState: user.recentState,
            sex: user.sex,
            age: user.age
        }

        res.status(200).json({
            message: 'get one',
            user: temp
        })
    } catch (error) {
        console.log(error)
    }
}

exports.signUp = (req, res) => {
    User
        .findOne({ phoneNumber: req.body.phonenumber })
        .then(user => {
            if (user) {
                return res.status(200).json({
                    message: 'Account exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(200).json({ message: 'err' })
                    } else {
                        const setting = new Setting({
                            _id: new mongoose.Types.ObjectId(),
                            sound: true,
                            vibration: true,
                            notification: true,
                            status: true,
                        })
                        setting.save()
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            phoneNumber: req.body.phonenumber,
                            password: hash,
                            username: req.body.username,
                            avatarId: '001',
                            age: '18',
                            sex: 'male',
                            recentState: false,
                            settingId: setting._id.toString()
                        });
                        user
                            .save()
                            .then(user => {
                                res.status(200).json({
                                    message: 'create successful',
                                    user,
                                    setting
                                })
                            })
                            .catch(err => {
                                console.log(err),
                                    res.status(504).json({
                                        message: 'err'
                                    })
                            })

                    }
                })
            }
        })
        .catch(err => {
            console.log(err),
                res.status(504).json({
                    message: 'err'
                })
        })
}

exports.logIn = async (req, res) => {
    const user = await User.findOne({ phoneNumber: req.body.phonenumber })
    if (!user) {
        console.log('type: Not exists user')
        res.status(200).json({ type: 'Not exists user' })
    } else {
        const avatarUrl = await ImageController.getUrl(user.avatarId)
        const settingUser = await Setting.findById(user.settingId)
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign({
                    userId: user._id
                }, process.env.JWT_KEY, {
                    expiresIn: '1h'
                })
                user.token = token
                if (settingUser.status) {
                    user.recentState = true
                }
                user.save()
                //console.log(token)
                ///////////
                // const decoded = jwt.verify(user.token, process.env.JWT_KEY)
                // console.log('DECODE ' + decoded.userId)
                //////////////
                const temp = {
                    _id: user._id,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    listFriendId: [],
                    avatarUrl: avatarUrl,
                    token: user.token,
                    age: user.age,
                    sex: user.sex
                }
                return res.status(200).json({
                    type: 'login successful',
                    user: temp,
                    setting: settingUser

                })
            }
            console.log('type: login fail')
            return res.status(200).json({ type: 'Login fail' })
        })
    }
}

exports.sendSms = (req, res) => {
    const from = "FS_APP"
    const to = req.body.phonenumber
    const text = req.body.text

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if (responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
                return res.status(200).json({ responseData })
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })

    //res.send(req.body);
    //console.log(req.body)
    // const toNumber = req.body.phonenumber;
    // const text = req.body.text;

    // nexmo.message.sendSms(
    //   "NUMBER", toNumber, text, {type: 'unicode'},
    //   (err, responseData) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.dir(responseData);
    //       // Optional: add socket.io -- will explain later
    //     }
    //   }
    // );
}

exports.updateInfo = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        user.username = req.body.username
        user.age = req.body.age
        user.sex = req.body.sex
        await user.save()
        res.status(200).json({
            message: 'update successful',
            user
        })
    } catch (error) {
        console.log('err')
    }
}

exports.updateSetting = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const setting = await Setting.findById(user.settingId)

        setting.sound = req.body.sound
        setting.notification = req.body.notification
        setting.vibration = req.body.vibration
        setting.status = req.body.status

        user.recentState = setting.status
        
        await user.save()
        await setting.save()
        res.status(200).json({
            message: 'update setting successful',
            setting
        })
    } catch (error) {
        console.log('err')
    }
}

exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        bcrypt.compare(req.body.oldPassword, user.password, (err, result) => {
            if (result) {
                bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                    user.password = hash
                    user.save()
                })
                return res.status(200).json({ message: 'Change password successful' })
            }
            res.status(200).json({ message: 'Old password does not match' })
        })
    } catch (error) {
        console.log('err change pass')
    }
}

exports.upAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        if (user.avatarId != undefined && user.avatarId != '001') {
            await ImageController.destroyImage(user.avatarId)
            //await cloudinary.uploader.destroy(user.avatarId)
        }
        if (req.file == undefined) {
            user.avatarId = '001'
            await user.save()
            res.status(200).json({
                message: "Up avatar successful",
                avatarId: user.avatarId,
                avatarUrl: await ImageController.getUrl(user.avatarId)
            })
            return;
        }
        const image = await ImageController.upload(req.file.path)
        user.avatarId = image._id
        await user.save()
        res.status(200).json({
            message: "Up avatar successful",
            avatar: user.avatarId,
            avatarUrl: image.imageUrl
        })

    } catch (error) {
        console.log(error)
    }
}

exports.sendImage = async (req, res) => {
    try {
        const image = await ImageController.upload(req.file.path)
        await image.save()
        res.status(200).json({
            message: "Up image message successful",
            imageId: image._id,
            imageUrl: await ImageController.getUrl(image._id)
        })
    } catch (error) {
        console.log(error);
    }
}

exports.addFriend = async (req, res) => {
    try {
        let accUserId = req.params.userId
        let accFriendId = req.params.accFriendId

        const user = await User.findById(accUserId)
        const userFriend = await User.findById(accFriendId)

        user.listFriendId.push(accFriendId)
        userFriend.listFriendId.push(accUserId)

        await user.save()
        await userFriend.save()

        res.status(200).json({
            message: 'add friend successful',
        })
    } catch (error) {
        console.log(error)
    }
}

exports.deleteFriend = async (req, res) => {
    try {
        let userId = req.params.userId
        let accFriendId = req.params.accFriendId

        const user = await User.findById(userId)
        const accFriend = await User.findById(accFriendId)

        let positionFriend = await user.listFriendId.indexOf(accFriendId)
        user.listFriendId.splice(positionFriend, 1)
        await user.save()

        let positionUser = await accFriend.listFriendId.indexOf(userId)
        accFriend.listFriendId.splice(positionUser, 1)
        await accFriend.save()

        res.status(200).json({
            message: 'delete done',
            //newList: user.listFriendId
        })

    } catch (error) {
        console.log(error)
    }
}

exports.getListFriend = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const arrListFriendId = user.listFriendId
        let arrTemp = []
        for (var i = 0; i < arrListFriendId.length; i++) {
            const userFriend = await User.findById(arrListFriendId[i])
            const temp = {
                userId: userFriend._id,
                username: userFriend.username,
                avatarUrl: await ImageController.getUrl(userFriend.avatarId),
                recentState: userFriend.recentState,
                sex: userFriend.sex,
                age: userFriend.age
            }
            arrTemp.push(temp)
        }
        res.status(200).json({
            message: 'get list friend',
            arrTemp
        })
    } catch (error) {
        console.log(error)
    }
}

exports.sendReport = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        let accReportId = req.params.accFriendId
        let reportText = req.body.text
        console.log(accFriendId)
        console.log(reportText)

    } catch (error) {
        console.log(error)
    }
}

exports.logOut = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        user.token = undefined
        user.recentState = false
        await user.save()
        res.status(200).json({
            message: 'log out successful'
        })
    } catch (error) {
        console.log('err');
    }
    // User
    //     .findOne({ _id: req.params.userId })
    //     .then(user => {
    //         user.token = undefined
    //         user.recentState = false;
    //         user.save()
    //         res.status(200).json({
    //             message: 'Logout successful',
    //             token: user.token
    //         })
    //     })
    //     .catch(err => {
    //         res.status(500).json({
    //             err: err
    //         })
    //     })
}

exports.deleteAll = (req, res) => {
    User
        .find()
        .remove()
        .then(() => {
            res.status(200).json({
                message: 'delete all'
            })
        })
}

exports.deleteOne = (req, res) => {
    User
        .findOne({ _id: req.params.userId })
        .remove()
        .then(() => {
            res.status(200).json({
                message: 'delete one'
            })
        })
}