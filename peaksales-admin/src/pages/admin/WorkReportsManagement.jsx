import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import * as workReportService from '../../services/workReportService';
import * as employeeService from '../../services/employeeService';
import { formatDate, exportToCSV, getTodayISO } from '../../lib/utils';
import {
  FileText, Download, ChevronDown, ChevronUp,
  MessageSquare, Send
} from 'lucide-react';

export default function WorkReportsManagement() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const [filters, setFilters] = useState({
    userId: '',
    date: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await workReportService.getAllReports({
        userId: filters.userId || undefined,
        date: filters.date || undefined,
      });
      setReports(data || []);
    } catch (err) {
      console.error('Load reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId) => {
    if (!reviewText.trim()) {
      toast.warning('Please enter a review comment');
      return;
    }
    try {
      await workReportService.addReviewComment(reportId, reviewText, userProfile.id);
      toast.success('Review added successfully');
      setReviewText('');
      setReviewingId(null);
      loadReports();
    } catch (err) {
      toast.error('Failed to add review');
    }
  };

  const handleExport = () => {
    const exportData = reports.map(r => ({
      Date: r.report_date,
      Employee_ID: r.employee_profiles?.employee_id || '',
      Name: `${r.employee_profiles?.first_name || ''} ${r.employee_profiles?.last_name || ''}`,
      Work_Completed: r.work_completed,
      Tasks_Handled: r.tasks_handled,
      Pending_Work: r.pending_work,
      Issues: r.issues_blockers,
      Plan_Tomorrow: r.plan_tomorrow,
      Notes: r.notes,
      Admin_Review: r.admin_review || '',
    }));
    exportToCSV(exportData, 'work_reports');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1>Work Reports</h1>
          <p>View and review employee daily reports</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={reports.length === 0}>
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
          <option value="">All Employees</option>
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
        <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ userId: '', date: '' })}>
          Clear
        </button>
      </div>

      {/* Reports */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }}></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={32} /></div>
            <h3>No reports found</h3>
            <p>Try changing the filters</p>
          </div>
        </div>
      ) : (
        reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-card-header" onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <FileText size={18} style={{ color: 'var(--primary-500)' }} />
                <div>
                  <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                    {report.employee_profiles?.first_name} {report.employee_profiles?.last_name}
                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: 8 }}>
                      ({report.employee_profiles?.employee_id})
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {formatDate(report.report_date, 'long')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {report.admin_review ? (
                  <span className="badge badge-success badge-dot">Reviewed</span>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )}
                {expandedId === report.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedId === report.id && (
              <div className="report-card-body" style={{ animation: 'fadeInDown 0.2s ease-out' }}>
                <div className="report-field"><div className="report-field-label">Work Completed</div><div className="report-field-value">{report.work_completed || '—'}</div></div>
                <div className="report-field"><div className="report-field-label">Tasks / Calls / Meetings</div><div className="report-field-value">{report.tasks_handled || '—'}</div></div>
                <div className="report-field"><div className="report-field-label">Pending Work</div><div className="report-field-value">{report.pending_work || '—'}</div></div>
                <div className="report-field"><div className="report-field-label">Issues / Blockers</div><div className="report-field-value">{report.issues_blockers || '—'}</div></div>
                <div className="report-field"><div className="report-field-label">Plan for Tomorrow</div><div className="report-field-value">{report.plan_tomorrow || '—'}</div></div>
                {report.notes && <div className="report-field"><div className="report-field-label">Notes</div><div className="report-field-value">{report.notes}</div></div>}

                {/* Existing Review */}
                {report.admin_review && (
                  <div className="review-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <MessageSquare size={16} style={{ color: 'var(--primary-600)' }} />
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-700)' }}>Admin Review</strong>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)' }}>{report.admin_review}</p>
                    {report.reviewed_at && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 8 }}>
                        Reviewed on {formatDate(report.reviewed_at, 'short')}
                      </p>
                    )}
                  </div>
                )}

                {/* Add Review */}
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
                  <label className="form-label">{report.admin_review ? 'Update Review' : 'Add Review Comment'}</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <textarea
                      className="form-input"
                      value={reviewingId === report.id ? reviewText : ''}
                      onChange={(e) => { setReviewingId(report.id); setReviewText(e.target.value); }}
                      onFocus={() => setReviewingId(report.id)}
                      placeholder="Write your review..."
                      rows={2}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleReview(report.id)}
                      disabled={reviewingId !== report.id || !reviewText.trim()}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
