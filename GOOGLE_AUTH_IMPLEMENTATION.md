# Google OAuth Implementation Guide

## ✅ What's Already Done (Frontend)

The "Continue with Google" button has been added to:
- ✅ [Login Page](frontend/src/pages/LoginPage.jsx)
- ✅ [Register Page](frontend/src/pages/RegisterPage.jsx)  
- ✅ [Admin Login Page](frontend/src/pages/AdminLogin.jsx)

Currently, clicking the button shows a message: "Google authentication is not yet configured."

---

## 🔧 To Complete Google OAuth (Backend Implementation)

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Authorized redirect URIs**:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://portalback-dsr4.onrender.com/api/auth/google/callback`
6. Save your **Client ID** and **Client Secret**

### Step 2: Install Required Packages (Backend)

```bash
cd backend
npm install passport passport-google-oauth20 express-session
```

### Step 3: Add Environment Variables

In `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

In Render Dashboard (Backend Service → Environment):
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://portalback-dsr4.onrender.com/api/auth/google/callback
```

### Step 4: Create Google Strategy (Backend)

Create `backend/config/passport.js`:

```javascript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const role = req.query.role || 'student'; // Get role from query param

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
          // User exists, log them in
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: email,
          password: Math.random().toString(36).slice(-8), // Random password
          role: role,
          googleId: profile.id,
        });

        // Create profile based on role
        if (role === 'student') {
          await StudentProfile.create({ userId: user._id });
        } else if (role === 'company') {
          await Company.create({ 
            userId: user._id,
            companyName: profile.displayName
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
```

### Step 5: Add Google Routes (Backend)

In `backend/routes/authRoutes.js`:

```javascript
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

// Initiate Google OAuth
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'student';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role, // Pass role through state
  })(req, res, next);
});

// Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false 
  }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${req.user.role}`);
  }
);
```

### Step 6: Update Backend app.js

```javascript
import session from 'express-session';
import passport from './config/passport.js';

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
```

### Step 7: Update User Model (Backend)

Add `googleId` field to `backend/models/User.js`:

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'company', 'admin'], required: true },
  googleId: { type: String, unique: true, sparse: true }, // Add this
  createdAt: { type: Date, default: Date.now }
});
```

### Step 8: Create Auth Callback Handler (Frontend)

Create `frontend/src/pages/AuthCallback.jsx`:

```jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (token) {
      localStorage.setItem('token', token);
      // Fetch user data and redirect
      navigate(`/${role}`);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return <LoadingSpinner />;
}
```

Add route in `frontend/src/App.jsx`:
```jsx
import AuthCallback from './pages/AuthCallback';

// In routes:
<Route path="/auth/callback" element={<AuthCallback />} />
```

### Step 9: Update Frontend Handlers

In `LoginPage.jsx`, `RegisterPage.jsx`, and `AdminLogin.jsx`, uncomment the Google OAuth URLs:

```javascript
const handleGoogleLogin = () => {
  const role = 'student'; // or 'company', 'admin'
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google?role=${role}`;
};
```

---

## 🧪 Testing

1. Click "Continue with Google" on any login/register page
2. Select Google account
3. Should redirect back to the app and log you in
4. Check that user profile is created correctly

---

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use environment variables in Render dashboard
- Ensure redirect URIs match exactly in Google Console
- Keep client secrets secure
- Consider adding email verification step

---

## 📝 Current Status

- ✅ Frontend UI complete
- ⏳ Backend implementation pending
- ⏳ Google Cloud credentials pending
- ⏳ Testing pending

Once backend is implemented, remove the toast error messages and uncomment the `window.location.href` lines in the frontend handlers.
