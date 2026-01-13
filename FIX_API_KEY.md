# Fix API Key Issue

## Problem
The API key in Vercel is missing the first character. The logs show:
- **Current (wrong)**: `4d563d02d124be50bf7fda6bb3f5f7d`
- **Should be**: `74d563d02d124be50bf7fda6bb3f5f7d`

## Solution

### Step 1: Go to Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Update THE_ODDS_API_KEY

1. Find `THE_ODDS_API_KEY` in the list
2. Click **Edit** (or delete and recreate)
3. Set the value to: `74d563d02d124be50bf7fda6bb3f5f7d`
4. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **Save**

### Step 3: Redeploy

After updating the environment variable:

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Verify

Test the API:
```
https://your-app.vercel.app/api/sports
```

It should now return soccer leagues instead of a 401 error.

---

## Alternative: Test API Key First

Before updating in Vercel, test if your API key works:

```bash
curl "https://api.the-odds-api.com/v4/sports?apiKey=74d563d02d124be50bf7fda6bb3f5f7d"
```

If this returns data, the key is valid. If it returns 401, you need a new API key from:
https://the-odds-api.com/

---

## Quick Checklist

- [ ] API key in Vercel starts with `74` (not `4`)
- [ ] Key is enabled for all environments
- [ ] Redeployed after updating
- [ ] Tested `/api/sports` endpoint
