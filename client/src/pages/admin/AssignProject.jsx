import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { FolderOpen, Save, X, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Web Application', 'Mobile App', 'Desktop App', 'AI/ML', 'IoT', 'Cybersecurity', 'Data Science', 'Other'];
const TECH_OPTIONS = ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Django', 'Flutter', 'React Native', 'Vue.js', 'Angular', 'MySQL', 'PostgreSQL', 'Firebase', 'AWS', 'Docker'];

export default function AdminAssignProject() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [form, setForm] = useState({
    studentId: '', supervisorId: '', title: '', description: '',
    guidelines: '', techStack: [], category: 'Web Application', deadline: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t] = await Promise.all([API.get('/projects/users?role=Student'), API.get('/projects/users?role=Teacher')]);
        setStudents(s.data.users || []); setTeachers(t.data.users || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const addTech = (tech) => {
    if (!tech.trim()) return;
    if (!form.techStack.includes(tech)) setForm(f => ({ ...f, techStack: [...f.techStack, tech] }));
    setTechInput('');
  };

  const removeTech = (t) => setForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }));

  const submit = async e => {
    e.preventDefault();
    if (!form.studentId || !form.title) return toast.error('Student and project title are required');
    setSubmitting(true);
    try {
      await API.post('/projects/assign', form);
      toast.success('Project assigned successfully!');
      setForm({ studentId: '', supervisorId: '', title: '', description: '', guidelines: '', techStack: [], category: 'Web Application', deadline: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign project');
    } finally { setSubmitting(false); }
  };

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width: 28, height: 28 }} /></div>;

  return (
    <form onSubmit={submit}>
      <div className="grid-2 mb-5">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Assignment</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Assign to Student *</label>
                <select name="studentId" className="form-select" value={form.studentId} onChange={h} required>
                  <option value="">Select a student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.email}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assign Supervisor</label>
                <select name="supervisorId" className="form-select" value={form.supervisorId} onChange={h}>
                  <option value="">Select a supervisor...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} — {t.department || 'No dept'}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Project Info</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input name="title" type="text" className="form-input" placeholder="e.g. Smart Attendance System" value={form.title} onChange={h} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-select" value={form.category} onChange={h}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Submission Deadline</label>
                <input name="deadline" type="date" className="form-input" value={form.deadline} onChange={h} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tech Stack</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="text" className="form-input" placeholder="Add technology..." value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech(techInput))}
                    style={{ flex: 1 }} />
                  <button type="button" className="btn btn-light btn-sm" onClick={() => addTech(techInput)}>
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {TECH_OPTIONS.map(t => (
                    <button key={t} type="button" onClick={() => addTech(t)}
                      className={`btn btn-sm ${form.techStack.includes(t) ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '3px 10px', fontSize: '0.76rem' }}>{t}</button>
                  ))}
                </div>
                {form.techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {form.techStack.map(t => (
                      <span key={t} className="badge badge-blue" style={{ gap: 5 }}>
                        {t}
                        <button type="button" onClick={() => removeTech(t)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Project Description</span></div>
            <div className="card-body">
              <textarea name="description" className="form-textarea" style={{ minHeight: 120 }}
                placeholder="Describe the project objectives, scope and expected outcomes..."
                value={form.description} onChange={h} />
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-title">Faculty Guidelines</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--mid)' }}>Instructions for student</span>
            </div>
            <div className="card-body">
              <textarea name="guidelines" className="form-textarea" style={{ minHeight: 180 }}
                placeholder={`Write detailed faculty guidelines here, for example:\n\n1. Follow MVC architecture pattern\n2. Submit weekly progress reports\n3. Code must be well-documented\n4. Use Git for version control\n5. Final presentation on deadline date\n6. Include unit tests for all modules`}
                value={form.guidelines} onChange={h} />
              <p style={{ fontSize: '0.75rem', color: 'var(--mid)', marginTop: 8 }}>
                These guidelines will be visible to the assigned student on their dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '11px 28px', fontSize: '0.92rem' }}>
          {submitting ? <><span className="spinner" /> Assigning...</> : <><Save size={15} /> Assign Project</>}
        </button>
      </div>
    </form>
  );
}
