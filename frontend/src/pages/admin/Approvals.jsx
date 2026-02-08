import { useState } from 'react';
import { Building, Briefcase } from 'lucide-react';
import CompanyApprovals from './CompanyApprovals';
import JobApprovals from './JobApprovals';

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('companies');

  const tabs = [
    { id: 'companies', label: 'Company Approvals', icon: <Building className="w-5 h-5" /> },
    { id: 'jobs', label: 'Job Approvals', icon: <Briefcase className="w-5 h-5" /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approval Management</h1>
        <p className="text-gray-600">Review and approve company registrations and job postings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'companies' && <CompanyApprovals />}
        {activeTab === 'jobs' && <JobApprovals />}
      </div>
    </div>
  );
}
