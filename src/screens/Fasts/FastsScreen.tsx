import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLG, RadialGradient as SvgRG, Stop } from 'react-native-svg';

import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { useFasts } from '../../store/FastsContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import Starfield from '../../components/Starfield';
import FastCompleteScreen from './FastCompleteScreen';
import { FastRecord, SavedFast } from '../../types';
import i18n from '../../i18n';

// ─── Data (unchanged) ─────────────────────────────────────────────────────────
const PRESETS = [
  { id: '1', name: '16:8 Fast',    hours: 16,  shortLabel: '16:8', tag: 'Starter',  description: 'A steady daily rhythm.',          color: '#1E63E9', bg: '#EAF2FF' },
  { id: '2', name: '24 Hour Fast', hours: 24,  shortLabel: '24h',  tag: 'Reset',    description: 'A full day with a clean finish.', color: '#245EE6', bg: '#E6F0FF' },
  { id: '3', name: '36 Hour Fast', hours: 36,  shortLabel: '36h',  tag: 'Focus',    description: 'A deeper metabolic push.',        color: '#156FE6', bg: '#E9F4FF' },
  { id: '4', name: '48 Hour Fast', hours: 48,  shortLabel: '48h',  tag: 'Deep',     description: 'A longer, quieter reset.',        color: '#0F7AB8', bg: '#E5F6FF' },
  { id: '5', name: '72 Hour Fast', hours: 72,  shortLabel: '72h',  tag: 'Advanced', description: 'A serious recovery window.',      color: '#1E9BB8', bg: '#E6FBFF' },
  { id: '6', name: '7 Day Fast',   hours: 168, shortLabel: '7d',   tag: 'Extended', description: 'A long-form protocol.',           color: '#0E86A8', bg: '#E2FAFF' },
];

const STAGES = [
  { minHour: 0,   key: 'fasts.stage0' },
  { minHour: 4,   key: 'fasts.stage4' },
  { minHour: 8,   key: 'fasts.stage8' },
  { minHour: 10,  key: 'fasts.stage10' },
  { minHour: 12,  key: 'fasts.stage12' },
  { minHour: 14,  key: 'fasts.stage14' },
  { minHour: 16,  key: 'fasts.stage16' },
  { minHour: 18,  key: 'fasts.stage18' },
  { minHour: 20,  key: 'fasts.stage20' },
  { minHour: 24,  key: 'fasts.stage24' },
  { minHour: 30,  key: 'fasts.stage30' },
  { minHour: 36,  key: 'fasts.stage36' },
  { minHour: 48,  key: 'fasts.stage48' },
  { minHour: 60,  key: 'fasts.stage60' },
  { minHour: 72,  key: 'fasts.stage72' },
  { minHour: 96,  key: 'fasts.stage96' },
  { minHour: 120, key: 'fasts.stage120' },
  { minHour: 144, key: 'fasts.stage144' },
  { minHour: 168, key: 'fasts.stage168' },
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

// ─── Ambient background glows ─────────────────────────────────────────────────
function AmbientGlows() {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = (v: Animated.Value, d: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    loop(a, 6500);
    loop(b, 8200);
  }, [a, b]);
  const ty1 = a.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });
  const ty2 = b.interpolate({ inputRange: [0, 1], outputRange: [16, -10] });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.glow, { top: -80, left: -60, transform: [{ translateY: ty1 }] }]}>
        <LinearGradient
          colors={['rgba(30,99,233,0.35)', 'rgba(30,99,233,0)']}
          style={styles.glowFill}
        />
      </Animated.View>
      <Animated.View style={[styles.glow, { top: 220, right: -100, transform: [{ translateY: ty2 }] }]}>
        <LinearGradient
          colors={['rgba(30,155,184,0.28)', 'rgba(30,155,184,0)']}
          style={styles.glowFill}
        />
      </Animated.View>
      <Animated.View style={[styles.glowSm, { bottom: 60, left: 40, transform: [{ translateY: ty1 }] }]}>
        <LinearGradient
          colors={['rgba(125,180,255,0.22)', 'rgba(125,180,255,0)']}
          style={styles.glowFill}
        />
      </Animated.View>
    </View>
  );
}

