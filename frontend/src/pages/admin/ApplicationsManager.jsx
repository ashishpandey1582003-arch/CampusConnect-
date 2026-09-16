import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../hooks/useAxios';
import { BACKEND_URL, getFullUrl } from '../../utils/apiUrls';
import { Eye, Edit3, CheckCircle, ShieldAlert, Award, FileText } from 'lucide-react';

const ApplicationsManager = () => {
  const { recruiterId } = useParams(); // Exists if navigated from drive list
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(recruiterId || '');
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [newStatus, setNewStatus] = useState('Applied');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const response = await api.get('/api/recruiters');
        if (response.data.success) {
          setDrives(response.data.data);
          if (!selectedDriveId && response.data.data.length > 0) {
            setSelectedDriveId(response.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDrives();
  }, [selectedDriveId]);

  const fetchApplicationsForDrive = async (id) => {
    if (!id) return;
    setLoadingApps(true);
    try {
      const response = await api.get(`/api/applications/recruiter/${id}`);
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (selectedDriveId) {
      fetchApplicationsForDrive(selectedDriveId);
    }
  }, [selectedDriveId]);

  const handleUpdateStatus = async (appId) => {
    try {
      const response = await api.put(`/api/applications/${appId}/status`, {
        status: newStatus,
        remarks: remarks,
      });

      if (response.data.success) {
        // Update applications locally
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
        setUpdatingId(null);
        setRemarks('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update candidate status.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Applied: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      'Under Review': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      Shortlisted: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
      Selected: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      Rejected: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    };
    return (
      <span className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Applications Console</h1>
        <p className="text-xs text-slate-550">Review applied students, filter candidates, and update shortlists</p>
      </div>

      {/* Recruiter Selector Dropdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="block text-xs font-semibold text-slate-500 mb-2">Select Recruiter Drive</label>
        <select
          value={selectedDriveId}
          onChange={(e) => setSelectedDriveId(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-205 bg-transparent px-4 py-2.5 text-xs dark:border-slate-800 text-slate-655 dark:text-slate-350 focus:outline-none focus:border-brand-500"
        >
          <option value="">Select Recruiter</option>
          {drives.map((d) => (
            <option key={d._id} value={d._id}>
              {d.companyName} - {d.jobRole} ({d.packageCTC} LPA)
            </option>
          ))}
        </select>
      </div>

      {/* Applications Directory table */}
      {loadingApps ? (
        <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <FileText className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-650 dark:text-slate-300">No student applications submitted for this drive</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">University</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-655 dark:text-slate-350">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                      {app.student?.name}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {app.student?.universityRollNo || '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-350">{app.student?.collegeRollNo || '-'}</td>
                    <td className="px-6 py-4 font-bold">{app.student?.branch}</td>
                    <td className="px-6 py-4">{app.student?.cgpa}</td>
                    <td className="px-6 py-4">
                      {app.resume ? (
                        <a
                          href={getFullUrl(app.resume)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-brand-500 hover:text-brand-655"
                        >
                          PDF
                        </a>
                      ) : (
                        <span className="text-slate-405">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {updatingId === app._id ? (
                        <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl dark:bg-slate-850 text-left border dark:border-slate-800 max-w-[200px] float-right">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Add remarks..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300"
                          />
                          <div className="flex justify-end gap-1.5 mt-1">
                            <button
                              onClick={() => setUpdatingId(null)}
                              className="rounded bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app._id)}
                              className="rounded bg-brand-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-brand-600"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setUpdatingId(app._id);
                            setNewStatus(app.status);
                          }}
                          className="inline-flex rounded-lg bg-slate-100 p-2 text-slate-655 hover:bg-slate-205 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors"
                          title="Update candidate state"
                        >
                          <Edit3 className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManager;
