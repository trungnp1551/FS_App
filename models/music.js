const mongoose = require('mongoose')

const musicSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    avatarUrl: String,
    link: String,
    singer: String,
    select: Boolean
},{
    versionKey: false
})

module.exports = mongoose.model('Music', musicSchema)