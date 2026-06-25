import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, Clock, Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK = [
  { id:'a1', title:'Project Proposal', description:'Submit your final year project proposal document with objectives, scope and methodology.', dueDate:'2026-03-01', status:'Pending', priority:'High' },
  { id:'a2', title:'Literature Review', description:'Submit a comprehensive literature review covering at least 15 related works.', dueDate:'2026-04-01', status:'Pending', priority:'Medium' },
  { id:'a3', title:'SRS Document', description:'Software Requirements Specification — functional and non-functional requirements.', dueDate:'2026-04-20', status:'Pending', priority:'High' },
  { id:'a4', title:'Implementation Phase 1', description:'Submit code and report for Phase 1 of your project implementation.', dueDate:'2026-05-10', status:'Pending', priority:'Medium' },
  { id:'a5', title:'Final Project Submission', description:'Complete project with documentation, source code, and presentation slides.', dueDate:'2026-06-30', status:'Pending', priority:'High' },
];

function SubmitModal({ assignment, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');

  const submit = () => {
    onSubmit(assignment.id, file?.name||null, note);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Submit Assignment</span>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div style={{ background:'var(--lighter)', borderRadius:8, padding:'10px 14px', marginBottom:14 }}>
            <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{assignment?.title}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--mid)', marginTop:2 }}>Due: {new Date(assignment?.dueDate).toLocaleDateString()}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Upload File</label>
            <input type="file" className="form-input" accept=".pdf,.doc,.docx,.zip,.pptx" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label className="form-label">Note / Comment</label>
            <textarea className="form-textarea" rows={3} placeholder="Any notes for your supervisor..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}><Upload size={14}/> Submit</button>
        </div>
      </div>
    </div>
  );
}

export default function StudentAssignments() {
  const KEY = 'sms_assignments_v2';
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    setAssignments(saved ? JSON.parse(saved) : MOCK);
  }, []);

  const save = (data) => { setAssignments(data); localStorage.setItem(KEY, JSON.stringify(data)); };

  const handleSubmit = (id, fileName, note) => {
    const updated = assignments.map(a => a.id===id
      ? { ...a, status:'Submitted', fileName, note, submittedAt:new Date().toLocaleString() }
      : a);
    save(updated);
    toast.success('Assignment submitted!');
  };

  const filtered = assignments.filter(a => filter==='all' || a.status===filter);
  const counts = {
    all: assignments.length,
    Submitted: assignments.filter(a=>a.status==='Submitted').length,
    Pending: assignments.filter(a=>a.status==='Pending').length,
  };

  const daysLeft = (dueDate) => Math.ceil((new Date(dueDate)-new Date())/(1000*60*60*24));
  const priorityColor = p => ({ High:'badge-red', Medium:'badge-yellow', Low:'badge-gray' }[p]||'badge-gray');

  return (
    <div>
      {selected && <SubmitModal assignment={selected} onClose={() => setSelected(null)} onSubmit={handleSubmit} />}

      <div className="tabs">
        {[['all','All'],['Pending','Pending'],['Submitted','Submitted']].map(([v,l]) => (
          <button key={v} className={`tab ${filter===v?'active':''}`} onClick={() => setFilter(v)}>
            {l}<span className="tab-count">{counts[v]||0}</span>
          </button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div className="empty-state"><ClipboardList size={36}/><h3>No assignments</h3></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(a => {
            const dl = daysLeft(a.dueDate);
            return (
              <div key={a.id} className="card">
                <div className="card-body" style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background: a.status==='Submitted'?'#d1fae5':'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    {a.status==='Submitted' ? <CheckCircle size={19} color="#059669"/> : dl<0 ? <AlertCircle size={19} color="#ef4444"/> : <Clock size={19} color="#d97706"/>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700 }}>{a.title}</span>
                      <span className={`badge ${a.status==='Submitted'?'badge-green':'badge-yellow'}`}>{a.status}</span>
                      <span className={`badge ${priorityColor(a.priority)}`}>{a.priority}</span>
                    </div>
                    <p style={{ fontSize:'0.84rem', color:'var(--mid)', marginBottom:6, lineHeight:1.5 }}>{a.description}</p>
                    <div style={{ fontSize:'0.77rem', color:'var(--mid)', display:'flex', gap:14, flexWrap:'wrap' }}>
                      <span>Due: <strong style={{ color: dl<0?'var(--danger)':dl<=3?'#d97706':'var(--dark-3)' }}>
                        {new Date(a.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                        {a.status!=='Submitted' && dl>=0 && ` (${dl}d left)`}
                        {a.status!=='Submitted' && dl<0 && ` (Overdue)`}
                      </strong></span>
                      {a.submittedAt && <span>Submitted: <strong>{a.submittedAt}</strong></span>}
                      {a.fileName && <span>📎 {a.fileName}</span>}
                    </div>
                  </div>
                  <div style={{ flexShrink:0 }}>
                    {a.status!=='Submitted'
                      ? <button className="btn btn-primary btn-sm" onClick={() => setSelected(a)}><Upload size={13}/> Submit</button>
                      : <button className="btn btn-ghost btn-sm" disabled><CheckCircle size={13} color="var(--success)"/> Done</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
