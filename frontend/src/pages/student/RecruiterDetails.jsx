import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../hooks/useAxios';
import { BACKEND_URL, getFullUrl } from '../../utils/apiUrls';
import { isBranchEligible } from '../../utils/branchHelper';
import {
  Building2,
  Calendar,
  DollarSign,
  Award,
  Clock,
  ShieldCheck,
  FileDown,
  Info,
  Briefcase,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

const RecruiterDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedApp, setAppliedApp] = useState(null); // The application object if student already applied
  const [applying, setApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState('');

  const fetchDriveDetails = async () => {
    try {
      const [driveRes, appsRes] = await Promise.all([
        api.get(`/api/recruiters/${id}`),
        api.get('/api/applications/my-applications'),
      ]);

      if (driveRes.data.success) {
        setDrive(driveRes.data.data);
      }

      if (appsRes.data.success) {
        const found = appsRes.data.data.find((app) => app.recruiter?._id === id);
        if (found) setAppliedApp(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveDetails();
  }, [id]);

  // Countdown timer logic
  useEffect(() => {
    if (!drive) return;

    const timer = setInterval(() => {
      const difference = +new Date(drive.regEndDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft('Registration Closed');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      setTimeLeft(`${days}d : ${hours}h : ${minutes}m remaining`);
    }, 1000);

    return () => clearInterval(timer);
  }, [drive]);

  const handleApply = async () => {
    setApplying(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const response = await api.post(`/api/applications/apply/${id}`);
      if (response.data.success) {
        setSuccessMsg('Congratulations! Your application has been logged successfully.');
        setAppliedApp(response.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    );
  }

  if (!drive) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Drive not found</h3>
        <Link to="/student/recruiters" className="text-xs text-brand-500 hover:underline">
          Go back to drives
        </Link>
      </div>
    );
  }

  // Double check eligibility
  const isBranchAllowed = isBranchEligible(drive.allowedBranches, user?.branch);
  const isCgpaAllowed = user?.cgpa >= drive.minCGPA;
  const isEligible = isBranchAllowed && isCgpaAllowed;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/student/recruiters"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-450 hover:text-slate-650"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Back to Directory
      </Link>

      {/* Main card details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Core Drive Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-800 dark:bg-slate-850 dark:text-white overflow-hidden border border-slate-200">
                {drive.logo ? (
                  <img
                    src={getFullUrl(drive.logo)}
                    alt="Logo"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const textNode = document.createTextNode(drive.companyName.substring(0, 2).toUpperCase());
                      e.target.parentNode.appendChild(textNode);
                    }}
                  />
                ) : (
                  drive.companyName.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {drive.companyName}
                </h2>
                <p className="text-xs text-slate-550 dark:text-slate-450">{drive.jobRole}</p>
                <div className="mt-2 flex gap-4 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    CTC: {drive.packageCTC} LPA
                  </span>
                  {drive.stipend > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Stipend: Rs.{drive.stipend}/mo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Corporate Description
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-350">
                {drive.description || 'No description provided.'}
              </p>
            </div>

            {/* Allowed Branches and Skills */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Allowed Branches</h5>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {drive.allowedBranches.map((b) => (
                    <span
                      key={b}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-700 dark:bg-slate-850 dark:text-slate-350"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Skills Required</h5>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {drive.skillsRequired.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-700 dark:bg-brand-950/20 dark:text-brand-405"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection Process */}
            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Selection Process</h4>
              <p className="mt-2 whitespace-pre-line text-xs text-slate-650 dark:text-slate-350">
                {drive.selectionProcess || 'Selection process will be notified later.'}
              </p>
            </div>

            {/* Prep section link */}
            <div className="mt-6 flex justify-end">
              <Link
                to={`/student/prep`}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-750"
              >
                Go to Prep Portal
                <ChevronRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Eligibility, Files download & Application controls */}
        <div className="space-y-6">
          {/* Eligibility Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase mb-3">Eligibility Check</h4>

            {isEligible ? (
              <div className="flex gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">You are eligible to apply!</p>
                  <p className="text-[10px] mt-0.5 text-emerald-650 dark:text-emerald-500">
                    CGPA and branch criteria satisfied.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
                <Info className="h-5 w-5 shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold">You are not eligible to apply.</p>
                  <p className="text-[10px] mt-1 text-red-650 dark:text-red-500 leading-relaxed">
                    {!isBranchAllowed && `• Drive restricts branch access (Needs: ${drive.allowedBranches.join(', ')})`}
                    {!isCgpaAllowed && `\n• GPA requirements not satisfied (Needs: ${drive.minCGPA}+)`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Countdown Clock */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center">
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Registration Window</h5>
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
              <Clock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-450 animate-pulse" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{timeLeft}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Registration Ends: {new Date(drive.regEndDate).toLocaleString()}
            </p>
          </div>

          {/* Apply button and Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center">
            {successMsg && (
              <div className="mb-4 text-xs font-semibold text-emerald-600 border border-emerald-250 bg-emerald-50/50 p-3 rounded-xl">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 text-xs font-semibold text-red-600 border border-red-250 bg-red-50/50 p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            {appliedApp ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 dark:bg-brand-950/20 dark:border-brand-900 text-left">
                  <p className="text-xs font-bold text-brand-700 dark:text-brand-350">
                    Application Submitted
                  </p>
                  <p className="text-[10px] text-slate-405 dark:text-slate-450">
                    Status: <span className="font-semibold text-slate-800 dark:text-slate-250">{appliedApp.status}</span>
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Submitted on: {new Date(appliedApp.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={!isEligible || applying || timeLeft === 'Registration Closed'}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-40 transition-colors"
              >
                {applying ? 'Applying...' : 'Apply For Recruitment'}
              </button>
            )}
          </div>

          {/* Files / Attachments */}
          {(drive.brochure || drive.pdfNotification) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Resources</h5>
              {drive.pdfNotification && (
                <a
                  href={getFullUrl(drive.pdfNotification)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <FileDown className="h-4.5 w-4.5 text-brand-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-350">Drive Notification PDF</span>
                  </div>
                </a>
              )}
              {drive.brochure && (
                <a
                  href={getFullUrl(drive.brochure)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <FileDown className="h-4.5 w-4.5 text-brand-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-350">Company Brochure</span>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDetails;
