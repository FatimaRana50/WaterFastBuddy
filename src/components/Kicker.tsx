// Small uppercase section label used above hero headlines.
// Matches the website's blue "FEATURES / PROCESS / PRICING" labels.
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { COLORS, FONT, FONT_SIZE } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: TextStyle;
}

export default function Kicker({ children, style }: Props) {
  return <Text style={[styles.kicker, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  kicker: {
    color: COLORS.kicker,
    fontFamily: FONT.extra,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
});
