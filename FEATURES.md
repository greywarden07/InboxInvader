# InboxInvader - Feature Guide

## 🎯 All Features Implemented

### ✅ 1. Authentication System
**Location:** Login page (first screen)
- **Default credentials:** admin / admin123
- JWT-based authentication with 24-hour token expiry
- Token stored in localStorage for automatic re-login
- Logout button in top-right corner
- Protected routes - all API endpoints require authentication

**How to use:**
1. Open http://localhost:3000
2. Enter username: `admin`, password: `admin123`
3. Click "Login"
4. You're authenticated for 24 hours

---

### ✅ 2. Dark Mode Toggle
**Location:** Top-right corner (sun/moon icon)
- Switch between light and dark themes
- Preference saved in localStorage
- Smooth transitions with Material-UI theming
- Dynamic gradient backgrounds

**How to use:**
1. Click the sun/moon icon in top-right
2. Watch the entire UI switch themes
3. Preference is saved automatically

---

### ✅ 3. Email Templates with Variable Substitution
**Location:** "Templates" button below header
- Save unlimited email templates
- Support for variable placeholders: `{{name}}`, `{{company}}`, `{{position}}`, etc.
- Load saved templates with one click
- Delete templates you no longer need

**How to use:**
1. Click "Templates" button
2. Fill in template name, subject, and body
3. Use `{{variableName}}` for placeholders
4. Click "Save Template"
5. Later: Click on any saved template to load it
6. Delete with the trash icon

**Example template:**
```
Subject: Application for {{position}} at {{company}}

Body:
Dear {{name}},

I am writing to express my interest in the {{position}} role at {{company}}.

Best regards,
{{sender_name}}
```

---

### ✅ 4. Variable Substitution System
**Location:** "Variables" button below header
- Define key-value pairs for template variables
- Variables automatically applied to subject and body
- See variable count in the button badge
- Remove variables with chip delete button

**How to use:**
1. Click "Variables (0)" button
2. Click "+ Add Variable"
3. Enter variable name (e.g., "name")
4. Enter value (e.g., "John Doe")
5. Use `{{name}}` in subject/body
6. Variables will be substituted before sending

---

### ✅ 5. Email Preview Before Sending
**Location:** "Preview & Send" button replaces direct "Send"
- See exactly what your email will look like
- Shows recipients, subject, body, and attachments
- Option to edit or confirm & send
- Variable substitution preview

**How to use:**
1. Fill in all email fields
2. Click "Preview & Send"
3. Review the preview dialog
4. Click "Edit" to go back, or "Confirm & Send" to send

---

### ✅ 6. Batch Delay Controls
**Location:** Slider above attachments
- Set delay between emails: 0-10 seconds
- Prevents rate limiting from email providers
- Visual slider with real-time value display
- Backend enforces the delay automatically

**How to use:**
1. Scroll to "Delay between emails" section
2. Move slider left (faster) or right (slower)
3. Value shows: "2s" = 2 seconds between each email
4. Delay applies automatically when sending

---

### ✅ 7. CSV Export for Record-Keeping
**Location:** "Export CSV" button in results alert
- Download complete sending report as CSV
- Includes: email, status, message, timestamp
- Automatic filename with date/time
- Perfect for compliance and tracking

**How to use:**
1. Send emails (results will appear)
2. Click "Export CSV" button in the success/error alert
3. CSV file downloads automatically
4. Open in Excel, Google Sheets, etc.

**CSV Format:**
```
email,status,message,timestamp
john@example.com,Success,Sent,2025-11-07T10:30:45.123Z
jane@example.com,Failed,Authentication error,2025-11-07T10:30:47.456Z
```

---

## 📊 Enhanced Results Table

**Features:**
- Per-recipient status (Success/Failed)
- Color-coded chips (Green ✅ / Red ❌)
- Detailed error messages for failures
- Timestamp for each send
- Easy-to-scan table format
- Summary banner with totals

