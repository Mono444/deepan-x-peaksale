import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';
import {
  LayoutDashboard, Users, Clock, FileText, Activity,
  Settings, LogOut, ChevronLeft, Shield, User,
  CalendarCheck, ClipboardList, UserCircle, Building2
} from 'lucide-react';

const employeeNav = [
  { section: 'Main', items: [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/profile', icon: UserCircle, label: 'My Profile' },
  ]},
  { section: 'Attendance', items: [
    { to: '/employee/attendance', icon: Clock, label: 'Mark Attendance' },
    { to: '/employee/attendance/history', icon: CalendarCheck, label: 'Attendance History' },
  ]},
  { section: 'Reports', items: [
    { to: '/employee/reports/new', icon: ClipboardList, label: 'Submit Report' },
    { to: '/employee/reports', icon: FileText, label: 'My Reports' },
  ]},
];

const adminNav = [
  { section: 'Main', items: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Employees', items: [
    { to: '/admin/employees', icon: Users, label: 'Employee List' },
    { to: '/admin/employees/add', icon: User, label: 'Add Employee' },
  ]},
  { section: 'Management', items: [
    { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/admin/reports', icon: FileText, label: 'Work Reports' },
    { to: '/admin/activity', icon: Activity, label: 'Login Activity' },
  ]},
  { section: 'System', items: [
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar({ collapsed, onToggle }) {
  const { userProfile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navItems = isAdmin ? adminNav : employeeNav;
  const profile = userProfile?.profile;

  const initials = profile
    ? getInitials(profile.first_name, profile.last_name)
    : isAdmin ? 'AD' : '??';

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : 'User';

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Building2 size={22} color="white" />
          </div>
          <div className="sidebar-brand-text">
            <h2>PeakSales</h2>
            <p>{isAdmin ? 'Admin Portal' : 'Employee Portal'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  title={item.label}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{displayName}</div>
              <div className="role">
                {isAdmin ? (
                  <><Shield size={10} style={{ display: 'inline', marginRight: 4 }} />Admin</>
                ) : (
                  profile?.role_title || 'Employee'
                )}
              </div>
            </div>
          </div>
          <button className="sidebar-link" onClick={logout} style={{ marginTop: '8px' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