// ─── Tactile press wrapper ────────────────────────────────────────────────────
function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.97,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  scaleTo?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 40, bounciness: 0 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start()
      }
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

// ─── Ring timer (premium) ─────────────────────────────────────────────────────
function RingTimer({
  progress, color, elapsedLabel, percent,
}: {
  progress: number;
  color: string;
  elapsedLabel: string;
  percent: number;
}) {
  const { colors } = useTheme();
  const SIZE   = 264;
  const STROKE = 16;
  const R      = (SIZE - STROKE) / 2;
  const C      = 2 * Math.PI * R;

  // Animated progress
  const animatedProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: Math.max(0, Math.min(progress, 1)),
      useNativeDriver: false,
      speed: 8,
      bounciness: 4,
    }).start();
  }, [progress, animatedProgress]);
  const offset = animatedProgress.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });

  // Breathing pulse
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.05] });

  const AnimCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={{ width: SIZE + 40, height: SIZE + 40, alignItems: 'center', justifyContent: 'center' }}>
      {/* Breathing halo */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: SIZE + 30, height: SIZE + 30, borderRadius: (SIZE + 30) / 2,
          backgroundColor: color,
          opacity: pulseOpacity,
          transform: [{ scale: pulseScale }],
        }}
      />
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <SvgLG id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor={COLORS.primary} stopOpacity="1" />
            <Stop offset="60%"  stopColor={color}          stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.accent}  stopOpacity="1" />
          </SvgLG>
          <SvgRG id="innerGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="60%"  stopColor={color} stopOpacity="0" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.10" />
          </SvgRG>
        </Defs>

        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R - 1} fill="url(#innerGlow)" />

        {/* Track */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={colors.border}
          strokeWidth={STROKE}
          fill="none"
          opacity={0.45}
        />
        {/* Progress */}
        <AnimCircle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke="url(#ringGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${C} ${C}`}
          strokeDashoffset={offset as unknown as number}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>
          Fasting time
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: colors.text,
            fontSize: 46,
            fontWeight: '200',
            letterSpacing: -1.2,
            marginTop: 6,
            fontVariant: ['tabular-nums'],
          }}
        >
          {elapsedLabel}
        </Text>
        <View style={{
          marginTop: 10,
          paddingHorizontal: 12, paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: color + '1F',
          borderWidth: 1, borderColor: color + '33',
        }}>
          <Text style={{ color, fontSize: 12, fontWeight: '800', letterSpacing: 0.4 }}>{percent}% complete</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Floating particle (used inside ring card) ────────────────────────────────
function Particle({ size, top, left, delay, opacity = 0.5 }: {
  size: number; top: number; left: number; delay: number; opacity?: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(drift, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [delay, drift]);
  const ty = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });
  const op = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [opacity * 0.4, opacity, opacity * 0.4] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', top, left,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: 'rgba(125,180,255,0.85)',
        opacity: op,
        transform: [{ translateY: ty }],
        shadowColor: '#1E63E9', shadowOpacity: 0.6, shadowRadius: 6,
      }}
    />
  );
}

