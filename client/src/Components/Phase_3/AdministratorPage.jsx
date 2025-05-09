import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { CircularProgress, Box } from '@mui/material';

// Change this to your actual backend URL
const API_URL = 'http://localhost:5000/upload';

function StudentUpload() {
    const [formData, setFormData] = useState({
        year: 'TY',
        semester: '5',
        division: 'I1',
        type: 'Regular',
        subject: ''
    });

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherSubject, setOtherSubject] = useState('');

    // Update semester options based on selected year
    useEffect(() => {
        if (formData.year === 'SY') {
            setFormData(prev => ({ ...prev, semester: '3' }));
        } else if (formData.year === 'TY') {
            setFormData(prev => ({ ...prev, semester: '5' }));
        } else if (formData.year === 'BE') {
            setFormData(prev => ({ ...prev, semester: '7' }));
        }
    }, [formData.year]);

    // Fetch subjects when type changes to ILE, DLE, OE
    useEffect(() => {
        if (['ILE', 'DLE', 'OE'].includes(formData.type)) {
            fetchSubjects();
        }
    }, [formData.type, formData.year, formData.semester, formData.division]);

    // Replace the existing fetchSubjects function with this updated version
const fetchSubjects = async () => {
    try {
        // Format the semester parameter as required by the API
        const semesterParam = `Sem${formData.semester}_Subjects`;
        
        // Set coursetype based on the selected type
        let coursetype = "";
        if (formData.type === 'ILE') coursetype = "ILE";
        if (formData.type === 'DLE') coursetype = "DLE";
        if (formData.type === 'OE') coursetype = "OE";

        // Use the new API endpoint
        const response = await axios.get(
            `http://localhost:5000/api/subjects?semester=${semesterParam}&coursetype=${coursetype}`,
        );
        
        console.log("API Response:", response.data);
        
        // Extract subjects from response
        const subjectsData = response.data.data;
        if (Array.isArray(subjectsData)) {
            // Map to extract just the Subject property
            const subjectsArray = subjectsData.map((subject) => subject.Subject);
            console.log("Subjects Array:", subjectsArray);
            setSubjects(subjectsArray);
        } else {
            console.error("Expected an array but received:", subjectsData);
            setSubjects([]);
        }
    } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
    }
};

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Update form data
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset subject when type changes
        if (name === 'type') {
            setFormData(prev => ({ ...prev, subject: '' }));
            setShowOtherInput(false);
            setOtherSubject('');
        }

        // Handle "OTHER" subject option
        if (name === 'subject') {
            if (value === 'OTHER') {
                setShowOtherInput(true);
                setFormData(prev => ({ ...prev, subject: '' }));
            } else {
                setShowOtherInput(false);
            }
        }
    };

    const handleOtherSubjectChange = (e) => {
        const value = e.target.value;
        setOtherSubject(value);
        setFormData(prev => ({ ...prev, subject: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            
            // Check file extension
            if (!/\.(xlsx|xls)$/i.test(selectedFile.name)) {
                alert('Please select a valid Excel file (.xlsx or .xls)');
                e.target.value = '';  // Clear the file input
                return;
            }
            
            // Check file size (10MB max)
            if (selectedFile.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB limit');
                e.target.value = '';  // Clear the file input
                return;
            }
            
            setFile(selectedFile);
            console.log("Selected file:", selectedFile.name, selectedFile.type);  // Debug info
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file to upload');
            toast.error('Please select an Excel file');
            return;
        }
        // Special types require a subject
        if (['ILE', 'DLE', 'OE'].includes(formData.type) && !formData.subject) {
            toast.error('Please select or enter a subject for this type');
            return;
        }
        setLoading(true);
        const data = new FormData();
        data.append('excelFile', file);
        data.append('year', formData.year);
        data.append('semester', formData.semester);
        data.append('division', formData.division);
        data.append('type', formData.type);
        if (['ILE', 'DLE', 'OE'].includes(formData.type)) {
            data.append('subject', formData.subject);
        }
        try {
            alert('Uploading file...');
            const response = await axios.post(`${API_URL}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            console.log('Response:', response.data);

            if (response.data.success) {
                toast.success(response.data.message);

                // Reset file input
                document.getElementById('fileInput').value = '';
                setFile(null);

                // Refresh subjects if applicable
                if (['ILE', 'DLE', 'OE'].includes(formData.type)) {
                    fetchSubjects();
                }
            } else {
                alert(response.data.message);
                console.log('Upload failed:', response.data.message);
                toast.error(response.data.message);
            }
        } catch (error) {
            alert('Error uploading file. Please try again.');
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || 'Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            year: 'TY',
            semester: '5',
            division: 'I1',
            type: 'Regular',
            subject: ''
        });
        setFile(null);
        setShowOtherInput(false);
        setOtherSubject('');
        document.getElementById('fileInput').value = '';
        setLoading(false);
    }

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                    <label className="block text-gray-700 mb-1 font-medium">Year</label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                    >
                        <option value="">Select Year</option>
                        <option value="TY">TY</option>
                        <option value="SY">SY</option>
                        <option value="BE">BE</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Semester</label>
                    <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                    >
                        <option value="">Select Semester</option>
                        <option value="4">4</option>
                        <option value="6">6</option>
                        <option value="8">8</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Division</label>
                    <select
                        name="division"
                        value={formData.division}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                    >
                        <option value="">Select Division</option>
                        <option value="I1">I1</option>
                        <option value="I2">I2</option>
                        <option value="I3">I3</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                    >
                        <option value="">Select Type</option>
                        <option value="Regular">Regular</option>
                        <option value="ILE">ILE</option>
                        <option value="DLE">DLE</option>
                        <option value="OE">OE</option>
                        <option value="Minor">Minor</option>
                    </select>
                </div>

                {['ILE', 'DLE', 'OE'].includes(formData.type) && (
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Subject</label>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((sub, idx) => (
                                <option key={idx} value={sub}>{sub}</option>
                            ))}
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>
                )}

                {showOtherInput && (
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Other Subject Name</label>
                        <input
                            type="text"
                            value={otherSubject}
                            onChange={(e) => setOtherSubject(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Upload Excel File</label>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-sm text-gray-600 mt-1">Please upload an Excel file containing student data. Data should start from row 8.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload Data'}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="border border-gray-400 text-gray-700 px-5 py-2 rounded hover:bg-gray-100"
                    >
                        Reset
                    </button>
                </div>
            </form>

            <div className="mt-8 text-gray-700 text-sm leading-relaxed">
                <h3 className="font-semibold text-lg mb-2">Instructions</h3>
                <p><strong>File Format Requirements:</strong></p>
                <p>Excel file (.xlsx or .xls) with student information</p>
                <p>Data should start from <strong>row 8</strong></p>
                <p>Required columns: Sr. No., Roll No., SAP ID, Student Name</p>
                <p className="mt-2"><strong>Upload Types:</strong></p>
                <ul className="list-disc ml-6">
                    <li><strong>Regular:</strong> Main classroom students</li>
                    <li><strong>ILE:</strong> Institute Level Electives</li>
                    <li><strong>DLE:</strong> Department Level Electives</li>
                    <li><strong>OE:</strong> Open Electives</li>
                    <li><strong>Minors:</strong> Students pursuing additional courses</li>
                </ul>
                <p className="mt-2">For <strong>ILE, DLE, and OE</strong> types, you need to select or specify a subject. Students will be stored with their preferences.</p>
            </div>
        </div>
    );
}

export default StudentUpload;