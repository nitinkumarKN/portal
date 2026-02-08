import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Search, Filter, Calendar, IndianRupee, Building, 
  Briefcase, Clock, CheckCircle, XCircle, AlertCircle,
  Eye, TrendingUp, Award
} from 'lucide-react';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, applications]);

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('/api/student/applications', {
        params: { status: statusFilter, sortBy }
      });
      setApplications(data);
      setFilteredApps(data);
    } catch (error) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!searchTerm) {
      setFilteredApps(applications);
      return;
    }

    const filtered = applications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.jobId?.title?.toLowerCase().includes(searchLower) ||
        app.jobId?.companyId?.companyName?.toLowerCase().includes(searchLower) ||
        app.jobId?.role?.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredApps(filtered);
  };

  const viewDetails = async (appId) => {
    try {
      const { data } = await axios.get(`/api/student/application/${appId}`);
      setSelectedApp(data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load details');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied':
        return <Clock className="w-4 h-4" />;
      case 'Shortlisted':
        return <AlertCircle className="w-4 h-4" />;
      case 'Selected':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
    all: applications.length,
    Applied: applications.filter(a => a.status === 'Applied').length,
    Shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    Selected: applications.filter(a => a.status === 'Selected').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length
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
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-gray-600">Track all your job applications and placement progress</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`card text-center cursor-pointer transition-all ${
            statusFilter === 'all' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-sm text-gray-600 mt-1">Total</div>
        </button>
        
        <button
          onClick={() => setStatusFilter('Applied')}
          className={`card text-center cursor-pointer transition-all ${
            statusFilter === 'Applied' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-2xl font-bold text-blue-700">{statusCounts.Applied}</div>
          <div className="text-sm text-gray-600 mt-1">Applied</div>
        </button>
        
        <button
          onClick={() => setStatusFilter('Shortlisted')}
          className={`card text-center cursor-pointer transition-all ${
            statusFilter === 'Shortlisted' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-2xl font-bold text-orange-700">{statusCounts.Shortlisted}</div>
          <div className="text-sm text-gray-600 mt-1">Shortlisted</div>
        </button>
        
        <button
          onClick={() => setStatusFilter('Selected')}
          className={`card text-center cursor-pointer transition-all ${
            statusFilter === 'Selected' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-2xl font-bold text-green-700">{statusCounts.Selected}</div>
          <div className="text-sm text-gray-600 mt-1">Selected</div>
        </button>
        
        <button
          onClick={() => setStatusFilter('Rejected')}
          className={`card text-center cursor-pointer transition-all ${
            statusFilter === 'Rejected' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-2xl font-bold text-red-700">{statusCounts.Rejected}</div>
          <div className="text-sm text-gray-600 mt-1">Rejected</div>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by company or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
          </select>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No applications found' : 'No applications yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'Start applying to jobs to see them here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div key={app._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {app.jobId?.title || 'Job Deleted'}
                      </h3>
                      <p className="text-gray-600">
                        {app.jobId?.companyId?.companyName || 'Company N/A'}
                      </p>
                      {app.jobId?.role && (
                        <p className="text-sm text-gray-500 mt-1">{app.jobId.role}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`badge flex items-center space-x-1 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span>{app.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    Package
                  </p>
                  <p className="font-medium">
                    {app.jobId?.package ? `₹${app.jobId.package} LPA` : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Applied On
                  </p>
                  <p className="font-medium">
                    {format(new Date(app.appliedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Last Updated
                  </p>
                  <p className="font-medium">
                    {format(new Date(app.updatedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {app.status === 'Selected' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      Congratulations! You have been selected for this position.
                    </span>
                  </div>
                </div>
              )}

              {app.status === 'Shortlisted' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      You have been shortlisted. Wait for further updates.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => viewDetails(app._id)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedApp.jobId?.title}</h2>
                  <p className="text-gray-600">{selectedApp.jobId?.companyId?.companyName}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="font-semibold mb-2">Application Status</h3>
                  <span className={`badge ${getStatusColor(selectedApp.status)} flex items-center space-x-1 w-fit`}>
                    {getStatusIcon(selectedApp.status)}
                    <span>{selectedApp.status}</span>
                  </span>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold mb-3">Application Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Applied</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(selectedApp.appliedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    {selectedApp.status !== 'Applied' && (
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          selectedApp.status === 'Selected' ? 'bg-green-500' :
                          selectedApp.status === 'Shortlisted' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">{selectedApp.status}</p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(selectedApp.updatedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div>
                  <h3 className="font-semibold mb-2">Job Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Package</label>
                      <p className="font-medium">₹{selectedApp.jobId?.package} LPA</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Job Type</label>
                      <p className="font-medium">{selectedApp.jobId?.employmentType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Location</label>
                      <p className="font-medium">{selectedApp.jobId?.location?.city || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Job Mode</label>
                      <p className="font-medium">{selectedApp.jobId?.jobMode}</p>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                {selectedApp.jobId?.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Job Description</h3>
                    <p className="text-gray-700">{selectedApp.jobId.description}</p>
                  </div>
                )}

                {/* Required Skills */}
                {selectedApp.jobId?.requiredSkills && selectedApp.jobId.requiredSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.jobId.requiredSkills.map((skill, index) => (
                        <span key={index} className="badge bg-indigo-100 text-indigo-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="btn-secondary w-full"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
