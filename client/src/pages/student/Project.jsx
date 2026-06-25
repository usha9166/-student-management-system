import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Upload, FileText, X, BookOpen, MessageSquare, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentProject() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [tab, setTab] = useState('details');

  const load = () => {
    setLoading(true);
    API.get('/projects/my')
      .then(({ data }) => setProject(data.project))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleFile = f => {
    if (!f) return;
    const allowed = ['.pdf','.doc','.docx','.zip','.rar','.pptx','.txt'];
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) return toast.error('File type not allowed. Use PDF, DOC, DOCX, ZIP, PPTX');
    if (f.size > 20*1024*1024) return toast.error('File too large. Max 20MB');
    setFile(f);
  };

  const upload = async () => {
    if (!file) return toast.error('Select a file first');
    if (!project) return toast.error('No project assigned');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (note) fd.append('note', note);
    try {
      await API.post(`/projects/${project._id}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File submitted successfully!');
      setFile(null); setNote('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const removeFile = async (subId) => {
    if (!confirm('Remove this submission?')) return;
    try {
      await API.delete(`/projects/${project._id}/submissions/${subId}`);
      toast.success('Submission removed'); load();
    } catch { toast.error('Failed to remove'); }
  };

  const statusColor = s => ({ Approved:'badge-green', Completed:'badge-green', Submitted:'badge-blue', Rejected:'badge-red', 'In Progress':'badge-purple', Pending:'badge-yellow' }[s]||'badge-gray');

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width:28,height:28 }} /></div>;

  if (!project) return (
    <div className="card"><div className="card-body">
      <div className="empty-state" style={{ padding:'60px 0' }}>
        <FileText size={48}/>
        <h3>No project assigned yet</h3>
        <p>Your admin will assign a project to you. Check back soon.</p>
      </div>
    </div></div>
  );

  return (
    <div>
      {/* Header card */}
      <div className="card mb-5">
        <div className="card-body" style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <div style={{ width:50, height:50, borderRadius:12, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <FileText size={24} color="#1d4ed8"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:4 }}>{project.title}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
              <span className="badge badge-gray">{project.category}</span>
              {(project.techStack||[]).map(t => <span key={t} className="badge badge-blue">{t}</span>)}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'0.75rem', color:'var(--mid)', marginBottom:2 }}>Progress</div>
            <div style={{ fontWeight:700, fontSize:'1.2rem', color:'var(--primary)' }}>{project.progress||0}%</div>
            <div className="progress-bar" style={{ width:120 }}><div className="progress-fill" style={{ width:`${project.progress||0}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['details','Project Details'],['guidelines','Faculty Guidelines'],['upload','Upload Files'],['submissions','Submissions'],['feedback','Feedback']].map(([v,l]) => (
          <button key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>
            {l}
            {v==='feedback' && project.feedback?.length > 0 && <span className="tab-count">{project.feedback.length}</span>}
            {v==='submissions' && project.submissions?.length > 0 && <span className="tab-count">{project.submissions.length}</span>}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab==='details' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Project Information</span></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Title', project.title],['Category', project.category],['Status', project.status],['Deadline', project.deadline ? new Date(project.deadline).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) : 'Not set']].map(([l,v]) => (
                <div key={l}>
                  <div className="meta-label">{l}</div>
                  {l==='Status' ? <span className={`badge ${statusColor(v)}`}>{v}</span> : <div style={{ fontSize:'0.88rem' }}>{v||'—'}</div>}
                </div>
              ))}
              {project.description && <div>
                <div className="meta-label">Description</div>
                <div style={{ fontSize:'0.86rem', color:'var(--dark-2)', lineHeight:1.7 }}>{project.description}</div>
              </div>}
              {(project.techStack||[]).length > 0 && <div>
                <div className="meta-label">Tech Stack</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:4 }}>
                  {project.techStack.map(t => <span key={t} className="badge badge-blue">{t}</span>)}
                </div>
              </div>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Supervisor</span></div>
            <div className="card-body">
              {project.supervisor ? (
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <div className="avatar avatar-lg" style={{ background:'#ede9fe', color:'#5b21b6' }}>{project.supervisor.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:3 }}>{project.supervisor.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--mid)', marginBottom:3 }}>{project.supervisor.email}</div>
                    {project.supervisor.department && <div style={{ fontSize:'0.8rem', color:'var(--mid)' }}>{project.supervisor.department}</div>}
                    <span className="badge badge-purple" style={{ marginTop:8 }}>Supervisor</span>
                  </div>
                </div>
              ) : <div className="empty-state" style={{ padding:'24px 0' }}><Clock size={28}/><h3>No supervisor assigned</h3></div>}
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Tab */}
      {tab==='guidelines' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Faculty Guidelines</span></div>
          <div className="card-body">
            {project.guidelines ? (
              <div style={{ fontSize:'0.9rem', lineHeight:1.9, color:'var(--dark-2)', whiteSpace:'pre-wrap', background:'var(--lighter)', padding:'20px', borderRadius:10, border:'1px solid var(--border)' }}>
                {project.guidelines}
              </div>
            ) : (
              <div className="empty-state" style={{ padding:'48px 0' }}>
                <BookOpen size={36}/>
                <h3>No guidelines provided yet</h3>
                <p>Your supervisor will add guidelines soon.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {tab==='upload' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Submit Project File</span></div>
          <div className="card-body">
            <div className={`upload-area ${drag?'dragover':''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('projFile').click()}>
              <input id="projFile" type="file" style={{ display:'none' }}
                accept=".pdf,.doc,.docx,.zip,.rar,.pptx,.txt"
                onChange={e => handleFile(e.target.files[0])} />
              <Upload size={32} color="var(--primary)" style={{ margin:'0 auto' }}/>
              <p style={{ fontWeight:600, marginTop:10 }}>Drag & drop or click to upload</p>
              <p style={{ fontSize:'0.78rem', marginTop:4, color:'var(--mid)' }}>PDF, DOC, DOCX, PPTX, ZIP — max 20MB</p>
            </div>

            {file && (
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--lighter)', borderRadius:9, border:'1.5px solid var(--primary)', marginTop:14 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <FileText size={18} color="#1d4ed8"/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{file.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--mid)' }}>{(file.size/1024).toFixed(1)} KB</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setFile(null)}><X size={14}/></button>
              </div>
            )}

            <div className="form-group mt-4">
              <label className="form-label">Note / Comment (optional)</label>
              <textarea className="form-textarea" rows={3} placeholder="Any notes about this submission..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <button className="btn btn-primary" onClick={upload} disabled={!file || uploading}>
              {uploading ? <><span className="spinner"/> Uploading...</> : <><Upload size={15}/> Submit File</>}
            </button>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {tab==='submissions' && (
        <div className="card">
          <div className="card-header"><span className="card-title">My Submissions ({project.submissions?.length||0})</span></div>
          <div className="table-wrap">
            {!project.submissions?.length ? (
              <div className="empty-state"><Upload size={36}/><h3>No submissions yet</h3><p>Go to "Upload Files" tab to submit your work.</p></div>
            ) : (
              <table>
                <thead><tr><th>File Name</th><th>Size</th><th>Note</th><th>Submitted</th><th>Action</th></tr></thead>
                <tbody>
                  {[...project.submissions].reverse().map(s => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <div style={{ width:32, height:32, borderRadius:7, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <FileText size={14} color="#1d4ed8"/>
                          </div>
                          <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{s.fileName}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:'0.82rem', color:'var(--mid)' }}>{s.fileSize}</td>
                      <td style={{ fontSize:'0.82rem', maxWidth:200 }}>{s.note||'—'}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--mid)', whiteSpace:'nowrap' }}>{new Date(s.submittedAt).toLocaleString()}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeFile(s._id)} title="Remove">
                          <X size={13} color="var(--danger)"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {tab==='feedback' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Feedback from Supervisor ({project.feedback?.length||0})</span></div>
          <div className="card-body">
            {!project.feedback?.length ? (
              <div className="empty-state" style={{ padding:'48px 0' }}><MessageSquare size={36}/><h3>No feedback yet</h3><p>Your supervisor will add feedback after reviewing your work.</p></div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[...project.feedback].reverse().map((f,i) => (
                  <div key={i} style={{ background:'var(--lighter)', borderRadius:10, padding:'16px', borderLeft:'3px solid var(--primary)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <div className="avatar avatar-sm" style={{ background:'#ede9fe', color:'#5b21b6' }}>{f.fromName?.[0]||'T'}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{f.fromName||'Supervisor'}</div>
                        <div style={{ fontSize:'0.73rem', color:'var(--mid)' }}>{new Date(f.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <p style={{ fontSize:'0.88rem', color:'var(--dark-2)', lineHeight:1.7 }}>{f.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
