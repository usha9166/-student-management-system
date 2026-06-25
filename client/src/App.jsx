import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminAssignProject from './pages/admin/AssignProject';
import AdminProjects from './pages/admin/Projects';
import AdminReports from './pages/admin/Reports';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherStudents from './pages/teacher/Students';
import TeacherProjects from './pages/teacher/Projects';
import TeacherFiles from './pages/teacher/Files';
import TeacherFeedback from './pages/teacher/Feedback';

import StudentDashboard from './pages/student/Dashboard';
import StudentProject from './pages/student/Project';
import StudentAssignments from './pages/student/Assignments';
import StudentNotifications from './pages/student/Notifications';

import NotFound from './pages/NotFound';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role==='Admin') return <Navigate to="/admin" replace />;
  if (user.role==='Teacher') return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style:{ fontFamily:'Inter,sans-serif', fontSize:'0.86rem', borderRadius:'9px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }, duration:3500 }} />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="assign-project" element={<AdminAssignProject />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          <Route path="/teacher" element={<ProtectedRoute roles={['Teacher']}><Layout /></ProtectedRoute>}>
            <Route index element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="projects" element={<TeacherProjects />} />
            <Route path="files" element={<TeacherFiles />} />
            <Route path="feedback" element={<TeacherFeedback />} />
          </Route>

          <Route path="/student" element={<ProtectedRoute roles={['Student']}><Layout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="project" element={<StudentProject />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
