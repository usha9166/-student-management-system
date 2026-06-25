import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Users, Search } from 'lucide-react';

export function TeacherStudents() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/projects/supervised').then(({ data }) => setProjects(data.projects||[])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => p.student?.name?.toLowerCase().includes(search.toLowerCase()) || p.student?.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex-between mb-5">
        <div className="search-bar"><Search size={15} color="var(--mid)"/><input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}/></div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">My Students <span style={{ color:'var(--mid)', fontWeight:400 }}>({filtered.length})</span></span></div>
        <div className="table-wrap">
          {loading ? <div className="section-loader"><div className="spinner spinner-dark" style={{ width:24,height:24 }}/></div>
          : filtered.length===0 ? <div className="empty-state"><Users size={36}/><h3>No students assigned yet</h3></div>
          : <table>
              <thead><tr><th>Student</th><th>Project</th><th>Category</th><th>Progress</th><th>Submissions</th><th>Status</th><th>Deadline</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td><div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div className="avatar avatar-sm" style={{ background:'#dbeafe', color:'#1d4ed8' }}>{p.student?.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{ fontWeight:600 }}>{p.student?.name}</div><div style={{ fontSize:'0.74rem', color:'var(--mid)' }}>{p.student?.email}</div></div>
                    </div></td>
                    <td style={{ fontSize:'0.84rem', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title||'—'}</td>
                    <td><span className="badge badge-gray" style={{ fontSize:'0.7rem' }}>{p.category||'—'}</span></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div className="progress-bar" style={{ flex:1, minWidth:55 }}><div className="progress-fill" style={{ width:`${p.progress||0}%` }}/></div>
                        <span style={{ fontSize:'0.73rem', color:'var(--mid)' }}>{p.progress||0}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{p.submissions?.length||0} file(s)</span></td>
                    <td><span className={`badge ${p.status==='Approved'||p.status==='Completed'?'badge-green':p.status==='Submitted'?'badge-blue':p.status==='Rejected'?'badge-red':'badge-yellow'}`}>{p.status}</span></td>
                    <td style={{ fontSize:'0.8rem', color:'var(--mid)', whiteSpace:'nowrap' }}>{p.deadline?new Date(p.deadline).toLocaleDateString():'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>
    </div>
  );
}

export default TeacherStudents;
