import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LayoutDashboard, Briefcase, Users, Building } from 'lucide-react';
import Overview from './Overview';
import PostJob from './PostJob';
import MyJobs from './MyJobs';
import EditJob from './EditJob';
import Applicants from './Applicants';

export default function CompanyDashboard() {
  const navigation = [
    { path: '/company', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/company/post-job', label: 'Post Job', icon: <Briefcase className="w-5 h-5" /> },
    { path: '/company/jobs', label: 'My Jobs', icon: <Building className="w-5 h-5" /> },
  ];

  return (
    <Layout navigation={navigation}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/jobs" element={<MyJobs />} />
        <Route path="/edit-job/:id" element={<EditJob />} />
        <Route path="/applicants/:jobId" element={<Applicants />} />
      </Routes>
    </Layout>
  );
}
