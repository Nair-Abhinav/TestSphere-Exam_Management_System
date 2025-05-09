const { validationResult } = require('express-validator');
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME;

exports.registerStudents = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    await client.connect();
    const db = client.db(dbName);
    const year = req.query.year;

    if (!year) {
        return res.status(400).json({ message: 'Year query parameter is required' });
    }

    console.log('Request Body:', req.body);
    const students = req.body.students;
    const studentCollection = db.collection(`${year}_retest`);
    let addedCount = 0;

    for (const student of students) {
        const { sapId, subject } = student;

        // Check if the student with sapId and subject exists
        const existingStudent = await studentCollection.findOne({ sapId, subject });

        if (!existingStudent) {
            // Add the student as a new record
            await studentCollection.insertOne(student);
            addedCount++;
        }
    }

    res.status(201).json({
        message: `${addedCount} students were added successfully.`,
        added: addedCount,
    });
};

// Controller to update students
exports.updateStudents = async (req, res) => {
    console.log("Inside updateStudents");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    await client.connect();
    const db = client.db(dbName);
    const year = req.query.year;

    if (!year) {
        return res.status(400).json({ message: 'Year query parameter is required' });
    }

    console.log('Request Body:', req.body);
    const students = req.body.students;
    const studentCollection = db.collection(`${year}_retest`);
    let updatedCount = 0;

    for (const student of students) {
        const { sapId,subject,termTest1, termTest2, name } = student;

        // Check if the student with sapId and subject exists
        const existingStudent = await studentCollection.findOne({ sapId, subject });

        if (existingStudent) {
            // Update all fields that might have changed
            await studentCollection.updateOne(
                { sapId, subject },
                { $set: {termTest1, termTest2 } }
            );
            updatedCount++;
        }
    }

    res.status(200).json({
        message: `${updatedCount} students were updated successfully.`,
        updated: updatedCount,
    });
};


exports.getAllRetestStudents = async (req, res) => {
    await client.connect();
    const db = client.db(dbName);
    const year = req.query.year;

    if (!year) {
        return res.status(400).json({ message: 'Year parameter is required' });
    }

    const studentCollection = db.collection(`${year}_retest`);
    const students = await studentCollection.find({}).toArray();

    res.status(200).json({ students });
};

exports.getRetestStudentsBySubject = async (req, res) => {
    await client.connect();
    const db = client.db(dbName);
    const subject = req.params.subject;
    const year = req.query.year;
    if (!year) {
        return res.status(400).json({ message: 'Year query parameter is required' });
    }else if (!subject) {
        return res.status(400).json({ message: 'Subject query parameter is required' });
    }
    const studentCollection = db.collection(`${year}_retest`);
    const students = await studentCollection.find({subject:subject}).toArray();
    res.status(201).json({ students });
}
exports.getStudent = async (req, res) => {
    await client.connect();
    const db = client.db(dbName);
    const sapId = Number(req.params.sapId);
    const year = req.query.year;

    if (!year) {
        return res.status(400).json({ message: 'Year parameter is required' });
    }

    const studentCollection = db.collection(year);
    const student = await studentCollection.findOne({ Sap:sapId });

    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ student });
}


exports.deleteStudent = async (req, res) => {
    console.log('Inside deleteStudent');
    await client.connect();
    const db = client.db(dbName);
    const sapId = req.params.sapId; // Keep as string
    const subject = req.query.subject; 
    const year = req.query.year;

    console.log('SAP ID:', sapId);
    console.log('Year:', year);
    console.log('Subject:', subject);

    if (!year) {
        return res.status(400).json({ message: 'Year query parameter is required' });
    }

    if (!subject) {
        return res.status(400).json({ message: 'Subject query parameter is required' });
    }

    const studentCollection = db.collection(`${year}_retest`);

    try {
        const result = await studentCollection.deleteOne({ 
            sapId: sapId,  // Use sapId as string
            subject: subject 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Student not found or already deleted' });
        }
        res.status(200).json({ message: `Student with SAP ID ${sapId} for subject ${subject} deleted successfully` });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'An error occurred while deleting the student', error });
    }
};