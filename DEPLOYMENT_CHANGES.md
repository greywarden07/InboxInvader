# 🔧 Deployment Configuration Changes

This document summarizes all changes made to prepare InboxInvader for Vercel + Render deployment.

## 📦 New Files Created

### Configuration Files
1. **`vercel.json`** - Vercel deployment configuration
   - Specifies `web/` as Next.js build directory
   - Routes all requests to the web folder

2. **`backend/Procfile`** - Render deployment configuration
   - Tells Render how to start the Flask backend

3. **`backend/.env.example`** - Backend environment variable template
   - Documents all required environment variables
   - SECRET_KEY, FLASK_ENV, PORT, ALLOWED_ORIGINS, DATABASE_URL

4. **`backend/generate_secret.py`** - Secret key generator
   - Helper script to generate secure SECRET_KEY for production

### Environment Files
5. **`web/.env.local`** - Local development frontend config
   - `NEXT_PUBLIC_API_URL=http://localhost:5000`

6. **`web/.env.local.example`** - Frontend environment template
   - Documents the API URL configuration

7. **`web/.env.production`** - Production frontend config
   - Will contain your actual Render backend URL
   - Currently set to localhost (you need to update this!)

### Documentation
8. **`VERCEL_QUICKSTART.md`** - Complete deployment guide
   - Step-by-step instructions for deploying to Render + Vercel
   - Troubleshooting section
   - Configuration examples
   - Cost breakdown

9. **`DEPLOYMENT_CHANGES.md`** - This file
   - Summary of all deployment changes

## 🔄 Modified Files

### Backend Changes (`backend/app.py`)

#### 1. Dynamic Port Configuration
```python
# OLD:
app.run(host="0.0.0.0", port=5000, debug=True)

# NEW:
port = int(os.environ.get('PORT', 5000))
debug = os.environ.get('FLASK_ENV', 'development') == 'development'
app.run(host="0.0.0.0", port=port, debug=debug)
```
**Why:** Render automatically assigns a PORT, Flask needs to use it.

#### 2. CORS Configuration
```python
# OLD:
CORS(app)

# NEW:
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```
**Why:** Production needs specific CORS origins for security (Vercel domain).

### Frontend Changes

#### All Components Updated to Use Environment Variable:

**Files modified:**
- `web/pages/index.js`
- `web/components/LoginForm.js`
- `web/components/SignupForm.js`
- `web/components/TemplateManager.js`

**Pattern:**
```javascript
// Added at top of each file:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// OLD:
axios.post('http://localhost:5000/login', ...)

// NEW:
axios.post(`${API_URL}/login`, ...)
```

**Why:** Allows different API URLs for development (localhost) and production (Render).

### Other Files

#### `.gitignore`
**Added:**
- `.env` files (except `.env.production` which is tracked)
- Database files (`*.db`, `*.sqlite`)
- Node and Python build artifacts

**Why:** Keep secrets out of git, but track production config template.

#### `README.md`
**Added:** Link to `VERCEL_QUICKSTART.md` at the top.

**Why:** Make deployment instructions visible.

## 🎯 What You Need To Do

### 1. Before Deploying Backend to Render

Generate a secret key:
```bash
cd backend
python generate_secret.py
```

Copy the generated `SECRET_KEY` - you'll add it to Render.

### 2. After Deploying Backend

Copy your Render backend URL (e.g., `https://inboxinvader-backend.onrender.com`)

Update `web/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://inboxinvader-backend.onrender.com
```

Commit and push:
```bash
git add web/.env.production
git commit -m "Update production API URL"
git push
```

### 3. After Deploying Frontend to Vercel

Copy your Vercel URL (e.g., `https://inboxinvader.vercel.app`)

Go to Render Dashboard → Your Backend → Environment Variables

Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://inboxinvader.vercel.app,http://localhost:3000
```

This will trigger a backend redeploy.

## 🔍 How to Verify Everything Works

### 1. Test Backend Directly
```bash
curl https://your-backend.onrender.com/health
```
Should return: `{"status": "healthy"}`

### 2. Test Frontend Locally with Production Backend
```bash
cd web
# Create .env.local with your production backend URL
echo "NEXT_PUBLIC_API_URL=https://your-backend.onrender.com" > .env.local
npm run dev
```
Visit `http://localhost:3000` and try logging in.

### 3. Test Production Frontend
Visit your Vercel URL and try:
- Signup with new account
- Login with existing account
- Send test email
- Save/load templates

## 📊 Environment Variables Reference

### Backend (Render)
| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `FLASK_ENV` | No | `development` | Set to `production` for prod |
| `SECRET_KEY` | **YES** | unsafe default | JWT token signing |
| `PORT` | No | `5000` | Render sets this automatically |
| `ALLOWED_ORIGINS` | **YES** | `localhost:3000` | CORS allowed domains |
| `DATABASE_URL` | No | SQLite | PostgreSQL connection string |

