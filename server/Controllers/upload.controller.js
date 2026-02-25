// modified version of file upload
const xlsx = require("xlsx");
const createStudentModel = require("../Models/attendance.students.model");
const mongoose = require("mongoose");
const fs = require("fs"); // Add fs for file deletion

const uploadExcel = async (req, res) => {
  let divisionFileMap = [];
  try {
    const {
      year,
      semester,
      type: courseType,
      batch,
      selectedSubjects = []
    } = req.body;

    // Parse selectedSubjects if it's a string (from JSON.stringify on frontend)
    let parsedSelectedSubjects = selectedSubjects;
    if (typeof selectedSubjects === "string") {
      try {
        parsedSelectedSubjects = JSON.parse(selectedSubjects);
      } catch (e) {
        parsedSelectedSubjects = [];
      }
    }

    // Validate required fields
    if (!year || !semester || !courseType || !batch || !req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or no files uploaded."
      });
    }

    const collectionName = `${year}_${courseType}_Data`;
    const StudentModel = createStudentModel(collectionName);
    let allStudents = [];

    // Auto map files to divisions by filename
    divisionFileMap = req.files.map(file => {
      const match = file.originalname.match(/(I1|I2|I3)/);
      const division = match ? match[1] : "UNKNOWN";
      return { division, filePath: file.path };
    });

    // Read all Excel files and accumulate students
    for (const { division, filePath } of divisionFileMap) {
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] && data[i][1] && data[i][2] && data[i][3]) {
          const student = {
            srNo: data[i][0],
            rollNo: data[i][1],
            sapId: data[i][2],
            name: data[i][3],
            division,
            semester: Number(semester),
            courseType,
            batch,
            selectedSubjects: courseType === "Regular" ? [] : [...parsedSelectedSubjects],
          };
          allStudents.push(student);
        }
      }
    }

    // Assign global serial number
    allStudents = allStudents.map((student, index) => ({
      ...student,
      globSrNo: index + 1,
    }));

    if (["ILE", "DLE", "OE"].includes(courseType)) {
      // Update or insert for elective types
      let updatedCount = 0;
      let newCount = 0;

      for (const student of allStudents) {
        const existing = await StudentModel.findOne({ sapId: student.sapId });

        if (existing) {
          const newSubjects = student.selectedSubjects.filter(
            subj => !existing.selectedSubjects.includes(subj)
          );

          if (newSubjects.length > 0) {
            await StudentModel.updateOne(
              { sapId: student.sapId },
              { $addToSet: { selectedSubjects: { $each: newSubjects } } }
            );
            updatedCount++;
          }
        } else {
          await StudentModel.create(student);
          newCount++;
        }
      }

      // Clean up uploaded files
      divisionFileMap.forEach(({ filePath }) => {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      });

      return res.status(200).json({
        success: true,
        message: `Elective upload successful for ${collectionName}. Updated: ${updatedCount}, New: ${newCount}`,
      });
    } else {
      // Overwrite for Regular type
      const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        await mongoose.connection.db.dropCollection(collectionName);
      }

      await StudentModel.insertMany(allStudents);

      // Clean up uploaded files
      divisionFileMap.forEach(({ filePath }) => {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      });

      return res.status(200).json({
        success: true,
        message: `Regular upload successful. Inserted ${allStudents.length} records into ${collectionName}`,
      });
    }

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  } finally {
    // Ensure files are deleted even if error occurs
    if (divisionFileMap && divisionFileMap.length > 0) {
      divisionFileMap.forEach(({ filePath }) => {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      });
    }
  }
};

module.exports = {
  uploadExcel,
};
