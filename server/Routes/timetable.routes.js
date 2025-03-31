const express = require('express');
const router = express.Router();
const globalTimetableController = require('../Controllers/timetable.controller');

// Save Global Timetable
router.post('/timetable', globalTimetableController.saveGlobalTimetable);

// Get Global Timetable
router.get('/timetable', globalTimetableController.getGlobalTimetable);

// Get Timetable Modification History
router.get('/timetable/history', globalTimetableController.getTimetableHistory);

module.exports = router;