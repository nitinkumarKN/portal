import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    const User = mongoose.model('User');
    const StudentProfile = mongoose.model('StudentProfile');

    // Get all student users
    const studentUsers = await User.find({ role: 'student' });
    console.log(`📊 Total student users: ${studentUsers.length}\n`);

    for (const user of studentUsers) {
      console.log(`Student: ${user.name} (${user.email})`);
      
      const profile = await StudentProfile.findOne({ userId: user._id });
      
      if (profile) {
        console.log(`  ✅ Profile exists`);
        console.log(`     Roll No: ${profile.rollNo}`);
        console.log(`     Branch: ${profile.branch}`);
        console.log(`     CGPA: ${profile.cgpa}`);
        console.log(`     Phone: ${profile.phone || 'Not set'}`);
        console.log(`     Placed: ${profile.placed}`);
      } else {
        console.log(`  ❌ No profile found - THIS IS THE PROBLEM!`);
        console.log(`     User ID: ${user._id}`);
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkStudent();
