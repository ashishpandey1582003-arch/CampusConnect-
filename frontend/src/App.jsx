import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Protected Route Helper
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout AShish
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentRecruiters from './pages/student/StudentRecruiters';
import RecruiterDetails from './pages/student/RecruiterDetails';
import PrepSection from './pages/student/PrepSection';
import RecruitmentCalendar from './pages/student/RecruitmentCalendar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRecruiters from './pages/admin/ManageRecruiters';
import RecruiterForm from './pages/admin/RecruiterForm';
import ManageStudents from './pages/admin/ManageStudents';
import ApplicationsManager from './pages/admin/ApplicationsManager';
import NotificationsManager from './pages/admin/NotificationsManager';
import ActivityLogs from './pages/admin/ActivityLogs';
import ManageAdmins from './pages/admin/ManageAdmins';

// Common Error Pages
import NotFound from './pages/common/NotFound';
import Unauthorized from './pages/common/Unauthorized';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Student Protected Portal Segment */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<Layout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/recruiters" element={<StudentRecruiters />} />
                <Route path="/student/bookmarks" element={<StudentRecruiters />} />
                <Route path="/student/recruiter/:id" element={<RecruiterDetails />} />
                <Route path="/student/prep" element={<PrepSection />} />
                <Route path="/student/calendar" element={<RecruitmentCalendar />} />
              </Route>
            </Route>

            {/* Admin/Coordinator Protected Portal Segment */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<Layout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/recruiters" element={<ManageRecruiters />} />
                <Route path="/admin/recruiter/new" element={<RecruiterForm />} />
                <Route path="/admin/recruiter/edit/:id" element={<RecruiterForm />} />
                <Route path="/admin/students" element={<ManageStudents />} />
                <Route path="/admin/applications" element={<ApplicationsManager />} />
                <Route path="/admin/applications/:recruiterId" element={<ApplicationsManager />} />
                <Route path="/admin/notifications" element={<NotificationsManager />} />
                <Route path="/admin/logs" element={<ActivityLogs />} />
                <Route path="/admin/administrators" element={<ManageAdmins />} />
              </Route>
            </Route>

            {/* Error Segment */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

