import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { FolderOpen, Search, CheckCircle, XCircle, MessageSquare, X, Send, Eye, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

function FeedbackModal({ project, onClose, onSaved }) {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!msg.trim()) return toast.error('Enter feedback message');
    setLoading(true);
    try {
      await API.post(`/projects/${project._id}/feedback`, { message: msg });
      toast.success('Feedback sent!'); setMsg(''); onSaved(); onClose();
    } catch { toast.error('Failed to send feedback'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Send Feedback</span>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div style={{ background:'var(--lighter)', padding:'10px 14px', borderRadius:8, marginBottom:14 }}>
            <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{project.title}</div>
            <div style={{ fontSize:'0.77rem', color:'var(--mid)' }}>{project.student?.name}</div>
          </div>
          {project.feedback?.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--mid)', textTransform:'uppercase', marginBottom:8 }}>Previous Feedback</div>
              <div style={{ maxHeight:160, overflowY:'auto', display:'flex', flexDirection:'column', gap:7 }}>
                {[...project.feedback].reverse().map((f,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--border)', borderRadius:7, padding:'9px 12px' }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, marginBottom:3 }}>{f.fromName} — <span style={{ fontSize:'0.72rem', color:'var(--mid)', fontWeight:400 }}>{new Date(f.createdAt).toLocaleString()}</span></div>
                    <div style={{ fontSize:'0.83rem', color:'var(--dark-2)' }}>{f.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">New Feedback</label>
            <textarea className="form-textarea" rows={4} placeholder="Write detailed feedback..." value={msg} onChange={e => setMsg(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={send} disabled={loading}>
            {loading ? <span className="spinner"/> : <Send size={14}/>}{loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressModal({ project, onClose, onSaved }) {
  const [status, setStatus] = useState(project.status);
  const [progress, setProgress] = useState(project.progress||0);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/projects/${project._id}/status`, { status, progress });
      toast.success('Project updated!'); onSaved(); onClose();
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Update Project</span>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div style={{ background:'var(--lighter)', padding:'10px 14px', borderRadius:8, marginBottom:14 }}>
            <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{project.title}</div>
            <div style={{ fontSize:'0.77rem', color:'var(--mid)' }}>{project.student?.name}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              {['Pending','Approved','In Progress','Submitted','Completed','Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Progress — {progress}%</label>
            <input type="range" min={0} max={100} step={5} value={progress} onChange={e => setProgress(Number(e.target.value))}
              style={{ width:'100%', marginBottom:6 }} />
            <div className="progress-bar"><div className="progress-fill" style={{ width:`${progress}%` }}/></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? <span className="spinner"/> : null}{loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [progressModal, setProgressModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await API.get('/projects/supervised'); setProjects(data.projects||[]); }
    catch { setProjects([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const quickStatus = async (id, status) => {
    try { await API.put(`/projects/${id}/status`, { status }); toast.success(`Marked as ${status}`); load(); }
    catch { toast.error('Update failed'); }
  };

  const filtered = projects.filter(p => {
    const match = p.title?.toLowerCase().includes(search.toLowerCase()) || p.student?.name?.toLowerCase().includes(search.toLowerCase());
    return match && (statusFilter==='all' || p.status===statusFilter);
  });

  const statusColor = s => ({ Approved:'badge-green', Completed:'badge-green', Submitted:'badge-blue', Rejected:'badge-red', 'In Progress':'badge-purple', Pending:'badge-yellow' }[s]||'badge-gray');

  return (
    <div>
      {feedbackModal && <FeedbackModal project={feedbackModal} onClose={() => setFeedbackModal(null)} onSaved={load} />}
      {progressModal && <ProgressModal project={progressModal} onClose={() => setProgressModal(null)} onSaved={load} />}

      <div className="flex-between mb-5">
        <div style={{ display:'flex', gap:10 }}>
          <div className="search-bar"><Search size={15} color="var(--mid)"/><input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}/></div>
          <select className="form-select" style={{ width:160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {['Pending','Approved','In Progress','Submitted','Completed','Rejected'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <span style={{ fontSize:'0.84rem', color:'var(--mid)' }}>{filtered.length} project(s)</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="section-loader"><div className="spinner spinner-dark" style={{ width:24,height:24 }}/></div>
          : filtered.length===0 ? <div className="empty-state"><FolderOpen size={36}/><h3>No projects found</h3></div>
          : <table>
              <thead><tr><th>Student</th><th>Project Title</th><th>Category</th><th>Deadline</th><th>Progress</th><th>Submissions</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td><div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="avatar avatar-sm" style={{ background:'#dbeafe', color:'#1d4ed8' }}>{p.student?.name?.[0]}</div>
                      <div><div style={{ fontWeight:600, fontSize:'0.84rem' }}>{p.student?.name}</div><div style={{ fontSize:'0.72rem', color:'var(--mid)' }}>{p.student?.email}</div></div>
                    </div></td>
                    <td style={{ maxWidth:160 }}><div style={{ fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div></td>
                    <td><span className="badge badge-gray" style={{ fontSize:'0.7rem' }}>{p.category}</span></td>
                    <td style={{ fontSize:'0.8rem', color:'var(--mid)', whiteSpace:'nowrap' }}>{p.deadline?new Date(p.deadline).toLocaleDateString():'—'}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div className="progress-bar" style={{ flex:1, minWidth:55 }}><div className="progress-fill" style={{ width:`${p.progress||0}%` }}/></div>
                        <span style={{ fontSize:'0.73rem', color:'var(--mid)' }}>{p.progress||0}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{p.submissions?.length||0} file(s)</span></td>
                    <td><span className={`badge ${statusColor(p.status)}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-ghost btn-sm" title="Update Status & Progress" onClick={() => setProgressModal(p)}><SlidersHorizontal size={13}/></button>
                        {p.status!=='Approved' && <button className="btn btn-success btn-sm" title="Approve" onClick={() => quickStatus(p._id,'Approved')}><CheckCircle size={13}/></button>}
                        {p.status!=='Rejected' && <button className="btn btn-danger btn-sm" title="Reject" onClick={() => quickStatus(p._id,'Rejected')}><XCircle size={13}/></button>}
                        <button className="btn btn-primary btn-sm" title="Feedback" onClick={() => setFeedbackModal(p)}><MessageSquare size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>
    </div>
  );
}
