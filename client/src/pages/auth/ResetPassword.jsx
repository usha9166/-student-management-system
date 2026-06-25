import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import { BookOpen, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const nav = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [show, setShow] = useState({ p: false, c: false });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await API.put(`/auth/password/reset/${token}`, form);
      toast.success('Password reset successfully!');
      nav('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', marginBottom: 16 }}>Invalid or missing reset token.</p>
        <Link to="/login" className="btn btn-primary">Back to Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon"><BookOpen size={24} color="white" /></div>
        </div>
        <h1>Set New Password</h1>
        <p className="auth-subtitle">Choose a strong password for your account</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input type={show.p ? 'text' : 'password'} className="form-input"
                placeholder="Min 8 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <button type="button" className="input-eye" onClick={() => setShow(s => ({ ...s, p: !s.p }))}>
                {show.p ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input type={show.c ? 'text' : 'password'} className="form-input"
                placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
              <button type="button" className="input-eye" onClick={() => setShow(s => ({ ...s, c: !s.c }))}>
                {show.c ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
