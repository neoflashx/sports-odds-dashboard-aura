# Troubleshooting Guide - 500 Errors

## Issue: `/api/sports` returns 500 error

### Step 1: Check Vercel Function Logs

1. Go to your Vercel dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click **Functions** tab
6. Look for `/api/sports` function
7. Check the logs for error messages

### Step 2: Verify Environment Variables

Check that all environment variables are set in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Verify these are set:
   - `THE_ODDS_API_KEY` - Should be your Odds API key
   - `FIREBASE_PROJECT_ID` - Should be `sports-odds-aura`
   - `FIREBASE_PRIVATE_KEY` - Should be the full private key (without quotes)
   - `FIREBASE_CLIENT_EMAIL` - Should be the service account email

### Step 3: Test Environment Variables

Use the debug endpoint (after deploying):

```
https://your-app.vercel.app/api/debug
```

This will show which environment variables are set (without exposing sensitive data).

### Step 4: Common Issues

#### Issue: `THE_ODDS_API_KEY is not set`

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Add `THE_ODDS_API_KEY` with your key value
3. Make sure it's enabled for **Production**, **Preview**, and **Development**
4. **Redeploy** the application

#### Issue: Invalid API Key

**Solution:**
1. Verify your Odds API key is correct
2. Test it manually:
   ```bash
   curl "https://api.the-odds-api.com/v4/sports?apiKey=YOUR_KEY"
   ```
3. If it fails, get a new key from [The Odds API](https://the-odds-api.com/)

#### Issue: Firebase Connection Error

**Solution:**
1. Check `FIREBASE_PRIVATE_KEY` format:
   - Should start with `-----BEGIN PRIVATE KEY-----`
   - Should end with `-----END PRIVATE KEY-----\n`
   - Should NOT have quotes around it
   - Should have `\n` characters (literal backslash-n)

2. Verify `FIREBASE_PROJECT_ID` matches your Firebase project

3. Verify `FIREBASE_CLIENT_EMAIL` is correct

#### Issue: Network/Timeout Errors

**Solution:**
- The Odds API might be down or rate-limited
- Check Vercel function logs for timeout errors
- Verify your API key has remaining requests

### Step 5: Check Vercel Function Logs

The most important step is to check the actual error in Vercel logs:

1. **Vercel Dashboard** → Your Project → **Deployments**
2. Click the latest deployment
3. Click **Functions** tab
4. Find `/api/sports`
5. Click to view logs
6. Look for error messages

Common error messages you might see:

```
Error: THE_ODDS_API_KEY environment variable is not set
```
→ Environment variable not set in Vercel

```
Error: Request failed with status code 401
```
→ Invalid API key

```
Error: Request failed with status code 429
```
→ Rate limit exceeded

```
Error: connect ETIMEDOUT
```
→ Network/timeout issue

### Step 6: Test Locally

Test the API locally to see if it works:

```bash
# Make sure .env file is set up
npm run dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/sports
```

If it works locally but not on Vercel, it's an environment variable issue.

### Step 7: Manual API Test

Test The Odds API directly:

```bash
curl "https://api.the-odds-api.com/v4/sports?apiKey=YOUR_API_KEY"
```

If this fails, your API key is invalid or expired.

### Step 8: Redeploy After Fixing

After fixing environment variables:

1. Go to **Deployments**
2. Click the **...** menu on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger redeploy

---

## Quick Checklist

- [ ] All environment variables set in Vercel
- [ ] Environment variables enabled for Production/Preview/Development
- [ ] `THE_ODDS_API_KEY` is valid and has remaining requests
- [ ] `FIREBASE_PRIVATE_KEY` has correct format (no quotes, has `\n`)
- [ ] Checked Vercel function logs for specific error
- [ ] Redeployed after fixing environment variables
- [ ] Tested API key directly with curl

---

## Getting Help

If you're still stuck:

1. Copy the exact error from Vercel function logs
2. Check the error message format
3. Verify environment variables are set correctly
4. Test the API key directly

The function logs will tell you exactly what's wrong!
