// Compact stat tile — "28h · Longest fast". Used in hero stat rows on
// Profile and History. Designed to fit three across on narrow phones.
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { COLORS, FONT, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  icon?: IoniconName;
  label: string;
  value: string;
  sublabel?: string;
  accent?: string;
  style?: ViewStyle;
}

export default function StatTile({ icon, label, value, sublabel, accent = COLORS.primary, style }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.topRow}>
        {icon && (
          <View style={[styles.iconDot, { backgroundColor: accent + '20' }]}>
            <Ionicons name={icon} size={12} color={accent} />
          </View>
        )}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.value, { color: colors.text }]}
        >
          {value}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        style={[styles.label, { color: colors.textSecondary }]}
      >
        {label}
      </Text>
      {sublabel && (
        <Text numberOfLines={1} style={[styles.sublabel, { color: accent }]}>
          {sublabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: 10,
    minHeight: 74,
    justifyContent: 'space-between',
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    flex: 1,
    fontFamily: FONT.black,
    fontSize: FONT_SIZE.lg,
    letterSpacing: -0.3,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sublabel: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.xs,
    marginTop: 3,
  },
});
