import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as attendanceService from '../../services/attendanceService';
import { formatDate, formatTime, formatHours, attendanceStatusConfig, getMonthName } from '../../lib/utils';
import { CalendarCheck, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function MyAttendance() {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [history, summaryData] = await Promise.all([
        attendanceService.getAttendanceHistory(userProfile.id, month, year),
        attendanceService.getAttendanceSummary(userProfile.id, month, year),
      ]);
      setRecords(history || []);
      setSummary(typeof summaryData === 'string' ? JSON.parse(summaryData) : summaryData);
    } catch (err) {
      console.error('Load attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Month Selector */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
            {getMonthName(month)} {year}
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="stat-card success">
            <div className="stat-content" style={{ textAlign: 'center' }}>
              <div className="stat-value">{summary.present_days}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-content" style={{ textAlign: 'center' }}>
              <div className="stat-value">{summary.absent_days}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-content" style={{ textAlign: 'center' }}>
              <div className="stat-value">{summary.missing_checkout_days}</div>
              <div className="stat-label">Missing</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-content" style={{ textAlign: 'center' }}>
              <div className="stat-value">{summary.total_hours ? formatHours(summary.total_hours) : '0h'}</div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
          <Clock size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Daily Records
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div className="spinner"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><CalendarCheck size={32} /></div>
            <h3>No records found</h3>
            <p>No attendance records for this month</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
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
                    <td style={{ fontWeight: 'var(--font-medium)' }}>{formatDate(r.date, 'short')}</td>
                    <td style={{ color: 'var(--success-600)' }}>{formatTime(r.check_in_time)}</td>
                    <td style={{ color: r.check_out_time ? 'var(--danger-600)' : 'var(--text-tertiary)' }}>
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
    </div>
  );
}
