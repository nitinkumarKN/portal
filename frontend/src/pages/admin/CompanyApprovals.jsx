import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, X, ExternalLink, Eye, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function CompanyApprovals() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm]);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get('/api/admin/companies/pending', {
        params: { page: currentPage, limit: 10, search: searchTerm }
      });
      setCompanies(data.companies);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (companyId) => {
    try {
      const { data } = await axios.get(`/api/admin/company/${companyId}`);
      setSelectedCompany(data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load details');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this company?')) return;
    
    setProcessingId(id);
    try {
      await axios.patch(`/api/admin/company/${id}/approve`);
      toast.success('Company approved successfully');
      fetchCompanies();
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

    setProcessingId(selectedCompany.company._id);
    try {
      await axios.patch(`/api/admin/company/${selectedCompany.company._id}/reject`, {
        reason: rejectReason
      });
      toast.success('Company rejected');
      fetchCompanies();
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
        <h1 className="text-2xl font-bold">Company Approvals</h1>
        <p className="text-gray-600">{companies.length} pending approvals</p>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by company name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="card text-center py-12">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">All companies reviewed!</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Company Name</th>
                <th className="text-left py-3 px-4">Industry</th>
                <th className="text-left py-3 px-4">Registered On</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{company.companyName}</div>
                      <div className="text-sm text-gray-600">{company.userId.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{company.industry || 'Not specified'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {format(new Date(company.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge bg-orange-100 text-orange-700">
                      {company.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewDetails(company._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(company._id)}
                        disabled={processingId === company._id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          viewDetails(company._id);
                          setShowRejectModal(true);
                        }}
                        disabled={processingId === company._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Company Details Modal */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Company Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Company Name</label>
                    <p className="font-medium">{selectedCompany.company.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Industry</label>
                    <p className="font-medium">{selectedCompany.company.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Location</label>
                    <p className="font-medium">{selectedCompany.company.location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Website</label>
                    {selectedCompany.company.website ? (
                      <a
                        href={selectedCompany.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        Visit <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <p className="font-medium">N/A</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Description</label>
                  <p className="mt-1">{selectedCompany.company.description}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Contact Email</label>
                  <p className="font-medium">{selectedCompany.company.userId.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Registered On</label>
                  <p className="font-medium">
                    {format(new Date(selectedCompany.company.createdAt), 'MMMM dd, yyyy HH:mm')}
                  </p>
                </div>

                {/* Approval History */}
                {selectedCompany.approvalHistory.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Approval History</label>
                    <div className="space-y-2">
                      {selectedCompany.approvalHistory.map((log, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
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

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="btn-secondary text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedCompany.company._id)}
                    disabled={processingId}
                    className="btn-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {processingId ? 'Processing...' : 'Approve Company'}
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
            <h3 className="text-lg font-semibold mb-4">Reject Company</h3>
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
