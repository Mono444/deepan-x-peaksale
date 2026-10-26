import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import * as workReportService from '../../services/workReportService';
import { getTodayISO } from '../../lib/utils';
import { Send, FileText, AlertCircle } from 'lucide-react';

export default function SubmitWorkReport() {
  const { userProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    report_date: getTodayISO(),
    work_completed: '',
    tasks_handled: '',
    pending_work: '',
    issues_blockers: '',
    plan_tomorrow: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.report_date) errs.report_date = 'Date is required';
    if (!form.work_completed.trim()) errs.work_completed = 'Work completed is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Check if report already exists for this date
      const existing = await workReportService.getReportByDate(userProfile.id, form.report_date);
      if (existing) {
        toast.warning('A report for this date already exists. Updating it.');
        await workReportService.updateWorkReport(existing.id, form);
        toast.success('Report updated successfully!');
      } else {
        await workReportService.submitWorkReport(userProfile.id, form);
        toast.success('Report submitted successfully!');
      }
      navigate('/employee/reports');
    } catch (err) {
      toast.error('Failed to submit report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileText size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Daily Work Report
            </h3>
            <p className="card-subtitle">Submit your work details for the day</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Date */}
          <div className="form-group">
            <label className="form-label">
              Report Date <span className="required">*</span>
            </label>
            <input
              type="date"
              name="report_date"
              value={form.report_date}
              onChange={handleChange}
              className={`form-input ${errors.report_date ? 'error' : ''}`}
              max={getTodayISO()}
            />
            {errors.report_date && <div className="form-error"><AlertCircle size={12} /> {errors.report_date}</div>}
          </div>

          {/* Work Completed */}
          <div className="form-group">
            <label className="form-label">
              Work Completed Today <span className="required">*</span>
            </label>
            <textarea
              name="work_completed"
              value={form.work_completed}
              onChange={handleChange}
              className={`form-input ${errors.work_completed ? 'error' : ''}`}
              placeholder="Describe the work you completed today..."
              rows={4}
            />
            {errors.work_completed && <div className="form-error"><AlertCircle size={12} /> {errors.work_completed}</div>}
          </div>

          {/* Tasks Handled */}
          <div className="form-group">
            <label className="form-label">Tasks / Calls / Meetings / Leads Handled</label>
            <textarea
              name="tasks_handled"
              value={form.tasks_handled}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., 5 calls, 2 client meetings, 3 new leads..."
              rows={3}
            />
          </div>

          {/* Pending Work */}
          <div className="form-group">
            <label className="form-label">Pending Work</label>
            <textarea
              name="pending_work"
              value={form.pending_work}
              onChange={handleChange}
              className="form-input"
              placeholder="Any pending tasks or follow-ups..."
              rows={3}
            />
          </div>

          {/* Issues / Blockers */}
          <div className="form-group">
            <label className="form-label">Issues or Blockers</label>
            <textarea
              name="issues_blockers"
              value={form.issues_blockers}
              onChange={handleChange}
              className="form-input"
              placeholder="Any issues, blockers, or challenges faced..."
              rows={3}
            />
          </div>

          {/* Plan for Tomorrow */}
          <div className="form-group">
            <label className="form-label">Plan for Tomorrow</label>
            <textarea
              name="plan_tomorrow"
              value={form.plan_tomorrow}
              onChange={handleChange}
              className="form-input"
              placeholder="What do you plan to work on tomorrow..."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-input"
              placeholder="Any additional notes or comments..."
              rows={2}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/employee/reports')}>
              Cancel
            </button>
            <button type="submit" className={`btn btn-primary btn-lg ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
              {!submitting && <><Send size={18} /> Submit Report</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
