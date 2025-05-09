const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  srNo: Number,
  rollNo: String,
  sapId: String,
  name: String,
  subjects: [String]
}, { 
  strict: false,  // To allow flexibility for different collection schemas
  timestamps: true
});
// This is a factory function that creates a model with a dynamic collection name
const createStudentModel = (collectionName) => {
  return mongoose.model(collectionName, studentSchema, collectionName);
};

module.exports = createStudentModel;