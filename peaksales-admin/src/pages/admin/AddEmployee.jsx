import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import * as employeeService from '../../services/employeeService';
import { logAuditEvent } from '../../services/activityService';
import { bloodGroupOptions } from '../../lib/utils';
import { UserPlus, AlertCircle, Save } from 'lucide-react';

export default function AddEmployee() {
  const { userProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employee_id: '',
    password: '',
    first_name: '',
    last_name: '',
    role_title: '',
    date_of_birth: '',
    date_of_joining: '',
    blood_group: '',
    address: '',
    email: '',
    phone: '',
    emergency_contact: '',
    pf_number: '',
    esi_number: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await employeeService.createEmployee(form, form.password);
      await logAuditEvent(userProfile.id, 'employee_created', null, {
        employee_id: form.employee_id,
        name: `${form.first_name} ${form.last_name}`,
      });
      toast.success(`Employee ${form.first_name} ${form.last_name} created successfully!`);
      navigate('/admin/employees');
    } catch (err) {
      toast.error('Failed to create employee: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ name, label, type = 'text', required, placeholder, options, rows }) => (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={`form-input ${errors[name] ? 'error' : ''}`}
        >
          <option value="">Select {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : rows ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={`form-input ${errors[name] ? 'error' : ''}`}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={`form-input ${errors[name] ? 'error' : ''}`}
          placeholder={placeholder}
        />
      )}
      {errors[name] && <div className="form-error"><AlertCircle size={12} /> {errors[name]}</div>}
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1><UserPlus size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Add New Employee</h1>
          <p>Create a new employee account</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Account Info */}
          <h3 className="profile-section-title" style={{ marginBottom: 'var(--space-4)' }}>Account Information</h3>
          <div className="form-row">
            <Field name="employee_id" label="Employee ID" required placeholder="e.g. EMP004" />
            <Field name="password" label="Temporary Password" type="password" required placeholder="Min 6 characters" />
          </div>
          <Field name="email" label="Email Address" type="email" required placeholder="employee@peaksales.com" />

          {/* Personal Info */}
          <h3 className="profile-section-title" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>Personal Information</h3>
          <div className="form-row">
            <Field name="first_name" label="First Name" required placeholder="First name" />
            <Field name="last_name" label="Last Name" required placeholder="Last name" />
          </div>
          <div className="form-row">
            <Field name="date_of_birth" label="Date of Birth" type="date" />
            <Field name="blood_group" label="Blood Group" options={bloodGroupOptions} />
          </div>

          {/* Employment */}
          <h3 className="profile-section-title" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>Employment Details</h3>
          <div className="form-row">
            <Field name="role_title" label="Job Role" placeholder="e.g. Sales Executive" />
            <Field name="date_of_joining" label="Date of Joining" type="date" />
          </div>
          <div className="form-row">
            <Field name="pf_number" label="PF Number" placeholder="PF number" />
            <Field name="esi_number" label="ESI Number" placeholder="ESI number" />
          </div>

          {/* Contact */}
          <h3 className="profile-section-title" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>Contact Information</h3>
          <div className="form-row">
            <Field name="phone" label="Phone Number" placeholder="10-digit phone" />
            <Field name="emergency_contact" label="Emergency Contact" placeholder="Emergency contact number" />
          </div>
          <Field name="address" label="Address" placeholder="Full address" rows={3} />

          {/* Submit */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', marginTop: 'var(--space-6)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/employees')}>Cancel</button>
            <button type="submit" className={`btn btn-primary btn-lg ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
              {!submitting && <><Save size={18} /> Create Employee</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
