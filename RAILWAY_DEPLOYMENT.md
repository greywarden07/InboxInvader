# 🚂 Deploy Backend to Railway (SMTP Works!)

Railway is better than Render because it **allows SMTP connections on the free tier**, so your email sending will work without needing SendGrid!

---

## Why Railway?

✅ **SMTP ports work** (25, 465, 587) - Send emails directly!  
✅ **$5 free credit per month** (enough for hobby projects)  
✅ **Better performance** than Render free tier  
✅ **No sleep** on free tier (stays awake!)  
✅ **Automatic deployments** from GitHub  

---

## 📋 Step-by-Step Railway Deployment

### Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub
4. You'll get **$5 free credit** (resets monthly)

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select **`greywarden07/InboxInvader`**
4. Click on the repository

### Step 3: Configure the Service

Railway will detect it's a Python app automatically.

1. **Click on the deployed service** (it will say "backend" or show Python icon)
2. Go to **"Settings"** tab
3. Scroll down to **"Root Directory"**
4. Set: `backend`
5. Click **"Update"**

### Step 4: Add Environment Variables

1. Click on **"Variables"** tab
2. Click **"New Variable"**
3. Add these variables one by one:

```
FLASK_ENV=production
SECRET_KEY=<your-random-key-from-generate_secret.py>
PORT=5000
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

**To generate SECRET_KEY:**
```bash
cd backend
python generate_secret.py
```
Copy the generated key and paste it.

**Note:** You'll update `ALLOWED_ORIGINS` later with your actual Vercel URL.

### Step 5: Configure Build & Start Commands

Still in **Settings** tab:

1. Scroll to **"Build Command"** (optional - Railway auto-detects)
2. Scroll to **"Start Command"**
3. Set Start Command to: `python app.py`

### Step 6: Deploy

1. Go to **"Deployments"** tab
2. Railway will automatically deploy
3. Wait 2-3 minutes for build to complete
4. Look for **"Success"** status

### Step 7: Get Your Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Copy the generated URL (e.g., `https://your-app.up.railway.app`)

✅ **Your backend is live!**

### Step 8: Test Backend

Visit in browser:
```
https://your-app.up.railway.app/health
```

Should return:
```json
{"status":"healthy"}
```

---

## 🔗 Connect to Vercel Frontend

### Step 9: Update Frontend Config

On your computer:

1. Edit `web/.env.production`
2. Update with your Railway URL:
```env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

3. Commit and push:
```bash
git add web/.env.production
git commit -m "Update API URL for Railway"
git push origin main
```

### Step 10: Update Railway CORS

Go back to Railway:

1. Click on your service
2. Go to **"Variables"** tab
3. Find `ALLOWED_ORIGINS` variable
4. Click **Edit**
5. Update to include your Vercel URL:
```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
```
6. Click **"Update"**

Railway will automatically redeploy.

### Step 11: Deploy/Redeploy Vercel

1. Go to Vercel Dashboard
2. Go to your project → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your Railway URL
4. Go to **Deployments** tab
5. Click **︙** on latest → **Redeploy**

---

## ✅ Test Email Sending

Now test sending an email:

1. Visit your Vercel URL
2. Login with `admin` / `admin123`
3. Fill in SMTP settings (Gmail):
   - SMTP Server: `smtp.gmail.com`
   - Port: `587`
   - Your Gmail
   - App Password (not regular password!)
4. Add recipient
5. **Click "Send Emails"**

✅ **Should work now!** SMTP is allowed on Railway!

---

## 🎯 Important Notes

### Gmail Setup

If using Gmail, you MUST:

1. **Enable 2FA** on your Google account
2. **Create App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Create new app password for "Mail"
   - Use that password (not your real password!)

### Free Tier Limits

Railway free tier:
- **$5 credit per month** (resets monthly)
- **500 hours** of usage
- **100 GB outbound bandwidth**

For a small email sender, this is plenty!

### Cost Monitoring

1. Go to Railway Dashboard
2. Click on your username (top right)
3. Click **"Usage"**
4. Monitor your credit usage

---

## 🔧 Troubleshooting

### Issue: "Build Failed"

**Check:**
- Root Directory is set to `backend`
- `requirements.txt` exists in backend folder

**Fix:**
- Go to Settings → Root Directory → Set to `backend`
- Redeploy

### Issue: "Application Error"

**Check:**
- Environment variables are set correctly
- Start command is `python app.py`

**Fix:**
- Go to Deployments → Click failed deployment → View logs
- Look for Python errors

### Issue: Still can't send emails

**Check:**
- Using Gmail with App Password (not regular password)
- Port is 587 (not 465 or 25)
- SMTP server is correct

**Fix:**
- Generate App Password: https://myaccount.google.com/apppasswords
- Enable 2FA if not enabled

---

## 🚀 Advantages of Railway vs Render

| Feature | Railway | Render (Free) |
|---------|---------|---------------|
| **SMTP Access** | ✅ YES | ❌ NO |
| **Sleep After Inactivity** | ❌ No sleep | ✅ 15 min sleep |
| **Free Credit** | $5/month | 750 hours |
| **Performance** | ⚡ Fast | 🐌 Slow |
| **Database Persistence** | ✅ Persists | ⚠️ May reset |

**Winner:** Railway for email sending apps! 🏆

---

## 📊 Migration from Render

If you already deployed to Render:

### Option 1: Keep Both (Test)
- Deploy to Railway
- Test if emails work
- Then delete Render service

### Option 2: Replace Render
1. Deploy to Railway (follow steps above)
2. Get Railway URL
3. Update Vercel environment variable
4. Test everything works
5. Delete Render service

---

## 🎉 Success Checklist

After Railway deployment:

- [ ] Backend deployed successfully
- [ ] `/health` endpoint returns healthy
- [ ] Frontend updated with Railway URL
- [ ] CORS includes Vercel domain
- [ ] Logged in successfully
- [ ] **Emails send successfully!** ✉️
- [ ] Templates save/load work
- [ ] CSV export works

---

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 credit/month (resets)
- Perfect for: ~100-200 emails/day
- If exceeded: ~$0.01 per hour after free credit

**Vercel Free Tier:**
- Still free!
- 100GB bandwidth/month

**Total: $0/month** for light usage! 🎉

---

## 🔄 Auto-Deployment

Railway auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main
```

Railway will automatically:
1. Detect the push
2. Pull latest code
3. Rebuild
4. Deploy
5. ~2 minutes total

---

## 📚 Useful Railway Commands

### View Logs
Railway Dashboard → Your Service → **Deployments** → Click latest → **View Logs**

### Restart Service
Railway Dashboard → Your Service → **Settings** → Scroll down → **Restart**

### Custom Domain (Optional)
Railway Dashboard → Your Service → **Settings** → **Domains** → **Custom Domain**

---

## 🆘 Need Help?

**Railway Docs:** https://docs.railway.app/  
**Railway Discord:** https://discord.gg/railway  
**Railway Status:** https://status.railway.app/

---

## ✨ Quick Start Summary

```bash
1. Sign up: https://railway.app
2. New Project → Deploy from GitHub → Select InboxInvader
3. Settings → Root Directory → backend
4. Variables → Add environment variables
5. Generate Domain → Copy URL
6. Update web/.env.production with Railway URL
7. Push to GitHub
8. Redeploy Vercel
9. Test email sending → Works! 🎉
```

**Railway makes email sending work on free tier!** 🚂✉️
