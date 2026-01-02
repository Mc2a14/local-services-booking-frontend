# Frontend Deployment Guide

## Current Setup
- **Backend**: Deployed on Railway
- **Backend URL**: `https://local-services-booking-backend-production.up.railway.app`
- **Frontend**: Currently running locally

## Deployment Options

### Option 1: Deploy to Railway (Recommended - Same Platform)

#### Step 1: Create Frontend GitHub Repo

1. Go to GitHub: https://github.com/new
2. Create a new repository:
   - Repository name: `local-services-booking-frontend`
   - Make it public or private (your choice)
   - Don't initialize with README (we already have files)
3. Click "Create repository"

#### Step 2: Push Frontend to GitHub

```bash
cd /Users/nelsonbarreto/Desktop/local-services-booking-frontend

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Frontend app"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/local-services-booking-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Railway

1. Go to Railway: https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `local-services-booking-frontend`
5. Railway will detect it's a Vite/React app

#### Step 4: Configure Railway Settings

In Railway, set:
- **Root Directory**: `/` (or leave blank)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Output Directory**: `dist`

Or use Railway's Nixpacks (auto-detects Vite apps)

#### Step 5: Add Environment Variable

In Railway, go to Variables tab:
```
VITE_API_URL=https://local-services-booking-backend-production.up.railway.app/api
```

#### Step 6: Generate Public Domain

1. Go to Settings tab in Railway
2. Click "Generate Domain"
3. Railway will give you a URL like: `https://your-app.up.railway.app`

**Done!** Your frontend is now publicly accessible!

---

### Option 2: Deploy to Vercel (Easier, Free Tier)

#### Step 1: Push to GitHub (same as above)

#### Step 2: Deploy to Vercel

1. Go to: https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import `local-services-booking-frontend` repo
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 3: Add Environment Variable

In Vercel project settings:
- Key: `VITE_API_URL`
- Value: `https://local-services-booking-backend-production.up.railway.app/api`

#### Step 4: Deploy

Click "Deploy" - Vercel will give you a URL automatically!

---

## After Deployment

Once deployed, you'll have:
- **Public Frontend URL**: Share this with others to test
- **Backend API**: Already deployed on Railway
- **Full Stack**: Working end-to-end!

## Testing

1. Visit your deployed frontend URL
2. Try creating an account
3. Test booking flow
4. Check that emails work (if configured)

## Notes

- Railway deployment is good if you want everything in one place
- Vercel is faster for frontend deployment and has excellent performance
- Both are free for personal/small projects
- Environment variables need to be set in both platforms



