import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { MessageSquare, Send, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function FeedbackModal({ project, onClose, onSaved }) {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!msg.trim()) return toast.error('Enter a feedback message');
    setLoading(true);
    try {
      await API.post(`/projects/${project._id}/feedback`, { message: msg });
      toast.success('Feedback sent!'); setMsg(''); onSaved(); onClose();
    } catch { toast.error('Failed to send'); }
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
            <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{project.student?.name}</div>
            <div style={{ fontSize:'0.77rem', color:'var(--mid)' }}>{project.title}</div>
          </div>
          {project.feedback?.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--mid)', textTransform:'uppercase', marginBottom:8 }}>Feedback History ({project.feedback.length})</div>
              <div style={{ maxHeight:150, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
                {[...project.feedback].reverse().map((f,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--border)', borderRadius:7, padding:'9px 12px' }}>
                    <div style={{ fontSize:'0.72rem', color:'var(--mid)', marginBottom:3 }}>{new Date(f.createdAt).toLocaleString()}</div>
                    <div style={{ fontSize:'0.84rem', color:'var(--dark-2)' }}>{f.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">New Feedback Message</label>
            <textarea className="form-textarea" rows={4} placeholder="Write detailed feedback for the student..." value={msg} onChange={e => setMsg(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={send} disabled={loading}>
            {loading ? <span className="spinner"/> : <Send size={14}/>}
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherFeedback() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [totalSent, setTotalSent] = useState(0);

  const load = async () => {
    try { const { data } = await API.get('/projects/supervised'); setProjects(data.projects||[]); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setTotalSent(projects.reduce((acc,p) => acc+(p.feedback?.length||0),0));
  }, [projects]);

  return (
    <div>
      {selected && <FeedbackModal project={selected} onClose={() => setSelected(null)} onSaved={load} />}

      {totalSent > 0 && (
        <div className="alert alert-success mb-4">
          <CheckCircle size={16}/> You have sent {totalSent} feedback message(s) total across all projects.
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">Send Feedback to Students</span></div>
        <div className="table-wrap">
          {loading ? <div className="section-loader"><div className="spinner spinner-dark" style={{ width:24,height:24 }}/></div>
          : projects.length===0 ? <div className="empty-state"><MessageSquare size={36}/><h3>No students assigned yet</h3></div>
          : <table>
              <thead><tr><th>Student</th><th>Project</th><th>Status</th><th>Feedback Sent</th><th>Last Feedback</th><th>Action</th></tr></thead>
              <tbody>
                {projects.map(p => {
                  const lastFb = p.feedback?.[p.feedback.length-1];
                  return (
                    <tr key={p._id}>
                      <td><div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div className="avatar avatar-sm" style={{ background:'#dbeafe', color:'#1d4ed8' }}>{p.student?.name?.[0]?.toUpperCase()}</div>
                        <div><div style={{ fontWeight:600 }}>{p.student?.name}</div><div style={{ fontSize:'0.74rem', color:'var(--mid)' }}>{p.student?.email}</div></div>
                      </div></td>
                      <td style={{ fontSize:'0.84rem', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</td>
                      <td><span className={`badge ${p.status==='Approved'?'badge-green':p.status==='Submitted'?'badge-blue':p.status==='Rejected'?'badge-red':'badge-yellow'}`}>{p.status}</span></td>
                      <td><span className="badge badge-purple">{p.feedback?.length||0} message(s)</span></td>
                      <td style={{ fontSize:'0.8rem', color:'var(--mid)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {lastFb ? `"${lastFb.message.substring(0,40)}${lastFb.message.length>40?'...':''}"` : '—'}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelected(p)}>
                          <MessageSquare size={13}/> Send Feedback
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>}
        </div>
      </div>
    </div>
  );
}
