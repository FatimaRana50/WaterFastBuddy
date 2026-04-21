// Persistent top navigation bar — visible on all 5 tab screens
// Spec §2.6: logo (left), Book 1-on-1 + Buy Salts (centre), social icons (right)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../constants/theme';

// ── Placeholder URLs — client will supply final values ────────────────────────
const URL_BUY_SALTS   = 'https://waterfastbuddy.com/salts';   // affiliate link TBC
const URL_INSTAGRAM   = 'https://instagram.com/waterfastbuddy';
const URL_FACEBOOK    = 'https://facebook.com/waterfastbuddy';
const URL_YOUTUBE     = 'https://youtube.com/@waterfastbuddy';

export default function TopBar() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: insets.top + 6 }]}
    >
      {/* Left: Logo */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Fasts')}
        activeOpacity={0.8}
        style={styles.logoWrap}
      >
        <Text style={styles.logoText}>💧</Text>
        <Text style={styles.logoLabel}>WFB</Text>
      </TouchableOpacity>

      {/* Centre: CTA buttons */}
      <View style={styles.ctaRow}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Booking')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Book 1-on-1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctaBtn, styles.ctaBtnAlt]}
          onPress={() => openUrl(URL_BUY_SALTS)}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Buy Salts</Text>
        </TouchableOpacity>
      </View>

      {/* Right: Social icons */}
      <View style={styles.socialRow}>
        <TouchableOpacity onPress={() => openUrl(URL_INSTAGRAM)} style={styles.socialBtn} activeOpacity={0.75}>
          <Ionicons name="logo-instagram" size={17} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openUrl(URL_FACEBOOK)} style={styles.socialBtn} activeOpacity={0.75}>
          <Ionicons name="logo-facebook" size={17} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openUrl(URL_YOUTUBE)} style={styles.socialBtn} activeOpacity={0.75}>
          <Ionicons name="logo-youtube" size={17} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
    gap: SPACING.xs,
  },

  // Logo
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: 2,
  },
  logoText:  { fontSize: 18 },
  logoLabel: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // CTA buttons
  ctaRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  ctaBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BORDER_RADIUS.round,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  ctaBtnAlt: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  ctaText: {
    color: '#fff',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Social icons
  socialRow: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: 2,
  },
  socialBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
