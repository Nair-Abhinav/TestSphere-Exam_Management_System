const xlsx = require('xlsx');
const createStudentModel = require('../Models/attendance.students.model');
const mongoose = require('mongoose');

const uploadExcel = async (req, res) => {
  try {
    // Get form data
    const { year, semester, division, type, subject } = req.body;
    
    // Create dynamic collection name
    const collectionName = `${year}_Sem${semester}_${division}_${type}`;
    
    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    // Extract student data (assuming data starts from row 8 based on screenshot)
    const students = [];
    for (let i = 7; i < data.length; i++) {
      if (data[i][0] && data[i][1] && data[i][2] && data[i][3]) {
        const studentData = {
          srNo: data[i][0],
          rollNo: data[i][1],
          sapId: data[i][2],
          name: data[i][3]
        };
        // Add subjects array for ILE, DLE, OE types
        if (['ILE', 'DLE', 'OE'].includes(type) && subject) {
          studentData.subjects = [subject];
        }
        
        students.push(studentData);
      }
    }
    
    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid student data found in the excel file' });
    }
    
    // Get the student model with dynamic collection name
    const StudentModel = createStudentModel(collectionName);
    
    // Special handling for ILE, DLE, OE types
    if (['ILE', 'DLE', 'OE'].includes(type) && subject) {
      // Check if collection exists
      const collections = await mongoose.connection.db.listCollections({name: collectionName}).toArray();
      const collectionExists = collections.length > 0;
      
      if (collectionExists) {
        // Collection exists - update each student record
        let updatedCount = 0;
        let newCount = 0;
        
        for (const student of students) {
          // Find student by SAP ID
          const existingStudent = await StudentModel.findOne({ sapId: student.sapId });
          
          if (existingStudent) {
            // Student exists - add subject if not already present
            if (!existingStudent.subjects.includes(subject)) {
              await StudentModel.updateOne(
                { sapId: student.sapId },
                { $addToSet: { subjects: subject } }
              );
              updatedCount++;
            }
          } else {
            // Student doesn't exist - create new record
            await StudentModel.create(student);
            newCount++;
          }
        }
        
        res.status(200).json({
          success: true,
          message: `Updated ${updatedCount} existing students and added ${newCount} new students in ${collectionName} collection with subject ${subject}`
        });
      } else {
        // Collection doesn't exist - create and add all students
        await StudentModel.insertMany(students);
        
        res.status(200).json({
          success: true,
          message: `Created ${collectionName} collection with ${students.length} students for subject ${subject}`
        });
      }
    } else {
      // Regular type - create collection and add students
      // Check if collection exists first
      const collections = await mongoose.connection.db.listCollections({name: collectionName}).toArray();
      if (collections.length > 0) {
        // Drop existing collection for regular types
        await mongoose.connection.db.dropCollection(collectionName);
      }
      
      // Create new collection with students
      await StudentModel.insertMany(students);
      
      res.status(200).json({
        success: true,
        message: `Added ${students.length} students to ${collectionName} collection`
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing file', 
      error: error.message 
    });
  }
};


module.exports = {
  uploadExcel
};