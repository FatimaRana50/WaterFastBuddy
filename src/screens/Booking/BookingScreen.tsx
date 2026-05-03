// BookingScreen — premium 1-on-1 coaching landing.
// Same handlers, navigation, and modal logic as the original.
// Visual polish:
//  • Hero gradient panel (instead of plain card) with halo orb
//  • Pricing tiles: Standard upgraded with internal glow & ribbon
//  • Coach row: gradient avatar, star ribbon
//  • Closing CTA kept (HeroCTA component)
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import Kicker from '../../components/Kicker';
import HeroCTA from '../../components/HeroCTA';
import i18n from '../../i18n';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';

const BOOKING_URL = 'https://bookings.waterfastbuddy.com';

type Session = {
  key: string;
  duration: string;
  name: string;
  price: string;
  bullets: string[];
  popular?: boolean;
};

const SESSIONS: Session[] = [
  { key: 'intro',    duration: '30 MIN',     name: 'Intro call',         price: 'Free',  bullets: ['Meet your coach', 'Share your current goals', 'Get a sense of fit'] },
  { key: 'standard', duration: '60 MIN',     name: 'Standard session',   price: '£79',   bullets: ['Full protocol review', 'Personalised adjustments', 'Written follow-up notes'], popular: true },
  { key: 'bundle',   duration: '3 × 60 MIN', name: '3-session bundle',   price: '£199',  bullets: ['Priority scheduling', 'Between-session messaging', 'Progress tracking summary'] },
];

const COACHES = [
  { key: 'rachel', initial: 'R', name: 'Rachel T.', role: '3-session bundle' },
  { key: 'marcus', initial: 'M', name: 'Marcus W.', role: 'Standard session' },
  { key: 'anya',   initial: 'A', name: 'Anya K.',   role: 'Standard session' },
];

