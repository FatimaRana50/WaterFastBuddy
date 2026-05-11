import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// RevenueCat key strategy:
// - Development: optional test key via EXPO_PUBLIC_RC_TEST_API_KEY
// - Preview/Production: production public key via EXPO_PUBLIC_RC_API_KEY
// RevenueCat will terminate release builds that use a test_ key.
const RC_PRODUCTION_API_KEY = process.env.EXPO_PUBLIC_RC_API_KEY?.trim();
const RC_TEST_API_KEY = process.env.EXPO_PUBLIC_RC_TEST_API_KEY?.trim();

// Must match the Entitlement ID you create in the RevenueCat dashboard.
// Dashboard → Project → Entitlements → Create → use "premium"
export const RC_ENTITLEMENT = 'premium';

// Product identifiers — must match exactly what you create in:
//   Google Play Console → In-app products
//   App Store Connect → In-App Purchases
// AND what you add under Products in the RevenueCat dashboard.
export const PRODUCT_MONTHLY = 'waterfastbuddy_monthly';
export const PRODUCT_YEARLY  = 'waterfastbuddy_yearly';

export function initRevenueCat() {
  const apiKey = __DEV__ ? RC_TEST_API_KEY || RC_PRODUCTION_API_KEY : RC_PRODUCTION_API_KEY;

  if (!apiKey) {
    console.warn('[RevenueCat] Missing API key. Set EXPO_PUBLIC_RC_API_KEY (and optionally EXPO_PUBLIC_RC_TEST_API_KEY for dev).');
    return;
  }

  if (!__DEV__ && apiKey.startsWith('test_')) {
    console.error('[RevenueCat] Refusing to initialize with a test key in non-dev build. Use a production public SDK key.');
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  Purchases.configure({ apiKey });
}
