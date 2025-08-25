# SpendTrack Deployment Guide

## 🚀 Railway Deployment (Recommended)

### Prerequisites

1. GitHub account
2. Railway account (sign up at [railway.app](https://railway.app))
3. Your code pushed to a GitHub repository

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/spendtrack.git
   git push -u origin main
   ```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your SpendTrack repository**
5. **Railway will automatically detect it's a Node.js app**

### Step 3: Add PostgreSQL Database

1. **In your Railway project dashboard**, click **"+ New"**
2. **Select "Database" → "Add PostgreSQL"**
3. **Railway will create a PostgreSQL instance**

### Step 4: Configure Environment Variables

In your Railway project settings, add these environment variables:

**Required Variables:**

```
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here
APP_URL=https://your-app-name.railway.app
```

**Database (Auto-configured by Railway):**
Railway will automatically set `DATABASE_URL` when you add PostgreSQL.

**Email Configuration (Optional):**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**SMS Configuration (Optional):**

```
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### Step 5: Deploy

1. **Railway will automatically deploy** when you push to your main branch
2. **Database migrations will run automatically** during deployment
3. **Your app will be available** at `https://your-app-name.railway.app`

---

## 🔄 Alternative: Render Deployment

### Step 1: Prepare for Render

1. **Create a `render.yaml`** (optional, for infrastructure as code):
   ```yaml
   services:
     - type: web
       name: spendtrack
       env: node
       buildCommand: npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)** and sign up
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

### Step 3: Add PostgreSQL

1. **Create a new PostgreSQL database** in Render
2. **Copy the database URL** to your environment variables

---

## 🔧 Environment Variables Reference

### Required for Production

- `NODE_ENV=production`
- `PORT=3000` (or Railway/Render will set this)
- `DATABASE_URL=postgresql://...` (set by hosting provider)
- `SESSION_SECRET=random-string-here`
- `JWT_SECRET=random-string-here`
- `APP_URL=https://your-domain.com`

### Optional Features

- **Email notifications**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- **SMS notifications**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

---

## 🔍 Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are in `dependencies`, not `devDependencies`
2. **Database connection fails**: Verify `DATABASE_URL` is set correctly
3. **App crashes on startup**: Check logs for missing environment variables
4. **Static files not served**: Ensure `dist/public` folder is created during build

### Checking Logs

**Railway:**

- Go to your project dashboard
- Click on your service
- View the "Logs" tab

**Render:**

- Go to your service dashboard
- Click "Logs" in the sidebar

---

## 📊 Cost Estimates

### Railway

- **Free tier**: $5/month credit (enough for small apps)
- **PostgreSQL**: ~$5/month for 1GB
- **Web service**: ~$5/month for basic usage

### Render

- **Free tier**: Available (with limitations)
- **PostgreSQL**: $7/month for 1GB
- **Web service**: $7/month for paid tier

---

## 🔒 Security Checklist

- [ ] Change default `SESSION_SECRET` and `JWT_SECRET`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Railway/Render)
- [ ] Review database permissions
- [ ] Set up proper CORS if needed
- [ ] Consider rate limiting for production

---

## 🚀 Next Steps After Deployment

1. **Test all functionality** on the deployed app
2. **Set up monitoring** (Railway/Render provide basic monitoring)
3. **Configure custom domain** (optional)
4. **Set up automated backups** for your database
5. **Monitor performance** and scale as needed

---

## 📞 Support

If you encounter issues:

1. Check the deployment logs first
2. Verify all environment variables are set
3. Test the build process locally: `npm run build && npm start`
4. Check Railway/Render documentation for platform-specific issues
