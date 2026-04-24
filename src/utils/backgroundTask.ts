// Minimal background-task registration file.
//
// This file is imported from index.ts before the React tree mounts so that
// expo-task-manager has the task handler registered before the OS can fire it.
//
// Historical bug: a previous version defined the task synchronously at the top
// level of notifications.ts along with other heavy imports (expo-constants,
// expo-notifications). On Android release builds with the new architecture
// enabled, that chain deadlocked native bridge startup and the splash screen
// never transitioned. Keeping this file tiny + deferring the sync native call
// to the next tick avoids that deadlock.
import * as TaskManager from 'expo-task-manager';

export const FAST_BG_TASK = 'fast-notification-update';

// Defer to the next tick so the JS bundle finishes loading and the native
// bridge is ready before we call into TaskManager.
setTimeout(() => {
  try {
    if (!TaskManager.isTaskDefined(FAST_BG_TASK)) {
      TaskManager.defineTask(FAST_BG_TASK, async () => {
        try {
          const mod = await import('./notifications');
          return await mod._runBackgroundTask();
        } catch {
          // BackgroundFetchResult.Failed = 2
          return 2;
        }
      });
    }
  } catch {
    // Silent — if registration fails we still work in the foreground,
    // and the app must not crash because of a background helper.
  }
}, 0);
