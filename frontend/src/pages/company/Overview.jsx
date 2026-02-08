import { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, Users, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { Link } from 'react-router-dom';

export default function Overview() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, jobsRes] = await Promise.all([
        axios.get('/api/company/profile'),
        axios.get('/api/company/jobs')
      ]);
      setProfile(profileRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const activeJobs = jobs.filter(j => j.isActive && j.approved);
  const pendingJobs = jobs.filter(j => !j.approved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.companyName}</h1>
        <p className="text-gray-600">Manage your recruitment process</p>
      </div>

      {/* Company Approval Status Alert */}
      {profile && profile.approvalStatus === 'Pending' && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Company Approval Pending
              </h3>
              <p className="text-orange-700">
                Your company registration is under review by the placement office. 
                You will be notified once approved. You cannot post jobs until approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {profile && profile.approvalStatus === 'Rejected' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Company Registration Rejected
              </h3>
              <p className="text-red-700 mb-3">
                Your company registration has been rejected by the placement office.
              </p>
              {profile.rejectedReason && (
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Reason for Rejection:</p>
                  <p className="text-sm text-gray-700">{profile.rejectedReason}</p>
                </div>
              )}
              <p className="text-sm text-red-600 mt-3">
                Please contact the placement office at <a href="mailto:placement@college.edu" className="underline">placement@college.edu</a> for clarification.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Briefcase className="w-6 h-6" />}
          label="Total Jobs"
          value={jobs.length}
          color="primary"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Active Jobs"
          value={activeJobs.length}
          color="success"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Pending Approval"
          value={pendingJobs.length}
          color="warning"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Applicants"
          value={0}
          color="primary"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Company Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Company Name</span>
              <span className="font-medium">{profile.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Industry</span>
              <span className="font-medium">{profile.industry || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location</span>
              <span className="font-medium">{profile.location || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`badge ${profile.approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {profile.approved ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link to="/company/post-job" className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-primary-900">Post New Job</div>
                  <div className="text-sm text-primary-700">Create a new job opening</div>
                </div>
              </div>
            </Link>
            <Link to="/company/jobs" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">View All Jobs</div>
                  <div className="text-sm text-gray-600">Manage your job postings</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Jobs</h2>
          <Link to="/company/jobs" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {jobs.slice(0, 5).map((job) => (
            <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">₹{job.package} LPA • {job.jobType}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`badge ${job.approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {job.approved ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No jobs posted yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
