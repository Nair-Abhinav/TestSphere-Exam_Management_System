const express = require('express');
const { deleteStudentData, deleteSubjectData } = require('../Controllers/delete.controller');

const router = express.Router();

// DELETE /delete/students?year=BE&examType=normal&courseType=Regular
router.delete('/students', deleteStudentData);

// DELETE /delete/subjects?year=BE&semester=7
router.delete('/subjects', deleteSubjectData);

module.exports = router;
