import React, { useState, useEffect } from 'react';
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
    className={`${className} ${variant === 'ghost' ? 'text-red-500' : 'bg-black text-white'} ${size === 'icon' ? 'p-2' : 'p-4'}`}
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
  const [selectedYear, setSelectedYear] = useState('');
  const [activeTab, setActiveTab] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [searchId, setSearchId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [verifiedYears, setVerifiedYears] = useState([]);

  useEffect(() => {
    const fetchVerifiedYears = async () => {
      try {
        const response = await axios.get('http://localhost:5000/hod/verified-years');
        setVerifiedYears(response.data.verifiedYears);
      } catch (error) {
        console.error('Error fetching verified years:', error);
      }
    };

    fetchVerifiedYears();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedYear && selectedSemester) {
      switch (activeTab) {
        case "view":
          fetchStudentDataBasedOnSubject();
          break;
        case "edit":
          fetchStudentDataBasedOnSubject();
          break;
        default:
          break;
      }
    }
  }, [activeTab, selectedSubject, selectedYear, selectedSemester]);

  const handleSelectSubject = async (e) => {
    try {
      const semester = `Sem${selectedSemester}_Subjects`;
      const response = await axios.get(`http://localhost:5000/api/subjects?semester=${semester}`);
      const subjectsData = response.data.data;
      if (Array.isArray(subjectsData)) {
        const subjectsArray = subjectsData.map((subject) => subject.Subject);
        setSubjects(subjectsArray);
      } else {
        console.error('Expected an array but received:', subjectsData);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudentDataBasedOnSubject = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/students/retest/${selectedSubject}?year=${selectedYear}`);
      const data = response.data;
      if (data && data.students) {
        const formattedStudents = data.students.map((student) => ({
          id: student._id,
          sapId: student.sapId,
          name: student.name,
          rollNo: student.rollNo,
          division: student.division,
          subject: student.subject,
          termTest1: student.termTest1,
          termTest2: student.termTest2,
          semester: student.semester,
        }));
        setStudents(formattedStudents);
      } else {
        console.log('Student data not found');
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setStudents([]);
    }
  };

  const handleYearSelection = (year) => {
    setSelectedYear(year);
  };

  const handleBackClick = () => {
    setSelectedYear('');
    setSelectedSubject('');
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value)
    setActiveTab("view")
  };

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
          subject: data.student.Subject,
          termTest1: false,
          termTest2: false,
          semester: data.student.Semester,
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

  const handleSearch = async () => {
    try {
      const student = await fetchStudentData(searchId);
      if (student) {
        if (!selectedStudents.some((s) => s.sapId === student.sapId)) {
          setSelectedStudents((prevSelectedStudents) => [...prevSelectedStudents, student]);
        }
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

  const handleTermTestChange = (studentSapId, test) => {
    setSelectedStudents((prev) =>
      prev.map((student) =>
        student.sapId === studentSapId ? { ...student, [test]: !student[test] } : student
      )
    );
  };

  const handleDeleteStudentEdit = async (studentId, sapId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/students/retest/${sapId}`, {
        params: {
          subject: selectedSubject,
          year: selectedYear
        }
      });

      setStudents(students.filter(student => student.id !== studentId));

      alert(response.data.message);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleDeleteStudent = (sapId) => {
    setSelectedStudents((prev) => prev.filter((student) => student.sapId !== sapId));
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    const dataToSubmit = selectedStudents.map((student) => ({
      sapId: student.sapId,
      name: student.name,
      rollNo: student.rollNo,
      division: student.division,
      subject: selectedSubject,
      termTest1: student.termTest1,
      termTest2: student.termTest2,
      semester: selectedSemester
    }));

    try {
      const response = await axios.post(
        `http://localhost:5000/students/retest/register?year=${selectedYear}`,
        { students: dataToSubmit }
      );

      if (response.status === 201) {
        alert(response.data.message);
        setSelectedStudents([]);
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join('\n');
        alert(`Validation Errors:\n${errorMessages}`);
      } else {
        console.error('Error during student registration:', error);
        alert('An error occurred during student registration');
      }
    }
  };

  const handleSubmitEdit = async () => {
    if (students.length === 0) {
      alert('Please select at least one student');
      return;
    }

    const dataToSubmit = students.map((student) => ({
      sapId: student.sapId,
      name: student.name,
      rollNo: student.rollNo,
      division: student.division,
      subject: selectedSubject,
      termTest1: student.termTest1,
      termTest2: student.termTest2,
      semester: selectedSemester
    }));

    try {
      console.log('Payload:', { students: dataToSubmit });
      const response = await axios.put(
        `http://localhost:5000/students/retest/update?year=${selectedYear}`,
        { students: dataToSubmit }
      );

      if (response.status === 200) {
        alert(response.data.message);
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }

      if (error.response && error.response.data.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join('\n');
        alert(`Validation Errors:\n${errorMessages}`);
      } else {
        console.error('Error during student registration:', error);
        alert('An error occurred during student registration');
      }
    }
  };

  const handleCheckboxChange = (sapId, testNumber) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.sapId === sapId
          ? {
            ...student,
            [testNumber]: !student[testNumber],
          }
          : student
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto p-4">
      {!selectedYear ? (
        <div className="flex flex-col w-full p-4 space-y-3">
          <h2 className="bg-black text-white px-6 py-4 rounded-t-lg font-semibold tracking-wide text-lg flex items-center">
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            RETEST STUDENTS
          </h2>

          {[
            { year: 'SY', label: 'SECOND YEAR' },
            { year: 'TY', label: 'THIRD YEAR' },
            { year: 'BE', label: 'FOURTH YEAR' }
          ].map((item) => (
            <button
              key={item.year}
              onClick={() => handleYearSelection(item.year)}
              className="group w-full p-4 bg-gray-200 rounded-lg border border-gray-300
                       hover:bg-gray-300 active:bg-gray-400 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-gray-400
                       flex items-center justify-between"
            >
              <span className="font-medium m-2">{item.label}</span>
              <svg
                className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {verifiedYears.includes(selectedYear) && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">HOD Verification: </strong>
              <span className="block sm:inline">
                HOD has verified {selectedYear} retest students
              </span>
            </div>
          )}
          <div className="mb-4">
            <button
              className="bg-purple-700 text-white px-3 py-1 rounded mr-3 hover:bg-purple-800"
              onClick={handleBackClick}
            >
              Back
            </button>
          </div>
          <div className="flex justify-center items-center mb-4">
            <select
              className="w-full p-2 border rounded"
              value={selectedSemester}
              onChange={handleSemesterChange}
            >
              <option value="">Select a semester</option>
              {getSemesterOptions().map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center items-center mb-4">
            <select
              className="w-full p-2 border rounded"
              value={selectedSubject}
              onClick={handleSelectSubject}
              onChange={handleSubjectChange}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          {selectedSubject && (
            <div>
              <div className="mb-4">
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${activeTab === "view" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-blue-600"}`}
                    onClick={() => handleTabChange("view")}
                  >
                    View Students
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${activeTab === "edit" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-blue-600"}`}
                    onClick={() => handleTabChange("edit")}
                  >
                    Edit Students
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${activeTab === "add" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-blue-600"
                      }`}
                    onClick={() => setActiveTab("add")}
                  >
                    Add New Students
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
                {activeTab === "view" && (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2">Semester</th>
                        <th className="px-4 py-2">SAP ID</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Roll No</th>
                        <th className="px-4 py-2">Division</th>

                        <th className="px-4 py-2">Subject</th>
                        <th className="px-4 py-2">Term Test I</th>
                        <th className="px-4 py-2">Term Test II</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b">

                          <td className="px-4 py-2 text-center">{student.semester}</td>
                          <td className="px-4 py-2 text-center">{student.sapId}</td>
                          <td className="px-4 py-2 text-center">{student.name}</td>
                          <td className="px-4 py-2 text-center">{student.rollNo}</td>
                          <td className="px-4 py-2 text-center">{student.division}</td>
                          <td className="px-4 py-2 text-center">{student.subject}</td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={student.termTest1}
                              disabled
                              className="h-5 w-5 rounded-md border-gray-300 bg-gray-100 accent-white"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={student.termTest2}
                              disabled
                              className="h-5 w-5 rounded-md border-gray-300 bg-gray-100 accent-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {activeTab === "edit" && (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">

                        <th className="px-4 py-2">Semester</th>
                        <th className="px-4 py-2">SAP ID</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Roll No</th>
                        <th className="px-4 py-2">Division</th>
                        <th className="px-4 py-2">Subject</th>
                        <th className="px-4 py-2">Term Test I</th>
                        <th className="px-4 py-2">Term Test II</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="px-4 py-2 text-center">{student.semester}</td>
                          <td className="px-4 py-2 text-center">{student.sapId}</td>
                          <td className="px-4 py-2 text-center">{student.name}</td>
                          <td className="px-4 py-2 text-center">{student.rollNo}</td>
                          <td className="px-4 py-2 text-center">{student.division}</td>
                          <td className="px-4 py-2 text-center">{student.subject}</td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={student.termTest1}
                              onChange={() => handleCheckboxChange(student.sapId, "termTest1")}
                              className="h-5 w-5 rounded-md border-gray-300 bg-gray-100 accent-white"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={student.termTest2}
                              onChange={() => handleCheckboxChange(student.sapId, "termTest2")}
                              className="h-5 w-5 rounded-md border-gray-300 bg-gray-100 accent-white"
                            />
                          </td>
                          <td className="text-center py-4 border-y-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStudentEdit(student.id, student.sapId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <div className="mt-10 flex justify-center">
                      <Button className="rounded-md px-7 py-2" onClick={handleSubmitEdit}>Submit</Button>
                    </div>
                  </table>

                )}

                {activeTab === "add" && (
                  <div>
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
                              <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Term Test I</TableHead>
                              <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Term Test II</TableHead>
                              <TableHead className="text-center py-3 border-b-2 text-gray-600 font-medium">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedStudents.map((student) => (
                              <TableRow key={student.sapId}>
                                <TableCell className="text-center py-4 border-y-2">{selectedSemester}</TableCell>
                                <TableCell className="text-center py-4 border-y-2">{student.sapId}</TableCell>
                                <TableCell className="text-center py-4 border-y-2">{student.name}</TableCell>
                                <TableCell className="text-center py-4 border-y-2">{student.rollNo}</TableCell>
                                <TableCell className="text-center py-4 border-y-2">{student.division}</TableCell>
                                <TableCell className="text-center py-4 border-y-2">{selectedSubject}</TableCell>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

