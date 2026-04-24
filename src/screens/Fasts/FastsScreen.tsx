import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { useFasts } from '../../store/FastsContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import Starfield from '../../components/Starfield';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import FastCompleteScreen from './FastCompleteScreen';
import { FastRecord, SavedFast } from '../../types';
import i18n from '../../i18n';

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRESETS = [
  { id: '1', name: '16:8 Fast',    hours: 16,  shortLabel: '16:8', tag: 'Starter',  description: 'A steady daily rhythm.',          color: '#1E63E9', bg: '#EAF2FF' },
  { id: '2', name: '24 Hour Fast', hours: 24,  shortLabel: '24h',  tag: 'Reset',    description: 'A full day with a clean finish.', color: '#245EE6', bg: '#E6F0FF' },
  { id: '3', name: '36 Hour Fast', hours: 36,  shortLabel: '36h',  tag: 'Focus',    description: 'A deeper metabolic push.',        color: '#156FE6', bg: '#E9F4FF' },
  { id: '4', name: '48 Hour Fast', hours: 48,  shortLabel: '48h',  tag: 'Deep',     description: 'A longer, quieter reset.',        color: '#0F7AB8', bg: '#E5F6FF' },
  { id: '5', name: '72 Hour Fast', hours: 72,  shortLabel: '72h',  tag: 'Advanced', description: 'A serious recovery window.',      color: '#1E9BB8', bg: '#E6FBFF' },
  { id: '6', name: '7 Day Fast',   hours: 168, shortLabel: '7d',   tag: 'Extended', description: 'A long-form protocol.',           color: '#0E86A8', bg: '#E2FAFF' },
];

const STAGES = [
  { minHour: 0,  key: 'fasts.stage0' },
  { minHour: 8,  key: 'fasts.stage8' },
  { minHour: 12, key: 'fasts.stage12' },
  { minHour: 16, key: 'fasts.stage16' },
  { minHour: 24, key: 'fasts.stage24' },
  { minHour: 48, key: 'fasts.stage48' },
  { minHour: 72, key: 'fasts.stage72' },
];

function getStage(h: number) {
  const key = [...STAGES].reverse().find((s) => h >= s.minHour)?.key ?? STAGES[0].key;
  return i18n.t(key);
}

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getWeekDays() {
  const today = new Date();
  return [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return {
      day:     d.toLocaleDateString(i18n.locale as string, { weekday: 'short' }),
      date:    d.getDate(),
      isToday: offset === 0,
    };
  });
}

// ─── Ring timer ───────────────────────────────────────────────────────────────
// Large circular progress ring used on the active-fast view. Track stroke
// is subtle; progress stroke uses the preset's accent colour. The centre
// renders the elapsed HH:MM:SS + percent complete.
function RingTimer({
  progress, color, elapsedLabel, percent,
}: {
  progress: number;          // 0..1
  color: string;
  elapsedLabel: string;
  percent: number;
}) {
  const { colors } = useTheme();
  const SIZE   = 240;
  const STROKE = 14;
  const R      = (SIZE - STROKE) / 2;
  const C      = 2 * Math.PI * R;
  const offset = C * (1 - Math.max(0, Math.min(progress, 1)));

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <SvgLG id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={COLORS.primary} />
            <Stop offset="100%" stopColor={COLORS.accent} />
          </SvgLG>
        </Defs>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.border}
          strokeWidth={STROKE}
          fill="none"
          opacity={0.55}
        />
        {/* Progress — rotated -90° so it starts at 12 o'clock */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#ringGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${C} ${C}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      {/* Centre content */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase' }}>
          Fasting time
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: colors.text,
            fontSize: 40,
            fontWeight: '900',
            letterSpacing: -0.5,
            marginTop: 4,
            fontVariant: ['tabular-nums'],
          }}
        >
          {elapsedLabel}
        </Text>
        <View style={{ marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: color + '1E' }}>
          <Text style={{ color, fontSize: 12, fontWeight: '800' }}>{percent}%</Text>
        </View>
      </View>
    </View>
  );
}

function FloatingOrb({ size, top, left, delay, opacity }: {
  size: number; top: number; left: number; delay: number; opacity: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(drift, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [delay, drift]);
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(255,255,255,0.45)', opacity, transform: [{ translateY }] }}
    />
  );
}

