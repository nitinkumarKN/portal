import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Send, Briefcase, MapPin, IndianRupee, Calendar, 
  Award, FileText, ChevronRight, ChevronLeft, X, AlertCircle 
} from 'lucide-react';

export default function EditJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [originalRejectionReason, setOriginalRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    // Basic Details
    title: '',
    description: '',
    role: '',
    employmentType: 'Full-time',
    jobMode: 'On-site',
    numberOfOpenings: 1,
    
    // Location
    location: {
      city: '',
      state: '',
      country: 'India'
    },
    
    // Compensation
    package: '',
    stipend: {
      amount: '',
      currency: 'INR'
    },
    bond: {
      required: false,
      duration: '',
      details: ''
    },
    
    // Eligibility
    eligibility: {
      minCGPA: '',
      branches: [],
      graduationYears: [],
      maxBacklogs: 0
    },
    requiredSkills: [],
    preferredSkills: [],
    
    // Application Settings
    deadline: '',
    selectionProcess: [],
    status: 'Pending Approval'
  });

  const [errors, setErrors] = useState({});

  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL'];
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const steps = [
    { id: 1, name: 'Basic Details', icon: <Briefcase className="w-5 h-5" /> },
    { id: 2, name: 'Compensation', icon: <IndianRupee className="w-5 h-5" /> },
    { id: 3, name: 'Eligibility', icon: <Award className="w-5 h-5" /> },
    { id: 4, name: 'Application', icon: <Calendar className="w-5 h-5" /> }
  ];

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setFetchingJob(true);
      const { data } = await axios.get('/api/company/jobs');
      const job = data.find(j => j._id === id);

      if (!job) {
        toast.error('Job not found');
        navigate('/company/jobs');
        return;
      }

      // Only allow editing rejected jobs
      if (job.approvalStatus !== 'Rejected') {
        toast.error('You can only edit rejected jobs');
        navigate('/company/jobs');
        return;
      }

      // Store original rejection reason to display
      setOriginalRejectionReason(job.rejectedReason);

      // Populate form with job data
      setFormData({
        title: job.title || '',
        description: job.description || '',
        role: job.role || '',
        employmentType: job.employmentType || 'Full-time',
        jobMode: job.jobMode || 'On-site',
        numberOfOpenings: job.numberOfOpenings || 1,
        location: {
          city: job.location?.city || '',
          state: job.location?.state || '',
          country: job.location?.country || 'India'
        },
        package: job.package || '',
        stipend: {
          amount: job.stipend?.amount || '',
          currency: job.stipend?.currency || 'INR'
        },
        bond: {
          required: job.bond?.required || false,
          duration: job.bond?.duration || '',
          details: job.bond?.details || ''
        },
        eligibility: {
          minCGPA: job.eligibility?.minCGPA || '',
          branches: job.eligibility?.branches || [],
          graduationYears: job.eligibility?.graduationYears || [],
          maxBacklogs: job.eligibility?.maxBacklogs || 0
        },
        requiredSkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : '',
        selectionProcess: job.selectionProcess || [],
        status: 'Pending Approval'
      });
    } catch (error) {
      console.error('Failed to fetch job:', error);
      toast.error('Failed to load job details');
      navigate('/company/jobs');
    } finally {
      setFetchingJob(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.role.trim()) newErrors.role = 'Job role is required';
      if (formData.numberOfOpenings < 1) newErrors.numberOfOpenings = 'Must be at least 1';
    }

    if (step === 2) {
      if (!formData.package || formData.package <= 0) {
        newErrors.package = 'Package must be a positive number';
      }
      if (formData.employmentType === 'Internship' && !formData.stipend.amount) {
        newErrors.stipend = 'Stipend is required for internships';
      }
    }

    if (step === 3) {
      if (!formData.eligibility.minCGPA || formData.eligibility.minCGPA < 0 || formData.eligibility.minCGPA > 10) {
        newErrors.minCGPA = 'CGPA must be between 0 and 10';
      }
      if (formData.eligibility.branches.length === 0) {
        newErrors.branches = 'Select at least one branch';
      }
      if (formData.requiredSkills.length === 0) {
        newErrors.requiredSkills = 'Add at least one required skill';
      }
    }

    if (step === 4) {
      if (!formData.deadline) {
        newErrors.deadline = 'Deadline is required';
      } else if (new Date(formData.deadline) <= new Date()) {
        newErrors.deadline = 'Deadline must be a future date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleBranchToggle = (branch) => {
    const branches = formData.eligibility.branches.includes(branch)
      ? formData.eligibility.branches.filter(b => b !== branch)
      : [...formData.eligibility.branches, branch];
    
    setFormData({
      ...formData,
      eligibility: { ...formData.eligibility, branches }
    });
  };

  const handleYearToggle = (year) => {
    const years = formData.eligibility.graduationYears.includes(year)
      ? formData.eligibility.graduationYears.filter(y => y !== year)
      : [...formData.eligibility.graduationYears, year];
    
    setFormData({
      ...formData,
      eligibility: { ...formData.eligibility, graduationYears: years }
    });
  };

  const addSkill = (type) => {
    const input = type === 'required' ? skillInput : preferredSkillInput;
    const skillsArray = type === 'required' ? formData.requiredSkills : formData.preferredSkills;

    if (input.trim() && !skillsArray.includes(input.trim())) {
      setFormData({
        ...formData,
        [type === 'required' ? 'requiredSkills' : 'preferredSkills']: [...skillsArray, input.trim()]
      });
      
      if (type === 'required') {
        setSkillInput('');
      } else {
        setPreferredSkillInput('');
      }
    }
  };

  const removeSkill = (skill, type) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter(s => s !== skill)
    });
  };

  const addSelectionStage = () => {
    setFormData({
      ...formData,
      selectionProcess: [
        ...formData.selectionProcess,
        { stage: '', description: '', duration: '' }
      ]
    });
  };

  const updateSelectionStage = (index, field, value) => {
    const updated = [...formData.selectionProcess];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, selectionProcess: updated });
  };

  const removeSelectionStage = (index) => {
    setFormData({
      ...formData,
      selectionProcess: formData.selectionProcess.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        status: 'Pending Approval'
      };

      await axios.put(`/api/company/job/${id}`, submissionData);
      
      toast.success('Job resubmitted for approval!');
      navigate('/company/jobs');
    } catch (error) {
      console.error('Job update error:', error.response);
      const errorMessage = error.response?.data?.message || 'Failed to update job';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit & Resubmit Job</h1>
        <p className="text-gray-600">Update job details and resubmit for admin approval</p>
      </div>

      {/* Rejection Notice */}
      {originalRejectionReason && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                Previous Rejection Reason
              </p>
              <p className="text-sm text-amber-700">
                {originalRejectionReason}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Please address the above issues before resubmitting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  >
                    Step {step.id}
                  </p>
                  <p
                    className={`text-xs ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="card">
        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Briefcase className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-semibold">Basic Job Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Software Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role / Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.role ? 'border-red-500' : ''}`}
                placeholder="e.g., Full Stack Developer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                className={`input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Minimum 100 characters recommended
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="input"
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="PPO">PPO (Pre-Placement Offer)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Mode <span className="text-red-500">*</span>
                </label>
                <select
                  className="input"
                  value={formData.jobMode}
                  onChange={(e) => setFormData({ ...formData, jobMode: e.target.value })}
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Openings <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`input ${errors.numberOfOpenings ? 'border-red-500' : ''}`}
                  value={formData.numberOfOpenings}
                  onChange={(e) => setFormData({ ...formData, numberOfOpenings: parseInt(e.target.value) })}
                />
                {errors.numberOfOpenings && <p className="text-red-500 text-sm mt-1">{errors.numberOfOpenings}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (City)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Bangalore"
                  value={formData.location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Compensation */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <IndianRupee className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-semibold">Compensation Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package / CTC (in LPA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                className={`input ${errors.package ? 'border-red-500' : ''}`}
                placeholder="e.g., 10.5"
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: parseFloat(e.target.value) })}
              />
              {errors.package && <p className="text-red-500 text-sm mt-1">{errors.package}</p>}
            </div>

            {formData.employmentType === 'Internship' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Stipend (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`input ${errors.stipend ? 'border-red-500' : ''}`}
                  placeholder="e.g., 25000"
                  value={formData.stipend.amount}
                  onChange={(e) => setFormData({
                    ...formData,
                    stipend: { ...formData.stipend, amount: parseInt(e.target.value) }
                  })}
                />
                {errors.stipend && <p className="text-red-500 text-sm mt-1">{errors.stipend}</p>}
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="bondRequired"
                  checked={formData.bond.required}
                  onChange={(e) => setFormData({
                    ...formData,
                    bond: { ...formData.bond, required: e.target.checked }
                  })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="bondRequired" className="ml-2 text-sm font-medium text-gray-700">
                  This job has a service bond
                </label>
              </div>

              {formData.bond.required && (
                <div className="grid md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bond Duration
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 2 years"
                      value={formData.bond.duration}
                      onChange={(e) => setFormData({
                        ...formData,
                        bond: { ...formData.bond, duration: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bond Details
                    </label>
                    <textarea
                      rows={2}
                      className="input"
                      placeholder="Terms and conditions..."
                      value={formData.bond.details}
                      onChange={(e) => setFormData({
                        ...formData,
                        bond: { ...formData.bond, details: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Eligibility */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-semibold">Eligibility Criteria</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum CGPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className={`input ${errors.minCGPA ? 'border-red-500' : ''}`}
                  placeholder="e.g., 7.0"
                  value={formData.eligibility.minCGPA}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibility: { ...formData.eligibility, minCGPA: parseFloat(e.target.value) }
                  })}
                />
                {errors.minCGPA && <p className="text-red-500 text-sm mt-1">{errors.minCGPA}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Backlogs Allowed
                </label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={formData.eligibility.maxBacklogs}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibility: { ...formData.eligibility, maxBacklogs: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Eligible Branches <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {branches.map((branch) => (
                  <label key={branch} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.eligibility.branches.includes(branch)}
                      onChange={() => handleBranchToggle(branch)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{branch}</span>
                  </label>
                ))}
              </div>
              {errors.branches && <p className="text-red-500 text-sm mt-2">{errors.branches}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Graduation Year / Batch
              </label>
              <div className="flex flex-wrap gap-2">
                {graduationYears.map((year) => (
                  <label
                    key={year}
                    className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.eligibility.graduationYears.includes(year)
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.eligibility.graduationYears.includes(year)}
                      onChange={() => handleYearToggle(year)}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{year}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Leave empty to allow all years</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="e.g., React, Node.js, Python"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                />
                <button
                  type="button"
                  onClick={() => addSkill('required')}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="badge bg-indigo-100 text-indigo-700 flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill, 'requiredSkills')}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.requiredSkills && (
                <p className="text-red-500 text-sm mt-2">{errors.requiredSkills}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Skills (Optional)
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Good to have skills"
                  value={preferredSkillInput}
                  onChange={(e) => setPreferredSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('preferred'))}
                />
                <button
                  type="button"
                  onClick={() => addSkill('preferred')}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.preferredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="badge bg-purple-100 text-purple-700 flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill, 'preferredSkills')}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Application Settings */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-semibold">Application Settings</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className={`input ${errors.deadline ? 'border-red-500' : ''}`}
                min={new Date().toISOString().slice(0, 16)}
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
              {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Selection Process (Optional)
                </label>
                <button
                  type="button"
                  onClick={addSelectionStage}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Stage
                </button>
              </div>

              {formData.selectionProcess.map((stage, index) => (
                <div key={index} className="border rounded-lg p-4 mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Stage {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectionStage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <select
                        className="input"
                        value={stage.stage}
                        onChange={(e) => updateSelectionStage(index, 'stage', e.target.value)}
                      >
                        <option value="">Select Stage</option>
                        <option value="Aptitude Test">Aptitude Test</option>
                        <option value="Technical Round">Technical Round</option>
                        <option value="HR Round">HR Round</option>
                        <option value="Group Discussion">Group Discussion</option>
                        <option value="Case Study">Case Study</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        className="input"
                        placeholder="Duration (e.g., 60 mins)"
                        value={stage.duration}
                        onChange={(e) => updateSelectionStage(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <textarea
                      rows={2}
                      className="input"
                      placeholder="Description of this stage..."
                      value={stage.description}
                      onChange={(e) => updateSelectionStage(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {formData.selectionProcess.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed rounded-lg">
                  No selection stages added. Click "Add Stage" to define your recruitment process.
                </p>
              )}
            </div>

            {/* Summary Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Job Title</p>
                  <p className="font-medium">{formData.title || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Package</p>
                  <p className="font-medium">₹{formData.package || 0} LPA</p>
                </div>
                <div>
                  <p className="text-gray-600">Employment Type</p>
                  <p className="font-medium">{formData.employmentType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Min CGPA</p>
                  <p className="font-medium">{formData.eligibility.minCGPA || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Eligible Branches</p>
                  <p className="font-medium">
                    {formData.eligibility.branches.join(', ') || 'None selected'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Required Skills</p>
                  <p className="font-medium">
                    {formData.requiredSkills.join(', ') || 'None added'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`btn-secondary flex items-center ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Resubmitting...' : 'Resubmit for Approval'}
            </button>
          )}
        </div>
      </div>

      {/* Help Card */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Resubmission Notes</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Review the rejection reason and make necessary changes</li>
              <li>All modified jobs will be sent back to admin for approval</li>
              <li>Students will see the job only after admin approves it</li>
              <li>Application deadline must be a future date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
