import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, FileCheck, Award, Shield, Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: 'Smart Job Matching',
      description: 'AI-powered job recommendations based on your skills and CGPA'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Direct Company Connect',
      description: 'Connect directly with top recruiters and HR teams'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Real-time Analytics',
      description: 'Track your placement journey with detailed insights'
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: 'Easy Application',
      description: 'One-click apply with automatic eligibility checks'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Success Tracking',
      description: 'Monitor application status from applied to placed'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Verified',
      description: 'All companies verified by placement officers'
    }
  ];

  const topCompanies = [
    { name: 'Google', url: 'https://careers.google.com' },
    { name: 'Microsoft', url: 'https://careers.microsoft.com' },
    { name: 'Amazon', url: 'https://www.amazon.jobs' },
    { name: 'TCS', url: 'https://www.tcs.com/careers' },
    { name: 'Infosys', url: 'https://www.infosys.com/careers' },
    { name: 'Wipro', url: 'https://careers.wipro.com' }
  ];

  const resources = [
    { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs' },
    { name: 'Indeed', url: 'https://www.indeed.com' },
    { name: 'Naukri', url: 'https://www.naukri.com' },
    { name: 'AngelList', url: 'https://angel.co/jobs' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Smart Placement Portal</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/admin-login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simplifying Campus Placements
            <span className="block text-primary-600 mt-2">with Smart Automation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect students with opportunities, streamline recruitment, and track placement success—all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=student" className="btn-primary px-8 py-3 text-lg">
              Student Portal
            </Link>
            <Link to="/register?role=company" className="btn-secondary px-8 py-3 text-lg">
              Company Register
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="text-primary-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Top Hiring Companies</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {topCompanies.map((company, index) => (
            <a
              key={index}
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card text-center hover:shadow-lg transition-all hover:scale-105"
            >
              <p className="font-semibold text-gray-900">{company.name}</p>
              <p className="text-xs text-gray-500 mt-1">View Careers →</p>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-primary-100">Students Placed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-primary-100">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-primary-100">Placement Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Resources Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Job Search Resources</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-all hover:scale-105"
            >
              <h3 className="font-semibold text-lg mb-2">{resource.name}</h3>
              <p className="text-sm text-gray-600">Explore jobs →</p>
            </a>
          ))}
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-6 h-6" />
                <span className="font-bold text-white">Smart Placement Portal</span>
              </div>
              <p className="text-sm">Empowering students and companies to connect seamlessly.</p>
              <div className="flex space-x-4 mt-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#companies" className="hover:text-white">Companies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.linkedin.com/jobs" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn Jobs</a></li>
                <li><a href="https://www.indeed.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Indeed</a></li>
                <li><a href="https://www.naukri.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Naukri</a></li>
                <li><a href="https://angel.co/jobs" target="_blank" rel="noopener noreferrer" className="hover:text-white">AngelList</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:placement@college.edu" className="hover:text-white">placement@college.edu</a>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+911234567890" className="hover:text-white">+91 1234567890</a>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>College Campus, City</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2024 Smart Placement Portal. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
