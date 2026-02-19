# Fix 404 Errors on Render - Action Checklist

## ✅ What We Fixed in Your Code:
1. ✓ Created axios configuration file to use backend URL
2. ✓ Added CORS configuration to allow frontend domain
3. ✓ Created `_redirects` file for React Router on Render
4. ✓ Added production serve script to package.json

---

## 🚨 CRITICAL: What You MUST Do on Render Dashboard:

### Step 1: Backend Service Environment Variables
Go to: **Render Dashboard → Backend Service → Environment**

**Add these environment variables:**
```
VITE_API_URL=https://portalback-dsr4.onrender.com
```

Make sure you have:
- `FRONTEND_URL=https://portaluse.onrender.com`
- `NODE_ENV=production`
- All other variables from your `.env` file

### Step 2: Frontend Service Environment Variables  
Go to: **Render Dashboard → Frontend Service → Environment**

**Add this critical variable:**
```
VITE_API_URL=https://portalback-dsr4.onrender.com
```

⚠️ **Without this, your frontend won't know where to send API requests!**

### Step 3: Verify Build Settings

**Backend:**
- Build Command: `npm install`
- Start Command: `npm start`

**Frontend:**
- Build Command: `npm install && npm run build`  
- Publish Directory: `dist`
- Start Command (if using web service): `npm run serve`

### Step 4: Redeploy Both Services
1. Deploy backend first (wait for it to finish)
2. Deploy frontend second
3. Render automatically redeploys when you:
   - Push to your connected Git repo
   - Or click "Manual Deploy" → "Deploy latest commit"

---

## 🔍 How to Verify It's Working:

After redeploying, test these URLs:

1. **Backend API Test:**
   - Open: `https://portalback-dsr4.onrender.com/`
   - Should show: `{"message": "Smart Placement Portal API", ...}`

2. **Frontend Test:**
   - Open: `https://portaluse.onrender.com/`
   - Open browser console (F12)
   - Look for API calls - they should go to `https://portalback-dsr4.onrender.com/api/...`

3. **Login Test:**
   - Try logging in at: `https://portaluse.onrender.com/admin-login`
   - Check Network tab - API calls should return 200, not 404

---

## 🐛 Still Getting 404?

Check these:

1. **Environment Variable Not Set:**
   - Go to Render Frontend → Environment
   - Verify `VITE_API_URL` exists and equals `https://portalback-dsr4.onrender.com`
   - Redeploy after adding

2. **Check Backend Logs:**
   - Render Dashboard → Backend Service → Logs
   - Look for startup messages and errors

3. **Check Frontend Build Logs:**
   - Render Dashboard → Frontend Service → Logs  
   - Look for build errors

4. **Browser Cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or clear browser cache completely

5. **Git Not Pushed:**
   - Make sure you've committed and pushed the latest code:
     ```bash
     git add .
     git commit -m "Fix API configuration for Render"
     git push
     ```

---

## 📝 Summary

The 404 error happens because:
- Your `.env` file is gitignored (correct for security)
- Render doesn't have access to your local `.env` file
- **You must set environment variables in Render's dashboard**

**The most important variable is `VITE_API_URL` in your frontend service!**
