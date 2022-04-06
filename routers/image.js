const express = require('express');
const router = express.Router();

const checkAuth = require('../auth/auth')
const ImageController = require('../controllers/image')