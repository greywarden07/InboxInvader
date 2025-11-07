# Deployment Guide - InboxInvader Pro

This guide explains how to deploy InboxInvader for multiple users in production.

## 🚀 Deployment Options

### Option 1: Simple VPS Deployment (Recommended for Small Teams)

**Requirements:**
- Ubuntu/Debian VPS (DigitalOcean, Linode, AWS EC2, etc.)
- Domain name
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Setup Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3 python3-pip python3-venv nginx certbot python3-certbot-nginx nodejs npm -y
```

2. **Clone/Upload Project**
```bash
cd /var/www
sudo git clone <your-repo> inboxinvader
cd inboxinvader
sudo chown -R $USER:$USER /var/www/inboxinvader
```

3. **Setup Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn

# Set production secret key
export SECRET_KEY="your-super-secret-key-$(openssl rand -hex 32)"

# Run with gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

4. **Setup Frontend**
```bash
cd ../web
npm install
npm run build

# For production, use PM2
npm install -g pm2
pm2 start npm --name "inboxinvader-web" -- start
pm2 save
pm2 startup
```

5. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/inboxinvader
```

Add:
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/inboxinvader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Setup SSL with Let's Encrypt**
```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

7. **Update Frontend API URL**
Edit `web/pages/index.js` and components to use:
```javascript
const API_URL = 'https://api.yourdomain.com'
```

8. **Setup Systemd Service for Backend**
```bash
sudo nano /etc/systemd/system/inboxinvader-backend.service
```

Add:
```ini
[Unit]
Description=InboxInvader Backend
After=network.target

[Service]
User=your-username
WorkingDirectory=/var/www/inboxinvader/backend
Environment="SECRET_KEY=your-secret-key-here"
ExecStart=/var/www/inboxinvader/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable inboxinvader-backend
sudo systemctl start inboxinvader-backend
```

---

### Option 2: Docker Deployment (Modern Approach)

**Create `Dockerfile` for Backend:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY backend/ .

ENV SECRET_KEY="change-me-in-production"
ENV SQLALCHEMY_DATABASE_URI="sqlite:///inboxinvader.db"

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

**Create `Dockerfile` for Frontend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY web/package*.json ./
RUN npm install

COPY web/ .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

---

### Option 3: Platform-as-a-Service (Easiest)

#### Heroku

**Backend:**
1. Create `Procfile`:
```
web: gunicorn app:app
```

2. Deploy:
```bash
cd backend
heroku create inboxinvader-api
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
git push heroku main
```

**Frontend:**
1. Use Vercel or Netlify
2. Update API URL in environment variables

#### Railway.app

1. Connect GitHub repo
2. Set up two services (backend + frontend)
3. Configure environment variables
4. Deploy automatically

#### Render.com

1. Create new Web Service for backend
2. Create new Static Site for frontend
3. Configure build commands
4. Deploy

---

## 🔒 Production Security Checklist

### Backend
- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only
- [ ] Add rate limiting:
```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.headers.get('Authorization')
)

@app.route("/send")
@limiter.limit("10 per hour")
def send():
    ...
```

- [ ] Switch to PostgreSQL/MySQL for production:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://user:pass@localhost/inboxinvader'
)
```

- [ ] Add logging:
```python
import logging
logging.basicConfig(filename='app.log', level=logging.INFO)
```

- [ ] Validate all inputs
- [ ] Add CORS restrictions (not allow all)
- [ ] Use strong password hashing (already using werkzeug)
- [ ] Implement account lockout after failed logins

### Frontend
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS API URLs only
- [ ] Add CSP headers
- [ ] Minify and optimize build
- [ ] Add error boundaries
- [ ] Implement proper token refresh

### Database
- [ ] Regular backups
- [ ] Use connection pooling
- [ ] Add database indexes
- [ ] Encrypt sensitive data

### General
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Add analytics (optional)
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Add CAPTCHA to signup (prevent bots)
- [ ] Email verification for new accounts
- [ ] Add privacy policy and terms of service

---

## 📊 Scaling Considerations

### For 100+ Users
- Use PostgreSQL instead of SQLite
- Add Redis for session management
- Implement background job queue (Celery)
- Use CDN for frontend assets
- Add load balancer
- Implement caching

### For 1000+ Users
- Microservices architecture
- Kubernetes orchestration
- Separate email sending service
- Message queue (RabbitMQ/Redis)
- Horizontal scaling
- Database replication

---

## 🔧 Environment Variables

Create `.env` file:

**Backend:**
```bash
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///inboxinvader.db
FLASK_ENV=production
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Load in code:
```python
# Backend
from dotenv import load_dotenv
load_dotenv()
```

```javascript
// Frontend (next.config.js)
module.exports = {
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}
```

---

## 📱 Mobile Considerations

For mobile deployment, consider:
1. Progressive Web App (PWA) - Add manifest.json
2. Responsive design (already implemented)
3. Touch-friendly UI (Material-UI provides this)
4. Mobile app wrapper (React Native conversion)

---

## 💰 Cost Estimates

### Small Deployment (1-50 users)
- **VPS:** $5-10/month (DigitalOcean Droplet, Linode)
- **Domain:** $10-15/year
- **SSL:** Free (Let's Encrypt)
- **Total:** ~$7/month

### Medium Deployment (50-500 users)
- **VPS:** $20-40/month
- **Database:** $15/month (managed PostgreSQL)
- **Monitoring:** $10/month
- **Total:** ~$45-65/month

### Large Deployment (500+ users)
- **Kubernetes Cluster:** $100+/month
- **Managed Services:** $50+/month
- **CDN:** $20+/month
- **Total:** $170+/month

---

## 📞 Support After Deployment

1. **Monitor logs** regularly
2. **Backup database** daily
3. **Update dependencies** monthly
4. **Security patches** immediately
5. **User feedback** collection
6. **Performance monitoring**

---

## ✅ Pre-Deployment Checklist

- [ ] Test all features locally
- [ ] Run security audit (`npm audit`, `safety check`)
- [ ] Test with real SMTP credentials
- [ ] Verify rate limiting works
- [ ] Test database migrations
- [ ] Prepare rollback plan
- [ ] Document admin procedures
- [ ] Set up monitoring/alerting
- [ ] Configure backups
- [ ] Test SSL certificates
- [ ] Review CORS settings
- [ ] Check error handling
- [ ] Verify logging works
- [ ] Test with multiple browsers
- [ ] Mobile responsiveness check
- [ ] Load testing (optional but recommended)

---

**Ready to deploy?** Start with the Simple VPS option and scale as needed!
