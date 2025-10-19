const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // For generating unique reference IDs

// Try to load QR code library, but don't break if it's not installed
let QRCode;
try {
  QRCode = require('qrcode');
  console.log('QR Code library loaded successfully');
} catch (error) {
  console.warn('QR Code library not available. Install qrcode with: npm install qrcode');
  console.warn('QR code functionality will be disabled until qrcode is installed.');
}

// Load environment variables from .env file
try {
  require('dotenv').config();
  console.log('Environment variables loaded from .env file');
} catch (error) {
  console.log('dotenv not installed or .env file not found. Using default values.');
  console.log('Install dotenv with: npm install dotenv');
}

// Try to load nodemailer, but don't break if it's not installed
let nodemailer;
let transporter;
let emailEnabled = false;

try {
  nodemailer = require('nodemailer');
  
  // SMTP Email configuration - supports multiple providers
  const emailConfig = {
    // Option 1: Gmail SMTP
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com', // Your email
      pass: process.env.SMTP_PASS || 'your-app-password' // Your app password
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  // Only create transporter if valid credentials are provided
  if (emailConfig.auth.user !== 'your-email@gmail.com' && emailConfig.auth.pass !== 'your-app-password') {
    transporter = nodemailer.createTransport(emailConfig);
    emailEnabled = true;
    console.log('SMTP Email service initialized with credentials');
    console.log(`Using SMTP server: ${emailConfig.host}:${emailConfig.port}`);
    
    // Verify SMTP configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP configuration error:', error.message);
        emailEnabled = false;
        console.log('Email functionality disabled due to SMTP error');
      } else {
        console.log('SMTP server is ready to send emails');
        emailEnabled = true;
      }
    });
  } else {
    console.warn('SMTP credentials not configured.');
    console.warn('Set environment variables:');
    console.warn('  SMTP_HOST=your-smtp-server (e.g., smtp.gmail.com)');
    console.warn('  SMTP_PORT=587');
    console.warn('  SMTP_USER=your-email@domain.com');
    console.warn('  SMTP_PASS=your-password-or-app-password');
    console.warn('');
    console.warn('For Gmail: Enable 2FA and generate App Password at:');
    console.warn('  https://myaccount.google.com/apppasswords');
  }
} catch (error) {
  console.warn('Email service not available. Install nodemailer with: npm install nodemailer');
  console.warn('Email functionality will be disabled until nodemailer is installed.');
}

