import React, { useState, useEffect } from 'react';
import api from '../../hooks/useAxios';
import { API_URL, BACKEND_URL, getFullUrl } from '../../utils/apiUrls';
import { Search, Trash2, FileSpreadsheet, FileDown, GraduationCap, Users } from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [cgpaFilter, setCgpaFilter] = useState('All'); // 'All', '8+', '7+', '6+'

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/students?limit=100');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the student profile for ${name}?`)) {
      return;
    }
    try {
      const response = await api.delete(`/api/students/${id}`);
      if (response.data.success) {
        setStudents((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete student account.');
    }
  };

  const filteredStudents = students.filter((s) => {
    const name = s.name || '';
    const collegeRollNo = s.collegeRollNo || '';
    const universityRollNo = s.universityRollNo || '';
    const email = s.email || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(search) ||
      collegeRollNo.toLowerCase().includes(search) ||
      universityRollNo.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search);

    const matchesBranch = branchFilter === 'All' || s.branch === branchFilter;

    let matchesCgpa = true;
    const cgpa = typeof s.cgpa === 'number' ? s.cgpa : parseFloat(s.cgpa) || 0;
    if (cgpaFilter === '9+') matchesCgpa = cgpa >= 9.0;
    else if (cgpaFilter === '8+') matchesCgpa = cgpa >= 8.0;
    else if (cgpaFilter === '7+') matchesCgpa = cgpa >= 7.0;
    else if (cgpaFilter === '6+') matchesCgpa = cgpa >= 6.0;

    return matchesSearch && matchesBranch && matchesCgpa;
  });

  if (loading) {
    return (
      <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Enrollment Registry</h1>
          <p className="text-xs text-slate-550">Directory of placement candidates and academic credentials</p>
        </div>
        {/* Exports */}
        <div className="flex gap-2">
          <a
            href={`${API_URL}/students/export/excel`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 shadow-sm"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
            Export Excel
          </a>
          <a
            href={`${API_URL}/students/export/pdf`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 shadow-sm"
          >
            <FileDown className="h-4.5 w-4.5 text-red-650" />
            Export PDF Table
          </a>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search candidate by name, roll no, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-transparent py-2 pl-10 pr-4 text-xs dark:border-slate-800 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Branch */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs dark:border-slate-800 text-slate-600 dark:text-slate-350 focus:outline-none"
          >
            <option value="All">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="CSE(AI/ML)">CSE(AI/ML)</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EE">EE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
            <option value="MCA">MCA</option>
            <option value="MBA">MBA</option>
          </select>

          {/* CGPA */}
          <select
            value={cgpaFilter}
            onChange={(e) => setCgpaFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs dark:border-slate-800 text-slate-655 dark:text-slate-350 focus:outline-none"
          >
            <option value="All">All GPA</option>
            <option value="9+">GPA 9.0+</option>
            <option value="8+">GPA 8.0+</option>
            <option value="7+">GPA 7.0+</option>
            <option value="6+">GPA 6.0+</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <Users className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-650 dark:text-slate-300">No candidates match your queries</p>
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
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-655 dark:text-slate-350">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-655 dark:bg-brand-950/40">
                        {s.name.charAt(0)}
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {s.universityRollNo || '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-350">{s.collegeRollNo || '-'}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4 font-bold">{s.branch}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {s.cgpa}
                    </td>
                    <td className="px-6 py-4">
                      {s.resume ? (
                        <a
                          href={getFullUrl(s.resume)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-brand-500 hover:text-brand-655"
                        >
                          PDF
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(s._id, s.name)}
                        className="inline-flex rounded-lg bg-slate-100 p-2 text-red-600 hover:bg-red-600 hover:text-white dark:bg-slate-800 dark:hover:bg-red-950/60 transition-colors"
                        title="Delete student profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

export default ManageStudents;
