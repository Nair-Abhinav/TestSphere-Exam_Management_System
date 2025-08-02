const mongoose = require('mongoose');

exports.uploadSubject = async (req, res) => {
    try {
        const { year, semester, subjectDoc } = req.body;
        if (!year || !semester || !subjectDoc) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Fix: Clean up keys in subjectDoc to be MongoDB-safe
        const fixedSubjectDoc = {};
        Object.keys(subjectDoc).forEach(key => {
            // Remove trailing dots and replace all non-alphanumeric (except underscore) with underscore
            let newKey = key.replace(/\.+$/, '').replace(/[^\w]/g, '_');
            // Prevent empty keys
            if (newKey.length === 0) newKey = "Field";
            fixedSubjectDoc[newKey] = subjectDoc[key];
        });

        const collectionName = `${year}_Sem${semester}_Subjects`;
        const SubjectCollection = mongoose.connection.collection(collectionName);

        const last = await SubjectCollection.find().sort({ "Sr_ No_": -1 }).limit(1).toArray();
        const nextSrNo = last.length > 0 ? (last[0]["Sr_ No_"] || 0) + 1 : 1;

        const docToInsert = {
            "Sr_ No_": nextSrNo,
            ...fixedSubjectDoc
        };

        await SubjectCollection.insertOne(docToInsert);

        return res.status(200).json({ success: true, message: "Subject uploaded successfully" });
    } catch (error) {
        console.error("Subject upload error:", error);
        return res.status(500).json({ success: false, message: "Failed to upload subject", error: error.message });
    }
};
