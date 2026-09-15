-- ============================================
-- Employee Portal Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. EMPLOYEE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_title VARCHAR(100) NOT NULL DEFAULT '',
  date_of_birth DATE,
  date_of_joining DATE,
  blood_group VARCHAR(10),
  address TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  emergency_contact VARCHAR(20),
  pf_number VARCHAR(50),
  esi_number VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. ATTENDANCE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  total_hours NUMERIC(5,2),
  status VARCHAR(30) NOT NULL DEFAULT 'checked_in' CHECK (status IN ('present', 'checked_in', 'missing_checkout')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- 4. WORK REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.work_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_completed TEXT NOT NULL DEFAULT '',
  tasks_handled TEXT DEFAULT '',
  pending_work TEXT DEFAULT '',
  issues_blockers TEXT DEFAULT '',
  plan_tomorrow TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  admin_review TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. LOGIN ACTIVITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.login_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  employee_id VARCHAR(50),
  role VARCHAR(20),
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_work_reports_user_date ON public.work_reports(user_id, report_date);
CREATE INDEX IF NOT EXISTS idx_login_activity_user ON public.login_activity(user_id, login_time);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user ON public.employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed ON public.audit_logs(performed_by, created_at);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_profiles_updated_at
  BEFORE UPDATE ON public.employee_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_reports_updated_at
  BEFORE UPDATE ON public.work_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
