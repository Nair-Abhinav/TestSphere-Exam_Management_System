// 3rd version

import "jspdf-autotable"
import "react-toastify/dist/ReactToastify.css"

import { React, useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"

import axios from "axios"
import jsPDF from "jspdf"
import logo from "../../assets/logo.png"

export default function Table() {
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedCourseType, setSelectedCourseType] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [classrooms, setClassrooms] = useState([{ room: "", capacity: "" }])
  const [alert, setAlert] = useState("")
  const [sampleSubjectData, setSampleSubjectData] = useState([])
  const [sampleData, setSampleData] = useState({})
  const [type, setType] = useState("")
  const [attendanceData, setAttendanceData] = useState([])
  const [formBatches, setFormBatches] = useState([{ name: "", capacity: "" }])
  const [selectedTermTest, setSelectedTermTest] = useState("")
  const [retestSubjects, setRetestSubjects] = useState([])
  const [selectedElectiveSubjects, setSelectedElectiveSubjects] = useState([]); // For DLE/ILE/OE
  const [academicYear, setAcademicYear] = useState("")
  const yearOptions = {
    SY:"SY",
    TY:"TY",
    BE:"BE",
  }
  const semesterOptions = {
    SY: ["3", "4"],
    TY: ["5", "6"],
    BE: ["7", "8"],
  }
  const courseTypes = ["Regular", "ILE", "DLE", "OE", "Honors", "Minors"]
  const exams = ["Term Test I", "Term Test II", "Retest", "Practicals/Orals"]
  const handleYearChange = async (e) => {
    const newYear = e.target.value
    setSelectedYear(newYear)
    setSelectedSemester("")
    setSelectedCourseType("")
    setSelectedSubject("")
  }

  const [showAlignmentModal, setShowAlignmentModal] = useState(null); // index of the classroom
    const [alignmentData, setAlignmentData] = useState({ columns: 0, rowsPerColumn: [] });
  
  
    const openAlignmentModal = (index) => {
      const current = classrooms[index];
      const col = current.columns || 0;
      const rows = current.rowsPerColumn || Array.from({ length: col }, () => "");
      setAlignmentData({
        columns: col,
        rowsPerColumn: rows
      });
      setShowAlignmentModal(index);
    };
    
  
    const handleSaveAlignment = () => {
      const totalRows = alignmentData.rowsPerColumn.reduce((sum, rows) => sum + (parseInt(rows) || 0), 0);
      const classroomCapacity = parseInt(classrooms[showAlignmentModal].capacity) || 0;
    
      if (totalRows !== classroomCapacity) {
        window.alert(`Total number of seats (${totalRows}) does not match classroom capacity (${classroomCapacity}).`);
        return;
      }
    
      const updatedClassrooms = [...classrooms];
      updatedClassrooms[showAlignmentModal] = {
        ...updatedClassrooms[showAlignmentModal],
        columns: alignmentData.columns,
        rowsPerColumn: alignmentData.rowsPerColumn
      };
    
      setClassrooms(updatedClassrooms);
      setShowAlignmentModal(null);
    };
    
    
    
  //printpracticalarrangement..text
  const handleSelectSubject = async (e) => {
    try {
      // Use selectedYear and selectedSemester to match backend collection naming
      if (!selectedYear || !selectedSemester) return;
      let coursetype = "";
      switch (selectedCourseType) {
        case "Regular":
          coursetype = "Regular";
          break;
        case "ILE":
          coursetype = "ILE";
          break;
        case "DLE":
          coursetype = "DLE";
          break;
        case "OE":
          coursetype = "OE";
          break;
        case "HONORS":
          coursetype = "Honors";
          break;
        case "MINORS":
          coursetype = "Minors";
          break;
        default:
          coursetype = "";
      }
      // Send year and semester as separate params
      const response = await axios.get(
        `http://localhost:5000/api/subjects?year=${selectedYear}&semester=${selectedSemester}&coursetype=${coursetype}`
      );
      console.log("API Response:", response.data);
      const subjectsData = response.data.data;
      if (Array.isArray(subjectsData)) {
        const subjectsArray = subjectsData.map((subject) => subject.Subject);
        console.log("Subjects Array:", subjectsArray);
        setSampleSubjectData(subjectsArray);
      } else {
        console.error("Expected an array but received:", subjectsData);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }

  // Retest subject fetch
  const handleRetestSelectSubject = async (termTest) => {
    if (!selectedYear || !selectedSemester || !termTest) return
    const res = await axios.get(
      `http://localhost:5000/api/subjectsRetest?year=${selectedYear}&semester=${selectedSemester}&termTest=${termTest}`
    )
    const arr = res.data.data?.map((s) => s.Subject) || []
    setRetestSubjects(arr)
  }
  
  const handleSemesterChange = async (e) => {
    setSelectedSemester(e.target.value)
    setSelectedCourseType("")
    setSelectedSubject("")
  }
  const handleCourseTypeChange = async (e) => {
    const newCourseType = e.target.value // Convert to uppercase
    setSelectedCourseType(newCourseType)
    setSelectedSubject("") // Reset selected subject
  }
  const handleAddClassroom = () => {
    setClassrooms([...classrooms, { room: "", capacity: "" }])
  }
  const handleDeleteClassroom = (index) => {
    const updatedClassrooms = classrooms.filter((_, i) => i !== index)
    setClassrooms(updatedClassrooms)
  }
  const handleClassroomChange = (index, field, value) => {
    const updatedClassrooms = classrooms.map((classroom, i) => {
      if (i === index) {
        return { ...classroom, [field]: value };
      }
      return classroom;
    });
    setClassrooms(updatedClassrooms);
  };
  const handleAddFormBatch = () => {
    setFormBatches([...formBatches, { name: "", capacity: "" }])
  }

  const handleDeleteFormBatch = (index) => {
    const updatedFormBatches = formBatches.filter((_, i) => i !== index)
    setFormBatches(updatedFormBatches)
  }

  const handleFormBatchChange = (index, field, value) => {
    const updatedFormBatches = formBatches.map((batch, i) => {
      if (i === index) {
        return { ...batch, [field]: value }
      }
      return batch
    })
    setFormBatches(updatedFormBatches)
  }
  const validateForm = () => {
    if (!selectedExam) return "Please select an exam"
    if (!selectedYear) return "Please select a year"
    if (!selectedSemester) return "Please select a semester"
    if (selectedExam === "Retest") {
      if (!selectedTermTest) return "Please select a term test"
      if (!selectedSubject) return "Please select a subject"
    } else {
      if (!selectedCourseType) return "Please select a course type"
      if ((selectedCourseType === "Regular" || selectedCourseType === "elective") && !selectedSubject)
        return "Please select a subject"
    }
    if (classrooms.length === 0 && selectedExam !== "Practicals/Orals") return "Please add at least one classroom"
    if (classrooms.some((c) => !c.room || !c.capacity) && selectedExam !== "Practicals/Orals")
      return "Please fill in all classroom details"
    if (formBatches.length === 0 && selectedExam === "Practicals/Orals") return "Please add at least one form batch"
    if (formBatches.some((b) => !b.name || !b.capacity) && selectedExam === "Practicals/Orals")
      return "Please fill in all form batch details"
    return ""
  }
  // new version..
  const fetchAttendanceData = async (year, sem, course) => {
    console.log("fetchAttendanceData function invoked")
    try {
      console.log("Fetching attendance data...")
      console.log(`Year: ${year}, Sem: ${sem}, Course Type: ${course}`)

      if (!year) {
        throw new Error("Year parameter is required.")
      }
      const courseType = course
      console.log("Course Type: " + courseType)

      let response = null
      if (courseType === "ILE" || courseType === "DLE" || courseType === "OE") {
        try {
          // Send selectedElectiveSubjects as JSON string in query
          const res = await axios.get(
            `http://localhost:5000/api/attendance?year=${year}&sem=${sem}&courseType=${courseType}&selectedSubjects=${encodeURIComponent(JSON.stringify(selectedElectiveSubjects))}`
          )
          console.log("Attendance Data:", res.data)
          response = res
        } catch (error) {
          console.error("Error in axios request (ILE/DLE/OE):", error)
        }
      } else if (courseType === "Minors") {
        try {
          const res = await axios.get(`http://localhost:5000/api/attendance/minors?year=${year}`)
          console.log("Attendance Data:", res.data)
          response = res
        } catch (error) {
          console.error("Error in axios request (MINORS):", error)
        }
      } else if (courseType === "Honors") {
        try {
          // const res = await axios.get(`https://fsd-backend-beta.vercel.app/api/attendance/honors?year=${year}`)
          const res = await axios.get(`http://localhost:5000/api/attendance/honors?year=${year}`) 
          console.log("Attendance Data Honors:", res.data)
          response = res
        } catch (error) {
          console.error("Error in axios request (HONORS):", error)
        }
      } else {
        try {
          // Regular course type
          const res = await axios.get(`http://localhost:5000/api/attendance?year=${year}&sem=${sem}&courseType=Regular`)
          console.log("Attendance Data:", res.data)
          response = res
        } catch (error) {
          console.error("Error in axios request (REGULAR):", error)
        }
      }
      return response?.data?.data // Make sure response has the data field
    } catch (error) {
      console.error("Error fetching attendance data:", error.message)
      throw error
    }
  }

  const fetchRetestStudentsData = async () => {
    try {
      if (!selectedYear || !selectedSubject || !selectedTermTest) {
        throw new Error("Year, subject and term test are required for retest.")
      }
      const res = await axios.get(
        `http://localhost:5000/students/retest/${encodeURIComponent(selectedSubject)}/${selectedTermTest}?year=${selectedYear}`
      )
      console.log("Retest Students Data:", res.data)
      return res.data.students
    } catch (error) {
      console.error("Error fetching retest students data:", error.message)
      throw error
    }
  }

  const handleDownload = async (type) => {
    try {
      setType(type)
      const errorMessage = validateForm()
      if (errorMessage) {
        setAlert(errorMessage)
        return
      }

      // Fetch data based on exam type
      const data = selectedExam === "Retest"
        ? await fetchRetestStudentsData()
        : await fetchAttendanceData(selectedYear, selectedSemester, selectedCourseType)

      if (!data || !data.length) {
        setAlert("No data available to generate PDF")
        return
      }

      const totalCapacity =
        selectedExam === "Practicals/Orals"
          ? formBatches.reduce((sum, batch) => sum + Number.parseInt(batch.capacity, 10), 0)
          : classrooms.reduce((sum, room) => sum + Number.parseInt(room.capacity, 10), 0)
      if (data.length > totalCapacity) {
        const excessStudents = data.length - totalCapacity
        toast.error(
          `There are ${excessStudents} students more. Please add more ${selectedExam === "Practicals/Orals" ? "form batches" : "classrooms"} or increase the ${selectedExam === "Practicals/Orals" ? "batch" : "classroom"} capacity.`,
        )
        return
      }

      // For Retest exam + attendance sheet, use the dedicated retest PDF type
      const pdfType = selectedExam === "Retest" && type === "attendance" ? "retest" : type
      // Set the data and type - this will trigger the useEffect
      setAttendanceData(data)
      setType(pdfType)
    } catch (error) {
      console.error("Error during PDF generation:", error.message)
      setAlert("Error generating PDF: " + error.message)
    }
  }
  const generatePDF = (type) => {
    if (!attendanceData || !attendanceData.length) {
      console.error("No attendance data available")
      return
    }
    const blockNos =
      selectedExam === "Practicals/Orals"
        ? formBatches.map((batch) => batch.name)
        : classrooms.map((classroom) => classroom.room)
        // Even cleaner version
const subject = (selectedCourseType === "Honors" || selectedCourseType === "Minors") 
? selectedCourseType 
: selectedSubject;
console.log("Subject:", subject);
    const exam_info = selectedExam
    const year = selectedYear
    const sem = selectedSemester
    const totalCapacity =
      selectedExam === "Practicals/Orals"
        ? formBatches.reduce((sum, batch) => sum + Number.parseInt(batch.capacity, 10), 0)
        : classrooms.reduce((sum, room) => sum + Number.parseInt(room.capacity, 10), 0)
    const totalRows = attendanceData.length

    if (type === "attendance") {
      // Even cleaner version
      const doc = new jsPDF("p", "mm", "a4")
      doc.setFont("Times New Roman", "bold")
      // Define margins and page width
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const contentWidth = pageWidth - 2 * margin
      const addHeader = (blockNo, div, subject) => {
        const imgData = logo
        doc.addImage(imgData, "PNG", margin, 5, contentWidth, 20)
        doc.setFontSize(12)
        doc.setTextColor(255, 0, 0)
        doc.text(
          // `${year} B.Tech SEM ${sem}: ${exam_info} (${academicYear || "2025-26"}): SUPERVISOR'S REPORT`,
          `Final Year B.Tech SEM ${sem}: ${exam_info} (${academicYear || "2025-26"}): SUPERVISOR'S REPORT`,
          margin + contentWidth / 2,
          32,
          { align: "center" },
        )
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.text(`Subject: - ________________________`, margin, 44)
        doc.text("Branch: - Information Technology", margin + contentWidth / 2 + 19, 44, { align: "center" })
        doc.text(`Div: - ${div}`, margin + 55, 50)
        doc.text("Date: - _________________", margin, 50)
        doc.text("Time: - _________________", margin + contentWidth / 2 + 14, 50, { align: "center" })
        doc.setFontSize(12)
        const blockNoX = margin + contentWidth - 30
        const blockNoY = 52
        if (/\d/.test(blockNo)) {
          doc.text(`Block No: ${blockNo}`, blockNoX, blockNoY);
        } else {
          doc.text(`${blockNo}`, blockNoX, blockNoY);                                                                                                                  
        }

        const boxWidth = 40
        const boxHeight = 15
        doc.rect(blockNoX - 8, blockNoY - 8, boxWidth, boxHeight)
        doc.setFontSize(10)
        doc.text("NOTE: (a) Please arrange answer papers serially according to SAP number.", margin, 60)
        doc.text(
          "(b) Please take the signature of the student on the attendance sheet serially according to SAP No.",
          margin + 12,
          65,
        )
      }

      const addFooter = () => {
        const footerYPosition = doc.internal.pageSize.getHeight() - 12
        doc.setFontSize(12)
        doc.text("Total no. of students present = __________", margin, footerYPosition)
        doc.text("Total no. of students absent = __________", margin + contentWidth / 2 + 45, footerYPosition, {
          align: "center",
        })
        doc.text(
          "Name & Signature of Junior Supervisor = _____________________________________________",
          margin,
          footerYPosition + 8,
        )
      }

      let currentIndex = 0
      let pageNumber = 0
      let remainingCapacity = selectedExam === "Practicals/Orals" ? formBatches[0].capacity : classrooms[0].capacity // Initialize with the first classroom's capacity
      let currentClassroomIndex = 0 // Track the current classroom

      // For Regular courseType, use division and globSrNo from backend data
      let currentDivision =
        selectedCourseType === "Regular"
          ? attendanceData[0]?.division
          : attendanceData[0]?.division || attendanceData[0]?.Division;
      let currentSub = attendanceData[0]?.SubCode;

      while (currentIndex < totalRows) {
        const classroom =
          selectedExam === "Practicals/Orals"
            ? formBatches[currentClassroomIndex]
            : classrooms[currentClassroomIndex];
        const { room, capacity } = classroom;

        if (remainingCapacity === capacity) {
          addHeader(blockNos[currentClassroomIndex], currentDivision, currentSub);
        }

        const pageRows = [];
        let pageSrNo = 1;

        while (currentIndex < totalRows) {
          const student = attendanceData[currentIndex];
          // For Regular, use division; for electives, fallback to division or Division
          const studentDivision =
            selectedCourseType === "Regular"
              ? student.division
              : student.division || student.Division;
          const studentName = student.name || student.Name;
          const studentSap = student.sapId || student.Sap;
          const studentRollNo = student.rollNo || student.roll;

          // Check if division changes
          if (
            (selectedCourseType === "Regular" && studentDivision !== currentDivision) ||
            (selectedCourseType !== "Regular" && studentDivision !== currentDivision) ||
            remainingCapacity === 0 ||
            student.SubCode !== currentSub
          ) {
            doc.autoTable({
              head: [["Sr. No.", "Roll No.", "SAP No.", "Name of the student", "Signature"]],
              body: pageRows,
              startY: 70,
              styles: {
                halign: "center",
                lineColor: [0, 0, 0],
                lineWidth: 0.3,
                fillColor: [255, 255, 255],
                fontSize: 10,
                cellPadding: 1,
              },
              headStyles: {
                fontStyle: "bold",
                textColor: [0, 0, 0],
                fontSize: 10,
              },
              columnStyles: {
                0: { halign: "center", cellWidth: 15 },
                1: { halign: "center", cellWidth: 12 },
                2: { halign: "center", cellWidth: 45 },
                3: { halign: "left", cellWidth: 80 },
                4: { halign: "center", cellWidth: 30 },
              },
              margin: { top: 10, right: margin, left: margin },
            });

            addFooter();
            doc.addPage();
            pageNumber++;

            // Start a new page
            if (remainingCapacity === 0) {
              currentClassroomIndex =
                (currentClassroomIndex + 1) %
                (selectedExam === "Practicals/Orals" ? formBatches.length : classrooms.length);
              remainingCapacity = (
                selectedExam === "Practicals/Orals"
                  ? formBatches[currentClassroomIndex]
                  : classrooms[currentClassroomIndex]
              ).capacity;
            }
            currentDivision =
              selectedCourseType === "Regular"
                ? student.division
                : student.division || student.Division;
            currentSub = student.SubCode;
            addHeader(blockNos[currentClassroomIndex], currentDivision, currentSub);
            pageRows.length = 0;
            pageSrNo = 1;
          }
          // Add student to the current page
          pageRows.push([pageSrNo++, studentRollNo, studentSap, studentName]);
          currentIndex++;
          remainingCapacity--;
        }

        // Add the last processed page
        if (pageRows.length > 0) {
          doc.autoTable({
            head: [["Sr. No.", "Roll No.", "SAP No.", "Name of the student", "Signature"]],
            body: pageRows,
            startY: 70,
            styles: {
              halign: "center",
              lineColor: [0, 0, 0],
              lineWidth: 0.3,
              fillColor: [255, 255, 255],
              fontSize: 10,
              cellPadding: 1,
            },
            headStyles: {
              fontStyle: "bold",
              textColor: [0, 0, 0],
              fontSize: 10,
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 15 },
                1: { halign: "center", cellWidth: 12 },
                2: { halign: "center", cellWidth: 45 },
                3: { halign: "left", cellWidth: 80 },
                4: { halign: "center", cellWidth: 30 },
              },
            margin: { top: 10, right: margin, left: margin },
          });

          addFooter();
        }
      }
      doc.save(`Attendance_${year}_${subject}.pdf`)
    } else if (type === "allocation") {
      const doc = new jsPDF("p", "mm", "a4")
      const margin = 15
      const availableWidth = doc.internal.pageSize.getWidth() - 2 * margin
      const totalColumns = selectedExam === "Practicals/Orals" ? formBatches.length : classrooms.length
      const columnWidth = (availableWidth - 12) / totalColumns
      doc.addImage(logo, "PNG", 20, 12, doc.internal.pageSize.getWidth() - 40, 20)
      // Department Title
      doc.setFontSize(12)
      doc.setFont("Calibri", "bold")
      const departmentTitle = "Department of Information Technology"
      const departmentTitleWidth = doc.getTextWidth(departmentTitle)
      doc.text(departmentTitle, (doc.internal.pageSize.getWidth() - departmentTitleWidth) / 2, 40)
      // Notice Title
      doc.setFont("Calibri", "bold")
      const noticeTitle = "Notice"
      const noticeTitleWidth = doc.getTextWidth(noticeTitle)
      doc.text(noticeTitle, (doc.internal.pageSize.getWidth() - noticeTitleWidth) / 2, 45)
      // Current Date
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th"
        switch (day % 10) {
          case 1:
            return "st"
          case 2:
            return "nd"
          case 3:
            return "rd"
          default:
            return "th"
        }
      }
      const currentDate = new Date()
      const day = currentDate.getDate()
      const month = currentDate.toLocaleString("en-GB", { month: "long" })
      const year = currentDate.getFullYear()
      const formattedDate = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
      doc.setFont("Calibri", "normal")
      doc.text(`Date: ${formattedDate}`, doc.internal.pageSize.getWidth() - 22, 52, { align: "right" })
      // Notice Text
      const wrapTextWithBold = (text, boldText, x, y, maxWidth, spacing) => {
        const words = text.split(" ")
        let line = ""
        let currentY = y
        words.forEach((word) => {
          const testLine = line + word + " "
          const testWidth = doc.getTextWidth(testLine)

          if (testWidth > maxWidth) {
            doc.text(line, x, currentY)
            line = word + " "
            currentY += spacing
          } else {
            line = testLine
          }
        })
        doc.text(line, x, currentY)
        const lastLineWidth = doc.getTextWidth(line)
        doc.setFont("Calibri", "bold")
        doc.text(boldText, x + lastLineWidth, currentY)
        doc.setFont("Calibri", "normal")
      }
      const noticeText = `All the ${selectedYear} B.Tech IT students are hereby instructed to strictly adhere to the following seating arrangement for their ${selectedExam} (${academicYear || "2025-26"}) for`
      //const noticeText = `All the Final Year B.Tech IT students are hereby instructed to strictly adhere to the following seating arrangement for their ${selectedExam} (${academicYear || "2025-26"}) for`
      const subjectText = selectedExam === "Retest"
        ? `Retest - ${selectedSubject} (${selectedTermTest === "TermTest1" ? "Term Test I" : "Term Test II"})`
        : `${selectedCourseType.toUpperCase()} Subject`
      
      const lineSpacing = 5 // Define line spacing
      wrapTextWithBold(noticeText, subjectText, 22, 60, doc.internal.pageSize.getWidth() - 45, lineSpacing)
      // Table
      const tableColumn = ["Sr. No."]
      ;(selectedExam === "Practicals/Orals" ? formBatches : classrooms).forEach((item) => {
        if (/\d/.test(item.room)) { 
          tableColumn.push(`Classroom ${item.room || item.name}`)
        } else { 
          tableColumn.push(`${item.room || item.name}`)
        }
      })
      const tableBody = []
      let currentStudentIndex = 0 // Track current student index in sampleData
      // Iterate over each classroom to fill data column-wise
      ;(selectedExam === "Practicals/Orals" ? formBatches : classrooms).forEach((item) => {
        const classroomData = []
        for (let i = 0; i < item.capacity; i++) {
          if (currentStudentIndex < attendanceData.length) {
            const student = attendanceData[currentStudentIndex];
            // Use correct division and sapId fields for all types
            const division =
              student.division || student.Division || "";
            const rollNo =
              student.rollNo || student.roll || student.RollNo || "";
            const SubCode = student.SubCode || "";
            const dept_minor = student.Department || "";
            if (selectedExam === "Retest") {
              classroomData.push(
                (division ? division : "") +
                (division && rollNo ? "-" : "") +
                (rollNo ? rollNo : "")
              );
            } else if (selectedCourseType === "ILE" || selectedCourseType === "DLE" || selectedCourseType === "OE") {
              classroomData.push(
                (division ? division : "") +
                (division && rollNo ? "-" : "") +
                (rollNo ? rollNo : "")
              );
            } else if (selectedCourseType === "Regular") {
              classroomData.push(
                (division ? division : "") +
                (division && rollNo ? "-" : "") +
                (rollNo ? rollNo : "")
              );
            } else if (selectedCourseType === "Minors") {
              classroomData.push(
                (dept_minor ? dept_minor : "") +
                (dept_minor && rollNo ? "-" : "") +
                (rollNo ? rollNo : "")
              );
            } else if (selectedCourseType === "Honors") {
              classroomData.push(
                (division ? division : "") +
                (division && rollNo ? "-" : "") +
                (rollNo ? rollNo : "")
              );
            }
            currentStudentIndex++
          } else {
            classroomData.push("")
          }
        }
        for (let rowIndex = 0; rowIndex < item.capacity; rowIndex++) {
          if (!tableBody[rowIndex]) {
            tableBody[rowIndex] = Array(
              (selectedExam === "Practicals/Orals" ? formBatches.length : classrooms.length) + 1,
            ).fill("")
          }
          tableBody[rowIndex][0] = rowIndex + 1 // Set Sr. No.
          tableBody[rowIndex][
            (selectedExam === "Practicals/Orals" ? formBatches.indexOf(item) : classrooms.indexOf(item)) + 1
          ] = classroomData[rowIndex]
        }
      })
      // Determine font size based on number of columns
      const baseFontSize = 8 // Base font size
      const adjustedFontSize = tableColumn.length - 1 > 6 ? 7  : baseFontSize // Adjust font size if columns > 6
      // Create the Table
      doc.autoTable({
        head: [tableColumn],
        body: tableBody,
        startY: 70,
        styles: {
          halign: "center",
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
          fillColor: [255, 255, 255],
          fontSize: adjustedFontSize,
          cellPadding: 1,
        },
        headStyles: {
          fontStyle: "bold",
          textColor: [0, 0, 0],
          fontSize: adjustedFontSize,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 }, // Sr. No. column
          ...(selectedExam === "Practicals/Orals" ? formBatches : classrooms).reduce((acc, _, index) => {
            acc[index + 1] = { halign: "center", cellWidth: columnWidth } // Classroom columns
            return acc
          }, {}),
        },
        margin: { top: 10, right: margin, left: margin },
      })
      // Signatres
      const signatureY = doc.internal.pageSize.getHeight() - 22
      doc.text("Mr. Pravin Hole", 38, signatureY)
      doc.text("Ms. Anushree Patkar", 34, signatureY + 5)
      doc.text("Ms. Neha Katre", 100, signatureY + 10)
      doc.text("Dr. Vinaya Sawant", 150, signatureY + 10)
      doc.text("Exam Coordinator", 35, signatureY + 18)
      doc.text("Associate Head", 100, signatureY + 18)
      doc.text("HOD, IT", 158, signatureY + 18)
      // Save the PDF
      doc.save("Sitting_Report.pdf")
    }
    else if (type === "retest") {
      // Retest Attendance Sheet — same layout as attendance, uses retest students array
      const doc = new jsPDF("p", "mm", "a4")
      doc.setFont("Times New Roman", "bold")
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const contentWidth = pageWidth - 2 * margin

      const addRetestHeader = (blockNo, div) => {
        doc.addImage(logo, "PNG", margin, 5, contentWidth, 20)
        doc.setFontSize(12)
        doc.setTextColor(255, 0, 0)
        doc.text(
          `${selectedYear} B.Tech SEM ${selectedSemester}: Retest (${selectedTermTest === "TermTest1" ? "Term Test I" : "Term Test II"}) (${academicYear || "2025-26"}): SUPERVISOR'S REPORT`,
          margin + contentWidth / 2,
          32,
          { align: "center" }
        )
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.text(`Subject: ${selectedSubject}`, margin, 44)
        doc.text("Branch: - Information Technology", margin + contentWidth / 2 + 19, 44, { align: "center" })
        doc.text(`Div: - ${div}`, margin + 55, 50)
        doc.text("Date: - _________________", margin, 50)
        doc.text("Time: - _________________", margin + contentWidth / 2 + 14, 50, { align: "center" })
        doc.setFontSize(12)
        const blockNoX = margin + contentWidth - 30
        const blockNoY = 52
        if (/\d/.test(blockNo)) {
          doc.text(`Block No: ${blockNo}`, blockNoX, blockNoY)
        } else {
          doc.text(`${blockNo}`, blockNoX, blockNoY)
        }
        const boxWidth = 40
        const boxHeight = 15
        doc.rect(blockNoX - 8, blockNoY - 8, boxWidth, boxHeight)
        doc.setFontSize(10)
        doc.text("NOTE: (a) Please arrange answer papers serially according to SAP number.", margin, 60)
        doc.text(
          "(b) Please take the signature of the student on the attendance sheet serially according to SAP No.",
          margin + 12,
          65
        )
      }

      const addRetestFooter = () => {
        const footerYPosition = doc.internal.pageSize.getHeight() - 12
        doc.setFontSize(12)
        doc.text("Total no. of students present = __________", margin, footerYPosition)
        doc.text("Total no. of students absent = __________", margin + contentWidth / 2 + 45, footerYPosition, {
          align: "center",
        })
        doc.text(
          "Name & Signature of Junior Supervisor = _____________________________________________",
          margin,
          footerYPosition + 8
        )
      }

      const retestBlockNos = classrooms.map((c) => c.room)
      let rCurrentIndex = 0
      let rCurrentClassroomIndex = 0
      let rRemainingCapacity = parseInt(classrooms[0].capacity) || 0
      const totalRetestRows = attendanceData.length

      let rCurrentDivision = attendanceData[0]?.division || attendanceData[0]?.Division || ""
      addRetestHeader(retestBlockNos[rCurrentClassroomIndex], rCurrentDivision)

      while (rCurrentIndex < totalRetestRows) {
        const pageRows = []
        let pageSrNo = 1

        while (rCurrentIndex < totalRetestRows) {
          const student = attendanceData[rCurrentIndex]
          const studentDivision = student.division || student.Division || ""
          const studentName = student.name || student.Name || ""
          const studentSap = student.sapId || student.Sap || ""
          const studentRollNo = student.rollNo || student.roll || student.RollNo || ""

          if (studentDivision !== rCurrentDivision || rRemainingCapacity === 0) {
            doc.autoTable({
              head: [["Sr. No.", "Roll No.", "SAP No.", "Name of the student", "Signature"]],
              body: pageRows,
              startY: 70,
              styles: { halign: "center", lineColor: [0,0,0], lineWidth: 0.3, fillColor: [255,255,255], fontSize: 10, cellPadding: 1 },
              headStyles: { fontStyle: "bold", textColor: [0,0,0], fontSize: 10 },
              columnStyles: {
                0: { halign: "center", cellWidth: 15 },
                1: { halign: "center", cellWidth: 12 },
                2: { halign: "center", cellWidth: 45 },
                3: { halign: "left", cellWidth: 80 },
                4: { halign: "center", cellWidth: 30 },
              },
              margin: { top: 10, right: margin, left: margin },
            })
            addRetestFooter()
            doc.addPage()

            if (rRemainingCapacity === 0) {
              rCurrentClassroomIndex = (rCurrentClassroomIndex + 1) % classrooms.length
              rRemainingCapacity = parseInt(classrooms[rCurrentClassroomIndex].capacity) || 0
            }
            rCurrentDivision = studentDivision
            addRetestHeader(retestBlockNos[rCurrentClassroomIndex], rCurrentDivision)
            pageRows.length = 0
            pageSrNo = 1
          }

          pageRows.push([pageSrNo++, studentRollNo, studentSap, studentName])
          rCurrentIndex++
          rRemainingCapacity--
        }

        if (pageRows.length > 0) {
          doc.autoTable({
            head: [["Sr. No.", "Roll No.", "SAP No.", "Name of the student", "Signature"]],
            body: pageRows,
            startY: 70,
            styles: { halign: "center", lineColor: [0,0,0], lineWidth: 0.3, fillColor: [255,255,255], fontSize: 10, cellPadding: 1 },
            headStyles: { fontStyle: "bold", textColor: [0,0,0], fontSize: 10 },
            columnStyles: {
              0: { halign: "center", cellWidth: 15 },
              1: { halign: "center", cellWidth: 12 },
              2: { halign: "center", cellWidth: 45 },
              3: { halign: "left", cellWidth: 80 },
              4: { halign: "center", cellWidth: 30 },
            },
            margin: { top: 10, right: margin, left: margin },
          })
          addRetestFooter()
        }
      }

      doc.save(`Retest_Attendance_${selectedYear}_${selectedSubject}_${selectedTermTest}.pdf`)
    }
    else if (type === "classroom") {
      const doc = new jsPDF("p", "mm", "a4");
      const seatWidth = 30;
      const seatHeight = 10;
      const colSpacing = seatWidth + 5;
      const rowSpacing = 12;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
    
      let currentStudentIndex = 0;
    
      const validClassrooms = classrooms.filter(
        (classroom) => classroom.columns && Array.isArray(classroom.rowsPerColumn)
      );
    
      validClassrooms.forEach((classroom, idx) => {
        if (idx !== 0) doc.addPage();
    
        // Header
        doc.addImage(logo, "PNG", 20, 12, pageWidth - 40, 20);
        doc.setFontSize(12);
        doc.setFont("Calibri", "bold");
        const dept = "Department of Information Technology";
        doc.text(dept, (pageWidth - doc.getTextWidth(dept)) / 2, 40);
    
        const notice = "Notice";
        doc.setFont("Calibri", "bold");
        doc.text(notice, (pageWidth - doc.getTextWidth(notice)) / 2, 45);
    
        const getOrdinalSuffix = (day) => {
          if (day > 3 && day < 21) return "th";
          switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
          }
        };
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.toLocaleString("en-GB", { month: "long" });
        const year = currentDate.getFullYear();
        const formattedDate = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
    
        // Header Info Block
        const topHeaderY = 54;
        const lineSpacing = 5;
        const leftX = margin;
        const rightX = pageWidth - margin;
    
        // First line: Subject & Exam
        doc.setFontSize(12);
        doc.setFont("Calibri", "bold");
        const subjectText = `Subject: ${selectedSubject}`;
        const examText = `Exam: ${selectedExam} (${selectedCourseType})`;
        doc.text(subjectText, leftX, topHeaderY);
        doc.text(examText, rightX, topHeaderY, { align: "right" });
    
        // Second line: Branch & Date
        const branchText = "Branch: Information Technology";
        const dateText = `Date: ${formattedDate}`;
        doc.text(branchText, leftX, topHeaderY + lineSpacing);
        doc.text(dateText, rightX, topHeaderY + lineSpacing, { align: "right" });
    
        // Classroom box (styled single-line)
        const boxPadding = 3;
        const classroomText = `Classroom: ${classroom.room}`;
        const boxTextWidth = doc.getTextWidth(classroomText);
        const boxWidth = boxTextWidth + boxPadding * 2;
        const boxHeight = 8;
        const boxX = pageWidth - margin - boxWidth;
        const boxY = topHeaderY + lineSpacing * 2;
    
        doc.setDrawColor(0);
        doc.setFillColor(210, 230, 255); // Light blue
        doc.rect(boxX, boxY, boxWidth, boxHeight, "FD");
    
        doc.setTextColor(0, 0, 0);
        doc.setFont("Calibri", "bold");
        doc.setFontSize(12);
        doc.text(classroomText, boxX + boxPadding, boxY + 5.5);
    
        // Layout setup
        const alignment = {
          columns: classroom.columns,
          rowsPerColumn: classroom.rowsPerColumn,
        };
    
        const maxRows = Math.max(...alignment.rowsPerColumn);
        const layoutWidth = alignment.columns * colSpacing;
        const layoutHeight = maxRows * rowSpacing;
    
        const startX = (pageWidth - layoutWidth) / 2;
        const startY = (pageHeight - layoutHeight) / 2 + 10;
    
        // Teacher's Desk
        doc.setFillColor(200, 200, 255);
        doc.rect(startX, startY - 10, layoutWidth, 8, "F");
        doc.setFontSize(11);
        doc.text("Teacher's Desk", startX + layoutWidth / 2, startY - 4, { align: "center" });
    
        // Door label
        doc.setFontSize(11);
        doc.text("Door", startX - 12, startY + 2);
    
        // Seat Rendering
        let seatIndex = 0;
        for (let col = 0; col < alignment.columns; col++) {
          const rows = parseInt(alignment.rowsPerColumn[col] || 0);
          for (let row = 0; row < rows; row++) {
            const x = startX + col * colSpacing;
            const y = startY + row * rowSpacing;
    
            doc.rect(x, y, seatWidth, seatHeight);
    
            if (seatIndex < classroom.capacity && currentStudentIndex < attendanceData.length) {
              const student = attendanceData[currentStudentIndex];
              const rollno = student.rollNo || student.roll || student.RollNo || "";
              doc.setFontSize(11);
              doc.text(String(rollno), x + seatWidth / 2, y + seatHeight / 2 + 2, { align: "center" });
              currentStudentIndex++;
            }
            seatIndex++;
          }
        }
      });
    
      doc.save(`Classroom_Layouts_${selectedSubject}.pdf`);
    }
    
    
