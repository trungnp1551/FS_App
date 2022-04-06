const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Image = require('../models/image')
//const Nexmo = require('nexmo')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const cloudinary = require('../routers/cloudinary')
const vonage = require('../routers/vonage')

//const Vonage = require('@vonage/server-sdk')

const ImageController = require('../controllers/image')
//const express = require('express')

// const vonage = new Vonage({
//   apiKey: process.env.API_KEY,
//   apiSecret: process.env.API_SECRET
// })


exports.getAll = (req,res,next) => {
    User.find()
    .then(data=>{
        res.status(200).json({
            message: 'get all',
            data,
        })
    })
}

exports.getOne = async (req,res)=>{
    try {
        const user = await User.findById(req.params.userId)
        const image = await Image.findById(user.avatarId)
        res.status(200).json({
            message: 'get one',
            user,
            imageUrl: image.imageUrl
        })
    } catch (error) {
        console.log(error)
    }
}

exports.signUp = (req,res) => {
    User
        .findOne({phoneNumber: req.body.phonenumber})
        .then(user => {
            if(user){
                return res.status(200).json({
                    message: 'Account exists'
                })
            }else{
                bcrypt.hash(req.body.password, 10, (err,hash)=>{
                    if(err){
                        return res.status(200).json({message: 'err'})
                    }else{
                        //const image = ImageController.upload(req.file.path)
                        // const image = new Image({
                        //     _id:
                        // })
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            phoneNumber: req.body.phonenumber,
                            password: hash,
                            username: req.body.username,
                            avatarId: '001'
                        });
                        user
                            .save()
                            .then(user=>{
                                res.status(200).json({
                                    message:'create successful',
                                    user
                                })
                            })
                            .catch(err => {
                                console.log(err),
                                res.status(504).json({
                                    message:'err'
                                })
                            })
        
                    }
                })
            }
        })
        .catch(err=>{
            console.log(err),
            res.status(504).json({
                message:'err'
            })
        })
}

exports.logIn = (req,res)=>{
    User
        .findOne({phoneNumber: req.body.phonenumber})
        .then(user=>{
            if (!user) {
                console.log('type: Not exists user')
                return res.status(200).json({ type: 'Not exists user' })
            } else {
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (result) {
                        const token = jwt.sign({
                            userId: user._id
                        }, process.env.JWT_KEY ,{
                            expiresIn: '1h'
                        })
                        user.token = token
                        user.save()
                        console.log(token)
                        ///////////
                        // const decoded = jwt.verify(user.token, process.env.JWT_KEY)
                        // console.log('DECODE ' + decoded.userId)
                        //////////////            
                        return res.status(200).json({
                            type: 'login successful',
                            user: user
                        })
                    }
                    console.log('type: login fail')
                    return res.status(200).json({ type: 'Login fail' })
                })
            }
        })
}

exports.sendSms = (req,res)=>{
    const from = "FS_APP"
    const to = req.body.phonenumber
    const text = req.body.text

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if(responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
                return res.status(200).json({responseData})
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

exports.upAvatar = async (req,res)=>{
    try {
        const user = await User.findById(req.params.userId)
        if (user.avatarId != undefined && user.avatarId != '001') {
            await cloudinary.uploader.destroy(user.avatarId)
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

exports.addFriend = async (req,res) =>{
    try {
        const user = await User.findById(req.params.userId)
        let accFriendId = req.params.accFriendId
        //console.log(accFriendId)
        user.listFriendId.push(accFriendId)
        await user.save()
        
        res.status(200).json({
            message: 'add friend successful',
            list: user.listFriendId
        })
    } catch (error) {
        console.log(error)
    }
}

exports.deleteFriend = async (req,res)=>{
    try {
        const user = await User.findById(req.params.userId)
        let accFriendId = req.params.accFriendId
        let position = await user.listFriendId.indexOf(accFriendId)
        user.listFriendId.splice(position, 1)
        await user.save()
        res.status(200).json({
            message: 'done',
            newList: user.listFriendId
        })

    } catch (error) {
        console.log(error)
    }
}

exports.getListFriend = async (req,res) => {
    try {
        const user = await User.findById(req.params.userId)
        const arrListFriendId = user.listFriendId
        let arrTemp = []
        for(var i=0; i<arrListFriendId.length; i++){
            const userFriend = await User.findById(arrListFriendId[i])
            const temp = {
                userId: userFriend._id,
                username: userFriend.username,
                avatarUrl: await ImageController.getUrl(userFriend.avatarId)
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

exports.sendReport = async (req,res) =>{
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

exports.logout = (req, res) => {
    User
        .findOne({ _id: req.params.userId })
        .then(user => {
            user.token = undefined
            user.save()
            res.status(200).json({
                message: 'Logout successful',
                token: user.token
            })
        })
        .catch(err => {
            res.status(500).json({
                err: err
            })
        })
}

exports.deleteAll = (req,res)=>{
    User
        .find()
        .remove()
        .then(()=>{
            res.status(200).json({
                message: 'delete all'
        })
    })
}

// exports.deleteOne = (req,res)=>{
//     User    
//         .findOne({_id: req.params.userId})
//         .remove()
//         .then(()=>{
//             res.status(200).json({
//                 message: 'delete one'
//             })
//         })
// }