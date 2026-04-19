import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

export default function TipDetailScreen({ route }: any) {
  const { colors } = useTheme();
  const tip = route?.params?.tip ?? {
    title: 'Hydration timing matters',
    category: 'Basics',
    readTime: '4 min',
    body: 'This is a sample article body. Replace it with the client’s fasting education content when ready.',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: COLORS.primary }]}> 
        <Text style={styles.category}>{tip.category}</Text>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.meta}>{tip.readTime} read</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.body, { color: colors.text }]}>{tip.body}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: 54 },
  hero: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg },
  category: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.sm, textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: '#fff', fontSize: FONT_SIZE.xxl, fontWeight: '800', marginTop: SPACING.sm },
  meta: { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.md, fontWeight: '600' },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
  body: { fontSize: FONT_SIZE.md, lineHeight: 24 },
});