//     else if (type === "classroom") {
//       const doc = new jsPDF("p", "mm", "a4");
//       const seatWidth = 30;
//       const seatHeight = 10;
//       const colSpacing = seatWidth + 5; // space between seats
//       const rowSpacing = 12;
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margin = 15;
    
//       let currentStudentIndex = 0;
    
//       const validClassrooms = classrooms.filter(
//         (classroom) => classroom.columns && Array.isArray(classroom.rowsPerColumn)
//       );
    
//       validClassrooms.forEach((classroom, idx) => {
//         if (idx !== 0) doc.addPage();
    
//         // Header
//         doc.addImage(logo, "PNG", 20, 12, pageWidth - 40, 20);
//         doc.setFontSize(12);
//         doc.setFont("Calibri", "bold");
//         const dept = "Department of Information Technology";
//         doc.text(dept, (pageWidth - doc.getTextWidth(dept)) / 2, 40);
    
//         const notice = "Notice";
//         doc.setFont("Calibri", "bold");
//         doc.text(notice, (pageWidth - doc.getTextWidth(notice)) / 2, 45);
    
//         const getOrdinalSuffix = (day) => {
//           if (day > 3 && day < 21) return "th";
//           switch (day % 10) {
//             case 1: return "st";
//             case 2: return "nd";
//             case 3: return "rd";
//             default: return "th";
//           }
//         };
//         const currentDate = new Date();
//         const day = currentDate.getDate();
//         const month = currentDate.toLocaleString("en-GB", { month: "long" });
//         const year = currentDate.getFullYear();
//         const formattedDate = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
//         doc.setFont("Calibri", "normal");
//         doc.text(`Date: ${formattedDate}`, pageWidth - margin - 7, 52, { align: "right" });
    
