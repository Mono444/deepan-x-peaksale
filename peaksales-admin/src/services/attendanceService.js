import { supabase } from '../lib/supabaseClient';

/**
 * Attendance Service - Check-in/out and attendance tracking
 */

export async function checkIn(userId) {
  const { data, error } = await supabase
    .rpc('perform_check_in', { p_user_id: userId });

  if (error) throw error;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function checkOut(userId) {
  const { data, error } = await supabase
    .rpc('perform_check_out', { p_user_id: userId });

  if (error) throw error;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function getTodayAttendance(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAttendanceHistory(userId, month, year) {
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    query = query.gte('date', startDate).lt('date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAttendanceSummary(userId, month, year) {
  const { data, error } = await supabase
    .rpc('get_attendance_summary', {
      p_user_id: userId,
      p_month: month || new Date().getMonth() + 1,
      p_year: year || new Date().getFullYear(),
    });

  if (error) throw error;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function getAllAttendance(filters = {}) {
  let query = supabase
    .from('attendance_records')
    .select(`
      *,
      employee_profiles!inner(first_name, last_name, employee_id, role_title)
    `)
    .order('date', { ascending: false });

  if (filters.date) {
    query = query.eq('date', filters.date);
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.month && filters.year) {
    const startDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
    const endMonth = filters.month === 12 ? 1 : filters.month + 1;
    const endYear = filters.month === 12 ? filters.year + 1 : filters.year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    query = query.gte('date', startDate).lt('date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDashboardStats() {
  const { data, error } = await supabase.rpc('get_dashboard_stats');
  if (error) throw error;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function getServerTime() {
  const { data, error } = await supabase.rpc('get_server_timestamp');
  if (error) throw error;
  return data;
}
