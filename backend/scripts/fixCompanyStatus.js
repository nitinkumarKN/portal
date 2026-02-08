import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixCompanyStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const Company = mongoose.model('Company', new mongoose.Schema({
      companyName: String,
      approved: Boolean,
      approvalStatus: String
    }, { timestamps: true }));

    // Find all companies without approvalStatus
    const companies = await Company.find();
    
    console.log(`Found ${companies.length} companies`);

    for (const company of companies) {
      if (!company.approvalStatus) {
        company.approvalStatus = company.approved ? 'Approved' : 'Pending';
        await company.save();
        console.log(`Fixed: ${company.companyName} - Status: ${company.approvalStatus}`);
      } else {
        console.log(`OK: ${company.companyName} - Status: ${company.approvalStatus}`);
      }
    }

    // Show pending companies
    const pending = await Company.find({ approvalStatus: 'Pending' });
    console.log(`\n✅ ${pending.length} companies pending approval:`);
    pending.forEach(c => console.log(`  - ${c.companyName}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixCompanyStatus();
