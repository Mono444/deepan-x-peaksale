-- ============================================
-- Database Functions
-- Run this AFTER 002_rls_policies.sql
-- ============================================

-- ============================================
-- Get server timestamp (IST)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_server_timestamp()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Check In Function
-- Handles duplicate prevention
-- ============================================
CREATE OR REPLACE FUNCTION public.perform_check_in(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_existing RECORD;
  v_record RECORD;
  v_now TIMESTAMPTZ;
BEGIN
  v_now := NOW();
  
  -- Check if already checked in today
  SELECT * INTO v_existing
  FROM public.attendance_records
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  IF v_existing IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Already checked in today',
      'record', row_to_json(v_existing)
    );
  END IF;
  
  -- Insert new check-in
  INSERT INTO public.attendance_records (user_id, date, check_in_time, status)
  VALUES (p_user_id, CURRENT_DATE, v_now, 'checked_in')
  RETURNING * INTO v_record;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Checked in successfully',
    'record', row_to_json(v_record)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Check Out Function
-- Calculates total working hours
-- ============================================
CREATE OR REPLACE FUNCTION public.perform_check_out(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_existing RECORD;
  v_hours NUMERIC;
  v_now TIMESTAMPTZ;
BEGIN
  v_now := NOW();
  
  -- Find today's check-in
  SELECT * INTO v_existing
  FROM public.attendance_records
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  IF v_existing IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No check-in found for today'
    );
  END IF;
  
  IF v_existing.check_out_time IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Already checked out today',
      'record', row_to_json(v_existing)
    );
  END IF;
  
  -- Calculate hours
  v_hours := ROUND(EXTRACT(EPOCH FROM (v_now - v_existing.check_in_time)) / 3600.0, 2);
  
  -- Update record
  UPDATE public.attendance_records
  SET check_out_time = v_now,
      total_hours = v_hours,
      status = 'present'
  WHERE id = v_existing.id;
  
  -- Fetch updated record
  SELECT * INTO v_existing
  FROM public.attendance_records
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Checked out successfully',
    'total_hours', v_hours,
    'record', row_to_json(v_existing)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Get Attendance Summary for a user/month
-- ============================================
CREATE OR REPLACE FUNCTION public.get_attendance_summary(
  p_user_id UUID,
  p_month INT DEFAULT NULL,
  p_year INT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_month INT;
  v_year INT;
  v_present INT;
  v_missing INT;
  v_total_hours NUMERIC;
  v_days_in_month INT;
BEGIN
  v_month := COALESCE(p_month, EXTRACT(MONTH FROM CURRENT_DATE)::INT);
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
  
  -- Count present days
  SELECT COUNT(*) INTO v_present
  FROM public.attendance_records
  WHERE user_id = p_user_id
    AND EXTRACT(MONTH FROM date) = v_month
    AND EXTRACT(YEAR FROM date) = v_year
    AND status = 'present';
  
  -- Count missing checkout days
  SELECT COUNT(*) INTO v_missing
  FROM public.attendance_records
  WHERE user_id = p_user_id
    AND EXTRACT(MONTH FROM date) = v_month
    AND EXTRACT(YEAR FROM date) = v_year
    AND status IN ('checked_in', 'missing_checkout');
  
  -- Total working hours
  SELECT COALESCE(SUM(total_hours), 0) INTO v_total_hours
  FROM public.attendance_records
  WHERE user_id = p_user_id
    AND EXTRACT(MONTH FROM date) = v_month
    AND EXTRACT(YEAR FROM date) = v_year;
  
  -- Days in month
  v_days_in_month := EXTRACT(DAY FROM
    (DATE_TRUNC('month', MAKE_DATE(v_year, v_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day')
  )::INT;
  
  RETURN json_build_object(
    'month', v_month,
    'year', v_year,
    'present_days', v_present,
    'missing_checkout_days', v_missing,
    'absent_days', GREATEST(0, v_days_in_month - v_present - v_missing),
    'total_hours', v_total_hours,
    'days_in_month', v_days_in_month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Get Admin Dashboard Stats
-- ============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_total_employees INT;
  v_active_employees INT;
  v_today_present INT;
  v_today_missing INT;
BEGIN
  SELECT COUNT(*) INTO v_total_employees
  FROM public.users WHERE role = 'employee';
  
  SELECT COUNT(*) INTO v_active_employees
  FROM public.users WHERE role = 'employee' AND is_active = true;
  
  SELECT COUNT(*) INTO v_today_present
  FROM public.attendance_records
  WHERE date = CURRENT_DATE AND status = 'present';
  
  SELECT COUNT(*) INTO v_today_missing
  FROM public.attendance_records
  WHERE date = CURRENT_DATE AND status IN ('checked_in', 'missing_checkout');
  
  RETURN json_build_object(
    'total_employees', v_total_employees,
    'active_employees', v_active_employees,
    'today_present', v_today_present,
    'today_absent', v_active_employees - v_today_present - v_today_missing,
    'today_missing_checkout', v_today_missing
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Mark Missing Checkouts (run daily via cron or manually)
-- Marks yesterday's checked_in records as missing_checkout
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_missing_checkouts()
RETURNS VOID AS $$
BEGIN
  UPDATE public.attendance_records
  SET status = 'missing_checkout'
  WHERE status = 'checked_in'
    AND date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Get user by employee_id (for login)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_by_employee_id(p_employee_id VARCHAR)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT u.id, u.employee_id, u.role, u.is_active, ep.email, ep.first_name, ep.last_name
  INTO v_user
  FROM public.users u
  LEFT JOIN public.employee_profiles ep ON ep.user_id = u.id
  WHERE u.employee_id = p_employee_id;
  
  IF v_user IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN row_to_json(v_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
