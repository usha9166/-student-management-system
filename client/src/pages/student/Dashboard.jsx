import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FolderOpen, User, Clock, MessageSquare, Bell, CheckCircle, BookOpen, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/projects/my')
      .then(({ data }) => setProject(data.project))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width:28,height:28 }} /></div>;

  const latestFeedback = project?.feedback?.slice(-1)[0];
  const daysLeft = project?.deadline ? Math.ceil((new Date(project.deadline) - new Date()) / (1000*60*60*24)) : null;

  const statusColor = s => ({ Approved:'badge-green', Completed:'badge-green', Submitted:'badge-blue', Rejected:'badge-red', 'In Progress':'badge-purple', Pending:'badge-yellow' }[s]||'badge-gray');

  return (
    <div>
      <div className="welcome-banner">
        <h2>Welcome back, {user?.name} 👋</h2>
        <p>Here's your project overview and recent updates.</p>
      </div>

      {/* Info cards */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:20 }}>
        {[
          { icon:FolderOpen, label:'Project Title', val: project?.title||'Not Assigned', bg:'#dbeafe', ic:'#1d4ed8' },
          { icon:User,       label:'Supervisor',    val: project?.supervisor?.name||'N/A',  bg:'#ede9fe', ic:'#5b21b6' },
          { icon:Clock,      label:'Deadline',      val: project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A', bg:'#fef3c7', ic:'#92400e' },
          { icon:TrendingUp, label:'Progress',      val: `${project?.progress||0}%`,       bg:'#d1fae5', ic:'#065f46' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background:s.bg }}><s.icon size={17} color={s.ic}/></div>
            <div style={{ fontWeight:700, fontSize:'0.88rem', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-5">
        {/* Project Overview */}
        <div className="card">
          <div className="card-header"><span className="card-title">Project Overview</span></div>
          <div className="card-body">
            {project ? (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <div className="meta-label">Title</div>
                  <div style={{ fontWeight:600 }}>{project.title}</div>
                </div>
                <div>
                  <div className="meta-label">Category</div>
                  <span className="badge badge-gray">{project.category||'—'}</span>
                </div>
                <div>
                  <div className="meta-label">Description</div>
                  <div style={{ fontSize:'0.86rem', color:'var(--dark-2)', lineHeight:1.6 }}>{project.description||'No description provided'}</div>
                </div>
                <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                  <div>
                    <div className="meta-label">Status</div>
                    <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
                  </div>
                  <div>
                    <div className="meta-label">Deadline</div>
                    <div style={{ fontSize:'0.86rem' }}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'}) : 'N/A'}
                      {daysLeft !== null && daysLeft >= 0 && <span style={{ marginLeft:6, fontSize:'0.75rem', color: daysLeft<=7?'var(--danger)':'var(--mid)' }}>({daysLeft}d left)</span>}
                      {daysLeft !== null && daysLeft < 0 && <span style={{ marginLeft:6, fontSize:'0.75rem', color:'var(--danger)' }}>(Overdue)</span>}
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="meta-label" style={{ marginBottom:6 }}>Progress — {project.progress||0}%</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${project.progress||0}%` }} /></div>
                </div>
                {/* Tech stack */}
                {(project.techStack||[]).length > 0 && (
                  <div>
                    <div className="meta-label">Tech Stack</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:4 }}>
                      {project.techStack.map(t => <span key={t} className="badge badge-blue">{t}</span>)}
                    </div>
                  </div>
                )}
                <Link to="/student/project" className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start' }}>
                  <FolderOpen size={13}/> Open Project
                </Link>
              </div>
            ) : (
              <div className="empty-state" style={{ padding:'30px 0' }}>
                <FolderOpen size={32}/>
                <h3>No project assigned yet</h3>
                <p>Your admin will assign a project to you.</p>
              </div>
            )}
          </div>
        </div>

        {/* Faculty Guidelines */}
        <div className="card">
          <div className="card-header"><span className="card-title">Faculty Guidelines</span></div>
          <div className="card-body">
            {project?.guidelines ? (
              <div style={{ fontSize:'0.86rem', color:'var(--dark-2)', lineHeight:1.8, whiteSpace:'pre-wrap', background:'var(--lighter)', padding:'14px', borderRadius:8, maxHeight:320, overflowY:'auto' }}>
                {project.guidelines}
              </div>
            ) : (
              <div className="empty-state" style={{ padding:'30px 0' }}>
                <BookOpen size={28}/>
                <h3>No guidelines yet</h3>
                <p>Your supervisor will add guidelines.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Latest Feedback */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Latest Feedback</span>
            <Link to="/student/notifications" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="card-body">
            {project?.feedback?.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {project.feedback.slice(-3).reverse().map((f,i) => (
                  <div key={i} style={{ background:'var(--lighter)', borderRadius:8, padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div className="avatar avatar-sm" style={{ background:'#ede9fe', color:'#5b21b6' }}>{f.fromName?.[0]||'T'}</div>
                      <div>
                        <div style={{ fontSize:'0.82rem', fontWeight:600 }}>{f.fromName||'Supervisor'}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--mid)' }}>{new Date(f.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <p style={{ fontSize:'0.85rem', color:'var(--dark-2)', lineHeight:1.6 }}>{f.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding:'24px 0' }}>
                <MessageSquare size={28}/>
                <h3>No feedback yet</h3>
              </div>
            )}
          </div>
        </div>

        {/* Submissions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Submissions</span>
            <Link to="/student/project" className="btn btn-ghost btn-sm">Upload File</Link>
          </div>
          <div className="card-body">
            {project?.submissions?.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {project.submissions.slice(-4).reverse().map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'var(--lighter)', borderRadius:8 }}>
                    <div style={{ width:32, height:32, borderRadius:7, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <CheckCircle size={15} color="#1d4ed8"/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'0.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.fileName}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--mid)' }}>{s.fileSize} • {new Date(s.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <span className="badge badge-green">Submitted</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding:'24px 0' }}>
                <Bell size={28}/>
                <h3>No submissions yet</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
