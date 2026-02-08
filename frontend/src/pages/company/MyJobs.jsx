import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Calendar, Users, Eye, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get('/api/company/jobs');
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (job) => {
    if (job.approvalStatus === 'Rejected') {
      return 'bg-red-100 text-red-700';
    }
    if (job.approvalStatus === 'Pending') {
      return 'bg-orange-100 text-orange-700';
    }
    if (job.approvalStatus === 'Approved' && job.status === 'Open') {
      return 'bg-green-100 text-green-700';
    }
    if (job.status === 'Closed') {
      return 'bg-gray-100 text-gray-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusText = (job) => {
    if (job.approvalStatus === 'Rejected') return 'Rejected';
    if (job.approvalStatus === 'Pending') return 'Pending Approval';
    if (job.approvalStatus === 'Approved' && job.status === 'Open') return 'Active';
    if (job.status === 'Closed') return 'Closed';
    return job.status;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Job Postings</h1>
        <Link to="/company/post-job" className="btn-primary">
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No jobs posted yet</p>
          <Link to="/company/post-job" className="btn-primary inline-flex">
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <p className="text-gray-600">{job.jobType} • ₹{job.package} LPA</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`badge ${getStatusBadge(job)}`}>
                    {getStatusText(job)}
                  </span>
                  <span className="badge bg-blue-100 text-blue-700">
                    {job.employmentType}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    Package
                  </p>
                  <p className="font-medium">₹{job.package} LPA</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </p>
                  <p className="font-medium">{job.location?.city || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{job.employmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="font-medium">{format(new Date(job.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {/* Rejection Notice */}
              {job.approvalStatus === 'Rejected' && job.rejectedReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-1">
                        This job posting was rejected by admin
                      </p>
                      <p className="text-sm text-red-700 mb-2">
                        <strong>Reason:</strong> {job.rejectedReason}
                      </p>
                      <p className="text-xs text-red-600">
                        You can modify the job details and resubmit for approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Notice */}
              {job.approvalStatus === 'Pending' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        This job is awaiting admin approval
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Students will be able to see and apply once approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.role}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`badge ${getStatusBadge(job)}`}>
                    {getStatusText(job)}
                  </span>
                  <span className="badge bg-blue-100 text-blue-700">
                    {job.employmentType}
                  </span>
                </div>
              </div>

              <Link
                to={`/company/applicants/${job._id}`}
                className="btn-secondary inline-flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Applicants
              </Link>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                {job.approvalStatus === 'Rejected' && (
                  <button
                    onClick={() => navigate(`/company/edit-job/${job._id}`)}
                    className="btn-primary"
                  >
                    Edit & Resubmit
                  </button>
                )}
                {job.approvalStatus === 'Approved' && job.status === 'Open' && (
                  <>
                    <button
                      onClick={() => navigate(`/company/applicants/${job._id}`)}
                      className="btn-secondary"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Applicants
                    </button>
                    <button
                      onClick={() => handleCloseJob(job._id)}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      Close Job
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