// Function to generate unique reference ID
const generateReferenceId = () => {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GD2025-${timestamp.slice(-6)}-${randomString}`;
};

// Function to send registration email
const sendRegistrationEmail = async (userEmail, userName, rollno, referenceId) => {
  if (!emailEnabled || !transporter) {
    console.log('SMTP service not available. Skipping email for:', userEmail);
    return { success: false, error: 'SMTP service not configured' };
  }

  const mailOptions = {
    from: {
      name: 'Graduation Day 2025',
      address: process.env.SMTP_USER || 'graduation@college.edu'
    },
    to: userEmail,
    subject: '🎓 Graduation Day 2025 - Registration Successful! ✅',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #8B0000, #006400); 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .graduation-icon {
            font-size: 24px;
            margin-right: 10px;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .success-badge {
            background: #28a745;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin: 12px 0 4px 0;
          }
          .header-subtitle {
            margin: 4px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
            font-weight: 500;
          }
          .content { 
            padding: 30px 25px; 
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 15px;
          }
          .congratulations {
            color: #28a745;
            font-weight: bold;
          }
          .reference-box {
            background: #d4edda;
            border: 2px solid #28a745;
            border-radius: 10px;
            padding: 18px;
            text-align: center;
            margin: 20px 0;
          }
          .reference-label {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #155724;
            font-weight: 600;
          }
          .reference-id {
            font-size: 18px;
            color: #155724;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .reference-note {
            margin: 6px 0 0 0;
            font-size: 11px;
            color: #666;
            font-style: italic;
          }
          .details-box { 
            background: #fff3cd; 
            border: 1px solid #ffc107;
            border-radius: 10px;
            padding: 20px; 
            margin: 20px 0; 
          }
          .details-header {
            margin-top: 0;
            color: #856404;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
          }
          .details-item {
            margin: 10px 0;
            font-size: 13px;
          }
          .details-label {
            font-weight: 600;
            color: #333;
          }
          .details-value {
            color: #555;
          }
          .status-confirmed {
            color: #28a745;
            font-weight: bold;
          }
          .next-steps-box {
            background: #e7f3ff;
            border-left: 4px solid #007bff;
            border-radius: 0 8px 8px 0;
            padding: 20px;
            margin: 20px 0;
          }
          .next-steps-header {
            margin-top: 0;
            color: #0056b3;
            font-size: 16px;
            font-weight: bold;
          }
          .steps-list {
            margin: 12px 0;
            padding-left: 0;
            list-style: none;
          }
          .steps-list li {
            margin: 10px 0;
            padding-left: 22px;
            position: relative;
            font-size: 13px;
          }
          .steps-list li:before {
            content: '✅';
            position: absolute;
            left: 0;
            top: 0;
          }
          .important-note {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 18px;
            margin: 20px 0;
            font-size: 13px;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding: 20px 18px;
            background: #f8f9fa;
            border-top: 1px solid #eee;
            color: #666; 
            font-size: 12px;
            border-radius: 0 0 10px 10px;
          }
          .footer-line {
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="graduation-icon">🎓</span> SVEC GRADUATION DAY 2K25</h1>
            <div class="success-badge">✅ SUCCESSFULLY REGISTERED</div>
            <p class="header-subtitle">Registration Confirmation</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear <strong>${userName}</strong>,
            </div>
            
            <p><span class="congratulations">🎉 Congratulations!</span> Your registration for Graduation Day 2K25 has been <span class="congratulations">successfully completed</span>.</p>
            
            <div class="reference-box">
              <p class="reference-label">Your Unique Reference ID</p>
              <div class="reference-id">${referenceId}</div>
              <p class="reference-note">Please save this ID for future reference</p>
            </div>
            
            <div class="details-box">
              <h3 class="details-header">📋 Registration Details:</h3>
              <div class="details-item">
                <span class="details-label">Roll Number:</span> 
                <span class="details-value">${rollno}</span>
              </div>
              <div class="details-item">
                <span class="details-label">Student Name:</span> 
                <span class="details-value">${userName}</span>
              </div>
              <div class="details-item">
                <span class="details-label">Registration Status:</span> 
                <span class="status-confirmed">✅ CONFIRMED</span>
              </div>
              <div class="details-item">
                <span class="details-label">Registration Date:</span> 
                <span class="details-value">${new Date().toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
              <div class="details-item">
                <span class="details-label">Registration Time:</span> 
                <span class="details-value">${new Date().toLocaleTimeString('en-IN')}</span>
              </div>
            </div>
            
            <div class="next-steps-box">
              <h3 class="next-steps-header">📋 Next Steps:</h3>
              <ul class="steps-list">
                <li><strong>Registration Complete:</strong> Your spot is confirmed for Graduation Day 2K25</li>
                <li><strong>Keep your Reference ID safe</strong> for all future correspondence</li>
                <li><strong>Download your gate pass</strong> after completing guest registration</li>
                <li><strong>Event Date:</strong>30<sup>th</sup> August 2025</li>
                <li><strong>Bring a printed copy</strong> of your gate pass on the event day</li>
              </ul>
            </div>
            
            <div class="important-note">
              <strong>📌 Important Note:</strong> Please save this email for your records. You may need the Reference ID for future inquiries about your graduation.
            </div>
            
            <div class="footer">
              <div class="footer-line"><strong>This is an automated email. Please do not reply to this email.</strong></div>
              <div class="footer-line">For support, contact your college administration.</div>
              <div class="footer-line">© ${new Date().getFullYear()} Graduation Day Developed by AtriDatta Lanka</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    // Text version for email clients that don't support HTML
    text: `
Dear ${userName},

Congratulations! Your registration for Graduation Day 2025 has been successfully completed.

REFERENCE ID: ${referenceId}
(Please save this ID for future reference)

Registration Details:
- Roll Number: ${rollno}
- Student Name: ${userName}
- Registration Date: ${new Date().toLocaleDateString('en-IN')}

Next Steps:
1. Log in to your portal to add guest details
2. Confirm your attendance status  
3. Download your official gate pass

Portal Access: http://117.213.202.136:3000

Important: Please save this email for your records.

© ${new Date().getFullYear()} College Management | Developed by AtriDatta Lanka
    `
  };

  try {
    console.log(`Attempting to send email to: ${userEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Email sent to: ${userEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ SMTP Email sending failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    return { success: false, error: error.message };
  }
};

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'graduation'
});

