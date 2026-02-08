import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, X, Building, Briefcase, ExternalLink, Loader } from 'lucide-react';

export default function QuickApprovals() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        axios.get('/api/admin/companies/pending'),
        axios.get('/api/admin/jobs/pending')
      ]);
      setCompanies(companiesRes.data.companies || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (error) {
      toast.error('Failed to load approvals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveCompany = async (id, name) => {
    if (!window.confirm(`Approve ${name}?`)) return;
    
    setProcessing(id);
    try {
      await axios.patch(`/api/admin/company/${id}/approve`);
      toast.success(`${name} approved! They can now post jobs.`);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(null);
    }
  };

  const approveJob = async (id, title) => {
    if (!window.confirm(`Approve job: ${title}?`)) return;
    
    setProcessing(id);
    try {
      await axios.patch(`/api/admin/job/${id}/approve`);
      toast.success(`${title} approved! Now visible to students.`);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (type, id, name) => {
    setRejectTarget({ type, id, name });
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      toast.error('Please provide a reason (minimum 10 characters)');
      return;
    }

    setProcessing(rejectTarget.id);
    try {
      const endpoint = rejectTarget.type === 'company' 
        ? `/api/admin/company/${rejectTarget.id}/reject`
        : `/api/admin/job/${rejectTarget.id}/reject`;
      
      await axios.patch(endpoint, { reason: rejectReason });
      toast.success(`${rejectTarget.name} rejected`);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectTarget(null);
      fetchAll();
    } catch (error) {
      toast.error('Rejection failed');
    } finally {
      setProcessing(null);
    }
  };

  const approveAllCompanies = async () => {
    if (!window.confirm(`Approve ALL ${companies.length} pending companies?`)) return;
    
    setProcessing('all-companies');
    try {
      await Promise.all(
        companies.map(c => axios.patch(`/api/admin/company/${c._id}/approve`))
      );
      toast.success(`All ${companies.length} companies approved!`);
      fetchAll();
    } catch (error) {
      toast.error('Some approvals failed');
    } finally {
      setProcessing(null);
    }
  };

  const approveAllJobs = async () => {
    if (!window.confirm(`Approve ALL ${jobs.length} pending jobs?`)) return;
    
    setProcessing('all-jobs');
    try {
      await Promise.all(
        jobs.map(j => axios.patch(`/api/admin/job/${j._id}/approve`))
      );
      toast.success(`All ${jobs.length} jobs approved!`);
      fetchAll();
    } catch (error) {
      toast.error('Some approvals failed');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quick Approvals</h1>
          <p className="text-gray-600">Approve or reject pending items</p>
        </div>
        
        {/* Bulk Action Buttons */}
        {(companies.length > 0 || jobs.length > 0) && (
          <div className="flex space-x-3">
            {companies.length > 0 && (
              <button
                onClick={approveAllCompanies}
                disabled={processing === 'all-companies'}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 shadow-lg"
              >
                <Check className="w-5 h-5" />
                <span>
                  {processing === 'all-companies' 
                    ? 'Approving All...' 
                    : `Approve All ${companies.length} Companies`}
                </span>
              </button>
            )}
            
            {jobs.length > 0 && (
              <button
                onClick={approveAllJobs}
                disabled={processing === 'all-jobs'}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 shadow-lg"
              >
                <Check className="w-5 h-5" />
                <span>
                  {processing === 'all-jobs' 
                    ? 'Approving All...' 
                    : `Approve All ${jobs.length} Jobs`}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Companies Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Building className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Pending Companies ({companies.length})</h2>
        </div>

        {companies.length === 0 ? (
          <div className="card text-center py-12">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">No companies pending approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div key={company._id} className="card border-l-4 border-orange-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{company.companyName}</h3>
                        <p className="text-sm text-gray-600">{company.userId?.email}</p>
                        <p className="text-sm text-gray-700 mt-2">{company.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <span className="text-xs text-gray-500">Industry:</span>
                            <p className="text-sm font-medium">{company.industry || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Location:</span>
                            <p className="text-sm font-medium">{company.location || 'Not specified'}</p>
                          </div>
                        </div>

                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1 mt-2"
                          >
                            <span>Visit Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => approveCompany(company._id, company.companyName)}
                      disabled={processing === company._id}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{processing === company._id ? 'Approving...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => openRejectModal('company', company._id, company.companyName)}
                      disabled={processing === company._id}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Jobs Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Briefcase className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Pending Jobs ({jobs.length})</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="card text-center py-12">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">No jobs pending approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="card border-l-4 border-orange-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.companyId?.companyName}</p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{job.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <span className="text-xs text-gray-500">Package:</span>
                            <p className="text-sm font-medium">₹{job.package} LPA</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Min CGPA:</span>
                            <p className="text-sm font-medium">{job.eligibility?.minCGPA}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Type:</span>
                            <p className="text-sm font-medium">{job.employmentType}</p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Branches:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.eligibility?.branches?.map((branch) => (
                              <span key={branch} className="badge bg-purple-100 text-purple-700 text-xs">
                                {branch}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => approveJob(job._id, job.title)}
                      disabled={processing === job._id}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{processing === job._id ? 'Approving...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => openRejectModal('job', job._id, job.title)}
                      disabled={processing === job._id}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Reject {rejectTarget?.type === 'company' ? 'Company' : 'Job'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a detailed reason for rejection.
            </p>
            <textarea
              rows={4}
              className="input mb-4"
              placeholder="Minimum 10 characters..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectTarget(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || rejectReason.trim().length < 10}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
