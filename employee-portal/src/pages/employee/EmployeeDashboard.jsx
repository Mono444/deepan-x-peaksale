import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import * as attendanceService from '../../services/attendanceService';
import * as workReportService from '../../services/workReportService';
import { formatDate, formatTime, formatHours, attendanceStatusConfig, getTodayISO } from '../../lib/utils';
import {
  Clock, FileText, CheckCircle, AlertTriangle,
  LogIn, LogOut, CalendarCheck, ClipboardList, TrendingUp, ArrowRight
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();
  const toast = useToast();
  const profile = userProfile?.profile;

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [attendance, summaryData, reports] = await Promise.all([
        attendanceService.getTodayAttendance(userProfile.id),
        attendanceService.getAttendanceSummary(userProfile.id),
        workReportService.getMyReports(userProfile.id, {}),
      ]);
      setTodayAttendance(attendance);
      setSummary(typeof summaryData === 'string' ? JSON.parse(summaryData) : summaryData);
      setRecentReports(reports?.slice(0, 5) || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const result = await attendanceService.checkIn(userProfile.id);
      if (result.success) {
        toast.success('Checked in successfully!');
        await loadDashboardData();
      } else {
        toast.warning(result.message);
      }
    } catch (err) {
      toast.error('Failed to check in: ' + err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const result = await attendanceService.checkOut(userProfile.id);
      if (result.success) {
        toast.success(`Checked out! Total hours: ${formatHours(result.total_hours)}`);
        await loadDashboardData();
      } else {
        toast.warning(result.message);
      }
    } catch (err) {
      toast.error('Failed to check out: ' + err.message);
    } finally {
      setCheckingOut(false);
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

  const hasCheckedIn = !!todayAttendance;
  const hasCheckedOut = todayAttendance?.check_out_time != null;

  return (
    <div className="animate-fade-in-up">
      {/* Welcome Section */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-1)' }}>
              Welcome, {profile?.first_name || 'Employee'}! 👋
            </h2>
            <p style={{ opacity: 0.8, fontSize: 'var(--text-sm)' }}>
              {profile?.employee_id} • {profile?.role_title || 'Employee'} • {formatDate(new Date(), 'long')}
            </p>
          </div>
          <Link to="/employee/reports/new" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}>
            <ClipboardList size={20} /> Submit Report
          </Link>
        </div>
      </div>

      {/* Attendance Card */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Today's Attendance */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Attendance</h3>
              <p className="card-subtitle">{formatDate(new Date())}</p>
            </div>
            {todayAttendance && (
              <span className={`badge badge-dot ${attendanceStatusConfig[todayAttendance.status]?.class || 'badge-gray'}`}>
                {attendanceStatusConfig[todayAttendance.status]?.label || todayAttendance.status}
              </span>
            )}
          </div>

          {todayAttendance ? (
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="profile-field" style={{ flex: 1 }}>
                <label>Check In</label>
                <span style={{ color: 'var(--success-600)', fontWeight: 600 }}>
                  {formatTime(todayAttendance.check_in_time)}
                </span>
              </div>
              <div className="profile-field" style={{ flex: 1 }}>
                <label>Check Out</label>
                <span style={{ color: todayAttendance.check_out_time ? 'var(--danger-600)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                  {todayAttendance.check_out_time ? formatTime(todayAttendance.check_out_time) : '—'}
                </span>
              </div>
              {todayAttendance.total_hours != null && (
                <div className="profile-field" style={{ flex: 1 }}>
                  <label>Hours</label>
                  <span style={{ fontWeight: 600 }}>{formatHours(todayAttendance.total_hours)}</span>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
              You haven't checked in today.
            </p>
          )}

          <div className="check-buttons" style={{ justifyContent: 'flex-start' }}>
            {!hasCheckedIn && (
              <button
                className={`check-btn check-btn-in ${checkingIn ? 'btn-loading' : ''}`}
                onClick={handleCheckIn}
                disabled={checkingIn}
              >
                {!checkingIn && <><LogIn size={22} /> Check In</>}
              </button>
            )}
            {hasCheckedIn && !hasCheckedOut && (
              <button
                className={`check-btn check-btn-out ${checkingOut ? 'btn-loading' : ''}`}
                onClick={handleCheckOut}
                disabled={checkingOut}
              >
                {!checkingOut && <><LogOut size={22} /> Check Out</>}
              </button>
            )}
            {hasCheckedOut && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--success-600)', fontWeight: 600 }}>
                <CheckCircle size={20} /> Attendance completed for today
              </div>
            )}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">This Month</h3>
            <Link to="/employee/attendance/history" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--success-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--success-600)' }}>
                {summary?.present_days || 0}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Present</div>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--danger-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--danger-600)' }}>
                {summary?.absent_days || 0}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Absent</div>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--warning-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--warning-600)' }}>
                {summary?.missing_checkout_days || 0}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Missing</div>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--info-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--info-600)' }}>
                {summary?.total_hours ? formatHours(summary.total_hours) : '0h'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card" style={{ marginTop: 'var(--space-2)' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Work Reports</h3>
          <Link to="/employee/reports" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">
              <FileText size={32} />
            </div>
            <h3>No reports yet</h3>
            <p>Submit your first daily work report</p>
            <Link to="/employee/reports/new" className="btn btn-primary">
              <ClipboardList size={16} /> Submit Report
            </Link>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Work Completed</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map(report => (
                  <tr key={report.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(report.report_date, 'short')}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.work_completed}
                    </td>
                    <td>
                      {report.admin_review ? (
                        <span className="badge badge-success badge-dot">Reviewed</span>
                      ) : (
                        <span className="badge badge-gray">Pending</span>
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
  );
}
