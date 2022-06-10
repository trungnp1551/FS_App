const mongoose = require('mongoose')

const reportSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    friendId: String,
    content: String
},{
    versionKey: false
})

module.exports = mongoose.model('Report', reportSchema)