import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentView.css';

const StudentView = () => {
  const [students, setStudents] = useState([]);
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

    const fetchStudents = async () => {
      try {
        const adminInfo = JSON.parse(storedAdminData);
        const response = await fetch(`http://117.213.202.136:5000/api/students?branch=${adminInfo.branch}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-username': adminInfo.username
          }
        });

        if (!response.ok) throw new Error('Failed to fetch students');

        const data = await response.json();
        if (data.success) {
          setStudents(data.students);
          setIsExamAdmin(data.isExamAdmin || false);
        } else {
          setError('Failed to load students data');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Error loading students data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();

    // Set interval for automatic refresh every 30 seconds (30000 ms)
    const intervalId = setInterval(fetchStudents, 10000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);

  }, [navigate]);

  const sortStudents = (studentsList) => {
    return [...studentsList].sort((a, b) => {
      const extractPrefix = (rollno) => rollno.slice(0, -4).toLowerCase();
      const extractSuffix = (rollno) => parseInt(rollno.slice(-4), 36);
      const prefixA = extractPrefix(a.rollno);
      const prefixB = extractPrefix(b.rollno);
      if (prefixA < prefixB) return -1;
      if (prefixA > prefixB) return 1;
      return extractSuffix(a.rollno) - extractSuffix(b.rollno);
    });
  };

  const filteredStudents = sortStudents(students);

  const groupedByBranch = isExamAdmin
    ? filteredStudents.reduce((acc, student) => {
        if (!acc[student.branch]) acc[student.branch] = [];
        acc[student.branch].push(student);
        return acc;
      }, {})
    : null;

  const branchStatistics = isExamAdmin
    ? Object.fromEntries(
        Object.entries(groupedByBranch).map(([branch, list]) => [branch, list.length])
      )
    : null;

  if (loading) return <div className="student-view"><div className="loading">Loading students data...</div></div>;
  if (error) return (
    <div className="student-view">
      <div className="error">{error}</div>
      <button onClick={() => navigate('/admin/dashboard')} className="back-button">Back to Dashboard</button>
    </div>
  );

  const handlePrint = () => {
    const printContent = document.querySelector('.student-view-container');
    const originalContents = document.body.innerHTML;
    const printStyles = `
    
    `;
    document.body.innerHTML = printStyles + printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="login-container">
      <video className="background-video" autoPlay loop muted>
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="login-box">
        <h1 className="main-header">Graduation Day 2K25</h1>
        <h2>Student Details</h2>

        <div className="student-view-container">
          <div className="controls-container">
            <div className="branch-info">
              <h3>
                Branch: {adminData?.branch} {isExamAdmin ? '(All Branches Access)' : ''}
              </h3>
            </div>
            <button onClick={handlePrint} className="print-button">Print List</button>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">Back to Dashboard</button>
          </div>

          {/* Branch-wise Statistics */}
          {isExamAdmin && branchStatistics && (
            <div className="branch-statistics" style={{
              marginBottom: '20px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              background: 'transparent', // Transparent background
            }}>
              <h3>Branch-wise Student Statistics</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {Object.entries(branchStatistics)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([branch, count]) => (
                    <div key={branch} style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'center',
                      minWidth: '120px',
                      background: 'white', // Transparent card background
                    }}>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{branch}</p>
                      <p style={{ margin: '5px 0', fontSize: '1.2em', color: '#4CAF50' }}>{count}</p>
                      <p style={{ margin: 0, fontSize: '0.8em' }}>students</p>
                    </div>
                ))}
              </div>
              <p style={{ marginTop: '10px', textAlign: 'right' }}>
                <b>Total Students:</b> {filteredStudents.length}
              </p>
            </div>
          )}

          {/* Student Tables */}
          {isExamAdmin ? (
            Object.keys(groupedByBranch)
              .sort((a, b) => a.localeCompare(b))
              .map(branch => (
                <div key={branch} className="branch-section" style={{ marginBottom: '30px' }}>
                  <h3>{branch} - Total: {groupedByBranch[branch].length}</h3>
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>Attending</th>
                        <th>No. of Guests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortStudents(groupedByBranch[branch]).map((student, index) => (
                        <tr key={student.rollno}>
                          <td>{index + 1}</td>
                          <td>{student.rollno}</td>
                          <td>{student.name}</td>
                          
                          <td>{student.branch}</td>
                          <td>{student.will_attend ? 'Yes' : 'No'}</td>
                          <td>{student.guest_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
          ) : (
            <>
              <p><strong>Total Students in {adminData?.branch}:</strong> {filteredStudents.length}</p>
              {filteredStudents.length > 0 ? (
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Branch</th>
                      <th>Attending</th>
                      <th>No. of Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.rollno}>
                        <td>{index + 1}</td>
                        <td>{student.rollno}</td>
                        <td>{student.name}</td>
                        <td>{student.branch}</td>
                        <td>{student.will_attend ? 'Yes' : 'No'}</td>
                        <td>{student.guest_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No students found for the selected branch.</p>}
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

export default StudentView;
