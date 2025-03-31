const express = require('express');
const router = express.Router();
const {body} = require('express-validator')
const adminController = require('../Controllers/admin.controller');
const authMiddleware = require('../Middleware/authAdmin.middleware');

router.post('/register', [
    body('name').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    adminController.registerAdmin
)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    adminController.loginAdmin
)

router.get('/profile', authMiddleware.authAdmin, adminController.getAdminProfile)

router.get('/logout', authMiddleware.authAdmin, adminController.logoutAdmin)

  router.post('/forgot-password', [
    body('email').isEmail().withMessage('Invalid Email')
], adminController.forgotPassword);

router.post('/verify-otp', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP')
], adminController.verifyOTP);

router.post('/reset-password', [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], adminController.resetPassword);

module.exports = router;
