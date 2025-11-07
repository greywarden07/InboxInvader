# 🚀 Quick Deployment Guide for Vercel

## The Problem
Vercel can only deploy **frontend applications** (Next.js, React, etc.). Your Flask backend **cannot run on Vercel**.

## The Solution
You need to deploy:
1. **Backend (Flask)** → **Render** or **Railway** (both have free tiers)
2. **Frontend (Next.js)** → **Vercel**

---

## 📋 Step-by-Step Deployment

### Part 1: Deploy Backend to Render (Free)

#### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Sign Up for Render
- Go to https://render.com
- Sign up with GitHub

#### 3. Create New Web Service
- Click **"New +"** → **"Web Service"**
- Connect to your GitHub repository: `greywarden07/InboxInvader`
- Click **"Connect"**

#### 4. Configure the Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `inboxinvader-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python app.py` |
| **Instance Type** | `Free` |

#### 5. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
FLASK_ENV=production
SECRET_KEY=change-this-to-a-random-32-character-string
PORT=10000
ALLOWED_ORIGINS=https://your-app-name.vercel.app,http://localhost:3000
```

**Important:** Generate a random SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

#### 6. Deploy Backend
- Click **"Create Web Service"**
- Wait 2-3 minutes for deployment
- Copy your backend URL (e.g., `https://inboxinvader-backend.onrender.com`)

✅ **Backend is now live!** Test it:
```
https://inboxinvader-backend.onrender.com/health
```

---

### Part 2: Deploy Frontend to Vercel

#### 1. Update Environment Variable
Edit `web/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://inboxinvader-backend.onrender.com
```

Commit this change:
```bash
git add web/.env.production
git commit -m "Update production API URL"
git push origin main
```

#### 2. Go to Vercel
- Go to https://vercel.com
- Sign in with GitHub
- Click **"Add New..."** → **"Project"**

#### 3. Import Your Repository
- Select `greywarden07/InboxInvader`
- Click **"Import"**

#### 4. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `web` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

#### 5. Add Environment Variables
In the **Environment Variables** section, add:

```
NEXT_PUBLIC_API_URL=https://inboxinvader-backend.onrender.com
```

Replace with your actual Render backend URL from Part 1, Step 6.

#### 6. Deploy Frontend
- Click **"Deploy"**
- Wait 1-2 minutes for build
- Your app will be live at `https://your-app-name.vercel.app`

✅ **Frontend is now live!**

---

### Part 3: Final Configuration

#### 1. Update Backend CORS
Go back to **Render Dashboard** → Your Backend Service → **Environment**

Update `ALLOWED_ORIGINS` with your actual Vercel URL:
```
ALLOWED_ORIGINS=https://your-actual-app.vercel.app,http://localhost:3000
```

Click **"Save Changes"** - this will redeploy your backend.

#### 2. Test Your App
- Visit your Vercel URL: `https://your-app-name.vercel.app`
- Try logging in with: `admin` / `admin123`
- Try signing up with a new account
- Send a test email

---

## 🎯 Common Issues & Fixes

### Issue 1: "Network Error" when logging in
**Cause:** Backend CORS not configured correctly