// Create user_references table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS user_references (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rollno VARCHAR(20) UNIQUE NOT NULL,
    reference_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(rollno),
    INDEX(reference_id)
  )
`, (err, result) => {
  if (err) {
    console.error('Error creating user_references table:', err);
  } else {
    console.log('user_references table ready');
  }
});

app.post('/api/login', (req, res) => {
  const { rollno, aadhar } = req.body;

  // Simple fast login - just authenticate user
  const sql = "SELECT rollno, name, branch, email FROM users WHERE rollno = ? AND aadhar = ?";
    
  db.query(sql, [rollno, aadhar], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length > 0) {
      const user = result[0];
      
      // Fast response - no reference ID generation during login
      res.json({ 
        success: true, 
        userData: {
          rollno: user.rollno,
          name: user.name,
          branch: user.branch,
          email: user.email
        },
        message: '🎉 Login successful! Please complete your guest registration.'
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

// API endpoint to get reference ID for a student
app.get('/api/reference/:rollno', (req, res) => {
  const rollno = req.params.rollno;
  
  const sql = "SELECT reference_id, created_at FROM user_references WHERE rollno = ?";
  db.query(sql, [rollno], (err, result) => {
    if (err) {
      console.error('Error fetching reference ID:', err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length > 0) {
      res.json({
        success: true,
        referenceId: result[0].reference_id,
        createdAt: result[0].created_at
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Reference ID not found"
      });
    }
  });
});

// Database-based admin login with branch-wise access and mandatory password change
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;

  console.log('Admin login attempt:', { username, passwordLength: password?.length });

  // First check if is_first_login column exists, if not add it
  const checkColumnSql = "SHOW COLUMNS FROM adminusers LIKE 'is_first_login'";
  
  db.query(checkColumnSql, (err, result) => {
    if (err) {
      console.error('Error checking column:', err);
    }
    
    // If column doesn't exist, add it
    if (result.length === 0) {
      const addColumnSql = "ALTER TABLE adminusers ADD COLUMN is_first_login TINYINT(1) DEFAULT 1";
      db.query(addColumnSql, (err, result) => {
        if (err) {
          console.error('Error adding is_first_login column:', err);
        } else {
          console.log('Added is_first_login column to adminusers table');
        }
      });
    }
  });

  const sql = "SELECT id, username, password, branch, COALESCE(is_first_login, 1) as is_first_login FROM adminusers WHERE UPPER(username) = UPPER(?)";
  
  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Database error during admin login:', err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error occurred" 
      });
    }
    
    console.log('Database query result:', result.length > 0 ? 'User found' : 'User not found');
    
    if (result.length > 0) {
      const admin = result[0];
      console.log('Admin data:', { 
        username: admin.username, 
        branch: admin.branch, 
        is_first_login: admin.is_first_login,
        storedPassword: admin.password,
        enteredPassword: password,
        passwordMatches: password === admin.password 
      });
      
      // Check if this is first login - compare plain text password
      if (admin.is_first_login === 1) {
        // For first time login, compare plain text password
        if (password === admin.password) {
          console.log('First login successful, requiring password change');
          res.json({ 
            success: true, 
            requirePasswordChange: true,  // FORCE password change
            adminData: {
              id: admin.id,
              username: admin.username,
              branch: admin.branch,
              isFirstLogin: true
            },
            message: "First login detected. You must change your password to continue."
          });
        } else {
          console.log('First login failed - password mismatch');
          res.status(401).json({ 
            success: false, 
            message: "Invalid credentials for first-time login. Please check the password." 
          });
        }
      } else {
        // For users who have already changed their password
        bcrypt.compare(password, admin.password, (err, isMatch) => {
          if (err) {
            console.error('Password comparison error:', err);
            return res.status(500).json({ 
              success: false, 
              message: "Authentication error" 
            });
          }
          
          if (isMatch) {
            console.log('Login successful for returning user');
            res.json({ 
              success: true, 
              requirePasswordChange: false,  // No password change needed
              adminData: {
                id: admin.id,
                username: admin.username,
                branch: admin.branch,
                isFirstLogin: false
              }
            });
          } else {
            console.log('Login failed - password mismatch for returning user');
            res.status(401).json({ 
              success: false, 
              message: "Invalid credentials" 
            });
          }
        });
      }
    } else {
      console.log('User not found in database');
      res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
  });
});

// Password change endpoint
app.post('/api/change-password', async (req, res) => {
  const { username, currentPassword, newPassword, confirmPassword } = req.body;

  // Strict validation
  if (!username || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "New passwords do not match"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }

  // Check password strength
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password"
    });
  }

  try {
    // Get current user data
    const getUserSql = "SELECT password, COALESCE(is_first_login, 1) as is_first_login FROM adminusers WHERE username = ?";
    
    db.query(getUserSql, [username], async (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: "Database error occurred"
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const user = result[0];

      // Verify current password
      let isCurrentPasswordValid = false;
      
      if (user.is_first_login === 1) {
        // For first login, compare plain text
        isCurrentPasswordValid = (currentPassword === user.password);
      } else {
        // For subsequent logins, compare hashed password
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      }

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Hash the new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and ENSURE is_first_login is set to 0
      const updateSql = "UPDATE adminusers SET password = ?, is_first_login = 0 WHERE username = ?";
      
      db.query(updateSql, [hashedNewPassword, username], (err, result) => {
        if (err) {
          console.error('Password update error:', err);
          return res.status(500).json({
            success: false,
            message: "Failed to update password"
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found or password not updated"
          });
        }

        res.json({
          success: true,
          message: "Password changed successfully. You can now access the dashboard."
        });
      });
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to change password"
    });
  }
});

// Middleware to check if password change is required and verify branch access
const requirePasswordChangeAndBranchAccess = (req, res, next) => {
  // Get username from request headers or body
  const username = req.headers['x-admin-username'] || req.body.username;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Admin username is required in headers (x-admin-username)"
    });
  }

  const sql = "SELECT is_first_login, branch FROM adminusers WHERE username = ?";
  
  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: "Database error occurred"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found"
      });
    }

    if (result[0].is_first_login === 1) {
      return res.status(403).json({
        success: false,
        message: "Password change required. Please change your password to continue.",
        requirePasswordChange: true
      });
    }

    // Add branch info to request for use in route handlers
    req.adminBranch = result[0].branch;
    req.isExamAdmin = result[0].branch === 'EXAM'; // Flag for exam admins to access all data
    next();
  });
};

app.post('/api/submit-guests', async (req, res) => {
  const { rollno, willAttend, guests } = req.body;

  // First check if attendance already exists
  const checkSql = "SELECT * FROM attendance WHERE rollno = ?";
  db.query(checkSql, [rollno], async (err, result) => {
    if (err) {
      console.error('Error checking attendance:', err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    try {
      if (result.length > 0) {
        // Update existing attendance
        const updateSql = "UPDATE attendance SET will_attend = ? WHERE rollno = ?";
        await new Promise((resolve, reject) => {
          db.query(updateSql, [willAttend, rollno], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // Delete existing guests if any
        const deleteGuestsSql = "DELETE FROM guests WHERE rollno = ?";
        await new Promise((resolve, reject) => {
          db.query(deleteGuestsSql, [rollno], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // Insert new guests if any
        if (willAttend && guests && guests.length > 0) {
          const guestSql = "INSERT INTO guests (rollno, guest_name, relationship, phone) VALUES ?";
          const guestValues = guests.map(guest => [rollno, guest.name, guest.relationship, guest.phone || '']);

          await new Promise((resolve, reject) => {
            db.query(guestSql, [guestValues], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }
      } else {
        // Insert new attendance record
        const attendanceSql = "INSERT INTO attendance (rollno, will_attend) VALUES (?, ?)";
        await new Promise((resolve, reject) => {
          db.query(attendanceSql, [rollno, willAttend], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        if (willAttend && guests && guests.length > 0) {
          const guestSql = "INSERT INTO guests (rollno, guest_name, relationship, phone) VALUES ?";
          const guestValues = guests.map(guest => [rollno, guest.name, guest.relationship, guest.phone || '']);

          await new Promise((resolve, reject) => {
            db.query(guestSql, [guestValues], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }
      }

      // Get user details for email and reference ID
      const getUserSql = `
        SELECT u.rollno, u.name, u.branch, u.email,
               ur.reference_id
        FROM users u
        LEFT JOIN user_references ur ON u.rollno = ur.rollno
        WHERE u.rollno = ?`;
      
      const userData = await new Promise((resolve, reject) => {
        db.query(getUserSql, [rollno], (err, result) => {
          if (err) reject(err);
          else resolve(result[0]);
        });
      });

      // Generate reference ID only once during submit if it doesn't exist
      let referenceId = userData.reference_id;
      
      if (!referenceId) {
        referenceId = generateReferenceId();
        
        // Store reference ID in database
        await new Promise((resolve, reject) => {
          const insertReferenceSql = "INSERT INTO user_references (rollno, reference_id, created_at) VALUES (?, ?, NOW())";
          db.query(insertReferenceSql, [rollno, referenceId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        
        // Update userData with new reference ID
        userData.reference_id = referenceId;
      }

      // Send registration email after guest details are submitted
      let emailStatus = '';
      let emailSuccess = false;
      
      if (userData && userData.email && userData.email.includes('@') && emailEnabled) {
        try {
          const emailResult = await sendRegistrationEmail(
            userData.email, 
            userData.name, 
            userData.rollno, 
            userData.reference_id || 'N/A'
          );
          console.log('Email sending result:', emailResult);
          
          if (emailResult.success) {
            emailStatus = '✅ Registration confirmation email sent successfully to: ' + userData.email;
            emailSuccess = true;
          } else {
            emailStatus = '⚠️ Failed to send email: ' + (emailResult.error || 'Unknown error');
            emailSuccess = false;
          }
        } catch (error) {
          console.error('Email sending error:', error);
          emailStatus = '⚠️ Email could not be sent. Please contact support. Error: ' + error.message;
          emailSuccess = false;
        }
      } else {
        if (!emailEnabled) {
          emailStatus = '⚠️ Email service temporarily unavailable. Please contact administrator.';
        } else if (!userData || !userData.email) {
          emailStatus = '📧 No valid email address found. Please update your email to receive notifications.';
        }
        emailSuccess = false;
      }

      // Return success response with email notification
      res.json({ 
        success: true, 
        message: "🎉 Registration completed successfully! Your details have been saved.",
        userData: userData,
        emailStatus: emailStatus,
        emailSuccess: emailSuccess,
        registrationComplete: true
      });

    } catch (error) {
      console.error('Error submitting guest details:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to save details",
        error: error.message 
      });
    }
  });
});
app.get('/api/getStudent/:rollNo', (req, res) => {
  const rollNo = req.params.rollNo;

  // Fetch student only if rollNo exists in both users and attendance tables
  const query = `
    SELECT u.rollNo, u.name, u.branch
    FROM users u
    INNER JOIN attendance a ON u.rollNo = a.rollNo
    WHERE u.rollNo = ?
  `;
  db.query(query, [rollNo], (err, result) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Student not found or not registered' });
    }

    res.json(result[0]);
  });
});

// ✅ API: Submit student data (Insert into another table or log)
app.post('/api/submitStudent', (req, res) => {
  const { rollno, name, branch } = req.body;

  if (!rollno || !name || !branch) {
      return res.status(400).json({ message: 'Missing student details' });
  }

  const query = 'INSERT INTO submitted_students (rollNo, name, branch) VALUES (?, ?, ?)';
  db.query(query, [rollno, name, branch], (err) => {
      if (err) {
          console.error('Error inserting student data:', err);
          return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Registration Successful' });
  });
});
app.get('/api/submitted-students', (req, res) => {
  const branch = req.query.branch;       // e.g., "CSE", "ECE", "EXAM"
  const isExamAdmin = req.query.isExamAdmin === 'true' || branch === 'EXAM';

  let query = '';
  let params = [];

  if (isExamAdmin) {
    // Exam admin → show all branches
    query = `
      SELECT s.*, u.name AS student_name, u.branch
      FROM submitted_students s
      INNER JOIN users u ON s.rollno = u.rollno
      ORDER BY u.branch, u.name
    `;
  } else if (branch) {
    // Branch admin → show only their branch
    query = `
      SELECT s.*, u.name AS student_name, u.branch
      FROM submitted_students s
      INNER JOIN users u ON s.rollno = u.rollno
      WHERE u.branch = ?
      ORDER BY u.name
    `;
    params = [branch];
  } else {
    return res.status(400).json({ message: 'Branch is required' });
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ success: true, students: results });
  });
});







app.listen(5000, () => {
  console.log('Server running on port 5000');
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.get('/api/generate-passes/:rollno', (req, res) => {
    const rollno = req.params.rollno;
    const pdfPath = path.join(__dirname, 'uploads', `svec_gatepass_${rollno}.pdf`);
    const logoPath = 'd:/gdays/public/image.png';

    // Add debug log
    console.log('Logo path:', logoPath);
    
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
        console.error('Logo file not found at:', logoPath);
        return res.status(500).json({ error: "Logo file not found" });
    }

    const sql = `
        SELECT u.name, u.rollno, u.branch, u.father, u.program,
               g.guest_name, g.relationship, g.phone,
               ur.reference_id
        FROM users u
        LEFT JOIN guests g ON u.rollno = g.rollno
        LEFT JOIN user_references ur ON u.rollno = ur.rollno
        WHERE u.rollno = ?`;

    db.query(sql, [rollno], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No data found for the given roll number" });
        }

        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const writeStream = fs.createWriteStream(pdfPath);

            doc.on('error', (err) => {
                console.error('PDF generation error:', err);
                return res.status(500).json({ error: "Failed to generate PDF" });
            });

            writeStream.on('error', (err) => {
                console.error('Write stream error:', err);
                return res.status(500).json({ error: "Failed to save PDF" });
            });

            writeStream.on('finish', () => {
                const fileStream = fs.createReadStream(pdfPath);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=svec_gatepass_${rollno}.pdf`);
                fileStream.pipe(res);
            });

            doc.image(logoPath, {
              fit: [500, 100], // Adjust width and height as needed
              x: 50,
              y: 30 // Place near top
          });
            
            
            
            // College details aligned with logo
            
            
            const leftMargin = 50;
            doc.font('Helvetica')
               .fillColor('black')
               .fontSize(7)
               .text('Reference Id: ', leftMargin, null, { align: 'left', continued: true })
               .font('Helvetica-Bold').text(`${results[0].reference_id}`, { align: 'left' });
                 
            // Continue with graduation day title
            doc.fontSize(14).fillColor('red').text('IV - Graduation Day', leftMargin, null, { align: 'center' });
            doc.fillColor('black'); // Reset color
            doc.fontSize(12).text('(August - 2025)', { align: 'center' })
               .moveDown();

            // Add congratulatory message
            doc.fontSize(12)
               .text('Dear: ', leftMargin, null, { align: 'left', continued: true })
               .font('Helvetica-Bold').text(`${results[0].name}, Congratulations!`, { align: 'left' })
               .moveDown();

            // Add horizontal line
            doc.moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke()
               .moveDown(1)
            
            // Add Registration Acknowledgement header
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .text('Registration Acknowledgement', { align: 'center' })
               .moveDown(1)
            doc.fontSize(11)
              .font('Helvetica')
               .text('H.T.No: ', leftMargin, null, { align: 'left', continued: true })
               .font('Helvetica-Bold').text(`${results[0].rollno}`, { align: 'left' })
               .font('Helvetica')
               .text('Name of the Candidate: ', leftMargin, null, { align: 'left', continued: true })
               .font('Helvetica-Bold').text(`${results[0].name}`, { align: 'left' })
               .font('Helvetica')
               .text('Father /Guardian Name:', leftMargin, null, { align: 'left', continued: true })
               .font('Helvetica-Bold').text(`${results[0].father}`, { align: 'left' })
               .font('Helvetica')
               .text('Program / Branch:', leftMargin, null, { align: 'left', continued: true })
                .font('Helvetica-Bold').text(`${results[0].program} - ${results[0].branch}`, { align: 'left' })
             
                              
               .moveDown(2);

            // Define guests array for use in QR code
            const guests = results.filter(r => r.guest_name);

            // Generate QR Code with student details if QR library is available
            if (QRCode) {
                try {
                    // Create a concise QR code for faster scanning
                    const qrCodeText = `SVEC-GD2025|${results[0].rollno}|${results[0].name}|${results[0].branch}}`;
                    
                    // Generate QR code as buffer with optimized settings for faster scanning
                    const qrCodeBuffer = await QRCode.toBuffer(qrCodeText, {
                        width: 100,
                        margin: 2,
                        errorCorrectionLevel: 'L', // Low error correction for faster scanning
                        type: 'png',
                        quality: 0.85,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });

                    // Position QR code on the right side
                    const qrX = 450; // Right side position
                    const qrY = doc.y - 100; // Align with Registration Acknowledgement
                    
                    // Add QR code to PDF
                    doc.image(qrCodeBuffer, qrX, qrY, {
                        width: 80,
                        height: 80
                    });

                    // Add QR code label with more details
                    doc.fontSize(7)
                       .font('Helvetica')
                       .text('Scan for Verification', qrX + 13, qrY + 85, { align: 'center', width: 70 })
                       .text(`GP-${results[0].rollno}`, qrX + 13, qrY + 95, { align: 'center', width: 70 });
                } catch (qrError) {
                    console.error('Error generating QR code:', qrError);
                    // Continue without QR code if there's an error
                }
            }

            // Guest Details in Table Format
            doc.fontSize(12).text('Details of the Companions:', leftMargin, null, { underline: true, align: 'left' });
            
            // Table headers
            const startX = 50;
            const columnWidth = [60, 200, 140, 140];
            const rowHeight = 25;
            let currentY = doc.y + 10;

            // Draw table header with individual cell borders
            doc.lineWidth(1);
            // S. No column
            doc.rect(startX, currentY, columnWidth[0], rowHeight).stroke();
            // Name column
            doc.rect(startX + columnWidth[0], currentY, columnWidth[1], rowHeight).stroke();
            // Relation column
            doc.rect(startX + columnWidth[0] + columnWidth[1], currentY, columnWidth[2], rowHeight).stroke();
            // Contact No column
            doc.rect(startX + columnWidth[0] + columnWidth[1] + columnWidth[2], currentY, columnWidth[3], rowHeight).stroke();

            // Header text with bold font
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('S. No', startX + 5, currentY + 7);
            doc.text('Name', startX + columnWidth[0] + 5, currentY + 7);
            doc.text('Relation', startX + columnWidth[0] + columnWidth[1] + 5, currentY + 7);
            doc.text('Contact No.', startX + columnWidth[0] + columnWidth[1] + columnWidth[2] + 5, currentY + 7);
            
            // Reset font to normal for table content
            doc.font('Helvetica');

            // Draw table rows with individual cell borders
            guests.forEach((guest, index) => {
                currentY += rowHeight;
                // S. No column
                doc.rect(startX, currentY, columnWidth[0], rowHeight).stroke();
                // Name column
                doc.rect(startX + columnWidth[0], currentY, columnWidth[1], rowHeight).stroke();
                // Relation column
                doc.rect(startX + columnWidth[0] + columnWidth[1], currentY, columnWidth[2], rowHeight).stroke();
                // Contact No column
                doc.rect(startX + columnWidth[0] + columnWidth[1] + columnWidth[2], currentY, columnWidth[3], rowHeight).stroke();

                doc.text((index + 1) + '.', startX + 5, currentY + 7);
                doc.text(guest.guest_name || '', startX + columnWidth[0] + 5, currentY + 7);
                doc.text(guest.relationship || '', startX + columnWidth[0] + columnWidth[1] + 5, currentY + 7);
                doc.text(guest.phone || '', startX + columnWidth[0] + columnWidth[1] + columnWidth[2] + 5, currentY + 7);
            });

            // If no guests, draw empty rows with individual cell borders
            if (guests.length === 0) {
                for (let i = 0; i < 2; i++) {
                    currentY += rowHeight;
                    // S. No column
                    doc.rect(startX, currentY, columnWidth[0], rowHeight).stroke();
                    // Name column
                    doc.rect(startX + columnWidth[0], currentY, columnWidth[1], rowHeight).stroke();
                    // Relation column
                    doc.rect(startX + columnWidth[0] + columnWidth[1], currentY, columnWidth[2], rowHeight).stroke();
                    // Contact No column
                    doc.rect(startX + columnWidth[0] + columnWidth[1] + columnWidth[2], currentY, columnWidth[3], rowHeight).stroke();

                    doc.text((i + 1) + '.', startX + 5, currentY + 7);
                }
            }

            doc.moveDown(1);
            doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Instructions to the Graduates:', leftMargin, null,{ underline: true, align: 'left' });
            doc.moveDown(0.3);
            
            // Fix Dear Graduate alignment
            doc.fontSize(11)
            .font('Helvetica')
            .text('Dear Graduate,', leftMargin, null, { align: 'justify' }, );
            
            doc.moveDown();
            
            // Instructions list
            const instructions = [
                'Be at the venue at least 01 hour before the ceremony begins to ensure you have time to check in and get seated.',
                'Proceed to the designated check-in area to receive your name card and any additional instructions.',
                'Obtain Graduation Day kit from the department by showing this registration form.',
                'Wear the appropriate academic regalia (cap and gown)',
                'Follow the instructions for the processional order. Walk in a straight line, keeping a steady pace, and maintain a professional demeanor',
                'Once seated, remain in your assigned seat and avoid moving around unless directed to do so',
                'Turn off or silence your cell phone to avoid interruptions',
                'Maintain a respectful attitude throughout the ceremony. Applaud and cheer appropriately for fellow graduates.',
                'When your name is called, walk to the stage confidently, shake hands with the dignitaries if required, and return to your seat smoothly.',
                'After the ceremony, you may have time for photos with family and friends. Be considerate of other graduates and the venue space.'
            ];
            doc.fontSize(11);
            instructions.forEach((instruction, index) => {
              doc.text(`${index + 1}. ${instruction}`, {
                align: 'justify',
                indent: 20,      // optional: adds indent after the number
                lineGap: 2       // optional: improves line spacing
              });
              doc.moveDown(0.3);
            });

            // Add congratulatory message
            doc.moveDown();
            doc.text('Congratulations on your graduation! Enjoy the day and celebrate your achievements.', {
                align: 'left'
            });

            doc.pipe(writeStream);
            doc.end();

        } catch (error) {
            console.error('PDF generation error:', error);
            return res.status(500).json({ error: "Failed to generate PDF" });
        }
    });
});

