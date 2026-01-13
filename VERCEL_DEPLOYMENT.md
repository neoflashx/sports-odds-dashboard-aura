# Vercel Deployment Guide

Complete step-by-step guide to deploy your Sports Odds Widget System to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Your Code](#step-1-prepare-your-code)
3. [Step 2: Push to GitHub](#step-2-push-to-github)
4. [Step 3: Create Vercel Account](#step-3-create-vercel-account)
5. [Step 4: Import Project](#step-4-import-project)
6. [Step 5: Configure Environment Variables](#step-5-configure-environment-variables)
7. [Step 6: Configure Build Settings](#step-6-configure-build-settings)
8. [Step 7: Deploy](#step-7-deploy)
9. [Step 8: Verify Deployment](#step-8-verify-deployment)
10. [Step 9: Update Widget URLs](#step-9-update-widget-urls)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Code committed to a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ `.env` file configured locally (we'll add these to Vercel)
- ✅ Firebase project set up and Firestore rules deployed
- ✅ Widget built (`npm run build:widget`)

---

## Step 1: Prepare Your Code

### 1.1 Ensure Widget is Built

```bash
npm run build:widget
```

This creates `public/widget.js` which needs to be committed.

### 1.2 Verify .gitignore

Make sure `.env` is in `.gitignore` (it should be):

```bash
cat .gitignore | grep .env
```

### 1.3 Check Project Structure

Your project should have:
```
sports-odds-dashboard/
├── api/              # Serverless functions
├── public/           # Static files (including widget.js)
├── src/              # React dashboard
├── widget/           # Widget source
├── vercel.json       # Vercel configuration
└── package.json
```

---

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: Sports Odds Widget System"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **New repository**
3. Name it: `sports-odds-dashboard`
4. Choose **Public** or **Private**
5. **Don't** initialize with README (we already have one)
6. Click **Create repository**

### 2.3 Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/sports-odds-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 3: Create Vercel Account

### 3.1 Sign Up

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub** (recommended)
4. Authorize Vercel to access your GitHub account

### 3.2 Verify Account

Check your email and verify your Vercel account if prompted.

---

## Step 4: Import Project

### 4.1 Import from GitHub

1. In Vercel dashboard, click **Add New...** → **Project**
2. You'll see your GitHub repositories
3. Find and click **sports-odds-dashboard**
4. Click **Import**

### 4.2 Project Settings

Vercel should auto-detect:
- **Framework Preset**: Vite
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**Verify these settings match:**
- Framework Preset: **Vite** or **Other**
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## Step 5: Configure Environment Variables

### 5.1 Add Environment Variables

Before deploying, click **Environment Variables** section and add:

#### Variable 1: THE_ODDS_API_KEY
- **Key**: `THE_ODDS_API_KEY`
- **Value**: `74d563d02d124be50bf7fda6bb3f5f7d` (your actual key)
- **Environments**: Production, Preview, Development (select all)

#### Variable 2: FIREBASE_PROJECT_ID
- **Key**: `FIREBASE_PROJECT_ID`
- **Value**: `sports-odds-aura`
- **Environments**: Production, Preview, Development (select all)

#### Variable 3: FIREBASE_PRIVATE_KEY
- **Key**: `FIREBASE_PRIVATE_KEY`
- **Value**: Copy the entire private key from your `.env` file:
  ```
  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCiRQsl5nuoV95Z\nlgtRj+HG1vYzwiq5d9PNaBFyba0nsrnRKoDids2S3D7OR5c2nnxPJO/WP/eBKQaW\nIEfBITOONLXMoSAg+/gAR9kgHsQ9kYSrYcU8N1OBCd7ZMeb/NOfNgmUjIgucYzt6\nX6/4Vx6zCyS26doh6u3Qfv9jm6yVzj/yAwY0cH1AxoMOImeremt7I5oKUjt9+YSp\nrIbqQ/nUD7zNxlvduGLC1Igjv6ZzexbGYjSCy738NFR+J9wsuLNltvwNcz5+Iwn3\nBCSRsmN5ak1X8erYbcpqvqYu5Oc9VtY4CjGE1elelb24Gmzel1K8wWYMBNBKOPOt\nf5cXGBfDAgMBAAECggEALT+5ixkJVHkkLLEVeOn5WHwq7WXwigVrD3U8oD8LMO26\nuSP0CrJ8Qr6d2OHHvdhV66/uHT17JA4vov9fYvCCMt5p76Tik7APiOyAFF/f8xc3\n+p5p5I+8/lelR8WNl47GMN1ynGhq+nIFbOtv431PtzedRlBRnnGnXSN8zebkKmWG\nZgK0Xu2/YmjLTq3U8VHpwnCtjdFq4aDSdksVruvqvxHztkUWs+NqjifQWXIp0J/K\n2eXgvjXe/kjKVf0OtTjgBm5Kk/PGK4vHT891mHkrHzYR8QWqKq21MY5ev/Ow0kvu\nxNtZol3FLSYqfYAMT7EFPdXSIm8N2ntascaURmg5YQKBgQDQlQ5LUOoLxzB2sdIy\nJSQaO2moYB6+rX2SampmyzFiB4TeeAEuPi0FnoeClhfkpgagRzfRDn6rzb+6ZRGR\nL4Mb0pE8k7d+JrQo8XUIF/HbfzRiOkZ6Ba9QV5MjOK+PZ2xmIJxruNZJgnFVtrgg\nLt7Jgba7rX7kqoPJwEbwPZvDEQKBgQDHKLfJ+xJBOn2boUKAFpwXVYRZQzoo4GbS\nFSfuMi938ctkstuJI6BJL6RwmbWNLTwLj/queyR47fNhrRB0rHGgt8ZEk/5tvqHe\n8LQ6MB0+PzLHSBeRQuxs8gvyYOcYr9EfxXqnP7qK2UedK9XXhoEJVnRxIMzhyFey\n07j3WtvFkwKBgDq3izOWjpxMMY9oVYS6QeSEjyTQEjeZPT1HabaQQtGWzkeWPrbW\n1/O6Aem3+Pfr6PebtNHMI8qXe/6rzvsxBdaCO1JzPvdrS9IuzsQ9gV9J+uQgBZD6\nIrUaQhhrL7jN440IZyBIA0LkTqVTb5fXue2970P7/jm+6qST1SRyI3QRAoGBAKJV\nezFkuCV48qdnU1gqlcKjTwSfOonVF5pH6ktKlsySxzHmY/Gtm1nsPoIVmBlh9J6M\nFk4gS8NSWV6VfWNMqDXTdgWyB+IWT8TzuEPxsfRp+Q7coXEi9ql6xegjulqx/KiE\nBAzNclT49FmVQHGzzfv5f2Iy1S14apt13j+ozJiHAoGBAMGffobecT6RMmNWbpVL\nrLWOPLGD0N5PvUl7w55trrHH0WxR4gMDCKMRh9IZKKpAD2+2p9D7jj/T36o3SHrI\nyup7kQikTzKSeG4ycaLV5EGLRmyUFc5decvSYrgojaT1XUDIuWgfHiQjCXi+xroq\nLte1lLr5VWOk2A7rzduSwYDS\n-----END PRIVATE KEY-----\n"
  ```
- **Important**: Include the quotes and `\n` characters exactly as shown
- **Environments**: Production, Preview, Development (select all)

#### Variable 4: FIREBASE_CLIENT_EMAIL
- **Key**: `FIREBASE_CLIENT_EMAIL`
- **Value**: `firebase-adminsdk-fbsvc@sports-odds-aura.iam.gserviceaccount.com`
- **Environments**: Production, Preview, Development (select all)

### 5.2 Quick Copy from .env

You can also copy values from your local `.env` file:

```bash
# View your .env (to copy values)
cat .env
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, copy the entire value including quotes
- Make sure `\n` characters are preserved (they represent newlines)
- Select all three environments (Production, Preview, Development) for each variable

---

## Step 6: Configure Build Settings

### 6.1 Verify Build Command

In the project settings, ensure:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x or 20.x (auto-detected)

### 6.2 Verify vercel.json

Your `vercel.json` should already be configured. It handles:
- API routes (`/api/*`)
- Widget render route (`/widget/render`)
- CORS headers
- Static file serving

---

## Step 7: Deploy

### 7.1 Initial Deployment

1. After adding environment variables, click **Deploy**
2. Vercel will:
   - Install dependencies
   - Run build command
   - Deploy to production

### 7.2 Watch the Build

You'll see real-time build logs. The build should:
1. ✅ Install dependencies
2. ✅ Build widget (`npm run build:widget`)
3. ✅ Compile TypeScript
4. ✅ Build React app (`vite build`)
5. ✅ Deploy

**Expected build time**: 2-5 minutes

---

## Step 8: Verify Deployment

### 8.1 Check Deployment Status

After deployment completes, you'll see:
- ✅ **Deployment successful**
- Your production URL: `https://your-project.vercel.app`

### 8.2 Test Endpoints

Open your browser and test:

1. **Dashboard**: `https://your-project.vercel.app`
   - Should show the React dashboard

2. **API - Sports**: `https://your-project.vercel.app/api/sports`
   - Should return JSON array of soccer leagues

3. **API - Odds**: `https://your-project.vercel.app/api/odds?sport=soccer_epl`
   - Should return JSON array of matches with odds

4. **Widget**: `https://your-project.vercel.app/widget.js`
   - Should return JavaScript file (check file size ~8-9KB)

5. **Widget Render**: `https://your-project.vercel.app/widget/render?sport-key=soccer_epl`
   - Should show HTML page with widget UI

### 8.3 Test Widget Embedding

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <h1>Sports Odds Widget Test</h1>
    
    <script src="https://your-project.vercel.app/widget.js"></script>
    <soccer-odds 
        sport-key="soccer_epl" 
        theme="light"
        api-url="https://your-project.vercel.app">
    </soccer-odds>
</body>
</html>
```

Open it in a browser - the widget should load and display odds.

---

## Step 9: Update Widget URLs

### 9.1 Update Dashboard Code Snippet

The dashboard automatically uses `window.location.origin` for the API URL, so it should work automatically.

### 9.2 Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update widget embed code with new domain

---

## Troubleshooting

### Build Fails: "Module not found"

**Solution:**
- Ensure all dependencies are in `package.json`
- Check that `npm install` completes successfully
- Verify Node.js version (18.x or 20.x)

### Build Fails: "Widget not found"

**Solution:**
- Run `npm run build:widget` locally first
- Commit `public/widget.js` to Git
- Push to GitHub
- Redeploy

### API Returns 500 Error

**Check:**
1. Environment variables are set correctly
2. Firebase credentials are valid
3. Firestore rules are deployed
4. Check Vercel function logs: **Deployments** → Click deployment → **Functions** tab

### CORS Errors

**Solution:**
- Verify `vercel.json` has CORS headers
- Check API endpoints return CORS headers
- Test with browser DevTools Network tab

### Widget Not Loading

**Check:**
1. Widget.js is accessible: `https://your-project.vercel.app/widget.js`
2. API is accessible: `https://your-project.vercel.app/api/odds?sport=soccer_epl`
3. Browser console for errors
4. Network tab for failed requests

### Firebase Connection Errors

**Check:**
1. `FIREBASE_PRIVATE_KEY` includes quotes and `\n` characters
2. `FIREBASE_PROJECT_ID` matches your Firebase project
3. `FIREBASE_CLIENT_EMAIL` is correct
4. Firestore is enabled in Firebase Console

### Environment Variables Not Working

**Solution:**
1. Go to **Settings** → **Environment Variables**
2. Verify all variables are set
3. Check they're enabled for correct environments
4. Redeploy after adding/changing variables

### View Logs

1. Go to **Deployments**
2. Click on a deployment
3. Click **Functions** tab to see serverless function logs
4. Check **Build Logs** for build-time errors

---

## Post-Deployment Checklist

- [ ] Dashboard loads at production URL
- [ ] `/api/sports` returns soccer leagues
- [ ] `/api/odds?sport=soccer_epl` returns odds data
- [ ] `/widget.js` is accessible and <20KB
- [ ] `/widget/render` shows widget UI
- [ ] Widget embeds correctly on test page
- [ ] CORS headers are present in API responses
- [ ] Environment variables are set
- [ ] Firebase connection works
- [ ] Cache is working (check Firestore)

---

## Continuous Deployment

Vercel automatically deploys when you push to:
- **main/master branch** → Production
- **Other branches** → Preview deployments

Each push triggers a new deployment automatically!

---

## Useful Vercel Features

### Preview Deployments
- Every branch/PR gets a preview URL
- Test changes before merging
- Share preview URLs with team

### Analytics
- View deployment analytics
- Monitor function performance
- Track usage

### Environment Variables
- Different values for Production/Preview/Development
- Secure variable storage
- Easy updates without redeploying code

---

## Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Check build logs in Vercel dashboard
3. Check function logs for runtime errors
4. Verify all environment variables are set
5. Test endpoints individually

---

## Next Steps

After successful deployment:

1. ✅ Test all endpoints
2. ✅ Test widget embedding
3. ✅ Share your widget URL with users
4. ✅ Monitor usage and performance
5. ✅ Set up custom domain (optional)

Your Sports Odds Widget System is now live! 🎉
