import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { FolderOpen, Search, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

function ProjectDetailModal({ project, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <span className="modal-title">{project.title}</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span className={`badge ${project.status === 'Approved' ? 'badge-green' : project.status === 'Submitted' ? 'badge-blue' : project.status === 'Rejected' ? 'badge-red' : project.status === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>{project.status}</span>
            <span className="badge badge-gray">{project.category}</span>
            {(project.techStack||[]).map(t => <span key={t} className="badge badge-blue">{t}</span>)}
          </div>
          {[['Student', project.student?.name], ['Supervisor', project.supervisor?.name || 'Not assigned'], ['Deadline', project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'], ['Progress', `${project.progress || 0}%`]].map(([l,v]) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: '0.88rem' }}>{v}</div>
            </div>
          ))}
          {project.description && <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase', marginBottom: 2 }}>Description</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--dark-2)', lineHeight: 1.6 }}>{project.description}</div>
          </div>}
          {project.guidelines && <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase', marginBottom: 2 }}>Faculty Guidelines</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--dark-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'var(--lighter)', padding: '10px 14px', borderRadius: 8 }}>{project.guidelines}</div>
          </div>}
          {project.feedback?.length > 0 && <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase', marginBottom: 8 }}>Feedback ({project.feedback.length})</div>
            {project.feedback.map((f, i) => (
              <div key={i} style={{ background: 'var(--lighter)', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>{f.fromName}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--dark-2)' }}>{f.message}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--mid)', marginTop: 4 }}>{new Date(f.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>}
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await API.get('/projects/all'); setProjects(data.projects || []); }
    catch { setProjects([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const del = async id => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try { await API.delete(`/projects/${id}`); toast.success('Project deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = projects.filter(p => {
    const match = p.title?.toLowerCase().includes(search.toLowerCase()) || p.student?.name?.toLowerCase().includes(search.toLowerCase());
    return match && (statusFilter === 'all' || p.status === statusFilter);
  });

  const statusColor = s => ({ Approved:'badge-green', Completed:'badge-green', Submitted:'badge-blue', Rejected:'badge-red', 'In Progress':'badge-purple', Pending:'badge-yellow' }[s] || 'badge-gray');

  return (
    <div>
      {selected && <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />}
      <div className="flex-between mb-5">
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-bar"><Search size={15} color="var(--mid)" /><input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {['Pending','Approved','In Progress','Submitted','Completed','Rejected'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <span style={{ fontSize: '0.84rem', color: 'var(--mid)' }}>{filtered.length} project(s)</span>
      </div>
      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="section-loader"><div className="spinner spinner-dark" style={{ width: 24, height: 24 }} /></div>
          : filtered.length === 0 ? <div className="empty-state"><FolderOpen size={36} /><h3>No projects found</h3></div>
          : <table>
              <thead><tr><th>Title</th><th>Student</th><th>Supervisor</th><th>Category</th><th>Deadline</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, maxWidth: 160 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{p.title}</span></td>
                    <td><div style={{ fontSize: '0.84rem' }}>{p.student?.name || '—'}<div style={{ fontSize: '0.73rem', color: 'var(--mid)' }}>{p.student?.email}</div></div></td>
                    <td style={{ fontSize: '0.84rem' }}>{p.supervisor?.name || <span className="text-mid">—</span>}</td>
                    <td><span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{p.category}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--mid)', whiteSpace: 'nowrap' }}>{p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-bar" style={{ flex: 1, minWidth: 60 }}><div className="progress-fill" style={{ width: `${p.progress||0}%` }} /></div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--mid)' }}>{p.progress||0}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${statusColor(p.status)}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(p)} title="View"><Eye size={13} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => del(p._id)} title="Delete"><Trash2 size={13} color="var(--danger)" /></button>
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
