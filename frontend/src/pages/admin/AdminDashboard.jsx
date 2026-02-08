import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LayoutDashboard, CheckSquare, Users, Building, Briefcase, Calendar, FileText } from 'lucide-react';
import Dashboard from './Dashboard';
import Approvals from './Approvals';
import Students from './Students';
import AllCompanies from './AllCompanies';
import PlacementDrives from './PlacementDrives';
import Reports from './Reports';
import ApprovalCenter from './ApprovalCenter';
import CompanyApprovals from './CompanyApprovals';
import JobApprovals from './JobApprovals';
import QuickApprovals from './QuickApprovals';

export default function AdminDashboard() {
  const navigation = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/approvals', label: '⭐ Quick Approvals', icon: <CheckSquare className="w-5 h-5" /> },
    { path: '/admin/students', label: 'Students', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/companies', label: 'Companies', icon: <Building className="w-5 h-5" /> },
    { path: '/admin/drives', label: 'Placement Drives', icon: <Calendar className="w-5 h-5" /> },
    { path: '/admin/reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <Layout navigation={navigation}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/approvals" element={<QuickApprovals />} />
        <Route path="/students" element={<Students />} />
        <Route path="/companies" element={<AllCompanies />} />
        <Route path="/drives" element={<PlacementDrives />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  );
}
