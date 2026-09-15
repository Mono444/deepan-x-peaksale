import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import * as employeeService from '../../services/employeeService';
import { formatDate, getInitials } from '../../lib/utils';
import {
  Search, Plus, Eye, Edit, UserX, UserCheck, RotateCcw, Users
} from 'lucide-react';

export default function EmployeeList() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showResetModal, setShowResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadEmployees();
  }, [statusFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAllEmployees({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setEmployees(data || []);
    } catch (err) {
      console.error('Load employees error:', err);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadEmployees();
  };

  const handleToggleStatus = async (emp) => {
    const action = emp.status === 'active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${emp.first_name} ${emp.last_name}?`)) return;

    try {
      if (action === 'deactivate') {
        await employeeService.deactivateEmployee(emp.user_id);
        toast.success(`${emp.first_name} has been deactivated`);
      } else {
        await employeeService.activateEmployee(emp.user_id);
        toast.success(`${emp.first_name} has been activated`);
      }
      loadEmployees();
    } catch (err) {
      toast.error(`Failed to ${action} employee`);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }
    try {
      await employeeService.resetEmployeePassword(showResetModal.user_id, newPassword);
      toast.success('Password reset successfully');
      setShowResetModal(null);
      setNewPassword('');
    } catch (err) {
      toast.error('Password reset failed. Use Supabase Dashboard instead.');
    }
  };

  const filteredEmployees = search
    ? employees.filter(e =>
        `${e.first_name} ${e.last_name} ${e.employee_id} ${e.email}`
          .toLowerCase().includes(search.toLowerCase())
      )
    : employees;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>{employees.length} total employees</p>
        </div>
        <Link to="/admin/employees/add" className="btn btn-primary">
          <Plus size={18} /> Add Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-2)', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, maxWidth: '100%' }}
            />
          </div>
        </form>
        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: '160px' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }}></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={32} /></div>
            <h3>No employees found</h3>
            <p>Add your first employee to get started</p>
            <Link to="/admin/employees/add" className="btn btn-primary">
              <Plus size={16} /> Add Employee
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="sidebar-avatar" style={{ width: 32, height: 32, minWidth: 32, fontSize: 'var(--text-xs)' }}>
                        {getInitials(emp.first_name, emp.last_name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'var(--font-medium)' }}>{emp.first_name} {emp.last_name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{emp.employee_id}</td>
                  <td>{emp.role_title || '—'}</td>
                  <td>{emp.phone || '—'}</td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>{formatDate(emp.date_of_joining, 'short')}</td>
                  <td>
                    <span className={`badge badge-dot ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <Link to={`/admin/employees/${emp.user_id}`} className="btn btn-ghost btn-icon btn-sm" title="View">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/admin/employees/${emp.user_id}/edit`} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleToggleStatus(emp)}
                        title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {emp.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setShowResetModal(emp)}
                        title="Reset Password"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="modal-close" onClick={() => setShowResetModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Reset password for <strong>{showResetModal.first_name} {showResetModal.last_name}</strong> ({showResetModal.employee_id})
            </p>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                minLength={6}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowResetModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleResetPassword}>Reset Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
