// Two-tone display headline — mirrors the website's "Fast smarter. / Become
// fluid." treatment. First line uses the theme's foreground, second line
// uses the primary-blue gradient so it reads as the accent line.
import React from 'react';
import { Text, View, TextStyle } from 'react-native';
import { useTheme } from '../store/ThemeContext';
import { COLORS, FONT } from '../constants/theme';

interface Props {
  line1: string;
  line2?: string;
  size?: number;
  align?: TextStyle['textAlign'];
  onDark?: boolean;
}

export default function Headline({ line1, line2, size = 42, align = 'left', onDark = false }: Props) {
  const { colors } = useTheme();
  const line1Color = onDark ? '#fff' : colors.text;

  const baseStyle: TextStyle = {
    fontFamily: FONT.black,
    fontSize: size,
    lineHeight: Math.round(size * 1.02),
    letterSpacing: -0.8,
    textAlign: align,
  };

  return (
    <View>
      <Text style={[baseStyle, { color: line1Color }]}>{line1}</Text>
      {line2 && (
        <Text
          style={[
            baseStyle,
            { color: onDark ? COLORS.accent : COLORS.primary },
          ]}
        >
          {line2}
        </Text>
      )}
    </View>
  );
}
