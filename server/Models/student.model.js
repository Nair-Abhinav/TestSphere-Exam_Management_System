const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    sapid: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\d{11}$/.test(v);
            },
            message: props => `${props.value} is not a valid SAP ID!`
        }
    },
    Name: {
        type: String,
        required: true
    },
    RollNo: {
        type: Number,
        required: true
    },
    division: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    termTest1: {
        type: Boolean,
        required: true
    },
    termTest2: {
        type: Boolean,
        required: true
    },
    semester:{
        type: String,
        required: true
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;