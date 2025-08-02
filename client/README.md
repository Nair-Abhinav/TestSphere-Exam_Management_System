# TestSphere Department Project - Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Setup Instructions](#setup-instructions)
5. [Module Overview](#module-overview)
   - [Timetable Management](#timetable-management)
   - [Exam Seating Arrangements](#exam-seating-arrangements)
   - [Student Data Management](#student-data-management)
   - [HOD Verification System](#hod-verification-system)
6. [API Documentation](#api-documentation)
7. [PDF Generation Features](#pdf-generation-features)
8. [Contributors](#contributors)

## Introduction

TestSphere is a comprehensive academic management solution designed to streamline examination processes for educational departments. It facilitates timetable management, student data management, exam seating arrangements, and verification workflows between different stakeholders.

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

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF with jsPDF-autotable
- **API Client**: Axios
- **Date Handling**: React-datepicker
- **Icons**: Lucide React
- **Notifications**: React Toastify

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Nair-Abhinav/fsd.git
```

2. Install dependencies for client
```bash
cd client
npm install
```

3. Install dependencies for server
```bash
cd ../server
npm install
```

4. Start the development server
```bash
# Start client
cd client
npm run dev

# Start server (in another terminal)
cd server
npm run dev
```

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

- `/api/subjects` - Get subjects by semester and course type
- `/api/timetable` - Save and retrieve timetable data
- `/api/attendance` - Get student attendance data for arrangements
- `/upload` - Upload student Excel data
- `/students/retest` - Get students eligible for retests
- `/hod/verify-students` - Update verification status
- `/hod/retest/register` - Register verified students for retests

## PDF Generation Features

The application generates several types of PDF documents:

1. **Exam Timetables**
   - Theory exam schedules with dates, times, subjects
   - Practical/Oral schedules with batches and venues
   - Institutional headers and authorized signatures

2. **Attendance Sheets**
   - Student information with SAP IDs and names
   - Signature spaces for recording attendance
   - Block and classroom information
   - Supervisor instructions and summary sections

3. **Seating Arrangements**
   - Classroom-wise seating allocations
   - Student distribution across venues
   - Official notice format for student reference

4. **Retest Reports**
   - List of students approved for retests
   - Subject and test details
   - Authorized by department heads and coordinators
