import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Bell, MessageSquare, CheckCircle, Info, AlertCircle } from 'lucide-react';

export default function StudentNotifications() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/projects/my').then(({ data }) => setProject(data.project)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width:24,height:24 }} /></div>;

  const feedback = project?.feedback || [];
  const systemNotifs = [];
  if (project) {
    systemNotifs.push({ type:'success', message:`Project assigned: "${project.title}"`, time: new Date(project.createdAt).toLocaleString() });
    if (project.supervisor) systemNotifs.push({ type:'info', message:`Supervisor assigned: ${project.supervisor.name}`, time: new Date(project.updatedAt).toLocaleString() });
    if (project.status==='Approved') systemNotifs.push({ type:'success', message:'Your project has been approved by your supervisor!', time: new Date(project.updatedAt).toLocaleString() });
    if (project.status==='Rejected') systemNotifs.push({ type:'error', message:'Your project was rejected. Check feedback for details.', time: new Date(project.updatedAt).toLocaleString() });
    if (project.submissions?.length) systemNotifs.push({ type:'info', message:`You have ${project.submissions.length} submission(s) on record.`, time: new Date(project.submissions.at(-1)?.submittedAt).toLocaleString() });
  } else {
    systemNotifs.push({ type:'info', message:'Welcome to Student Management System! No project assigned yet.', time: new Date().toLocaleString() });
  }

  const iconMap = { success:{ Icon:CheckCircle, c:'#059669', bg:'#d1fae5' }, info:{ Icon:Info, c:'#2563eb', bg:'#dbeafe' }, error:{ Icon:AlertCircle, c:'#ef4444', bg:'#fee2e2' }, warning:{ Icon:AlertCircle, c:'#d97706', bg:'#fef3c7' } };

  return (
    <div>
      {feedback.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--mid)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
            Feedback from Supervisor ({feedback.length})
          </div>
          {[...feedback].reverse().map((f,i) => (
            <div key={i} className="card" style={{ marginBottom:8, borderLeft:'3px solid var(--primary)' }}>
              <div className="card-body" style={{ display:'flex', gap:12 }}>
                <div className="avatar avatar-sm" style={{ background:'#ede9fe', color:'#5b21b6', flexShrink:0 }}>{f.fromName?.[0]||'T'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                    <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{f.fromName||'Supervisor'}</span>
                    <span className="badge badge-purple">Feedback</span>
                  </div>
                  <p style={{ fontSize:'0.87rem', color:'var(--dark-2)', lineHeight:1.6 }}>{f.message}</p>
                  <div style={{ fontSize:'0.73rem', color:'var(--mid)', marginTop:6 }}>{new Date(f.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--mid)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
          System Notifications
        </div>
        {systemNotifs.map((n,i) => {
          const { Icon, c, bg } = iconMap[n.type]||iconMap.info;
          return (
            <div key={i} className="card" style={{ marginBottom:8, borderLeft:`3px solid ${c}` }}>
              <div className="card-body" style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:34, height:34, borderRadius:8, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={16} color={c}/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'0.87rem', marginBottom:4 }}>{n.message}</p>
                  <span style={{ fontSize:'0.73rem', color:'var(--mid)' }}>{n.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
