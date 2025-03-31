import React, { KeyboardEvent, useState } from 'react';
import axios from 'axios';

const Input = ({ type, placeholder, value, onChange, onKeyPress, className }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    className={className}
  />
);

const Button = ({ children, onClick, variant, size, className }) => (
  <button
    onClick={onClick}
    className={`${className} ${variant === 'ghost' ? 'text-red-500' : 'bg-black text-white'} ${size === 'icon' ? 'p-2' : 'p-4'
      }`}
  >
    {children}
  </button>
);

const Table = ({ children }) => <table className="table-auto w-full">{children}</table>;
const TableHeader = ({ children }) => <thead>{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr>{children}</tr>;
const TableHead = ({ children, className }) => <th className={className}>{children}</th>;
const TableCell = ({ children, className }) => <td className={className}>{children}</td>;
const Checkbox = ({ checked, onCheckedChange }) => (
  <input type="checkbox" checked={checked} onChange={onCheckedChange} className="form-checkbox" />
);

const Select = ({ children, onValueChange, value, className }) => (
  <select
    onChange={(e) => onValueChange(e.target.value)}
    value={value}
    className={`form-select ${className}`}
  >
    {children}
  </select>
);

const Trash2 = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 9.75l-.871 9.13c-.09.942-.412 1.621-.928 2.026-.516.406-1.236.594-2.129.594H8.428c-.893 0-1.613-.188-2.129-.594-.516-.405-.838-1.084-.928-2.026L4.5 9.75M10.5 12v6m3-6v6M21 6H3m4.5 0V4.5a2.25 2.25 0 012.25-2.25h4.5A2.25 2.25 0 0116.5 4.5V6m-9 0h9"
    />
  </svg>
);

