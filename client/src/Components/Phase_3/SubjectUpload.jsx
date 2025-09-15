import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function SubjectUpload() {
    const [form, setForm] = useState({
        year: '',
        semester: '',
        courseType: '',
        subject: '',
        subCode: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.year || !form.semester || !form.courseType || !form.subject || !form.subCode) {
            toast.error("Please fill all fields");
            alert("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            // Compose the subject document
            const doc = {
                Subject: form.subject,
                Semester: Number(form.semester),
                [form.courseType]: 1,
                SubCode: form.subCode
            };
            // Sr. No. will be added in backend (or you can fetch and increment)
            // Send to backend (replace with your endpoint)
            const res = await axios.post('http://localhost:5000/api/subjects/upload', {
                year: form.year,
                semester: form.semester,
                subjectDoc: doc
            });
            toast.success("Subject uploaded successfully");
            alert("Subject uploaded successfully");
            setForm({
                year: '',
                semester: '',
                courseType: '',
                subject: '',
                subCode: ''
            });
        } catch (err) {
            toast.error("Failed to upload subject");
            alert("Failed to upload subject: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Subject Upload</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Year</label>
                    <select name="year" value={form.year} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                        <option value="">Select Year</option>
                        <option value="TY">TY</option>
                        <option value="SY">SY</option>
                        <option value="BE">BE</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1">Semester</label>
                    <select name="semester" value={form.semester} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                        <option value="">Select Semester</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1">Course Type</label>
                    <select name="courseType" value={form.courseType} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                        <option value="">Select Course Type</option>
                        <option value="Regular">Regular</option>
                        <option value="ILE">ILE</option>
                        <option value="DLE">DLE</option>
                        <option value="Honors_Minors">Honors/Minors</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1">Subject Name</label>
                    <input type="text" name="subject" value={form.subject} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block mb-1">Subject Code</label>
                    <input type="text" name="subCode" value={form.subCode} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Uploading...' : 'Upload Subject'}
                </button>
            </form>
        </div>
    );
}

export default SubjectUpload;