import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Clock, FileText, UserCircle, Users, CalendarCheck, Activity } from 'lucide-react';

export default function MobileNav() {
  const { isAdmin } = useAuth();

  const employeeItems = [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/employee/attendance', icon: Clock, label: 'Attendance' },
    { to: '/employee/reports/new', icon: FileText, label: 'Report' },
    { to: '/employee/profile', icon: UserCircle, label: 'Profile' },
  ];

  const adminItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/admin/employees', icon: Users, label: 'Employees' },
    { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/admin/reports', icon: FileText, label: 'Reports' },
    { to: '/admin/activity', icon: Activity, label: 'Activity' },
  ];

  const items = isAdmin ? adminItems : employeeItems;

  return (
    <nav className="mobile-nav">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
