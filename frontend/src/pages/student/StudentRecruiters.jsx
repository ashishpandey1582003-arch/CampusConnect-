import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../hooks/useAxios';
import { BACKEND_URL, getFullUrl } from '../../utils/apiUrls';
import { isBranchEligible } from '../../utils/branchHelper';
import { Search, Briefcase, Bookmark, Award, DollarSign, Calendar, SlidersHorizontal } from 'lucide-react';

const StudentRecruiters = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isBookmarksPage = location.pathname === '/student/bookmarks';

  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All'); // 'All', 'Eligible'

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const [drivesRes, bookmarksRes] = await Promise.all([
          api.get('/api/recruiters'),
          api.get('/api/bookmarks'),
        ]);

        if (drivesRes.data.success) setDrives(drivesRes.data.data);
        if (bookmarksRes.data.success) {
          const bookmarkedIds = bookmarksRes.data.data.map((b) => b._id);
          setBookmarks(bookmarkedIds);
        }
      } catch (err) {
        console.error('Failed to load recruitment drives:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, []);

  const handleBookmarkToggle = async (recruiterId, e) => {
    e.preventDefault(); // Prevent navigating to details card
    try {
      const response = await api.post(`/api/bookmarks/${recruiterId}`);
      if (response.data.success) {
        if (response.data.bookmarked) {
          setBookmarks((prev) => [...prev, recruiterId]);
        } else {
          setBookmarks((prev) => prev.filter((id) => id !== recruiterId));
        }
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const getFilteredDrives = () => {
    let baseDrives = drives;
    if (isBookmarksPage) {
      baseDrives = drives.filter((drive) => bookmarks.includes(drive._id));
    }

    return baseDrives.filter((drive) => {
      // 1. Search term check
      const matchesSearch =
        drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drive.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drive.skillsRequired.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Branch check
      const matchesBranch =
        branchFilter === 'All' || isBranchEligible(drive.allowedBranches, branchFilter);

      // 3. Status check
      const matchesStatus = statusFilter === 'All' || drive.status === statusFilter;

      // 4. Dynamic Eligibility check
      const isEligible =
        user && user.cgpa >= drive.minCGPA && isBranchEligible(drive.allowedBranches, user.branch);
      const matchesEligibility = eligibilityFilter === 'All' || (eligibilityFilter === 'Eligible' && isEligible);

      return matchesSearch && matchesBranch && matchesStatus && matchesEligibility;
    });
  };

  const filteredDrives = getFilteredDrives();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isBookmarksPage ? 'Bookmarked Drives' : 'Recruitment Drives'}
        </h1>
        <p className="text-xs text-slate-500">
          {isBookmarksPage
            ? 'Access and manage your saved recruitment drives'
            : 'Track and apply for active and upcoming drives'}
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search company, job role, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 pr-4 text-xs dark:border-slate-800 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-xs dark:border-slate-800 text-slate-600 dark:text-slate-350 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Registration Open">Registration Open</option>
            <option value="Upcoming">Upcoming Only</option>
            <option value="Closed">Closed Drives</option>
          </select>

          {/* Eligibility */}
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-xs dark:border-slate-800 text-slate-600 dark:text-slate-350 focus:outline-none"
          >
            <option value="All">All Drives</option>
            <option value="Eligible">My Eligible Drives</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-650 dark:text-slate-300">No drives match your filters</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the parameters or changing your query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrives.map((drive) => {
            const isEligible =
              user && user.cgpa >= drive.minCGPA && isBranchEligible(drive.allowedBranches, user.branch);
            const isBookmarked = bookmarks.includes(drive._id);

            return (
              <Link
                key={drive._id}
                to={`/student/recruiter/${drive._id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-250 bg-white p-5 shadow-sm hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900 transition-all duration-200"
              >
                <div>
                  {/* Top line info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-750 dark:bg-slate-850 dark:text-slate-200 font-bold overflow-hidden border border-slate-100 dark:border-slate-800">
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
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleBookmarkToggle(drive._id, e)}
                        className={`rounded-lg p-2 transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                            : 'bg-slate-50 text-slate-400 hover:text-slate-600 dark:bg-slate-850 dark:hover:text-slate-350'
                        }`}
                        aria-label="Bookmark recruiter"
                      >
                        <Bookmark className={`h-4.5 w-4.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Main texts */}
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-500 dark:text-white transition-colors">
                      {drive.companyName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{drive.jobRole}</p>
                  </div>

                  {/* Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400'
                      }`}
                    >
                      {isEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold ${
                        drive.status === 'Registration Open'
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350'
                      }`}
                    >
                      {drive.status}
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="font-bold text-slate-750 dark:text-slate-300">
                      {drive.packageCTC} LPA
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Drive: {new Date(drive.driveDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentRecruiters;
