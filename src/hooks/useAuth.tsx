import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dbService } from '../services/db';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isMentorVerified: boolean;
  setMentorVerified: (val: boolean) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMentorVerified, setIsMentorVerified] = useState<boolean>(false);

  const fetchProfile = async (uid: string) => {
    try {
      const data = await dbService.getUserProfile(uid);
      if (data) {
        setProfile(data);
        localStorage.setItem(`user_profile_${uid}`, JSON.stringify(data));
      } else {
        const local = localStorage.getItem(`user_profile_${uid}`);
        if (local) {
          try {
            setProfile(JSON.parse(local));
          } catch (e) {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial profile from server:", error);
      const local = localStorage.getItem(`user_profile_${uid}`);
      if (local) {
        try {
          setProfile(JSON.parse(local));
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await fetchProfile(currentUser.uid);
          // Load verification state specifically for this user
          const verified = localStorage.getItem(`mentor_verified_${currentUser.uid}`) === 'true';
          setIsMentorVerified(verified);
        } catch (error) {
          console.error("Failed to fetch initial profile:", error);
        }
      } else {
        setProfile(null);
        setIsMentorVerified(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  const setMentorVerified = (val: boolean) => {
    setIsMentorVerified(val);
    if (user) {
      if (val) {
        localStorage.setItem(`mentor_verified_${user.uid}`, 'true');
      } else {
        localStorage.removeItem(`mentor_verified_${user.uid}`);
      }
    }
    // Also remove the old legacy global flag to prevent any leaks
    localStorage.removeItem('mentor_verified');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isMentorVerified, setMentorVerified, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
