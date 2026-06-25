import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { BookOpen, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email address');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/password/forgot', { email });
      setSent(true);
      toast.success(data.message || 'Reset link sent!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">
            <BookOpen size={24} color="white" />
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={28} color="#059669" />
            </div>
            <h1 style={{ marginBottom: 8 }}>Check your email</h1>
            <p style={{ color: 'var(--mid)', fontSize: '0.88rem', marginBottom: 24 }}>
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" className="btn btn-primary btn-block">Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h1>Forgot Password</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrap">
                  <Mail size={15} className="input-icon" />
                  <input type="email" className="form-input" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
