const Hod = require('../Models/HOD.model');
const {validationResult} = require('express-validator'); 
const hodService = require('../Service/hod.service');
const blackListTokenModel = require('../Models/blacklistToken.model');
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "Information_Technology";
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Hod.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP
        const otp = user.generateOTP();
        await user.save();

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await Hod.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.verifyOTP(otp)) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ resetToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        const user = await Hod.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash and set new password
        user.password = await Hod.hashPassword(newPassword);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.registerHod = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    const isHodAlreadyExist = await Hod.findOne({ email });

    if (isHodAlreadyExist) {
        return res.status(400).json({ message: 'User already exist' });
    }

    const hashedPassword = await Hod.hashPassword(password);

    const user = await hodService.createHod({
        name,
        email,
        password: hashedPassword
    });
    const token = user.generateAuthToken();
    res.status(201).json({ token, user });
};

exports.loginHod = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const user = await Hod.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }
    const token = user.generateAuthToken();
    res.cookie('token', token);
    res.status(200).json({ token, user });
}

module.exports.getHodProfile = async (req, res, next) => {

    res.status(200).json(req.user);

}

module.exports.logoutHod = async (req, res, next) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];
    await blackListTokenModel.create({ token });
    res.status(200).json({ message: 'Logged out' });
}

exports.registerStudents = async (req, res) => {
    // Validate input using express-validator
    try {
        // Ensure database connection
        await client.connect();
        const db = client.db(dbName);

        // Validate year query parameter
        const year = req.query.year;
        if (!year) {
            return res.status(400).json({ message: 'Year query parameter is required' });
        }

        // Log the incoming request body
        console.log('Request Body:', req.body);

        // Get the students array from request body
        const students = req.body.students;

        // Specify the collection name
        const studentCollection = db.collection(`${year}_retest`);

        // First, delete all existing documents in the collection
        await studentCollection.deleteMany({});

        // Counter for added students
        let addedCount = 0;

        // Insert all students
        if (students && students.length > 0) {
            // Use insertMany for bulk insertion (more efficient)
            const insertResult = await studentCollection.insertMany(students);
            addedCount = insertResult.insertedCount;
        }else{
            return res.status(201).json({
                message: 'No students were added',
                added: 0,
            })
        }
        // Send success response
        res.status(201).json({
            message: `${addedCount} students were added successfully.`,
            added: addedCount,
        });
    } catch (error) {
        // Error handling
        console.error('Error in registering students:', error);
        res.status(500).json({ 
            message: 'An error occurred while registering students',
            error: error.message 
        });
    } finally {
        // Ensure database connection is closed
        await client.close();
    }
};