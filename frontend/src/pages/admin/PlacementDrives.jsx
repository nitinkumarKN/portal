import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    participatingCompanies: [],
    eligibilityCriteria: {
      minCGPA: '',
      branches: [],
      backlogs: 0
    }
  });

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, []);

  const fetchDrives = async () => {
    try {
      const { data } = await axios.get('/api/placement-drives');
      setDrives(data);
    } catch (error) {
      toast.error('Failed to load placement drives');
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get('/api/admin/companies/approved');
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDrive) {
        await axios.put(`/api/placement-drives/${editingDrive._id}`, formData);
        toast.success('Placement drive updated');
      } else {
        await axios.post('/api/placement-drives', formData);
        toast.success('Placement drive created');
      }
      setShowModal(false);
      setEditingDrive(null);
      resetForm();
      fetchDrives();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this placement drive?')) return;
    try {
      await axios.delete(`/api/placement-drives/${id}`);
      toast.success('Drive deleted');
      fetchDrives();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      participatingCompanies: [],
      eligibilityCriteria: {
        minCGPA: '',
        branches: [],
        backlogs: 0
      }
    });
  };

  const openEditModal = (drive) => {
    setEditingDrive(drive);
    setFormData({
      title: drive.title,
      description: drive.description,
      startDate: drive.startDate.split('T')[0],
      endDate: drive.endDate.split('T')[0],
      participatingCompanies: drive.participatingCompanies.map(c => c._id),
      eligibilityCriteria: drive.eligibilityCriteria
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing': return 'bg-green-100 text-green-700';
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-gray-100 text-gray-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Placement Drives</h1>
        <button
          onClick={() => { setShowModal(true); resetForm(); }}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Drive
        </button>
      </div>

      <div className="grid gap-6">
        {drives.map((drive) => (
          <div key={drive._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{drive.title}</h2>
                <p className="text-gray-600 mt-1">{drive.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`badge ${getStatusColor(drive.status)}`}>
                  {drive.status}
                </span>
                <button
                  onClick={() => openEditModal(drive)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(drive._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(drive.startDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(drive.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Min CGPA</p>
                <p className="font-medium">{drive.eligibilityCriteria.minCGPA || 'N/A'}</p>
              </div>
            </div>

            {drive.participatingCompanies.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Participating Companies</p>
                <div className="flex flex-wrap gap-2">
                  {drive.participatingCompanies.map((company) => (
                    <span key={company._id} className="badge bg-purple-100 text-purple-700">
                      {company.companyName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingDrive ? 'Edit' : 'Create'} Placement Drive
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingDrive(null); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingDrive ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
