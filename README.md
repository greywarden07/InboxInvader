# InboxInvader — Advanced Email Sender Platform

A full-featured web application for sending bulk emails with **authentication**, **dark mode**, **email templates**, **variable substitution**, **CSV export**, and **detailed tracking**. Built with Flask (backend) and Next.js + Material-UI (frontend).

## 🌐 Live Deployment

**Want to deploy this app?** See **[VERCEL_QUICKSTART.md](VERCEL_QUICKSTART.md)** for step-by-step instructions to deploy:
- Backend → Render (free tier)
- Frontend → Vercel (free tier)

## 🚀 Features

### Core Features
- ✅ **User Registration & Authentication** - Signup with username, email, password
- ✅ **Database Storage** - SQLite database for users and templates
- ✅ **Per-User Templates** - Each user has their own saved templates
- ✅ **Bulk Email Sending** - Send to multiple recipients with detailed per-recipient tracking
- ✅ **File Attachments** - Support for multiple file attachments
- ✅ **SMTP Configuration** - Works with Gmail, Outlook, and custom SMTP servers

### Advanced Features (NEW!)
- 🔐 **Authentication System** - JWT-based login to restrict access
- 🌓 **Dark Mode Toggle** - Switch between light and dark themes
- 📧 **Email Templates** - Save and load email templates with variable substitution
- 🔄 **Variable Substitution** - Use `{{name}}`, `{{company}}`, etc. in emails
- ⏱️ **Batch Delay Controls** - Set custom delays (0-10s) between emails
- 👁️ **Email Preview** - Preview emails before sending
- 📊 **CSV Export** - Export sending results for record-keeping
- ⏰ **Timestamps** - Track exact send time for each email
- 📈 **Detailed Reports** - Success/failure status with error messages

## 📁 Project Structure

```
InboxInvader/
├── backend/                 # Flask API
│   ├── app.py              # Main backend with all endpoints
│   ├── requirements.txt    # Python dependencies
│   ├── inboxinvader.db     # SQLite database (auto-created)
│   └── README.md           # Backend documentation
├── web/                    # Next.js frontend
│   ├── components/         # Reusable React components
│   │   ├── LoginForm.js    # Authentication UI
│   │   ├── TemplateManager.js  # Template management
│   │   └── EmailPreview.js     # Email preview dialog
│   ├── pages/
│   │   ├── _app.js        # App wrapper with theme
│   │   └── index.js       # Main email sender page
│   ├── styles/            # Global styles
│   ├── package.json       # Node dependencies
│   └── README.md          # Frontend documentation
├── email_sender.py        # Original Python script (legacy)
├── emails.txt            # Sample email list
└── README.md             # This file
```

## 🛠️ Quick Start (Windows PowerShell)

### 1. Start Backend (Flask)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend runs on **http://localhost:5000**

### 2. Start Frontend (Next.js)

```powershell
cd web
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

### 3. Login

Open http://localhost:3000 in your browser

**First time? Create an account:**
- Click "Sign up here"
- Fill in username, email, and password (min 6 chars)
- Click "Sign Up"
- Login with your new credentials

**Default Admin Account:**
- Username: `admin`
- Password: `admin123`

## 🎯 How to Use

### 1. Create an Account (First Time Users)
- Open http://localhost:3000
- Click "Sign up here"
- Fill in:
  - Username (min 3 chars)
  - Email
  - Password (min 6 chars)
  - Confirm password
- Click "Sign Up"
- You'll be redirected to login

### 2. Login
- Enter your username and password
- Token is saved in localStorage for 24 hours

### 3. Configure SMTP (for Gmail)
- Enable 2FA on your Google Account
- Generate an App Password:
  - Go to https://myaccount.google.com/security
  - Security > 2-Step Verification > App passwords
  - Create password for "Mail"
  - Copy the 16-character password

### 4. Create Email Templates (Optional)
- Click "Templates" button
- Save templates with variables like `{{name}}`, `{{company}}`
- **Templates are saved to your account** in the database
- Load saved templates anytime

### 5. Add Variables (Optional)
- Click "Variables" button
- Add key-value pairs (e.g., name: "John", company: "Acme")
  - Use `{{key}}` in subject/body for substitution

### 6. Compose Email
- Enter recipients (comma/semicolon/newline separated)
- Write subject and body (use `{{variables}}`)
- Attach files if needed
  - Set delay between sends (0-10 seconds)

### 7. Preview & Send
- Click "Preview & Send"
- Review the email
  - Click "Confirm & Send"

### 8. View Results
- See detailed table with per-recipient status
- Green ✅ for success, Red ❌ for failures
- Export results to CSV for record-keeping

## 🔒 Security Notes

### ⚠️ IMPORTANT - Do NOT deploy publicly without:
1. **Changing default credentials** in `backend/app.py`
2. **Using environment variables** for secrets
3. **Adding HTTPS/TLS** (use nginx/caddy reverse proxy)
4. **Rate limiting** to prevent abuse
5. **Database storage** instead of in-memory users
6. **Input validation** and sanitization
7. **Logging and monitoring**

### For Gmail:
- **Never use your main password** - use App Passwords only
- Enable 2-Factor Authentication first
- App Passwords are 16 characters without spaces

## 📊 API Endpoints

### POST `/signup`
Create a new user account
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secure123"
}
```

