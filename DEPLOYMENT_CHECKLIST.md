# 🚀 SpendTrack Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation

- [ ] All code committed and pushed to GitHub
- [ ] `.env` file is in `.gitignore` (✅ Already done)
- [ ] Build process works locally: `npm run build`
- [ ] Production start works locally: `npm start`

### 2. Environment Secrets

**Use these generated secrets for production:**

```
SESSION_SECRET=d3c6a1def68b6fb51ecd11298f2884b4d4710f3ef8704f3794b212413b9a69d6
JWT_SECRET=4a6d90c119cd5dd7eabe73f727c50e1ead1d5017bcdc92ce9cb6566080c1f0cb
```

### 3. Repository Setup

- [ ] Create GitHub repository (if not exists)
- [ ] Push all code to main branch
- [ ] Verify all deployment files are included:
  - [ ] `railway.json`
  - [ ] `Procfile`
  - [ ] `nixpacks.toml`
  - [ ] `.env.example`

---

## 🚂 Railway Deployment Steps

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Verify your email

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your SpendTrack repository
4. Railway will automatically start building

### Step 3: Add PostgreSQL Database

1. In your project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for database to be created
4. Railway will automatically set `DATABASE_URL`

### Step 4: Configure Environment Variables

Go to your web service → **Variables** tab and add:

**Required Variables:**

```
NODE_ENV=production
SESSION_SECRET=d3c6a1def68b6fb51ecd11298f2884b4d4710f3ef8704f3794b212413b9a69d6
JWT_SECRET=4a6d90c119cd5dd7eabe73f727c50e1ead1d5017bcdc92ce9cb6566080c1f0cb
```

**Optional (for email notifications):**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Optional (for SMS notifications):**

```
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### Step 5: Deploy and Test

1. Railway will automatically deploy after adding variables
2. Wait for deployment to complete
3. Click on your app URL to test
4. Verify all features work

---

## 🔍 Post-Deployment Verification

### Test These Features:

- [ ] App loads successfully
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays correctly
- [ ] Add income/expense entries
- [ ] View reports and charts
- [ ] File uploads work (if applicable)
- [ ] Email notifications (if configured)
- [ ] SMS notifications (if configured)

### Check Logs:

- [ ] No error messages in Railway logs
- [ ] Database connections successful
- [ ] All API endpoints responding

---

## 🔧 Troubleshooting Common Issues

### Build Failures

**Problem:** Build fails during deployment
**Solution:**

- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Verify Node.js version compatibility
- Check build logs for specific errors

### Database Connection Issues

**Problem:** App can't connect to database
**Solution:**

- Verify PostgreSQL service is running in Railway
- Check that `DATABASE_URL` is automatically set
- Ensure database migrations ran successfully

### Environment Variable Issues

**Problem:** App crashes with missing environment variables
**Solution:**

- Double-check all required variables are set
- Ensure no typos in variable names
- Verify secrets are properly generated

### Static Files Not Loading

**Problem:** Frontend assets not loading
**Solution:**

- Verify build process creates `dist/public` folder
- Check that `serveStatic` is working in production mode
- Ensure Vite build completed successfully

---

## 📊 Expected Costs (Railway)

### Free Tier Usage:

- **Monthly Credit:** $5
- **Typical Usage:**
  - Web Service: ~$3-4/month
  - PostgreSQL: ~$1-2/month
- **Total:** Should fit within free tier for development/testing

### If You Exceed Free Tier:

- **Web Service:** $5/month
- **PostgreSQL:** $5/month for 1GB
- **Total:** ~$10/month

---

## 🎉 Success! Your App is Deployed

Once deployment is successful:

1. **Your app will be available at:** `https://your-app-name.railway.app`
2. **Database is automatically managed** by Railway
3. **Automatic deployments** happen when you push to GitHub
4. **SSL/HTTPS is enabled** by default
5. **Monitoring and logs** available in Railway dashboard

---

## 🔄 Future Updates

To update your deployed app:

1. Make changes to your code
2. Commit and push to GitHub main branch
3. Railway will automatically redeploy
4. Monitor deployment logs for any issues

---

## 📞 Need Help?

If you encounter issues:

1. **Check Railway logs** first (most common issues show here)
2. **Verify environment variables** are set correctly
3. **Test build locally:** `npm run build && npm start`
4. **Check this deployment guide** for troubleshooting steps
5. **Railway documentation:** [docs.railway.app](https://docs.railway.app)

**Your SpendTrack app is ready for production! 🎉**
