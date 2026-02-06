import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:5000/upload'; // Your backend endpoint

function StudentUpload() {
    const [formData, setFormData] = useState({
        year: '',
        semester: '',
        division: '',
        type: '',
        subject: ''
    });

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherSubject, setOtherSubject] = useState('');
    const [filePreviews, setFilePreviews] = useState([]);

    useEffect(() => {
        if (formData.year === 'SY') setFormData(prev => ({ ...prev, semester: '3' }));
        else if (formData.year === 'TY') setFormData(prev => ({ ...prev, semester: '5' }));
        else if (formData.year === 'BE') setFormData(prev => ({ ...prev, semester: '7' }));
    }, [formData.year]);

    useEffect(() => {
        // Only fetch if type is elective and year/semester/type are set
        if (["ILE", "DLE", "OE"].includes(formData.type) && formData.year && formData.semester) {
            fetchSubjects();
        }
    }, [formData.type, formData.year, formData.semester]);

    // Fetch subjects based on year, semester, and coursetype as per subjectController.js
    const fetchSubjects = async () => {
        if (!formData.year || !formData.semester) return;
        try {
            let url = `http://localhost:5000/api/subjects?year=${formData.year}&semester=${formData.semester}`;
            if (["DLE", "ILE", "OE"].includes(formData.type)) {
                url += `&coursetype=${formData.type}`;
            }
            const res = await axios.get(url);
            console.log("Raw backend response:", res.data);
            if (res.data.success) {
                // Store only subject names as plain strings (no subcode, no curly braces)
                const subjectsArray = Array.isArray(res.data.data)
  ? res.data.data.map(s => (s.Subject || s.subject || s.name || '').trim())
  : [];
setSubjects(subjectsArray);
                console.log("Fetched Subjects:", subjectsArray);
            } else {
                console.error("Failed to fetch subjects", res.data);
                setSubjects([]);
            }
        } catch (err) {
            console.error("Error fetching subjects:", err);
            setSubjects([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'type') {
            setFormData(prev => ({ ...prev, subject: '' }));
            setShowOtherInput(false);
            setOtherSubject('');
        }

        if (name === 'subject') {
            if (value === 'OTHER') {
                setShowOtherInput(true);
                setFormData(prev => ({ ...prev, subject: '' }));
            } else {
                setShowOtherInput(false);
            }
        }
    };

    const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...selectedFiles];

    if (newFiles.length > 3) {
        alert("You can upload a maximum of 3 files.");
        e.target.value = '';
        return;
    }

    for (let file of selectedFiles) {
        if (!/\.(xlsx|xls)$/i.test(file.name)) {
            alert('Only .xlsx or .xls files allowed');
            e.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Each file must be smaller than 10MB');
            e.target.value = '';
            return;
        }
    }

    setFiles(newFiles);

    // Generate previews for all files (existing + newly added)
    Promise.all(newFiles.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve({
                    name: file.name,
                    preview: json.slice(0, 5)
                });
            };
            reader.readAsArrayBuffer(file);
        });
    })).then(previews => setFilePreviews(previews));
};


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (files.length === 0) {
            toast.error("Please upload at least one file");
            return;
        }

        if (['ILE', 'DLE', 'OE'].includes(formData.type) && !formData.subject) {
            toast.error("Subject is required for electives");
            return;
        }

        setLoading(true);

        const data = new FormData();
        files.forEach(file => data.append('excelFiles', file));
        data.append('year', formData.year);
        data.append('semester', formData.semester);
        data.append('batch', formData.division);
        data.append('type', formData.type);

        if (['ILE', 'DLE', 'OE'].includes(formData.type)) {
  data.append('selectedSubjects', JSON.stringify([formData.subject]));
}

        try {
            const res = await axios.post(API_URL, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message || "Upload successful");
                alert("Data has been uploaded successfully."); // <-- Alert after successful upload
                setFiles([]);
                setFilePreviews([]);
                document.getElementById('fileInput').value = '';
                if (['ILE', 'DLE', 'OE'].includes(formData.type)) {
                    fetchSubjects();
                }
            } else {
                toast.error(res.data.message || "Upload failed");
            }
        } catch (err) {
            console.error("Upload Error:", err);
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            year: '',
            semester: '',
            division: '',
            type: '',
            subject: ''
        });
        setFiles([]);
        setShowOtherInput(false);
        setOtherSubject('');
        setFilePreviews([]);
        document.getElementById('fileInput').value = '';
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Year */}
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Year</label>
                    <select name="year" value={formData.year} onChange={handleInputChange} className="w-full border px-3 py-2 rounded">
                        <option value="">Select Year</option>
                        <option value="TY">TY</option>
                        <option value="SY">SY</option>
                        <option value="BE">BE</option>
                    </select>
                </div>

                {/* Semester */}
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Semester</label>
                    <select name="semester" value={formData.semester} onChange={handleInputChange} className="w-full border px-3 py-2 rounded">
                        <option value="">Select Semester</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </div>

                {/* Division */}
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Division</label>
                    <select name="division" value={formData.division} onChange={handleInputChange} className="w-full border px-3 py-2 rounded">
                        <option value="">Select Division</option>
                        <option value="I1">I1</option>
                        <option value="I2">I2</option>
                        <option value="I3">I3</option>
                    </select>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border px-3 py-2 rounded">
                        <option value="">Select Type</option>
                        <option value="Regular">Regular</option>
                        <option value="ILE">ILE</option>
                        <option value="DLE">DLE</option>
                        <option value="OE">OE</option>
                        <option value="MINOR">MINORS</option>
                        <option value="HONOR">HONORS</option>
                    </select>
                </div>

                {/* Subject */}
                {['ILE', 'DLE', 'OE'].includes(formData.type) && (
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Subject</label>
                        <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full border px-3 py-2 rounded">
                            <option value="">Select Subject</option>
                            {subjects.map((sub, idx) => (
  sub && <option key={idx} value={sub}>{sub}</option>
))}
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>
                )}

                {/* Other Subject Input */}
                {showOtherInput && (
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Other Subject Name</label>
                        <input type="text" value={otherSubject} onChange={(e) => {
                            setOtherSubject(e.target.value);
                            setFormData(prev => ({ ...prev, subject: e.target.value }));
                        }} className="w-full border px-3 py-2 rounded" />
                    </div>
                )}

                {/* File Upload */}
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Upload Excel File(s)</label>
                    <input
                        id="fileInput"
                        type="file"
                        accept=".xlsx,.xls"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 3 files, each under 10MB. Data should start from row 8.</p>
                </div>

                {/* File Previews */}
                {filePreviews.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2 text-gray-700">File Preview</h4>
                        {filePreviews.map((file, idx) => (
                            <div key={idx} className="mb-4 border rounded p-2 bg-gray-50">
                                <div className="font-medium text-blue-700 mb-1">{file.name}</div>
                                <table className="text-xs w-full border-collapse">
                                    <tbody>
                                        {file.preview.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} className="border px-2 py-1">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Uploading...' : 'Upload Data'}
                    </button>
                    <button type="button" onClick={handleReset} className="border border-gray-400 px-5 py-2 rounded text-gray-700 hover:bg-gray-100">
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}

export default StudentUpload;