### POST `/login`
Authenticate and receive JWT token
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### POST `/send` (requires auth)
Send emails with tracking
- Headers: `Authorization: Bearer <token>`
- Content-Type: `multipart/form-data`
- Fields: smtp_server, smtp_port, sender_email, sender_password, recipients, subject, body, delay_seconds, variables, attachments[]

### POST `/export-csv` (requires auth)
Export results to CSV
- Headers: `Authorization: Bearer <token>`
- Body: `{ "results": [...] }`

### GET `/templates` (requires auth)
Get all templates for current user

### POST `/templates` (requires auth)
Create a new template
```json
{
  "name": "Job Application",
  "subject": "Application for {{position}}",
  "body": "Dear {{name}}..."
}
```

### DELETE `/templates/:id` (requires auth)
Delete a template

### GET `/health`
Health check endpoint

## 🎨 UI Features

### Light/Dark Mode
- Toggle in top-right corner
- Preference saved in localStorage
- Smooth theme transitions

### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive layouts with Material-UI Grid

### Real-time Feedback
- Progress bars during sending
- Instant validation
- Clear error messages

## 🔧 Customization

### Database Location
The SQLite database is created at `backend/inboxinvader.db`. To reset:
```powershell
rm backend/inboxinvader.db
# Restart backend to recreate with default admin
```

### Change Default Admin Credentials
The default admin user is created automatically on first run. To change the password:
1. Login as admin
2. Or delete the database and modify `backend/app.py`:
```python
admin.set_password('your-new-secure-password')
```

### Add More Default Users
Edit `backend/app.py` in the database initialization section:
```python
with app.app_context():
    db.create_all()
    # Add more default users
    if not User.query.filter_by(username='user1').first():
        user1 = User(username='user1', email='user1@example.com')
        user1.set_password('password123')
        db.session.add(user1)
        db.session.commit()
```

### Change JWT Secret
Edit `backend/app.py`:
```python
app.config['SECRET_KEY'] = 'your-random-secret-key-here'
```

### Change Ports
- Backend: Edit `app.run(port=5000)` in `backend/app.py`
- Frontend: Edit `package.json` script: `"dev": "next dev -p 3000"`
- Update frontend API URL in `web/pages/index.js` and components

## 📝 Variable Substitution Examples

**Template:**
```
Subject: Application for {{position}} at {{company}}

Body:
Hi {{name}},

I'm interested in the {{position}} role at {{company}}.

Best regards,
{{sender_name}}
```

**Variables:**
```json
{
  "position": "Software Engineer",
  "company": "Google",
  "name": "Hiring Manager",
  "sender_name": "John Doe"
}
```

**Result:**
```
Subject: Application for Software Engineer at Google

Body:
Hi Hiring Manager,

I'm interested in the Software Engineer role at Google.

Best regards,
John Doe
```

## 🐛 Troubleshooting

### Backend Issues
- **Import errors**: Run `pip install -r requirements.txt`
- **Port in use**: Change port in `app.py`
- **CORS errors**: Check Flask-Cors is installed

### Frontend Issues
- **Module not found**: Run `npm install`
- **Port 3000 in use**: Change port in `package.json` or kill existing process
- **API errors**: Check backend is running on port 5000

### Email Sending Issues
- **Authentication failed**: Use App Password, not regular password
- **Connection timeout**: Check SMTP server/port settings
- **Emails to spam**: Keep volume moderate, use professional content

## 📦 Dependencies

### Backend (Python)
- Flask >= 2.2.0
- Flask-Cors >= 3.0.10
- Flask-SQLAlchemy >= 3.0.0
- PyJWT >= 2.8.0
- Werkzeug >= 3.0.0

### Frontend (Node.js)
- Next.js 13.4.10
- React 18.2.0
- Material-UI 5.14.5
- Axios 1.4.0

## 🚀 Future Enhancements

- [ ] PostgreSQL/MySQL support for production
- [ ] Password reset via email
- [ ] User profile settings
- [ ] Email scheduling
- [ ] Webhook notifications
- [ ] Rich text editor (HTML emails)
- [ ] Email tracking (opens, clicks)
- [ ] API rate limiting per user
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Admin dashboard for user management
- [ ] Multi-user organization support
- [ ] Template sharing between users

## 📄 License

This is a personal project for educational purposes. Use responsibly and in compliance with email sending regulations (CAN-SPAM, GDPR, etc.).

## 👨‍💻 Author

Built for InboxInvader - Advanced Email Management Platform

---

**⚠️ Remember:** Never share your SMTP credentials. Use App Passwords. Respect email recipients' privacy and sending limits.


