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

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

// ── Client IDs — leave empty until the client provides real ones ───────────
const ANDROID_OAUTH_CLIENT_ID = (Constants.expoConfig?.extra as any)?.googleOAuthAndroidClientId ?? '';
const IOS_OAUTH_CLIENT_ID     = (Constants.expoConfig?.extra as any)?.googleOAuthIosClientId     ?? '';
const WEB_OAUTH_CLIENT_ID     = (Constants.expoConfig?.extra as any)?.googleOAuthWebClientId     ?? '';

const TOKEN_KEY     = 'google_drive_access_token';
const TOKEN_EXP_KEY = 'google_drive_token_expires_at';
const FILE_ID_KEY   = 'google_drive_backup_file_id';
const BACKUP_NAME   = 'waterfastbuddy_backup.json';

// drive.file lets the app read/write only the files it creates — matches the
// scope registered in Google Cloud Console OAuth consent screen.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint:         'https://oauth2.googleapis.com/token',
  revocationEndpoint:    'https://oauth2.googleapis.com/revoke',
};

export function isDriveConfigured(): boolean {
  return !!(ANDROID_OAUTH_CLIENT_ID || IOS_OAUTH_CLIENT_ID || WEB_OAUTH_CLIENT_ID);
}

function resolveClientId(): string | null {
  // Android client IDs validate via package name + SHA-1, not redirect URI,
  // so custom app scheme redirects work without extra Google Cloud setup.
  if (ANDROID_OAUTH_CLIENT_ID) return ANDROID_OAUTH_CLIENT_ID;
  if (IOS_OAUTH_CLIENT_ID)     return IOS_OAUTH_CLIENT_ID;
  if (WEB_OAUTH_CLIENT_ID)     return WEB_OAUTH_CLIENT_ID;
  return null;
}

async function loadStoredToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const expAt = await AsyncStorage.getItem(TOKEN_EXP_KEY);
    if (!token || !expAt) return null;
    if (Date.now() > parseInt(expAt, 10)) return null;
    return token;
  } catch {
    return null;
  }
}

async function storeToken(accessToken: string, expiresInSec: number): Promise<void> {
  const expiresAt = Date.now() + Math.max(0, expiresInSec - 60) * 1000;
  await AsyncStorage.setItem(TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(TOKEN_EXP_KEY, String(expiresAt));
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(TOKEN_EXP_KEY);
  await AsyncStorage.removeItem(FILE_ID_KEY);
}

// Runs the OAuth flow and returns a fresh access token, or null on cancel/failure.
export async function signInAndGetToken(): Promise<string | null> {
  const clientId = resolveClientId();
  if (!clientId) throw new Error('drive_not_configured');

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'waterfastbuddy',
    path: 'oauth2redirect',
  });

  const request = new AuthSession.AuthRequest({
    clientId,
    scopes: SCOPES,
    redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
  });

  await request.makeAuthUrlAsync(DISCOVERY);
  const result = await request.promptAsync(DISCOVERY);

  if (result.type !== 'success' || !result.params.code) return null;

  const tokenResult = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: request.codeVerifier ? { code_verifier: request.codeVerifier } : {},
    },
    DISCOVERY,
  );

  if (!tokenResult.accessToken) return null;
  await storeToken(tokenResult.accessToken, tokenResult.expiresIn ?? 3600);
  return tokenResult.accessToken;
}

async function ensureToken(): Promise<string | null> {
  const existing = await loadStoredToken();
  if (existing) return existing;
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
