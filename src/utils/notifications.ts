// Persistent fast notification system
// Android: ongoing sticky notification (non-dismissable)
// iOS: high-priority notification that persists until the fast ends
// Background task updates the notification body every ~1 minute when app is closed
//
// IMPORTANT: the background task DEFINITION lives in ./backgroundTask.ts and is
// imported by index.ts before the React tree mounts. That file intentionally
// stays tiny so it can be evaluated on bundle-load without deadlocking the
// native bridge on Android release builds with the new architecture.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { FAST_BG_TASK } from './backgroundTask';

const ACTIVE_FAST_KEY  = 'active_fast';
const NOTIF_IDENTIFIER = 'active-fast';
const NOTIF_CHANNEL_ID = 'fast-tracking';

type NotificationsModule = typeof import('expo-notifications');
type TaskManagerModule   = typeof import('expo-task-manager');
type BackgroundFetchModule = typeof import('expo-background-fetch');

// Lazy module promises so nothing heavy is touched at import-time.
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let taskManagerModulePromise: Promise<TaskManagerModule | null> | null = null;
let backgroundFetchModulePromise: Promise<BackgroundFetchModule | null> | null = null;
let notificationsInitialized = false;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').catch(() => null);
  }
  return notificationsModulePromise;
}

async function getTaskManager(): Promise<TaskManagerModule | null> {
  if (!taskManagerModulePromise) {
    taskManagerModulePromise = import('expo-task-manager').catch(() => null);
  }
  return taskManagerModulePromise;
}

async function getBackgroundFetch(): Promise<BackgroundFetchModule | null> {
  if (!backgroundFetchModulePromise) {
    backgroundFetchModulePromise = import('expo-background-fetch').catch(() => null);
  }
  return backgroundFetchModulePromise;
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

// Fasting stage text (kept in code — the client will swap in localised copy later)
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
      ...(Platform.OS === 'android' ? { sticky: true } : {}),
    },
    trigger: null,
  });
}

// Invoked by the background-fetch task handler in backgroundTask.ts.
// Returns the numeric BackgroundFetchResult (NewData=1, NoData=2, Failed=3).
export async function _runBackgroundTask(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_FAST_KEY);
    if (!raw) return 2; // NoData
    const { startTime } = JSON.parse(raw) as { startTime: number };
    await _postNotification(startTime);
    return 1; // NewData
  } catch {
    return 3; // Failed
  }
}

export async function setupNotificationChannel(): Promise<void> {
  try {
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
  } catch (e) {
    console.log('setupNotificationChannel failed silently:', e);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    await ensureNotificationsInitialized();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return false;

    const { status: current } = await Notifications.getPermissionsAsync();
    if (current === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.log('requestNotificationPermissions failed silently:', e);
    return false;
  }
}

export async function showFastNotification(startTime: number): Promise<void> {
  try {
    await ensureNotificationsInitialized();
    await _postNotification(startTime);
  } catch (e) {
    console.log('showFastNotification failed silently:', e);
  }
}

export async function updateFastNotification(startTime: number): Promise<void> {
  try {
    await ensureNotificationsInitialized();
    await _postNotification(startTime);
  } catch (e) {
    console.log('updateFastNotification failed silently:', e);
  }
}

export async function cancelFastNotification(): Promise<void> {
  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    await Notifications.dismissAllNotificationsAsync().catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(NOTIF_IDENTIFIER).catch(() => {});
  } catch (e) {
    console.log('cancelFastNotification failed silently:', e);
  }
}

export async function registerBackgroundFastTask(): Promise<void> {
  try {
    const TaskManager = await getTaskManager();
    const BackgroundFetch = await getBackgroundFetch();
    if (!TaskManager || !BackgroundFetch) return;

    const isRegistered = await TaskManager.isTaskRegisteredAsync(FAST_BG_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(FAST_BG_TASK, {
        minimumInterval: 60,
        stopOnTerminate: false,
        startOnBoot:     true,
      });
    }
  } catch (e) {
    console.log('registerBackgroundFastTask failed silently:', e);
  }
}

export async function unregisterBackgroundFastTask(): Promise<void> {
  try {
    const TaskManager = await getTaskManager();
    const BackgroundFetch = await getBackgroundFetch();
    if (!TaskManager || !BackgroundFetch) return;

    const isRegistered = await TaskManager.isTaskRegisteredAsync(FAST_BG_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(FAST_BG_TASK);
    }
  } catch (e) {
    console.log('unregisterBackgroundFastTask failed silently:', e);
  }
}
