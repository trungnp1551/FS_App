const mongoose = require('mongoose')
require('dotenv').config()
const Music = require('../models/music')

exports.getAllSong = (req, res) => {
    Music
        .find()
        .then(data => {
            res.status(200).json({
                message: 'get all song',
                data,
            })
        })
}

exports.addSong = (req, res) => {
    const song = new Music({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        avatarUrl: req.body.avatarUrl,
        link: req.body.link,
        singer: req.body.singer,
        select: false,
    })
    song
        .save()
        .then(song => {
            res.status(200).json({
                message: 'add song',
                song
            })
        })
        .catch(err => {
            console.log(err),
                res.status(504).json({
                    message: 'err'
                })
        })
}

exports.deleteAllSong = (req, res) => {
    Music
        .find()
        .remove()
        .then(() => {
            res.status(200).json({
                message: 'delete all',
            })
        })
}