//         const alignment = {
//           columns: classroom.columns,
//           rowsPerColumn: classroom.rowsPerColumn,
//         };
    
//         const maxRows = Math.max(...alignment.rowsPerColumn);
//         const layoutWidth = alignment.columns * colSpacing;
//         const layoutHeight = maxRows * rowSpacing;
    
//         const startX = (pageWidth - layoutWidth) / 2;
//         const startY = (pageHeight - layoutHeight) / 2 + 10;
    
//         doc.setFontSize(11);
//         doc.setFont("Calibri", "bold");
//         const topHeaderY = 58; // Align just below the Date

// doc.setFontSize(11);
// doc.setFont("Calibri", "bold");
// doc.text(`Classroom: ${classroom.room}`, pageWidth / 2, topHeaderY, { align: "center" });
// doc.setFontSize(10);
// doc.text(`Subject: ${selectedSubject}`, pageWidth / 2, topHeaderY + 6, { align: "center" });
// doc.text(`Exam: ${selectedExam} (${selectedCourseType})`, pageWidth / 2, topHeaderY + 12, { align: "center" });

    
//         // Teacher's Desk
//         doc.setFillColor(200, 200, 255);
//         doc.rect(startX, startY - 10, layoutWidth, 8, "F");
//         doc.setFontSize(9);
//         doc.text("Teacher's Desk", startX + layoutWidth / 2, startY - 4, { align: "center" });
    
