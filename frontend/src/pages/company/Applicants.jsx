import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Award, FileText, Filter, Search, ArrowLeft, Download } from 'lucide-react';

export default function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: '',
    minCGPA: '',
    status: '',
    search: ''
  });
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  useEffect(() => {
    applyFilters();
  }, [filters, applicants]);

  const fetchApplicants = async () => {
    try {
      console.log('Fetching applicants for job:', jobId);
      const { data } = await axios.get(`/api/company/applicants/${jobId}`);
      console.log('Applicants received:', data);
      setApplicants(data);
      setFilteredApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error(error.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applicants];

    // Branch filter
    if (filters.branch) {
      filtered = filtered.filter(app => app.studentId.branch === filters.branch);
    }

    // CGPA filter
    if (filters.minCGPA) {
      filtered = filtered.filter(app => app.studentId.cgpa >= parseFloat(filters.minCGPA));
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(app =>
        app.studentId.userId.name.toLowerCase().includes(searchLower) ||
        app.studentId.userId.email.toLowerCase().includes(searchLower) ||
        app.studentId.rollNo.toLowerCase().includes(searchLower)
      );
    }

    setFilteredApplicants(filtered);
  };

  const updateStatus = async (applicationId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    setProcessing(applicationId);
    try {
      await axios.patch(`/api/company/application/${applicationId}`, {
        status: newStatus
      });
      toast.success(`Status updated to ${newStatus}`);
      fetchApplicants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-700';
      case 'Shortlisted':
        return 'bg-orange-100 text-orange-700';
      case 'Selected':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusCounts = {
    all: applicants.length,
    Applied: applicants.filter(a => a.status === 'Applied').length,
    Shortlisted: applicants.filter(a => a.status === 'Shortlisted').length,
    Selected: applicants.filter(a => a.status === 'Selected').length,
    Rejected: applicants.filter(a => a.status === 'Rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/company/jobs')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Applicants</h1>
            <p className="text-gray-600">{filteredApplicants.length} applicants found</p>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilters({ ...filters, status: status === 'all' ? '' : status })}
            className={`card text-center cursor-pointer transition-all ${
              (status === 'all' && !filters.status) || filters.status === status
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm text-gray-600 capitalize">{status}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by name, email, or roll no..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select
            className="input"
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          <input
            type="number"
            step="0.1"
            className="input"
            placeholder="Min CGPA"
            value={filters.minCGPA}
            onChange={(e) => setFilters({ ...filters, minCGPA: e.target.value })}
          />

          <button
            onClick={() => setFilters({ branch: '', minCGPA: '', status: '', search: '' })}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {applicants.length === 0 ? 'No applications yet' : 'No applicants match your filters'}
          </h3>
          <p className="text-gray-600">
            {applicants.length === 0 
              ? 'Students will appear here once they apply to this job'
              : 'Try adjusting your filter criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((application) => (
            <div key={application._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{application.studentId.userId.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {application.studentId.userId.email}
                      </span>
                      {application.studentId.phone && (
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {application.studentId.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>

              {/* Application Details */}
              {application.coverLetter && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Cover Letter:</p>
                  <p className="text-sm text-gray-700">{application.coverLetter}</p>
                </div>
              )}

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Roll Number</p>
                  <p className="font-medium">{application.studentId.rollNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-medium">{application.studentId.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    CGPA
                  </p>
                  <p className="font-medium">{application.studentId.cgpa}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applied On</p>
                  <p className="font-medium">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {application.studentId.skills && application.studentId.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {application.studentId.skills.map((skill, index) => (
                      <span key={index} className="badge bg-indigo-100 text-indigo-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {application.expectedSalary && (
                <div>
                  <p className="text-sm text-gray-600">Expected Salary</p>
                  <p className="font-medium">₹{application.expectedSalary} LPA</p>
                </div>
              )}

              {application.availableFrom && (
                <div>
                  <p className="text-sm text-gray-600">Available From</p>
                  <p className="font-medium">
                    {new Date(application.availableFrom).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  {application.studentId.resumeUrl && (
                    <a
                      href={`${import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://portalback-dsr4.onrender.com')}${application.studentId.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Resume</span>
                      <Download className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex space-x-2">
                  {application.status === 'Applied' && (
                    <>
                      <button
                        onClick={() => updateStatus(application._id, 'Shortlisted')}
                        disabled={processing === application._id}
                        className="btn-secondary bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateStatus(application._id, 'Rejected')}
                        disabled={processing === application._id}
                        className="btn-secondary bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {application.status === 'Shortlisted' && (
                    <>
                      <button
                        onClick={() => updateStatus(application._id, 'Selected')}
                        disabled={processing === application._id}
                        className="btn-primary disabled:opacity-50"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => updateStatus(application._id, 'Rejected')}
                        disabled={processing === application._id}
                        className="btn-secondary bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {(application.status === 'Selected' || application.status === 'Rejected') && (
                    <span className="text-sm text-gray-500 italic">No actions available</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
