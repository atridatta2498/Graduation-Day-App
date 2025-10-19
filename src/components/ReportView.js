import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ReportView.css";

const ReportView = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSubmittedStudent, setLastSubmittedStudent] = useState(null);
  const [groupedStudents, setGroupedStudents] = useState({});
  const [branchCounts, setBranchCounts] = useState({});

  const adminData = JSON.parse(sessionStorage.getItem("adminData"));
  const adminDataRef = useRef(adminData);

  useEffect(() => {
    adminDataRef.current = adminData;
  }, [adminData]);

  useEffect(() => {
    if (!adminData) {
      navigate("/admin-login");
      return;
    }

    const fetchStudents = async () => {
      try {
        const current = adminDataRef.current;
        const response = await axios.get(
          "http://117.213.202.136:5000/api/submitted-students",
          {
            params: {
              branch: current.branch,
              isExamAdmin: current.branch === "EXAM",
            },
          }
        );

        const studentList = response.data.students || [];

        // Sort roll numbers
        const sortedStudents = [...studentList].sort((a, b) => {
          const extractPrefix = (r) => r.slice(0, -4).toLowerCase();
          const extractSuffix = (r) => parseInt(r.slice(-4), 36);
          const pa = extractPrefix(a.rollno), pb = extractPrefix(b.rollno);
          if (pa < pb) return -1;
          if (pa > pb) return 1;
          return extractSuffix(a.rollno) - extractSuffix(b.rollno);
        });

        setStudents(sortedStudents);
        setError(null);

        // Group by branch
        const grouped = sortedStudents.reduce((acc, student) => {
          acc[student.branch] = acc[student.branch] || [];
          acc[student.branch].push(student);
          return acc;
        }, {});
        setGroupedStudents(grouped);

        // Branch counts
        setBranchCounts(
          Object.fromEntries(
            Object.entries(grouped).map(([br, list]) => [br, list.length])
          )
        );

        // Last submission
        setLastSubmittedStudent(
          sortedStudents.length > 0
            ? sortedStudents[sortedStudents.length - 1]
            : null
        );

      } catch (err) {
        setError("Failed to fetch submitted students. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    const intervalId = setInterval(fetchStudents, 10000); // every 30 seconds

    return () => clearInterval(intervalId);

  }, [navigate]);

  // Prepare sorted branches
  const sortedBranches = Object.keys(groupedStudents).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="login-container">
      <video className="background-video" autoPlay loop muted>
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="login-box">
        <h1 className="main-header">Graduation Day 2K25</h1>
        <h2>Reporting Student Details</h2>

        <div className="student-view-container">
          <div className="controls-container">
            <button onClick={() => window.print()} className="print-button">
              Print Report
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="back-button"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="print-section">
            {lastSubmittedStudent && (
              <div className="admin-info" style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", background: "#f9f9f9" }}>
                <h3>Last Submitted Student</h3>
                <p><b>Roll No:</b> {lastSubmittedStudent.rollno}</p>
                <p><b>Name:</b> {lastSubmittedStudent.student_name}</p>
                <p><b>Branch:</b> {lastSubmittedStudent.branch}</p>
              </div>
            )}

            {Object.keys(branchCounts).length > 0 && (
              <div className="admin-info" style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", background: "#f9f9f9" }}>
                <h3>Branch-wise Submission Statistics</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                  {Object.entries(branchCounts).map(([branch, count]) => (
                    <div key={branch} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", textAlign: "center" }}>
                      <p style={{ margin: 0, fontWeight: "bold" }}>{branch}</p>
                      <p style={{ margin: "5px 0", fontSize: "1.2em", color: "#4CAF50" }}>{count}</p>
                      <p style={{ margin: 0, fontSize: "0.8em" }}>students</p>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: "10px", textAlign: "right" }}>
                  <b>Total Submissions:</b> {students.length}
                </p>
              </div>
            )}

            {loading ? (
              <p className="loading">Loading students...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : sortedBranches.length === 0 ? (
              <p className="no-data">No students have submitted yet.</p>
            ) : (
              sortedBranches.map((branch) => (
                <div key={branch} style={{ marginTop: "30px" }}>
                  <h3>{branch} - Total Students: {groupedStudents[branch].length}</h3>
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Roll No</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedStudents[branch].map((student, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{student.rollno}</td>
                          <td>{student.student_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="footer">
          <p>© {new Date().getFullYear()} Developed by AtriDatta Lanka. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default ReportView;
