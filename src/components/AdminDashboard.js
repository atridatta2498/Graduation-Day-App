import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    // Get admin data from sessionStorage
    const storedAdminData = sessionStorage.getItem('adminData');
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    } else {
      // If no admin data, redirect to login
      navigate('/admin/');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminData');
    navigate('/admin/');
  };

  if (!adminData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <video className="background-video" autoPlay loop muted>
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="dashboard-container">
        <h1 className="main-header">Graduation Day 2K25</h1>
        <h1 className="main-header">Admin Dashboard</h1>
        <div className="admin-info">
          <p><strong>Welcome, {adminData.username}!</strong></p>
          <p><strong>Branch:</strong> {adminData.branch} {adminData.branch === 'EXAM' ? '(All Branches Access)' : ''}</p>
        </div>
        <div className="dashboard-buttons">
          <button onClick={() => navigate('/admin/students')} className="dashboard-button">
            View Students 
          </button>
          <button onClick={() => navigate('/admin/guests')} className="dashboard-button">
            View Guests 
          </button>
          <button onClick={() => navigate('/admin/report')} className="dashboard-button">
            Reporting Students
          </button>
          <button onClick={handleLogout} className="dashboard-button">
            Logout
          </button>
        </div>
        <footer className="footer">
          <p> © {new Date().getFullYear()} Developed by AtriDatta Lanka. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;