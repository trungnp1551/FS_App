const mongoose = require('mongoose')
require('dotenv').config()
const Report = require('../models/report')

exports.getAll = async (req, res) =>{
    try {
        Report
            .find()
            .then(data=>{
                res.status(200).json({
                    message: 'get all report',
                    data
                })
            })
    } catch (error) {
        console.log('err report');
    }
}

exports.sendReport = async (req,res) => {
    try {
        const report = new Report({
            _id: mongoose.Types.ObjectId(),
            userId: req.params.userId,
            friendId: req.params.friendId,
            content: req.body.content
        })
        report
            .save()
            .then(data => {
                res.status(200).json({
                    message: 'successful'
                })
            })
    } catch (error) {
        console.log('err send report')
    }
}