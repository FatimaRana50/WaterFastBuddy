import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';
import { Language } from '../../types';

const LANGUAGE_OPTIONS: { key: Language; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
  { key: 'fr', label: 'Français' },
  { key: 'hi', label: 'हिन्दी' },
  { key: 'zh', label: '中文' },
];

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { language: appLanguage, setLanguage: updateAppLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(appLanguage);

  useEffect(() => {
    setSelectedLanguage(appLanguage);
  }, [appLanguage]);

  const updateLanguage = async (next: Language) => {
    setSelectedLanguage(next);
    await updateAppLanguage(next);
  };

  const openBooking = () => Linking.openURL('https://bookings.waterfastbuddy.com');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[COLORS.mist, '#DCEEFF', '#ECF8FF']} style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.orbTop} />

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.gradientStart, COLORS.gradientEnd]} style={styles.hero}>
          <Text style={styles.heroKicker}>{i18n.t('settingsScreen.preferences')}</Text>
          <Text style={styles.title}>{i18n.t('ui.settings')}</Text>
          <Text style={styles.heroBody}>{i18n.t('settingsScreen.heroBody')}</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.appearance')}</Text>
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{i18n.t('ui.darkMode')}</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{i18n.t('settingsScreen.darkModeHelp')}</Text>
            </View>
            <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ true: COLORS.primary, false: colors.border }} thumbColor="#fff" />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('profile.language')}</Text>
          <View style={styles.languageWrap}>
            {LANGUAGE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.languageChip,
                  { borderColor: colors.border, backgroundColor: colors.cardAlt },
                  selectedLanguage === item.key && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '14' },
                ]}
                onPress={() => updateLanguage(item.key)}
              >
                  <Text style={[styles.languageLabel, { color: selectedLanguage === item.key ? COLORS.primary : colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.helper, { color: colors.textSecondary }]}>{i18n.t('settingsScreen.currentLocale')}: {i18n.locale}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.business')}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={openBooking}>
            <Text style={styles.actionText}>{i18n.t('ui.bookOneOnOneSession')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary + '14' }]} onPress={() => Alert.alert(i18n.t('settingsScreen.backupTitle'), i18n.t('settingsScreen.backupBody')) }>
            <Text style={[styles.actionText, { color: COLORS.primary }]}>{i18n.t('settingsScreen.backupRestore')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(91,170,255,0.2)',
    top: -120,
    right: -100,
  },
  content: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 80 },
  hero: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, shadowColor: '#2A84E2', shadowOpacity: 0.22, shadowRadius: 15, elevation: 7 },
  heroKicker: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '900', color: '#fff', marginTop: 6 },
  heroBody: { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.sm, fontSize: FONT_SIZE.md, lineHeight: 22 },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, shadowColor: '#1A4D93', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  rowSub: { fontSize: FONT_SIZE.sm, marginTop: 4, maxWidth: 240 },
  languageWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languageChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  languageLabel: { fontWeight: '700', fontSize: FONT_SIZE.sm },
  helper: { marginTop: SPACING.sm, fontSize: FONT_SIZE.sm },
  actionBtn: { borderRadius: BORDER_RADIUS.round, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.primary, marginTop: SPACING.sm },
  actionText: { color: '#fff', fontWeight: '800' },
});
