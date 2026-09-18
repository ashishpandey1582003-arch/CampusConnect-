import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../hooks/useAxios';
import { ArrowLeft, Save, ShieldAlert, FileUp, Check } from 'lucide-react';
import { AVAILABLE_BRANCHES } from '../../utils/branchHelper';

const RecruiterForm = () => {
  const { id } = useParams(); // Exists if we are editing
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState(['CSE', 'IT', 'ECE']);

  // Core Form State
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    jobRole: '',
    jobType: 'Full-time',
    packageCTC: '',
    stipend: '0',
    eligibilityCriteria: '',
    minCGPA: '6.0',
    allowedBranches: 'CSE, IT, ECE',
    allowedPassingYear: '2026',
    skillsRequired: 'Java, SQL',
    selectionProcess: '',
    numRounds: '3',
    interviewMode: 'Offline',
    interviewLocation: '',
    regStartDate: '',
    regEndDate: '',
    driveDate: '',
    resultDate: '',
    website: '',
    hrName: '',
    hrEmail: '',
    hrContact: '',
    // Prep details
    interviewPrep: '',
    prevQuestions: '',
    codingQuestions: '',
    aptitudeTopics: '',
    hrQuestions: '',
    resources: '',
  });

  // Files state
  const [logoFile, setLogoFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchDriveDetails = async () => {
      setFetching(true);
      try {
        const response = await api.get(`/api/recruiters/${id}`);
        if (response.data.success) {
          const d = response.data.data;
          // Format date strings for html input type="date" (YYYY-MM-DD)
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            return new Date(dateStr).toISOString().split('T')[0];
          };

          const prep = d.prepMaterial || {};

          setFormData({
            companyName: d.companyName || '',
            description: d.description || '',
            jobRole: d.jobRole || '',
            jobType: d.jobType || 'Full-time',
            packageCTC: d.packageCTC || '',
            stipend: d.stipend || '0',
            eligibilityCriteria: d.eligibilityCriteria || '',
            minCGPA: d.minCGPA || '6.0',
            allowedBranches: d.allowedBranches ? d.allowedBranches.join(', ') : '',
            allowedPassingYear: d.allowedPassingYear || '2026',
            skillsRequired: d.skillsRequired ? d.skillsRequired.join(', ') : '',
            selectionProcess: d.selectionProcess || '',
            numRounds: d.numRounds || '3',
            interviewMode: d.interviewMode || 'Offline',
            interviewLocation: d.interviewLocation || '',
            regStartDate: formatDate(d.regStartDate),
            regEndDate: formatDate(d.regEndDate),
            driveDate: formatDate(d.driveDate),
            resultDate: formatDate(d.resultDate),
            website: d.website || '',
            hrName: d.hrName || '',
            hrEmail: d.hrEmail || '',
            hrContact: d.hrContact || '',
            // Prep
            interviewPrep: prep.interviewPrep || '',
            prevQuestions: prep.prevQuestions ? prep.prevQuestions.join(', ') : '',
            codingQuestions: prep.codingQuestions ? prep.codingQuestions.join(', ') : '',
            aptitudeTopics: prep.aptitudeTopics ? prep.aptitudeTopics.join(', ') : '',
            hrQuestions: prep.hrQuestions ? prep.hrQuestions.join(', ') : '',
            resources: prep.resources ? prep.resources.join(', ') : '',
          });

          if (d.allowedBranches && Array.isArray(d.allowedBranches)) {
            setSelectedBranches(d.allowedBranches);
          } else if (typeof d.allowedBranches === 'string') {
            setSelectedBranches(
              d.allowedBranches
                .split(',')
                .map((b) => b.trim())
                .filter(Boolean)
            );
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to retrieve recruitment drive details.');
      } finally {
        setFetching(false);
      }
    };

    fetchDriveDetails();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Build FormData
    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      dataToSend.append(key, formData[key]);
    });

    if (selectedBranches.length === 0) {
      setErrorMsg('Please select at least one allowed branch for this recruitment drive.');
      setLoading(false);
      return;
    }
    dataToSend.set('allowedBranches', selectedBranches.join(', '));

    if (logoFile) dataToSend.append('logo', logoFile);
    if (brochureFile) dataToSend.append('brochure', brochureFile);
    if (pdfFile) dataToSend.append('pdfNotification', pdfFile);

    try {
      let response;
      if (isEditMode) {
        response = await api.put(`/api/recruiters/${id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/api/recruiters', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.data.success) {
        navigate('/admin/recruiters');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit recruitment drive.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/recruiters"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Back to Recruiter Directory
      </Link>

      {/* Form Card wrapper */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
          {isEditMode ? 'Modify Recruitment Drive' : 'Schedule Recruitment Drive'}
        </h2>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Company Profile */}
          <div>
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-4">
              1. Company Profile Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Google LLC"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://careers.google.com"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Company Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a brief summary of what the company does..."
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Recruitment and Academics */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-4">
              2. Job Details & Academic Eligibility
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Job Role / Designation</label>
                <input
                  type="text"
                  required
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Package CTC (LPA)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="packageCTC"
                  value={formData.packageCTC}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Internship Stipend/mo (INR)</label>
                <input
                  type="number"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Minimum CGPA required</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="minCGPA"
                  value={formData.minCGPA}
                  onChange={handleChange}
                  placeholder="e.g. 7.5"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Target Passing Year</label>
                <input
                  type="number"
                  required
                  name="allowedPassingYear"
                  value={formData.allowedPassingYear}
                  onChange={handleChange}
                  placeholder="2026"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-850 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-medium text-slate-500">
                    Allowed Branches <span className="font-semibold text-brand-600 dark:text-brand-400">({selectedBranches.length} selected)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBranches([...AVAILABLE_BRANCHES])}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBranches([])}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Branch Selection Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_BRANCHES.map((branch) => {
                    const isSelected = selectedBranches.includes(branch);
                    return (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBranches(selectedBranches.filter((b) => b !== branch));
                          } else {
                            setSelectedBranches([...selectedBranches, branch]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                            isSelected
                              ? 'bg-white text-brand-600 border-white font-bold'
                              : 'border-slate-300 dark:border-slate-600 bg-transparent'
                          }`}
                        >
                          {isSelected && '✓'}
                        </span>
                        {branch}
                      </button>
                    );
                  })}
                </div>
                {selectedBranches.length === 0 && (
                  <p className="text-[11px] font-medium text-red-500">
                    * Please select at least one branch for this recruitment drive.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Skills Required (Comma Separated)</label>
                <input
                  type="text"
                  name="skillsRequired"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                  placeholder="React, Java, Python"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-850 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Interview timeline */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-4">
              3. Interview Timeline & Settings
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Registration Start Date</label>
                <input
                  type="date"
                  required
                  name="regStartDate"
                  value={formData.regStartDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Registration End Date</label>
                <input
                  type="date"
                  required
                  name="regEndDate"
                  value={formData.regEndDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Recruitment Drive Date</label>
                <input
                  type="date"
                  required
                  name="driveDate"
                  value={formData.driveDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Interview Mode</label>
                <select
                  name="interviewMode"
                  value={formData.interviewMode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Interview Location / Link</label>
                <input
                  type="text"
                  name="interviewLocation"
                  value={formData.interviewLocation}
                  onChange={handleChange}
                  placeholder="e.g. Auditorium Hall B / Teams link"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Selection Rounds (Markdown / Lines)</label>
                <textarea
                  name="selectionProcess"
                  rows="3"
                  value={formData.selectionProcess}
                  onChange={handleChange}
                  placeholder="e.g. Round 1: OA, Round 2: Technical Interview..."
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Number of Rounds</label>
                <input
                  type="number"
                  name="numRounds"
                  value={formData.numRounds}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: HR details */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-4">
              4. HR Contacts
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">HR Officer Name</label>
                <input
                  type="text"
                  name="hrName"
                  value={formData.hrName}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">HR Email</label>
                <input
                  type="email"
                  name="hrEmail"
                  value={formData.hrEmail}
                  onChange={handleChange}
                  placeholder="jsmith@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">HR Phone / Contact</label>
                <input
                  type="text"
                  name="hrContact"
                  value={formData.hrContact}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Prep parameters */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-4">
              5. Placement Prep Guides
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Interview Prep Tips</label>
                <textarea
                  name="interviewPrep"
                  rows="3"
                  value={formData.interviewPrep}
                  onChange={handleChange}
                  placeholder="Focus on algorithms, databases..."
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-805 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Technical / DSA Questions (Comma Separated)</label>
                <input
                  type="text"
                  name="prevQuestions"
                  value={formData.prevQuestions}
                  onChange={handleChange}
                  placeholder="Reverse a string, Balance a tree"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Coding Problems links/tags</label>
                <input
                  type="text"
                  name="codingQuestions"
                  value={formData.codingQuestions}
                  onChange={handleChange}
                  placeholder="Leetcode 101, HackerRank DSA"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Aptitude Topics (Comma Separated)</label>
                <input
                  type="text"
                  name="aptitudeTopics"
                  value={formData.aptitudeTopics}
                  onChange={handleChange}
                  placeholder="Probability, Time & Distance"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">HR Interview Questions (Comma Separated)</label>
                <input
                  type="text"
                  name="hrQuestions"
                  value={formData.hrQuestions}
                  onChange={handleChange}
                  placeholder="Why this company?, Strengths and Weaknesses"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Recommended Web Resources (Comma Separated)</label>
                <input
                  type="text"
                  name="resources"
                  value={formData.resources}
                  onChange={handleChange}
                  placeholder="GFG Interview Archive, GeeksforGeeks placement guide"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs text-slate-850 dark:text-white dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 6: File Attachments */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-4">
              6. PDF & Image Attachments
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Logo */}
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center hover:border-brand-500 transition-colors dark:border-slate-800 dark:bg-slate-850/50">
                <FileUp className="mx-auto mb-1.5 h-6 w-6 text-slate-400" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Company Logo</p>
                <p className="text-[9px] text-slate-400 mb-3">JPG, PNG (Square preferred)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-block rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-700 cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {logoFile ? logoFile.name : 'Select Image'}
                </label>
              </div>

              {/* Brochure */}
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center hover:border-brand-500 transition-colors dark:border-slate-800 dark:bg-slate-850/50">
                <FileUp className="mx-auto mb-1.5 h-6 w-6 text-slate-400" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Brochure PDF</p>
                <p className="text-[9px] text-slate-400 mb-3">Accepts PDF file (Max 10MB)</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setBrochureFile(e.target.files[0])}
                  className="hidden"
                  id="brochure-upload"
                />
                <label
                  htmlFor="brochure-upload"
                  className="inline-block rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-700 cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {brochureFile ? brochureFile.name : 'Select PDF'}
                </label>
              </div>

              {/* PDF Announcement */}
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center hover:border-brand-500 transition-colors dark:border-slate-800 dark:bg-slate-850/50">
                <FileUp className="mx-auto mb-1.5 h-6 w-6 text-slate-400" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Notification PDF</p>
                <p className="text-[9px] text-slate-400 mb-3">Official announcement document</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="inline-block rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-700 cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {pdfFile ? pdfFile.name : 'Select PDF'}
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
            <Link
              to="/admin/recruiters"
              className="rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Submitting...' : 'Save Recruiter Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterForm;
