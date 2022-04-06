const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username:  {
        type: String,
        required: true
    },
    phoneNumber: String,
    password:String,
    listFriendId: [],
    token: String,
    resetToken: String,
    resetTokenExpires: Date,
    avatarId: String,

},{
    versionKey: false
})

module.exports = mongoose.model('User', userSchema)