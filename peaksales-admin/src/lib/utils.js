/**
 * Utility functions for the Employee Portal
 */

/**
 * Format date to readable string
 */
export function formatDate(date, format = 'long') {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  if (format === 'short') {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (format === 'iso') {
    return d.toISOString().split('T')[0];
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Format time to readable string
 */
export function formatTime(dateTime) {
  if (!dateTime) return '—';
  const d = new Date(dateTime);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Format hours to hours and minutes
 */
export function formatHours(hours) {
  if (!hours && hours !== 0) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

/**
 * Get initials from name
 */
export function getInitials(firstName, lastName) {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return f + l || '?';
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get month name
 */
export function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (10 digits)
 */
export function isValidPhone(phone) {
  return /^\d{10}$/.test(phone?.replace(/[^0-9]/g, ''));
}

/**
 * Convert data to CSV and trigger download
 */
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str}"`
          : str;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${getTodayISO()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Attendance status display config
 */
export const attendanceStatusConfig = {
  present: { label: 'Present', class: 'badge-success', color: 'success' },
  checked_in: { label: 'Checked In', class: 'badge-info', color: 'info' },
  missing_checkout: { label: 'Missing Checkout', class: 'badge-warning', color: 'warning' },
  absent: { label: 'Absent', class: 'badge-danger', color: 'danger' },
};

/**
 * Blood group options
 */
export const bloodGroupOptions = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
