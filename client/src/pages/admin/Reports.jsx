import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { BarChart3 } from 'lucide-react';

const PIE_COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#06b6d4','#ef4444'];

export default function AdminReports() {
  const [data, setData] = useState({ students:[], teachers:[], projects:[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s,t,p] = await Promise.all([API.get('/projects/users?role=Student'), API.get('/projects/users?role=Teacher'), API.get('/projects/all')]);
        setData({ students: s.data.users||[], teachers: t.data.users||[], projects: p.data.projects||[] });
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const { students, teachers, projects } = data;

  const statusCounts = {};
  projects.forEach(p => { statusCounts[p.status] = (statusCounts[p.status]||0)+1; });
  const pieData = Object.entries(statusCounts).map(([name,value]) => ({ name, value }));

  const catCounts = {};
  projects.forEach(p => { catCounts[p.category||'Other'] = (catCounts[p.category||'Other']||0)+1; });
  const catData = Object.entries(catCounts).map(([name,count]) => ({ name: name.split('/')[0], count }));

  const teacherLoad = teachers.map(t => ({
    name: t.name?.split(' ')[0],
    projects: projects.filter(p => p.supervisor?._id === t._id || p.supervisor === t._id).length,
    capacity: t.maxStudents||10,
  }));

  // Monthly submission trend (last 6 months)
  const months = [];
  for (let i=5; i>=0; i--) {
    const d = new Date(); d.setMonth(d.getMonth()-i);
    const label = d.toLocaleString('default',{month:'short'});
    const count = projects.filter(p => {
      const pd = new Date(p.updatedAt);
      return pd.getMonth()===d.getMonth() && pd.getFullYear()===d.getFullYear();
    }).length;
    months.push({ month: label, projects: count });
  }

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width:28,height:28 }} /></div>;

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom:20 }}>
        {[
          { label:'Total Students', val:students.length, color:'#1d4ed8' },
          { label:'Total Teachers', val:teachers.length, color:'#5b21b6' },
          { label:'Total Projects', val:projects.length, color:'#065f46' },
          { label:'Completed', val:projects.filter(p=>p.status==='Completed').length, color:'#059669' },
          { label:'Submitted', val:projects.filter(p=>p.status==='Submitted').length, color:'#2563eb' },
          { label:'Pending', val:projects.filter(p=>p.status==='Pending').length, color:'#d97706' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-value" style={{ color:s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header"><span className="card-title">Project Status</span></div>
          <div className="card-body">
            {pieData.length===0 ? <div className="empty-state" style={{padding:'20px 0'}}><BarChart3 size={28}/><h3>No projects yet</h3></div> :
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
              </Pie><Legend iconSize={10} wrapperStyle={{fontSize:'11px'}}/><Tooltip /></PieChart>
            </ResponsiveContainer>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Projects by Category</span></div>
          <div className="card-body">
            {catData.length===0 ? <div className="empty-state" style={{padding:'20px 0'}}><BarChart3 size={28}/><h3>No data yet</h3></div> :
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/><Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} name="Projects"/>
              </BarChart>
            </ResponsiveContainer>}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Teacher Workload</span></div>
          <div className="card-body">
            {teacherLoad.length===0 ? <div className="empty-state" style={{padding:'20px 0'}}><BarChart3 size={28}/><h3>No teachers yet</h3></div> :
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teacherLoad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/><Legend iconSize={10} wrapperStyle={{fontSize:'11px'}}/>
                <Bar dataKey="projects" fill="#2563eb" radius={[4,4,0,0]} name="Projects"/>
                <Bar dataKey="capacity" fill="#e5e7eb" radius={[4,4,0,0]} name="Capacity"/>
              </BarChart>
            </ResponsiveContainer>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Activity (Last 6 Months)</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="month" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/><Line type="monotone" dataKey="projects" stroke="#2563eb" strokeWidth={2} dot={{r:4}} name="Updates"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
