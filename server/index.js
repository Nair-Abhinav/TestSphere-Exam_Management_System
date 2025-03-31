const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const connectDb = require('./db/connection');
const subjectRoutes = require('./Routes/subject.routes');
const attendanceRoutes = require('./Routes/attendance.routes');
const teacherRoutes = require('./Routes/teacher.routes');
const cookieParser = require('cookie-parser');
const hodRoutes = require('./Routes/hod.routes');
const adminRoutes = require('./Routes/admin.routes');
const studentRoutes = require('./Routes/student.routes');
const timetableRoutes = require('./Routes/timetable.routes');
const cors = require('cors');

const startServer = async () => {
    try {
        await connectDb();
        app.use(express.json());
        app.use(cors({
            origin: ['https://fsdfrontend-tau.vercel.app'], // Your frontend URL
            credentials: true,               // Allow credentials
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
          }));
        app.use(cookieParser());
        app.use('/api', subjectRoutes);
        app.use('/api', attendanceRoutes);
        app.use('/teachers', teacherRoutes);
        app.use('/hod',hodRoutes);
        app.use('/admin',adminRoutes);
        app.use('/students',studentRoutes);
        app.use('/api',timetableRoutes)
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