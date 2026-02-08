import { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, Send, Award, TrendingUp, AlertCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { Link } from 'react-router-dom';

export default function Overview() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [availableJobs, setAvailableJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, appsRes, jobsRes] = await Promise.all([
        axios.get('/api/student/profile'),
        axios.get('/api/student/applications'),
        axios.get('/api/student/jobs')
      ]);
      
      setProfile(profileRes.data);
      setApplications(appsRes.data);
      setAvailableJobs(jobsRes.data.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const statusCounts = {
    applied: applications.filter(a => a.status === 'Applied').length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    selected: applications.filter(a => a.status === 'Selected').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {profile?.userId?.name}!</h1>
        <p className="text-gray-600">Track your placement journey</p>
      </div>

      {/* Profile Completion Alert */}
      {(!profile?.resumeUrl || !profile?.skills || profile.skills.length === 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-orange-900">Complete Your Profile</h3>
              <p className="text-sm text-orange-700 mt-1">
                {!profile?.resumeUrl && 'Upload your resume. '}
                {(!profile?.skills || profile.skills.length === 0) && 'Add your skills. '}
                This will help you get better job matches!
              </p>
              <Link to="/student/profile" className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block">
                Complete Profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          icon={<Briefcase className="w-6 h-6" />}
          label="Available Jobs"
          value={availableJobs}
          color="primary"
        />
        <StatCard
          icon={<Send className="w-6 h-6" />}
          label="Applications Sent"
          value={applications.length}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Shortlisted"
          value={statusCounts.shortlisted}
          color="orange"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Selected"
          value={statusCounts.selected}
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/student/jobs" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Browse Jobs</h3>
              <p className="text-sm text-gray-600">{availableJobs} jobs available for you</p>
            </div>
          </div>
        </Link>

        <Link to="/student/applications" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">My Applications</h3>
              <p className="text-sm text-gray-600">{applications.length} applications submitted</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link to="/student/applications" className="text-sm text-primary-600 hover:text-primary-700">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{app.jobId?.title}</p>
                  <p className="text-sm text-gray-600">{app.jobId?.companyId?.companyName}</p>
                </div>
                <span className={`badge ${
                  app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                  app.status === 'Shortlisted' ? 'bg-orange-100 text-orange-700' :
                  app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Summary */}
      {profile && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Profile</h2>
            <Link 
              to="/student/profile" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit Profile →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Roll Number</p>
              <p className="font-semibold text-gray-900">{profile.rollNo}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Branch</p>
              <p className="font-semibold text-gray-900">{profile.branch}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">CGPA</p>
              <p className="font-semibold text-gray-900">{profile.cgpa}</p>
            </div>
          </div>
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="badge bg-indigo-100 text-indigo-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
