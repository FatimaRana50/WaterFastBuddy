import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

export default function BookingScreen() {
  const { colors } = useTheme();
  useLanguage();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t('topBar.book')}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('ui.bookOneOnOne')}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{i18n.t('ui.openBookingPage')}</Text>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://bookings.waterfastbuddy.com')}>
          <Text style={styles.buttonText}>{i18n.t('ui.openBookingPage')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
