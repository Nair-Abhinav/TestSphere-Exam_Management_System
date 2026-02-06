const express = require('express');
const router = express.Router();
const { getAttendance  , getAttendanceMinors , getAttendanceHonors } = require('../Controllers/attendance.controller');

// Route handler to fetch subjects by attendance 
router.get('/attendance', async (req, res) => {
    try {
        const year = req.query.year; // e.g., 'TY'
        const sem = req.query.sem;
        const courseType = req.query.courseType; // e.g., 'DLE'
        // Parse selectedSubjects from query (it will be a string)
        let selectedSubjects = req.query.selectedSubjects;
        if (typeof selectedSubjects === "string") {
            try {
                selectedSubjects = JSON.parse(selectedSubjects);
            } catch (e) {
                // If parsing fails, fallback to empty array
                selectedSubjects = [];
            }
        }
        // Pass selectedSubjects to controller
        const attendance = await getAttendance(year, sem, courseType, selectedSubjects);
        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching attendance',
            error: error.message
        });
    }
});


router.get('/attendance/minors', async (req, res) => {
    try {
        const year = req.query.year; // e.g., 'TY'
        const minors = await getAttendanceMinors(year);
        res.status(200).json({
            success: true,
            data: minors
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching attendance',
            error: error.message
        });
    }
});

router.get('/attendance/honors', async (req, res) => {
    try {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "Query param 'year' is required"
            });
        }

        const trimmedYear = year.trim();
        console.log("Year:", trimmedYear);

        const honors = await getAttendanceHonors(trimmedYear);

        res.status(200).json({
            success: true,
            data: honors
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching attendance',
            error: error.message
        });
    }
});


module.exports = router;