export default function BookingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  useLanguage();
  const [showCalendar, setShowCalendar] = useState(false);

  const openExternal = () => Linking.openURL(BOOKING_URL).catch(() => {});

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>{i18n.t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero gradient */}
        <LinearGradient
          colors={['#0A1628', COLORS.primaryDeep ?? '#08226B', COLORS.primaryDark ?? '#0D3AA8', COLORS.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroOrb} />
          <View style={styles.heroIconWrap}>
            <Ionicons name="videocam" size={22} color="#fff" />
          </View>
          <Text style={styles.heroKicker}>1-ON-1 COACHING</Text>
          <Text style={styles.heroTitle}>
            Book a 1-on-1{'\n'}
            <Text style={{ color: COLORS.accent }}>fasting session.</Text>
          </Text>
          <Text style={styles.heroBody}>
            Personalised guidance from certified fasting coaches. Plan your protocol,
            troubleshoot symptoms, and hit your goals.
          </Text>

          <View style={styles.chipRow}>
            {['30 or 60 min video sessions', 'Custom fasting protocol', 'Follow-up notes'].map((chip) => (
              <View key={chip} style={styles.chip}>
                <Ionicons name="checkmark-circle" size={13} color="#fff" />
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Pricing */}
        <View style={{ alignItems: 'center', marginTop: SPACING.xxl, marginBottom: SPACING.sm }}>
          <Kicker>Pricing</Kicker>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Simple, transparent sessions</Text>
        <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
          No subscriptions. Book only when you need support.
        </Text>

        {SESSIONS.map((s) => (
          <SessionCard key={s.key} session={s} onBook={() => setShowCalendar(true)} />
        ))}

        {/* Coaches */}
        <View style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          <Kicker>Recent clients</Kicker>
        </View>
        <View style={styles.coachRow}>
          {COACHES.map((c) => (
            <View key={c.key} style={[styles.coachCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.coachAvatar}
              >
                <Text style={styles.coachInitial}>{c.initial}</Text>
              </LinearGradient>
              <Text style={[styles.coachName, { color: colors.text }]}>{c.name}</Text>
              <Text style={[styles.coachRole, { color: colors.textSecondary }]}>{c.role}</Text>
              <View style={styles.coachStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons key={i} name="star" size={10} color={COLORS.warning ?? '#F59E0B'} />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Closing CTA */}
        <View style={{ marginTop: SPACING.xl }}>
          <HeroCTA
            kicker="Ready to get started?"
            title="Book a free intro call"
            body="No commitment. Takes less than two minutes to schedule."
            ctaLabel="Open booking calendar"
            ctaIcon="calendar"
            onPress={() => setShowCalendar(true)}
          />
        </View>

        <TouchableOpacity onPress={openExternal} style={{ alignSelf: 'center', marginTop: SPACING.md, padding: SPACING.sm }}>
          <Text style={{ color: COLORS.primary, fontWeight: '800' }}>Open in browser  ↗</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar modal */}
      <Modal visible={showCalendar} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCalendar(false)}>
        <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Booking</Text>
            <TouchableOpacity onPress={openExternal} style={styles.modalCloseBtn}>
              <Ionicons name="open-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <WebView source={{ uri: BOOKING_URL }} style={{ flex: 1, backgroundColor: colors.background }} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function SessionCard({ session, onBook }: { session: Session; onBook: () => void }) {
  const { colors } = useTheme();

  if (session.popular) {
    return (
      <LinearGradient
        colors={['#0A1628', COLORS.primaryDeep ?? '#08226B', COLORS.primaryDark ?? '#0D3AA8', COLORS.primary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.sessionCard, styles.sessionCardPopular]}
      >
        <View style={styles.popularRibbon}>
          <Ionicons name="flame" size={11} color="#fff" />
          <Text style={styles.popularRibbonText}>MOST POPULAR</Text>
        </View>
        <Text style={[styles.sessionDuration, { color: 'rgba(255,255,255,0.78)' }]}>{session.duration}</Text>
        <Text style={[styles.sessionName, { color: '#fff' }]}>{session.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={[styles.sessionPrice, { color: '#fff' }]}>{session.price}</Text>
        </View>
        <View style={{ height: SPACING.md }} />
        {session.bullets.map((b) => (
          <View key={b} style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={[styles.bulletText, { color: 'rgba(255,255,255,0.94)' }]}>{b}</Text>
          </View>
        ))}
        <TouchableOpacity style={[styles.sessionBtn, { backgroundColor: '#fff' }]} onPress={onBook} activeOpacity={0.85}>
          <Ionicons name="calendar" size={16} color={COLORS.primaryDark ?? '#0D3AA8'} />
          <Text style={[styles.sessionBtnText, { color: COLORS.primaryDark ?? '#0D3AA8' }]}>Book this session</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
      <Text style={[styles.sessionDuration, { color: COLORS.primary }]}>{session.duration}</Text>
      <Text style={[styles.sessionName, { color: colors.text }]}>{session.name}</Text>
      <Text style={[styles.sessionPrice, { color: colors.text }]}>{session.price}</Text>
      <View style={{ height: SPACING.md }} />
      {session.bullets.map((b) => (
        <View key={b} style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{b}</Text>
        </View>
      ))}
      <TouchableOpacity style={[styles.sessionBtn, { backgroundColor: COLORS.primary }]} onPress={onBook} activeOpacity={0.85}>
        <Ionicons name="calendar" size={16} color="#fff" />
        <Text style={[styles.sessionBtnText, { color: '#fff' }]}>Book this session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8, marginLeft: SPACING.md,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1, gap: 4,
  },
  backText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },

  content: { padding: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xxl },

  heroCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 }, elevation: 10,
  },
  heroOrb: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(56,189,248,0.18)', top: -100, right: -80 },
  heroIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroKicker: { color: 'rgba(255,255,255,0.78)', fontSize: FONT_SIZE.xs, fontWeight: '900', letterSpacing: 2.5 },
  heroTitle: {
    fontSize: 36, fontWeight: '900', color: '#fff',
    lineHeight: 40, marginTop: 8, letterSpacing: -1,
  },
  heroBody: { fontSize: FONT_SIZE.md, lineHeight: 22, marginTop: SPACING.md, color: 'rgba(255,255,255,0.9)' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SPACING.lg },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10,
  },
  chipText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '800' },

  sectionTitle: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6, letterSpacing: -0.6 },
  sectionBody:  { fontSize: FONT_SIZE.md, textAlign: 'center', marginBottom: SPACING.lg },

  sessionCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.md, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  sessionCardPopular: {
    shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 }, elevation: 10,
  },
  popularRibbon: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, marginBottom: SPACING.sm,
  },
  popularRibbonText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sessionDuration: { fontSize: FONT_SIZE.xs, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  sessionName:     { fontSize: FONT_SIZE.xl, fontWeight: '900', marginTop: 4, letterSpacing: -0.4 },
  sessionPrice:    { fontSize: 40, fontWeight: '900', marginTop: 4, letterSpacing: -1.5 },
  bulletRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  bulletText: { fontSize: FONT_SIZE.sm, flex: 1, fontWeight: '600' },
  sessionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.lg,
  },
  sessionBtnText: { fontSize: FONT_SIZE.md, fontWeight: '900' },

  coachRow: { flexDirection: 'row', gap: SPACING.sm },
  coachCard: {
    flex: 1, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, alignItems: 'center',
  },
  coachAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 3,
  },
  coachInitial: { fontSize: FONT_SIZE.lg, fontWeight: '900', color: '#fff' },
  coachName:    { fontSize: FONT_SIZE.sm, fontWeight: '900' },
  coachRole:    { fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  coachStars:   { flexDirection: 'row', gap: 1, marginTop: 6 },

  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modalCloseBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '900' },
});
