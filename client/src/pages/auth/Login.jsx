import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Mail, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'Student' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.role);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'Admin') nav('/admin');
      else if (user.role === 'Teacher') nav('/teacher');
      else nav('/student');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email, password or role');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">
            <BookOpen size={24} color="white" />
          </div>
          <h1>Student Management System</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Select Role</label>
            <select name="role" className="form-select" value={form.role} onChange={h}>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <Mail size={15} className="input-icon" />
              <input name="email" type="email" className="form-input"
                placeholder="you@example.com" value={form.email} onChange={h}
                autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input name="password" type={show ? 'text' : 'password'} className="form-input"
                placeholder="••••••••" value={form.password} onChange={h}
                autoComplete="current-password" />
              <button type="button" className="input-eye" onClick={() => setShow(s => !s)}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--mid)' }}>
          Don't have an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
