import React, { useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // ✅ Reusing same CSS as AdminLogin

const StudentSearch = () => {
  const [rollNo, setRollNo] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [message, setMessage] = useState('');

  // Handle input change
  const handleRollNoChange = (e) => {
    setRollNo(e.target.value);
  };

  // Fetch student details
  const fetchStudentDetails = async () => {
    if (!rollNo.trim()) {
      setMessage('Please enter a Roll Number');
      return;
    }

    try {
  const response = await axios.get(`http://117.213.202.136:5000/api/getStudent/${rollNo}`);
      if (response.data) {
        setStudentData(response.data);
        setMessage('');
      } else {
        setStudentData(null);
        setMessage('No student found');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error: Unable to fetch student details. Please check the roll number and try again.');
    }
  };
// Submit student data
const submitStudentData = async () => {
  if (!studentData) return;

  try {
    const payload = {
      rollno: studentData.rollNo, // ✅ Send as rollno (lowercase) for consistency
      name: studentData.name,
      branch: studentData.branch
    };

    const response = await axios.post('http://117.213.202.136:5000/api/submitStudent', payload);
    setMessage(response.data.message || 'Registration Successfully Completed');
    } catch (error) {
      console.error(error);
      setMessage('Error: Failed to submit student details. or Already Registered ');
    }
  };
  return (
    <div className="admin-dashboard">
      {/* ✅ Background Video */}
      <video className="background-video" autoPlay loop muted>
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* ✅ Centered Container */}
      <div className="dashboard-container">
        <h1 className="main-header">Graduation Day 2K25</h1>
        <h2 className="main-header">Department Registration</h2>

        {/* ✅ Input Field */}
        <input
          type="text"
          value={rollNo}
          onChange={handleRollNoChange}
          placeholder="Enter Roll Number"
          className="input-field"
        />

        {/* ✅ Search Button */}
        <button onClick={fetchStudentDetails} className="dashboard-button">
          Search
        </button>

        {/* ✅ Display Student Data */}
        {studentData && (
          <div className="admin-info">
            <h3>Student Details</h3>
            <p><b>Roll No:</b> {studentData.rollNo}</p>
            <p><b>Name:</b> {studentData.name}</p>
            <p><b>Branch:</b> {studentData.branch}</p>

            {/* ✅ Submit Button */}
            <button onClick={submitStudentData} className="dashboard-button">
              Submit
            </button>
          </div>
        )}

        {/* ✅ Message */}
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
          <footer className="footer">
            <p> © {new Date().getFullYear()} Developed by AtriDatta Lanka. All rights reserved.</p>
          </footer>
      </div>
      
    </div>
  );
};

export default StudentSearch;
