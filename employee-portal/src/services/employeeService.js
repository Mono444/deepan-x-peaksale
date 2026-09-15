import { supabase } from '../lib/supabaseClient';

/**
 * Employee Service - CRUD operations for employee management
 */

export async function getAllEmployees(filters = {}) {
  let query = supabase
    .from('employee_profiles')
    .select(`
      *,
      users!inner(id, employee_id, role, is_active)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getEmployeeProfile(userId) {
  const { data, error } = await supabase
    .from('employee_profiles')
    .select(`
      *,
      users!inner(id, employee_id, role, is_active)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getEmployeeByEmployeeId(employeeId) {
  const { data, error } = await supabase
    .from('employee_profiles')
    .select(`
      *,
      users!inner(id, employee_id, role, is_active)
    `)
    .eq('employee_id', employeeId)
    .single();

  if (error) throw error;
  return data;
}

export async function createEmployee(employeeData, password) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin
    ? await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: employeeData.email,
          password: password,
          email_confirm: true,
        }),
      }).then(r => r.json()).then(d => ({ data: d, error: null }))
    : { data: null, error: { message: 'Admin API not available' } };

  // Fallback: Use signUp for creating users (works without admin API)
  let userId;
  if (!authData?.id) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: employeeData.email,
      password: password,
      options: {
        data: {
          employee_id: employeeData.employee_id,
          role: 'employee',
        },
      },
    });

    if (signUpError) throw signUpError;
    userId = signUpData.user?.id;
  } else {
    userId = authData.id;
  }

  if (!userId) throw new Error('Failed to create user account');

  // 2. Create users record
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      employee_id: employeeData.employee_id,
      role: 'employee',
      is_active: true,
    });

  if (userError) throw userError;

  // 3. Create employee profile
  const { data: profile, error: profileError } = await supabase
    .from('employee_profiles')
    .insert({
      user_id: userId,
      employee_id: employeeData.employee_id,
      first_name: employeeData.first_name,
      last_name: employeeData.last_name,
      role_title: employeeData.role_title || '',
      date_of_birth: employeeData.date_of_birth || null,
      date_of_joining: employeeData.date_of_joining || null,
      blood_group: employeeData.blood_group || null,
      address: employeeData.address || '',
      email: employeeData.email,
      phone: employeeData.phone || '',
      emergency_contact: employeeData.emergency_contact || '',
      pf_number: employeeData.pf_number || '',
      esi_number: employeeData.esi_number || '',
      status: 'active',
    })
    .select()
    .single();

  if (profileError) throw profileError;

  return profile;
}

export async function updateEmployee(userId, updates) {
  const { data, error } = await supabase
    .from('employee_profiles')
    .update({
      first_name: updates.first_name,
      last_name: updates.last_name,
      role_title: updates.role_title,
      date_of_birth: updates.date_of_birth || null,
      date_of_joining: updates.date_of_joining || null,
      blood_group: updates.blood_group || null,
      address: updates.address,
      email: updates.email,
      phone: updates.phone,
      emergency_contact: updates.emergency_contact,
      pf_number: updates.pf_number,
      esi_number: updates.esi_number,
      status: updates.status,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Also update is_active in users table
  if (updates.status) {
    await supabase
      .from('users')
      .update({ is_active: updates.status === 'active' })
      .eq('id', userId);
  }

  return data;
}

export async function deactivateEmployee(userId) {
  const { error: profileError } = await supabase
    .from('employee_profiles')
    .update({ status: 'inactive' })
    .eq('user_id', userId);

  if (profileError) throw profileError;

  const { error: userError } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', userId);

  if (userError) throw userError;

  return true;
}

export async function activateEmployee(userId) {
  const { error: profileError } = await supabase
    .from('employee_profiles')
    .update({ status: 'active' })
    .eq('user_id', userId);

  if (profileError) throw profileError;

  const { error: userError } = await supabase
    .from('users')
    .update({ is_active: true })
    .eq('id', userId);

  if (userError) throw userError;

  return true;
}

export async function resetEmployeePassword(userId, newPassword) {
  // This requires admin API or Edge Function
  // For now, we'll use Supabase auth admin update
  const { error } = await supabase.auth.admin?.updateUserById?.(userId, {
    password: newPassword,
  }) || { error: { message: 'Password reset requires Supabase Admin API. Use Dashboard instead.' } };

  if (error) throw error;
  return true;
}
