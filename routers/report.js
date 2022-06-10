const express = require('express');
const router = express.Router();

const ReportController = require('../controllers/report');

router
    .route('/')
    .get(ReportController.getAll)

router
    .route('/:userId/sendreport/:friendId')
    .post(ReportController.sendReport)

module.exports = router;