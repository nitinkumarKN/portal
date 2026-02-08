import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Building, Briefcase, TrendingUp, Award, XCircle, AlertCircle, CheckSquare } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [approvalStats, setApprovalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchApprovalStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/dashboard');
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/approval-stats');
      setApprovalStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !stats) return <div>Loading...</div>;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of placement statistics and pending approvals</p>
      </div>

      {/* Pending Approvals Alert with Action Buttons */}
      {approvalStats && (approvalStats.companies.pending > 0 || approvalStats.jobs.pending > 0) && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-orange-900 text-lg mb-2">⚠️ Action Required</h3>
              <p className="text-orange-700 mb-4">
                {approvalStats.companies.pending} companies and {approvalStats.jobs.pending} jobs awaiting your approval
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/admin/approvals"
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-lg flex items-center space-x-2"
                >
                  <CheckSquare className="w-5 h-5" />
                  <span>Approve All Pending Items →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Students"
          value={stats.totalStudents}
          trend={`${stats.placementPercentage}% placed`}
          color="primary"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Placed Students"
          value={stats.placedStudents}
          color="success"
        />
        <StatCard
          icon={<XCircle className="w-6 h-6" />}
          label="Unplaced Students"
          value={stats.unplacedStudents}
          color="warning"
        />
        <StatCard
          icon={<Building className="w-6 h-6" />}
          label="Active Companies"
          value={stats.totalCompanies}
          color="primary"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <StatCard
          icon={<Briefcase className="w-6 h-6" />}
          label="Total Jobs"
          value={stats.totalJobs}
          color="primary"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Total Applications"
          value={stats.totalApplications}
          color="success"
        />
      </div>

      {/* Approval Statistics */}
      {approvalStats && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Company Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Approval</span>
                <span className="badge bg-orange-100 text-orange-700">
                  {approvalStats.companies.pending}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Approved</span>
                <span className="badge bg-green-100 text-green-700">
                  {approvalStats.companies.approved}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected</span>
                <span className="badge bg-red-100 text-red-700">
                  {approvalStats.companies.rejected}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Job Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Approval</span>
                <span className="badge bg-orange-100 text-orange-700">
                  {approvalStats.jobs.pending}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Approved</span>
                <span className="badge bg-green-100 text-green-700">
                  {approvalStats.jobs.approved}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected</span>
                <span className="badge bg-red-100 text-red-700">
                  {approvalStats.jobs.rejected}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Branch-wise Placement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.branchWisePlacement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#6366f1" name="Total Students" />
              <Bar dataKey="placed" fill="#10b981" name="Placed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Application Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.applicationsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="_id"
              >
                {stats.applicationsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      {approvalStats && approvalStats.recentApprovals.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Approval Activity</h2>
          <div className="space-y-3">
            {approvalStats.recentApprovals.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.action === 'Approved' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.performedBy?.name || 'Admin'}</span>
                    {' '}<span className={log.action === 'Approved' ? 'text-green-600' : 'text-red-600'}>
                      {log.action.toLowerCase()}
                    </span>
                    {' '}a {log.entityType.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Placement Summary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-700 mb-2">{stats.placementPercentage}%</div>
            <div className="text-green-600">Overall Placement Rate</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-700 mb-2">{stats.totalCompanies}</div>
            <div className="text-blue-600">Partner Companies</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-700 mb-2">{stats.totalJobs}</div>
            <div className="text-purple-600">Job Opportunities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
