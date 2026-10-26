import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as workReportService from '../../services/workReportService';
import { formatDate } from '../../lib/utils';
import { FileText, ChevronDown, ChevronUp, MessageSquare, ClipboardList } from 'lucide-react';

export default function MyWorkReports() {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await workReportService.getMyReports(userProfile.id);
      setReports(data || []);
    } catch (err) {
      console.error('Load reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1>My Work Reports</h1>
          <p>Your submitted daily reports</p>
        </div>
        <Link to="/employee/reports/new" className="btn btn-primary">
          <ClipboardList size={16} /> Submit New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={32} /></div>
            <h3>No reports submitted yet</h3>
            <p>Start by submitting your first daily work report</p>
            <Link to="/employee/reports/new" className="btn btn-primary">
              Submit Report
            </Link>
          </div>
        </div>
      ) : (
        reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-card-header" onClick={() => toggleExpand(report.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <FileText size={18} style={{ color: 'var(--primary-500)' }} />
                <div>
                  <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                    {formatDate(report.report_date, 'long')}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {report.work_completed?.substring(0, 80)}{report.work_completed?.length > 80 ? '...' : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {report.admin_review && (
                  <span className="badge badge-success badge-dot">Reviewed</span>
                )}
                {expandedId === report.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedId === report.id && (
              <div className="report-card-body" style={{ animation: 'fadeInDown 0.2s ease-out' }}>
                <div className="report-field">
                  <div className="report-field-label">Work Completed</div>
                  <div className="report-field-value">{report.work_completed || '—'}</div>
                </div>
                <div className="report-field">
                  <div className="report-field-label">Tasks / Calls / Meetings / Leads</div>
                  <div className="report-field-value">{report.tasks_handled || '—'}</div>
                </div>
                <div className="report-field">
                  <div className="report-field-label">Pending Work</div>
                  <div className="report-field-value">{report.pending_work || '—'}</div>
                </div>
                <div className="report-field">
                  <div className="report-field-label">Issues / Blockers</div>
                  <div className="report-field-value">{report.issues_blockers || '—'}</div>
                </div>
                <div className="report-field">
                  <div className="report-field-label">Plan for Tomorrow</div>
                  <div className="report-field-value">{report.plan_tomorrow || '—'}</div>
                </div>
                {report.notes && (
                  <div className="report-field">
                    <div className="report-field-label">Notes</div>
                    <div className="report-field-value">{report.notes}</div>
                  </div>
                )}
                {report.admin_review && (
                  <div className="review-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <MessageSquare size={16} style={{ color: 'var(--primary-600)' }} />
                      <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--primary-700)' }}>
                        Admin Review
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{report.admin_review}</p>
                    {report.reviewed_at && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                        Reviewed on {formatDate(report.reviewed_at, 'short')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
