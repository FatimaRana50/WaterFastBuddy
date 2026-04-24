import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const PROFILE_KEY      = 'user_profile';
const INSTALL_DATE_KEY = 'app_install_date';     // First-install timestamp, used for the 3-day trial
const SUBSCRIPTION_KEY = 'subscription_active';  // '1' once the user has subscribed (stub until RevenueCat is wired)

const TRIAL_MS = 3 * 24 * 60 * 60 * 1000;

interface UserContextValue {
  profile: UserProfile | null;
  saveProfile: (p: UserProfile) => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  installDate: number | null;
  isTrialExpired: boolean;          // true once 3 days have passed AND no active subscription
  isSubscribed: boolean;
  activateSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  saveProfile: async () => {},
  updateProfile: async () => {},
  installDate: null,
  isTrialExpired: false,
  isSubscribed: false,
  activateSubscription: async () => {},
  cancelSubscription: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile]           = useState<UserProfile | null>(null);
  const [installDate, setInstallDate]   = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((raw) => {
      if (raw) setProfile(JSON.parse(raw));
    });
    AsyncStorage.getItem(INSTALL_DATE_KEY).then((raw) => {
      if (raw) {
        setInstallDate(parseInt(raw, 10));
      } else {
        const now = Date.now();
        AsyncStorage.setItem(INSTALL_DATE_KEY, now.toString());
        setInstallDate(now);
      }
    });
    AsyncStorage.getItem(SUBSCRIPTION_KEY).then((raw) => {
      setIsSubscribed(raw === '1');
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

  const activateSubscription = async () => {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, '1');
    setIsSubscribed(true);
  };

  const cancelSubscription = async () => {
    await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    setIsSubscribed(false);
  };

  // Trial is expired only if the 3-day window has passed AND the user is not subscribed.
  const trialWindowPassed = installDate ? (Date.now() - installDate) > TRIAL_MS : false;
  const isTrialExpired    = trialWindowPassed && !isSubscribed;

  return (
    <UserContext.Provider
      value={{
        profile,
        saveProfile,
        updateProfile,
        installDate,
        isTrialExpired,
        isSubscribed,
        activateSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
