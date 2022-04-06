const mongoose = require('mongoose')
require('dotenv').config()
const Image = require('../models/image')
const cloudinary = require('../routers/cloudinary')

exports.upload = async (path) => {
    try {
        const result = await cloudinary.uploader.upload(path);
        const image = new Image({
            _id: result.public_id,
            imageUrl: result.secure_url
        })
        await image.save()
        return image
    } catch (error) {
        console.log(error)
    }
}

exports.getUrl = async (id)=>{
    try {
        const image = await Image.findById(id)
        return image.imageUrl
    } catch (error) {
        console.log(error)
    }
}