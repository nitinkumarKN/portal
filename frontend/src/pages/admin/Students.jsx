import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Download, ExternalLink } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ branch: '', placed: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, students]);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/admin/students');
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.branch) {
      filtered = filtered.filter(s => s.branch === filters.branch);
    }

    if (filters.placed !== '') {
      filtered = filtered.filter(s => s.placed === (filters.placed === 'true'));
    }

    setFilteredStudents(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Roll No', 'Branch', 'CGPA', 'Phone', 'Email', 'Status', 'Placed Company'];
    const rows = filteredStudents.map(s => [
      s.userId.name,
      s.rollNo,
      s.branch,
      s.cgpa,
      s.phone || 'N/A',
      s.userId.email,
      s.placed ? 'Placed' : 'Active',
      s.placedCompany || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-gray-600">{filteredStudents.length} students</p>
        </div>
        <button onClick={exportToCSV} className="btn-primary flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="card">
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by name or roll number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="input"
              value={filters.placed}
              onChange={(e) => setFilters({ ...filters, placed: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="true">Placed</option>
              <option value="false">Active</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student</th>
                <th className="text-left py-3 px-4">Roll No</th>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-left py-3 px-4">CGPA</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Resume</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{student.userId.name}</div>
                      <div className="text-sm text-gray-600">{student.userId.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{student.rollNo}</td>
                  <td className="py-3 px-4">
                    <span className="badge bg-blue-100 text-blue-700">{student.branch}</span>
                  </td>
                  <td className="py-3 px-4 font-medium">{student.cgpa}</td>
                  <td className="py-3 px-4">{student.phone || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {student.resumeUrl ? (
                      <a
                        href={student.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400">No Resume</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {student.placed ? (
                      <div>
                        <span className="badge bg-green-100 text-green-700">Placed</span>
                        <div className="text-xs text-gray-600 mt-1">{student.placedCompany}</div>
                      </div>
                    ) : (
                      <span className="badge bg-blue-100 text-blue-700">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No students found
          </div>
        )}
      </div>
    </div>
  );
}
