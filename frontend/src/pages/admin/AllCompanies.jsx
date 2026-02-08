import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, ExternalLink, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AllCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, approved, pending, rejected
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get('/api/admin/companies/all');
      setCompanies(data);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanyStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/admin/company/${id}/toggle-status`);
      toast.success(`Company ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleApprove = async (company) => {
    if (!window.confirm(`Approve ${company.companyName}?`)) return;
    
    setProcessingId(company._id);
    try {
      await axios.patch(`/api/admin/company/${company._id}/approve`);
      toast.success(`${company.companyName} approved successfully!`);
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (company) => {
    setRejectTarget(company);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      toast.error('Please provide a reason (minimum 10 characters)');
      return;
    }

    setProcessingId(rejectTarget._id);
    try {
      await axios.patch(`/api/admin/company/${rejectTarget._id}/reject`, {
        reason: rejectReason
      });
      toast.success(`${rejectTarget.companyName} rejected`);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectTarget(null);
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.userId.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || company.approvalStatus.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-700',
      'Pending': 'bg-orange-100 text-orange-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Blocked': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Companies</h1>
        <p className="text-gray-600">{companies.length} registered companies</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by company name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'approved', 'pending', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Company</th>
              <th className="text-left py-3 px-4">Industry</th>
              <th className="text-left py-3 px-4">Registered</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Active</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">{company.companyName}</div>
                    <div className="text-sm text-gray-600">{company.userId.email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">{company.industry || 'N/A'}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {format(new Date(company.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${getStatusBadge(company.approvalStatus)}`}>
                    {company.approvalStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleCompanyStatus(company._id, company.userId.isActive)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {company.userId.isActive ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                        title="Visit Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    
                    {company.approvalStatus === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(company)}
                          disabled={processingId === company._id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          title="Approve Company"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openRejectModal(company)}
                          disabled={processingId === company._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Reject Company"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No companies found
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && rejectTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Company</h3>
            <p className="text-sm text-gray-600 mb-2">
              Company: <strong>{rejectTarget.companyName}</strong>
            </p>
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
                disabled={processingId || rejectReason.trim().length < 10}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingId ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