//         // Door label
//         doc.setFontSize(8);
//         doc.text("Door", startX - 12, startY + 2);
    
//         // Seat Rendering
//         let seatIndex = 0;
//         for (let col = 0; col < alignment.columns; col++) {
//           const rows = parseInt(alignment.rowsPerColumn[col] || 0);
//           for (let row = 0; row < rows; row++) {
//             const x = startX + col * colSpacing;
//             const y = startY + row * rowSpacing;
    
//             doc.rect(x, y, seatWidth, seatHeight);
    
//             if (seatIndex < classroom.capacity && currentStudentIndex < attendanceData.length) {
//               const student = attendanceData[currentStudentIndex];
//               const sapId = student.Sap;
//               doc.setFontSize(8);
//               doc.text(sapId.toString(), x + seatWidth / 2, y + seatHeight / 2 + 2, { align: "center" });
    
//               currentStudentIndex++;
//             }
    
//             seatIndex++;
//           }
//         }
//       });
    
//       doc.save(`Classroom_Layouts_${selectedSubject}.pdf`);
//     }
    
  }

  // Using useEffect to trigger PDF generation
  useEffect(() => {
    if (attendanceData && attendanceData.length > 0 && type) {
      console.log("Generating PDF with:", {
        dataLength: attendanceData.length,
        type: type,
      })
      generatePDF(type)
    }
  }, [attendanceData, type])

  // Fetch subjects for electives when course type or semester changes
  useEffect(() => {
    if (
      (selectedCourseType === "DLE" ||
      selectedCourseType === "ILE" ||
      selectedCourseType === "OE") &&
      selectedSemester &&
      selectedYear
    ) {
      handleSelectSubject();
    }
  }, [selectedCourseType, selectedSemester, selectedYear]);

  const handleElectiveSubjectChange = (subject) => {
    setSelectedElectiveSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Course Selection</h1>
      {alert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{alert}</span>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select Year</option>
            {Object.entries(yearOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="exam-select" className="block text-sm font-medium text-gray-700">
            Exam
          </label>
          <select
            id="exam-select"
            value={selectedExam}
            onChange={(e) => {
              setSelectedExam(e.target.value)
              setSelectedTermTest("")
              setRetestSubjects([])
              setSelectedSubject("")
              setSelectedCourseType("")
            }}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
        {selectedYear && (
          <div>
            <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <select
              id="semester-select"
              value={selectedSemester}
              onChange={handleSemesterChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Semester</option>
              {semesterOptions[selectedYear].map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Retest: Term Test dropdown */}
        {selectedSemester && selectedExam === "Retest" && (
          <div>
            <label htmlFor="termtest-select" className="block text-sm font-medium text-gray-700">
              Term Test
            </label>
            <select
              id="termtest-select"
              value={selectedTermTest}
              onChange={(e) => {
                setSelectedTermTest(e.target.value)
                setSelectedSubject("")
                handleRetestSelectSubject(e.target.value)
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Term Test</option>
              <option value="termTest1">Term Test I</option>
              <option value="termTest2">Term Test II</option>
            </select>
          </div>
        )}
        {/* Retest: Subject dropdown */}
        {selectedTermTest && selectedExam === "Retest" && (
          <div>
            <label htmlFor="retest-subject-select" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              id="retest-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Subject</option>
              {retestSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedSemester && selectedExam !== "Retest" && (
          <div>
            <label htmlFor="course-type-select" className="block text-sm font-medium text-gray-700">
              Course Type
            </label>
            <select
              id="course-type-select"
              value={selectedCourseType}
              onChange={handleCourseTypeChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Course Type</option>
              {courseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* For Regular: single subject dropdown */}
        {(selectedCourseType === "Regular") && (
          <div>
            <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              id="subject-select"
              value={selectedSubject}
              onClick={handleSelectSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Subject</option>
              {sampleSubjectData.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* For DLE/ILE/OE: show checkboxes for subjects */}
        {(selectedCourseType === "DLE" || selectedCourseType === "ILE" || selectedCourseType === "OE") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subject(s)
            </label>
            <div className="flex flex-wrap gap-3">
              {sampleSubjectData.map((subject) => (
                <label key={subject} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedElectiveSubjects.includes(subject)}
                    onChange={() => handleElectiveSubjectChange(subject)}
                    className="form-checkbox"
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {selectedSemester && (
          <div>
            <label htmlFor="academic-year-input" className="block text-sm font-medium text-gray-700">
              Academic Year
            </label>
            <input
              type="text"
              id="academic-year-input"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025-2026"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        {(selectedSubject ||
          selectedCourseType.toUpperCase() === "ILE" || selectedCourseType.toUpperCase() === "DLE" || selectedCourseType.toUpperCase() === "OE" || selectedCourseType === "Honors" || selectedCourseType === "Minors") && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {selectedExam === "Practicals/Orals" ? "Form Batches" : "Available Classes"}
              </h2>
              {selectedExam === "Practicals/Orals"
                ? formBatches.map((batch, index) => (
                  <div key={index} className="flex space-x-4 items-end">
                    <div className="flex-1">
                      <label htmlFor={`batch-${index}`} className="block text-sm font-medium text-gray-700">
                        Batch Name
                      </label>
                      <input
                        type="text"
                        id={`batch-${index}`}
                        value={batch.name}
                        onChange={(e) => handleFormBatchChange(index, "name", e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter batch name"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`capacity-${index}`} className="block text-sm font-medium text-gray-700">
                        Capacity
                      </label>
                      <input
                        type="text"
                        id={`capacity-${index}`}
                        value={batch.capacity}
                        onChange={(e) => handleFormBatchChange(index, "capacity", e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter batch capacity"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteFormBatch(index)}
                      className="inline-flex items-center mb-1 px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                ))
                : classrooms.map((classroom, index) => (
                  <div key={index} className="flex space-x-4 items-end">
                    <div className="flex-1">
                      <label htmlFor={`classroom-${index}`} className="block text-sm font-medium text-gray-700">
                        Classroom Number
                      </label>{" "}
                      <input
                        type="text"
                        id={`classroom-${index}`}
                        value={classroom.room}
                        onChange={(e) => handleClassroomChange(index, "room", e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter classroom number"
                      />
                    </div>
                    <div className="flex-1">
                    <label htmlFor={`capacity-${index}`} className="block text-sm font-medium text-gray-700">
                      Capacity
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        id={`capacity-${index}`}
                        value={classroom.capacity}
                        onChange={(e) => handleClassroomChange(index, "capacity", e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter classroom capacity"
                      />
                      <button
                        type="button"
                        onClick={() => openAlignmentModal(index)}
                        className="mt-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
                      >
                        Classroom Alignment
                      </button>
                    </div>
                  </div>
                    <button
                      onClick={() => handleDeleteClassroom(index)}
                      className="inline-flex items-center mb-1 px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              <button
                onClick={selectedExam === "Practicals/Orals" ? handleAddFormBatch : handleAddClassroom}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {selectedExam === "Practicals/Orals" ? "Add Batch" : "Add Classroom"}
              </button>
            </div>
          )}
        <div className="flex space-x-4">
          <button
            onClick={() => handleDownload("attendance")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download Attendance Sheet
          </button>
          <button
            onClick={() => handleDownload("allocation")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download Seat Allocation
          </button>
          <button
            onClick={() => handleDownload("classroom")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download Classroom Allocation
          </button>
        </div>
        {showAlignmentModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Classroom Alignment Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Columns</label>
              <input
                type="number"
                min="1"
                value={alignmentData.columns}
                onChange={(e) => {
                  const newColumnCount = parseInt(e.target.value) || 0;
                  const newRows = [...alignmentData.rowsPerColumn];
                  while (newRows.length < newColumnCount) newRows.push("");
                  while (newRows.length > newColumnCount) newRows.pop();
                  setAlignmentData({ columns: newColumnCount, rowsPerColumn: newRows });
                }}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {alignmentData.rowsPerColumn.map((row, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700">Rows for Column {idx + 1}</label>
                <input
                  type="number"
                  min="1"
                  value={row}
                  onChange={(e) => {
                    const newRows = [...alignmentData.rowsPerColumn];
                    newRows[idx] = parseInt(e.target.value) || "";
                    setAlignmentData({ ...alignmentData, rowsPerColumn: newRows });
                  }}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            ))}

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSaveAlignment}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowAlignmentModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
            </div>
          </div>
        )
      }