### Frontend (Vercel)
| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | **YES** | `localhost:5000` | Backend API URL |

**Note:** Frontend env vars MUST start with `NEXT_PUBLIC_` to be accessible in the browser.

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This:
1. ❌ Deploy only to Vercel (backend won't work!)
2. ❌ Use `localhost:5000` in production frontend
3. ❌ Keep default `SECRET_KEY` in production
4. ❌ Forget to update CORS origins with Vercel URL
5. ❌ Commit `.env.local` with real credentials

### ✅ Do This Instead:
1. ✅ Deploy backend to Render, frontend to Vercel
2. ✅ Use environment variables for API URLs
3. ✅ Generate and use random SECRET_KEY
4. ✅ Add Vercel domain to ALLOWED_ORIGINS
5. ✅ Keep `.env.local` in `.gitignore`

## 🎓 Understanding the Architecture

```
User Browser
    ↓
[Vercel - Next.js Frontend]
    ↓ (API calls via NEXT_PUBLIC_API_URL)
[Render - Flask Backend]
    ↓
[SQLite Database] (on Render filesystem)
```

**Data Flow:**
1. User visits Vercel URL → Frontend loads
2. User clicks "Login" → Frontend sends POST to Render backend
3. Backend validates → Returns JWT token
4. Frontend stores token → Includes in all future requests
5. User sends email → Backend processes → Returns results
6. Frontend displays results

## 🔐 Security Considerations

### Production Checklist:
- [ ] Changed SECRET_KEY to random value
- [ ] Set FLASK_ENV=production
- [ ] CORS only allows specific domains (not `*`)
- [ ] No hardcoded passwords in code
- [ ] .env files not committed to git
- [ ] HTTPS enforced (automatic with Vercel/Render)
- [ ] Database not publicly accessible

### Optional Enhancements:
- [ ] Add rate limiting to prevent abuse
- [ ] Implement password reset flow
- [ ] Add email verification for signups
- [ ] Use PostgreSQL instead of SQLite
- [ ] Add logging and monitoring
- [ ] Set up backup strategy for database

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Flask CORS:** https://flask-cors.readthedocs.io/
- **Next.js Env Variables:** https://nextjs.org/docs/basic-features/environment-variables

## 🆘 Troubleshooting

### Backend Issues

**Problem:** "Application Error" on Render
**Solution:** Check Render logs for Python errors, missing dependencies

**Problem:** CORS errors in browser console
**Solution:** Verify ALLOWED_ORIGINS includes your Vercel domain

**Problem:** Database resets after restart
**Solution:** Normal for SQLite on free tier. Upgrade to PostgreSQL or paid plan.

### Frontend Issues

**Problem:** "Network Error" when calling API
**Solution:** Check NEXT_PUBLIC_API_URL is correct, backend is running

**Problem:** Blank page on Vercel
**Solution:** Check Vercel deployment logs, verify build succeeded

**Problem:** Environment variable not working
**Solution:** Make sure it starts with `NEXT_PUBLIC_`, redeploy after adding

## ✅ Deployment Checklist

Use this before deploying:

**Pre-Deployment:**
- [ ] All code committed and pushed to GitHub
- [ ] Generated new SECRET_KEY
- [ ] Tested locally with both servers running
- [ ] No console errors in browser dev tools

**Backend Deployment (Render):**
- [ ] Created web service pointing to `backend/` directory
- [ ] Set environment variables (SECRET_KEY, FLASK_ENV, ALLOWED_ORIGINS)
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `python app.py`
- [ ] Deployment succeeded
- [ ] `/health` endpoint returns 200 OK
- [ ] Copied backend URL

**Frontend Deployment (Vercel):**
- [ ] Updated `web/.env.production` with backend URL
- [ ] Committed and pushed
- [ ] Created new project pointing to `web/` directory
- [ ] Added NEXT_PUBLIC_API_URL environment variable
- [ ] Build succeeded
- [ ] Frontend loads without errors
- [ ] Copied Vercel URL

**Post-Deployment:**
- [ ] Updated ALLOWED_ORIGINS on Render with Vercel URL
- [ ] Backend redeployed with new CORS settings
- [ ] Tested signup flow
- [ ] Tested login flow
- [ ] Tested email sending
- [ ] Tested template save/load
- [ ] Tested CSV export
- [ ] Tested on mobile device

**Done!** 🎉 Your app is live!

## 🔄 Future Updates

When you make changes:

**Code Changes:**
```bash
git add .
git commit -m "Description of changes"
git push origin main
```
Both Render and Vercel will auto-deploy.

**Environment Variable Changes:**
- Render: Update in dashboard, click Save (triggers redeploy)
- Vercel: Update in dashboard, manually redeploy from Deployments tab

**Database Changes:**
- If you modify SQLAlchemy models, database may need to be reset
- Consider adding Flask-Migrate for production schema migrations
