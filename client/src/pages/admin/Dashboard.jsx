import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, GraduationCap, FolderOpen, AlertCircle, UserPlus, ClipboardList, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ students: [], teachers: [], projects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, tRes, pRes] = await Promise.all([
          API.get('/projects/users?role=Student'),
          API.get('/projects/users?role=Teacher'),
          API.get('/projects/all'),
        ]);
        setData({ students: sRes.data.users || [], teachers: tRes.data.users || [], projects: pRes.data.projects || [] });
      } catch { setData({ students: [], teachers: [], projects: [] }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const { students, teachers, projects } = data;
  const assigned = projects.filter(p => p.supervisor).length;
  const statusCounts = { Pending: 0, 'In Progress': 0, Submitted: 0, Approved: 0, Completed: 0, Rejected: 0 };
  projects.forEach(p => { if (statusCounts[p.status] !== undefined) statusCounts[p.status]++; });

  const pieData = Object.entries(statusCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#ef4444'];

  const teacherLoad = teachers.map(t => ({
    name: t.name?.split(' ')[0],
    students: projects.filter(p => p.supervisor?._id === t._id).length,
  }));

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width: 28, height: 28 }} /></div>;

  return (
    <div>
      <div className="welcome-banner">
        <h2>Welcome back, {user?.name} 👋</h2>
        <p>Here's what's happening in your Student Management System today.</p>
      </div>

      <div className="stats-grid">
        {[
          { icon: GraduationCap, label: 'Total Students', val: students.length, bg: '#dbeafe', ic: '#1d4ed8' },
          { icon: Users, label: 'Total Teachers', val: teachers.length, bg: '#ede9fe', ic: '#5b21b6' },
          { icon: FolderOpen, label: 'Total Projects', val: projects.length, bg: '#d1fae5', ic: '#065f46' },
          { icon: AlertCircle, label: 'Pending Review', val: statusCounts.Pending, bg: '#fef3c7', ic: '#92400e' },
          { icon: TrendingUp, label: 'Submitted', val: statusCounts.Submitted, bg: '#dbeafe', ic: '#2563eb' },
          { icon: ClipboardList, label: 'Completed', val: statusCounts.Completed, bg: '#d1fae5', ic: '#059669' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={17} color={s.ic} /></div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header"><span className="card-title">Teacher Workload</span></div>
          <div className="card-body">
            {teacherLoad.length === 0
              ? <div className="empty-state" style={{ padding: '20px 0' }}><p>No teachers yet</p></div>
              : <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={teacherLoad} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#2563eb" radius={[5, 5, 0, 0]} name="Projects" />
                  </BarChart>
                </ResponsiveContainer>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Project Status Distribution</span></div>
          <div className="card-body">
            {pieData.length === 0
              ? <div className="empty-state" style={{ padding: '20px 0' }}><p>No projects yet</p></div>
              : <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Quick Actions</span></div>
        <div className="card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/admin/students" className="btn btn-primary"><UserPlus size={15} /> Add Student</Link>
          <Link to="/admin/teachers" className="btn btn-light"><Users size={15} /> Add Teacher</Link>
          <Link to="/admin/assign-project" className="btn btn-light"><FolderOpen size={15} /> Assign Project</Link>
          <Link to="/admin/projects" className="btn btn-ghost"><ClipboardList size={15} /> View All Projects</Link>
          <Link to="/admin/reports" className="btn btn-ghost"><TrendingUp size={15} /> Reports</Link>
        </div>
      </div>
    </div>
  );
}