// ─── Preset row ───────────────────────────────────────────────────────────────
function PlanRow({ preset, onPress }: { preset: typeof PRESETS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.planRow}>
      <View style={[styles.planIconBubble, { backgroundColor: preset.bg, borderColor: preset.color + '22' }]}>
        <Text style={[styles.planIconLabel, { color: preset.color }]}>{preset.shortLabel}</Text>
      </View>
      <View style={styles.planRowText}>
        <View style={styles.planRowTop}>
          <Text style={styles.planRowName}>{preset.name}</Text>
          <Text style={[styles.planRowHours, { color: preset.color }]}>{preset.hours}h</Text>
        </View>
        <Text style={styles.planRowDescription}>{preset.description}</Text>
        <View style={styles.planMetaRow}>
          <View style={[styles.planTagPill, { backgroundColor: preset.color + '14' }]}>
            <Text style={[styles.planRowTag, { color: preset.color }]}>{preset.tag}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.planArrow, { backgroundColor: preset.color + '12' }]}>
        <Text style={[styles.planArrowText, { color: preset.color }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Saved fast row ────────────────────────────────────────────────────────────
function SavedFastRow({ fast, onPress, onDelete }: { fast: SavedFast; onPress: () => void; onDelete: () => void }) {
  return (
    <View style={styles.savedRow}>
      <TouchableOpacity style={styles.savedMain} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.savedBubble}>
          <Text style={styles.savedBubbleText}>{fast.targetHours}h</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.savedName}>{fast.name}</Text>
          <Text style={styles.savedSub}>{`${fast.targetHours} ${i18n.t('history.hours')} · ${i18n.t('fasts.tapToStart')}`}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.savedDelete} activeOpacity={0.7}>
        <Text style={styles.savedDeleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FastsScreen() {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  useLanguage();
  const { profile } = useUser();
  const { activeFast, startFast, endFast, saveFastRecord, removeFast, savedFasts, saveCustomFast, removeSavedFast } = useFasts();

  const [elapsed, setElapsed]             = useState(0);
  const [showModal, setShowModal]         = useState(false);
  const [customHours, setCustomHours]     = useState('');
  const [customName, setCustomName]       = useState('');
  const [shouldSave, setShouldSave]       = useState(false);
  // pendingRecord holds the just-ended fast waiting for user notes/mood
  const [pendingRecord, setPendingRecord] = useState<FastRecord | null>(null);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const headerFloat = useRef(new Animated.Value(0)).current;
  const weekDays    = getWeekDays();

  // Floating header animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerFloat, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(headerFloat, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [headerFloat]);

  // Tick elapsed seconds from activeFast.startTime
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeFast) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeFast.startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeFast]);

  const handleStartFast = async (preset: typeof PRESETS[0]) => {
    await startFast({ hours: preset.hours, name: preset.name, color: preset.color });
  };

  // End the fast — returns an unsaved record; show FastCompleteScreen for mood/notes
  const handleEndFast = async () => {
    const record = await endFast();
    if (record) {
      // Persist immediately so history survives app restarts before user adds notes.
      await saveFastRecord(record);
      setPendingRecord(record);
    }
  };

  // Called from FastCompleteScreen "Save" button
  const handleSaveRecord = async (record: FastRecord, mood: string, notes: string) => {
    const finalRecord: FastRecord = { ...record, notes: notes ? `${mood} ${notes}` : mood };
    await saveFastRecord(finalRecord);
    setPendingRecord(null);
  };

  const handleDiscardRecord = async () => {
    if (pendingRecord) {
      await removeFast(pendingRecord.id);
    }
    setPendingRecord(null);
  };

  const heroLift = headerFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const heroGlow = headerFloat.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });

  // ── FastComplete overlay ──────────────────────────────────────────────────────
  if (pendingRecord) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <FastCompleteScreen
          record={pendingRecord}
          onSave={handleSaveRecord}
          onDiscard={handleDiscardRecord}
        />
      </View>
    );
  }

  // ── Active fast view ──────────────────────────────────────────────────────────
  if (activeFast) {
    const targetSec    = activeFast.targetHours * 3600;
    const progress     = Math.min(elapsed / targetSec, 1);
    const elapsedH     = elapsed / 3600;
    const progressPct  = Math.round(progress * 100);

    const startAt = new Date(activeFast.startTime);
    const endAt   = new Date(activeFast.startTime + activeFast.targetHours * 3_600_000);
    const fmtHM   = (d: Date) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Starfield density={0.08} />

        <ScrollView contentContainerStyle={styles.activeScroll} showsVerticalScrollIndicator={false}>
          {/* Top label row */}
          <View style={styles.activeHeaderRow}>
            <Text style={[styles.activeHeadline, { color: colors.text }]}>You're fasting!</Text>
            <Text style={[styles.activeHeadSub, { color: colors.textSecondary }]}>
              Stay with the rhythm. You've got this.
            </Text>
          </View>

          {/* Current fasting info pill */}
          <View style={[styles.currentPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.currentDot, { backgroundColor: activeFast.color }]} />
            <Text style={[styles.currentText, { color: colors.text }]}>
              Current: <Text style={{ color: activeFast.color }}>{activeFast.name}</Text>
            </Text>
          </View>

          {/* Circular ring */}
          <View style={[styles.ringCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <RingTimer
              progress={Math.min(elapsed / targetSec, 1)}
              color={activeFast.color}
              elapsedLabel={formatTime(elapsed)}
              percent={progressPct}
            />

            <TouchableOpacity activeOpacity={0.9} onPress={handleEndFast} style={styles.endInline}>
              <LinearGradient
                colors={[COLORS.primaryDeep, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.endInlineGrad}
              >
                <Text style={styles.endInlineText}>End fasting</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Start / End row */}
            <View style={[styles.startEndRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.seLabel, { color: colors.textSecondary }]}>Start fasting</Text>
                <Text style={[styles.seValue, { color: colors.text }]}>Today {fmtHM(startAt)}</Text>
              </View>
              <View style={[styles.seDivider, { backgroundColor: colors.border }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.seLabel, { color: colors.textSecondary }]}>End fasting</Text>
                <Text style={[styles.seValue, { color: colors.text }]}>
                  {endAt.toDateString() === new Date().toDateString() ? 'Today' : 'Tomorrow'} {fmtHM(endAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Body status card */}
          <View style={[styles.bodyStatusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.bodyIconBubble, { backgroundColor: activeFast.color + '1E' }]}>
              <Text style={{ fontSize: 18 }}>💧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bodyTitle, { color: colors.text }]}>Body status</Text>
              <Text style={[styles.bodyDesc, { color: colors.textSecondary }]}>
                {getStage(elapsedH)}
              </Text>
            </View>
            <View style={[styles.bodyLevelPill, { backgroundColor: activeFast.color + '1E' }]}>
              <Text style={[styles.bodyLevelText, { color: activeFast.color }]}>Lv.{Math.min(Math.floor(elapsedH / 8) + 1, 6)}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Plan selection ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Starfield />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Editorial hero — kicker + two-tone headline + avatar aside */}
        <Animated.View style={[styles.heroEditorial, { transform: [{ translateY: heroLift }] }]}>
          <View style={{ flex: 1, paddingRight: SPACING.sm }}>
            <Kicker>{profile ? `Hello, ${profile.name}` : 'WaterFastBuddy'}</Kicker>
            <View style={{ marginTop: 10 }}>
              <Headline line1="Fast smarter." line2="Become fluid." size={34} />
            </View>
            <Text style={[styles.heroLead, { color: colors.textSecondary }]}>
              {i18n.t('fasts.consistentPlanHint')}
            </Text>
          </View>
          <View style={styles.heroAvatarHalo}>
            {profile && <WaterBodyAvatar profile={profile} size={110} fastingHours={0} />}
          </View>
        </Animated.View>

        {/* Week strip */}
        <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {weekDays.map((d) => (
            <View key={d.date} style={[styles.dayItem, d.isToday && styles.dayItemActive]}>
              <Text style={[styles.dayLabel, d.isToday && styles.dayLabelActive]}>{d.day}</Text>
              <Text style={[styles.dayNum,   d.isToday && styles.dayNumActive]}>{d.date}</Text>
              {d.isToday && <View style={styles.dayDot} />}
            </View>
          ))}
        </View>

        <View style={[styles.plansSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('fasts.title')}</Text>
              <Text style={[styles.sectionSubTitle, { color: colors.textSecondary }]}>{i18n.t('ui.start')}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowModal(true)} style={[styles.customBtn, { backgroundColor: colors.cardAlt }]}>
              <Text style={[styles.customBtnText, { color: COLORS.primary }]}>{i18n.t('fasts.customFast')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.plansList}>
            {PRESETS.map((p, i) => (
              <React.Fragment key={p.id}>
                <PlanRow preset={p} onPress={() => handleStartFast(p)} />
                {i < PRESETS.length - 1 && <View style={[styles.planDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Saved / favourite custom plans */}
        {savedFasts.length > 0 && (
          <View style={[styles.plansSection, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 0 }]}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('fasts.savedFasts')}</Text>
                <Text style={[styles.sectionSubTitle, { color: colors.textSecondary }]}>{i18n.t('fasts.saveFast')}</Text>
              </View>
            </View>
            <View style={[styles.plansList, { borderColor: colors.border }]}>
              {savedFasts.map((sf, i) => (
                <View key={sf.id}>
                  <SavedFastRow
                    fast={sf}
                    onPress={() => startFast({ hours: sf.targetHours, name: sf.name, color: COLORS.primary })}
                    onDelete={() => removeSavedFast(sf.id)}
                  />
                  {i < savedFasts.length - 1 && <View style={[styles.planDivider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.infoDot, { backgroundColor: COLORS.primary }]} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{i18n.t('fasts.activeFast')}</Text>
        </View>
      </ScrollView>

      {/* Custom fast modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{i18n.t('fasts.customFast')}</Text>
            <Text style={styles.sheetSub}>{i18n.t('fasts.customHours')}</Text>
            <TextInput
              style={[styles.sheetInput, { backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border }]}
              keyboardType="numeric"
              placeholder={i18n.t('fasts.exampleHours')}
              placeholderTextColor={colors.textSecondary}
              value={customHours}
              onChangeText={setCustomHours}
              autoFocus
            />
            {/* Save-to-favourites toggle */}
            <View style={[styles.saveRow, { borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.saveRowLabel, { color: colors.text }]}>{i18n.t('fasts.saveFast')}</Text>
                <Text style={[styles.saveRowSub, { color: colors.textSecondary }]}>{i18n.t('fasts.savedFasts')}</Text>
              </View>
              <Switch
                value={shouldSave}
                onValueChange={setShouldSave}
                trackColor={{ true: COLORS.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {shouldSave && (
              <TextInput
                style={[styles.sheetInput, { marginBottom: SPACING.sm, fontSize: FONT_SIZE.md, backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border }]}
                placeholder={i18n.t('fasts.planNameOptional')}
                placeholderTextColor={colors.textSecondary}
                value={customName}
                onChangeText={setCustomName}
              />
            )}
            <View style={styles.sheetBtns}>
              <TouchableOpacity
                style={[styles.sheetCancel, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
                onPress={() => { setShowModal(false); setCustomHours(''); setCustomName(''); setShouldSave(false); }}
              >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{i18n.t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetStartWrap}
                onPress={async () => {
                  const h = parseFloat(customHours);
                  if (h > 0) {
                    const label = customName.trim() || `${h}h ${i18n.t('fasts.customFast')}`;
                    setShowModal(false);
                    setCustomHours('');
                    setCustomName('');
                    if (shouldSave) await saveCustomFast(label, h);
                    setShouldSave(false);
                    await startFast({ hours: h, name: label, color: COLORS.primary });
                  }
                }}
              >
                <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sheetStart}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.md }}>{i18n.t('fasts.startFast')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:     { flex: 1 },
  scrollBody: { paddingTop: 8, paddingBottom: 112 },

  // New editorial hero (two-tone headline + avatar halo)
  heroEditorial: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroLead: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginTop: SPACING.md,
    maxWidth: 240,
  },
  heroAvatarHalo: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroHaloRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
  },
  heroHaloRing2: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderStyle: 'dashed',
  },

  heroPanel:    { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  heroGradient: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, shadowColor: '#0F3D8A', shadowOpacity: 0.24, shadowRadius: 20, elevation: 8 },
  heroTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.md },
  heroKicker:   { fontSize: FONT_SIZE.xs, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
  heroTitle:    { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: '#fff', marginTop: 6, maxWidth: 220 },
  heroBodyText: { color: 'rgba(255,255,255,0.86)', marginTop: 8, fontSize: FONT_SIZE.md, lineHeight: 21, maxWidth: 250 },
  heroBadge:    { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: BORDER_RADIUS.lg, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', minWidth: 70 },
  heroBadgeLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
  heroBadgeValue: { color: '#fff', fontSize: FONT_SIZE.xl, fontWeight: '800', marginTop: 2 },
  heroFooterRow:  { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  heroChip:       { flex: 1, borderRadius: BORDER_RADIUS.lg, backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 10, paddingHorizontal: 12 },
  heroChipLabel:  { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
  heroChipValue:  { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700', marginTop: 4 },

  weekCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  dayItem:       { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16, minWidth: 52 },
  dayItemActive: { backgroundColor: COLORS.primary },
  dayLabel:      { fontSize: 10, color: '#7A8CA8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  dayLabelActive:{ color: 'rgba(255,255,255,0.78)' },
  dayNum:        { fontSize: FONT_SIZE.lg, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  dayNumActive:  { color: '#fff' },
  dayDot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginTop: 4 },

  heroSection:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, borderWidth: 1 },
  heroAvatarWrap: { width: 112, alignItems: 'center', justifyContent: 'center' },
  heroBubble:     { flex: 1, marginLeft: SPACING.sm },
  heroEyebrow:    { fontSize: FONT_SIZE.xs, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.9 },
  heroBubbleText: { fontSize: FONT_SIZE.xl, fontWeight: '800', lineHeight: 28 },
  heroSubtle:     { marginTop: 8, fontSize: FONT_SIZE.sm, lineHeight: 20 },

  plansSection:   { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  customBtn:      { borderRadius: BORDER_RADIUS.round, paddingHorizontal: 14, paddingVertical: 10 },
  customBtnText:  { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  sectionTitle:   { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  sectionSubTitle:{ fontSize: FONT_SIZE.sm, marginTop: 4 },

  plansList:    { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'transparent' },
  planRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  planIconBubble:{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  planIconLabel: { fontSize: FONT_SIZE.sm, fontWeight: '800', letterSpacing: 0.2 },
  planRowText:   { flex: 1, marginLeft: SPACING.md },
  planRowTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planRowName:   { fontSize: FONT_SIZE.md, fontWeight: '800', color: '#0F172A' },
  planRowHours:  { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  planRowDescription: { fontSize: FONT_SIZE.sm, color: '#71839D', marginTop: 4, lineHeight: 19 },
  planMetaRow:   { marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  planTagPill:   { borderRadius: BORDER_RADIUS.round, paddingHorizontal: 10, paddingVertical: 4 },
  planRowTag:    { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  planArrow:     { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  planArrowText: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
  planDivider:   { height: 1, marginLeft: 78 },

  infoCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 1, marginTop: SPACING.xs },
  infoDot:  { width: 10, height: 10, borderRadius: 5 },
  infoText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 20, fontWeight: '500' },

  // ── Active fast ──────────────────────────────────────────────────────────────
  activeScroll:        { paddingTop: 8, paddingBottom: 118 },

  // Active fast (new)
  activeHeaderRow: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  activeHeadline: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  activeHeadSub: {
    fontSize: FONT_SIZE.sm,
    marginTop: 4,
    textAlign: 'center',
  },
  currentPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  currentDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  currentText: {
    fontSize: FONT_SIZE.sm, fontWeight: '700',
  },
  ringCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    marginBottom: SPACING.lg,
  },
  endInline: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  endInlineGrad: {
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
  },
  endInlineText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  startEndRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    width: '100%',
  },
  seLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  seValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    marginTop: 3,
  },
  seDivider: {
    width: 1,
    height: 32,
    marginHorizontal: SPACING.md,
  },
  bodyStatusCard: {
    marginHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  bodyIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  bodyDesc: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  bodyLevelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  bodyLevelText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },

  activeHero:          { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  activeHeroGradient:  { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, shadowColor: '#0F3D8A', shadowOpacity: 0.25, shadowRadius: 22, elevation: 8 },
  heroHeaderRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activeKicker:        { fontSize: FONT_SIZE.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, color: 'rgba(255,255,255,0.75)' },
  activeTitle:         { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#fff' },
  activeSub:           { fontSize: FONT_SIZE.sm, marginTop: 2, color: 'rgba(255,255,255,0.88)' },
  goalPill:            { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: BORDER_RADIUS.lg, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 74 },
  goalPillLabel:       { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.8 },
  goalPillValue:       { fontSize: FONT_SIZE.lg, fontWeight: '800', color: '#fff', marginTop: 2 },
  avatarStage:         { alignItems: 'center', marginTop: SPACING.md, position: 'relative' },
  progressBadge:       { position: 'absolute', right: 0, bottom: 8, backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#0F3D8A', shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  progressBadgeValue:  { color: COLORS.primary, fontSize: FONT_SIZE.lg, fontWeight: '800', textAlign: 'center' },
  progressBadgeLabel:  { color: '#6B7D96', fontSize: 10, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },

  timeCard:         { marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeaderRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardLabel:        { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  cardMini:         { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  timeCardVal:      { fontSize: 44, fontWeight: '800', letterSpacing: 1.2, fontVariant: ['tabular-nums'], marginTop: 2 },
  timeCardBar:      { width: '100%', height: 10, backgroundColor: '#E1EBF9', borderRadius: 999, marginTop: SPACING.md, overflow: 'hidden' },
  timeCardBarFill:  { height: '100%', borderRadius: 999 },
  timeCardBarLabels:{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  barLabel:         { fontSize: 11, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  statCard:  { flex: 1, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statLbl:   { fontSize: 10, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 },
  statVal:   { fontSize: FONT_SIZE.md, fontWeight: '800' },

  stageCard:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  stageIconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  stageDot:     { width: 12, height: 12, borderRadius: 6 },
  stageHour:    { fontSize: FONT_SIZE.sm, fontWeight: '700', marginBottom: 4 },
  stageText:    { fontSize: FONT_SIZE.sm, lineHeight: 20 },

  endBtnWrap: { marginHorizontal: SPACING.lg },
  endBtn:     { borderRadius: BORDER_RADIUS.round, paddingVertical: SPACING.md + 2, alignItems: 'center' },
  endBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.md, letterSpacing: 0.3 },

  overlay: { flex: 1, backgroundColor: 'rgba(8,15,28,0.42)', justifyContent: 'flex-end' },
  sheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.xl, paddingTop: SPACING.md, borderTopWidth: 1 },
  sheetHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: SPACING.lg },
  sheetTitle:    { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#0F172A', marginBottom: SPACING.xs },
  sheetSub:      { fontSize: FONT_SIZE.md, color: '#64748B', marginBottom: SPACING.lg },
  sheetInput:    { borderWidth: 1.5, borderColor: '#DBEAFE', borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZE.xl, textAlign: 'center', color: '#0F172A', backgroundColor: '#F8FAFC', marginBottom: SPACING.lg },
  sheetBtns:     { flexDirection: 'row', gap: SPACING.md },
  sheetCancel:   { flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5, borderColor: '#E2E8F0', padding: SPACING.md, alignItems: 'center' },
  sheetStartWrap:{ flex: 1 },
  sheetStart:    { flex: 1, borderRadius: BORDER_RADIUS.round, padding: SPACING.md, alignItems: 'center' },

  // Save-to-favourites toggle row inside custom modal
  saveRow:       { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.md, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm },
  saveRowLabel:  { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  saveRowSub:    { fontSize: FONT_SIZE.xs, marginTop: 2 },

  // Saved fast rows
  savedRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  savedMain:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  savedBubble:    { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primary + '14', alignItems: 'center', justifyContent: 'center' },
  savedBubbleText:{ fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.primary },
  savedName:      { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#0F172A' },
  savedSub:       { fontSize: FONT_SIZE.xs, color: '#71839D', marginTop: 3 },
  savedDelete:    { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.sm },
  savedDeleteText:{ fontSize: 12, color: '#EF4444', fontWeight: '700' },
});
