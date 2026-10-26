-- ============================================
-- Row Level Security Policies
-- Run this AFTER 001_schema.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if current user is admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check if current user is active
-- ============================================
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- EMPLOYEE PROFILES POLICIES
-- ============================================
CREATE POLICY "Employees can view own profile"
  ON public.employee_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.employee_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.employee_profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update profiles"
  ON public.employee_profiles FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- ATTENDANCE RECORDS POLICIES
-- ============================================
CREATE POLICY "Employees can view own attendance"
  ON public.attendance_records FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Employees can insert own attendance"
  ON public.attendance_records FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_active_user());

CREATE POLICY "Employees can update own attendance"
  ON public.attendance_records FOR UPDATE
  USING (user_id = auth.uid() AND public.is_active_user());

CREATE POLICY "Admins can view all attendance"
  ON public.attendance_records FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all attendance"
  ON public.attendance_records FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- WORK REPORTS POLICIES
-- ============================================
CREATE POLICY "Employees can view own reports"
  ON public.work_reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Employees can insert own reports"
  ON public.work_reports FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_active_user());

CREATE POLICY "Employees can update own reports"
  ON public.work_reports FOR UPDATE
  USING (user_id = auth.uid() AND public.is_active_user());

CREATE POLICY "Admins can view all reports"
  ON public.work_reports FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all reports"
  ON public.work_reports FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- LOGIN ACTIVITY POLICIES
-- ============================================
CREATE POLICY "Users can insert own login activity"
  ON public.login_activity FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Employees can view own login activity"
  ON public.login_activity FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all login activity"
  ON public.login_activity FOR SELECT
  USING (public.is_admin());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
