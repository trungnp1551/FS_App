const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    _id: String,
    imageUrl: String,
    type: String
})

module.exports = mongoose.model('Image', imageSchema)