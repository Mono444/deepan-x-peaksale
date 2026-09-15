import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as employeeService from '../../services/employeeService';
import * as attendanceService from '../../services/attendanceService';
import * as workReportService from '../../services/workReportService';
import * as activityService from '../../services/activityService';
import { formatDate, formatTime, formatHours, getInitials, attendanceStatusConfig } from '../../lib/utils';
import {
  User, Mail, Phone, MapPin, Calendar, Building2, Edit,
  Clock, FileText, Activity, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react';

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [emp, att, sum, rep, log] = await Promise.all([
        employeeService.getEmployeeProfile(id),
        attendanceService.getAttendanceHistory(id),
        attendanceService.getAttendanceSummary(id),
        workReportService.getMyReports(id),
        activityService.getLoginActivity({ userId: id, limit: 20 }),
      ]);
      setEmployee(emp);
      setAttendance(att?.slice(0, 30) || []);
      setSummary(typeof sum === 'string' ? JSON.parse(sum) : sum);
      setReports(rep || []);
      setLogins(log || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !employee) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  const initials = getInitials(employee.first_name, employee.last_name);

  return (
    <div className="animate-fade-in-up">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-info" style={{ flex: 1 }}>
          <h2>{employee.first_name} {employee.last_name}</h2>
          <p>{employee.role_title || 'Employee'} • {employee.employee_id}</p>
          <span className={`badge ${employee.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: 4 }}>
            {employee.status}
          </span>
        </div>
        <Link to={`/admin/employees/${id}/edit`} className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
          <Edit size={16} /> Edit
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'profile', icon: User, label: 'Profile' },
          { key: 'attendance', icon: Clock, label: 'Attendance' },
          { key: 'reports', icon: FileText, label: 'Reports' },
          { key: 'activity', icon: Activity, label: 'Login Activity' },
        ].map(t => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            <t.icon size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="stagger-children">
          <div className="card profile-section">
            <h3 className="profile-section-title"><User size={18} /> Personal</h3>
            <div className="profile-grid">
              <div className="profile-field"><label>Employee ID</label><span>{employee.employee_id}</span></div>
              <div className="profile-field"><label>Email</label><span>{employee.email || '—'}</span></div>
              <div className="profile-field"><label>Phone</label><span>{employee.phone || '—'}</span></div>
              <div className="profile-field"><label>Emergency</label><span>{employee.emergency_contact || '—'}</span></div>
              <div className="profile-field"><label>DOB</label><span>{formatDate(employee.date_of_birth) || '—'}</span></div>
              <div className="profile-field"><label>Blood Group</label><span>{employee.blood_group || '—'}</span></div>
              <div className="profile-field"><label>Joined</label><span>{formatDate(employee.date_of_joining) || '—'}</span></div>
              <div className="profile-field"><label>PF</label><span>{employee.pf_number || '—'}</span></div>
              <div className="profile-field"><label>ESI</label><span>{employee.esi_number || '—'}</span></div>
              <div className="profile-field" style={{ gridColumn: '1 / -1' }}><label>Address</label><span>{employee.address || '—'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div>
          {summary && (
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <div className="stat-card success"><div className="stat-content" style={{ textAlign: 'center' }}><div className="stat-value">{summary.present_days}</div><div className="stat-label">Present</div></div></div>
              <div className="stat-card danger"><div className="stat-content" style={{ textAlign: 'center' }}><div className="stat-value">{summary.absent_days}</div><div className="stat-label">Absent</div></div></div>
              <div className="stat-card warning"><div className="stat-content" style={{ textAlign: 'center' }}><div className="stat-value">{summary.missing_checkout_days}</div><div className="stat-label">Missing</div></div></div>
              <div className="stat-card info"><div className="stat-content" style={{ textAlign: 'center' }}><div className="stat-value">{summary.total_hours ? formatHours(summary.total_hours) : '0h'}</div><div className="stat-label">Hours</div></div></div>
            </div>
          )}
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {attendance.map(r => (
                  <tr key={r.id}>
                    <td>{formatDate(r.date, 'short')}</td>
                    <td style={{ color: 'var(--success-600)' }}>{formatTime(r.check_in_time)}</td>
                    <td>{r.check_out_time ? formatTime(r.check_out_time) : '—'}</td>
                    <td>{r.total_hours ? formatHours(r.total_hours) : '—'}</td>
                    <td><span className={`badge badge-dot ${attendanceStatusConfig[r.status]?.class}`}>{attendanceStatusConfig[r.status]?.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="card"><div className="empty-state"><h3>No reports</h3><p>This employee hasn't submitted any reports yet</p></div></div>
          ) : reports.map(r => (
            <div key={r.id} className="report-card">
              <div className="report-card-header" onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}>
                <div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{formatDate(r.report_date, 'long')}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.admin_review && <span className="badge badge-success">Reviewed</span>}
                  {expandedReport === r.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              {expandedReport === r.id && (
                <div className="report-card-body">
                  <div className="report-field"><div className="report-field-label">Work Completed</div><div className="report-field-value">{r.work_completed || '—'}</div></div>
                  <div className="report-field"><div className="report-field-label">Tasks</div><div className="report-field-value">{r.tasks_handled || '—'}</div></div>
                  <div className="report-field"><div className="report-field-label">Pending</div><div className="report-field-value">{r.pending_work || '—'}</div></div>
                  <div className="report-field"><div className="report-field-label">Issues</div><div className="report-field-value">{r.issues_blockers || '—'}</div></div>
                  <div className="report-field"><div className="report-field-label">Tomorrow</div><div className="report-field-value">{r.plan_tomorrow || '—'}</div></div>
                  {r.notes && <div className="report-field"><div className="report-field-label">Notes</div><div className="report-field-value">{r.notes}</div></div>}
                  {r.admin_review && (
                    <div className="review-section">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><MessageSquare size={16} /><strong style={{ fontSize: 'var(--text-sm)' }}>Admin Review</strong></div>
                      <p style={{ fontSize: 'var(--text-sm)' }}>{r.admin_review}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Time</th><th>Status</th><th>Logout</th></tr></thead>
            <tbody>
              {logins.map(l => (
                <tr key={l.id}>
                  <td>{formatDate(l.login_time, 'short')} {formatTime(l.login_time)}</td>
                  <td><span className={`badge ${l.status === 'success' ? 'badge-success' : 'badge-danger'}`}>{l.status}</span></td>
                  <td>{l.logout_time ? formatTime(l.logout_time) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
