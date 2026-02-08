import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    const Job = mongoose.model('Job');
    const Company = mongoose.model('Company');

    const allJobs = await Job.find().populate('companyId', 'companyName').sort({ createdAt: -1 });
    
    console.log(`📊 TOTAL JOBS: ${allJobs.length}\n`);
    console.log('=' .repeat(80));

    allJobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.companyId?.companyName || 'N/A'}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Approval Status: ${job.approvalStatus || 'NOT SET'}`);
      console.log(`   Approved: ${job.approved}`);
      console.log(`   Created: ${job.createdAt}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📈 BREAKDOWN BY STATUS:\n');

    const pending = await Job.countDocuments({ approvalStatus: 'Pending' });
    const approved = await Job.countDocuments({ approvalStatus: 'Approved' });
    const rejected = await Job.countDocuments({ approvalStatus: 'Rejected' });
    const draft = await Job.countDocuments({ approvalStatus: 'Draft' });

    console.log(`   Pending Approval: ${pending}`);
    console.log(`   Approved: ${approved}`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   Draft: ${draft}`);

    console.log('\n🔍 PENDING JOBS DETAILS:\n');
    const pendingJobs = await Job.find({ approvalStatus: 'Pending' }).populate('companyId', 'companyName');
    pendingJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} (${job.companyId?.companyName})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkJobs();
