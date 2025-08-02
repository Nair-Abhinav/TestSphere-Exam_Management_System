# TestSphere - Academic Management System

A comprehensive academic management solution designed to streamline examination processes for educational departments. TestSphere facilitates timetable management, student data management, exam seating arrangements, and verification workflows between different stakeholders.

## Screenshots

### Main Dashboard

*Main dashboard showing overview of all modules*  
<img src="https://github.com/user-attachments/assets/f0534cc3-8e12-45be-91b7-11ea6dc7fa49" alt="Screenshot 2025-08-02 123118" width="70%" />

<br>

<img src="https://github.com/user-attachments/assets/01205787-ba2a-4478-a68c-93d86cc59382" alt="Screenshot 2025-08-02 123134" width="70%" />

### Timetable Management

*Creating and managing examination timetables*  
<img src="https://github.com/user-attachments/assets/8c9211fb-836c-45ec-94eb-50e5f8102821" alt="Screenshot 2025-08-02 123214" width="70%" />

<br>

*Sample generated timetable PDF output*  
<img src="https://github.com/user-attachments/assets/392c3011-1b99-4661-ad99-4aff1e02daf5" alt="Screenshot 2025-08-02 130413" width="40%" />


### Exam Seating Arrangements

*Classroom seating arrangement generation*  
<img src="https://github.com/user-attachments/assets/7e037472-e5e4-4dd0-9941-92a8f3a91681" alt="Screenshot 2025-08-02 123247" width="70%" />



## Features

- **Timetable Management**: Create, edit, and export examination timetables
- **Student Data Upload**: Batch upload student information using Excel files
- **Seating Arrangements**: Generate classroom and seat allocation plans
- **Attendance Sheets**: Create attendance sheets with student details
- **HOD Verification System**: Approval workflow for retest applications
- **PDF Generation**: Export all data in standardized PDF formats for official use
- **Multi-Year Support**: Handles different academic years (SY, TY, BE)
- **Course Type Management**: Support for Regular, ILE, DLE, OE, Honors, and Minors courses

## Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Lucide React for icons
- React Toastify for notifications
- React-datepicker for date handling

### Backend
- Node.js with Express
- MongoDB for database
- Multer for file uploads

### PDF Generation
- jsPDF with jsPDF-autotable
- Custom PDF templates for institutional formats

### API Client
- Axios for HTTP requests

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nair-Abhinav/fsd.git
   cd fsd
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/testsphere
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the development servers**
   
   Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
   
   Start the frontend development server (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

## Module Overview

### Timetable Management
The Timetable module allows for:
- Creating examination schedules for different years and semesters
- Adding theory exam schedules with dates, times, and subjects
- Managing practical/oral exam schedules with batches and venues
- Generating professional PDF timetables with institutional headers and signatures
- Saving and retrieving timetable data

### Exam Seating Arrangements
This module provides:
- Classroom allocation for different exam types
- Student seating distribution across available classrooms
- Generation of attendance sheets for supervisors
- Seat allocation notices for students
- Classroom layout visualization

### Student Data Management
This component enables:
- Excel file upload for student data
- Support for multiple student categories (Regular, ILE, DLE, OE)
- Semester and division-based organization
- Verification of data integrity and format

### HOD Verification System
This workflow includes:
- Viewing student retest applications by year
- Verifying eligible students for retests
- Generating retest sheets with verified students
- Official documentation with institutional signatures

## API Documentation

The application interacts with several API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subjects` | GET | Get subjects by semester and course type |
| `/api/timetable` | POST/GET | Save and retrieve timetable data |
| `/api/attendance` | GET | Get student attendance data for arrangements |
| `/upload` | POST | Upload student Excel data |
| `/students/retest` | GET | Get students eligible for retests |
| `/hod/verify-students` | PUT | Update verification status |
| `/hod/retest/register` | POST | Register verified students for retests |

## PDF Generation Features

The application generates several types of PDF documents:

### 1. Exam Timetables
- Theory exam schedules with dates, times, subjects
- Practical/Oral schedules with batches and venues
- Institutional headers and authorized signatures

### 2. Attendance Sheets
- Student information with SAP IDs and names
- Signature spaces for recording attendance
- Block and classroom information
- Supervisor instructions and summary sections

### 3. Seating Arrangements
- Classroom-wise seating allocations
- Student distribution across venues
- Official notice format for student reference

### 4. Retest Reports
- List of students approved for retests
- Subject and test details
- Authorized by department heads and coordinators

## Project Structure

```
fsd/
├── client/                 # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling files
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend Node.js application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Server utilities
│   ├── package.json
│   └── server.js
├── screenshots/           # Project screenshots
└── README.md
```

## Contributors
- [Abhinav Nair](https://github.com/Nair-Abhinav)
- [Diksha Velhal](https://github.com/dikshavelhal)
- [Amit Upadhyay](https://github.com/Celestial-Rouge/)
