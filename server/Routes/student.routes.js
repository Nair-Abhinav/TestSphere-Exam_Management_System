const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const studentController = require('../Controllers/student.controller');

// Route to register new students
router.post('/retest/register', [
    body('students').isArray({ min: 1 }).withMessage('Students array is required and should contain at least one student'),
    body('students.*.sapId').isLength({ min: 11 }).withMessage('SAP ID must be 11 characters long'),
    body('students.*.name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('students.*.termTest1').isBoolean().withMessage('Invalid value for term test 1'),
    body('students.*.termTest2').isBoolean().withMessage('Invalid value for term test 2')
], studentController.registerStudents);

// Route to update existing students
router.put('/retest/update', [
    body('students').isArray({ min: 1 }).withMessage('Students array is required and should contain at least one student'),
    body('students.*.sapId').isLength({ min: 11 }).withMessage('SAP ID must be 11 characters long'),
    body('students.*.name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('students.*.termTest1').isBoolean().withMessage('Invalid value for term test 1'),
    body('students.*.termTest2').isBoolean().withMessage('Invalid value for term test 2')
], studentController.updateStudents);

// Route to fetch all students from a year collection
router.get('/retest', studentController.getAllRetestStudents);

// Route to fetch a student by SAP ID
router.get('/:sapId', studentController.getStudent);

// Route to get students as per subjects
router.get('/retest/:subject', studentController.getRetestStudentsBySubject);

// Route to delete a student by SAP ID and subject
router.delete('/retest/:sapId', studentController.deleteStudent);

module.exports = router;
