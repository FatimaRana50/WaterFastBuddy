import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// Single key works for both iOS and Android in RevenueCat v4+
// Dashboard → Project → API Keys
const RC_API_KEY = 'test_YsMhXYnsbDDbMstUVifWGbqdNAz';

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
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  Purchases.configure({ apiKey: RC_API_KEY });
}
