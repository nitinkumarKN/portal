import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, Save } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ skills: [], phone: '', cgpa: '' });
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/student/profile');
      setProfile(data);
      setFormData({
        skills: data.skills || [],
        phone: data.phone || '',
        cgpa: data.cgpa || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/student/profile', formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please select a file');
      return;
    }

    // Validate file type
    if (resumeFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (resumeFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    setLoading(true);
    try {
      const response = await axios.post('/api/student/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Upload response:', response.data);
      toast.success('Resume uploaded successfully');
      fetchProfile();
      setResumeFile(null);
      
      // Clear the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Basic Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input type="text" className="input" value={profile.userId.name} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" className="input" value={profile.userId.email} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
            <input type="text" className="input" value={profile.rollNo} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
            <input type="text" className="input" value={profile.branch} disabled />
          </div>
        </div>
      </div>

      {/* Editable Info */}
      <form onSubmit={handleUpdateProfile} className="card">
        <h2 className="text-lg font-semibold mb-4">Update Profile</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="input"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                pattern="[0-9]{10}"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                className="input flex-1"
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button type="button" onClick={handleAddSkill} className="btn-secondary">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span key={skill} className="badge bg-primary-100 text-primary-700 flex items-center space-x-2">
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-primary-900">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="w-4 h-4 mr-2 inline" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Resume Upload */}
      <form onSubmit={handleResumeUpload} className="card">
        <h2 className="text-lg font-semibold mb-4">Resume</h2>
        {profile.resumeUrl && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 mb-2">Current Resume</p>
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
              View Resume →
            </a>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Resume (PDF only)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          <button type="submit" disabled={!resumeFile || loading} className="btn-primary">
            <Upload className="w-4 h-4 mr-2 inline" />
            {loading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </form>
    </div>
  );
}
