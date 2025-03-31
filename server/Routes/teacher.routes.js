const express = require('express');
const router = express.Router();
const {body} = require('express-validator')
const teacherController = require('../Controllers/teacher.controller');
const authMiddleware = require('../Middleware/authTeacher.middleware');

router.post('/register', [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    teacherController.registerTeacher
)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    teacherController.loginTeacher
)

router.get('/profile', authMiddleware.authTeacher, teacherController.getTeacherProfile)

router.get('/logout', authMiddleware.authTeacher, teacherController.logoutTeacher)

router.post('/forgot-password', [
    body('email').isEmail().withMessage('Invalid Email')
], teacherController.forgotPassword);

router.post('/verify-otp', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP')
], teacherController.verifyOTP);

router.post('/reset-password', [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], teacherController.resetPassword);


module.exports = router;
