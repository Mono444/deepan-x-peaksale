import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import * as employeeService from '../../services/employeeService';
import { logAuditEvent } from '../../services/activityService';
import { bloodGroupOptions } from '../../lib/utils';
import { Edit, AlertCircle, Save } from 'lucide-react';

export default function EditEmployee() {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      const data = await employeeService.getEmployeeProfile(id);
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        role_title: data.role_title || '',
        date_of_birth: data.date_of_birth || '',
        date_of_joining: data.date_of_joining || '',
        blood_group: data.blood_group || '',
        address: data.address || '',
        email: data.email || '',
        phone: data.phone || '',
        emergency_contact: data.emergency_contact || '',
        pf_number: data.pf_number || '',
        esi_number: data.esi_number || '',
        status: data.status || 'active',
      });
    } catch (err) {
      toast.error('Failed to load employee');
      navigate('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim()) errs.last_name = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await employeeService.updateEmployee(id, form);
      await logAuditEvent(userProfile.id, 'employee_updated', id, { changes: form });
      toast.success('Employee updated successfully!');
      navigate(`/admin/employees/${id}`);
    } catch (err) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  const Field = ({ name, label, type = 'text', required, placeholder, options, rows }) => (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      {options ? (
        <select name={name} value={form[name]} onChange={handleChange} className={`form-input ${errors[name] ? 'error' : ''}`}>
          <option value="">Select</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : rows ? (
        <textarea name={name} value={form[name]} onChange={handleChange} className={`form-input ${errors[name] ? 'error' : ''}`} placeholder={placeholder} rows={rows} />
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handleChange} className={`form-input ${errors[name] ? 'error' : ''}`} placeholder={placeholder} />
      )}
      {errors[name] && <div className="form-error"><AlertCircle size={12} /> {errors[name]}</div>}
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1><Edit size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Edit Employee</h1>
          <p>Update employee details</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 className="profile-section-title" style={{ marginBottom: 'var(--space-4)' }}>Personal Information</h3>
          <div className="form-row">
            <Field name="first_name" label="First Name" required />
            <Field name="last_name" label="Last Name" required />
          </div>
          <div className="form-row">
            <Field name="date_of_birth" label="Date of Birth" type="date" />
            <Field name="blood_group" label="Blood Group" options={bloodGroupOptions} />
          </div>

          <h3 className="profile-section-title" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>Employment</h3>
          <div className="form-row">
            <Field name="role_title" label="Job Role" placeholder="e.g. Sales Executive" />
            <Field name="date_of_joining" label="Date of Joining" type="date" />
          </div>
          <div className="form-row">
            <Field name="pf_number" label="PF Number" />
            <Field name="esi_number" label="ESI Number" />
          </div>
          <Field name="status" label="Status" options={['active', 'inactive']} />

          <h3 className="profile-section-title" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>Contact</h3>
          <Field name="email" label="Email" type="email" required />
          <div className="form-row">
            <Field name="phone" label="Phone" />
            <Field name="emergency_contact" label="Emergency Contact" />
          </div>
          <Field name="address" label="Address" rows={3} />

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', marginTop: 'var(--space-6)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className={`btn btn-primary btn-lg ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
              {!submitting && <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
