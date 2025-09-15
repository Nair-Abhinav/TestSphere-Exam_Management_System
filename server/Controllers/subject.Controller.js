const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME;

exports.getSubjectsBySemesterAndType = async (year, semester, coursetype) => {
    try {
        if(!year || !semester) {
            throw new Error('Year and semester are required');
        }
        await client.connect();
        const db = client.db(dbName);
        // Collection name format: BE_Sem7_Subjects
        const collectionName = `${year}_Sem${semester}_Subjects`;
        const subjectCollection = db.collection(collectionName);
        
        let query = {};
        if (coursetype && coursetype !== "") {
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
        }
        // If coursetype is not provided or empty, query remains {}
        const projection = { _id: 0, Subject: 1 , SubCode : 1};
        const subjects = await subjectCollection.find(query, { projection }).toArray();
        console.log("Subjects found:", subjects);
        return subjects;
    } catch (error) {
        console.error("Error fetching subjects:", error);
        throw error;
    }
};