# Google OAuth Implementation Guide

## Overview
Google OAuth authentication has been successfully implemented in the Smart Placement Portal. Users can now sign in using their Google accounts.

## ✅ What's Been Implemented

### Backend Changes
1. **Passport Google Strategy** (`backend/config/passport.js`)
   - Configured Google OAuth 2.0 authentication strategy
   - Auto-generates student profiles with roll numbers or company profiles
   - Handles user creation and lookup by email
   - Integrates with existing JWT authentication

2. **OAuth Controllers** (`backend/controllers/authController.js`)
   - `googleAuth`: Initiates OAuth flow
   - `googleAuthCallback`: Handles callback and generates JWT tokens

3. **API Routes** (`backend/routes/authRoutes.js`)
   - `GET /api/auth/google`: Initiates Google OAuth
   - `GET /api/auth/google/callback`: Handles OAuth callback

4. **User Model Updates** (`backend/models/User.js`)
   - Added `googleId` field for Google account linking
   - Made password optional for OAuth users

5. **Dependencies Installed**
   - `passport`
   - `passport-google-oauth20`

### Frontend Changes
1. **OAuth Callback Handler** (`frontend/src/pages/AuthCallback.jsx`)
   - Processes OAuth redirect
   - Stores user data and JWT token
   - Redirects to appropriate dashboard based on role

2. **Updated Routes** (`frontend/src/App.jsx`)
   - Added `/auth/callback` route for OAuth redirect

3. **Updated Login Pages**
   - LoginPage.jsx
   - RegisterPage.jsx
   - AdminLogin.jsx
   - All now redirect to Google OAuth flow when "Continue with Google" is clicked

## 🔧 Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth Client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "Smart Placement Portal"
   - Add your email address
   - Add authorized domain: `onrender.com`
   - Save and continue

4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "Smart Placement Portal"
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5000
   https://portaluse.onrender.com
   https://portalback-dsr4.onrender.com
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   https://portalback-dsr4.onrender.com/api/auth/google/callback
   ```

5. Click "Create" and save your credentials

### Step 3: Update Environment Variables

#### Local Development
Update `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Production (Render.com)
1. Go to your backend service on Render.com
2. Navigate to "Environment" tab
3. Add the following environment variables:
   ```
   GOOGLE_CLIENT_ID=your_actual_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
   GOOGLE_CALLBACK_URL=https://portalback-dsr4.onrender.com/api/auth/google/callback
   ```
4. Save and wait for the service to redeploy

### Step 4: Test the Implementation

#### Local Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to http://localhost:5173/login
4. Click "Continue with Google"
5. Verify you're redirected to Google login
6. After authentication, verify you're redirected back and logged in

#### Production Testing
1. Go to https://portaluse.onrender.com/login
2. Click "Continue with Google"
3. Complete Google authentication
4. Verify successful login and redirect to dashboard

## 🔒 Security Features

1. **OAuth 2.0 Standard**: Uses industry-standard authentication
2. **JWT Token Generation**: Generates secure JWT tokens after OAuth
3. **Email Verification**: Google-verified email addresses only
4. **No Password Storage**: OAuth users don't have passwords in database
5. **HTTPS Only**: Production uses encrypted connections

## 📋 User Flow

1. User clicks "Continue with Google" button
2. Redirected to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back to `/api/auth/google/callback`
5. Backend verifies OAuth token with Google
6. Backend finds or creates user account
7. Backend generates JWT token
8. Redirects to `/auth/callback` with token and user info
9. Frontend stores token in localStorage
10. Redirects to appropriate dashboard (student/company/admin)

## 🎯 Role Assignment for OAuth Users

When a user signs in with Google for the first time, they need to complete their profile:

### For Students:
- Auto-creates StudentProfile with generated roll number
- Redirects to Profile page to complete information
- Can fill in: branch, year, CGPA, skills, resume

### For Companies:
- Auto-creates Company profile
- Redirects to Profile/Overview page
- Can fill in: company description, website, location

### For Admin:
- Requires manual database entry for security
- Cannot create admin via OAuth registration

## 🚨 Important Notes

1. **First-time OAuth users** are created with role='student' by default
2. **Google emails must be unique** - one account per email
3. **Password not required** for OAuth users
4. **Existing email users** can't switch to OAuth (security feature)
5. **Environment variables must be set** before testing

## 📝 Environment Variables Summary

```env
# Required for OAuth to work
GOOGLE_CLIENT_ID=from_google_cloud_console
GOOGLE_CLIENT_SECRET=from_google_cloud_console
GOOGLE_CALLBACK_URL=https://portalback-dsr4.onrender.com/api/auth/google/callback
FRONTEND_URL=https://portaluse.onrender.com

# Existing variables
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that redirect URI in Google Console exactly matches `GOOGLE_CALLBACK_URL`
- Ensure no trailing slashes

### Error: "authentication_failed"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that Google+ API is enabled

### Error: "missing_parameters"
- Verify all environment variables are set
- Check that `FRONTEND_URL` is correct

### User redirected but not logged in
- Check browser console for errors
- Verify `/auth/callback` route is set up correctly
- Check that localStorage is not blocked

## ✨ Next Steps

1. Set up Google Cloud Console project
2. Get OAuth credentials
3. Update environment variables locally
4. Test locally
5. Deploy to Render with production credentials
6. Test in production

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check backend logs on Render
3. Verify all environment variables are set
4. Ensure Google Cloud project is properly configured

---

**Implementation completed successfully! 🎉**
