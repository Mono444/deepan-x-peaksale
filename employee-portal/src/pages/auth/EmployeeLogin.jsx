import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Building2, IdCard, Lock, ArrowRight } from 'lucide-react';

export default function EmployeeLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginEmployee } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!employeeId.trim()) {
      setError('Please enter your Employee ID');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const result = await loginEmployee(employeeId.trim(), password);
      if (result.success) {
        toast.success('Login successful! Welcome back.');
        navigate('/employee/dashboard', { replace: true });
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
    <div className="login-page">
      <div className="login-card animate-fade-in-up">
        <div className="logo-section">
          <div className="logo-icon">
            <Building2 />
          </div>
          <h1>Employee Portal</h1>
          <p className="subtitle">Sign in with your Employee ID to continue</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="employee-id">
              <IdCard size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Employee ID
            </label>
            <input
              id="employee-id"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP001"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password">
              <Lock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={`login-btn ${loading ? 'btn-loading' : ''}`} disabled={loading}>
            {!loading && <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/admin/login">Admin Login →</Link>
        </div>
      </div>
    </div>
  );
}
