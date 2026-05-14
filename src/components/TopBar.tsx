// Persistent floating top bar — premium, uncluttered redesign.
//
// Layout:
//   Left:  droplet logo + "WaterFastBuddy" wordmark
//   Right: "Book 1-1" & "Buy Salts" CTA buttons
//
// Streamlined nav bar with inline gradient buttons for primary actions.
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../store/ThemeContext';
import i18n from '../i18n';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../constants/theme';

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

  return (
    <>
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: SPACING.md,
          paddingBottom: 6,
          width: '100%',
          backgroundColor: colors.background,
        }}
      >
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

          {/* Right: inline action buttons */}
          <View style={styles.btnRow}>
            {/* Book 1-1 Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Booking')}
              activeOpacity={0.8}
              style={styles.compactBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.compactBtnGradient}
              >
                <Ionicons name="calendar-outline" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Buy Salts Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Shop')}
              activeOpacity={0.8}
              style={styles.compactBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.compactBtnGradient}
              >
                <Ionicons name="bag-handle-outline" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
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

  // Button row
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  // Compact icon-only buttons
  compactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  compactBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
