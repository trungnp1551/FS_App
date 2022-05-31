const express = require('express');
const router = express.Router();

const MusicController = require('../controllers/music');

router
    .route('/')
    .get(MusicController.getAllSong)
    .delete(MusicController.deleteAllSong)

router
    .route('/addSong')
    .post(MusicController.addSong)

module.exports = router;