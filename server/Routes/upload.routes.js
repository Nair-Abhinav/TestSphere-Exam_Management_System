const express = require('express');
const { uploadExcel } = require('../Controllers/upload.controller');
const upload = require('../Middleware/upload.middleware');

const router = express.Router();

// Accept multiple files
router.post('/', upload.array('excelFiles'), uploadExcel);

module.exports = router;
