import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const approveCompanyByEmail = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    const User = mongoose.model('User');
    const Company = mongoose.model('Company');

    const user = await User.findOne({ email, role: 'company' });
    
    if (!user) {
      console.log('❌ Company user not found with email:', email);
      process.exit(1);
    }

    const company = await Company.findOne({ userId: user._id });
    
    if (!company) {
      console.log('❌ Company profile not found');
      process.exit(1);
    }

    console.log('Found company:', company.companyName);
    console.log('Current status:', company.approvalStatus);
    console.log('Current approved:', company.approved);

    // Approve the company
    company.approved = true;
    company.approvalStatus = 'Approved';
    company.approvedAt = new Date();
    await company.save();

    console.log('\n✅ Company approved successfully!');
    console.log('Company:', company.companyName);
    console.log('Status:', company.approvalStatus);
    console.log('Approved:', company.approved);
    console.log('\nThe company can now post jobs!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Get email from command line argument or use default
const email = process.argv[2] || 'singh@company.com'; // Change this to your company email
approveCompanyByEmail(email);
