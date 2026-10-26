import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const pageTitles = {
  '/employee/dashboard': { title: 'Dashboard', subtitle: 'Welcome back' },
  '/employee/profile': { title: 'My Profile', subtitle: 'Personal details' },
  '/employee/attendance': { title: 'Mark Attendance', subtitle: 'Check in & out' },
  '/employee/attendance/history': { title: 'Attendance History', subtitle: 'Your records' },
  '/employee/reports/new': { title: 'Submit Report', subtitle: 'Daily work report' },
  '/employee/reports': { title: 'My Reports', subtitle: 'Submitted reports' },
  '/admin/dashboard': { title: 'Admin Dashboard', subtitle: 'Overview' },
  '/admin/employees': { title: 'Employees', subtitle: 'Manage employees' },
  '/admin/employees/add': { title: 'Add Employee', subtitle: 'Create new employee' },
  '/admin/attendance': { title: 'Attendance', subtitle: 'All attendance records' },
  '/admin/reports': { title: 'Work Reports', subtitle: 'Employee reports' },
  '/admin/activity': { title: 'Login Activity', subtitle: 'Login tracking' },
  '/admin/settings': { title: 'Settings', subtitle: 'System settings' },
};

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: 'Page', subtitle: '' };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay visible" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header
          onMenuClick={() => setMobileOpen(!mobileOpen)}
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
