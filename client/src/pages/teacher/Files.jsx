import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { FileText, Download, Search, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';

const EXT_STYLE = {
  PDF:  { bg:'#fee2e2', color:'#b91c1c' },
  DOCX: { bg:'#dbeafe', color:'#1d4ed8' },
  DOC:  { bg:'#dbeafe', color:'#1d4ed8' },
  ZIP:  { bg:'#fef3c7', color:'#92400e' },
  PPTX: { bg:'#ffedd5', color:'#9a3412' },
  TXT:  { bg:'#f3f4f6', color:'#374151' },
  default: { bg:'#ede9fe', color:'#5b21b6' },
};

const getExt = name => (name?.split('.').pop()?.toUpperCase()) || '';
const getStyle = name => EXT_STYLE[getExt(name)] || EXT_STYLE.default;

const typeOf = name => {
  const ext = getExt(name);
  if (['PDF','DOC','DOCX','TXT'].includes(ext)) return 'Reports';
  if (['PPTX','PPT'].includes(ext)) return 'Presentations';
  if (['JS','PY','JAVA','ZIP','RAR'].includes(ext)) return 'Code Files';
  if (['PNG','JPG','JPEG','GIF'].includes(ext)) return 'Images';
  return 'Reports';
};

export default function TeacherFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Files');
  const [view, setView] = useState('grid');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    API.get('/projects/teacher/files')
      .then(({ data }) => setFiles(data.files||[]))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (file) => {
    setDownloading(file._id);
    try {
      const res = await API.get(`/projects/download/${file.projectId}/${file._id}`, { responseType:'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href=url; a.download=file.fileName; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded: ${file.fileName}`);
    } catch {
      toast.error('Download failed. File may have been removed.');
    } finally { setDownloading(''); }
  };

  const types = ['All Files','Reports','Presentations','Code Files','Images'];
  const counts = {
    'Total Files': files.length,
    Reports: files.filter(f=>typeOf(f.fileName)==='Reports').length,
    Presentations: files.filter(f=>typeOf(f.fileName)==='Presentations').length,
    'Code Files': files.filter(f=>typeOf(f.fileName)==='Code Files').length,
    Images: files.filter(f=>typeOf(f.fileName)==='Images').length,
  };

  const statColors = ['var(--primary)','#059669','#d97706','#b91c1c','#7c3aed'];

  const filtered = files.filter(f => {
    const matchSearch = f.fileName?.toLowerCase().includes(search.toLowerCase()) || f.studentName?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter==='All Files' || typeOf(f.fileName)===typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <div className="section-loader"><div className="spinner spinner-dark" style={{ width:28,height:28 }}/></div>;

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        {Object.entries(counts).map(([label,val],i) => (
          <div key={label} className="stat-card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--mid)', marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:statColors[i] }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex-between mb-5">
        <div style={{ display:'flex', gap:10 }}>
          <select className="form-select" style={{ width:160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="search-bar" style={{ maxWidth:260 }}>
            <Search size={14} color="var(--mid)"/>
            <input placeholder="Search files or students..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button className={`btn btn-sm ${view==='grid'?'btn-light':'btn-ghost'}`} onClick={() => setView('grid')}><LayoutGrid size={15}/></button>
          <button className={`btn btn-sm ${view==='list'?'btn-light':'btn-ghost'}`} onClick={() => setView('list')}><List size={15}/></button>
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="empty-state" style={{ marginTop:60 }}>
          <FileText size={40}/>
          <h3>No files yet</h3>
          <p>Files submitted by your students will appear here.</p>
        </div>
      ) : view==='grid' ? (
        <div className="grid-files">
          {filtered.map((f,i) => {
            const { bg, color } = getStyle(f.fileName);
            return (
              <div key={i} className="file-card">
                <div className="file-card-icon" style={{ background:bg }}>
                  <FileText size={24} color={color}/>
                </div>
                <div className="file-card-name">{f.fileName}</div>
                <div className="file-card-meta">
                  <div style={{ fontWeight:600 }}>{f.studentName}</div>
                  <div>{f.fileSize} • {new Date(f.submittedAt).toLocaleDateString()}</div>
                  {f.note && <div style={{ marginTop:3, color:'var(--dark-3)', fontSize:'0.72rem' }}>"{f.note}"</div>}
                </div>
                <button className="btn btn-primary btn-block btn-sm" onClick={() => handleDownload(f)} disabled={downloading===f._id}>
                  {downloading===f._id ? <span className="spinner"/> : <Download size={13}/>}
                  {downloading===f._id ? 'Downloading...' : 'Download'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>File</th><th>Student</th><th>Project</th><th>Size</th><th>Note</th><th>Submitted</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map((f,i) => {
                  const { bg, color } = getStyle(f.fileName);
                  return (
                    <tr key={i}>
                      <td><div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:32, height:32, borderRadius:7, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <FileText size={15} color={color}/>
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.84rem' }}>{f.fileName}</div>
                          <span className="badge badge-gray" style={{ fontSize:'0.68rem' }}>{getExt(f.fileName)}</span>
                        </div>
                      </div></td>
                      <td><div style={{ fontSize:'0.84rem', fontWeight:600 }}>{f.studentName}<div style={{ fontSize:'0.73rem', color:'var(--mid)' }}>{f.studentEmail}</div></div></td>
                      <td style={{ fontSize:'0.82rem', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.projectTitle}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--mid)' }}>{f.fileSize}</td>
                      <td style={{ fontSize:'0.8rem', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.note||'—'}</td>
                      <td style={{ fontSize:'0.78rem', color:'var(--mid)', whiteSpace:'nowrap' }}>{new Date(f.submittedAt).toLocaleString()}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => handleDownload(f)} disabled={downloading===f._id}>
                          {downloading===f._id ? <span className="spinner"/> : <Download size={13}/>}
                          {downloading===f._id ? '...' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
