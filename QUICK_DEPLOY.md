# Quick Deployment Steps

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `local-services-booking-frontend`
3. Make it Public (or Private - your choice)
4. **DO NOT** initialize with README
5. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repo, GitHub will show you commands. But here they are:

```bash
cd /Users/nelsonbarreto/Desktop/local-services-booking-frontend

# Add your GitHub repo as remote (replace Mc2a14 if that's not your username)
git remote add origin https://github.com/Mc2a14/local-services-booking-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Railway

1. Go to: https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `local-services-booking-frontend`
5. Railway will auto-detect Vite/React

### Configure Railway:

**Settings Tab:**
- Build Command: `npm install && npm run build`
- Start Command: `npx vite preview --port $PORT --host`

**Variables Tab:**
Add this environment variable:
```
VITE_API_URL=https://local-services-booking-backend-production.up.railway.app/api
```

**Settings → Generate Domain:**
- Click "Generate Domain"
- You'll get a URL like: `https://your-app.up.railway.app`

**Done!** Your frontend is now live!

---

## Alternative: Deploy to Vercel (Even Easier)

1. Push to GitHub (Step 2 above)
2. Go to: https://vercel.com
3. Sign in with GitHub
4. Click "Add New Project"
5. Import `local-services-booking-frontend`
6. Add environment variable: `VITE_API_URL=https://local-services-booking-backend-production.up.railway.app/api`
7. Click "Deploy"

Vercel gives you a URL instantly!





