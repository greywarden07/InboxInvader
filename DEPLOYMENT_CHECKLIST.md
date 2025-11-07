# ✅ Vercel Deployment Checklist

Print this page and check off each step as you complete it!

---

## 📝 Pre-Deployment Preparation

- [ ] Code is working locally (both frontend and backend)
- [ ] All changes committed to git
- [ ] Pushed to GitHub repository
- [ ] Have accounts on:
  - [ ] GitHub (greywarden07/InboxInvader)
  - [ ] Render.com
  - [ ] Vercel.com

---

## 🔧 Part 1: Backend Deployment (Render)

### Step 1: Generate Secret Key
- [ ] Run: `cd backend`
- [ ] Run: `python generate_secret.py`
- [ ] Copy the generated SECRET_KEY
- [ ] Save it somewhere safe (you'll need it in Step 3)

### Step 2: Create Render Service
- [ ] Go to https://render.com/dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Select `greywarden07/InboxInvader`
- [ ] Click "Connect"

### Step 3: Configure Service
Fill in these exact values:

- [ ] **Name**: `inboxinvader-backend` (or your choice)
- [ ] **Root Directory**: `backend`
- [ ] **Environment**: `Python 3`
- [ ] **Build Command**: `pip install -r requirements.txt`
- [ ] **Start Command**: `python app.py`
- [ ] **Instance Type**: `Free`

### Step 4: Add Environment Variables
Click "Advanced" → Add these variables:

- [ ] `FLASK_ENV` = `production`
- [ ] `SECRET_KEY` = `[paste the key from Step 1]`
- [ ] `PORT` = `10000`
- [ ] `ALLOWED_ORIGINS` = `http://localhost:3000`
  - Note: You'll update this later with your Vercel URL

### Step 5: Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait 2-3 minutes for deployment
- [ ] Check deployment logs for errors
- [ ] Wait for "Live" status

### Step 6: Test Backend
- [ ] Copy your backend URL (e.g., `https://inboxinvader-backend.onrender.com`)
- [ ] Test in browser: `https://your-backend-url/health`
- [ ] Should see: `{"status":"healthy"}`
- [ ] **Write down your backend URL**: ___________________________________

---

## 🎨 Part 2: Frontend Configuration

### Step 7: Update Production Config
On your computer:

- [ ] Open `web/.env.production` in VS Code
- [ ] Change `NEXT_PUBLIC_API_URL` to your backend URL from Step 6
  ```
  NEXT_PUBLIC_API_URL=https://your-actual-backend-url.onrender.com
  ```
- [ ] Save the file

### Step 8: Commit and Push
- [ ] Run: `git add web/.env.production`
- [ ] Run: `git commit -m "Update production API URL"`
- [ ] Run: `git push origin main`
- [ ] Verify changes on GitHub

---

## 🚀 Part 3: Frontend Deployment (Vercel)

### Step 9: Create Vercel Project
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Find and select `greywarden07/InboxInvader`
- [ ] Click "Import"

### Step 10: Configure Project
Fill in these exact values:

- [ ] **Framework Preset**: `Next.js` (auto-detected)
- [ ] **Root Directory**: Click "Edit" → Enter `web` → Save
- [ ] **Build Command**: `npm run build` (default, don't change)
- [ ] **Output Directory**: `.next` (default, don't change)
- [ ] **Install Command**: `npm install` (default, don't change)

### Step 11: Add Environment Variable
In the "Environment Variables" section:

- [ ] **Name**: `NEXT_PUBLIC_API_URL`
- [ ] **Value**: [Your backend URL from Step 6]
  ```
  https://inboxinvader-backend.onrender.com
  ```
- [ ] Click "Add"

### Step 12: Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait 1-2 minutes for build
- [ ] Check build logs for errors
- [ ] Wait for "Congratulations!" message

### Step 13: Test Frontend
- [ ] Copy your Vercel URL (e.g., `https://inboxinvader-abc123.vercel.app`)
- [ ] Click "Visit" or open the URL in browser
- [ ] Page should load (you might see login screen)
- [ ] **Write down your Vercel URL**: ___________________________________

---

## 🔗 Part 4: Connect Frontend and Backend

### Step 14: Update Backend CORS
- [ ] Go back to https://dashboard.render.com
- [ ] Click on your backend service
- [ ] Click "Environment" in left sidebar
- [ ] Find `ALLOWED_ORIGINS` variable
- [ ] Click "Edit"
- [ ] Update value to: `https://your-vercel-url.vercel.app,http://localhost:3000`
  - Replace with your actual Vercel URL from Step 13
  - Keep the comma and localhost for local development
- [ ] Click "Save Changes"
- [ ] Wait for automatic redeploy (1-2 minutes)

### Step 15: Verify CORS Update
- [ ] Check Render logs show "Restarting..."
- [ ] Wait for "Live" status
- [ ] Backend should restart successfully

---

## 🧪 Part 5: Testing

### Step 16: Test Full Flow
Visit your Vercel URL and test:

- [ ] Page loads without errors
- [ ] Try to login with: `admin` / `admin123`
  - [ ] Login successful? (If not, check browser console for errors)
  - [ ] Redirects to email sender page?

### Step 17: Test Signup
- [ ] Click "Sign up here"
- [ ] Fill in new account details:
  - Username: ___________
  - Email: ___________
  - Password: ___________
- [ ] Submit signup
- [ ] Should show "Account created successfully"
- [ ] Try logging in with new account

### Step 18: Test Email Sending (Optional)
- [ ] Fill in SMTP settings (e.g., Gmail)
- [ ] Add test recipient
- [ ] Enter subject and body
- [ ] Click "Send Emails"
- [ ] Check results table shows success/failure

### Step 19: Test Templates
- [ ] Click "Templates" button
- [ ] Try saving a template
- [ ] Try loading a template
- [ ] Try deleting a template

### Step 20: Test Other Features
- [ ] Toggle dark mode
- [ ] Test email preview
- [ ] Test CSV export (if you sent emails)
- [ ] Test on mobile device (optional)

---

## 🎉 Part 6: Final Verification

### Step 21: Check Logs
Verify no errors in logs:

- [ ] **Render logs**: Dashboard → Service → Logs
  - Look for: "Running on https://0.0.0.0:10000"
  - No errors or tracebacks?

- [ ] **Vercel logs**: Dashboard → Project → Deployments → Latest → Logs
  - Build succeeded?
  - No runtime errors?

- [ ] **Browser console**: Press F12 on your Vercel URL
  - No red errors in Console tab?
  - No CORS errors?

### Step 22: Security Check
- [ ] `SECRET_KEY` is random (not the default)?
- [ ] `FLASK_ENV` is set to `production`?
- [ ] `ALLOWED_ORIGINS` only includes your Vercel domain (and localhost)?
- [ ] No passwords hardcoded in source code?

### Step 23: Save Important Info
Write down for future reference:

```
Backend URL:  _________________________________________
Frontend URL: _________________________________________
Admin Login:  admin / admin123
Your Account: _________________ / _________________
Deployed On:  _________________________________________
```

---

## ✅ Deployment Complete!

Congratulations! Your app is now live on the internet! 🎉

### What to do next:

**Share your app:**
- [ ] Share Vercel URL with friends/team
- [ ] Add to your portfolio
- [ ] Share on social media

**Optional improvements:**
- [ ] Set up custom domain (Vercel Settings → Domains)
- [ ] Switch to PostgreSQL for persistent database
- [ ] Upgrade to paid tier for always-on backend
- [ ] Add email verification for signups
- [ ] Implement password reset

**Bookmark these pages:**
- [ ] Render Dashboard: https://dashboard.render.com
- [ ] Vercel Dashboard: https://vercel.com/dashboard
- [ ] GitHub Repo: https://github.com/greywarden07/InboxInvader

---

## 🆘 Troubleshooting

If something doesn't work:

**First, check:**
1. Backend health: `https://your-backend.onrender.com/health`
2. Browser console (F12) for errors
3. Render logs for backend errors
4. Vercel deployment logs for build errors

**Common fixes:**
- ✅ CORS errors → Update ALLOWED_ORIGINS on Render
- ✅ Network errors → Check NEXT_PUBLIC_API_URL in Vercel
- ✅ Backend sleeping → First request takes ~30s (free tier)
- ✅ Build failed → Check Vercel logs, verify dependencies

**Need help?**
- Re-read VERCEL_QUICKSTART.md
- Check ARCHITECTURE.md for diagrams
- Review DEPLOYMENT_CHANGES.md for what changed

---

## 📋 Quick Command Reference

```bash
# Generate secret key
python backend/generate_secret.py

# Test backend locally
cd backend
python app.py

# Test frontend locally
cd web
npm run dev

# Commit and push changes
git add .
git commit -m "Your message"
git push origin main

# Check git status
git status
```

---

**Pro tip:** Save this checklist! You'll need it if you deploy another app or make major updates.

🚀 Happy deploying!
