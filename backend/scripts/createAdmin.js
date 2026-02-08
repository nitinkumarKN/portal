import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean
    }, { timestamps: true }));

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@college.edu' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@college.edu');
      console.log('You may need to reset the password');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@college.edu',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@college.edu');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
