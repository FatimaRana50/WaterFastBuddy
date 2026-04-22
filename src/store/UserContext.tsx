import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const PROFILE_KEY = 'user_profile';
const INSTALL_DATE_KEY = 'app_install_date'; // Track when app was first installed for trial period

interface UserContextValue {
  profile: UserProfile | null;
  saveProfile: (p: UserProfile) => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  installDate: number | null; // Unix timestamp of first install
  isTrialExpired: boolean; // true if more than 3 days have passed
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  saveProfile: async () => {},
  updateProfile: async () => {},
  installDate: null,
  isTrialExpired: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [installDate, setInstallDate] = useState<number | null>(null);

  useEffect(() => {
    // Load profile
    AsyncStorage.getItem(PROFILE_KEY).then((raw) => {
      if (raw) setProfile(JSON.parse(raw));
    });
    // Load or initialize install date
    AsyncStorage.getItem(INSTALL_DATE_KEY).then((raw) => {
      if (raw) {
        setInstallDate(parseInt(raw, 10));
      } else {
        // First install — record timestamp
        const now = Date.now();
        AsyncStorage.setItem(INSTALL_DATE_KEY, now.toString());
        setInstallDate(now);
      }
    });
  }, []);

  const saveProfile = async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...(profile ?? ({} as UserProfile)), ...partial };
    await saveProfile(updated as UserProfile);
  };

  // Calculate if trial (3 days = 259,200,000 ms) has expired
  const isTrialExpired = installDate ? (Date.now() - installDate) > (3 * 24 * 60 * 60 * 1000) : false;

  return (
    <UserContext.Provider value={{ profile, saveProfile, updateProfile, installDate, isTrialExpired }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
