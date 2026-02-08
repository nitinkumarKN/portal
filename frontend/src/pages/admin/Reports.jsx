import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Download, FileText, TrendingUp } from 'lucide-react';

export default function Reports() {
  const [placementReport, setPlacementReport] = useState([]);
  const [companyReport, setCompanyReport] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    branch: ''
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const [placementRes, companyRes] = await Promise.all([
        axios.get('/api/admin/reports/placement', { params: filters }),
        axios.get('/api/admin/reports/company-wise')
      ]);
      setPlacementReport(placementRes.data);
      setCompanyReport(companyRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await axios.get('/api/admin/reports/placement', {
        params: { ...filters, format: 'csv' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'placement-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Placement Reports</h1>
        <button onClick={downloadCSV} className="btn-primary flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              className="input"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              className="input"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
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
          </div>
        </div>
      </div>

      {/* Company-wise Report */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Company-wise Hiring Statistics
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Company</th>
                <th className="text-left py-3 px-4">Total Hired</th>
                <th className="text-left py-3 px-4">Avg Package (LPA)</th>
                <th className="text-left py-3 px-4">Max Package (LPA)</th>
              </tr>
            </thead>
            <tbody>
              {companyReport.map((company, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{company.companyName}</td>
                  <td className="py-3 px-4">{company.totalHired}</td>
                  <td className="py-3 px-4">₹{company.avgPackage.toFixed(2)}</td>
                  <td className="py-3 px-4">₹{company.maxPackage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Placement Report */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Student Placement Details
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Roll No</th>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-left py-3 px-4">CGPA</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Company</th>
              </tr>
            </thead>
            <tbody>
              {placementReport.slice(0, 50).map((student, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.rollNo}</td>
                  <td className="py-3 px-4">{student.branch}</td>
                  <td className="py-3 px-4">{student.cgpa}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${student.placed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {student.placed ? 'Placed' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{student.placedCompany || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
