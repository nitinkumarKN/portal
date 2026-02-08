import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkApprovals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    const Company = mongoose.model('Company');
    const Job = mongoose.model('Job');

    // Check Companies
    console.log('📊 COMPANY STATUS:');
    console.log('==================');
    const allCompanies = await Company.find().populate('userId', 'email');
    console.log(`Total Companies: ${allCompanies.length}`);
    
    allCompanies.forEach(c => {
      console.log(`  ${c.companyName}`);
      console.log(`    Email: ${c.userId?.email}`);
      console.log(`    Status: ${c.approvalStatus || 'NOT SET'}`);
      console.log(`    Approved: ${c.approved}`);
      console.log('');
    });

    const pendingCompanies = await Company.find({ approvalStatus: 'Pending' });
    console.log(`\n🔶 Pending Approval: ${pendingCompanies.length} companies`);
    pendingCompanies.forEach(c => console.log(`  - ${c.companyName}`));

    // Check Jobs
    console.log('\n\n📊 JOB STATUS:');
    console.log('==================');
    const allJobs = await Job.find().populate('companyId', 'companyName');
    console.log(`Total Jobs: ${allJobs.length}`);
    
    allJobs.forEach(j => {
      console.log(`  ${j.title}`);
      console.log(`    Company: ${j.companyId?.companyName}`);
      console.log(`    Status: ${j.approvalStatus || 'NOT SET'}`);
      console.log(`    Approved: ${j.approved}`);
      console.log('');
    });

    const pendingJobs = await Job.find({ approvalStatus: 'Pending' });
    console.log(`\n🔶 Pending Approval: ${pendingJobs.length} jobs`);
    pendingJobs.forEach(j => console.log(`  - ${j.title} (${j.companyId?.companyName})`));

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkApprovals();
