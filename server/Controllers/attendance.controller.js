const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "Information_Technology";

exports.getAttendance = async (year, sem, courseType, selectedSubjects = []) => {
    if (!year) {
        throw new Error('Year is required');
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const yearCollection = db.collection(`${year}_${courseType}_Data`);
        const subjectCollection = db.collection(`Sem${sem}_Subjects`);
        console.log("Year:", year, "Sem:", sem, "Course Type:", courseType || "Not specified");

        let data = [];

        if (courseType === 'Regular') {
            // Fetch all students for Regular, sorted by globSrNo and division, exclude createdAt, updatedAt, __v
            console.log("Fetching all students for Regular course type");
            data = await yearCollection
                .find({}, { projection: { createdAt: 0, updatedAt: 0, __v: 0, _id: 0 } })
                .sort({ globSrNo: 1, division: 1 })
                .toArray();
        } else if (courseType === 'DLE' || courseType === 'ILE' || courseType === 'OE') {
            // New logic for electives with subject filtering and ordering
            // selectedSubjects should be an array of subject names (from frontend)
            // If selectedSubjects is a string (from query), parse it
            let subjectsArray = selectedSubjects;
            if (typeof selectedSubjects === "string") {
                try {
                    subjectsArray = JSON.parse(selectedSubjects);
                } catch (e) {
                    subjectsArray = [];
                }
            }
            if (!Array.isArray(subjectsArray) || subjectsArray.length === 0) {
                // If no subjects provided, return empty
                return [];
            }

            let allStudents = [];
            for (const subject of subjectsArray) {
                // Find students who have this subject in their selectedSubjects array
                const students = await yearCollection
  .find(
    { selectedSubjects: { $elemMatch: { $regex: `^\\s*${subject.trim()}\\s*$`, $options: 'i' } } },
    { projection: { createdAt: 0, updatedAt: 0, __v: 0, _id: 0 } }
  )
  .sort({ selectedSubjects: 1, globSrNo: 1, division: 1 })
  .toArray();
                // Attach a helper property for sorting/grouping if needed
                students.forEach(s => { s.selectedSubject = subject; });
                allStudents = allStudents.concat(students);
            }
            // Optionally, sort again to ensure order: by subject (as per selectedSubjects), then globSrNo, then division
            allStudents.sort((a, b) => {
                const subjA = subjectsArray.indexOf(a.selectedSubject);
                const subjB = subjectsArray.indexOf(b.selectedSubject);
                if (subjA !== subjB) return subjA - subjB;
                if (a.division !== b.division) return a.division.localeCompare(b.division);
                return a.globSrNo - b.globSrNo;
            });
            data = allStudents;
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
        console.log("Year:",year);
        
        const data = await collections
            .find(
                {},
                { projection: { _id: 0 } }
            )
            .sort({ SrNo: 1 })
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
        console.log("Inside getAttendanceHonors function");
        await client.connect();
        const db = client.db(dbName);
        const collections = db.collection(`${year}_HONOR_Data`);
        console.log(collections + "collection for honors");
        console.log(`Year:${year.trim()}`);
        
        const data = await collections
    .find({}, { projection: { _id: 0 } })
    .sort({ globSrNo: 1 })
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