// Add static route to serve files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/check-registration/:rollno', (req, res) => {
  const rollno = req.params.rollno;
  const sql = `
    SELECT a.will_attend, g.guest_name, g.relationship, g.phone 
    FROM attendance a 
    LEFT JOIN guests g ON a.rollno = g.rollno 
    WHERE a.rollno = ?`;
  
  db.query(sql, [rollno], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length > 0) {
      const guests = results.filter(r => r.guest_name).map(g => ({
        name: g.guest_name,
        relationship: g.relationship,
        phone: g.phone || ''
      }));
      
      res.json({ 
        registered: true,
        willAttend: results[0].will_attend,
        guests: guests.length > 0 ? guests : null
      });
    } else {
      res.json({ registered: false });
    }
  }); // Add this closing bracket
});
app.get('/api/students', requirePasswordChangeAndBranchAccess, (req, res) => {
  const adminBranch = req.adminBranch;
  const isExamAdmin = req.isExamAdmin;

  let sql, queryParams;

  if (isExamAdmin) {
    // For EXAM branch admins, show all students from all branches who have attendance
    sql = `
      SELECT u.rollno, u.name, u.branch, a.will_attend,
      (SELECT COUNT(*) FROM guests g WHERE g.rollno = u.rollno) as guest_count
      FROM users u
      INNER JOIN attendance a ON u.rollno = a.rollno
      ORDER BY u.branch, u.name
    `;
    queryParams = [];
  } else {
    // For other admins, show only students from their branch who have attendance
    sql = `
      SELECT u.rollno, u.name, u.branch, a.will_attend,
      (SELECT COUNT(*) FROM guests g WHERE g.rollno = u.rollno) as guest_count
      FROM users u
      INNER JOIN attendance a ON u.rollno = a.rollno
      WHERE u.branch = ?
      ORDER BY u.name
    `;
    queryParams = [adminBranch];
  }

  db.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({
      success: true,
      branch: adminBranch,
      isExamAdmin: isExamAdmin,
      students: result,
      totalCount: result.length
    });
  });
});


