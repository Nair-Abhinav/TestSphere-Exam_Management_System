const mongoose = require('mongoose');
    
const verificationSchema = new mongoose.Schema({
    year: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, required: true }
});

module.exports = mongoose.model('VerifyStudents', verificationSchema);