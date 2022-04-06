const multer = require("multer")
//const path = require("path")
const cloudinary = require('./cloudinary')

/** Storage Engine */
const storageEngine = multer.diskStorage({
    cloudinary,
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
    }
})

//init
const upload = multer({
    storage: storageEngine,
    allowedFormats: ['jpg','jpeg','png'],
    limits: { fileSize: 1024 * 1024 * 5 },
})

module.exports = upload;