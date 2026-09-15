import { useState, useEffect } from 'react';
import * as attendanceService from '../../services/attendanceService';
import * as employeeService from '../../services/employeeService';
import { formatDate, formatTime, formatHours, attendanceStatusConfig, exportToCSV, getTodayISO } from '../../lib/utils';
import { CalendarCheck, Download, Search, Filter } from 'lucide-react';

export default function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: getTodayISO(),
    userId: '',
    status: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [filters]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees({ status: 'active' });
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAllAttendance({
        date: filters.date || undefined,
        userId: filters.userId || undefined,
        status: filters.status || undefined,
      });
      setRecords(data || []);
    } catch (err) {
      console.error('Load attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = records.map(r => ({
      Date: r.date,
      Employee_ID: r.employee_profiles?.employee_id || '',
      Name: `${r.employee_profiles?.first_name || ''} ${r.employee_profiles?.last_name || ''}`,
      Role: r.employee_profiles?.role_title || '',
      Check_In: r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : '',
      Check_Out: r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : '',
      Total_Hours: r.total_hours || '',
      Status: r.status,
    }));
    exportToCSV(exportData, 'attendance_report');
  };

  const stats = {
    present: records.filter(r => r.status === 'present').length,
    checkedIn: records.filter(r => r.status === 'checked_in').length,
    missing: records.filter(r => r.status === 'missing_checkout').length,
    totalHours: records.reduce((acc, r) => acc + (r.total_hours || 0), 0),
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1>Attendance Management</h1>
          <p>View and manage employee attendance</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={records.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card success">
          <div className="stat-content" style={{ textAlign: 'center' }}>
            <div className="stat-value">{stats.present}</div>
            <div className="stat-label">Present</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-content" style={{ textAlign: 'center' }}>
            <div className="stat-value">{stats.checkedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-content" style={{ textAlign: 'center' }}>
            <div className="stat-value">{stats.missing}</div>
            <div className="stat-label">Missing Checkout</div>
          </div>
        </div>
        <div className="stat-card primary">
          <div className="stat-content" style={{ textAlign: 'center' }}>
            <div className="stat-value">{formatHours(stats.totalHours)}</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="date"
          className="form-input"
          value={filters.date}
          onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          style={{ maxWidth: '180px' }}
        />
        <select
          className="form-input"
          value={filters.userId}
          onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
          style={{ maxWidth: '220px' }}
        >
          <option value="">All Employees</option>
          {employees.map(emp => (
            <option key={emp.user_id} value={emp.user_id}>
              {emp.first_name} {emp.last_name} ({emp.employee_id})
            </option>
          ))}
        </select>
        <select
          className="form-input"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          style={{ maxWidth: '180px' }}
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="checked_in">Checked In</option>
          <option value="missing_checkout">Missing Checkout</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ date: '', userId: '', status: '' })}>
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }}></div>
        </div>
      ) : records.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><CalendarCheck size={32} /></div>
            <h3>No records found</h3>
            <p>Try changing the filters</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 'var(--font-medium)' }}>
                    {r.employee_profiles?.first_name} {r.employee_profiles?.last_name}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    {r.employee_profiles?.employee_id}
                  </td>
                  <td>{formatDate(r.date, 'short')}</td>
                  <td style={{ color: 'var(--success-600)' }}>{formatTime(r.check_in_time)}</td>
                  <td style={{ color: r.check_out_time ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {r.check_out_time ? formatTime(r.check_out_time) : '—'}
                  </td>
                  <td>{r.total_hours ? formatHours(r.total_hours) : '—'}</td>
                  <td>
                    <span className={`badge badge-dot ${attendanceStatusConfig[r.status]?.class}`}>
                      {attendanceStatusConfig[r.status]?.label}
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
