const express = require('express');
const { uploadExcel} = require('../Controllers/upload.controller');
const upload = require('../Middleware/upload.middleware');

const router = express.Router();

// Route for uploading Excel file
router.post('/', upload.single('excelFile'), uploadExcel);

module.exports = router;