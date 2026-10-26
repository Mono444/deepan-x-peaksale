import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as attendanceService from '../../services/attendanceService';
import * as employeeService from '../../services/employeeService';
import * as activityService from '../../services/activityService';
import * as workReportService from '../../services/workReportService';
import { formatDate, formatTime } from '../../lib/utils';
import {
  Users, UserCheck, Clock, UserX, AlertTriangle,
  Plus, ArrowRight, Activity, FileText, TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogins, setRecentLogins] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, logins, reports] = await Promise.all([
        attendanceService.getDashboardStats(),
        activityService.getRecentLogins(8),
        workReportService.getAllReports({ limit: 5 }),
      ]);
      setStats(typeof statsData === 'string' ? JSON.parse(statsData) : statsData);
      setRecentLogins(logins || []);
      setRecentReports(reports?.slice(0, 5) || []);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>{formatDate(new Date(), 'long')}</p>
        </div>
        <Link to="/admin/employees/add" className="btn btn-primary">
          <Plus size={18} /> Add Employee
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid stagger-children">
        <div className="stat-card primary">
          <div className="stat-icon primary"><Users size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.total_employees || 0}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><UserCheck size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.active_employees || 0}</div>
            <div className="stat-label">Active Employees</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon info"><Clock size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.today_present || 0}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon danger"><UserX size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.today_absent || 0}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning"><AlertTriangle size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.today_missing_checkout || 0}</div>
            <div className="stat-label">Missing Checkout</div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="stagger-children">
        {/* Recent Logins */}
        <div className="card" style={{ gridColumn: window.innerWidth < 768 ? '1 / -1' : 'auto' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Recent Logins
            </h3>
            <Link to="/admin/activity" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {recentLogins.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>No recent logins</p>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogins.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 'var(--font-medium)' }}>{l.employee_id}</td>
                      <td><span className={`badge ${l.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>{l.role}</span></td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{formatTime(l.login_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Work Reports */}
        <div className="card" style={{ gridColumn: window.innerWidth < 768 ? '1 / -1' : 'auto' }}>
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Recent Reports
            </h3>
            <Link to="/admin/reports" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {recentReports.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>No recent reports</p>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 'var(--font-medium)' }}>
                        {r.employee_profiles?.first_name} {r.employee_profiles?.last_name}
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{formatDate(r.report_date, 'short')}</td>
                      <td>
                        {r.admin_review ? (
                          <span className="badge badge-success">Reviewed</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
