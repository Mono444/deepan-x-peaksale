import { supabase } from '../lib/supabaseClient';

/**
 * Activity Service - Login tracking and audit logs
 */

export async function getLoginActivity(filters = {}) {
  let query = supabase
    .from('login_activity')
    .select('*')
    .order('login_time', { ascending: false });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }
  if (filters.date) {
    query = query.gte('login_time', `${filters.date}T00:00:00`)
                 .lt('login_time', `${filters.date}T23:59:59`);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.role) {
    query = query.eq('role', filters.role);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRecentLogins(limit = 10) {
  const { data, error } = await supabase
    .from('login_activity')
    .select('*')
    .eq('status', 'success')
    .order('login_time', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function logAuditEvent(performedBy, action, targetUserId = null, details = {}) {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      performed_by: performedBy,
      action,
      target_user_id: targetUserId,
      details,
    });

  if (error) console.error('Audit log error:', error);
}

export async function getAuditLogs(filters = {}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.performedBy) {
    query = query.eq('performed_by', filters.performedBy);
  }
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