**Information shown:**
1. **Email address** - Who was it sent to
2. **Status chip** - Visual success/failure indicator
3. **Message** - "Sent" or specific error message
4. **Timestamp** - Exact time email was sent

---

## 🎨 UI/UX Enhancements

### Modern Material-UI Design
- Professional gradient purple theme
- Smooth animations and transitions
- Responsive on all devices
- Clean card-based layout
- Collapsible sections to reduce clutter

### Color Schemes
- **Light mode:** Purple gradient (667eea → 764ba2)
- **Dark mode:** Dark gradient (434343 → 000000)
- Consistent branding throughout

### User Experience
- Loading indicators during operations
- Clear error messages
- Helpful tooltips and hints
- Auto-save for preferences
- Instant feedback on all actions

---

## 🔐 Security Features

### Authentication
- JWT tokens with expiration
- Protected API endpoints
- Session persistence
- Secure logout

### Credentials
- Passwords masked in UI
- No credentials stored permanently
- App password requirements documented
- Security warnings throughout

---

## 📝 Complete Workflow Example

### Scenario: Send job application to 5 companies

1. **Login**
   - Use admin/admin123

2. **Create Template**
   - Click "Templates"
   - Name: "Job Application"
   - Subject: `Application for {{position}} - {{name}}`
   - Body: Include `{{company}}`, `{{position}}` variables
   - Save

3. **Set Variables**
   - Click "Variables"
   - Add: name = "John Doe"
   - Add: position = "Software Engineer"
   - Add: company = (will vary, but shows how to use)

4. **Configure Email**
   - Sender: your-email@gmail.com
   - App Password: (your 16-char app password)
   - Recipients: hr1@company1.com, hr2@company2.com, ...
   - Load template
   - Variables auto-substitute

5. **Add Attachments**
   - Click "Attach Files"
   - Select resume.pdf, cover_letter.pdf

6. **Set Delay**
   - Move slider to 3 seconds (prevents spam filters)

7. **Preview**
   - Click "Preview & Send"
   - Review everything

8. **Send**
   - Click "Confirm & Send"
   - Watch progress bar

9. **Review Results**
   - See green ✅ for each success
   - See red ❌ with error for failures
   - Export CSV for your records

10. **Toggle Dark Mode** (optional)
    - Click moon icon for dark theme

---

## 🚀 Power User Tips

1. **Template Library**
   - Create templates for different scenarios
   - Use descriptive names
   - Include common variables

2. **Variable Reuse**
   - Set once, use everywhere
   - Update values between sends
   - Keep a list of common variables

3. **Batch Delays**
   - Use 2-5s for Gmail
   - Higher for large batches
   - Prevents rate limiting

4. **CSV Records**
   - Export after every batch
   - Build compliance history
   - Track success rates

5. **Preview Always**
   - Catch typos before sending
   - Verify variable substitution
   - Check recipient list

---

## 📞 Support & Customization

### Change Default Credentials
Edit `backend/app.py`:
```python
USERS = {
    'your_username': 'your_secure_password'
}
```

### Add More Users
```python
USERS = {
    'admin': 'admin123',
    'user1': 'password1',
    'user2': 'password2'
}
```

### Change JWT Expiry
Edit `backend/app.py`:
```python
'exp': datetime.utcnow() + timedelta(hours=48)  # 48 hours instead of 24
```

---

## ✅ Feature Checklist

- [x] Export results to CSV for record-keeping
- [x] Email templates with variable substitution
- [x] Batch delay controls (0-10 seconds)
- [x] Dark mode toggle
- [x] Email preview before sending
- [x] Save/load email templates
- [x] Authentication to restrict access
- [x] Per-recipient status tracking
- [x] Detailed error messages
- [x] Modern Material-UI design
- [x] Timestamps for all sends
- [x] Mobile responsive design
- [x] Collapsible advanced settings
- [x] Multiple file attachments
- [x] Variable substitution in subject & body

---

**All 7 requested features are fully implemented and ready to use!** 🎉
