import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

import GuestView from './components/GuestView';
import StudentView from './components/StudentView';

import StudentSearch from './components/StudentSearch';
import ReportView from './components/ReportView';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="admin/report" element={<ReportView />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<StudentView />} />
                <Route path="/admin/guests" element={<GuestView />} />
                 <Route path="/admin/student" element={<StudentSearch />} />
                
            </Routes>
        </Router>
    );
}

export default App;