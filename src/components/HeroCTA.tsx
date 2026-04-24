// Full-width blue gradient CTA block — the "Ready to get started?" panels
// from the website. Centered copy + one primary button.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  kicker?: string;
  title: string;
  body?: string;
  ctaLabel: string;
  ctaIcon?: IoniconName;
  onPress: () => void;
}

export default function HeroCTA({ kicker, title, body, ctaLabel, ctaIcon, onPress }: Props) {
  return (
    <LinearGradient
      colors={[COLORS.primaryDeep, COLORS.primaryDark, COLORS.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      {kicker && <Text style={styles.kicker}>{kicker}</Text>}
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}

      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.button}>
        {ctaIcon && <Ionicons name={ctaIcon} size={18} color="#0B1530" style={{ marginRight: 8 }} />}
        <Text style={styles.buttonText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  kicker: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  title: {
    color: '#fff',
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  body: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
    maxWidth: 320,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.round,
  },
  buttonText: {
    color: '#0B1530',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
});
