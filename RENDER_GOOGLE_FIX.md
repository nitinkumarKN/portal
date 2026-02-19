# Quick Fix: Add Google OAuth to Render

## The Problem
Your app is deployed but Google OAuth credentials are not set in Render's environment variables.

## The Solution

### Step 1: Set Environment Variables in Render

1. Go to https://dashboard.render.com/
2. Select your **portalback** service (backend)
3. Click **Environment** tab on the left
4. Click **Add Environment Variable** and add:

   **Variable 1:**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: `your_google_client_id_here`

   **Variable 2:**
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: `your_google_client_secret_here`

   **Variable 3:**
   - Key: `GOOGLE_CALLBACK_URL`
   - Value: `https://portalback-dsr4.onrender.com/api/auth/google/callback`

4. Click **Save Changes**

Your backend will automatically redeploy and Google login will work!

---

## Don't Have Google OAuth Credentials Yet?

### Option 1: Get Real Credentials (Recommended)

Follow [SETUP_GOOGLE_OAUTH.md](SETUP_GOOGLE_OAUTH.md) to create credentials in Google Cloud Console.

### Option 2: Disable Google Login Temporarily

Google login is now optional. The app will work without it - users just can't use the "Continue with Google" button until you add credentials.

The warning you see in logs is normal:
```
⚠️  Google OAuth not configured. Google login will not be available.
```

---

## Testing

After adding credentials in Render:
1. Wait for auto-deploy to complete (~2-3 minutes)
2. Go to https://portaluse.onrender.com/login
3. Click "Continue with Google"
4. Should redirect to Google sign-in ✅

---

## Need Help?

- See [SETUP_GOOGLE_OAUTH.md](SETUP_GOOGLE_OAUTH.md) for detailed Google OAuth setup
- Make sure the redirect URI in Google Console is: `https://portalback-dsr4.onrender.com/api/auth/google/callback`
