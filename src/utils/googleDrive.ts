// Google Drive backup integration.
//
// Uses OAuth 2.0 (PKCE) via expo-auth-session to sign the user into their own
// Google account, then reads/writes a single JSON file in the app's private
// Drive "appDataFolder" space so the user sees nothing unexpected in their
// file listing.
//
// ── Configuration ───────────────────────────────────────────────────────────
// Before the Drive feature can be used in a production APK, the client must
// create an OAuth 2.0 Client ID in the Google Cloud Console and paste it
// below (or into app.json → extra.googleOAuthClientId):
//
//   1. Go to https://console.cloud.google.com/apis/credentials
//   2. Create Credentials → OAuth client ID → Android
//   3. Package name: com.waterfastbuddy.app
//   4. SHA-1: (run `cd android && ./gradlew signingReport` after prebuild)
//   5. Paste the returned client ID as ANDROID_OAUTH_CLIENT_ID below
//
// Repeat for iOS when the iOS build is set up.
// Until a client ID is configured, the feature reports "Drive not configured"
// and the user can fall back to the Backup/Restore paste-JSON workflow.

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const WEB_OAUTH_CLIENT_ID = (Constants.expoConfig?.extra as any)?.googleOAuthWebClientId ?? '';

const FILE_ID_KEY = 'google_drive_backup_file_id';
const BACKUP_NAME = 'waterfastbuddy_backup.json';

// Configure native Google Sign-In once when this module loads.
// webClientId is required to get an access token with Drive scopes.
GoogleSignin.configure({
  webClientId: WEB_OAUTH_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  offlineAccess: false,
});

export function isDriveConfigured(): boolean {
  return !!WEB_OAUTH_CLIENT_ID;
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(FILE_ID_KEY);
  try { await GoogleSignin.signOut(); } catch {}
}

// Signs the user in natively (no browser popup) and returns a Drive access token.
export async function signInAndGetToken(): Promise<string | null> {
  if (!WEB_OAUTH_CLIENT_ID) throw new Error('drive_not_configured');
  try {
    await GoogleSignin.hasPlayServices();
    const currentUser = GoogleSignin.getCurrentUser();
    if (!currentUser) await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
    throw error;
  }
}

async function ensureToken(): Promise<string | null> {
  return signInAndGetToken();
}

// Find (or create) the single backup file in appDataFolder and return its ID.
async function findOrCreateBackupFileId(token: string): Promise<string> {
  const cachedId = await AsyncStorage.getItem(FILE_ID_KEY);
  if (cachedId) return cachedId;

  // List files created by this app matching our backup name.
  const listResp = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${BACKUP_NAME}' and trashed=false`)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!listResp.ok) throw new Error(`drive_list_failed: ${listResp.status}`);
  const listJson = await listResp.json();
  const first = Array.isArray(listJson.files) && listJson.files[0];
  if (first?.id) {
    await AsyncStorage.setItem(FILE_ID_KEY, first.id);
    return first.id;
  }

  // Nothing there yet — create the backup file in the user's Drive root.
  const metaResp = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: BACKUP_NAME }),
  });
  if (!metaResp.ok) throw new Error(`drive_create_failed: ${metaResp.status}`);
  const meta = await metaResp.json();
  await AsyncStorage.setItem(FILE_ID_KEY, meta.id);
  return meta.id;
}

// Uploads the backup JSON, overwriting any previous content.
export async function uploadBackupToDrive(backup: unknown): Promise<void> {
  const token = await ensureToken();
  if (!token) throw new Error('drive_auth_cancelled');

  const fileId = await findOrCreateBackupFileId(token);
  const body   = JSON.stringify(backup);

  const resp = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    },
  );
  if (!resp.ok) throw new Error(`drive_upload_failed: ${resp.status}`);
}

// Reads the backup JSON. Returns null if no backup exists yet.
export async function downloadBackupFromDrive(): Promise<unknown | null> {
  const token = await ensureToken();
  if (!token) throw new Error('drive_auth_cancelled');

  const fileId = await findOrCreateBackupFileId(token);

  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`drive_download_failed: ${resp.status}`);

  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
