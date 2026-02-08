import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const debugStudentJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    const StudentProfile = mongoose.model('StudentProfile');
    const Job = mongoose.model('Job');
    const User = mongoose.model('User');

    // Get all students
    const students = await StudentProfile.find().populate('userId', 'name email');
    console.log(`👥 Total Students: ${students.length}\n`);

    if (students.length === 0) {
      console.log('❌ No students found!\n');
      process.exit(0);
    }

    // Check each student
    for (const student of students) {
      console.log('=' .repeat(80));
      console.log(`Student: ${student.userId?.name || 'N/A'} (${student.userId?.email})`);
      console.log(`Branch: ${student.branch}, CGPA: ${student.cgpa}`);
      console.log(`Skills: ${student.skills?.join(', ') || 'None'}`);
      console.log(`Resume: ${student.resumeUrl ? '✅ Uploaded' : '❌ Not uploaded'}`);
      console.log('');

      // Find eligible jobs for this student
      const allJobs = await Job.find({
        approved: true,
        isActive: true,
        approvalStatus: 'Approved',
        deadline: { $gte: new Date() }
      });

      console.log(`Total Active Jobs: ${allJobs.length}`);

      const eligibleJobs = allJobs.filter(job => {
        const meetsCGPA = job.eligibility.minCGPA <= student.cgpa;
        const meetsBranch = job.eligibility.branches.includes(student.branch) || 
                           job.eligibility.branches.includes('ALL');
        return meetsCGPA && meetsBranch;
      });

      console.log(`Eligible Jobs for this student: ${eligibleJobs.length}`);

      if (eligibleJobs.length === 0) {
        console.log('\n⚠️  No eligible jobs because:');
        allJobs.forEach(job => {
          const meetsCGPA = job.eligibility.minCGPA <= student.cgpa;
          const meetsBranch = job.eligibility.branches.includes(student.branch) || 
                             job.eligibility.branches.includes('ALL');
          
          if (!meetsCGPA || !meetsBranch) {
            console.log(`  ❌ ${job.title}:`);
            if (!meetsCGPA) {
              console.log(`     - CGPA: Required ${job.eligibility.minCGPA}, Student has ${student.cgpa}`);
            }
            if (!meetsBranch) {
              console.log(`     - Branch: Required ${job.eligibility.branches.join(', ')}, Student is ${student.branch}`);
            }
          }
        });
      } else {
        console.log('\n✅ Eligible Jobs:');
        eligibleJobs.forEach(job => {
          console.log(`  - ${job.title} (Min CGPA: ${job.eligibility.minCGPA}, Branches: ${job.eligibility.branches.join(', ')})`);
        });
      }
      console.log('');
    }

    console.log('=' .repeat(80));
    console.log('\n📊 SUMMARY:\n');

    const activeJobs = await Job.countDocuments({
      approved: true,
      isActive: true,
      approvalStatus: 'Approved',
      deadline: { $gte: new Date() }
    });

    console.log(`Total Active Jobs: ${activeJobs}`);
    console.log(`Total Students: ${students.length}`);
    
    if (activeJobs === 0) {
      console.log('\n❌ NO ACTIVE JOBS - Companies need to post and admin needs to approve jobs!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debugStudentJobs();
