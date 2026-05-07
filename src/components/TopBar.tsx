// Persistent floating top bar — premium, uncluttered redesign.
//
// Layout:
//   Left:  droplet logo + "WaterFastBuddy" wordmark
//   Right: single overflow menu (3 dots)
//
// All secondary actions (Book 1-1, Buy Salts, social links) live inside
// the overflow sheet so the bar itself stays calm and readable.
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, Platform,
  Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../store/ThemeContext';
import i18n from '../i18n';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../constants/theme';

// ── Placeholder URLs — client will supply final values ────────────────────────
const URL_INSTAGRAM = 'https://instagram.com/waterfastbuddy';
const URL_FACEBOOK  = 'https://facebook.com/waterfastbuddy';
const URL_YOUTUBE   = 'https://youtube.com/@waterfastbuddy';

// Gradient-filled droplet SVG — the website's logo mark.
function DropletLogo({ size = 22 }: { size?: number }) {
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
  const [menuOpen, setMenuOpen] = useState(false);

  const openUrl = (url: string) => {
    setMenuOpen(false);
    Linking.openURL(url).catch(() => {});
  };

  const goTo = (route: string) => {
    setMenuOpen(false);
    navigation.navigate(route);
  };

  return (
    <>
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
            <DropletLogo size={22} />
            <Text
              style={[styles.logoLabel, { color: colors.text }]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              WaterFastBuddy
            </Text>
          </TouchableOpacity>

          {/* Right: overflow menu */}
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
            style={[styles.menuBtn, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overflow menu — bottom sheet style */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            <Text style={[styles.sheetTitle, { color: colors.text }]}>WaterFastBuddy</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>
              Quick actions & links
            </Text>

            {/* Primary CTA — Book 1-1 */}
            <TouchableOpacity onPress={() => goTo('Booking')} activeOpacity={0.85} style={{ marginTop: SPACING.lg }}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.primaryCta}
              >
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.primaryCtaText}>{i18n.t('topBar.book')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary CTA — Buy Salts */}
            <TouchableOpacity
              onPress={() => goTo('Shop')}
              activeOpacity={0.85}
              style={[styles.secondaryCta, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
            >
              <Ionicons name="bag-handle-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.secondaryCtaText, { color: COLORS.primary }]}>
                {i18n.t('topBar.buyFastingSalts')}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Follow us</Text>

            {/* Socials row */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                onPress={() => openUrl(URL_INSTAGRAM)}
                style={[styles.socialBtn, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                activeOpacity={0.75}
              >
                <Ionicons name="logo-instagram" size={20} color={colors.text} />
                <Text style={[styles.socialLabel, { color: colors.text }]}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openUrl(URL_FACEBOOK)}
                style={[styles.socialBtn, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                activeOpacity={0.75}
              >
                <Ionicons name="logo-facebook" size={20} color={colors.text} />
                <Text style={[styles.socialLabel, { color: colors.text }]}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openUrl(URL_YOUTUBE)}
                style={[styles.socialBtn, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                activeOpacity={0.75}
              >
                <Ionicons name="logo-youtube" size={20} color={colors.text} />
                <Text style={[styles.socialLabel, { color: colors.text }]}>YouTube</Text>
              </TouchableOpacity>
            </View>

            {/* Close */}
            <TouchableOpacity
              onPress={() => setMenuOpen(false)}
              activeOpacity={0.7}
              style={styles.closeBtn}
            >
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  // Logo
  logoWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoLabel: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  // Overflow menu trigger
  menuBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // ── Bottom sheet ────────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,14,30,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl + 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  sheetSub: {
    fontSize: FONT_SIZE.sm,
    marginTop: 4,
  },

  // Primary CTA
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.round,
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },

  // Secondary CTA
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  secondaryCtaText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: SPACING.lg,
    opacity: 0.5,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },

  // Social grid
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  socialBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Close button
  closeBtn: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  closeBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
});
