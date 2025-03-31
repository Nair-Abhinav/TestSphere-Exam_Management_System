import React, { useState, useEffect } from "react"
import axios from "axios"

const HODPage = () => {
  const [messages] = useState(["SY", "TY", "BE"])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState(null)
  const [localVerifiedData, setLocalVerifiedData] = useState([])
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)

  const fetchStudentDataBasedOnSubject = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/students/retest?year=${selectedYear}`);
      const data = response.data;
      if (data && data.students) {
        const formattedStudents = data.students.map((student) => ({
          id: student._id,
          sapId: student.sapId,
          name: student.name,
          rollNo: student.rollNo,
          div: student.division,
          subject: student.subject,
          termTest1: student.termTest1,
          termTest2: student.termTest2,
          semester: student.semester,
          isVerified: student.isVerified || false, // Include isVerified field
        }));
        setStudents(formattedStudents);
        setLocalVerifiedData(formattedStudents.filter((s) => s.isVerified)); // Initialize localVerifiedData
      } else {
        console.log("Student data not found");
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
      setStudents([]);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      setSelectedSemester(selectedYear === "SY" ? "3" : selectedYear === "TY" ? "5" : "7")
      fetchStudentDataBasedOnSubject()
    }
  }, [selectedYear]);

  const handleBackClick = () => {
    setSelectedMessage(null)
    setSelectedYear(null)
    setStudents([])
    setLocalVerifiedData([])
    setIsTermsAccepted(false)
  }

  const handleYearSelection = (year) => {
    setSelectedYear(year)
  }

  const handleCheckboxChange = (studentId) => {
    setLocalVerifiedData((prevData) => {
      const studentIndex = prevData.findIndex((s) => s.id === studentId)
      if (studentIndex !== -1) {
        return prevData.filter((s) => s.id !== studentId)
      } else {
        const studentToAdd = students.find((s) => s.id === studentId)
        return [...prevData, studentToAdd]
      }
    })
  }

  const handleVerificationSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/hod/verify-students', {
        year: selectedYear,
        isVerified: isTermsAccepted
      });

      if (response.status === 200) {
        alert(`${selectedYear} students verification status updated`);
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Failed to update verification status');
    }
  }

  const handleSubmit = async () => {
    if (!isTermsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }
  
    // Map data with 'isVerified' value
    const dataToSubmit = localVerifiedData.map((student) => ({
      sapId: student.sapId,
      name: student.name,
      rollNo: student.rollNo,
      division: student.div,
      subject: student.subject,
      termTest1: student.termTest1,
      termTest2: student.termTest2,
      semester: student.semester,
      isVerified: true,
    }));
  
    try {
      const response = await axios.post(
        `http://localhost:5000/hod/retest/register?year=${selectedYear}`,
        {
          students: dataToSubmit,
        }
      );
  
      if (response.status === 201) {
        await handleVerificationSubmit();
        alert(response.data.message);
  
        // Update students and localVerifiedData to maintain checkbox states
        setStudents((prevStudents) =>
          prevStudents.map((student) => ({
            ...student,
            isVerified: localVerifiedData.some((s) => s.id === student.id),
          }))
        );
  
        setLocalVerifiedData((prevVerifiedData) =>
          prevVerifiedData.filter((student) => student.isVerified)
        );
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.msg)
          .join("\n");
        alert(`Validation Errors:\n${errorMessages}`);
      } else {
        console.error("Error during student registration:", error);
        alert("An error occurred during student registration");
      }
    }
  };
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-5">HOD Login</h1>
      <div className="w-full h-full bg-white overflow-hidden">
        <div className="flex items-center p-4 bg-black text-white rounded-t-lg">
          {selectedYear ? (
            <>
              <button
                className="bg-purple-700 text-white px-3 py-1 rounded mr-3 hover:bg-purple-800"
                onClick={handleBackClick}
              >
                Back
              </button>
              <h2 className="text-lg font-semibold flex-grow ">{selectedYear}</h2>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">MESSAGES</h2>
              
            </>
          )}
        </div>
        {selectedYear ? (
          <div className="p-5 h-full overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-3 py-2">Verify</th>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">SAP ID</th>
                  <th className="border px-3 py-2">Roll No</th>
                  <th className="border px-3 py-2">Division</th>
                  <th className="border px-3 py-2">Semester</th>
                  <th className="border px-3 py-2">Subject</th>
                  <th className="border px-3 py-2">Term Test 1</th>
                  <th className="border px-3 py-2">Term Test 2</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="border px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={localVerifiedData.some((s) => s.id === student.id)}
                        onChange={() => handleCheckboxChange(student.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="border px-3 py-2">{student.name}</td>
                    <td className="border px-3 py-2">{student.sapId}</td>
                    <td className="border px-3 py-2">{student.rollNo}</td>
                    <td className="border px-3 py-2">{student.div}</td>
                    <td className="border px-3 py-2">{student.semester}</td>
                    <td className="border px-3 py-2">{student.subject}</td>
                    <td className="border px-3 py-2">{student.termTest1 ? "Yes" : "No"}</td>
                    <td className="border px-3 py-2">{student.termTest2 ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col items-center mt-5 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Only students who have been verified and approved by the Head of Department (HoD) are eligible to
                  appear for the retest.
                </label>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isTermsAccepted}
                className={`px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 ${!isTermsAccepted ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            {messages.length === 0 ? (
              <p className="text-center text-gray-600">The inbox is empty</p>
            ) : (
              <ul className="space-y-3">
                <button
                  onClick={() => handleYearSelection("SY")}
                  className="w-full text-left p-4 bg-gray-200 hover:bg-gray-300 border-b border-gray-400 rounded-lg"
                >
                  SECOND YEAR
                </button>
                <button
                  onClick={() => handleYearSelection("TY")}
                  className="w-full text-left p-4 bg-gray-200 hover:bg-gray-300 border-b border-gray-400 rounded-lg"
                >
                  THIRD YEAR
                </button>
                <button
                  onClick={() => handleYearSelection("BE")}
                  className="w-full text-left p-4 bg-gray-200 hover:bg-gray-300 border-b border-gray-400 rounded-lg"
                >
                  FOURTH YEAR
                </button>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HODPage
