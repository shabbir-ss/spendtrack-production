# 🔐 GitHub Authentication & Push Commands

## **STEP 1: Create Personal Access Token**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "SpendTrack Deployment"
4. Scopes: Check ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

## **STEP 2: Push with Token**

Replace `YOUR_TOKEN_HERE` with your actual token:

```powershell
# Set location
Set-Location "d:\wst_self\ST\SpendTrack"

# Remove old remote
git remote remove origin

# Add remote with token authentication
git remote add origin https://YOUR_TOKEN_HERE@github.com/shabbir-ss/spendtrack-production.git

# Push to GitHub
git push -u origin main
```

## **Alternative: Use GitHub CLI (if installed)**

```powershell
# Login to GitHub CLI
gh auth login

# Push normally
git push -u origin main
```

## **Alternative: Use SSH (if configured)**

```powershell
# Remove HTTPS remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:shabbir-ss/spendtrack-production.git

# Push
git push -u origin main
```

---

## **After Successful Push:**

✅ Your production code will be on GitHub
✅ Ready for Railway deployment
✅ Go to railway.app and deploy from your repo

**Next: Deploy on Railway with your GitHub repository!** 🚀
