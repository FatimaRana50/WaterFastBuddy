import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

export default function BookingScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Book 1-on-1</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>cal.com booking</Text>
        <Text style={[styles.body, { color: colors.text }]}>This screen will open the client’s booking page at bookings.waterfastbuddy.com.</Text>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://bookings.waterfastbuddy.com')}>
          <Text style={styles.buttonText}>Open Booking Page</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: 60 },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: SPACING.lg },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
  label: { textTransform: 'uppercase', fontSize: FONT_SIZE.sm, letterSpacing: 1, marginBottom: SPACING.xs },
  body: { fontSize: FONT_SIZE.md, lineHeight: 22 },
  button: { marginTop: SPACING.lg, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.primary, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
});
