# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name: `Smart Placement Portal`
4. Click **Create**

## Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Smart Placement Portal
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. On Scopes page, click **Save and Continue**
7. On Test users page (optional), click **Save and Continue**
8. Click **Back to Dashboard**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. Enter **Name**: `Smart Placement Portal Web Client`
5. Under **Authorized redirect URIs**, click **+ Add URI** and add:
   ```
   http://localhost:5000/api/auth/google/callback
   https://portalback-dsr4.onrender.com/api/auth/google/callback
   ```
6. Click **Create**
7. **IMPORTANT**: Copy your **Client ID** and **Client Secret** - you'll need these!

## Step 5: Update Backend .env File

Open `backend/.env` and update these values:

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=https://portalback-dsr4.onrender.com/api/auth/google/callback
```

Replace `your_actual_client_id_here` and `your_actual_client_secret_here` with the values you copied.

## Step 6: Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **portalback** service
3. Go to **Environment** tab
4. Add these environment variables:
   - `GOOGLE_CLIENT_ID` = your client ID
   - `GOOGLE_CLIENT_SECRET` = your client secret
   - `GOOGLE_CALLBACK_URL` = `https://portalback-dsr4.onrender.com/api/auth/google/callback`
5. Click **Save Changes**
6. Render will automatically redeploy your service

## Step 7: Test Locally (Optional)

1. Make sure backend is running: `cd backend && npm start`
2. Open frontend in browser
3. Click "Continue with Google" on login page
4. You should be redirected to Google sign-in

## Step 8: Deploy and Test Production

1. After Render redeploys, go to https://portaluse.onrender.com
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected back and logged in

## Troubleshooting

### Error: invalid_client
- Double-check your Client ID and Client Secret are correct
- Make sure there are no extra spaces in the .env file
- Verify the redirect URI in Google Console matches exactly

### Error: redirect_uri_mismatch
- Go to Google Cloud Console → Credentials
- Edit your OAuth client
- Add the exact redirect URI: `https://portalback-dsr4.onrender.com/api/auth/google/callback`

### Google authentication not configured
- Make sure environment variables are set in both `.env` and Render
- Restart your backend server after updating .env

## Security Notes

- Never commit `.env` file to GitHub
- Keep your Client Secret private
- Only add trusted redirect URIs
- When making your app public, submit for OAuth verification in Google Console

---

## Quick Reference

**Local Development Redirect URI:**
```
http://localhost:5000/api/auth/google/callback
```

**Production Redirect URI:**
```
https://portalback-dsr4.onrender.com/api/auth/google/callback
```

**Frontend URLs:**
- Local: http://localhost:5173
- Production: https://portaluse.onrender.com
