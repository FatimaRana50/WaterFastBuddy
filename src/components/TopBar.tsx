// Persistent floating "pill" top bar — matches the website nav exactly:
//   Logo droplet + WaterFastBuddy wordmark (left)
//   Book 1-on-1 + Shop pill CTAs (center-right)
//   IG / FB / YouTube small icons (right)
//
// Uses the theme's `pillBg` / `pillBorder` so it reads correctly in both
// light and dark modes.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../store/ThemeContext';
import i18n from '../i18n';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../constants/theme';

// ── Placeholder URLs — client will supply final values ────────────────────────
const URL_INSTAGRAM   = 'https://instagram.com/waterfastbuddy';
const URL_FACEBOOK    = 'https://facebook.com/waterfastbuddy';
const URL_YOUTUBE     = 'https://youtube.com/@waterfastbuddy';

// Gradient-filled droplet SVG — the website's logo mark.
function DropletLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 24 28">
      <Defs>
        <SvgGradient id="drop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor={COLORS.accent} />
          <Stop offset="100%" stopColor={COLORS.primaryDark} />
        </SvgGradient>
      </Defs>
      <Path
        d="M12 1 C 7 10, 3 15, 3 19 a 9 9 0 0 0 18 0 c 0 -4 -4 -9 -9 -18 Z"
        fill="url(#drop)"
      />
    </Svg>
  );
}

export default function TopBar() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={{ paddingTop: insets.top + 6, paddingHorizontal: SPACING.md }}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.pillBg,
            borderColor:     colors.pillBorder,
            shadowColor:     COLORS.primary,
          },
        ]}
      >
        {/* Left: logo droplet + wordmark */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'Fasts' })}
          activeOpacity={0.8}
          style={styles.logoWrap}
        >
          <DropletLogo size={18} />
          <Text style={[styles.logoLabel, { color: colors.text }]}>
            WFB
          </Text>
        </TouchableOpacity>

        {/* Center CTAs */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaPrimary]}
            onPress={() => navigation.navigate('Booking')}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={13} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.ctaPrimaryText}>{i18n.t('topBar.book')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctaSecondary, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.85}
          >
            <Ionicons name="bag-handle-outline" size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
            <Text style={[styles.ctaSecondaryText, { color: COLORS.primary }]}>
              {i18n.t('topBar.shop')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: social icons */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            onPress={() => openUrl(URL_INSTAGRAM)}
            style={[styles.socialBtn, { backgroundColor: colors.cardAlt }]}
            activeOpacity={0.75}
          >
            <Ionicons name="logo-instagram" size={14} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openUrl(URL_YOUTUBE)}
            style={[styles.socialBtn, { backgroundColor: colors.cardAlt }]}
            activeOpacity={0.75}
          >
            <Ionicons name="logo-youtube" size={14} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 8,
  },

  // Logo
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  logoLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  // CTAs
  ctaRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ctaPrimaryText: {
    color: '#fff',
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  ctaSecondaryText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Socials
  socialRow: {
    flexDirection: 'row',
    gap: 4,
  },
  socialBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
