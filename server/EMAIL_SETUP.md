# Email Setup Guide for Graduation Day System

## Prerequisites
1. Install required packages:
   ```bash
   npm install nodemailer dotenv
   ```

## SMTP Configuration Options

### Option 1: Gmail SMTP (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character app password
3. **Create .env file** in server directory:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### Option 2: Outlook/Hotmail SMTP
1. **Create .env file**:
   ```
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   ```

### Option 3: Yahoo Mail SMTP
1. **Generate App Password** in Yahoo Mail settings
2. **Create .env file**:
   ```
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=587
   SMTP_USER=your-email@yahoo.com
   SMTP_PASS=your-app-password
   ```

### Option 4: Custom SMTP (cPanel/Hosting)
1. **Get SMTP details** from your hosting provider
2. **Create .env file**:
   ```
   SMTP_HOST=mail.yourdomain.com
   SMTP_PORT=587
   SMTP_USER=noreply@yourdomain.com
   SMTP_PASS=your-email-password
   ```

## Setup Steps

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file** with your actual credentials

3. **Restart the server**:
   ```bash
   node index.js
   ```

4. **Check server logs** for email service status

## Testing Email

1. **Test login** with a valid student account
2. **Check server console** for email sending status
3. **Verify email** arrives in student's inbox

## Troubleshooting

### Gmail Issues:
- ❌ "Invalid login" → Use App Password, not regular password
- ❌ "Less secure app access" → Enable 2FA and use App Password
- ❌ "Authentication failed" → Check username and app password

### General Issues:
- ❌ "Connection timeout" → Check SMTP host and port
- ❌ "EAUTH" → Wrong username or password
- ❌ "ENOTFOUND" → Wrong SMTP host

### Success Indicators:
- ✅ "SMTP server is ready to send emails"
- ✅ "Registration email sent successfully"
- ✅ Student receives email with reference ID

## Email Features

✅ **HTML and Text versions** for compatibility  
✅ **Professional design** with college branding  
✅ **Reference ID** prominently displayed  
✅ **Mobile-responsive** email template  
✅ **Clear next steps** for students  
✅ **Error handling** with fallback messages  

## Security Notes

- 🔒 **Never commit .env file** to version control
- 🔒 **Use App Passwords** instead of account passwords
- 🔒 **Enable 2FA** on email accounts
- 🔒 **Use environment variables** for production

## Support

If you encounter issues:
1. Check server console logs
2. Verify SMTP credentials
3. Test with a simple email client
4. Contact your hosting provider for SMTP details