**Fix:** Make sure `ALLOWED_ORIGINS` in Render includes your exact Vercel URL (with https://)

### Issue 2: Backend URL shows "Application Error"
**Cause:** Backend crashed during startup

**Fix:** Check Render logs:
- Go to Render Dashboard → Your Service → **Logs**
- Look for error messages
- Common issues:
  - Missing dependencies in `requirements.txt`
  - Database connection issues
  - Invalid environment variables

### Issue 3: Frontend builds but shows blank page
**Cause:** API_URL not set correctly

**Fix:**
1. Check Vercel Deployment Logs
2. Verify environment variable in Vercel Dashboard
3. Redeploy if needed

### Issue 4: "This site can't be reached" for backend
**Cause:** Render free tier sleeps after 15 minutes of inactivity

**Fix:** This is normal! The first request will wake it up (takes ~30 seconds). Consider:
- Upgrading to Render Starter ($7/month) for always-on
- Or use Railway which has better free tier
- Or set up a cron job to ping your backend every 10 minutes

---

## 💡 Pro Tips

### 1. Custom Domain (Optional)
**Vercel:**
- Go to Project Settings → **Domains**
- Add your custom domain (e.g., `inboxinvader.com`)
- Update DNS records as shown
- Vercel provides free SSL

**Render:**
- Go to Service Settings → **Custom Domain**
- Add your domain (e.g., `api.inboxinvader.com`)
- Update DNS records
- Free SSL included

### 2. Monitor Your Apps
**Render:**
- Check logs regularly: Dashboard → Service → **Logs**
- Set up email alerts: Settings → **Notifications**

**Vercel:**
- Check deployment status: Project → **Deployments**
- View runtime logs: Deployment → **Function Logs**

### 3. Database Persistence
⚠️ **Important:** SQLite database on Render free tier resets when:
- Service restarts
- You push new code
- After ~15 days of running

**Solution:** Use PostgreSQL on Render:
1. Create PostgreSQL database (free tier available)
2. Update `backend/app.py` to use PostgreSQL:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///inboxinvader.db')
```
3. Add to Render environment variables:
```
DATABASE_URL=postgresql://...
```

### 4. Speed Up Backend Wake Time
Add this to your Vercel frontend to ping backend on load:

Create `web/pages/_app.js`:
```javascript
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Wake up backend on app load
    fetch(process.env.NEXT_PUBLIC_API_URL + '/health').catch(() => {})
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
```

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Render** | ✅ 750 hours/month<br>Sleeps after 15 min | $7/month<br>Always-on |
| **Vercel** | ✅ 100GB bandwidth<br>Unlimited deployments | $20/month<br>Pro features |
| **Total** | **$0/month** | **$7-27/month** |

For personal projects, **free tier is perfect!**

---

## 🔄 Redeploying After Changes

### Backend Changes:
```bash
git add backend/
git commit -m "Update backend"
git push origin main
```
Render auto-deploys on push to `main` branch.

### Frontend Changes:
```bash
git add web/
git commit -m "Update frontend"
git push origin main
```
Vercel auto-deploys on push to `main` branch.

### Environment Variable Changes:
- **Render:** Dashboard → Service → Environment → Edit → Save (triggers redeploy)
- **Vercel:** Dashboard → Project → Settings → Environment Variables → Edit → Redeploy

---

## ✅ Deployment Checklist

Before going live, ensure:

**Security:**
- [ ] Changed `SECRET_KEY` to random 32+ character string
- [ ] Removed any hardcoded credentials
- [ ] Set `FLASK_ENV=production`
- [ ] CORS only allows your Vercel domain

**Testing:**
- [ ] Test signup with new account
- [ ] Test login with existing account
- [ ] Test sending email
- [ ] Test template save/load/delete
- [ ] Test CSV export
- [ ] Test on mobile device

**Monitoring:**
- [ ] Set up Render email alerts
- [ ] Bookmark Render logs URL
- [ ] Bookmark Vercel deployments page

**Optional:**
- [ ] Set up custom domain
- [ ] Upgrade to paid tier for always-on backend
- [ ] Switch to PostgreSQL for persistent database
- [ ] Add Google Analytics or monitoring

---

## 🆘 Need Help?

Check the logs:
- **Render Logs:** Dashboard → Service → Logs tab
- **Vercel Logs:** Project → Deployments → Click deployment → Function Logs

Common log commands to look for errors:
- Render: Look for "ERROR", "Traceback", "failed"
- Vercel: Look for "Build Error", "Runtime Error"

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Professional email sender accessible from anywhere
- ✅ Multi-user support with authentication
- ✅ Cloud-hosted and always available
- ✅ Free hosting (with some limitations)
- ✅ Auto-deploys on code changes
- ✅ HTTPS/SSL included

Share your live URL and enjoy! 🚀
