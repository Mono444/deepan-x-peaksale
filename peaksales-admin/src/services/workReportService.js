import { supabase } from '../lib/supabaseClient';

/**
 * Work Report Service - Submit and manage daily work reports
 */

export async function submitWorkReport(userId, reportData) {
  const { data, error } = await supabase
    .from('work_reports')
    .insert({
      user_id: userId,
      report_date: reportData.report_date,
      work_completed: reportData.work_completed,
      tasks_handled: reportData.tasks_handled || '',
      pending_work: reportData.pending_work || '',
      issues_blockers: reportData.issues_blockers || '',
      plan_tomorrow: reportData.plan_tomorrow || '',
      notes: reportData.notes || '',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkReport(reportId, reportData) {
  const { data, error } = await supabase
    .from('work_reports')
    .update({
      work_completed: reportData.work_completed,
      tasks_handled: reportData.tasks_handled,
      pending_work: reportData.pending_work,
      issues_blockers: reportData.issues_blockers,
      plan_tomorrow: reportData.plan_tomorrow,
      notes: reportData.notes,
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyReports(userId, filters = {}) {
  let query = supabase
    .from('work_reports')
    .select('*')
    .eq('user_id', userId)
    .order('report_date', { ascending: false });

  if (filters.startDate) {
    query = query.gte('report_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('report_date', filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAllReports(filters = {}) {
  let query = supabase
    .from('work_reports')
    .select(`
      *,
      employee_profiles!inner(first_name, last_name, employee_id, role_title)
    `)
    .order('report_date', { ascending: false });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.date) {
    query = query.eq('report_date', filters.date);
  }
  if (filters.startDate) {
    query = query.gte('report_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('report_date', filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function addReviewComment(reportId, comment, adminId) {
  const { data, error } = await supabase
    .from('work_reports')
    .update({
      admin_review: comment,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReportByDate(userId, date) {
  const { data, error } = await supabase
    .from('work_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('report_date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}
