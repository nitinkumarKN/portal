import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, Calendar, IndianRupee, Send, TrendingUp, Award, Filter, Search, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    minPackage: '',
    jobType: '',
    sortBy: 'match' // match, package, deadline
  });
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableFrom: '',
    referenceEmail: '',
    agreeToTerms: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  const fetchJobs = async () => {
    try {
      console.log('🔍 Fetching jobs...');
      const { data } = await axios.get('/api/student/jobs');
      console.log('📊 Jobs received:', data.length);
      console.log('Jobs data:', data);
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.companyId.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Package filter
    if (filters.minPackage) {
      filtered = filtered.filter(job => job.package >= parseFloat(filters.minPackage));
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter(job => job.jobType === filters.jobType);
    }

    // Sorting
    if (filters.sortBy === 'match') {
      filtered.sort((a, b) => (b.matchScore?.overall || 0) - (a.matchScore?.overall || 0));
    } else if (filters.sortBy === 'package') {
      filtered.sort((a, b) => b.package - a.package);
    } else if (filters.sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId) => {
    try {
      await axios.post(`/api/student/apply/${jobId}`);
      toast.success('Application submitted successfully');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed');
    }
  };

  const openApplicationForm = (job) => {
    setSelectedJob(job);
    setApplicationData({
      coverLetter: '',
      expectedSalary: job.package || '',
      availableFrom: '',
      referenceEmail: '',
      agreeToTerms: false
    });
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!applicationData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (applicationData.coverLetter.length < 50) {
      toast.error('Cover letter must be at least 50 characters');
      return;
    }

    if (!applicationData.availableFrom) {
      toast.error('Please select when you can join');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting application:', {
        jobId: selectedJob._id,
        data: applicationData
      });

      const response = await axios.post(`/api/student/apply/${selectedJob._id}`, applicationData);
      
      console.log('Application response:', response.data);
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      setSelectedJob(null);
      setApplicationData({
        coverLetter: '',
        expectedSalary: '',
        availableFrom: '',
        referenceEmail: '',
        agreeToTerms: false
      });
      fetchJobs();
    } catch (error) {
      console.error('Application error:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Application failed';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Job Recommendations</h1>
          <p className="text-gray-600">Jobs matched based on your skills and CGPA</p>
        </div>
        <div className="text-sm text-gray-600">{filteredJobs.length} jobs available</div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              className="input"
              placeholder="Search by title, company, or skills..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Package (LPA)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g., 5"
              value={filters.minPackage}
              onChange={(e) => setFilters({ ...filters, minPackage: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
            <select
              className="input"
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              className="input w-auto"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="match">Best Match</option>
              <option value="package">Highest Package</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ search: '', minPackage: '', jobType: '', sortBy: 'match' })}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div key={job._id} className="card hover:shadow-lg transition-shadow border-l-4 border-primary-500">
              {/* Match Score Banner */}
              {job.matchScore && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Match Score:</span>
                    <span className={`badge ${getMatchColor(job.matchScore.overall)}`}>
                      {job.matchScore.overall}%
                    </span>
                  </div>
                  <div className="flex space-x-2 text-xs">
                    <span className="badge bg-blue-50 text-blue-700">
                      Skills: {job.matchScore.skillMatch}%
                    </span>
                    <span className="badge bg-green-50 text-green-700">
                      CGPA: {job.matchScore.cgpaScore}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-gray-600">{job.companyId.companyName}</p>
                  {job.companyId.industry && (
                    <span className="text-sm text-gray-500">• {job.companyId.industry}</span>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="badge bg-green-100 text-green-700">{job.jobType}</span>
                  {job.jobMode && (
                    <span className="badge bg-purple-100 text-purple-700">{job.jobMode}</span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{job.description}</p>

              {/* Required Skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="badge bg-indigo-100 text-indigo-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {job.matchScore && job.matchScore.matchedSkills > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ You have {job.matchScore.matchedSkills} matching skill(s)
                    </p>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  <span>₹{job.package.toLocaleString()} LPA</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{job.location?.city || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Deadline: {format(new Date(job.deadline), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{job.jobMode}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Eligibility</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-blue-100 text-blue-700">
                    Min CGPA: {job.eligibility.minCGPA}
                  </span>
                  {job.eligibility.branches.map((branch) => (
                    <span key={branch} className="badge bg-purple-100 text-purple-700">
                      {branch}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => openApplicationForm(job)} 
                className="btn-primary"
              >
                <Send className="w-4 h-4 mr-2" />
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Job Application</h2>
                  <p className="text-gray-600 mt-1">{selectedJob.title}</p>
                  <p className="text-sm text-gray-500">{selectedJob.companyId?.companyName}</p>
                </div>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Application Form */}
              <form onSubmit={handleSubmitApplication} className="space-y-5">
                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter / Why should we hire you? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    minLength={50}
                    className="input resize-none"
                    placeholder="Explain why you're a perfect fit for this role... (minimum 50 characters)"
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  />
                  <p className={`text-xs mt-1 ${
                    applicationData.coverLetter.length >= 50 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {applicationData.coverLetter.length} / 50 characters minimum
                  </p>
                </div>

                {/* Expected Salary & Join Date */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Salary (LPA)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="input"
                      placeholder="e.g., 10.5"
                      value={applicationData.expectedSalary}
                      onChange={(e) => setApplicationData({ ...applicationData, expectedSalary: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available to Join From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="input"
                      value={applicationData.availableFrom}
                      onChange={(e) => setApplicationData({ ...applicationData, availableFrom: e.target.value })}
                    />
                  </div>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Email (Optional)
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="professor@college.edu"
                    value={applicationData.referenceEmail}
                    onChange={(e) => setApplicationData({ ...applicationData, referenceEmail: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a reference who can vouch for your skills
                  </p>
                </div>

                {/* Job Details Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                    Job Details Summary
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium text-gray-900">₹{selectedJob.package} LPA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">{selectedJob.employmentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-medium text-gray-900">{selectedJob.jobMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">
                        {selectedJob.location?.city || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      required
                      checked={applicationData.agreeToTerms}
                      onChange={(e) => setApplicationData({ ...applicationData, agreeToTerms: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-1 flex-shrink-0"
                    />
                    <label htmlFor="agreeTerms" className="text-sm text-gray-700 flex-1">
                      <span className="font-medium text-gray-900">I agree to the terms and conditions <span className="text-red-500">*</span></span>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                        <li>All information provided is accurate and true</li>
                        <li>I am eligible for this position as per the criteria</li>
                        <li>I understand this is a formal job application</li>
                        <li>I authorize the company to verify my credentials</li>
                      </ul>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !applicationData.agreeToTerms || applicationData.coverLetter.length < 50}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
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
