import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Briefcase, User, Building } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';
  
  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    branch: 'CSE',
    cgpa: '',
    phone: '',
    companyName: '',
    description: '',
    industry: '',
    website: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register({ ...formData, role });
      toast.success('Registration successful!');
      navigate(`/${data.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Join the Smart Placement Portal</p>
        </div>

        <div className="card">
          <div className="mb-5 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                  role === 'student'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2" />
                <div className="font-medium text-sm sm:text-base">Student</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('company')}
                className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                  role === 'company'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2" />
                <div className="font-medium text-sm sm:text-base">Company</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {role === 'student' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <select
                      required
                      className="input"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    >
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      className="input"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      pattern="[0-9]{10}"
                      required
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'company' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
