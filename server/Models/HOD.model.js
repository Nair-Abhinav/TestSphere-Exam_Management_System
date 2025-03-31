const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min:[6,'Password must be at least 6 characters long']
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

hodSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}

hodSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

hodSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

hodSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpires = Date.now() + 600000; // 10 minutes
    return otp;
};

hodSchema.methods.verifyOTP = function(otp) {
    return this.otp === otp && this.otpExpires > Date.now();
};
const HOD = mongoose.model('HOD', hodSchema);

module.exports = HOD;