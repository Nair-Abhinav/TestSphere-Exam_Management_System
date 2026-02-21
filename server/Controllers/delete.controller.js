const mongoose = require('mongoose');

/**
 * DELETE /delete/students
 * Query params:
 *   year       - SY | TY | BE
 *   examType   - normal | retest
 *   courseType - Regular | ILE | DLE | OE | Honors | Minors  (only for examType=normal)
 *
 * Collection naming:
 *   normal  → ${year}_${courseType}_Data   e.g. BE_Regular_Data
 *   retest  → ${year}_retest               e.g. BE_retest
 */
exports.deleteStudentData = async (req, res) => {
    try {
        const { year, examType, courseType } = req.query;

        if (!year || !examType) {
            return res.status(400).json({ success: false, message: 'year and examType are required.' });
        }

        let collectionName;
        if (examType === 'retest') {
            collectionName = `${year}_retest`;
        } else if (examType === 'normal') {
            if (!courseType) {
                return res.status(400).json({ success: false, message: 'courseType is required for normal exam type.' });
            }
            collectionName = `${year}_${courseType}_Data`;
        } else {
            return res.status(400).json({ success: false, message: 'examType must be "normal" or "retest".' });
        }

        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: collectionName }).toArray();

        if (collections.length === 0) {
            return res.status(404).json({ success: false, message: `Collection "${collectionName}" does not exist.` });
        }

        await db.collection(collectionName).drop();
        console.log(`Collection "${collectionName}" dropped.`);

        return res.status(200).json({ success: true, message: `Student data in "${collectionName}" deleted successfully.` });
    } catch (error) {
        console.error('Error deleting student data:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete student data.', error: error.message });
    }
};

/**
 * DELETE /delete/subjects
 * Query params:
 *   year     - SY | TY | BE
 *   semester - 3 | 4 | 5 | 6 | 7 | 8
 *
 * Collection naming → ${year}_Sem${semester}_Subjects  e.g. BE_Sem7_Subjects
 */
exports.deleteSubjectData = async (req, res) => {
    try {
        const { year, semester } = req.query;

        if (!year || !semester) {
            return res.status(400).json({ success: false, message: 'year and semester are required.' });
        }

        const collectionName = `${year}_Sem${semester}_Subjects`;
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: collectionName }).toArray();

        if (collections.length === 0) {
            return res.status(404).json({ success: false, message: `Collection "${collectionName}" does not exist.` });
        }

        await db.collection(collectionName).drop();
        console.log(`Collection "${collectionName}" dropped.`);

        return res.status(200).json({ success: true, message: `Subject data in "${collectionName}" deleted successfully.` });
    } catch (error) {
        console.error('Error deleting subject data:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete subject data.', error: error.message });
    }
};
