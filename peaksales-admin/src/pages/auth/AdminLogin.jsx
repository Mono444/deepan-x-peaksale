import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const result = await loginAdmin(email.trim(), password);
      if (result.success) {
        toast.success('Welcome, Administrator!');
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #581c87 70%, #312e81 100%)'
    }}>
      <div className="login-card animate-fade-in-up">
        <div className="logo-section">
          <div className="logo-icon" style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)'
          }}>
            <Shield />
          </div>
          <h1>Admin Portal</h1>
          <p className="subtitle">Authorized administrators only</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="admin-email">
              <Mail size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@peaksales.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="admin-password">
              <Lock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={`login-btn ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {!loading && <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/employee/login">← Employee Login</Link>
        </div>
      </div>
    </div>
  );
}
