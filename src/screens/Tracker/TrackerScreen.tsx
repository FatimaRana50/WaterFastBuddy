import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useUser } from '../../store/UserContext';
import { useLanguage } from '../../store/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import Starfield from '../../components/Starfield';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import i18n from '../../i18n';

const WATER_KEY_PREFIX = 'water_glasses_';
const WEIGHT_KEY       = 'weight_log';
const GOAL_GLASSES     = 8;
const MAX_GLASSES      = 20;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

interface WeightEntry { date: string; weightKg: number }

export default function TrackerScreen() {
  const { colors, theme } = useTheme();
  const { profile, updateProfile } = useUser();
  useLanguage();
  const isDark = theme === 'dark';

  const [glasses, setGlasses]         = useState(0);
  const [weightLog, setWeightLog]     = useState<WeightEntry[]>([]);
  const [todayWeight, setTodayWeight] = useState<number | null>(null);

  // Weight modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [weightInput, setWeightInput]   = useState('');
  const [inputError, setInputError]     = useState('');
  const inputRef = useRef<TextInput>(null);

  const loadData = async () => {
    const raw = await AsyncStorage.getItem(WATER_KEY_PREFIX + todayKey());
    setGlasses(raw ? parseInt(raw, 10) : 0);

    const wRaw = await AsyncStorage.getItem(WEIGHT_KEY);
    const log: WeightEntry[] = wRaw ? JSON.parse(wRaw) : [];
    setWeightLog(log);
    const todayEntry = log.find(e => e.date === todayKey());
    setTodayWeight(todayEntry?.weightKg ?? null);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const addGlass = async () => {
    const next = Math.min(glasses + 1, MAX_GLASSES);
    setGlasses(next);
    await AsyncStorage.setItem(WATER_KEY_PREFIX + todayKey(), next.toString());
    Haptics.selectionAsync();
    computeStreak();
  };

  const removeGlass = async () => {
    const next = Math.max(glasses - 1, 0);
    setGlasses(next);
    await AsyncStorage.setItem(WATER_KEY_PREFIX + todayKey(), next.toString());
    Haptics.selectionAsync();
    computeStreak();
  };

  const addPreset = async (qty: number) => {
    const next = Math.min(glasses + qty, MAX_GLASSES);
    setGlasses(next);
    await AsyncStorage.setItem(WATER_KEY_PREFIX + todayKey(), next.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    computeStreak();
  };

  const openWeightModal = () => {
    const current = todayWeight ?? (profile?.weightKg ?? 70);
    setWeightInput(current.toString());
    setInputError('');
    setModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const saveWeight = async () => {
    const val = parseFloat(weightInput);
    if (!weightInput || isNaN(val) || val < 20 || val > 500) {
      setInputError('Enter a valid weight between 20 and 500 kg.');
      return;
    }
    const entry: WeightEntry = { date: todayKey(), weightKg: val };
    const updated = [...weightLog.filter(e => e.date !== todayKey()), entry]
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeightLog(updated);
    setTodayWeight(val);
    await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(updated));
    if (profile) await updateProfile({ weightKg: val });
    setModalVisible(false);
  };

  const waterPct  = Math.min(glasses / GOAL_GLASSES, 1);
  const gridCount = Math.min(MAX_GLASSES, Math.max(GOAL_GLASSES, glasses < MAX_GLASSES ? glasses + 1 : MAX_GLASSES));
  const last7     = weightLog.slice(-7);

  // compute hydration streak: consecutive days (including today) where glasses >= GOAL_GLASSES
  const computeStreak = async () => {
    try {
      let s = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const raw = await AsyncStorage.getItem(WATER_KEY_PREFIX + key);
        const count = raw ? parseInt(raw, 10) : 0;
        if (count >= GOAL_GLASSES) s++; else break;
      }
      setStreak(s);
      if (s > 0 && [3,7,14,30].includes(s)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2200);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { computeStreak(); }, []);

  // Entrance animations
  const waterAnim = useRef(new Animated.Value(0)).current;
  const weightAnim = useRef(new Animated.Value(0)).current;
  const iconScales = useRef(Array.from({ length: MAX_GLASSES }, () => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.timing(waterAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    Animated.timing(weightAnim, { toValue: 1, duration: 450, delay: 120, useNativeDriver: true }).start();
  }, []);

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>{i18n.t('ui.completeOnboardingFirst')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Starfield density={0.07} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroBlock}>
          <Kicker>Daily tracker</Kicker>
          <View style={{ marginTop: 10 }}>
            <Headline line1="Weight &" line2="Hydration." size={32} />
          </View>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            Log today's weight and keep your water intake on track.
          </Text>
        </View>

        {/* ── Water tracker ─────────────────────────────────────────── */}
        <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: waterAnim, transform: [{ translateY: waterAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: COLORS.accent + '22' }]}>
              <Ionicons name="water" size={18} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Water Intake</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                {glasses} glass{glasses !== 1 ? 'es' : ''} today · ~{Math.round(glasses * 250)}ml
              </Text>
            </View>
            <Text style={[styles.pctLabel, { color: COLORS.accent }]}>
              {Math.round(waterPct * 100)}%
            </Text>
          </View>

          {/* Avatar — fill = today's hydration % */}
          <View style={styles.avatarWrap}>
            <WaterBodyAvatar profile={profile} fillPct={waterPct} size={185} animate />
            <View style={[styles.hydrationBadge, { backgroundColor: COLORS.accent + '18', borderColor: COLORS.accent + '50' }]}>
              <Text style={[styles.hydrationBadgeText, { color: COLORS.accent }]}>
                {glasses >= GOAL_GLASSES ? '💧 Fully hydrated!' : `${glasses} / ${GOAL_GLASSES} goal`}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: colors.cardAlt }]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${waterPct * 100}%` as any }]}
            />
          </View>

          {/* Quick-add presets + streak */}
          <View style={styles.quickAddRow}>
            <TouchableOpacity style={[styles.presetBtn, { borderColor: colors.border }]} onPress={() => addPreset(1)} activeOpacity={0.85}>
              <Text style={[styles.presetLabel, { color: colors.text }]}>250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.presetBtn, { borderColor: colors.border }]} onPress={() => addPreset(2)} activeOpacity={0.85}>
              <Text style={[styles.presetLabel, { color: colors.text }]}>500ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.presetBtn, { borderColor: colors.border }]} onPress={() => addPreset(3)} activeOpacity={0.85}>
              <Text style={[styles.presetLabel, { color: colors.text }]}>750ml</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <View style={styles.streakWrap}>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Streak</Text>
              <Text style={[styles.streakValue, { color: COLORS.primary }]}>{streak}d</Text>
            </View>
          </View>

          {/* Grouped glasses grid (rows of 4) */}
          <View style={styles.glassGridGrouped}>
            {Array.from({ length: gridCount }).reduce<Array<number[]>>((rows, _, idx) => {
              const rowIndex = Math.floor(idx / 4);
              rows[rowIndex] = rows[rowIndex] || [];
              rows[rowIndex].push(idx);
              return rows;
            }, []).map((row, rIdx) => (
              <View key={rIdx} style={styles.glassRow}>
                {row.map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={i < glasses ? removeGlass : addGlass}
                    activeOpacity={0.8}
                    onPressIn={() => { Animated.spring(iconScales[i], { toValue: 0.88, useNativeDriver: true }).start(); Haptics.selectionAsync(); }}
                    onPressOut={() => Animated.spring(iconScales[i], { toValue: 1, useNativeDriver: true }).start()}
                  >
                    <Animated.View style={{ transform: [{ scale: iconScales[i] }] }}>
                      <View style={[
                        styles.glassIcon,
                        i < glasses && styles.glassIconFull,
                        i === GOAL_GLASSES - 1 && styles.glassIconGoal,
                      ]}>
                        <Ionicons
                          name={i < glasses ? 'water' : 'water-outline'}
                          size={22}
                          color={i < glasses ? COLORS.accent : (isDark ? 'rgba(255,255,255,0.2)' : '#C5D8EE')}
                        />
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.glassBtn, styles.glassBtnMinus, { borderColor: colors.border }]}
              onPress={removeGlass}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={20} color={colors.textSecondary} />
              <Text style={[styles.glassBtnText, { color: colors.textSecondary }]}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.glassBtn} onPress={addGlass} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.glassBtnGrad}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.glassBtnTextWhite}>Add glass</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </Animated.View>

        {/* ── Weight tracker ─────────────────────────────────────────── */}
        <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: weightAnim, transform: [{ translateY: weightAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: COLORS.primary + '22' }]}>
              <Ionicons name="body" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Weight</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                {todayWeight != null
                  ? `${todayWeight} kg logged today`
                  : `Goal: ${profile.goalWeightKg} kg`}
              </Text>
            </View>
            {todayWeight != null && (
              <View style={[styles.weightBubble, { backgroundColor: COLORS.primary + '18' }]}>
                <Text style={[styles.weightBig, { color: COLORS.primary }]}>{todayWeight}</Text>
                <Text style={[styles.weightUnit, { color: COLORS.primary }]}>kg</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={openWeightModal} activeOpacity={0.85} style={{ marginTop: SPACING.sm }}>
            <LinearGradient
              colors={[COLORS.primaryDark, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.logWeightBtn}
            >
              <Ionicons name="scale-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.logWeightBtnText}>
                {todayWeight != null ? 'Update Weight' : "Log Today's Weight"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Mini trend — last 7 entries */}
          {last7.length >= 2 && (
            <View style={{ marginTop: SPACING.md }}>
              <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>Last {last7.length} entries</Text>
              <View style={styles.trendRow}>
                {last7.map((e, i) => {
                  const min = Math.min(...last7.map(x => x.weightKg));
                  const max = Math.max(...last7.map(x => x.weightKg));
                  const range = max - min || 1;
                  const barH = 10 + ((e.weightKg - min) / range) * 50;
                  const isLatest = i === last7.length - 1;
                  return (
                    <View key={e.date} style={styles.trendBar}>
                      <Text style={[styles.trendVal, { color: isLatest ? COLORS.primary : colors.textSecondary }]}>
                        {e.weightKg}
                      </Text>
                      <LinearGradient
                        colors={isLatest ? [COLORS.primary, COLORS.accent] : [colors.cardAlt, colors.border]}
                        style={[styles.trendBarFill, { height: barH }]}
                      />
                      <Text style={[styles.trendDate, { color: colors.textSecondary }]}>
                        {e.date.slice(5)}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {(() => {
                const diff = last7[last7.length - 1].weightKg - last7[0].weightKg;
                const color = diff < 0 ? COLORS.success : diff > 0 ? COLORS.danger : colors.textSecondary;
                return (
                  <View style={[styles.diffChip, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                    <Ionicons name={diff < 0 ? 'trending-down' : diff > 0 ? 'trending-up' : 'remove'} size={14} color={color} />
                    <Text style={[styles.diffText, { color }]}>
                      {diff < 0 ? '' : '+'}{diff.toFixed(1)} kg over this period
                    </Text>
                  </View>
                );
              })()}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Weight entry modal ─────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalSheetWrap}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Weight</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Enter your current weight in kilograms
            </Text>

            <View style={[
              styles.modalInputWrap,
              { borderColor: inputError ? COLORS.danger : colors.border, backgroundColor: colors.background },
            ]}>
              <Ionicons name="scale-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                ref={inputRef}
                style={[styles.modalInput, { color: colors.text }]}
                value={weightInput}
                onChangeText={t => { setWeightInput(t); setInputError(''); }}
                keyboardType="decimal-pad"
                placeholder="e.g. 72.5"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={saveWeight}
              />
              <Text style={[styles.modalUnit, { color: colors.textSecondary }]}>kg</Text>
            </View>

            {inputError ? (
              <Text style={styles.modalError}>{inputError}</Text>
            ) : null}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtnSave} onPress={saveWeight} activeOpacity={0.85}>
                <LinearGradient
                  colors={[COLORS.primaryDark, COLORS.primary]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.modalBtnSaveGrad}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.modalBtnSaveText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: 20 },

  heroBlock: { paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  heroSub: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: SPACING.sm },

  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconBadge: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  cardSub:   { fontSize: FONT_SIZE.xs, marginTop: 2 },
  pctLabel:  { fontSize: FONT_SIZE.xl, fontWeight: '900' },

  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.md },
  progressFill:  { height: '100%', borderRadius: 4 },

  avatarWrap: { alignItems: 'center', marginVertical: SPACING.sm },
  hydrationBadge: {
    marginTop: SPACING.sm,
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1,
  },
  hydrationBadgeText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  glassGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center', marginBottom: SPACING.md,
  },
  glassIcon: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  glassIconFull: { backgroundColor: COLORS.accent + '18' },
  glassIconGoal: { borderWidth: 1.5, borderColor: COLORS.accent + '60', borderStyle: 'dashed' },

  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  glassBtn: { flex: 1, borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  glassBtnMinus: {
    borderWidth: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 6, borderRadius: BORDER_RADIUS.round,
  },
  glassBtnGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 12, gap: 6,
  },
  glassBtnText:      { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  glassBtnTextWhite: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#fff' },

  weightBubble: {
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: BORDER_RADIUS.md,
  },
  weightBig:  { fontSize: FONT_SIZE.xl, fontWeight: '900' },
  weightUnit: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  logWeightBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: BORDER_RADIUS.round,
  },
  logWeightBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '800' },

  trendLabel: { fontSize: FONT_SIZE.xs, fontWeight: '600', marginBottom: SPACING.sm },
  trendRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: SPACING.sm },
  trendBar:   { flex: 1, alignItems: 'center', gap: 4 },
  trendBarFill: { width: '100%', borderRadius: 4, minHeight: 10 },
  trendVal:   { fontSize: 10, fontWeight: '700' },
  trendDate:  { fontSize: 9, fontWeight: '600' },

  diffChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
  },
  diffText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },

  // Modal
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheetWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
  },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: 40,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 20,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '900', marginBottom: 4 },
  modalSub:   { fontSize: FONT_SIZE.sm, marginBottom: SPACING.lg },

  modalInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    marginBottom: SPACING.sm,
  },
  modalInput: { flex: 1, fontSize: FONT_SIZE.lg, fontWeight: '700' },
  modalUnit:  { fontSize: FONT_SIZE.md, fontWeight: '700', marginLeft: 4 },
  modalError: { color: COLORS.danger, fontSize: FONT_SIZE.xs, fontWeight: '600', marginBottom: SPACING.sm },

  modalBtnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  modalBtnCancel: {
    flex: 1, borderWidth: 1, borderRadius: BORDER_RADIUS.round,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
  },
  modalBtnCancelText: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  modalBtnSave: { flex: 2, borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  modalBtnSaveGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  modalBtnSaveText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '800' },
  quickAddRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  presetBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', minWidth: 64,
  },
  presetLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  streakWrap: { alignItems: 'flex-end' },
  streakLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  streakValue: { fontSize: FONT_SIZE.md, fontWeight: '900' },
  glassGridGrouped: { marginBottom: SPACING.md },
  glassRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
});
