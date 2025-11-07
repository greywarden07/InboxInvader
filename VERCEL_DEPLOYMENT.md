# Deploying InboxInvader to Vercel + Render

Since InboxInvader has both a Next.js frontend and a Flask backend, you need to deploy them separately:

- **Frontend (Next.js)** → Deploy to **Vercel**
- **Backend (Flask)** → Deploy to **Render** (free tier) or **Railway**

## Step 1: Deploy Backend to Render

### 1.1 Create Backend Configuration Files

The backend needs these files (already in your project):

```
backend/
├── app.py
├── requirements.txt
└── Procfile (create this)
```

Create `backend/Procfile`:
```
web: python app.py
```

### 1.2 Deploy to Render

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `inboxinvader-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   ```
   FLASK_ENV=production
   SECRET_KEY=your-super-secret-key-change-this
   PORT=5000
   ```

6. Click **"Create Web Service"**

7. Once deployed, copy your backend URL (e.g., `https://inboxinvader-backend.onrender.com`)

## Step 2: Update Frontend to Use Backend URL

### 2.1 Update API URL in Frontend

You need to update all API calls in your frontend to use the backend URL instead of `http://localhost:5000`.

Create `web/.env.production`:
```
NEXT_PUBLIC_API_URL=https://inboxinvader-backend.onrender.com
```

### 2.2 Update Frontend Code

Update all axios calls to use the environment variable. For example, in `web/pages/index.js`:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

Then replace all `http://localhost:5000` with `${API_URL}`:
```javascript
// Before:
axios.post('http://localhost:5000/login', ...)

// After:
axios.post(`${API_URL}/login`, ...)
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Configure Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `InboxInvader` repository
4. Configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `web`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3.2 Add Environment Variables in Vercel

In Vercel project settings → Environment Variables, add:
```
NEXT_PUBLIC_API_URL=https://inboxinvader-backend.onrender.com
```

### 3.3 Deploy

Click **"Deploy"** and wait for build to complete.

## Step 4: Update Backend CORS

Update `backend/app.py` to allow your Vercel frontend domain:

```python
from flask_cors import CORS

# Replace with your actual Vercel URL
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://your-app.vercel.app",
            "http://localhost:3000"  # Keep for local development
        ]
    }
})
```

Redeploy backend after this change.

## Alternative: Deploy Both to Render

If you prefer to keep everything in one place:

1. Deploy backend as described above
2. Deploy frontend as a separate Render **Static Site**:
   - Root Directory: `web`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`

## Troubleshooting

### Backend Issues:
- **Database**: SQLite won't persist on free Render instances (resets on restart). Use PostgreSQL for production.
- **Port**: Render automatically sets `PORT` environment variable. Update `app.py`:
  ```python
  import os
  port = int(os.environ.get('PORT', 5000))
  app.run(host='0.0.0.0', port=port)
  ```

### Frontend Issues:
- **API calls fail**: Check browser console for CORS errors
- **Environment variables**: Must start with `NEXT_PUBLIC_` to be accessible in browser
- **Build fails**: Check Vercel build logs for errors

### CORS Issues:
- Ensure backend CORS allows your Vercel domain
- Check that all requests include proper headers

## Quick Checklist

Backend (Render):
- [ ] Create `backend/Procfile`
- [ ] Update `app.py` to use `PORT` environment variable
- [ ] Update CORS origins to include Vercel URL
- [ ] Deploy to Render
- [ ] Copy backend URL

Frontend (Vercel):
- [ ] Create `web/.env.production` with backend URL
- [ ] Update all API calls to use `process.env.NEXT_PUBLIC_API_URL`
- [ ] Add environment variable in Vercel dashboard
- [ ] Deploy to Vercel
- [ ] Test login and email sending

## Production Considerations

1. **Database**: Switch from SQLite to PostgreSQL on Render
2. **Email**: Ensure SMTP credentials are secure (use environment variables)
3. **Authentication**: Use strong SECRET_KEY (minimum 32 random characters)
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Monitoring**: Set up Render/Vercel monitoring and alerts

## Cost Estimate

- **Render Free Tier**: Backend (spins down after 15 min inactivity)
- **Vercel Free Tier**: Frontend (generous limits for personal projects)
- **Total**: $0/month for testing and light usage

For production with always-on backend:
- **Render Starter**: $7/month
- **Vercel Pro** (optional): $20/month
