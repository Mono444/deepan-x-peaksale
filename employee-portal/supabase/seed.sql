-- ============================================
-- Seed Data for Testing
-- Run AFTER all migrations
-- ============================================
-- NOTE: Before running this seed, you must first create auth users
-- through Supabase Auth (Dashboard > Authentication > Users > Add User)
-- 
-- Create these users in Supabase Auth:
-- 1. Admin: admin@peaksales.com / Admin@12345
-- 2. Employee 1: emp001@peaksales.com / Emp@12345
-- 3. Employee 2: emp002@peaksales.com / Emp@12345
-- 4. Employee 3: emp003@peaksales.com / Emp@12345
--
-- After creating auth users, replace the UUIDs below with the actual
-- UUIDs from the auth.users table.
-- ============================================

-- Replace these with actual UUIDs from auth.users after creating them
-- You can find them in Supabase Dashboard > Authentication > Users

-- Example seed (replace UUIDs):
/*
-- Admin user
INSERT INTO public.users (id, employee_id, role, is_active)
VALUES ('REPLACE-WITH-ADMIN-UUID', 'ADMIN001', 'admin', true);

INSERT INTO public.employee_profiles (user_id, employee_id, first_name, last_name, role_title, date_of_birth, date_of_joining, blood_group, address, email, phone, emergency_contact, pf_number, esi_number, status)
VALUES ('REPLACE-WITH-ADMIN-UUID', 'ADMIN001', 'System', 'Administrator', 'Administrator', '1990-01-01', '2020-01-01', 'O+', '123 Admin Street, City', 'admin@peaksales.com', '9876543210', '9876543211', 'PF-ADMIN-001', 'ESI-ADMIN-001', 'active');

-- Employee 1
INSERT INTO public.users (id, employee_id, role, is_active)
VALUES ('REPLACE-WITH-EMP1-UUID', 'EMP001', 'employee', true);

INSERT INTO public.employee_profiles (user_id, employee_id, first_name, last_name, role_title, date_of_birth, date_of_joining, blood_group, address, email, phone, emergency_contact, pf_number, esi_number, status)
VALUES ('REPLACE-WITH-EMP1-UUID', 'EMP001', 'Ravi', 'Kumar', 'Sales Executive', '1995-05-15', '2023-03-01', 'B+', '45 MG Road, Chennai', 'emp001@peaksales.com', '9876543212', '9876543213', 'PF-EMP-001', 'ESI-EMP-001', 'active');

-- Employee 2
INSERT INTO public.users (id, employee_id, role, is_active)
VALUES ('REPLACE-WITH-EMP2-UUID', 'EMP002', 'employee', true);

INSERT INTO public.employee_profiles (user_id, employee_id, first_name, last_name, role_title, date_of_birth, date_of_joining, blood_group, address, email, phone, emergency_contact, pf_number, esi_number, status)
VALUES ('REPLACE-WITH-EMP2-UUID', 'EMP002', 'Priya', 'Sharma', 'Marketing Manager', '1993-08-22', '2022-07-15', 'A+', '78 Anna Nagar, Chennai', 'emp002@peaksales.com', '9876543214', '9876543215', 'PF-EMP-002', 'ESI-EMP-002', 'active');

-- Employee 3 (inactive)
INSERT INTO public.users (id, employee_id, role, is_active)
VALUES ('REPLACE-WITH-EMP3-UUID', 'EMP003', 'employee', false);

INSERT INTO public.employee_profiles (user_id, employee_id, first_name, last_name, role_title, date_of_birth, date_of_joining, blood_group, address, email, phone, emergency_contact, pf_number, esi_number, status)
VALUES ('REPLACE-WITH-EMP3-UUID', 'EMP003', 'Ankit', 'Patel', 'Delivery Agent', '1998-12-10', '2024-01-10', 'AB-', '22 T Nagar, Chennai', 'emp003@peaksales.com', '9876543216', '9876543217', 'PF-EMP-003', 'ESI-EMP-003', 'inactive');

-- Sample attendance records for Employee 1
INSERT INTO public.attendance_records (user_id, date, check_in_time, check_out_time, total_hours, status)
VALUES
  ('REPLACE-WITH-EMP1-UUID', CURRENT_DATE - INTERVAL '1 day', (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP + TIME '09:00:00', (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP + TIME '18:00:00', 9.00, 'present'),
  ('REPLACE-WITH-EMP1-UUID', CURRENT_DATE - INTERVAL '2 days', (CURRENT_DATE - INTERVAL '2 days')::TIMESTAMP + TIME '09:15:00', (CURRENT_DATE - INTERVAL '2 days')::TIMESTAMP + TIME '17:45:00', 8.50, 'present'),
  ('REPLACE-WITH-EMP1-UUID', CURRENT_DATE - INTERVAL '3 days', (CURRENT_DATE - INTERVAL '3 days')::TIMESTAMP + TIME '09:30:00', NULL, NULL, 'missing_checkout');

-- Sample work report for Employee 1
INSERT INTO public.work_reports (user_id, report_date, work_completed, tasks_handled, pending_work, issues_blockers, plan_tomorrow, notes)
VALUES
  ('REPLACE-WITH-EMP1-UUID', CURRENT_DATE - INTERVAL '1 day', 'Completed client follow-up calls', '5 calls, 2 meetings, 3 leads', 'Proposal for ABC Corp', 'None', 'Follow up on proposal', 'Good productive day');
*/

-- ============================================
-- Quick setup instructions:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" for each user above
-- 3. Copy the UUID for each created user
-- 4. Uncomment the INSERT statements above
-- 5. Replace 'REPLACE-WITH-*-UUID' with actual UUIDs
-- 6. Run the modified seed in SQL Editor
-- ============================================
