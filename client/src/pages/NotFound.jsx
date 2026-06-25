import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();
  const home = user?.role === 'Admin' ? '/admin' : user?.role === 'Teacher' ? '/teacher' : '/student';
  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 14, background: 'var(--lighter)' }}>
      <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</div>
      <h2 style={{ color: 'var(--dark)', fontWeight: 700 }}>Page not found</h2>
      <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>The page you're looking for doesn't exist.</p>
      <Link to={user ? home : '/login'} className="btn btn-primary">
        <Home size={15} /> Go Home
      </Link>
    </div>
  );
}
