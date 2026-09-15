import { useAuth } from '../../contexts/AuthContext';
import { formatDate, getInitials } from '../../lib/utils';
import {
  User, Mail, Phone, MapPin, Calendar, Droplets,
  Building2, FileText, Heart, Shield, Hash
} from 'lucide-react';

export default function MyProfile() {
  const { userProfile } = useAuth();
  const profile = userProfile?.profile;

  if (!profile) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const initials = getInitials(profile.first_name, profile.last_name);

  return (
    <div className="animate-fade-in-up">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-info">
          <h2>{profile.first_name} {profile.last_name}</h2>
          <p>{profile.role_title || 'Employee'}</p>
          <p style={{ marginTop: 4 }}>
            <span className={`badge ${profile.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ backdropFilter: 'none' }}>
              {profile.status === 'active' ? '● Active' : '● Inactive'}
            </span>
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card profile-section">
        <h3 className="profile-section-title">
          <User size={18} /> Personal Information
        </h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Employee ID</label>
            <span>{profile.employee_id}</span>
          </div>
          <div className="profile-field">
            <label>First Name</label>
            <span>{profile.first_name}</span>
          </div>
          <div className="profile-field">
            <label>Last Name</label>
            <span>{profile.last_name}</span>
          </div>
          <div className="profile-field">
            <label>Date of Birth</label>
            <span>{formatDate(profile.date_of_birth, 'long') || '—'}</span>
          </div>
          <div className="profile-field">
            <label>Blood Group</label>
            <span>{profile.blood_group || '—'}</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card profile-section">
        <h3 className="profile-section-title">
          <Mail size={18} /> Contact Information
        </h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Email</label>
            <span>{profile.email || '—'}</span>
          </div>
          <div className="profile-field">
            <label>Phone</label>
            <span>{profile.phone || '—'}</span>
          </div>
          <div className="profile-field">
            <label>Emergency Contact</label>
            <span>{profile.emergency_contact || '—'}</span>
          </div>
          <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <span>{profile.address || '—'}</span>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="card profile-section">
        <h3 className="profile-section-title">
          <Building2 size={18} /> Employment Details
        </h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Job Role</label>
            <span>{profile.role_title || '—'}</span>
          </div>
          <div className="profile-field">
            <label>Date of Joining</label>
            <span>{formatDate(profile.date_of_joining, 'long') || '—'}</span>
          </div>
          <div className="profile-field">
            <label>PF Number</label>
            <span>{profile.pf_number || '—'}</span>
          </div>
          <div className="profile-field">
            <label>ESI Number</label>
            <span>{profile.esi_number || '—'}</span>
          </div>
          <div className="profile-field">
            <label>Status</label>
            <span className={`badge ${profile.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
              {profile.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