// ─── Plan row (premium glass card) ────────────────────────────────────────────
function PlanRow({ preset, onPress, index = 0 }: { preset: typeof PRESETS[0]; onPress: () => void; index?: number }) {
  const { colors } = useTheme();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 480,
      delay: 80 + index * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      <PressableScale onPress={onPress} scaleTo={0.985}>
        <View style={[styles.planCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Soft internal highlight */}
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={styles.planHighlight}
            pointerEvents="none"
          />

          <View style={[styles.planBubble, { borderColor: preset.color + '33' }]}>
            <LinearGradient
              colors={[preset.bg, '#FFFFFF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill as any}
            />
            <Text style={[styles.planBubbleLabel, { color: preset.color }]}>{preset.shortLabel}</Text>
          </View>

          <View style={styles.planMid}>
            <View style={styles.planTitleRow}>
              <Text style={[styles.planName, { color: colors.text }]}>{preset.name}</Text>
              <Text style={[styles.planHoursLabel, { color: preset.color }]}>{preset.hours}h</Text>
            </View>
            <Text style={[styles.planDesc, { color: colors.textSecondary }]} numberOfLines={1}>
              {preset.description}
            </Text>
            <View style={[styles.planTag, { backgroundColor: preset.color + '14', borderColor: preset.color + '24' }]}>
              <Text style={[styles.planTagText, { color: preset.color }]}>{preset.tag}</Text>
            </View>
          </View>

          <View style={[styles.planChevron, { backgroundColor: preset.color + '12' }]}>
            <Text style={[styles.planChevronText, { color: preset.color }]}>›</Text>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

// ─── Saved fast row ───────────────────────────────────────────────────────────
function SavedFastRow({ fast, onPress, onDelete }: { fast: SavedFast; onPress: () => void; onDelete: () => void; }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.savedRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <PressableScale onPress={onPress} style={{ flex: 1 }} scaleTo={0.98}>
        <View style={styles.savedMain}>
          <View style={styles.savedBubble}>
            <Text style={styles.savedBubbleText}>{fast.targetHours}h</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.savedName, { color: colors.text }]}>{fast.name}</Text>
            <Text style={[styles.savedSub, { color: colors.textSecondary }]}>
              {`${fast.targetHours} ${i18n.t('history.hours')} · ${i18n.t('fasts.tapToStart')}`}
            </Text>
          </View>
        </View>
      </PressableScale>
      <PressableScale onPress={onDelete} scaleTo={0.9}>
        <View style={styles.savedDelete}>
          <Text style={styles.savedDeleteText}>✕</Text>
        </View>
      </PressableScale>
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
  const [pendingRecord, setPendingRecord] = useState<FastRecord | null>(null);
  const [hoursFocused, setHoursFocused]   = useState(false);
  const [nameFocused, setNameFocused]     = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const headerFloat = useRef(new Animated.Value(0)).current;
  const heroEnter   = useRef(new Animated.Value(0)).current;
  const weekDays    = useMemo(() => getWeekDays(), []);

  // Hero entrance
  useEffect(() => {
    Animated.timing(heroEnter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [heroEnter]);

  // Subtle float
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerFloat, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(headerFloat, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [headerFloat]);

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

  const handleEndFast = async () => {
    const record = await endFast();
    if (record) {
      await saveFastRecord(record);
      setPendingRecord(record);
    }
  };

  const handleSaveRecord = async (record: FastRecord, mood: string, notes: string) => {
    const finalRecord: FastRecord = { ...record, notes: notes ? `${mood} ${notes}` : mood };
    await saveFastRecord(finalRecord);
    setPendingRecord(null);
  };

  const handleDiscardRecord = async () => {
    if (pendingRecord) await removeFast(pendingRecord.id);
    setPendingRecord(null);
  };

  const heroLift = headerFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const heroOpacity = heroEnter;
  const heroTranslate = heroEnter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  // ── FastComplete overlay ──────────────────────────────────────────────────
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

  // ── Active fast view ──────────────────────────────────────────────────────
  if (activeFast) {
    const targetSec    = activeFast.targetHours * 3600;
    const progress     = Math.min(elapsed / targetSec, 1);
    const elapsedH     = elapsed / 3600;
    const progressPct  = Math.round(progress * 100);

    const startAt = new Date(activeFast.startTime);
    const endAt   = new Date(activeFast.startTime + activeFast.targetHours * 3_600_000);
    const fmtHM   = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <AmbientGlows />
        <Starfield density={0.08} />

        <ScrollView contentContainerStyle={styles.activeScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.activeHeaderRow}>
            <Text style={[styles.activeKickerLux, { color: COLORS.primary }]}>IN FLOW</Text>
            <Text style={[styles.activeHeadline, { color: colors.text }]}>You're fasting</Text>
            <Text style={[styles.activeHeadSub, { color: colors.textSecondary }]}>
              Stay with the rhythm. You've got this.
            </Text>
          </View>

          <View style={[styles.currentPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.currentDot, { backgroundColor: activeFast.color }]} />
            <Text style={[styles.currentText, { color: colors.text }]}>
              Current: <Text style={{ color: activeFast.color, fontWeight: '900' }}>{activeFast.name}</Text>
            </Text>
          </View>

          {/* Ring card with glass + gradient + particles */}
          <View style={[styles.ringCard, { borderColor: colors.border }]}>
            <LinearGradient
              colors={isDark
                ? ['rgba(30,99,233,0.18)', 'rgba(15,30,60,0.55)']
                : ['rgba(255,255,255,0.95)', 'rgba(234,242,255,0.85)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill as any}
            />
            {/* Particles */}
            <Particle size={5} top={40}  left={30}  delay={0}    opacity={0.55} />
            <Particle size={3} top={90}  left={300} delay={800}  opacity={0.5} />
            <Particle size={4} top={260} left={20}  delay={1500} opacity={0.4} />
            <Particle size={3} top={310} left={310} delay={2200} opacity={0.45} />

            <View style={{ alignItems: 'center', paddingTop: SPACING.md }}>
              <RingTimer
                progress={progress}
                color={activeFast.color}
                elapsedLabel={formatTime(elapsed)}
                percent={progressPct}
              />
            </View>

            <PressableScale onPress={handleEndFast} style={styles.endInline}>
              <LinearGradient
                colors={[COLORS.primaryDeep, COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.endInlineGrad}
              >
                <Text style={styles.endInlineText}>End fasting</Text>
              </LinearGradient>
            </PressableScale>

            <View style={[styles.startEndRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.seLabel, { color: colors.textSecondary }]}>Start</Text>
                <Text style={[styles.seValue, { color: colors.text }]}>Today {fmtHM(startAt)}</Text>
              </View>
              <View style={[styles.seDivider, { backgroundColor: colors.border }]} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[styles.seLabel, { color: colors.textSecondary }]}>End</Text>
                <Text style={[styles.seValue, { color: colors.text }]}>
                  {endAt.toDateString() === new Date().toDateString() ? 'Today' : 'Tomorrow'} {fmtHM(endAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Body status — glassmorphic */}
          <View style={[styles.bodyStatusCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <LinearGradient
              colors={[activeFast.color + '14', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill as any}
            />
            <View style={[styles.bodyIconBubble, { backgroundColor: activeFast.color + '22' }]}>
              <Text style={{ fontSize: 20 }}>💧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bodyTitle, { color: colors.text }]}>Body status</Text>
              <Text style={[styles.bodyDesc, { color: colors.textSecondary }]}>{getStage(elapsedH)}</Text>
            </View>
            <View style={[styles.bodyLevelPill, { backgroundColor: activeFast.color + '1E', borderColor: activeFast.color + '33' }]}>
              <Text style={[styles.bodyLevelText, { color: activeFast.color }]}>
                Lv.{Math.min(Math.floor(elapsedH / 8) + 1, 6)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Plan selection ────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AmbientGlows />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>

        {/* HERO */}
        <Animated.View
          style={[
            styles.heroEditorial,
            { transform: [{ translateY: Animated.add(heroLift, heroTranslate) }], opacity: heroOpacity },
          ]}
        >
          <View style={{ flex: 1, paddingRight: SPACING.sm }}>
            <Text style={[styles.helloKicker, { color: COLORS.primary }]}>
              {profile ? `HELLO, ${profile.name.toUpperCase()}` : 'WATERFASTBUDDY'}
            </Text>
            <Text style={[styles.heroHeadline, { color: colors.text }]}>{'Fast\nsmarter.'}</Text>
            <Text style={[styles.heroAccent, { color: COLORS.primary }]}>Become fluid.</Text>
            <Text style={[styles.heroLead, { color: colors.textSecondary }]}>
              {i18n.t('fasts.consistentPlanHint')}
            </Text>
          </View>

          {/* Avatar with layered glow */}
          <View style={styles.heroAvatarHalo}>
            <View pointerEvents="none" style={styles.avatarGlowOuter} />
            <View pointerEvents="none" style={styles.avatarGlowInner} />
            <LinearGradient
              colors={['rgba(30,99,233,0.18)', 'rgba(30,155,184,0)']}
              style={styles.avatarGradientHalo}
              pointerEvents="none"
            />
            {profile && <WaterBodyAvatar profile={profile} size={138} fastingHours={0} />}
          </View>
        </Animated.View>

        {/* WEEK STRIP */}
        <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {weekDays.map((d) => (
            <View key={d.date} style={styles.dayItemWrap}>
              {d.isToday ? (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.dayItem, styles.dayItemActive]}
                >
                  <Text style={[styles.dayLabel, styles.dayLabelActive]}>{d.day.toUpperCase()}</Text>
                  <Text style={[styles.dayNum, styles.dayNumActive]}>{d.date}</Text>
                  <View style={styles.dayDot} />
                </LinearGradient>
              ) : (
                <View style={styles.dayItem}>
                  <Text style={styles.dayLabel}>{d.day.toUpperCase()}</Text>
                  <Text style={[styles.dayNum, { color: colors.text }]}>{d.date}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* PLANS HEADER */}
        <View style={styles.plansHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('fasts.title')}</Text>
            <Text style={[styles.sectionSubTitle, { color: colors.textSecondary }]}>{i18n.t('ui.start')}</Text>
          </View>
          <PressableScale onPress={() => setShowModal(true)} scaleTo={0.94}>
            <View style={[styles.customBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.customBtnText, { color: COLORS.primary }]}>+ {i18n.t('fasts.customFast')}</Text>
            </View>
          </PressableScale>
        </View>

        {/* PLAN CARDS */}
        <View style={styles.plansList}>
          {PRESETS.map((p, i) => (
            <PlanRow key={p.id} preset={p} index={i} onPress={() => handleStartFast(p)} />
          ))}
        </View>

        {/* SAVED */}
        {savedFasts.length > 0 && (
          <>
            <View style={[styles.plansHeader, { marginTop: SPACING.md }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('fasts.savedFasts')}</Text>
            </View>
            <View style={styles.plansList}>
              {savedFasts.map((sf) => (
                <SavedFastRow
                  key={sf.id}
                  fast={sf}
                  onPress={() => startFast({ hours: sf.targetHours, name: sf.name, color: COLORS.primary })}
                  onDelete={() => removeSavedFast(sf.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* TIP */}
        <View style={[styles.tipChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.tipDot, { backgroundColor: COLORS.primary }]} />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>{i18n.t('fasts.activeFast')}</Text>
        </View>
      </ScrollView>

      {/* Custom fast modal — glass bottom sheet */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,15,28,0.55)' }]} />
          )}

          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowModal(false)} />

          <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
              style={styles.sheetTopGloss}
              pointerEvents="none"
            />
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{i18n.t('fasts.customFast')}</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>{i18n.t('fasts.customHours')}</Text>

            <TextInput
              style={[
                styles.sheetInput,
                {
                  backgroundColor: colors.cardAlt,
                  color: colors.text,
                  borderColor: hoursFocused ? COLORS.primary : colors.border,
                  shadowOpacity: hoursFocused ? 0.18 : 0,
                },
              ]}
              keyboardType="numeric"
              placeholder={i18n.t('fasts.exampleHours')}
              placeholderTextColor={colors.textSecondary}
              value={customHours}
              onChangeText={setCustomHours}
              onFocus={() => setHoursFocused(true)}
              onBlur={() => setHoursFocused(false)}
              autoFocus
            />

            <View style={[styles.saveRow, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
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
                style={[
                  styles.sheetInput,
                  {
                    marginBottom: SPACING.sm,
                    fontSize: FONT_SIZE.md,
                    backgroundColor: colors.cardAlt,
                    color: colors.text,
                    borderColor: nameFocused ? COLORS.primary : colors.border,
                  },
                ]}
                placeholder={i18n.t('fasts.planNameOptional')}
                placeholderTextColor={colors.textSecondary}
                value={customName}
                onChangeText={setCustomName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            )}

            <View style={styles.sheetBtns}>
              <PressableScale
                onPress={() => { setShowModal(false); setCustomHours(''); setCustomName(''); setShouldSave(false); }}
                style={{ flex: 1 }}
                scaleTo={0.97}
              >
                <View style={[styles.sheetCancel, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{i18n.t('common.cancel')}</Text>
                </View>
              </PressableScale>

              <PressableScale
                style={{ flex: 1 }}
                scaleTo={0.97}
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
                <LinearGradient
                  colors={[COLORS.primaryDeep, COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.sheetStart}
                >
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.md, letterSpacing: 0.3 }}>
                    {i18n.t('fasts.startFast')}
                  </Text>
                </LinearGradient>
              </PressableScale>
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
  scrollBody: { paddingTop: 4, paddingBottom: 120 },

  // Ambient
  glow: {
    position: 'absolute',
    width: 320, height: 320, borderRadius: 160,
    overflow: 'hidden',
  },
  glowSm: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    overflow: 'hidden',
  },
  glowFill: { flex: 1 },

  // Hero
  heroEditorial: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  helloKicker:   { fontSize: 11, fontWeight: '800', letterSpacing: 1.8, marginBottom: 8 },
  heroHeadline:  { fontSize: 38, fontWeight: '200', lineHeight: 42, letterSpacing: -1.2 },
  heroAccent:    { fontSize: 38, fontWeight: '900', lineHeight: 42, letterSpacing: -1.2, marginBottom: SPACING.sm, marginTop: 2 },
  heroLead:      { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: 6, maxWidth: 220, fontWeight: '500' },

  heroAvatarHalo:    { width: 152, height: 178, alignItems: 'center', justifyContent: 'center' },
  avatarGlowOuter:   {
    position: 'absolute', width: 170, height: 170, borderRadius: 85,
    backgroundColor: 'rgba(30,99,233,0.16)',
    shadowColor: '#1E63E9', shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  avatarGlowInner:   {
    position: 'absolute', width: 132, height: 132, borderRadius: 66,
    backgroundColor: 'rgba(30,155,184,0.12)',
  },
  avatarGradientHalo:{
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
  },

  // Week strip
  weekCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    shadowColor: '#1B8CFF', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  dayItemWrap: { flex: 1, alignItems: 'center' },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    minWidth: 56,
  },
  dayItemActive: {
    shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  dayLabel:       { fontSize: 10, color: '#7A8CA8', fontWeight: '800', letterSpacing: 0.7 },
  dayLabelActive: { color: 'rgba(255,255,255,0.85)' },
  dayNum:         { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#0F172A', marginTop: 2, letterSpacing: -0.5 },
  dayNumActive:   { color: '#fff' },
  dayDot:         { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginTop: 5 },

  // Plans
  plansHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  sectionTitle:    { fontSize: FONT_SIZE.lg, fontWeight: '900', letterSpacing: -0.4 },
  sectionSubTitle: { fontSize: FONT_SIZE.xs, marginTop: 4, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  customBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1,
    shadowColor: '#1B8CFF', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  customBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '800', letterSpacing: 0.2 },

  plansList: { marginHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.md },

  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg + 4,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    overflow: 'hidden',
    shadowColor: '#1B8CFF', shadowOpacity: 0.10, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  planHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 60,
  },
  planBubble: {
    width: 58, height: 58,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginRight: SPACING.md,
    overflow: 'hidden',
  },
  planBubbleLabel: { fontSize: 13, fontWeight: '900', letterSpacing: 0.2 },
  planMid:         { flex: 1 },
  planTitleRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName:        { fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: -0.2 },
  planHoursLabel:  { fontSize: FONT_SIZE.sm, fontWeight: '900' },
  planDesc:        { fontSize: 12, marginTop: 4, lineHeight: 17 },
  planTag:         {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 10, paddingVertical: 3,
    marginTop: 7,
    borderWidth: 1,
  },
  planTagText:     { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  planChevron: {
    width: 32, height: 32, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  planChevronText: { fontSize: 22, fontWeight: '700', lineHeight: 24 },

  // Tip
  tipChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1, marginTop: SPACING.xs,
  },
  tipDot:  { width: 8, height: 8, borderRadius: 4 },
  tipText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 20, fontWeight: '500' },

  // Active fast
  activeScroll: { paddingTop: 8, paddingBottom: 118 },
  activeHeaderRow: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  activeKickerLux: {
    fontSize: 10, fontWeight: '900', letterSpacing: 2.4, marginBottom: 6,
  },
  activeHeadline: {
    fontSize: 30, fontWeight: '200', letterSpacing: -1, textAlign: 'center',
  },
  activeHeadSub: {
    fontSize: FONT_SIZE.sm, marginTop: 6, textAlign: 'center', fontWeight: '500',
  },
  currentPill: {
    alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    marginTop: SPACING.md, marginBottom: SPACING.lg,
    shadowColor: '#1B8CFF', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  currentDot:  { width: 8, height: 8, borderRadius: 4 },
  currentText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  ringCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl + 6,
    borderWidth: 1,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0B5DD1', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 8,
    marginBottom: SPACING.lg,
  },
  endInline:     { marginTop: SPACING.lg, width: '100%' },
  endInlineGrad: {
    paddingVertical: 16, borderRadius: BORDER_RADIUS.round, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  endInlineText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: 0.5 },
  startEndRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: SPACING.lg, marginTop: SPACING.lg,
    borderTopWidth: 1, width: '100%',
  },
  seLabel:   { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  seValue:   { fontSize: FONT_SIZE.md, fontWeight: '800', marginTop: 4, letterSpacing: -0.2 },
  seDivider: { width: 1, height: 36, marginHorizontal: SPACING.md },

  bodyStatusCard: {
    marginHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1, padding: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#0B5DD1', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  bodyIconBubble: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  bodyTitle: { fontSize: FONT_SIZE.md, fontWeight: '900', letterSpacing: -0.2 },
  bodyDesc:  { fontSize: FONT_SIZE.sm, marginTop: 3, lineHeight: 18 },
  bodyLevelPill: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1,
  },
  bodyLevelText: { fontSize: FONT_SIZE.xs, fontWeight: '900', letterSpacing: 0.4 },

  // Modal
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet:   {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: SPACING.xl, paddingTop: SPACING.md,
    borderTopWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 30, shadowOffset: { width: 0, height: -8 }, elevation: 20,
  },
  sheetTopGloss: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 90,
  },
  sheetHandle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  sheetTitle: { fontSize: FONT_SIZE.xl, fontWeight: '900', marginBottom: SPACING.xs, letterSpacing: -0.4 },
  sheetSub:   { fontSize: FONT_SIZE.md, marginBottom: SPACING.lg },
  sheetInput: {
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.xl,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  sheetBtns:    { flexDirection: 'row', gap: SPACING.md },
  sheetCancel:  {
    borderRadius: BORDER_RADIUS.round, borderWidth: 1.5,
    padding: SPACING.md, alignItems: 'center',
  },
  sheetStart: {
    borderRadius: BORDER_RADIUS.round, padding: SPACING.md, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },

  saveRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.md, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm,
  },
  saveRowLabel: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  saveRowSub:   { fontSize: FONT_SIZE.xs, marginTop: 3 },

  // Saved fast rows
  savedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg + 2, borderWidth: 1,
    shadowColor: '#1B8CFF', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  savedMain:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  savedBubble:     {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: COLORS.primary + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  savedBubbleText: { fontSize: FONT_SIZE.sm, fontWeight: '900', color: COLORS.primary },
  savedName:       { fontSize: FONT_SIZE.md, fontWeight: '800' },
  savedSub:        { fontSize: FONT_SIZE.xs, marginTop: 4 },
  savedDelete:     {
    width: 34, height: 34, borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  savedDeleteText: { fontSize: 13, color: '#EF4444', fontWeight: '800' },
});
