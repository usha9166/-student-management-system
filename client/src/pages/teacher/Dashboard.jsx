import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, FolderOpen, FileText, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/projects/supervised'), API.get('/projects/teacher/files')])
      .then(([pRes, fRes]) => { setProjects(pRes.data.projects||[]); setFiles(fRes.data.files||[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = projects.filter(p=>p.status==='Pending'||p.status==='Submitted').length;
  const approved = projects.filter(p=>p.status==='Approved'||p.status==='Completed').length;
  const totalFeedback = projects.reduce((acc,p)=>acc+(p.feedback?.length||0),0);

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width:28,height:28 }} /></div>;

  return (
    <div>
      <div className="welcome-banner">
        <h2>Welcome back, {user?.name} 👋</h2>
        <p>You are supervising {projects.length} project(s). {pending > 0 ? `${pending} need(s) your review.` : 'All caught up!'}</p>
      </div>

      <div className="stats-grid">
        {[
          { icon:Users,       label:'My Students',    val:projects.length,   bg:'#dbeafe', ic:'#1d4ed8' },
          { icon:FolderOpen,  label:'Total Projects',  val:projects.length,   bg:'#d1fae5', ic:'#065f46' },
          { icon:Clock,       label:'Pending Review',  val:pending,            bg:'#fef3c7', ic:'#92400e' },
          { icon:CheckCircle, label:'Approved',        val:approved,           bg:'#d1fae5', ic:'#059669' },
          { icon:FileText,    label:'Files Received',  val:files.length,       bg:'#ede9fe', ic:'#5b21b6' },
          { icon:MessageSquare,label:'Feedback Sent',  val:totalFeedback,      bg:'#dbeafe', ic:'#2563eb' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background:s.bg }}><s.icon size={17} color={s.ic}/></div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mt-5">
        <div className="card-header">
          <span className="card-title">My Students' Projects</span>
          <Link to="/teacher/projects" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="table-wrap">
          {projects.length===0 ? (
            <div className="empty-state" style={{ padding:40 }}><Users size={28}/><h3>No students assigned yet</h3></div>
          ) : (
            <table>
              <thead><tr><th>Student</th><th>Project</th><th>Progress</th><th>Status</th><th>Files</th><th>Deadline</th></tr></thead>
              <tbody>
                {projects.slice(0,6).map(p => (
                  <tr key={p._id}>
                    <td><div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="avatar avatar-sm" style={{ background:'#dbeafe', color:'#1d4ed8' }}>{p.student?.name?.[0]}</div>
                      <div><div style={{ fontWeight:600, fontSize:'0.85rem' }}>{p.student?.name}</div><div style={{ fontSize:'0.73rem', color:'var(--mid)' }}>{p.student?.email}</div></div>
                    </div></td>
                    <td style={{ fontSize:'0.84rem', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div className="progress-bar" style={{ flex:1, minWidth:60 }}><div className="progress-fill" style={{ width:`${p.progress||0}%` }}/></div>
                        <span style={{ fontSize:'0.73rem', color:'var(--mid)' }}>{p.progress||0}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${p.status==='Approved'||p.status==='Completed'?'badge-green':p.status==='Submitted'?'badge-blue':p.status==='Rejected'?'badge-red':'badge-yellow'}`}>{p.status}</span></td>
                    <td><span className="badge badge-gray">{p.submissions?.length||0} file(s)</span></td>
                    <td style={{ fontSize:'0.8rem', color:'var(--mid)', whiteSpace:'nowrap' }}>{p.deadline?new Date(p.deadline).toLocaleDateString():'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
