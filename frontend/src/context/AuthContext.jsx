import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const AuthContext = createContext(null);

const MOCK_STORAGE_KEYS = {
  USERS: 'nhaa_mock_users',
  PROFILES: 'nhaa_mock_profiles',
  SESSION: 'nhaa_mock_session'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 1. Fetch user's server-side profile from 'profiles' table
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('Error fetching profile from Supabase:', error.message);
          return null;
        }
        return data;
      } catch (err) {
        console.error('Fetch profile exception:', err);
        return null;
      }
    } else {
      // Mock storage profile lookup
      const profiles = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEYS.PROFILES) || '[]');
      return profiles.find(p => p.id === userId) || null;
    }
  };

  // 2. Auth State Initializer & Listener
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      setLoading(true);

      if (isSupabaseConfigured()) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (initialSession && isMounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            const userProf = await fetchUserProfile(initialSession.user.id);
            if (isMounted) setProfile(userProf);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
        } finally {
          if (isMounted) setLoading(false);
        }

        // Real-time listener for login/logout/token refresh
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (!isMounted) return;
          setSession(currentSession);
          setUser(currentSession?.user || null);

          if (currentSession?.user) {
            const userProf = await fetchUserProfile(currentSession.user.id);
            if (isMounted) setProfile(userProf);
          } else {
            if (isMounted) setProfile(null);
          }
          if (isMounted) setLoading(false);
        });

        return () => {
          subscription?.unsubscribe();
        };
      } else {
        // Fallback local mock session restoration
        try {
          const savedSession = localStorage.getItem(MOCK_STORAGE_KEYS.SESSION);
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            setUser(parsed.user);
            setProfile(parsed.profile);
            setSession(parsed);
          }
        } catch (e) {}
        if (isMounted) setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Citizen Registration Flow
  const signUpCitizen = async ({ email, password, fullName, phone, stateRegion, category }) => {
    setAuthError(null);
    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone ? phone.trim() : null,
              state_region: stateRegion || 'Uttar Pradesh',
              category: category || 'SC',
              role: 'citizen' // Server trigger enforces citizen role
            }
          }
        });

        if (error) throw error;

        if (data?.user) {
          setUser(data.user);
          setSession(data.session);
          // Fetch created profile (populated by trigger)
          let userProf = await fetchUserProfile(data.user.id);
          if (!userProf) {
            userProf = {
              id: data.user.id,
              full_name: fullName,
              email: email.toLowerCase(),
              phone: phone,
              role: 'citizen',
              state_region: stateRegion,
              category: category
            };
          }
          setProfile(userProf);
          return { user: data.user, session: data.session, profile: userProf };
        }
      } catch (err) {
        setAuthError(err.message || 'Registration failed.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Mock citizen registration
      const newUserId = `cit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newMockUser = {
        id: newUserId,
        email: email.toLowerCase(),
        user_metadata: { full_name: fullName, phone }
      };
      const newMockProfile = {
        id: newUserId,
        full_name: fullName,
        email: email.toLowerCase(),
        phone,
        role: 'citizen',
        state_region: stateRegion || 'Uttar Pradesh',
        category: category || 'SC',
        created_at: new Date().toISOString()
      };

      const profiles = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEYS.PROFILES) || '[]');
      profiles.push(newMockProfile);
      localStorage.setItem(MOCK_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

      const mockSession = { user: newMockUser, profile: newMockProfile };
      localStorage.setItem(MOCK_STORAGE_KEYS.SESSION, JSON.stringify(mockSession));
      setUser(newMockUser);
      setProfile(newMockProfile);
      setSession(mockSession);
      setLoading(false);
      return { user: newMockUser, profile: newMockProfile };
    }
  };

  // 4. Universal / Citizen Sign In
  const signIn = async ({ email, password }) => {
    setAuthError(null);
    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (error) throw error;

        setUser(data.user);
        setSession(data.session);
        const userProf = await fetchUserProfile(data.user.id);
        setProfile(userProf);
        return { user: data.user, session: data.session, profile: userProf };
      } catch (err) {
        setAuthError(err.message || 'Invalid email or password.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Mock Sign In
      const cleanEmail = email.trim().toLowerCase();
      const profiles = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEYS.PROFILES) || '[]');
      let userProf = profiles.find(p => p.email.toLowerCase() === cleanEmail);

      if (!userProf) {
        // Auto create demo citizen profile if testing
        userProf = {
          id: `cit-${Date.now()}`,
          full_name: cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: '9876543210',
          role: cleanEmail.includes('officer') ? 'officer' : 'citizen',
          state_region: 'Uttar Pradesh',
          category: 'SC',
          created_at: new Date().toISOString()
        };
        profiles.push(userProf);
        localStorage.setItem(MOCK_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      }

      const mockUser = { id: userProf.id, email: userProf.email };
      const mockSession = { user: mockUser, profile: userProf };
      localStorage.setItem(MOCK_STORAGE_KEYS.SESSION, JSON.stringify(mockSession));
      setUser(mockUser);
      setProfile(userProf);
      setSession(mockSession);
      setLoading(false);
      return { user: mockUser, profile: userProf };
    }
  };

  // 5. Dedicated Officer Sign In with Server-Side Role Enforcement
  const signInOfficer = async ({ email, password }) => {
    setAuthError(null);
    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (error) throw error;

        // Fetch database profile and verify officer role
        const userProf = await fetchUserProfile(data.user.id);

        if (!userProf || userProf.role !== 'officer') {
          // Strictly reject non-officer accounts
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setSession(null);
          const deniedErr = new Error('Access Denied: This account does not possess authorized officer credentials.');
          setAuthError(deniedErr.message);
          throw deniedErr;
        }

        setUser(data.user);
        setSession(data.session);
        setProfile(userProf);
        return { user: data.user, session: data.session, profile: userProf };
      } catch (err) {
        setAuthError(err.message || 'Officer authentication failed.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Mock Officer Login
      const cleanEmail = email.trim().toLowerCase();
      const profiles = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEYS.PROFILES) || '[]');
      let userProf = profiles.find(p => p.email.toLowerCase() === cleanEmail && p.role === 'officer');

      if (!userProf && cleanEmail.includes('officer')) {
        userProf = {
          id: '11111111-1111-4111-a111-111111111111',
          full_name: 'Inspector Rajesh Verma',
          email: cleanEmail,
          phone: '9876543210',
          role: 'officer',
          state_region: 'Uttar Pradesh',
          badge_number: 'NHAA-OFF-101',
          created_at: new Date().toISOString()
        };
        profiles.push(userProf);
        localStorage.setItem(MOCK_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      }

      if (!userProf || userProf.role !== 'officer') {
        const deniedErr = new Error('Access Denied: Unauthorized officer credentials.');
        setAuthError(deniedErr.message);
        setLoading(false);
        throw deniedErr;
      }

      const mockUser = { id: userProf.id, email: userProf.email };
      const mockSession = { user: mockUser, profile: userProf };
      localStorage.setItem(MOCK_STORAGE_KEYS.SESSION, JSON.stringify(mockSession));
      setUser(mockUser);
      setProfile(userProf);
      setSession(mockSession);
      setLoading(false);
      return { user: mockUser, profile: userProf };
    }
  };

  // 6. Sign Out
  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    localStorage.removeItem(MOCK_STORAGE_KEYS.SESSION);
    setUser(null);
    setProfile(null);
    setSession(null);
    setAuthError(null);
    setLoading(false);
  };

  // 7. Forgot Password / Password Reset Email Request
  const resetPasswordForEmail = async (email) => {
    if (isSupabaseConfigured()) {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectUrl
      });
      if (error) throw error;
      return true;
    } else {
      // Mock password reset request
      return true;
    }
  };

  // 8. Update Password (after receiving reset link)
  const updatePassword = async (newPassword) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return data;
    } else {
      return true;
    }
  };

  // 9. Refresh Profile
  const refreshProfile = async () => {
    if (user?.id) {
      const p = await fetchUserProfile(user.id);
      setProfile(p);
    }
  };

  const isOfficer = profile?.role === 'officer';
  const isCitizen = profile?.role === 'citizen' || (!isOfficer && !!user);

  const value = {
    user,
    profile,
    session,
    loading,
    authError,
    isOfficer,
    isCitizen,
    signUpCitizen,
    signIn,
    signInOfficer,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
