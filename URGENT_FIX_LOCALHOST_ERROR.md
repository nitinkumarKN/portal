# 🚨 URGENT FIX: Registration Error on Render

## The Problem

Your frontend is calling `http://localhost:5000` instead of `https://portalback-dsr4.onrender.com` because the environment variable `VITE_API_URL` is **NOT set in Render**.

Error in console:
```
POST http://localhost:5000/api/auth/register net::ERR_FAILED
Registration error: undefined
```

---

## ✅ Solution Applied

I've updated the code to include a production fallback URL, so it will work even without the environment variable. However, **you still need to set it properly in Render**.

### Files Updated:
1. [src/config/axios.js](frontend/src/config/axios.js) - Added production fallback
2. [src/pages/company/Applicants.jsx](frontend/src/pages/company/Applicants.jsx) - Fixed hardcoded localhost URL

---

## 🚀 CRITICAL: What You MUST Do NOW

### Step 1: Set Environment Variable in Render

**Go to Render Dashboard:**

1. Click on your **Frontend Service** (portaluse.onrender.com)
2. Go to **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"**
4. Add this variable:
   ```
   Key: VITE_API_URL
   Value: https://portalback-dsr4.onrender.com
   ```
5. Click **"Save Changes"**

⚠️ **IMPORTANT:** All environment variables starting with `VITE_` are embedded at BUILD TIME. Setting them alone is not enough - you MUST redeploy!

### Step 2: Commit and Push Your Code

Open PowerShell/Terminal and run:

```powershell
cd c:\Users\nitin\Documents\portal
git add .
git commit -m "Add production fallback for API URL"
git push
```

### Step 3: Trigger Redeploy on Render

After pushing to Git:

**Option A: Automatic Deploy (if enabled)**
- Render will auto-deploy when you push to Git
- Wait for build to complete

**Option B: Manual Deploy**
1. Go to Render Dashboard → Frontend Service
2. Click **"Manual Deploy"** button (top right)
3. Select **"Clear build cache & deploy"**
4. Wait for build to complete (2-5 minutes)

---

## 🔍 How to Verify It's Fixed

### 1. Check Build Logs

While building, Render should show:
```
API Base URL: https://portalback-dsr4.onrender.com
```

If you see `http://localhost:5000` in logs, the environment variable is NOT set.

### 2. Test Registration

1. Go to: https://portaluse.onrender.com/register
2. Fill out the registration form
3. Click Submit
4. Open Browser Console (F12)
5. Check Network tab - you should see:
   ```
   POST https://portalback-dsr4.onrender.com/api/auth/register
   Status: 201 Created
   ```

   NOT:
   ```
   POST http://localhost:5000/api/auth/register
   ERR_FAILED
   ```

---

## 🐛 Still Not Working?

### Check 1: Environment Variable Actually Set

In Render Dashboard → Frontend Service → Environment:
- You should see: `VITE_API_URL = https://portalback-dsr4.onrender.com`
- If not, add it and redeploy

### Check 2: Backend is Running

Test backend directly:
1. Open: https://portalback-dsr4.onrender.com/
2. Should return JSON: `{"message": "Smart Placement Portal API", ...}`
3. If error 404 or timeout, your backend is down

### Check 3: Clear Browser Cache

Sometimes the browser caches the old build:
- **Hard Refresh:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Or:** Open in Incognito/Private window
- **Or:** Clear browser cache completely

### Check 4: Backend Environment Variables

Your backend also needs environment variables set in Render:

Backend Service → Environment → Should have:
```
FRONTEND_URL=https://portaluse.onrender.com
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key_change_in_production
```

If not set, add them and redeploy backend too.

---

## 📊 Quick Checklist

Before you test again:

- [ ] ✅ Set `VITE_API_URL` in Render Frontend Service Environment
- [ ] ✅ Committed and pushed code changes to Git
- [ ] ✅ Redeployed frontend on Render (waited for build to complete)
- [ ] ✅ Cleared browser cache / used incognito mode
- [ ] ✅ Backend is running (test https://portalback-dsr4.onrender.com/)
- [ ] ✅ Checked Network tab in browser console for correct URL

---

## 💡 Why Did This Happen?

**Vite Environment Variables:**
- Variables starting with `VITE_` are embedded during BUILD time
- They are NOT available at runtime
- You MUST set them in Render BEFORE building
- You MUST redeploy after setting them

**Your `.env` file:**
- Is in `.gitignore` (correct for security)
- Does NOT get deployed to Render
- Must be manually set in Render's dashboard

---

## ✨ After the Fix

Once deployed correctly:
1. Registration will work ✅
2. Login will work ✅
3. All API calls will go to your backend ✅
4. No more localhost errors ✅

The code now has a fallback to production URL, but setting the environment variable is still the recommended approach!
