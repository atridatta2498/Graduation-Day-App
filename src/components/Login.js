import React, { useState, useEffect } from 'react';
import './Login.css';
import UserDetails from './UserDetails';  // Add this import

const Login = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [redirecting, setRedirecting] = useState(false); // State for redirecting message
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleChange = (e) => {  // Add the missing handleChange function
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation for Aadhar Number
    const aadharPattern = /^\d{12}$/;
    if (!aadharPattern.test(formData.password)) {
      setError('Aadhar Number must be exactly 12 digits.');
      return;
    }

    // Validation for Roll Number
    

    try {
      const response = await fetch('http://117.213.202.136:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rollno: formData.rollNumber,
          aadhar: formData.password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUserData(data.userData);
        setRedirecting(true); // Show redirecting message
        setTimeout(() => {
          setRedirecting(false); // Hide redirecting message after 3 seconds
          // Add your redirect logic here if needed
        }, 3000);
      } else {
        setError(data.message || 'Invalid Roll Number or Aadhar Number');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Server connection failed. Please try again.');
    }
  };

  useEffect(() => {
    const videoElement = document.querySelector('.background-video');
    if (videoElement) {
      videoElement.playbackRate = 0.5; // Set playback rate to slow motion
    }
  }, []);

  if (userData) {
    return <UserDetails userData={userData} />;
  }

  return (
    <div className="login-container">
      <video className="background-video" autoPlay loop muted>
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="login-box">
        <h1 className="main-header">Graduation Day 2K25</h1>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Roll Number:</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="Enter your roll number"
              required
            />
          </div>
          <div className="form-group">
            <label>Aadhar Number:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.12 14.12L9.88 9.88M9.88 9.88C8.84 8.84 8.84 7.16 9.88 6.12C10.92 5.08 12.6 5.08 13.64 6.12M9.88 9.88L6.18 6.18M14.12 14.12L17.82 17.82M14.12 14.12C15.16 15.16 15.16 16.84 14.12 17.88C13.08 18.92 11.4 18.92 10.36 17.88M6.18 6.18C4.17 7.44 2.5 9.6 2 12C2.5 14.4 4.17 16.56 6.18 17.82M6.18 6.18C7.94 4.84 10.44 4 12 4C17.52 4 22 8.48 22 14C22 15.56 21.16 17.06 19.82 17.82M17.82 17.82C16.06 19.16 13.56 20 12 20C6.48 20 2 15.52 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12C15 13.66 13.66 15 12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.458 12C3.732 7.943 7.522 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.522 19 3.732 16.057 2.458 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit">Login</button>
        </form>
        {redirecting && <div className="redirecting-message">Redirecting...</div>}
        <footer className="footer">
          <p> © {new Date().getFullYear()} Developed by AtriDatta Lanka. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;