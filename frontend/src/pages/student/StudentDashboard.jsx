import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LayoutDashboard, Briefcase, Send, User, FileText } from 'lucide-react';
import Overview from './Overview';
import Jobs from './Jobs';
import Applications from './Applications';
import Profile from './Profile';

export default function StudentDashboard() {
  const navigation = [
    { path: '/student', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/student/jobs', label: 'Browse Jobs', icon: <Briefcase className="w-5 h-5" /> },
    { path: '/student/applications', label: 'My Applications', icon: <Send className="w-5 h-5" /> },
    { path: '/student/profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <Layout navigation={navigation}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}
