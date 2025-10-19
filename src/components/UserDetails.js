import React, { useState, useEffect, useRef } from 'react';
import './Login.css'; // Import the same CSS file used in Login
import './UserDetails.css';

const UserDetails = ({ userData }) => {
  const [willAttend, setWillAttend] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [guests, setGuests] = useState([
    { name: '', relationship: '', phone: '' },
    { name: '', relationship: '', phone: '' }
  ]);

  const relationships = ['Mother', 'Father', 'Brother', 'Sister', 'Uncle', 'Aunty','Husband','Wife','Grandfather','Grandmother'];

  useEffect(() => {
    // Check if student is already registered
    const checkRegistration = async () => {
      try {
        const response = await fetch(`http://117.213.202.136:5000/api/check-registration/${userData.rollno}`);
        const data = await response.json();
        if (data.registered) {
          setIsRegistered(true);
          setWillAttend(data.willAttend);
          if (data.guests) {
            setGuests(data.guests);
          }
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      }
    };
    checkRegistration();
  }, [userData.rollno]);

  const [showPaperCut, setShowPaperCut] = useState(false); // State for paper cut effect
  const videoRef = useRef(null); // Reference to the video element
  const [showConfetti, setShowConfetti] = useState(false); // State for confetti effect
  const [showVideo, setShowVideo] = useState(false); // State for video overlay
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [showEmailPopup, setShowEmailPopup] = useState(false); // State for email popup
  const [emailPopupData, setEmailPopupData] = useState(null); // State for email popup data
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button loading
  const [submissionStatus, setSubmissionStatus] = useState('submitting'); // Track submission status
  const [error, setError] = useState(''); // State for error messages
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const [referenceId, setReferenceId] = useState(''); // State for reference ID
  const [emailStatus, setEmailStatus] = useState(''); // State for email status

  const handleDownloadClick = () => {
    setShowVideo(true); // Show the video
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Set playback rate to slow motion
      videoRef.current.play(); // Play the video
      setTimeout(() => {
        setShowVideo(false); // Hide the video after a short duration
        window.open(`http://117.213.202.136:5000/api/generate-passes/${userData.rollno}`, '_blank');
      }, 3000); // Duration of the video playback
    }
  };

  if (isRegistered) {
    return (
      <div className="user-details-container">
        {showVideo && (
          <video className="overlay-video" autoPlay muted>
            <source src="/popup.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        <video ref={videoRef} className="background-video" autoPlay loop muted>
          <source src="/bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="user-details-box">
          <h1 className="main-header">Graduation Day 2K25</h1>
          <div className="registered-view">
            <h2>Welcome Back, {userData.name}</h2>
            <p><font color="red">You are registered for the Graduation Day</font></p>
            <button 
              className="download-button"
              onClick={handleDownloadClick}
            >
              Download Gate Pass
            </button>
            <button 
              className="logout-button"
              onClick={() => window.location.href = '/'}
            >
              Logout
            </button>
          </div>
          <footer className="footer">
            <p> © {new Date().getFullYear()} Developed by AtriDatta Lanka. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }

  const handleGuestChange = (index, field, value) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setGuests(newGuests);
  };

  const handleSubmit = async () => {
    // Clear previous messages
    setError('');
    setSuccessMessage('');
    setEmailStatus('');
    setReferenceId('');
    
    // Show immediate feedback that submission has started
    setIsSubmitting(true);
    
    // Show immediate notification to user
    setSubmissionStatus('submitting');
    setShowSuccessModal(true);
    
    try {
      // Validate guest names and phone numbers
      const validGuests = willAttend ? guests.filter(guest => {
        if (guest.name.length > 30) {
          setError('Guest name must not exceed 30 characters for ' + guest.name);
          setShowSuccessModal(false);
          setIsSubmitting(false);
          return false;
        }
        if (guest.name && guest.relationship) {
          if (guest.phone && !/^\d{10}$/.test(guest.phone)) {
            setError('Please enter a valid 10-digit phone number for ' + guest.name);
            setShowSuccessModal(false);
            setIsSubmitting(false);
            return false;
          }
          return true;
        }
        return false;
      }) : [];

      const response = await fetch('http://117.213.202.136:5000/api/submit-guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rollno: userData.rollno,
          willAttend,
          guests: validGuests
        })
      });

      const data = await response.json();
      console.log('Submit response data:', data); // Debug log
      
      if (data.success) {
        console.log('Submission successful, showing notifications'); // Debug log
        console.log('UserData received:', userData); // Debug log
        console.log('Email field:', userData.email); // Debug log
        
        // Set success message and details first
        setSuccessMessage(data.message || 'Registration completed successfully!');
        setReferenceId(data.userData?.referenceId || userData.referenceId || '');
        setEmailStatus(data.emailStatus || '');
        
        // Update status to success immediately
        setSubmissionStatus('success');
        console.log('Status updated to success'); // Debug log
        
        // Keep success modal visible for 8 seconds to ensure user sees the email confirmation
        setTimeout(() => {
          setShowSuccessModal(false);
          console.log('Success modal hidden after timeout'); // Debug log
        }, 8000);
        
        // Handle registration completion popup
        if (data.registrationComplete && data.popup && data.popup.show) {
          console.log('Showing email popup with data:', data.popup); // Debug log
          // Show email popup after a short delay so user sees both notifications
          setTimeout(() => {
            setEmailPopupData({
              type: data.popup.type,
              title: data.popup.title,
              message: data.popup.message,
              duration: data.popup.duration || 6000
            });
            setShowEmailPopup(true);
            
            // Auto-hide popup after specified duration
            setTimeout(() => {
              setShowEmailPopup(false);
              setEmailPopupData(null);
            }, data.popup.duration || 6000);
          }, 1000); // 1 second delay to show after success modal appears
        } else {
          console.log('No email popup to show'); // Debug log
        }
        
        // Only update registration status and open gate pass if user is attending
        if (willAttend) {
          setIsRegistered(true);
          // Open gate pass download after a longer delay to let user see success message
          setTimeout(() => {
            window.open(`http://117.213.202.136:5000/api/generate-passes/${userData.rollno}`, '_blank');
          }, 9000); // 9 seconds - after success modal closes
        }
      } else {
        console.log('Submission failed:', data.message); // Debug log
        
        // Update status to error and hide success modal
        setSubmissionStatus('error');
        setShowSuccessModal(false);
        
        // Set error message
        setError(data.message || 'Failed to save details. Please try again.');
        
        // Show error notification
        setEmailPopupData({
          type: 'error',
          title: 'Submission Failed',
          message: data.message || 'Failed to save details. Please try again.',
          duration: 5000
        });
        setShowEmailPopup(true);
        
        setTimeout(() => {
          setShowEmailPopup(false);
          setEmailPopupData(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      
      // Update status to error and hide success modal
      setSubmissionStatus('error');
      setShowSuccessModal(false);
      
      // Set error message
      setError('Server error. Please check your connection and try again.');
      
      // Show error notification for network/server errors
      setEmailPopupData({
        type: 'error',
        title: 'Connection Error',
        message: 'Server error. Please check your connection and try again.',
        duration: 5000
      });
      setShowEmailPopup(true);
      
      setTimeout(() => {
        setShowEmailPopup(false);
        setEmailPopupData(null);
      }, 5000);
    } finally {
      // Always reset submitting state
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-details-container">
      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-modal-content">
            <h3>
              {submissionStatus === 'submitting' ? 'Processing...' : 'Registration Successful! 🎉'}
            </h3>
            <p>
              {submissionStatus === 'success' 
                ? 'Please wait while we save your details...' 
                : 'Your details have been submitted successfully!'}
            </p>
            {submissionStatus === 'submitting' && (
              <div className="email-confirmation">
                <p className="email-sent-message">
                  🎉 <strong>SUCCESS!</strong> 🎉<br/>
                  📧 Registration confirmation mail sent to: <br/>
                  <strong style={{color: '#2e7d32', fontSize: '16px', background: '#e8f5e8', padding: '5px 10px', borderRadius: '5px', display: 'inline-block', marginTop: '5px'}}>
                    {userData.email || 'your registered email'}
                  </strong>
                </p>
                <p style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
                  ✅ Please check your email for confirmation details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Registration Completion Email Popup Modal */}
      {showEmailPopup && emailPopupData && (
        <div className="email-popup-overlay">
          <div className={`email-popup ${emailPopupData.type}`}>
            <div className="popup-header">
              <span className="popup-icon">
                {emailPopupData.type === 'success' ? '🎉' : '⚠️'}
              </span>
              <h3>{emailPopupData.title}</h3>
              <button 
                className="popup-close" 
                onClick={() => {
                  setShowEmailPopup(false);
                  setEmailPopupData(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="popup-content">
              <p>{emailPopupData.message}</p>
              <div className="popup-footer">
                <p><small>🎓 Your graduation registration is now complete!</small></p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <video className="background-video" autoPlay loop muted>
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="login-box">
        <h1 className="main-header">Graduation Day 2K25</h1>
        <h2>Student Details</h2>
        <div className="details-group">
          <label>Roll Number:</label>
          <p>{userData.rollno}</p>
        </div>
        <div className="details-group">
          <label>Name:</label>
          <p>{userData.name}</p>
        </div>
        
        <div className="details-group">
          <label>Branch:</label>
          <p>{userData.branch}</p>
        </div>

        <div className="attendance-section">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="attendance"
              checked={willAttend}
              onChange={(e) => setWillAttend(e.target.checked)}
            />
            <label htmlFor="attendance">I will attend the Graduation Day Program</label>
          </div>

          {willAttend && (
            <div className="guests-section">
              <h3>Guest Details (Optional)</h3>
              <p className="guest-note">You can bring up to 2 guests</p>
              {guests.map((guest, index) => (
                <div key={index} className="guest-inputs">
                  <h4 className="guest-title">Guest {index + 1}</h4>
                  <div className="guest-input-group">
                    <input
                      type="text"
                      placeholder="Guest Name"
                      value={guest.name}
                      onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                      className="guest-input guest-name"
                    />
                    <select
                      value={guest.relationship}
                      onChange={(e) => handleGuestChange(index, 'relationship', e.target.value)}
                      className="guest-input guest-relationship"
                    >
                      <option value="">Select Relationship</option>
                      {relationships.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={guest.phone}
                      onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                      maxLength="10"
                      pattern="[0-9]{10}"
                      className="guest-input guest-phone"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button 
            className={`submit-button ${willAttend ? 'enabled' : ''} ${isSubmitting ? 'submitting' : ''}`}
            onClick={handleSubmit}
            disabled={!willAttend || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          
          {/* Error and Success Messages */}
          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">
              <div className="success-header">
                <div className="success-icon">✅</div>
                <h3>Successfully Registered!</h3>
              </div>
              <p>{successMessage}</p>
              {referenceId && (
                <div className="reference-id">
                  <strong>Your Reference ID: {referenceId}</strong>
                  <p><small>Please save this Reference ID for future reference</small></p>
                </div>
              )}
              {emailStatus && (
                <div className="email-notification">
                  <div className="email-icon">📧</div>
                  <div className="email-status">
                    <strong>{emailStatus}</strong>
                    <p><small>Please check your email for confirmation details</small></p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <footer className="footer"> {/* Footer */}
          <p> © {new Date().getFullYear()} Developed by AtriDatta Lanka. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default UserDetails;