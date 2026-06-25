import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { UserPlus, Search, X, Mail, Lock, User, Building, Trash2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

function AddModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault(); setErr('');
    if (!form.name || !form.email || !form.password) return setErr('All fields marked * are required');
    if (form.password.length < 8) return setErr('Password must be at least 8 characters');
    setLoading(true);
    try {
      await API.post('/auth/register', { ...form, role: 'Student' });
      toast.success('Student account created!'); onAdded(); onClose();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed to create student'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add New Student</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {err && <div className="alert alert-error">{err}</div>}
            {[['name','Full Name *','text',User,'Student full name'],['email','Email *','email',Mail,'student@university.edu'],['password','Password * (min 8)','password',Lock,'Min 8 characters'],['department','Department','text',Building,'e.g. Computer Science']].map(([n,l,t,Icon,ph]) => (
              <div className="form-group" key={n}>
                <label className="form-label">{l}</label>
                <div className="input-wrap">
                  <Icon size={15} className="input-icon" />
                  <input name={n} type={t} className="form-input" placeholder={ph} value={form[n]} onChange={e => setForm(f => ({ ...f, [n]: e.target.value }))} />
                </div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <UserPlus size={14} />}{loading ? 'Creating...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await API.get('/projects/users?role=Student'); setStudents(data.users || []); }
    catch { setStudents([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={load} />}
      <div className="flex-between mb-5">
        <div className="search-bar"><Search size={15} color="var(--mid)" /><input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><UserPlus size={15} /> Add Student</button>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">All Students <span style={{ color: 'var(--mid)', fontWeight: 400 }}>({filtered.length})</span></span></div>
        <div className="table-wrap">
          {loading ? <div className="section-loader"><div className="spinner spinner-dark" style={{ width: 24, height: 24 }} /></div>
          : filtered.length === 0 ? <div className="empty-state"><GraduationCap size={36} /><h3>No students yet</h3><p>Click "Add Student" to create accounts.</p></div>
          : <table>
              <thead><tr><th>Student</th><th>Department</th><th>Project</th><th>Supervisor</th><th>Joined</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="avatar avatar-sm" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{s.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: '0.74rem', color: 'var(--mid)' }}>{s.email}</div></div>
                    </div></td>
                    <td>{s.department || <span className="text-mid">—</span>}</td>
                    <td>{s.project ? <span className="badge badge-blue">Assigned</span> : <span className="badge badge-gray">None</span>}</td>
                    <td>{s.supervisor ? <span className="badge badge-purple">Assigned</span> : <span className="text-mid">—</span>}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--mid)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>
    </div>
  );
}
