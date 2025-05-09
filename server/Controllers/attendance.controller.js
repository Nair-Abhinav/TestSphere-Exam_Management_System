const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "Information_Technology";

exports.getAttendance = async (year, sem,courseType) => {
    if (!year) {
        throw new Error('Year is required');
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        // const yearCollection = db.collection(`${year}_Sem${sem}_${division}_${courseType}`);
        const yearCollection = db.collection(year)
        const subjectCollection = db.collection(`Sem${sem}_Subjects`);
        console.log("Year:", year, "Sem:", sem, "Course Type:", courseType || "Not specified");

        let data = [];

        if (courseType === 'Regular') {
            // Fetch all students if courseType is 'Regular'
            console.log("Fetching all students for Regular course type");
            data = await yearCollection
                .find({}, { projection: { _id: 0 } })
                .sort({ SrNo: 1 })
                .toArray();
        } else if (courseType === 'DLE' || courseType === 'ILE' || courseType === 'OE' ) {
            console.log(`Fetching students for course type: ${courseType}`);
            // Fetch students where courseType has a value > 0
            const students = await yearCollection
                .find({ [courseType]: { $gt: 0 } }, { projection: { _id: 0 } })
                .sort({ [courseType]: 1, SrNo: 1 }) // Sorting by courseType and then SrNo
                .toArray();
            
            console.log(`Found ${students.length} students for ${courseType}`);
            
            if (!students.length) {
                console.log(`No students found for Year: ${year}, Course Type: ${courseType}`);
                return [];
            }
        
            for (let student of students) {
                const courseValue = student[courseType];
                if (courseValue) {
                    const subjectData = await subjectCollection.findOne(
                        { [courseType]: courseValue }, 
                        { projection: { _id: 0, SubCode: 1, Subject: 1 } }
                    );
                    if (subjectData) {
                        student.SubCode = subjectData.SubCode || "Not Found";
                        student.Subject = subjectData.Subject || "Not Found";
                    } else {
                        student.SubCode = "Not Found";
                        student.Subject = "Not Found";
                    }
                }
            }
            data = students;
        } else {
            console.log("Invalid courseType provided. Returning empty data.");
        }

        console.log(`Found ${data.length} records`);

        return data;
    } catch (error) {
        console.error("Error fetching or sorting attendance:", error);
        throw error;
    } finally {
        try {
            await client.close();
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }
};

exports.getAttendanceMinors = async (year) => {
    if (!year) {
        throw new Error('Year is required');
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const collections = db.collection(`${year}_Minors`);
        
        await collections.createIndex({ Sr_No: 1 });
        console.log("Year:", year);
        
        const data = await collections
            .find(
                {},
                { projection: { _id: 0 } }
            )
            .sort({ Sr_No: 1 })
            .toArray();

        console.log(`Found ${data.length} Minors records`);
        return data;
    } catch (error) {
        console.error("Error fetching minors attendance:", error);
        throw error;
    } finally {
        try {
            await client.close();
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }
};

exports.getAttendanceHonors = async (year) => {
    if (!year) {
        throw new Error('Year is required');
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const collections = db.collection(year);
        
        await collections.createIndex({ Sr_No: 1, Honors_Minors: 1 });
        console.log("Year:", year);
        
        const data = await collections
            .find(
                { Honors_Minors: 1 },
                { projection: { _id: 0 } }
            )
            .sort({ Sr_No: 1 })
            .toArray();

        console.log(`Found ${data.length} Honors records`);
        return data;
    } catch (error) {
        console.error("Error fetching honors attendance:", error);
        throw error;
    } finally {
        try {
            await client.close();
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }
};