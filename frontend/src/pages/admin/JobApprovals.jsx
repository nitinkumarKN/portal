import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, X, Eye, Search, IndianRupee, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function JobApprovals() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm]);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get('/api/admin/jobs/pending', {
        params: { page: currentPage, limit: 10, search: searchTerm }
      });
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (jobId) => {
    try {
      const { data } = await axios.get(`/api/admin/job/${jobId}`);
      setSelectedJob(data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load details');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this job posting?')) return;
    
    setProcessingId(id);
    try {
      await axios.patch(`/api/admin/job/${id}/approve`);
      toast.success('Job approved successfully');
      fetchJobs();
      setShowDetailsModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    setProcessingId(selectedJob.job._id);
    try {
      await axios.patch(`/api/admin/job/${selectedJob.job._id}/reject`, {
        reason: rejectReason
      });
      toast.success('Job rejected');
      fetchJobs();
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Approvals</h1>
        <p className="text-gray-600">{jobs.length} pending approvals</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">All jobs reviewed!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <p className="text-gray-600">{job.companyId.companyName}</p>
                </div>
                <div className="flex space-x-2">
                  <span className="badge bg-orange-100 text-orange-700">Pending Approval</span>
                  <span className="badge bg-blue-100 text-blue-700">{job.employmentType}</span>
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
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{job.location?.city || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Deadline
                  </p>
                  <p className="font-medium">{format(new Date(job.deadline), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    Min CGPA
                  </p>
                  <p className="font-medium">{job.eligibility.minCGPA}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Eligible Branches</p>
                <div className="flex flex-wrap gap-2">
                  {job.eligibility.branches.map((branch) => (
                    <span key={branch} className="badge bg-purple-100 text-purple-700">
                      {branch}
                    </span>
                  ))}
                </div>
              </div>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="badge bg-indigo-100 text-indigo-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => viewDetails(job._id)}
                  className="btn-secondary flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => handleApprove(job._id)}
                  disabled={processingId === job._id}
                  className="btn-primary flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    viewDetails(job._id);
                    setTimeout(() => setShowRejectModal(true), 300);
                  }}
                  disabled={processingId === job._id}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedJob.job.title}</h2>
                  <p className="text-gray-600">{selectedJob.job.companyId.companyName}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Details */}
                <div>
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <p className="text-gray-700">{selectedJob.job.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Job Role</label>
                    <p className="font-medium">{selectedJob.job.role}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Employment Type</label>
                    <p className="font-medium">{selectedJob.job.employmentType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Job Mode</label>
                    <p className="font-medium">{selectedJob.job.jobMode}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Openings</label>
                    <p className="font-medium">{selectedJob.job.numberOfOpenings}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Package (LPA)</label>
                    <p className="font-medium">₹{selectedJob.job.package}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Deadline</label>
                    <p className="font-medium">
                      {format(new Date(selectedJob.job.deadline), 'MMMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Minimum CGPA</label>
                      <p className="font-medium">{selectedJob.job.eligibility.minCGPA}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max Backlogs</label>
                      <p className="font-medium">{selectedJob.job.eligibility.maxBacklogs || 0}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm text-gray-600 block mb-2">Eligible Branches</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.job.eligibility.branches.map((branch) => (
                        <span key={branch} className="badge bg-purple-100 text-purple-700">
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedJob.job.requiredSkills && selectedJob.job.requiredSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.job.requiredSkills.map((skill, index) => (
                        <span key={index} className="badge bg-indigo-100 text-indigo-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selection Process */}
                {selectedJob.job.selectionProcess && selectedJob.job.selectionProcess.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Selection Process</h3>
                    <div className="space-y-2">
                      {selectedJob.job.selectionProcess.map((stage, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                          <p className="font-medium">{stage.stage}</p>
                          {stage.duration && <p className="text-sm text-gray-600">Duration: {stage.duration}</p>}
                          {stage.description && <p className="text-sm mt-1">{stage.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval History */}
                {selectedJob.approvalHistory.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Approval History</h3>
                    <div className="space-y-2">
                      {selectedJob.approvalHistory.map((log, index) => (
                        <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-gray-600">
                            By {log.performedBy.name} on {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {log.reason && <p className="text-sm mt-1">Reason: {log.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="btn-secondary text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedJob.job._id)}
                    disabled={processingId}
                    className="btn-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {processingId ? 'Processing...' : 'Approve Job'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Job Posting</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a detailed reason for rejection. This will be sent to the company.
            </p>
            <textarea
              rows={4}
              className="input mb-4"
              placeholder="Reason for rejection (minimum 10 characters)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId || rejectReason.trim().length < 10}
                className="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processingId ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
