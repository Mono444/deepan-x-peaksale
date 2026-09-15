import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Settings as SettingsIcon, Shield, Key, Info } from 'lucide-react';

export default function Settings() {
  const { userProfile } = useAuth();
  const toast = useToast();
  const profile = userProfile?.profile;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Admin settings and system configuration</p>
        </div>
      </div>

      {/* Admin Info */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <h3 className="profile-section-title"><Shield size={18} /> Admin Account</h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Name</label>
            <span>{profile?.first_name} {profile?.last_name}</span>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <span>{profile?.email || userProfile?.authUser?.email || '—'}</span>
          </div>
          <div className="profile-field">
            <label>Role</label>
            <span className="badge badge-primary">Administrator</span>
          </div>
          <div className="profile-field">
            <label>Employee ID</label>
            <span>{userProfile?.employee_id || '—'}</span>
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <h3 className="profile-section-title"><Info size={18} /> Setup Guide</h3>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Password Reset:</strong> To reset an employee's password, go to Employee List → click the reset icon, 
            or use the Supabase Dashboard → Authentication → Users → select user → reset password.
          </p>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Deactivating Employees:</strong> Deactivated employees cannot log in. Go to Employee List → 
            click the deactivate icon to toggle status.
          </p>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Missing Checkouts:</strong> Employees who forget to check out will have their status marked as 
            "Missing Checkout". The system function <code>mark_missing_checkouts()</code> should be called daily 
            (via Supabase scheduled function or manual execution).
          </p>
          <p>
            <strong>Data Export:</strong> Attendance and work reports can be exported to CSV from their respective 
            management pages using the Export button.
          </p>
        </div>
      </div>

      {/* Database Info */}
      <div className="card">
        <h3 className="profile-section-title"><Key size={18} /> Database Configuration</h3>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Backend</label>
              <span>Supabase</span>
            </div>
            <div className="profile-field">
              <label>Auth</label>
              <span>Supabase Auth (Email/Password)</span>
            </div>
            <div className="profile-field">
              <label>Database</label>
              <span>PostgreSQL with RLS</span>
            </div>
            <div className="profile-field">
              <label>Security</label>
              <span>Row Level Security + Role-based Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
