const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME;

exports.getSubjectsBySemesterAndType = async (semester, coursetype) => {
    try {

        if(!semester) {
            throw new Error('Semester and course type are required');
        }
        await client.connect();
        const db = client.db(dbName);
        const subjectCollection = db.collection(semester);
        // Use the existing mongoose connection
        // const db = mongoose.connection.db;
        // const collection = db.collection(semester);
        
        let query = {};
        switch (coursetype) {
            case 'Regular':
                query = { Regular: 1 };
                break;
            case 'ILE':
                query = { ILE: { $gt: 0 } };
                break;
            case 'DLE':
                query = { DLE: { $gt: 0 } };
                break;
            case 'OE':
                query = { OE: { $gt: 0 } };
                break;
            case 'Honors_Minors':
                query = { Honors_Minors: 1 };
                break;
            default:
                query = {};
        }
        const projection = { _id: 0, Subject: 1 , SubCode : 1};
        const subjects = await subjectCollection.find(query, { projection }).toArray();
        console.log("Subjects found:", subjects);
        return subjects;
    } catch (error) {
        console.error("Error fetching subjects:", error);
        throw error;
    }
};