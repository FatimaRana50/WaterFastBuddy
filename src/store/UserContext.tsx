import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const PROFILE_KEY = 'user_profile';

interface UserContextValue {
  profile: UserProfile | null;
  saveProfile: (p: UserProfile) => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  saveProfile: async () => {},
  updateProfile: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((raw) => {
      if (raw) setProfile(JSON.parse(raw));
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

  return (
    <UserContext.Provider value={{ profile, saveProfile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
