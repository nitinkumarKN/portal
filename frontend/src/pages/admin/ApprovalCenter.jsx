import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building, Briefcase, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApprovalCenter() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/approval-stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load approval stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approval Center</h1>
        <p className="text-gray-600">Manage all pending approvals and review requests</p>
      </div>

      {/* Alert for Pending Items */}
      {(stats.companies.pending > 0 || stats.jobs.pending > 0) && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Action Required: {stats.companies.pending + stats.jobs.pending} Items Pending
              </h3>
              <p className="text-orange-700 mb-4">
                You have {stats.companies.pending} companies and {stats.jobs.pending} jobs waiting for your review
              </p>
              <div className="flex flex-wrap gap-3">
                {stats.companies.pending > 0 && (
                  <Link
                    to="/admin/approvals/companies"
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Review {stats.companies.pending} {stats.companies.pending === 1 ? 'Company' : 'Companies'}
                  </Link>
                )}
                {stats.jobs.pending > 0 && (
                  <Link
                    to="/admin/approvals/jobs"
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Review {stats.jobs.pending} {stats.jobs.pending === 1 ? 'Job' : 'Jobs'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Approvals Card */}
        <Link to="/admin/approvals/companies" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Company Approvals</h3>
                <p className="text-sm text-gray-600">Manage company registrations</p>
              </div>
            </div>
            {stats.companies.pending > 0 && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                {stats.companies.pending} Pending
              </span>
            )}
          </div>

          <div className="space-y-3 mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-semibold">{stats.companies.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Approved</span>
              </div>
              <span className="font-semibold">{stats.companies.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Rejected</span>
              </div>
              <span className="font-semibold">{stats.companies.rejected}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-primary-600 font-medium">
              Click to review pending companies →
            </div>
          </div>
        </Link>

        {/* Job Approvals Card */}
        <Link to="/admin/approvals/jobs" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Job Approvals</h3>
                <p className="text-sm text-gray-600">Review job postings</p>
              </div>
            </div>
            {stats.jobs.pending > 0 && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                {stats.jobs.pending} Pending
              </span>
            )}
          </div>

          <div className="space-y-3 mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-semibold">{stats.jobs.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Approved</span>
              </div>
              <span className="font-semibold">{stats.jobs.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Rejected</span>
              </div>
              <span className="font-semibold">{stats.jobs.rejected}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-primary-600 font-medium">
              Click to review pending jobs →
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      {stats.recentApprovals && stats.recentApprovals.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Approval Activity</h2>
          <div className="space-y-3">
            {stats.recentApprovals.slice(0, 10).map((log, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  log.action === 'Approved' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.performedBy?.name || 'Admin'}</span>
                    {' '}<span className={log.action === 'Approved' ? 'text-green-600' : 'text-red-600'}>
                      {log.action.toLowerCase()}
                    </span>
                    {' '}a {log.entityType.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/companies" className="card hover:shadow-lg transition-shadow text-center">
          <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">All Companies</h3>
          <p className="text-sm text-gray-600">View all registered companies</p>
        </Link>

        <Link to="/admin/students" className="card hover:shadow-lg transition-shadow text-center">
          <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Students</h3>
          <p className="text-sm text-gray-600">Manage student accounts</p>
        </Link>

        <Link to="/admin/reports" className="card hover:shadow-lg transition-shadow text-center">
          <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Reports</h3>
          <p className="text-sm text-gray-600">Generate placement reports</p>
        </Link>
      </div>
    </div>
  );
}