// Branch-wise guests endpoint - shows all guests for EXAM admins, only branch guests for others
app.get('/api/guests', requirePasswordChangeAndBranchAccess, (req, res) => {
  const adminBranch = req.adminBranch;
  const isExamAdmin = req.isExamAdmin;
  
  let query, queryParams;
  
  if (isExamAdmin) {
    // For EXAM branch admins, show all guests from all branches
    query = `
      SELECT g.*, u.name as student_name, u.branch 
      FROM guests g
      INNER JOIN users u ON g.rollno = u.rollno
      ORDER BY u.branch, u.name, g.guest_name
    `;
    queryParams = [];
  } else {
    // For other admins, show only guests for students from their branch
    query = `
      SELECT g.*, u.name as student_name, u.branch 
      FROM guests g
      INNER JOIN users u ON g.rollno = u.rollno
      WHERE u.branch = ?
      ORDER BY u.name, g.guest_name
    `;
    queryParams = [adminBranch];
  }
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send(err);
    }

    console.log('Query results for admin:', adminBranch, 'isExamAdmin:', isExamAdmin, 'resultCount:', results.length);
    res.json({
      success: true,
      branch: adminBranch,
      isExamAdmin: isExamAdmin,
      guests: results,
      totalCount: results.length
    });
  });
});


