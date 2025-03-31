const mongoose = require('mongoose');

const GlobalTimetableSchema = new mongoose.Schema({
  year: { 
    type: String, 
    required: true,
    enum: ['SY', 'TY', 'BE']
  },
  term: { 
    type: String, 
    required: true,
    enum: ['I', 'II', 'Re-Test', 'Practical/Oral']
  },
  scheduleType: { 
    type: String, 
    required: true,
    enum: ['Theory', 'Practical']
  },
  semester: {
    type: String,
    required: true,
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  lastModifiedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Updated compound unique index to include semester
GlobalTimetableSchema.index(
  { year: 1, term: 1, scheduleType: 1, semester: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('GlobalTimetable', GlobalTimetableSchema);