import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import * as attendanceService from '../../services/attendanceService';
import { formatDate, formatTime, formatHours, attendanceStatusConfig } from '../../lib/utils';
import { LogIn, LogOut, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function MarkAttendance() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance(userProfile.id);
      setTodayAttendance(data);
    } catch (err) {
      console.error('Load attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const result = await attendanceService.checkIn(userProfile.id);
      if (result.success) {
        toast.success('✅ Checked in successfully!');
        await loadAttendance();
      } else {
        toast.warning(result.message);
      }
    } catch (err) {
      toast.error('Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const result = await attendanceService.checkOut(userProfile.id);
      if (result.success) {
        toast.success(`✅ Checked out! Total: ${formatHours(result.total_hours)}`);
        await loadAttendance();
      } else {
        toast.warning(result.message);
      }
    } catch (err) {
      toast.error('Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const hasCheckedIn = !!todayAttendance;
  const hasCheckedOut = todayAttendance?.check_out_time != null;

  const timeString = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
  const dateString = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="animate-fade-in-up">
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        {/* Live Clock */}
        <div className="attendance-clock">
          <div className="clock-display">{timeString}</div>
          <div className="clock-date">{dateString}</div>
        </div>

        {/* Status */}
        {todayAttendance && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <span className={`badge badge-dot ${attendanceStatusConfig[todayAttendance.status]?.class}`} style={{ fontSize: 'var(--text-sm)', padding: '6px 16px' }}>
              {attendanceStatusConfig[todayAttendance.status]?.label}
            </span>
          </div>
        )}

        {/* Check In/Out Buttons */}
        <div className="check-buttons">
          {!hasCheckedIn && (
            <button
              className={`check-btn check-btn-in ${checkingIn ? 'btn-loading' : ''}`}
              onClick={handleCheckIn}
              disabled={checkingIn}
            >
              {!checkingIn && <><LogIn size={24} /> Check In</>}
            </button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <button
              className={`check-btn check-btn-out ${checkingOut ? 'btn-loading' : ''}`}
              onClick={handleCheckOut}
              disabled={checkingOut}
            >
              {!checkingOut && <><LogOut size={24} /> Check Out</>}
            </button>
          )}

          {hasCheckedOut && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <CheckCircle size={48} color="var(--success-500)" />
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--success-600)' }}>
                Attendance completed for today!
              </p>
            </div>
          )}
        </div>

        {/* Today's Details */}
        {todayAttendance && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-8)', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>CHECK IN</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--success-600)' }}>
                {formatTime(todayAttendance.check_in_time)}
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--border-light)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>CHECK OUT</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: todayAttendance.check_out_time ? 'var(--danger-600)' : 'var(--text-tertiary)' }}>
                {todayAttendance.check_out_time ? formatTime(todayAttendance.check_out_time) : '—'}
              </div>
            </div>
            {todayAttendance.total_hours != null && (
              <>
                <div style={{ width: 1, background: 'var(--border-light)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>TOTAL HOURS</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)' }}>
                    {formatHours(todayAttendance.total_hours)}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
