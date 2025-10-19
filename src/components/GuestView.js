import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestView.css';

const GuestView = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [isExamAdmin, setIsExamAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdminData = sessionStorage.getItem('adminData');
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    } else {
      navigate('/admin/');
      return;
    }

    const fetchGuests = async () => {
      try {
        const adminInfo = JSON.parse(storedAdminData);
        const response = await fetch('http://117.213.202.136:5000/api/guests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-username': adminInfo.username
          }
        });

        if (!response.ok) throw new Error('Failed to fetch guests');

        const data = await response.json();
        if (data.success) {
          setGuests(data.guests);
          setIsExamAdmin(data.isExamAdmin || false);
        } else {
          setError('Failed to load guests data');
        }
      } catch (error) {
        console.error('Error fetching guests:', error);
        setError('Error loading guests data');
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();

    // Auto-refresh guests data every 30 seconds
    const intervalId = setInterval(fetchGuests, 10000);

    // Cleanup the interval on unmount
    return () => clearInterval(intervalId);
  }, [navigate]);

  const sortGuests = (guestList) => {
    return [...guestList].sort((a, b) => {
      const extractPrefix = (rollno) => rollno.slice(0, -4).toLowerCase();
      const extractSuffix = (rollno) => parseInt(rollno.slice(-4), 36);  // refined suffix extraction
      const prefixA = extractPrefix(a.rollno);
      const prefixB = extractPrefix(b.rollno);
      if (prefixA < prefixB) return -1;
      if (prefixA > prefixB) return 1;
      return extractSuffix(a.rollno) - extractSuffix(b.rollno);
    });
  };

  const sortedGuests = sortGuests(guests);

  const groupedByBranch = isExamAdmin
    ? sortedGuests.reduce((acc, guest) => {
        if (!acc[guest.branch]) acc[guest.branch] = [];
        acc[guest.branch].push(guest);
        return acc;
      }, {})
    : null;

  const sortedBranchNames = groupedByBranch ? Object.keys(groupedByBranch).sort((a, b) => a.localeCompare(b)) : [];

  const handlePrint = () => {
    const printContent = document.querySelector('.guest-view-container');
    const originalContents = document.body.innerHTML;
    const printStyles = `
      <style>
        .footer, .background-video { display: none; }
        .guest-table { border-collapse: collapse; width: 100%; }
        .guest-table th, .guest-table td { 
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        .guest-table th { background-color: #f2f2f2; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    `;
    document.body.innerHTML = printStyles + printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) return <div className="guest-view"><div className="loading">Loading guests data...</div></div>;
  if (error) return (
    <div className="guest-view">
      <div className="error">{error}</div>
      <button onClick={() => navigate('/admin/dashboard')} className="back-button">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="login-container">
      <video className="background-video" autoPlay loop muted>
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="login-box">
        <h1 className="main-header">Graduation Day 2K25</h1>
        <h2>Guest Details</h2>
        <div className="guest-view-container">
          <div className="controls-container">
            <div className="branch-info">
              <h3>
                Branch: {adminData?.branch} {isExamAdmin ? '(All Branches Access)' : ''}
              </h3>
            </div>
            <button onClick={handlePrint} className="print-button">Print List</button>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">Back to Dashboard</button>
          </div>

          {isExamAdmin ? (
            <>
              <p><strong>Total Guests Registered (All Branches):</strong> {sortedGuests.length}</p>

              {sortedBranchNames.map(branch => (
                <div key={branch} className="branch-section">
                  <h3>{branch} - Guests: {groupedByBranch[branch].length}</h3>
                  <table className="guest-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Companion Name</th>
                        <th>Relationship</th>
                        <th>Mobile Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortGuests(groupedByBranch[branch]).map((guest, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{guest.rollno}</td>
                          <td>{guest.student_name}</td>
                          <td>{guest.guest_name}</td>
                          <td>{guest.relationship}</td>
                          <td>{guest.phone || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          ) : (
            <>
              <p><strong>Total Guests Registered in {adminData?.branch}:</strong> {sortedGuests.length}</p>
              {sortedGuests.length > 0 ? (
                <table className="guest-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Companion Name</th>
                      <th>Relationship</th>
                      <th>Mobile Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGuests.map((guest, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{guest.rollno}</td>
                        <td>{guest.student_name}</td>
                        <td>{guest.guest_name}</td>
                        <td>{guest.relationship}</td>
                        <td>{guest.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No guests registered.</p>
              )}
            </>
          )}

          <footer className="footer">
            <p>© {new Date().getFullYear()} Developed by AtriDatta Lanka. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default GuestView;
