import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';

// Check if Google OAuth is configured
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const role = req.query.state || 'student'; // Get role from state parameter

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
          // User exists, log them in
          return done(null, user);
        }

        // Create new user with Google data
        user = await User.create({
          name: profile.displayName,
          email: email,
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random secure password
          role: role,
          googleId: profile.id,
        });

        // Create profile based on role
        if (role === 'student') {
          await StudentProfile.create({ 
            userId: user._id,
            rollNo: `GOOGLE-${user._id.toString().slice(-6)}`, // Auto-generate roll number
            branch: 'CSE',
            cgpa: 0,
          });
        } else if (role === 'company') {
          await Company.create({ 
            userId: user._id,
            companyName: profile.displayName,
            description: 'Company registered via Google',
            industry: 'Technology',
            location: 'Not specified',
            approved: false,
            approvalStatus: 'Pending'
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
