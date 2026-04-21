// Persistent fast notification system
// Android: ongoing sticky notification (non-dismissable)
// iOS: high-priority notification that persists until the fast ends
// Background task updates the notification body every ~1 minute when app is closed
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ACTIVE_FAST_KEY  = 'active_fast';
const NOTIF_IDENTIFIER = 'active-fast';
const NOTIF_CHANNEL_ID = 'fast-tracking';
const BG_TASK_NAME     = 'fast-notification-update';
const IS_EXPO_GO       = Constants.appOwnership === 'expo';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let notificationsInitialized = false;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (IS_EXPO_GO) return null;
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').catch(() => null);
  }
  return notificationsModulePromise;
}

async function ensureNotificationsInitialized(): Promise<void> {
  if (notificationsInitialized) return;
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  notificationsInitialized = true;
}

// Fasting stage text — mirrors the STAGES array in FastsScreen
const STAGES = [
  { minHour: 0,  text: 'Your body is burning stored glucose for energy.' },
  { minHour: 8,  text: 'Insulin dropping. Fat burning has started.' },
  { minHour: 12, text: 'Ketosis beginning — your body burns fat for fuel.' },
  { minHour: 16, text: 'Autophagy kicks in. Your cells are self-cleaning.' },
  { minHour: 24, text: 'Deep cellular renewal. Growth hormone surging.' },
  { minHour: 48, text: 'Immune regeneration. Stem cell production rising.' },
  { minHour: 72, text: 'Profound autophagy. Full metabolic reset underway.' },
];

function getStageText(hours: number): string {
  return [...STAGES].reverse().find((s) => hours >= s.minHour)?.text ?? STAGES[0].text;
}

function formatElapsed(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// ── Background task — MUST be defined at module level before the app renders ───
// expo-task-manager requires synchronous top-level registration
if (!TaskManager.isTaskDefined(BG_TASK_NAME)) {
  TaskManager.defineTask(BG_TASK_NAME, async () => {
    try {
      const raw = await AsyncStorage.getItem(ACTIVE_FAST_KEY);
      if (!raw) return BackgroundFetch.BackgroundFetchResult.NoData;
      const { startTime } = JSON.parse(raw) as { startTime: number };
      await _postNotification(startTime);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

// ── Internal: dismiss existing and post a fresh notification ───────────────────
async function _postNotification(startTime: number): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  const elapsed     = Date.now() - startTime;
  const elapsedHrs  = elapsed / 3_600_000;

  await Notifications.dismissAllNotificationsAsync().catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_IDENTIFIER,
    content: {
      title: `WaterFast Active: ${formatElapsed(elapsed)}`,
      body:  getStageText(elapsedHrs),
      data:  { type: 'active_fast', startTime },
      // Android sticky flag — prevents the notification being swiped away
      ...(Platform.OS === 'android' ? { sticky: true } : {}),
    },
    trigger: null, // fire immediately
  });
}

// ── Public API ─────────────────────────────────────────────────────────────────

// Create the Android notification channel (call once at app start)
export async function setupNotificationChannel(): Promise<void> {
  await ensureNotificationsInitialized();
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIF_CHANNEL_ID, {
      name:                 'Water Fast Tracking',
      importance:           Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound:                null,
      vibrationPattern:     [0],
      enableVibrate:        false,
      showBadge:            false,
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  await ensureNotificationsInitialized();
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Show (or refresh) the active fast notification
export async function showFastNotification(startTime: number): Promise<void> {
  await ensureNotificationsInitialized();
  await _postNotification(startTime);
}

// Called every 60s while the app is open to update elapsed time in the banner
export async function updateFastNotification(startTime: number): Promise<void> {
  await ensureNotificationsInitialized();
  await _postNotification(startTime);
}

// Remove the notification when the fast ends
export async function cancelFastNotification(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await Notifications.dismissAllNotificationsAsync().catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(NOTIF_IDENTIFIER).catch(() => {});
}

// Register the background refresh task (called when a fast starts)
export async function registerBackgroundFastTask(): Promise<void> {
  if (IS_EXPO_GO) return;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BG_TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BG_TASK_NAME, {
        minimumInterval: 60,      // seconds between background runs
        stopOnTerminate: false,   // keep running after app is closed
        startOnBoot:     true,    // resume after device restart
      });
    }
  } catch {
    // BackgroundFetch unavailable in Expo Go — safe to ignore
  }
}

// Unregister when the fast ends
export async function unregisterBackgroundFastTask(): Promise<void> {
  if (IS_EXPO_GO) return;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BG_TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BG_TASK_NAME);
    }
  } catch {
    // ignore
  }
}
