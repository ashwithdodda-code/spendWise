import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { isFirebaseConfigured, getFirebaseAuth } from '../services/firebase';
import { getUserProfile, saveUserProfile } from '../services/storage';
import { DEMO_PROFILES } from '../utils/sampleData';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  isDemoUser: boolean;
  loginAsDemoStudent: (userId: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  switchDemoProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'spendwise_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseActive, setIsFirebaseActive] = useState(isFirebaseConfigured());

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const firebaseActive = isFirebaseConfigured();
      setIsFirebaseActive(firebaseActive);

      if (firebaseActive) {
        const auth = getFirebaseAuth();
        if (auth) {
          onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
              const profile = await getUserProfile(fbUser.uid);
              if (profile) {
                setUser(profile);
              } else {
                const newProfile: UserProfile = {
                  userId: fbUser.uid,
                  displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
                  email: fbUser.email || '',
                  currency: 'INR',
                  currencySymbol: '₹',
                  monthlyBudget: 12000,
                  theme: 'system',
                  alertThresholds: [75, 90, 100],
                  isDemoUser: false,
                  createdAt: new Date().toISOString(),
                };
                await saveUserProfile(newProfile);
                setUser(newProfile);
              }
            } else {
              // Check local active user if any
              checkLocalSession();
            }
            setLoading(false);
          });
          return;
        }
      }

      await checkLocalSession();
      setLoading(false);
    };

    const checkLocalSession = async () => {
      const activeId = localStorage.getItem(CURRENT_USER_KEY);
      if (activeId) {
        const profile = await getUserProfile(activeId);
        if (profile) {
          setUser(profile);
          return;
        }
      }
      // By default load Priya Sharma (Hosteller) demo student for immediate interactivity
      const defaultDemo = DEMO_PROFILES[0];
      localStorage.setItem(CURRENT_USER_KEY, defaultDemo.profile.userId);
      const loaded = await getUserProfile(defaultDemo.profile.userId);
      setUser(loaded || defaultDemo.profile);
    };

    initAuth();
  }, []);

  const loginAsDemoStudent = async (userId: string) => {
    setLoading(true);
    const demo = DEMO_PROFILES.find(d => d.profile.userId === userId);
    if (demo) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
      const profile = await getUserProfile(userId);
      setUser(profile || demo.profile);
    }
    setLoading(false);
  };

  const switchDemoProfile = async (userId: string) => {
    await loginAsDemoStudent(userId);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth();
        if (auth) {
          const cred = await signInWithEmailAndPassword(auth, email, pass);
          const profile = await getUserProfile(cred.user.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem(CURRENT_USER_KEY, profile.userId);
          }
          setLoading(false);
          return { success: true };
        }
      }

      // Check registered local users
      const usersStr = localStorage.getItem('spendwise_registered_users');
      const users: Array<{ id: string; email: string; pass: string; name: string }> = usersStr ? JSON.parse(usersStr) : [];
      const match = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!match) {
        setLoading(false);
        return { success: false, error: 'No student account found with this email. Please check your credentials or create an account.' };
      }

      if (match.pass !== pass) {
        setLoading(false);
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      const profile = await getUserProfile(match.id);
      if (profile) {
        setUser(profile);
        localStorage.setItem(CURRENT_USER_KEY, profile.userId);
      }
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth();
        if (auth) {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          const newProfile: UserProfile = {
            userId: cred.user.uid,
            displayName: name,
            email,
            currency: 'INR',
            currencySymbol: '₹',
            monthlyBudget: 12000,
            theme: 'system',
            alertThresholds: [75, 90, 100],
            isDemoUser: false,
            createdAt: new Date().toISOString(),
          };
          await saveUserProfile(newProfile);
          setUser(newProfile);
          localStorage.setItem(CURRENT_USER_KEY, newProfile.userId);
          setLoading(false);
          return { success: true };
        }
      }

      // Local isolated user creation
      const usersStr = localStorage.getItem('spendwise_registered_users');
      const users: Array<{ id: string; email: string; pass: string; name: string }> = usersStr ? JSON.parse(usersStr) : [];
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setLoading(false);
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      users.push({ id: newId, email, pass, name });
      localStorage.setItem('spendwise_registered_users', JSON.stringify(users));

      const newProfile: UserProfile = {
        userId: newId,
        displayName: name,
        email,
        currency: 'INR',
        currencySymbol: '₹',
        monthlyBudget: 12000,
        theme: 'system',
        alertThresholds: [75, 90, 100],
        isDemoUser: false,
        createdAt: new Date().toISOString(),
      };

      await saveUserProfile(newProfile);
      setUser(newProfile);
      localStorage.setItem(CURRENT_USER_KEY, newId);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (auth) {
        await fbSignOut(auth);
      }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveUserProfile(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive,
        isDemoUser: !!user?.isDemoUser,
        loginAsDemoStudent,
        loginWithEmail,
        signUpWithEmail,
        logout,
        updateProfile,
        switchDemoProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
