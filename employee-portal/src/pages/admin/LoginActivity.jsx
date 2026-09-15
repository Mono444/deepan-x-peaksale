import { useState, useEffect } from 'react';
import * as activityService from '../../services/activityService';
import * as employeeService from '../../services/employeeService';
import { formatDate, formatTime, exportToCSV, getTodayISO } from '../../lib/utils';
import { Activity, Download, Shield } from 'lucide-react';

export default function LoginActivity() {
  const [logins, setLogins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    date: '',
    status: '',
    role: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadActivity();
  }, [filters]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadActivity = async () => {
    setLoading(true);
    try {
      const data = await activityService.getLoginActivity({
        userId: filters.userId || undefined,
        date: filters.date || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
      });
      setLogins(data || []);
    } catch (err) {
      console.error('Load activity error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = logins.map(l => ({
      Employee_ID: l.employee_id || '',
      Role: l.role || '',
      Login_Time: l.login_time ? new Date(l.login_time).toLocaleString() : '',
      Logout_Time: l.logout_time ? new Date(l.logout_time).toLocaleString() : '',
      Status: l.status,
    }));
    exportToCSV(exportData, 'login_activity');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1>Login Activity</h1>
          <p>Track employee and admin login history</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={logins.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-input"
          value={filters.userId}
          onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
          style={{ maxWidth: '240px' }}
        >
          <option value="">All Users</option>
          {employees.map(emp => (
            <option key={emp.user_id} value={emp.user_id}>
              {emp.first_name} {emp.last_name} ({emp.employee_id})
            </option>
          ))}
        </select>
        <input
          type="date"
          className="form-input"
          value={filters.date}
          onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          style={{ maxWidth: '180px' }}
        />
        <select
          className="form-input"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          style={{ maxWidth: '140px' }}
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <select
          className="form-input"
          value={filters.role}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          style={{ maxWidth: '140px' }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ userId: '', date: '', status: '', role: '' })}>
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }}></div>
        </div>
      ) : logins.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Activity size={32} /></div>
            <h3>No activity found</h3>
            <p>No login records match your filters</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logins.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 'var(--font-medium)' }}>
                    {l.employee_id || '—'}
                  </td>
                  <td>
                    <span className={`badge ${l.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>
                      {l.role === 'admin' && <Shield size={10} style={{ marginRight: 4 }} />}
                      {l.role || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>
                    {formatDate(l.login_time, 'short')} {formatTime(l.login_time)}
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: l.logout_time ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {l.logout_time ? formatTime(l.logout_time) : '—'}
                  </td>
                  <td>
                    <span className={`badge badge-dot ${l.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
