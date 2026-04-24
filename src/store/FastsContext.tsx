// Global state for active fast + full fast history
// Active fast is persisted to AsyncStorage so it survives app kills
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FastRecord, SavedFast } from '../types';
import { insertFast, getAllFasts, deleteFastById } from './database';

const ACTIVE_FAST_KEY  = 'active_fast';
const SAVED_FASTS_KEY  = 'saved_fasts';

export interface ActiveFastState {
  startTime: number; // Unix timestamp ms
  targetHours: number;
  name: string;
  color: string;
}

interface FastsContextValue {
  fasts: FastRecord[];
  activeFast: ActiveFastState | null;
  savedFasts: SavedFast[];
  startFast: (opts: { hours: number; name: string; color: string }) => Promise<void>;
  endFast: () => Promise<FastRecord | null>;
  saveFastRecord: (record: FastRecord) => Promise<void>;
  removeFast: (id: string) => Promise<void>;
  saveCustomFast: (name: string, hours: number) => Promise<void>;
  removeSavedFast: (id: string) => Promise<void>;
  reloadAll: () => Promise<void>;
  replaceSavedFasts: (next: SavedFast[]) => Promise<void>;
}

const FastsContext = createContext<FastsContextValue>({
  fasts: [],
  activeFast: null,
  savedFasts: [],
  startFast: async () => {},
  endFast: async () => null,
  saveFastRecord: async () => {},
  removeFast: async () => {},
  saveCustomFast: async () => {},
  removeSavedFast: async () => {},
  reloadAll: async () => {},
  replaceSavedFasts: async () => {},
});

export function FastsProvider({ children }: { children: React.ReactNode }) {
  const [fasts, setFasts]           = useState<FastRecord[]>([]);
  const [activeFast, setActiveFast] = useState<ActiveFastState | null>(null);
  const [savedFasts, setSavedFasts] = useState<SavedFast[]>([]);
  // Lazy import of notification helpers to avoid circular issues at module load
  const notifIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadFasts();
    restoreActiveFast();
    loadSavedFasts();
  }, []);

  // While the app is open, refresh the notification body every 60s
  useEffect(() => {
    if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    if (activeFast) {
      notifIntervalRef.current = setInterval(async () => {
        try {
          const { updateFastNotification } = await import('../utils/notifications');
          await updateFastNotification(activeFast.startTime);
        } catch {
          // Ignore notification update failures and keep fast timer running.
        }
      }, 60_000);
    }
    return () => {
      if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    };
  }, [activeFast]);

  const loadSavedFasts = async () => {
    const raw = await AsyncStorage.getItem(SAVED_FASTS_KEY);
    if (raw) setSavedFasts(JSON.parse(raw));
  };

  const loadFasts = async () => {
    try {
      const records = await getAllFasts();
      setFasts(records);
    } catch {
      // DB not yet ready on first launch — ignore
    }
  };

  // Restores an in-progress fast that survived an app kill
  const restoreActiveFast = async () => {
    const raw = await AsyncStorage.getItem(ACTIVE_FAST_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as ActiveFastState;
      setActiveFast(saved);
      const { requestNotificationPermissions, showFastNotification } = await import('../utils/notifications');
      const canNotify = await requestNotificationPermissions();
      if (canNotify) {
        await showFastNotification(saved.startTime);
      }
    }
  };

  const startFast = async (opts: { hours: number; name: string; color: string }) => {
    const state: ActiveFastState = {
      startTime: Date.now(),
      targetHours: opts.hours,
      name: opts.name,
      color: opts.color,
    };
    setActiveFast(state);
    await AsyncStorage.setItem(ACTIVE_FAST_KEY, JSON.stringify(state));
    const {
      requestNotificationPermissions,
      showFastNotification,
      registerBackgroundFastTask,
    } = await import('../utils/notifications');
    const canNotify = await requestNotificationPermissions();
    if (canNotify) {
      await showFastNotification(state.startTime);
      await registerBackgroundFastTask();
    }
  };

  // Stops the fast and returns the unsaved record — caller decides to save or discard
  const endFast = async (): Promise<FastRecord | null> => {
    if (!activeFast) return null;
    const endTime = Date.now();
    const actualHours = parseFloat(((endTime - activeFast.startTime) / 3_600_000).toFixed(2));
    const record: FastRecord = {
      id: String(activeFast.startTime),
      startTime: new Date(activeFast.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      targetHours: activeFast.targetHours,
      actualHours,
      completed: actualHours >= activeFast.targetHours,
      name: activeFast.name,
    };
    setActiveFast(null);
    await AsyncStorage.removeItem(ACTIVE_FAST_KEY);
    const { cancelFastNotification, unregisterBackgroundFastTask } = await import('../utils/notifications');
    await cancelFastNotification();
    await unregisterBackgroundFastTask();
    return record;
  };

  // Persists a completed fast record to SQLite and prepends it to local list
  const saveFastRecord = async (record: FastRecord) => {
    await insertFast(record);
    setFasts((prev) => [record, ...prev.filter((f) => f.id !== record.id)]);
  };

  const removeFast = async (id: string) => {
    await deleteFastById(id);
    setFasts((prev) => prev.filter((f) => f.id !== id));
  };

  const saveCustomFast = async (name: string, hours: number) => {
    const entry: SavedFast = {
      id: String(Date.now()),
      name: name.trim() || `${hours}h Fast`,
      targetHours: hours,
      isPreset: false,
    };
    const next = [...savedFasts, entry];
    setSavedFasts(next);
    await AsyncStorage.setItem(SAVED_FASTS_KEY, JSON.stringify(next));
  };

  const removeSavedFast = async (id: string) => {
    const next = savedFasts.filter((f) => f.id !== id);
    setSavedFasts(next);
    await AsyncStorage.setItem(SAVED_FASTS_KEY, JSON.stringify(next));
  };

  // Re-reads from DB + AsyncStorage. Called after a restore-from-backup so
  // the UI reflects the freshly imported rows without requiring an app relaunch.
  const reloadAll = async () => {
    await loadFasts();
    await loadSavedFasts();
  };

  const replaceSavedFasts = async (next: SavedFast[]) => {
    setSavedFasts(next);
    await AsyncStorage.setItem(SAVED_FASTS_KEY, JSON.stringify(next));
  };

  return (
    <FastsContext.Provider
      value={{
        fasts,
        activeFast,
        savedFasts,
        startFast,
        endFast,
        saveFastRecord,
        removeFast,
        saveCustomFast,
        removeSavedFast,
        reloadAll,
        replaceSavedFasts,
      }}
    >
      {children}
    </FastsContext.Provider>
  );
}

export const useFasts = () => useContext(FastsContext);
