import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap, ArrowLeft, ShieldAlert, FileUp, UserCog, KeyRound } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  collegeRollNo: z.string().min(3, { message: 'Required' }),
  universityRollNo: z.string().min(3, { message: 'Required' }),
  branch: z.enum(['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MCA', 'MBA', 'CSE(AI/ML)'], {
    errorMap: () => ({ message: 'Select a valid branch' }),
  }),
  year: z.coerce.number().min(1).max(4),
  section: z.string().min(1, { message: 'Required' }),
  mobileNo: z.string().min(10, { message: 'Mobile number must be at least 10 digits' }),
  cgpa: z.coerce.number().min(0).max(10, { message: 'CGPA must be between 0 and 10' }),
  skills: z.string().optional(),
});

const adminRegisterSchema = z.object({
  name: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  accessKey: z.string().min(1, { message: 'Coordinator access key is required to register' }),
});

const Register = () => {
  const { registerStudent, registerAdmin } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [resumeFile, setResumeFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const studentForm = useForm({
    resolver: zodResolver(registerSchema),
  });

  const adminForm = useForm({
    resolver: zodResolver(adminRegisterSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = studentForm;

  const {
    register: registerAdminField,
    handleSubmit: handleAdminSubmit,
    formState: { errors: adminErrors },
  } = adminForm;

  const onStudentSubmit = async (data) => {
    setLoading(true);
    setSubmitError(null);

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) formData.append(key, data[key]);
    });
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    const result = await registerStudent(formData);
    setLoading(false);

    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setSubmitError(result.error);
    }
  };

  const onAdminSubmit = async (data) => {
    setLoading(true);
    setSubmitError(null);

    const result = await registerAdmin(data);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-400 via-sky-300 to-sky-200 px-4 py-12">
      <div className="relative z-10 w-full max-w-3xl">
        {/* Back Link */}
        <Link
          to="/login"
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-sky-900 hover:text-sky-950 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        {/* Form Container */}
        <div className="rounded-3xl border border-sky-100 bg-white p-8 shadow-2xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/25">
              {role === 'student' ? (
                <GraduationCap className="h-6 w-6" />
              ) : (
                <UserCog className="h-6 w-6" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-sans">
                {role === 'student' ? 'Student Registration' : 'Coordinator Registration'}
              </h1>
              <p className="text-sm text-slate-500">
                {role === 'student'
                  ? 'Enroll your profile into the Placement Cell database'
                  : 'Register a Placement Coordinator / Admin account'}
              </p>
            </div>
          </div>

          {/* Role Toggle Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setSubmitError(null);
              }}
              className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                role === 'student'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setSubmitError(null);
              }}
              className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Placement Coordinator
            </button>
          </div>

          {submitError && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-650">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {role === 'student' ? (
            <form onSubmit={handleSubmit(onStudentSubmit)} className="space-y-6">
              {/* Section 1: Personal Details */}
              <div className="border-b border-slate-100 pb-6">
                <h3 className="text-sm font-bold text-sky-600 mb-4 uppercase tracking-wider">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Full Name <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enter your name"
                      {...register('name')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Email Address <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. Enter your gmail"
                      {...register('email')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Mobile Number <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0nly 10 digits"
                      {...register('mobileNo')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.mobileNo && <p className="mt-1 text-[11px] text-red-600">{errors.mobileNo.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Password <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="•••••••• (minimum 6 characters)"
                      {...register('password')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Academics */}
              <div className="border-b border-slate-100 pb-6">
                <h3 className="text-sm font-bold text-sky-600 mb-4 uppercase tracking-wider">
                  Academic Qualifications
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      University Name <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AKTU / University Name"
                      {...register('collegeRollNo')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.collegeRollNo && (
                      <p className="mt-1 text-[11px] text-red-600">{errors.collegeRollNo.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      University Roll No <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. (Unique)"
                      {...register('universityRollNo')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.universityRollNo && (
                      <p className="mt-1 text-[11px] text-red-600">{errors.universityRollNo.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Current CGPA <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.5 (Out of 10)"
                      {...register('cgpa')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.cgpa && <p className="mt-1 text-[11px] text-red-600">{errors.cgpa.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Branch <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <select
                      {...register('branch')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="">Select Branch</option>
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
                    {errors.branch && <p className="mt-1 text-[11px] text-red-600">{errors.branch.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Current Year <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <select
                      {...register('year')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Section <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A"
                      {...register('section')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.section && <p className="mt-1 text-[11px] text-red-600">{errors.section.message}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Java, Node.js, SQL"
                    {...register('skills')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Section 3: Document Uploads */}
              <div>
                <h3 className="text-sm font-bold text-sky-600 mb-4 uppercase tracking-wider">
                  Upload Attachments
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Resume PDF */}
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:border-sky-500 transition-colors">
                    <FileUp className="mx-auto mb-2 h-8 w-8 text-sky-500" />
                    <p className="text-xs font-bold text-slate-900">
                      Resume Document <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mb-4">Accepts PDF file (Max 10MB)</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="inline-block rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-350 cursor-pointer transition-colors"
                    >
                      {resumeFile ? resumeFile.name : 'Select PDF'}
                    </label>
                  </div>

                  {/* Profile Picture */}
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:border-sky-500 transition-colors">
                    <FileUp className="mx-auto mb-2 h-8 w-8 text-sky-500" />
                    <p className="text-xs font-bold text-slate-900">
                      Profile Picture <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mb-4">Accepts JPEG, JPG, PNG (Max 10MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-block rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-355 cursor-pointer transition-colors"
                    >
                      {photoFile ? photoFile.name : 'Select Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Register & Sign In'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit(onAdminSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Full Name <span className="text-red-600 font-extrabold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coordinator Name"
                    {...registerAdminField('name')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {adminErrors.name && <p className="mt-1 text-[11px] text-red-650">{adminErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Email Address <span className="text-red-600 font-extrabold">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. coordinator@college.edu"
                    {...registerAdminField('email')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {adminErrors.email && <p className="mt-1 text-[11px] text-red-650">{adminErrors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Password <span className="text-red-600 font-extrabold">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="•••••••• (minimum 6 characters)"
                    {...registerAdminField('password')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                  />
                  {adminErrors.password && <p className="mt-1 text-[11px] text-red-650">{adminErrors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Coordinator Access Key <span className="text-red-600 font-extrabold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter coordinator security access key"
                      {...registerAdminField('accessKey')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                  {adminErrors.accessKey && <p className="mt-1 text-[11px] text-red-650">{adminErrors.accessKey.message}</p>}
                  <p className="mt-1.5 text-[10px] text-slate-500">
                    Required to verify administrator authenticity. Default key is <code className="text-sky-600 font-mono bg-sky-50 px-1 py-0.5 rounded">campusconnect2026</code>.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Register Admin & Sign In'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
