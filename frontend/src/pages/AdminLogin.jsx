import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, Briefcase } from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      
      // Verify admin role
      if (data.role !== 'admin') {
        toast.error('Unauthorized: Admin access only');
        return;
      }
      
      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-sm sm:text-base text-indigo-200">Placement Officer Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 text-xs sm:text-sm">Enter your admin credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="admin@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center space-x-2">
              <span>Student/Company Login</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-indigo-200 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
