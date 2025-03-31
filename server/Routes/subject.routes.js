const express = require('express');
const router = express.Router();
const { getSubjectsBySemesterAndType } = require('../Controllers/subject.Controller');
router.get('/subjects', async (req, res) => {
    try { 
        const semester = req.query.semester;
        const coursetype = req.query.coursetype;
        console.log(`Semester: ${semester}, Course Type: ${coursetype}`);
        const subjects = await getSubjectsBySemesterAndType(semester, coursetype);
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching subjects',
            error: error.message
        });
    }
});
module.exports = router;
