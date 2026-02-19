import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, ...additionalData } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });
    console.log('User created:', user._id, role); // Debug log

    if (role === 'student') {
      const studentProfile = await StudentProfile.create({
        userId: user._id,
        rollNo: additionalData.rollNo,
        branch: additionalData.branch,
        cgpa: additionalData.cgpa,
        phone: additionalData.phone
      });
      console.log('Student profile created:', studentProfile._id); // Debug log
    } else if (role === 'company') {
      const company = await Company.create({
        userId: user._id,
        companyName: additionalData.companyName,
        description: additionalData.description,
        industry: additionalData.industry,
        website: additionalData.website,
        location: additionalData.location,
        approved: false,
        approvalStatus: 'Pending'
      });
      console.log('Company created:', company._id); // Debug log
    }

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email); // Debug log

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email); // Debug log
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('Invalid password for:', email); // Debug log
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    console.log('Login successful:', email, 'Role:', user.role); // Debug log

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

// Google OAuth authentication
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
});

// Google OAuth callback handler
export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google auth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    if (!user) {
      console.log('No user returned from Google auth');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    try {
      // Generate JWT token for the user
      const token = generateToken(user._id);

      // Redirect to frontend with token and user info
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&userId=${user._id}&role=${user.role}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Token generation error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  })(req, res, next);
};