export default function StudentSearch() {
  const [searchId, setSearchId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesterOpen, setSemesterOpen] = useState({});
  const [subjectOpen, setSubjectOpen] = useState({});
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const [activeTab, setActiveTab] = useState("add")


  const fetchStudentData = async (sapId) => {
    try {
      const response = await axios.get(`http://localhost:5000/students/${sapId}/?year=${selectedYear}`);
      const data = response.data;
      if (data && data.student) {
        return {
          sapId: data.student.Sap.toString(),
          name: data.student.Name,
          rollNo: data.student.RollNo,
          division: data.student.Division,
          subject: '', 
          termTest1: false, 
          termTest2: false, 
          semester: '', 
        };
      } else {
        console.log('Student data not found for SAP ID:', sapId);
        return null;
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      return null;
    }
  };
  
  const fetchSubjects = () => [
    { id: '1', name: 'Artificial Intelligence' },
    { id: '2', name: 'Data Wharehousing and Management' },
    { id: '3', name: 'Chemistry' },
  ];

  const handleSearch = async () => {
    try {
      const student = await fetchStudentData(searchId);
      if (student) {
        if (!selectedStudents.some((s) => s.sapId === student.sapId)) {
          setSelectedStudents((prevSelectedStudents) => [...prevSelectedStudents, student]);
        }
        const subjects = fetchSubjects(); 
        setSubjects(subjects);
      } else {
        alert(`No student found with SAP ID: ${searchId}`);
      }
    } catch (error) {
      console.error('Error during student search:', error);
      alert('An error occurred while searching for the student. Please try again.');
    }
  };
  

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubjectChange = (studentSapId, subjectId) => {
    setSelectedStudents((prev) =>
      prev.map((student) =>
        student.sapId === studentSapId ? { ...student, subject: subjectId } : student
      )
    );
  };

  const handleTermTestChange = (studentSapId, test) => {
    setSelectedStudents((prev) =>
      prev.map((student) =>
        student.sapId === studentSapId ? { ...student, [test]: !student[test] } : student
      )
    );
  };

  const handleDeleteStudent = (sapId) => {
    setSelectedStudents((prev) => prev.filter((student) => student.sapId !== sapId));
  };

  const handleSubmit = async () => {
    const dataToSubmit = selectedStudents.map((student) => ({
      ...student,
      subject: subjects.find((s) => s.id === student.subject)?.name || student.subject,
    }));
  
    console.log('Data to Submit:', dataToSubmit);
  
    try {
      const response = await axios.post(
        `http://localhost:5000/students/retest?year=${selectedYear}`,
        { students: dataToSubmit } 
      );
      console.log(response.data);
      if(response.status === 201){
        alert(response.data.message);
      }
    } catch (err) {
      console.error('Error during student submission:', err);
    }
  };
  
  const handleYearSelection = (year) => {
    setSelectedYear(year);
    setSelectedSemester('');
  };

  const handleBackClick = () => {
    setSelectedYear('');
    setSelectedStudents([]);
    setSearchId('');
    setSelectedSemester('');
  };

  const handleSemesterChange = (studentSapId, semester) => {
    setSelectedStudents((prev) =>
      prev.map((student) =>
        student.sapId === studentSapId ? { ...student, semester } : student
      )
    );
  };

  const getSemesterOptions = () => {
    switch (selectedYear) {
      case 'SY':
        return ['3', '4'];
      case 'TY':
        return ['5', '6'];
      case 'BE':
        return ['7', '8'];
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!selectedYear ? (
        <div className="flex flex-col w-full p-4 space-y-2">
          <h2 className="bg-black text-white p-4 mb-2 rounded-t-lg">RETEST STUDENTS</h2>
          <button
            onClick={() => handleYearSelection('SY')}
            className="w-full text-left p-4 bg-gray-200 hover:bg-gray-300 border-b border-gray-400 rounded-lg"
          >
            SECOND YEAR
          </button>
          <button
            onClick={() => handleYearSelection('TY')}
            className="w-full text-left p-4 bg-gray-200 hover:bg-gray-300 border-b border-gray-400 rounded-lg"
          >
            THIRD YEAR
          </button>
          <button
            onClick={() => handleYearSelection('BE')}
            className="w-full text-left p-4 bg-gray-200 hover:bg-gray-300 border-b border-gray-400 rounded-lg"
          >
            FOURTH YEAR
          </button>
        </div>

      ) : (
        <div>
          <div className="mb-4">
            <button
              className="bg-purple-700 text-white px-3 py-1 rounded mr-3 hover:bg-purple-800"
              onClick={handleBackClick}
            >
              Back
            </button>
          </div>
          <div className="flex justify-center items-center mb-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter SAP ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-3 rounded-md border-[1px] w-96"
              />
              <Button className="rounded-md py-2 px-5" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>
          {selectedStudents.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Semester</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">SAP ID</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Name</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Roll No</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Division</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Subject</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Term-Test I</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Term-Test II</TableHead>
                    <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedStudents.map((student) => (
                    <TableRow key={student.sapId}>
                      <TableCell className="text-center py-4 border-y-2">
                        <div className="relative inline-block text-left w-44">
                          <button
                            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            id={`semester-dropdown-${student.sapId}`}
                            aria-haspopup="true"
                            aria-expanded={semesterOpen[student.sapId] ? "true" : "false"}
                            onClick={() => setSemesterOpen(prev => ({ ...prev, [student.sapId]: !prev[student.sapId] }))}
                          >
                            {student.semester || "Select semester"}
                          </button>
                          {semesterOpen[student.sapId] && (
                            <div
                              className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`semester-dropdown-${student.sapId}`}
                            >
                              {getSemesterOptions().map((semester) => (
                                <button
                                  key={semester}
                                  onClick={() => {
                                    handleSemesterChange(student.sapId, semester);
                                    setSemesterOpen(prev => ({ ...prev, [student.sapId]: false }));
                                  }}
                                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                  role="menuitem"
                                >
                                  Semester {semester}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4 border-y-2">{student.sapId}</TableCell>
                      <TableCell className="text-center py-4 border-y-2">{student.name}</TableCell>
                      <TableCell className="text-center py-4 border-y-2">{student.rollNo}</TableCell>
                      <TableCell className="text-center py-4 border-y-2">{student.division}</TableCell>
                      <TableCell className="text-center py-4 border-y-2">
                        <div className="relative inline-block text-left w-44">
                          <button
                            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            id={`dropdown-button-${student.sapId}`}
                            aria-haspopup="true"
                            aria-expanded={subjectOpen[student.sapId] ? "true" : "false"}
                            onClick={() => setSubjectOpen(prev => ({ ...prev, [student.sapId]: !prev[student.sapId] }))}
                          >
                            {subjects.find((subject) => subject.id === student.subject)?.name || "Select subject"}
                          </button>
                          {subjectOpen[student.sapId] && (
                            <div
                              className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`dropdown-button-${student.sapId}`}
                            >
                              {subjects.map((subject) => (
                                <button
                                  key={subject.id}
                                  onClick={() => {
                                    handleSubjectChange(student.sapId, subject.id);
                                    setSubjectOpen(prev => ({ ...prev, [student.sapId]: false }));
                                  }}
                                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                  role="menuitem"
                                >
                                  {subject.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4 border-y-2">
                        <input
                          type="checkbox"
                          checked={student.termTest1}
                          onChange={() => handleTermTestChange(student.sapId, 'termTest1')}
                          className="h-5 w-5 rounded-md border-gray-300 bg-gray-100 accent-white"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4 border-y-2">
                        <input
                          type="checkbox"
                          checked={student.termTest2}
                          onChange={() => handleTermTestChange(student.sapId, 'termTest2')}
                          className="h-5 w-5 rounded-md border-gray-300 bg-gray-100 accent-white"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4 border-y-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(student.sapId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-10 flex justify-center">
                <Button className="rounded-md px-7 py-2" onClick={handleSubmit}>Submit</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

