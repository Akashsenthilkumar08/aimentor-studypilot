import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  signInDemoGuest: () => Promise<void>;
  logOut: () => Promise<void>;
  updateStudentProfile: (updates: Partial<UserProfile>) => Promise<void>;
  incrementStreak: () => Promise<void>;
  awardXp: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile with Firestore
  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
        return data;
      } else {
        const initialProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Student'),
          photoURL: firebaseUser.photoURL || undefined,
          gradeLevel: 'College / High School',
          targetExam: 'Mastery Learning',
          streakDays: 0,
          totalStudyMinutes: 0,
          totalQuizzesTaken: 0,
          xpPoints: 0,
          currentCycleStep: 'study',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
        return initialProfile;
      }
    } catch (err) {
      console.warn('Firestore profile fetch fallback (offline or permissions):', err);
      // Clean fallback in case of offline/network issues
      const localProfile: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Student'),
        gradeLevel: 'College / High School',
        targetExam: 'Mastery Learning',
        streakDays: 0,
        totalStudyMinutes: 0,
        totalQuizzesTaken: 0,
        xpPoints: 0,
        currentCycleStep: 'study',
        createdAt: new Date().toISOString()
      };
      setUserProfile(localProfile);
      return localProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchOrCreateProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await fetchOrCreateProfile(cred.user);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await fetchOrCreateProfile(cred.user);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseProfile(cred.user, { displayName: name });
      const profile: UserProfile = {
        id: cred.user.uid,
        email: cred.user.email || email,
        displayName: name,
        gradeLevel: 'College / High School',
        targetExam: 'Mastery Learning',
        streakDays: 0,
        totalStudyMinutes: 0,
        totalQuizzesTaken: 0,
        xpPoints: 0,
        currentCycleStep: 'study',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
      } catch (e) {
        console.warn('Initial profile doc set error:', e);
      }
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInDemoGuest = async () => {
    setLoading(true);
    try {
      let currentAuthUser = auth.currentUser;
      if (!currentAuthUser) {
        try {
          const cred = await signInAnonymously(auth);
          currentAuthUser = cred.user;
        } catch (anonErr) {
          console.warn('Anonymous auth failed, using local session:', anonErr);
        }
      }

      if (currentAuthUser) {
        const userRef = doc(db, 'users', currentAuthUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const existingData = snap.data() as UserProfile;
          setUserProfile(existingData);
          return;
        }
      }

      const freshGuestProfile: UserProfile = {
        id: currentAuthUser?.uid || 'guest-' + Date.now(),
        email: '',
        displayName: 'Guest Student',
        gradeLevel: 'College / High School',
        targetExam: 'Mastery Learning',
        streakDays: 0,
        totalStudyMinutes: 0,
        totalQuizzesTaken: 0,
        xpPoints: 0,
        currentCycleStep: 'study',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (currentAuthUser) {
        try {
          await setDoc(doc(db, 'users', currentAuthUser.uid), freshGuestProfile, { merge: true });
        } catch (e) {
          console.warn('Guest profile write warning:', e);
        }
      }

      setUserProfile(freshGuestProfile);
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateStudentProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updates);
      } catch (err) {
        console.warn('Firestore profile update warning:', err);
      }
    }
  };

  const incrementStreak = async () => {
    if (!userProfile) return;
    await updateStudentProfile({ streakDays: (userProfile.streakDays || 0) + 1 });
  };

  const awardXp = async (amount: number) => {
    if (!userProfile) return;
    await updateStudentProfile({ xpPoints: (userProfile.xpPoints || 0) + amount });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInDemoGuest,
        logOut,
        updateStudentProfile,
        incrementStreak,
        awardXp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
