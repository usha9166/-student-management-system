import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, Users, GraduationCap, FolderOpen, Bell, LogOut, ClipboardList, UserCheck, FileText, BarChart3, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = {
  Admin: [
    { section: 'Overview', items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/admin' }] },
    { section: 'Manage', items: [
      { icon: GraduationCap, label: 'Students', to: '/admin/students' },
      { icon: UserCheck, label: 'Teachers', to: '/admin/teachers' },
      { icon: FolderOpen, label: 'Assign Project', to: '/admin/assign-project' },
      { icon: ClipboardList, label: 'All Projects', to: '/admin/projects' },
    ]},
    { section: 'Reports', items: [{ icon: BarChart3, label: 'Reports', to: '/admin/reports' }] },
  ],
  Teacher: [
    { section: 'Overview', items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/teacher' }] },
    { section: 'Academic', items: [
      { icon: Users, label: 'My Students', to: '/teacher/students' },
      { icon: FolderOpen, label: 'Projects', to: '/teacher/projects' },
      { icon: FileText, label: 'Student Files', to: '/teacher/files' },
      { icon: MessageSquare, label: 'Feedback', to: '/teacher/feedback' },
    ]},
  ],
  Student: [
    { section: 'Overview', items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/student' }] },
    { section: 'My Work', items: [
      { icon: FolderOpen, label: 'My Project', to: '/student/project' },
      { icon: ClipboardList, label: 'Assignments', to: '/student/assignments' },
      { icon: Bell, label: 'Notifications', to: '/student/notifications' },
    ]},
  ],
};

const AVATAR_BG = { Admin: '#f59e0b', Teacher: '#8b5cf6', Student: '#10b981' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = NAV[user?.role] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = async () => {
    try { await logout(); } catch {}
    toast.success('Signed out'); navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><BookOpen size={18} color="white" /></div>
        <div className="sidebar-logo-text">Student Mgmt<span>System</span></div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to.split('/').length <= 2}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <item.icon size={15} />{item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="avatar avatar-sm" style={{ background: AVATAR_BG[user?.role] || '#2563eb' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="nav-item w-full" style={{ color: '#ef4444' }} onClick={handleLogout}>
          <LogOut size={15} style={{ color: '#ef4444' }} />Sign Out
        </button>
      </div>
    </aside>
  );
}
