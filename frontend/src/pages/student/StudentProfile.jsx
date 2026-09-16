import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../hooks/useAxios';
import { BACKEND_URL, getFullUrl } from '../../utils/apiUrls';
import { User, FileText, Settings, ShieldCheck, Mail, Phone, BookOpen, KeyRound } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateProfileState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Password reset state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobileNo(user.mobileNo || '');
      setCgpa(user.cgpa || '');
      setSkills(user.skills ? user.skills.join(', ') : '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobileNo', mobileNo);
    formData.append('cgpa', cgpa);
    formData.append('skills', skills);

    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const response = await api.put(`/api/students/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccessMsg('Profile updated successfully.');
        updateProfileState(response.data.data); // Update state in context
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setPassLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // Direct pass modification inside the Auth Route
      const response = await api.put(`/api/students/${user._id}`, {
        password: newPassword,
      });

      if (response.data.success) {
        setSuccessMsg('Password updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Password update failed.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* User Quick Info Summary */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative mx-auto mb-4 h-24 w-24">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300 overflow-hidden">
              {user?.photo ? (
                <img
                  src={getFullUrl(user.photo)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const textNode = document.createTextNode(user?.name ? user.name.charAt(0).toUpperCase() : '?');
                    e.target.parentNode.appendChild(textNode);
                  }}
                />
              ) : (
                user?.name.charAt(0)
              )}
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{user?.name}</h3>
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            Roll No: {user?.universityRollNo || 'N/A'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {user?.collegeRollNo} • {user?.branch} Branch
          </p>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-350">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{user?.mobileNo}</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-slate-400" />
              <span>Section {user?.section} | {user?.year} Year</span>
            </div>
          </div>

          {user?.resume && (
            <a
              href={getFullUrl(user.resume)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
            >
              <FileText className="h-4 w-4" />
              View Resume PDF
            </a>
          )}
        </div>
      </div>

      {/* Profile Form Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            <Settings className="h-5 w-5 text-brand-500" />
            <h3 className="text-base font-bold text-slate-850 dark:text-white">Profile Customizations</h3>
          </div>

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-750 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mobile Number</label>
                <input
                  type="text"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Skills (Comma Separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, SQL, Java"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Update Resume PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-350 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Update Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-350 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>

          {/* Change Password Card */}
          <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-4.5 w-4.5 text-brand-500" />
              <h4 className="text-sm font-bold text-slate-850 dark:text-white">Change Credentials</h4>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-800 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={passLoading}
                className="rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {passLoading ? 'Modifying...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
