const express = require('express');
const router = express.Router();
const { uploadSubject } = require('../Controllers/subjectUpload.controller');

// The route should be /subjects/upload to match the frontend POST URL
router.post('/subjects/upload', uploadSubject);

module.exports = router;
