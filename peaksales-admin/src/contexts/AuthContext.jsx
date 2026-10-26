import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Load user profile from our custom users table
  const loadUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUserProfile(null);
      return null;
    }

    try {
      // Get user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) throw userError;

      // Get employee profile
      const { data: profileData } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      const fullProfile = {
        ...userData,
        profile: profileData,
        authUser,
      };

      setUserProfile(fullProfile);
      return fullProfile;
    } catch (err) {
      console.error('Error loading user profile:', err);
      setUserProfile(null);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadUserProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  // Employee login (using employee ID + password)
  const loginEmployee = useCallback(async (employeeId, password) => {
    try {
      // First, look up the email associated with this employee ID
      const { data: lookupData, error: lookupError } = await supabase
        .rpc('get_user_by_employee_id', { p_employee_id: employeeId });

      if (lookupError || !lookupData) {
        return { success: false, message: 'Invalid Employee ID' };
      }

      const userData = typeof lookupData === 'string' ? JSON.parse(lookupData) : lookupData;

      if (!userData.is_active) {
        // Log failed login attempt
        await supabase.from('login_activity').insert({
          employee_id: employeeId,
          role: 'employee',
          status: 'failed',
          user_agent: navigator.userAgent,
        });
        return { success: false, message: 'Your account has been deactivated. Please contact admin.' };
      }

      if (!userData.email) {
        return { success: false, message: 'No email associated with this Employee ID' };
      }

      // Sign in with email + password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (authError) {
        // Log failed attempt
        await supabase.from('login_activity').insert({
          employee_id: employeeId,
          role: 'employee',
          status: 'failed',
          user_agent: navigator.userAgent,
        });
        return { success: false, message: 'Invalid password' };
      }

      // Log successful login
      await supabase.from('login_activity').insert({
        user_id: authData.user.id,
        employee_id: employeeId,
        role: 'employee',
        status: 'success',
        user_agent: navigator.userAgent,
      });

      const profile = await loadUserProfile(authData.user);
      return { success: true, user: profile };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'An error occurred during login' };
    }
  }, [loadUserProfile]);

  // Admin login (using email + password)
  const loginAdmin = useCallback(async (email, password) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        await supabase.from('login_activity').insert({
          employee_id: email,
          role: 'admin',
          status: 'failed',
          user_agent: navigator.userAgent,
        });
        return { success: false, message: 'Invalid email or password' };
      }

      // Verify admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData || userData.role !== 'admin') {
        await supabase.auth.signOut();
        return { success: false, message: 'Access denied. Admin login only.' };
      }

      if (!userData.is_active) {
        await supabase.auth.signOut();
        return { success: false, message: 'Your admin account has been deactivated.' };
      }

      // Log successful login
      await supabase.from('login_activity').insert({
        user_id: authData.user.id,
        employee_id: email,
        role: 'admin',
        status: 'success',
        user_agent: navigator.userAgent,
      });

      const profile = await loadUserProfile(authData.user);
      return { success: true, user: profile };
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false, message: 'An error occurred during login' };
    }
  }, [loadUserProfile]);

  // Logout
  const logout = useCallback(async () => {
    try {
      // Log logout time
      if (user) {
        const { data: lastLogin } = await supabase
          .from('login_activity')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'success')
          .is('logout_time', null)
          .order('login_time', { ascending: false })
          .limit(1)
          .single();

        if (lastLogin) {
          await supabase
            .from('login_activity')
            .update({ logout_time: new Date().toISOString() })
            .eq('id', lastLogin.id);
        }
      }

      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Force clear state even on error
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
    }
  }, [user]);

  const value = {
    user,
    userProfile,
    session,
    loading,
    loginEmployee,
    loginAdmin,
    logout,
    refreshProfile: () => user && loadUserProfile(user),
    isAdmin: userProfile?.role === 'admin',
    isEmployee: userProfile?.role === 'employee',
    isAuthenticated: !!user && !!userProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
