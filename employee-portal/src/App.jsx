import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import EmployeeLogin from './pages/auth/EmployeeLogin';
import AdminLogin from './pages/auth/AdminLogin';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import MarkAttendance from './pages/employee/MarkAttendance';
import MyAttendance from './pages/employee/MyAttendance';
import SubmitWorkReport from './pages/employee/SubmitWorkReport';
import MyWorkReports from './pages/employee/MyWorkReports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import AddEmployee from './pages/admin/AddEmployee';
import EditEmployee from './pages/admin/EditEmployee';
import EmployeeDetail from './pages/admin/EmployeeDetail';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import WorkReportsManagement from './pages/admin/WorkReportsManagement';
import LoginActivity from './pages/admin/LoginActivity';
import Settings from './pages/admin/Settings';

import './styles/index.css';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/employee/login" replace />} />
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Employee Routes */}
            <Route
              element={
                <ProtectedRoute requiredRole="employee">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/profile" element={<MyProfile />} />
              <Route path="/employee/attendance" element={<MarkAttendance />} />
              <Route path="/employee/attendance/history" element={<MyAttendance />} />
              <Route path="/employee/reports/new" element={<SubmitWorkReport />} />
              <Route path="/employee/reports" element={<MyWorkReports />} />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeeList />} />
              <Route path="/admin/employees/add" element={<AddEmployee />} />
              <Route path="/admin/employees/:id" element={<EmployeeDetail />} />
              <Route path="/admin/employees/:id/edit" element={<EditEmployee />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/reports" element={<WorkReportsManagement />} />
              <Route path="/admin/activity" element={<LoginActivity />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
