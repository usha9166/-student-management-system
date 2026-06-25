import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { UserPlus, Search, X, Mail, Lock, User, Building, Users } from 'lucide-react';
import toast from 'react-hot-toast';

function AddModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', maxStudents: '10' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault(); setErr('');
    if (!form.name || !form.email || !form.password) return setErr('All fields marked * are required');
    if (form.password.length < 8) return setErr('Password must be at least 8 characters');
    setLoading(true);
    try {
      await API.post('/auth/register', { ...form, role: 'Teacher', maxStudents: Number(form.maxStudents) });
      toast.success('Teacher account created!'); onAdded(); onClose();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed to create teacher'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add New Teacher</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {err && <div className="alert alert-error">{err}</div>}
            {[['name','Full Name *','text',User,'Teacher full name'],['email','Email *','email',Mail,'teacher@university.edu'],['password','Password * (min 8)','password',Lock,'Min 8 characters'],['department','Department','text',Building,'e.g. Computer Science']].map(([n,l,t,Icon,ph]) => (
              <div className="form-group" key={n}>
                <label className="form-label">{l}</label>
                <div className="input-wrap"><Icon size={15} className="input-icon" /><input name={n} type={t} className="form-input" placeholder={ph} value={form[n]} onChange={e => setForm(f => ({...f,[n]:e.target.value}))} /></div>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Max Students Capacity</label>
              <input type="number" className="form-input" min="1" max="50" value={form.maxStudents} onChange={e => setForm(f => ({...f,maxStudents:e.target.value}))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <UserPlus size={14} />}{loading ? 'Creating...' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await API.get('/projects/users?role=Teacher'); setTeachers(data.users || []); }
    catch { setTeachers([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = teachers.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={load} />}
      <div className="flex-between mb-5">
        <div className="search-bar"><Search size={15} color="var(--mid)" /><input placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><UserPlus size={15} /> Add Teacher</button>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">All Teachers <span style={{ color: 'var(--mid)', fontWeight: 400 }}>({filtered.length})</span></span></div>
        <div className="table-wrap">
          {loading ? <div className="section-loader"><div className="spinner spinner-dark" style={{ width: 24, height: 24 }} /></div>
          : filtered.length === 0 ? <div className="empty-state"><Users size={36} /><h3>No teachers yet</h3><p>Click "Add Teacher" to create accounts.</p></div>
          : <table>
              <thead><tr><th>Teacher</th><th>Department</th><th>Expertise</th><th>Capacity</th><th>Joined</th></tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t._id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="avatar avatar-sm" style={{ background: '#ede9fe', color: '#5b21b6' }}>{t.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{ fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: '0.74rem', color: 'var(--mid)' }}>{t.email}</div></div>
                    </div></td>
                    <td>{t.department || '—'}</td>
                    <td>{(t.expertise || []).length > 0 ? t.expertise.slice(0,2).map(e => <span key={e} className="badge badge-gray" style={{ marginRight: 4 }}>{e}</span>) : '—'}</td>
                    <td><span className="badge badge-blue">{(t.assignedStudents||[]).length}/{t.maxStudents||10}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--mid)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>
    </div>
  );
}
