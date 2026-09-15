# PeakSales Employee Portal

A full-stack employee attendance tracking and daily work reporting web application built with **React** and **Supabase**.

## Features

### Employee Features
- ✅ Employee ID + Password login
- ✅ Personal dashboard with attendance status
- ✅ Check-in / Check-out with server timestamps
- ✅ Monthly attendance history with summary
- ✅ Daily work report submission
- ✅ View submitted work reports with admin reviews
- ✅ Full profile view

### Admin Features
- ✅ Admin email + Password login (separate)
- ✅ Dashboard with real-time stats
- ✅ Add / Edit / Deactivate employees
- ✅ Reset employee passwords
- ✅ View all attendance records with filters
- ✅ View all work reports with admin review
- ✅ Login activity tracking
- ✅ CSV export for attendance and reports
- ✅ Audit logging

### Security
- ✅ Supabase Auth (hashed passwords)
- ✅ Row Level Security (RLS) policies
- ✅ Role-based access control
- ✅ Deactivated users blocked from login
- ✅ Environment variables for secrets
- ✅ No plain-text passwords

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (custom design system) |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL) |
| Icons | Lucide React |
| Date Utils | date-fns |

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Note your **Project URL** and **anon public key** from Settings → API

### 2. Run Database Migrations

In Supabase Dashboard → SQL Editor, run these files **in order**:

1. `supabase/migrations/001_schema.sql` — Creates tables
2. `supabase/migrations/002_rls_policies.sql` — Creates security policies
3. `supabase/migrations/003_functions.sql` — Creates helper functions

### 3. Create Auth Users

In Supabase Dashboard → Authentication → Users → Add User:

| Email | Password | Purpose |
|-------|----------|---------|
| admin@peaksales.com | Admin@12345 | Admin account |
| emp001@peaksales.com | Emp@12345 | Test employee 1 |
| emp002@peaksales.com | Emp@12345 | Test employee 2 |

> **Important:** Set "Auto confirm email" to ON in Authentication → Settings → Email

### 4. Seed Database

After creating auth users, get their UUIDs from the Users table, then:

1. Open `supabase/seed.sql`
2. Uncomment the INSERT statements
3. Replace `REPLACE-WITH-*-UUID` with actual UUIDs
4. Run in SQL Editor

### 5. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your Supabase values
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Login Credentials (Test)

| Login Type | Credential | Password |
|-----------|-----------|----------|
| Employee | Employee ID: `EMP001` | `Emp@12345` |
| Employee | Employee ID: `EMP002` | `Emp@12345` |
| Admin | Email: `admin@peaksales.com` | `Admin@12345` |

---

## Project Structure

```
src/
├── components/
│   ├── common/         # ProtectedRoute
│   └── layout/         # Sidebar, Header, AppLayout, MobileNav
├── contexts/           # AuthContext, ToastContext
├── hooks/              # Custom hooks
├── lib/                # Supabase client, utilities
├── pages/
│   ├── auth/           # EmployeeLogin, AdminLogin
│   ├── employee/       # Dashboard, Profile, Attendance, Reports
│   └── admin/          # Dashboard, Employees, Attendance, Reports, Activity
├── services/           # employeeService, attendanceService, etc.
├── styles/             # Global CSS design system
├── App.jsx             # Root with routing
└── main.jsx            # Entry point

supabase/
├── migrations/         # SQL schema, RLS, functions
└── seed.sql            # Test data
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Auth user extension (role, active status) |
| `employee_profiles` | Full employee details |
| `attendance_records` | Check-in/out with hours |
| `work_reports` | Daily work reports |
| `login_activity` | Login/logout tracking |
| `audit_logs` | Admin action audit trail |

---

## Maintenance

### Mark Missing Checkouts
Run this SQL daily (via Supabase scheduled function or manually):
```sql
SELECT mark_missing_checkouts();
```

### Password Reset
Admin can reset from Employee List, or use Supabase Dashboard → Authentication → Users.

---

## License

Internal use only — PeakSales.
