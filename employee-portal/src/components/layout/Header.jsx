import { useAuth } from '../../contexts/AuthContext';
import { Menu, Sun, Moon, LogOut, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Header({ onMenuClick, title, subtitle }) {
  const { logout, userProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setDarkMode(!darkMode);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <div className="header-title">
          <h1>{title || 'Dashboard'}</h1>
          {subtitle && <div className="header-breadcrumb">{subtitle}</div>}
        </div>
      </div>
      <div className="header-right">
        <button className="header-btn" onClick={toggleTheme} title="Toggle theme">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="header-btn" title="Notifications">
          <Bell size={20} />
        </button>
        <button className="header-btn" onClick={logout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
