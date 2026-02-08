import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixStudentJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    const StudentProfile = mongoose.model('StudentProfile');
    const Job = mongoose.model('Job');
    const User = mongoose.model('User');

    // Get all students
    const students = await StudentProfile.find().populate('userId', 'name email');
    console.log('=' .repeat(80));
    console.log('STUDENT ELIGIBILITY CHECK');
    console.log('=' .repeat(80));
    console.log(`\nTotal Students: ${students.length}\n`);

    // Get all active jobs
    const activeJobs = await Job.find({
      approved: true,
      approvalStatus: 'Approved',
      status: 'Open',
      deadline: { $gte: new Date() }
    }).populate('companyId', 'companyName');

    console.log(`Total Active Jobs: ${activeJobs.length}\n`);

    if (activeJobs.length === 0) {
      console.log('❌ NO ACTIVE JOBS FOUND!');
      console.log('\nTo fix:');
      console.log('1. Login as company');
      console.log('2. Make sure company is approved');
      console.log('3. Post a job');
      console.log('4. Login as admin and approve the job\n');
      process.exit(0);
    }

    console.log('Active Jobs:');
    activeJobs.forEach((job, i) => {
      console.log(`${i + 1}. ${job.title} - ${job.companyId?.companyName}`);
      console.log(`   Min CGPA: ${job.eligibility.minCGPA}`);
      console.log(`   Branches: ${job.eligibility.branches.join(', ')}`);
      console.log('');
    });

    // Check each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      console.log('=' .repeat(80));
      console.log(`STUDENT ${i + 1}: ${student.userId?.name || 'Unknown'}`);
      console.log('=' .repeat(80));
      console.log(`Email: ${student.userId?.email}`);
      console.log(`Branch: ${student.branch}`);
      console.log(`CGPA: ${student.cgpa}`);
      console.log(`Skills: ${student.skills?.length > 0 ? student.skills.join(', ') : 'None'}`);
      console.log(`Resume: ${student.resumeUrl ? '✅ Uploaded' : '❌ Missing (REQUIRED!)'}`);
      console.log('');

      // Check eligibility for each job
      let eligibleCount = 0;
      
      activeJobs.forEach(job => {
        const meetsCGPA = student.cgpa >= job.eligibility.minCGPA;
        const meetsBranch = job.eligibility.branches.includes(student.branch) || 
                           job.eligibility.branches.includes('ALL');
        const hasResume = !!student.resumeUrl;
        
        const isEligible = meetsCGPA && meetsBranch && hasResume;
        
        if (isEligible) {
          eligibleCount++;
          console.log(`✅ ELIGIBLE: ${job.title}`);
        } else {
          console.log(`❌ NOT ELIGIBLE: ${job.title}`);
          if (!hasResume) console.log(`   - Missing resume`);
          if (!meetsCGPA) console.log(`   - CGPA too low: ${student.cgpa} < ${job.eligibility.minCGPA}`);
          if (!meetsBranch) console.log(`   - Branch mismatch: ${student.branch} not in [${job.eligibility.branches.join(', ')}]`);
        }
      });

      console.log(`\n📊 Summary: Eligible for ${eligibleCount} out of ${activeJobs.length} jobs\n`);
    }

    console.log('=' .repeat(80));
    console.log('RECOMMENDATIONS');
    console.log('=' .repeat(80));

    students.forEach((student, i) => {
      if (!student.resumeUrl) {
        console.log(`\n⚠️  Student ${i + 1} (${student.userId?.name}): Upload resume to see jobs!`);
      }
      
      const eligibleJobs = activeJobs.filter(job => {
        const meetsCGPA = student.cgpa >= job.eligibility.minCGPA;
        const meetsBranch = job.eligibility.branches.includes(student.branch) || 
                           job.eligibility.branches.includes('ALL');
        return meetsCGPA && meetsBranch;
      });

      if (eligibleJobs.length === 0 && student.resumeUrl) {
        console.log(`\n⚠️  Student ${i + 1} (${student.userId?.name}): No eligible jobs due to CGPA/Branch`);
        console.log(`   Consider posting jobs with:`);
        console.log(`   - Min CGPA: ${student.cgpa} or lower`);
        console.log(`   - Branch: ${student.branch} or ALL`);
      }
    });

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixStudentJobs();
