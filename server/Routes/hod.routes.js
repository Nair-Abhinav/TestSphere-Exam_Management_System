const express = require('express');
const router = express.Router();
const {body} = require('express-validator')
const hodController = require('../Controllers/hod.controller');
const authMiddleware = require('../Middleware/authHod.middleware');
const VerificationModel = require('../Models/verification.model');

router.post('/register', [
    body('name').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    hodController.registerHod
)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    hodController.loginHod
)

router.get('/profile', authMiddleware.authHod, hodController.getHodProfile)

router.get('/logout', authMiddleware.authHod, hodController.logoutHod)

router.post('/retest/register', hodController.registerStudents)

// POST route to save verification status
router.post('/verify-students', async (req, res) => {
    const { year, isVerified } = req.body;
    try {
      const result = await VerificationModel.findOneAndUpdate(
        { year }, 
        { isVerified }, 
        { upsert: true, new: true }
      );
      console.log('Update result:', result);
      res.status(200).json({ message: 'Verification status updated', result });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Error updating verification', error: error.message });
    }
  });
  
  // GET route to fetch verified years
  router.get('/verified-years', async (req, res) => {
    try {
      const verifiedEntries = await VerificationModel.find({ isVerified: true });
      const verifiedYears = verifiedEntries.map(entry => entry.year);
      res.json({ verifiedYears });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching verified years' });
    }
  });

  router.post('/forgot-password', [
    body('email').isEmail().withMessage('Invalid Email')
], hodController.forgotPassword);

router.post('/verify-otp', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP')
], hodController.verifyOTP);

router.post('/reset-password', [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], hodController.resetPassword);

module.exports = router;