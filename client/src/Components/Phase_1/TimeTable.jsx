import "react-datepicker/dist/react-datepicker.css"
import "jspdf-autotable"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"
import React, { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import { font } from "../../Lib/Times_New_Roman_normal";
import jsPDF from "jspdf"
import logo from "../../assets/logo.png"
import axios from "axios"

var callAddFont = function () {
  this.addFileToVFS("Times New Roman-normal.ttf", font);
  this.addFont("Times New Roman-normal.ttf", "Times New Roman", "normal");
};
jsPDF.API.events.push(["addFonts", callAddFont]);

const Input = ({ value, onChange, placeholder }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded"
      placeholder={placeholder}
    />
  )
}
const Button = ({ onClick, children, variant = "outline", size = "normal" }) => {
  return (
    <button
      onClick={onClick}
      className={`${variant === "destructive" ? "bg-red-500" : "bg-gray-200"} p-2 rounded ${size === "icon" ? "h-10 w-10 flex items-center justify-center" : ""
        }`}
    >
      {children}
    </button>
  )
}

function TimeTable() {
  const [schedule, setSchedule] = useState([
    {
      date: null,
      timeSlots: [{ startTime: null, endTime: null, subject: "" }],
    },
  ])

  const [practical, setPractical] = useState([
    {
      subject: "",
      data: [{ date: null, batch: "", venue: "" }],
    },
  ])
  const [yearText, setYearText] = useState("")
  const [termText, setTermText] = useState("")
  const [startDate, setStartDate] = useState("")
  const [practicalData, setPracticalData] = useState(null)
  const [newSubject, setNewSubject] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sampleSubjectData, setSampleSubjectData] = useState([])
  const [selectedSemester, setSelectedSemester] = useState("")

  const semesterOptions = {
    SY: ["3", "4"],
    TY: ["5", "6"],
    BE: ["7", "8"],
  }

  // use effect code
  useEffect(() => {
    if (yearText && termText && selectedSemester) {
      console.log("Year:", yearText, "Term:", termText, "Semester:", selectedSemester);
      loadSavedTimetable();
    }
  }, [yearText, termText , selectedSemester]);

  const handleSelectSubject = async (e) => {
    try {
      const semester = `Sem${selectedSemester}_Subjects`
      let coursetype = ""
      const response = await axios.get(
        `http://localhost:5000/api/subjects?semester=${semester}&coursetype=${coursetype}`,
      )
      console.log("API Response:", response.data)
      const subjectsData = response.data.data
      if (Array.isArray(subjectsData)) {
        const subjectsArray = subjectsData.map((subject) => subject.Subject)
        console.log("Subjects Array:", subjectsArray)
        setSampleSubjectData(subjectsArray)
      } else {
        console.error("Expected an array but received:", subjectsData)
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const handleSemesterChange = async (e) => {
    setSelectedSemester(e.target.value)
  }

  // load save timetable
  const loadSavedTimetable = async () => {
    try {
      setIsLoading(true);
      const scheduleType = termText === 'Practical/Oral' ? 'Practical' : 'Theory';
      
      const response = await axios.get('http://localhost:5000/api/timetable', {
        params: {
          year: yearText,
          term: termText,
          scheduleType,
          semester: selectedSemester // Add semester to query params
        }
      });
  
      // Reset both schedule types initially
      setPractical([]);
      setSchedule([]);
  
      if (response.data && response.data.data) {
        // Store semester value from response
        if (response.data.semester) {
          setSelectedSemester(response.data.semester);
        }
  
        if (scheduleType === 'Practical') {
          // Handle practical schedule
          const practicalData = Array.isArray(response.data.data) ? response.data.data : [];
          if (practicalData.length > 0) {
            const formattedPractical = practicalData.map(subject => ({
              subject: subject.subject || "",
              semester: subject.semester || selectedSemester, // Include semester
              data: Array.isArray(subject.data) ? subject.data.map(slot => ({
                date: slot.date ? new Date(slot.date) : null,
                batch: slot.batch || "",
                venue: slot.venue || ""
              })) : []
            }));
            setPractical(formattedPractical);
          }
        } else {
          // Handle theory schedule
          const theoryData = response.data.data;
          if (theoryData.schedule && Array.isArray(theoryData.schedule)) {
            const formattedSchedule = theoryData.schedule.map(day => ({
              date: day.date ? new Date(day.date) : null,
              semester: day.semester || selectedSemester, // Include semester
              timeSlots: Array.isArray(day.timeSlots) ? day.timeSlots.map(slot => ({
                startTime: slot.startTime ? new Date(slot.startTime) : null,
                endTime: slot.endTime ? new Date(slot.endTime) : null,
                subject: slot.subject || "",
                semester: slot.semester || selectedSemester // Include semester
              })) : []
            }));
            setSchedule(formattedSchedule);
  
            if (theoryData.startDate) {
              setStartDate(new Date(theoryData.startDate));
            } else {
              setStartDate(null);
            }
          }
        }
      } else {
        // If no data in response, reset everything
        setPractical([]);
        setSchedule([]);
        setStartDate(null);
      }
    } catch (error) {
      // Reset everything on error
      setPractical([]);
      setSchedule([]);
      setStartDate(null);
  
      if (error.response?.status !== 404) {
        console.error("Error loading timetable:", error);
        alert('Error loading timetable data');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!yearText || !termText || !selectedSemester) {
      alert("Please select year, term and semester before saving");
      return;
    }
  
    try {
      setIsLoading(true);
      const scheduleType = termText === 'Practical/Oral' ? 'Practical' : 'Theory';
      alert("entered handleSaveChanges function")
      let dataToSave;
      if (scheduleType === 'Practical') {
        // For practical schedule, add semester to each subject
        dataToSave = practical.map(item => ({
          ...item,
          semester: selectedSemester
        }));
      } else {
        // For theory schedule, add semester to schedule and timeSlots
        dataToSave = {
          schedule: schedule.map(day => ({
            ...day,
            semester: selectedSemester,
            timeSlots: day.timeSlots.map(slot => ({
              ...slot,
              semester: selectedSemester
            }))
          })),
          startDate,
          semester: selectedSemester
        };
      }
  
      const saveData = {
        year: yearText,
        term: termText,
        semester: selectedSemester,
        scheduleType,
        data: dataToSave
      };
  
      await axios.post('http://localhost:5000/api/timetable', saveData);
      alert('Timetable saved successfully');
  
      // Reload the data to ensure we have the latest version
      await loadSavedTimetable();
    } catch (error) {
      console.error("Error saving timetable:", error);
      alert('Failed to save timetable');
    } finally {
      setIsLoading(false);
    }
  };

  // handle clear timetable
  const handleClear = () => {
    if (!window.confirm("Are you sure you want to clear the timetable?")) {
      return;
    }

    try {
      if (termText === "Practical/Oral") {
        setPractical([{
          subject: "",
          data: [{ date: null, batch: "", venue: "" }],
        }]);
      } else {
        setSchedule([{
          date: null,
          timeSlots: [{ startTime: null, endTime: null, subject: "" }],
        }]);
        setStartDate("");
      }
    } catch (error) {
      console.error("Error clearing timetable:", error);
      alert('Error clearing timetable');
    }
  };


  //Term Test
  const formatDate = (date) => {
    if (!date) return "N/A"
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })
  }
  const updateDate = (dayIndex, date) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].date = date
    setSchedule(newSchedule)
  }
  const addTimeSlot = (dayIndex) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].timeSlots.push({
      startTime: null,
      endTime: null,
      subject: "",
    })
    setSchedule(newSchedule)
  }
  const removeTimeSlot = (dayIndex, slotIndex) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].timeSlots.splice(slotIndex, 1)
    setSchedule(newSchedule)
  }
  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].timeSlots[slotIndex][field] = value
    setSchedule(newSchedule)
  }
  const addDay = () => {
    const lastDay = schedule[schedule.length - 1]
    let nextDate = null

    if (lastDay && lastDay.date) {
      nextDate = new Date(lastDay.date)
      nextDate.setDate(nextDate.getDate() + 1)
    }

    if (!startDate && schedule[0] && schedule[0].date) {
      setStartDate(schedule[0].date)
    }

    setSchedule([
      ...schedule,
      {
        date: nextDate,
        timeSlots: [{ startTime: null, endTime: null, subject: "" }],
      },
    ])
  }
  const removeDay = (dayIndex) => {
    const newSchedule = [...schedule]
    newSchedule.splice(dayIndex, 1)
    setSchedule(newSchedule)
  }


  //Practical 
  const updateSubject = (subIndex, subject) => {
    const newPractical = [...practical]
    newPractical[subIndex].subject = subject
    setPractical(newPractical)
  }
  const adddata = (subIndex) => {
    const newPractical = [...practical]
    newPractical[subIndex].data.push({
      date: null,
      batch: null,
      venue: ""
    })
    setPractical(newPractical)
  }
  const removedata = (subIndex, slotIndex) => {
    const newPractical = [...practical]
    newPractical[subIndex].data.splice(slotIndex, 1)
    setPractical(newPractical)
  }
  const updatedata = (subIndex, slotIndex, field, value) => {
    const newPractical = [...practical]
    newPractical[subIndex].data[slotIndex][field] = value
    setPractical(newPractical)
  }
  const addPracDay = () => {
    const lastDay = practical[practical.length - 1]
    let nextDate = null

    if (lastDay && lastDay.date) {
      nextDate = new Date(lastDay.date)
      nextDate.setDate(nextDate.getDate() + 1)
    }

    setPractical([
      ...practical,
      {
        subject: "",
        data: [{ date: nextDate, batch: null, venue: "" }]
      },
    ])
  }
  const removePracDay = (subIndex) => {
    const newPractical = [...practical]
    newPractical.splice(subIndex, 1)
    setPractical(newPractical)
  }

  const downloadTTPDF = (e) => {
    e.preventDefault();

    // First, check if startDate exists
    if (!startDate) {
      alert("Please select a start date before downloading");
      return;
    }

    const doc = new jsPDF();
    doc.setFont("Times New Roman", "normal");
    doc.setFontSize(16);
    doc.setFont("Times New Roman", "normal");

    const tableColumn = ["Date", "Time", "Subject"];
    const tableRows = [];

    // Header Image
    const imgData = logo;
    doc.addImage(imgData, "PNG", 20, 12, doc.internal.pageSize.getWidth() - 40, 20);

    // Department Title
    doc.setFontSize(16);
    doc.setFont("Times-Roman", "normal");
    const departmentTitle = "Department of Information Technology";
    const departmentTitleWidth = doc.getTextWidth(departmentTitle);
    doc.text(departmentTitle, (doc.internal.pageSize.getWidth() - departmentTitleWidth) / 2, 40);

    // Notice Title
    doc.setFontSize(16);
    doc.setFont("Times-Roman", "bold");
    const noticeTitle = "Notice";
    const noticeTitleWidth = doc.getTextWidth(noticeTitle);
    doc.text(noticeTitle, (doc.internal.pageSize.getWidth() - noticeTitleWidth) / 2, 50);

    // Current Date
    const currentDate = new Date().toLocaleDateString("en-GB");
    doc.setFontSize(12);
    doc.setFont("Times-Roman", "normal");
    doc.text(`Date: ${currentDate}`, doc.internal.pageSize.getWidth() - 22, 60, { align: "right" });

    const wrapText = (text, x, y, maxWidth, spacing) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;

      words.forEach((word) => {
        const testLine = line + word + " ";
        const testWidth = doc.getTextWidth(testLine);

        if (testWidth > maxWidth) {
          doc.text(line, x, currentY);
          line = word + " ";
          currentY += spacing;
        } else {
          line = testLine;
        }
      });

      doc.text(line, x, currentY);
    };

    // Format startDate using the formatDate function
    const formattedStartDate = startDate ? startDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }) : "N/A";

    const noticeText = `All the ${yearText} B.Tech. IT students are hereby informed that the Term Test ${termText} is scheduled from ${formattedStartDate}. Following is the timetable for the same.`;
    const lineSpacing = 7;
    wrapText(noticeText, 20, 75, doc.internal.pageSize.getWidth() - 40, lineSpacing);

    // Adding Table Rows
    schedule.forEach((day, dayIndex) => {
      const daySlotCount = day.timeSlots.length;

      day.timeSlots.forEach((slot, slotIndex) => {
        const formattedDate = day.date
          ? day.date.toLocaleDateString("en-GB")
          : "N/A";

        const startTime = slot.startTime
          ? slot.startTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          : "N/A";

        const endTime = slot.endTime
          ? slot.endTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          : "N/A";

        const combinedTime = startTime !== "N/A" && endTime !== "N/A"
          ? `${startTime} - ${endTime}`
          : "N/A";

        const row = [
          slotIndex === 0
            ? {
              content: formattedDate,
              rowSpan: daySlotCount
            }
            : null,
          combinedTime,
          slot.subject || "N/A"
        ].filter(cell => cell !== null);

        tableRows.push(row);
      });

      // Add separator row between days
      if (schedule.indexOf(day) < schedule.length - 1) {
        tableRows.push([
          {
            content: "",
            colSpan: 3,
            styles: {
              fillColor: [200, 200, 200],
              minCellHeight: 8,
              cellPadding: { top: 0, bottom: 0, left: 0, right: 0 },
            },
          },
        ]);
      }
    });

    // Update the autoTable configuration to include vertical alignment
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      margin: { left: 20, right: 20 },
      styles: {
        font: "Times-Roman",
        cellPadding: 5,
        minCellHeight: 12,
        overflow: "linebreak",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        halign: "center",
        valign: 'middle', // Add vertical alignment
      },
      headStyles: {
        fillColor: [169, 169, 169],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        halign: "center",
        valign: 'middle', // Add vertical alignment
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        2: { cellWidth: 80 },
      },
    })

    const signatureY = 280
    doc.text("Ms. Priyanca Gonsalves", 30, signatureY)
    doc.text("Ms. Neha Katre", 100, signatureY)
    doc.text("Dr. Vinaya Sawant", 150, signatureY)
    doc.text("Exam Coordinator", 35, signatureY + 8)
    doc.text("Associate Head", 100, signatureY + 8)
    doc.text("HOD, IT", 158, signatureY + 8)

    // Save the PDF
    doc.save(`Timetable_${yearText}_${termText}.pdf`)
  }

  const downloadPracPDF = (e) => {
    e.preventDefault()

    const doc = new jsPDF()
    doc.setFont("Times New Roman", "normal");
    doc.setFontSize(16);
    doc.setFont("Times New Roman", "normal");

    const tableColumn = ["Subject", "Date", "Batch", "Venue"]
    const tableRows = []

    // Header Image
    const imgData = logo
    doc.addImage(imgData, "PNG", 20, 12, doc.internal.pageSize.getWidth() - 40, 20)

    // Department Title
    doc.setFontSize(12)
    doc.setFont("Times-Roman", "bold")
    const departmentTitle = "Department of Information Technology"
    const departmentTitleWidth = doc.getTextWidth(departmentTitle)
    doc.text(departmentTitle, (doc.internal.pageSize.getWidth() - departmentTitleWidth) / 2, 37)

    // AY Title
    const AYTitle = "AY.:"
    const AYTitleWidth = doc.getTextWidth(AYTitle)
    doc.text(AYTitle, (doc.internal.pageSize.getWidth() - AYTitleWidth) / 2, 42)

    // Current Date
    const currentDate = new Date().toLocaleDateString("en-GB")
    doc.setFont("Times-Roman", "normal")
    doc.text(`Date: ${currentDate}`, doc.internal.pageSize.getWidth() - 22, 45, { align: "right" })

    doc.setFont("Times-Roman", "bold")
    const noticeText = `${yearText} B.Tech. IT ${termText} Exam Time-Table`
    const noticeTextWidth = doc.getTextWidth(noticeText)
    doc.text(noticeText, (doc.internal.pageSize.getWidth() - noticeTextWidth) / 2, 53)

    // Adding Table Rows
    practical.forEach((sub, subIndex) => {
      const subjectRowCount = sub.data.length;
      sub.data.forEach((slot, slotIndex) => {
        const formattedDate = slot.date
          ? slot.date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }).replace(',', '')
          : "";
        const combinedBatch = slot.batch ? `Batch-${slot.batch}` : "";

        const row = [
          slotIndex === 0
            ? {
              content: sub.subject,
              rowSpan: subjectRowCount
            }
            : null,
          formattedDate,
          combinedBatch,
          slot.venue || "N/A"
        ].filter(cell => cell !== null);

        tableRows.push(row);
      });

      if (subIndex < practical.length - 1) {
        tableRows.push([
          {
            content: "",
            colSpan: 4,
            styles: {
              fillColor: [200, 200, 200],
              minCellHeight: 1,
              cellPadding: 0,
            },
          },
        ])
      }
    })

    // Set up table with Times New Roman font
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      margin: { left: 20, right: 20 },
      styles: {
        font: "Times-Roman",
        cellPadding: { top: 1, bottom: 1, left: 1, right: 1 },
        overflow: "linebreak",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        halign: "center",
        valign: 'middle',
      },
      headStyles: {
        fillColor: [169, 169, 169],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        valign: 'middle',
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        halign: "center",
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 40 },
        2: { cellWidth: 20 },
      },
    })

    doc.setFont("Times-Roman", "bold")
    doc.setFontSize(10)
    const noteTitle = "Note: Timings will be communicated by the respective subject in-charges"
    doc.text(noteTitle, 20, doc.autoTable.previous.finalY + 5, { align: "left" })

    const signatureY = doc.autoTable.previous.finalY + 30
    doc.text("Ms. Priyanca Gonsalves", 30, signatureY)
    doc.text("Ms. Neha Katre", 100, signatureY)
    doc.text("Dr. Vinaya Sawant", 150, signatureY)
    doc.text("Exam Coordinator", 35, signatureY + 4)
    doc.text("Associate Head", 100, signatureY + 4)
    doc.text("HOD, IT", 158, signatureY + 4)

    // Save the PDF
    doc.save(`Timetable_${yearText}_${termText}.pdf`)
  }


  return (
    <div className="container mx-auto min-h-[500px] p-10">
      <div className="space-y-6 mb-10">
        <div className="flex items-center justify-between border-b pb-4 px-5">
          <div className="flex items-center space-x-3">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Timetable</h1>
          </div>
        </div>

        <form onSubmit={downloadTTPDF} className="px-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative">
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Year
              </label>
              <div className="relative">
                <select
                  id="year"
                  value={yearText}
                  onChange={(e) => setYearText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 rounded-md
                     focus:ring-2 focus:ring-gray-400 focus:border-gray-400
                     appearance-none cursor-pointer shadow-sm transition-colors"
                >
                  <option value="" disabled>Select Year</option>
                  <option value="SY">Second Year</option>
                  <option value="TY">Third Year</option>
                  <option value="BE">Final Year</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700">
                Semester
              </label>
              <select
                onClick={handleSelectSubject}
                id="semester-select"
                value={selectedSemester}
                onChange={handleSemesterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Semester</option>
                {yearText && semesterOptions[yearText]
                  ? semesterOptions[yearText].map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))
                  : null}
              </select>
            </div>
            <div className="relative">
              <label
                htmlFor="term"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Term
              </label>
              <div className="relative">
                <select
                  id="term"
                  value={termText}
                  onChange={(e) => setTermText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 rounded-md
                     focus:ring-2 focus:ring-gray-400 focus:border-gray-400
                     appearance-none cursor-pointer shadow-sm transition-colors"
                >
                  <option value="" disabled>Select Term</option>
                  <option value="I">Term Test I</option>
                  <option value="II">Term Test II</option>
                  <option value="Re-Test">Re-Test</option>
                  <option value="Practical/Oral">Practical/Oral</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>{(termText === "I" || termText === "II" || termText === "Re-Test") && (
          <>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Time</th>
                  <th className="border border-gray-300 p-2">Name of Subject</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((day, dayIndex) => (
                  <React.Fragment key={dayIndex}>
                    {day.timeSlots.map((slot, slotIndex) => (
                      <tr key={`${dayIndex}-${slotIndex}`} className={dayIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {slotIndex === 0 && (
                          <td className="border border-gray-300 p-2" rowSpan={day.timeSlots.length}>
                            <DatePicker
                              selected={day.date}
                              onChange={(date) => updateDate(dayIndex, date)}
                              dateFormat="dd/MM/yyyy"
                              className="w-full p-2 border rounded"
                              placeholderText="Select date"
                            />
                          </td>
                        )}
                        <td className="border border-gray-300 p-2">
                          <div className="flex items-center space-x-2">
                            <DatePicker
                              selected={slot.startTime}
                              onChange={(date) => updateTimeSlot(dayIndex, slotIndex, "startTime", date)}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={15}
                              timeCaption="Start Time"
                              dateFormat="h:mm aa"
                              className="w-full p-2 border rounded"
                              placeholderText="Start time"
                            />
                            <span>-</span>
                            <DatePicker
                              selected={slot.endTime}
                              onChange={(date) => updateTimeSlot(dayIndex, slotIndex, "endTime", date)}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={15}
                              timeCaption="End Time"
                              dateFormat="h:mm aa"
                              className="w-full p-2 border rounded"
                              placeholderText="End time"
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2">
                          <select
                            value={slot.subject}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "subject", e.target.value)}
                            className="border p-2 w-full rounded"
                          >
                            <option value="" disabled>Select a subject</option>
                            {console.log("Sample Subject Data:", sampleSubjectData)}
                            {sampleSubjectData.map((subject, index) => (
                              <option key={index} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="border border-gray-300 p-2">
                          <div className="flex justify-center space-x-2">
                            <Button onClick={() => addTimeSlot(dayIndex)} size="icon">
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            {day.timeSlots.length > 1 && (
                              <Button onClick={() => removeTimeSlot(dayIndex, slotIndex)} size="icon">
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {slotIndex === 0 && (
                              <Button onClick={() => removeDay(dayIndex)} size="icon" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <div className="mt-6 flex space-x-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                onClick={addDay}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Day
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                onClick={downloadTTPDF}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download as PDF
              </button>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                onClick={handleSaveChanges}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Changes
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                onClick={handleClear}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </>
        )}
          {termText === "Practical/Oral" && (
            <>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Subject</th>
                    <th className="border border-gray-300 p-2">Date</th>
                    <th className="border border-gray-300 p-2">Batch</th>
                    <th className="border border-gray-300 p-2">Venue</th>
                    <th className="border border-gray-300 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {practical.map((sub, subIndex) => (
                    <React.Fragment key={sub}>
                      {sub.data.map((slot, slotIndex) => (
                        <tr key={`${subIndex}-${slotIndex}`} className={subIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {slotIndex === 0 && (
                            <td className="border border-gray-300 p-2" rowSpan={sub.data.length}>
                              <Input
                                value={sub.subject}
                                onChange={(e) => updateSubject(subIndex, e.target.value)}
                                placeholder="Enter subject"
                              />
                            </td>
                          )}
                          <td className="border border-gray-300 p-2">
                            <DatePicker
                              selected={slot.date}
                              onChange={(date) => updatedata(subIndex, slotIndex, "date", date)}
                              dateFormat="dd/MM/yyyy"
                              className="w-full p-2 border rounded"
                              placeholderText="Select date"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={slot.batch}
                              onChange={(e) => updatedata(subIndex, slotIndex, "batch", e.target.value)}
                              placeholder="Enter batch"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={slot.venue}
                              onChange={(e) => updatedata(subIndex, slotIndex, "venue", e.target.value)}
                              placeholder="Enter venue"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex justify-center space-x-2">
                              <Button onClick={() => adddata(subIndex)} size="icon">
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              {sub.data.length > 1 && (
                                <Button onClick={() => removedata(subIndex, slotIndex)} size="icon">
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {slotIndex === 0 && (
                                <Button onClick={() => removePracDay(subIndex)} size="icon" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 flex space-x-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                  onClick={addPracDay}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Day
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                  onClick={downloadPracPDF}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download as PDF
                </button>
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                  onClick={handleSaveChanges}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Changes
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
                  onClick={handleClear}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              </div>
            </>
          )}
        </>)}
    </div>
  )
}

export default TimeTable
