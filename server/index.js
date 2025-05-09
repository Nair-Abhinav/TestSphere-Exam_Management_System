const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const path = require('path');
const connectDb = require('./db/connection');
const subjectRoutes = require('./Routes/subject.routes');
const attendanceRoutes = require('./Routes/attendance.routes');
const teacherRoutes = require('./Routes/teacher.routes');
const cookieParser = require('cookie-parser');
const hodRoutes = require('./Routes/hod.routes');
const adminRoutes = require('./Routes/admin.routes');
const studentRoutes = require('./Routes/student.routes');
const timetableRoutes = require('./Routes/timetable.routes');
const uploadRoutes = require('./Routes/upload.routes'); // New route for upload feature
const cors = require('cors');

const startServer = async () => {
    try {
        await connectDb();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true })); // For parsing form data
        app.use(cors({
            origin: ['https://fsdfrontend-tau.vercel.app', 'http://localhost:5173'], // Added localhost for testing
            credentials: true,               // Allow credentials
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        app.use(cookieParser());

        // Static folder for uploads (for development testing)
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        // Existing routes
        app.use('/api', subjectRoutes);
        app.use('/api', attendanceRoutes);
        app.use('/teachers', teacherRoutes);
        app.use('/hod', hodRoutes);
        app.use('/admin', adminRoutes);
        app.use('/students', studentRoutes);
        app.use('/api', timetableRoutes);
        
        // New upload route
        app.use('/upload', uploadRoutes);

        // Basic route for testing
        app.get('/', (req, res) => {
            res.send('API is running');
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();