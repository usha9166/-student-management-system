import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const TITLES = {
  '/admin': { title: 'Dashboard', sub: 'System overview' },
  '/admin/students': { title: 'Students', sub: 'Manage student accounts' },
  '/admin/teachers': { title: 'Teachers', sub: 'Manage teacher accounts' },
  '/admin/assign-project': { title: 'Assign Project', sub: 'Assign projects with faculty guidelines' },
  '/admin/projects': { title: 'All Projects', sub: 'View and manage all student projects' },
  '/admin/reports': { title: 'Reports', sub: 'Analytics & statistics' },
  '/teacher': { title: 'Dashboard', sub: 'Teaching overview' },
  '/teacher/students': { title: 'My Students', sub: 'Students under your supervision' },
  '/teacher/projects': { title: 'Projects', sub: 'Review and manage student projects' },
  '/teacher/files': { title: 'Student Files', sub: 'Manage files received from students' },
  '/teacher/feedback': { title: 'Feedback', sub: 'Send feedback to students' },
  '/student': { title: 'Dashboard', sub: 'Your project overview' },
  '/student/project': { title: 'My Project', sub: 'View project details and upload files' },
  '/student/assignments': { title: 'Assignments', sub: 'Track your assignment submissions' },
  '/student/notifications': { title: 'Notifications', sub: 'Recent updates and feedback' },
};

const AVATAR_BG = { Admin: '#f59e0b', Teacher: '#8b5cf6', Student: '#10b981' };

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const info = TITLES[pathname] || { title: 'Page', sub: '' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{info.title}</div>
            {info.sub && <div className="topbar-sub">{info.sub}</div>}
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="avatar avatar-sm" style={{ background: AVATAR_BG[user?.role] || '#2563eb' }}>{initials}</div>
              <span className="topbar-name">{user?.name}</span>
              <span className={`role-chip role-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
        </header>
        <main className="page"><Outlet /></main>
      </div>
    </div>
  );
}
