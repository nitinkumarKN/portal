import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const role = params.get('role');
    const name = params.get('name');
    const email = params.get('email');
    const error = params.get('error');

    if (error) {
      // Handle error - redirect to login with error message
      console.error('Authentication error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token && userId && role) {
      // Store user data
      const userData = {
        _id: userId,
        name: decodeURIComponent(name || ''),
        email: decodeURIComponent(email || ''),
        role,
        token
      };

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect based on role
      switch (role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'company':
          navigate('/company/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/login');
      }
    } else {
      // Missing required parameters
      navigate('/login?error=missing_parameters');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
