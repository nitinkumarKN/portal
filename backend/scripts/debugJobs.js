import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const debugJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    const Job = mongoose.model('Job');
    const Company = mongoose.model('Company');
    const StudentProfile = mongoose.model('StudentProfile');

    console.log('=' .repeat(80));
    console.log('JOB AVAILABILITY DEBUG');
    console.log('=' .repeat(80));

    // Check all jobs
    const allJobs = await Job.find().populate('companyId', 'companyName approved');
    console.log(`\n📊 Total Jobs in Database: ${allJobs.length}\n`);

    if (allJobs.length === 0) {
      console.log('❌ NO JOBS FOUND - Companies need to post jobs!\n');
      console.log('To fix:');
      console.log('1. Login as a company');
      console.log('2. Make sure company is approved by admin');
      console.log('3. Post a job from company dashboard\n');
    } else {
      // Breakdown by status
      console.log('Breakdown by Approval Status:');
      const approved = allJobs.filter(j => j.approvalStatus === 'Approved');
      const pending = allJobs.filter(j => j.approvalStatus === 'Pending');
      const draft = allJobs.filter(j => j.approvalStatus === 'Draft');
      const rejected = allJobs.filter(j => j.approvalStatus === 'Rejected');

      console.log(`  ✅ Approved: ${approved.length}`);
      console.log(`  ⏳ Pending: ${pending.length}`);
      console.log(`  📝 Draft: ${draft.length}`);
      console.log(`  ❌ Rejected: ${rejected.length}\n`);

      // Check active jobs
      const now = new Date();
      const activeJobs = allJobs.filter(j => 
        j.approved === true && 
        j.approvalStatus === 'Approved' && 
        j.isActive === true &&
        new Date(j.deadline) >= now
      );

      console.log(`🟢 Active & Available Jobs: ${activeJobs.length}\n`);

      if (activeJobs.length === 0) {
        console.log('⚠️  No active jobs available for students!\n');
        
        if (pending.length > 0) {
          console.log(`🔶 ${pending.length} jobs waiting for admin approval:`);
          pending.forEach(j => {
            console.log(`   - ${j.title} (${j.companyId?.companyName})`);
          });
          console.log('\n👉 Login as admin and approve these jobs!\n');
        }

        if (draft.length > 0) {
          console.log(`📝 ${draft.length} jobs saved as draft (not submitted):`);
          draft.forEach(j => {
            console.log(`   - ${j.title} (${j.companyId?.companyName})`);
          });
          console.log('\n👉 Companies need to submit these jobs for approval!\n');
        }
      } else {
        console.log('Active Jobs Details:\n');
        activeJobs.forEach((j, i) => {
          console.log(`${i + 1}. ${j.title}`);
          console.log(`   Company: ${j.companyId?.companyName}`);
          console.log(`   Package: ₹${j.package} LPA`);
          console.log(`   Min CGPA: ${j.eligibility.minCGPA}`);
          console.log(`   Branches: ${j.eligibility.branches.join(', ')}`);
          console.log(`   Deadline: ${j.deadline.toLocaleDateString()}`);
          console.log('');
        });
      }
    }

    // Check student profiles
    console.log('=' .repeat(80));
    const students = await StudentProfile.find().populate('userId', 'name email');
    console.log(`\n👥 Total Students: ${students.length}\n`);

    if (students.length > 0) {
      students.forEach((s, i) => {
        console.log(`${i + 1}. ${s.userId?.name || 'N/A'}`);
        console.log(`   Branch: ${s.branch}`);
        console.log(`   CGPA: ${s.cgpa}`);
        console.log(`   Skills: ${s.skills?.join(', ') || 'None'}`);
        console.log('');
      });
    }

    // Check approved companies
    console.log('=' .repeat(80));
    const approvedCompanies = await Company.find({ approved: true, approvalStatus: 'Approved' });
    console.log(`\n🏢 Approved Companies: ${approvedCompanies.length}\n`);

    if (approvedCompanies.length === 0) {
      console.log('❌ No approved companies - Admin needs to approve companies first!\n');
    } else {
      approvedCompanies.forEach((c, i) => {
        console.log(`${i + 1}. ${c.companyName}`);
      });
    }

    console.log('\n' + '=' .repeat(80));
    console.log('SUMMARY & ACTION ITEMS');
    console.log('=' .repeat(80));

    if (allJobs.length === 0) {
      console.log('\n❌ NO JOBS POSTED');
      console.log('\nAction Required:');
      console.log('1. Ensure companies are approved');
      console.log('2. Companies need to post jobs');
    } else if (activeJobs.length === 0) {
      console.log('\n⚠️  NO ACTIVE JOBS FOR STUDENTS');
      console.log('\nAction Required:');
      if (pending.length > 0) {
        console.log('1. Login as admin');
        console.log('2. Go to Quick Approvals');
        console.log('3. Approve pending jobs');
      }
      if (draft.length > 0) {
        console.log('1. Companies need to submit draft jobs');
      }
    } else {
      console.log('\n✅ SYSTEM IS WORKING!');
      console.log(`${activeJobs.length} jobs are available to students`);
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debugJobs();
