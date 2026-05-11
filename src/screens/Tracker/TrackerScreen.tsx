import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing,
  Modal, TextInput, KeyboardAvoidingView, Platform, Dimensions,
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
import LottieWaterGlass from '../../components/LottieWaterGlass';
import i18n from '../../i18n';

const WATER_KEY_PREFIX = 'water_glasses_';
const WEIGHT_KEY       = 'weight_log';
const GOAL_GLASSES     = 8;
const MAX_GLASSES      = 20;
const { width: SCREEN_W } = Dimensions.get('window');

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

  // ── Animated values (cinematic motion system) ──────────────────────────
  const waterAnim   = useRef(new Animated.Value(0)).current;
  const weightAnim  = useRef(new Animated.Value(0)).current;
  const heroAnim    = useRef(new Animated.Value(0)).current;
  const scrollY     = useRef(new Animated.Value(0)).current;

  // Avatar breathing + ring pulse + ripple
  const breathe     = useRef(new Animated.Value(0)).current;
  const ringPulse   = useRef(new Animated.Value(0)).current;
  const ripple      = useRef(new Animated.Value(0)).current;

  // Shimmer for progress bar
  const shimmer     = useRef(new Animated.Value(0)).current;

  // Ambient orbs
  const orbA        = useRef(new Animated.Value(0)).current;
  const orbB        = useRef(new Animated.Value(0)).current;

  // Streak flame pulse
  const flame       = useRef(new Animated.Value(0)).current;

  const iconScales  = useRef(Array.from({ length: MAX_GLASSES }, () => new Animated.Value(1))).current;
  const iconRipples = useRef(Array.from({ length: MAX_GLASSES }, () => new Animated.Value(0))).current;

  // ── Persisting actions (UNCHANGED LOGIC) ───────────────────────────────
  const playRipple = () => {
    ripple.setValue(0);
    Animated.timing(ripple, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  const addGlass = async () => {
    const next = Math.min(glasses + 1, MAX_GLASSES);
    setGlasses(next);
    await AsyncStorage.setItem(WATER_KEY_PREFIX + todayKey(), next.toString());
    Haptics.selectionAsync();
    playRipple();
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
    playRipple();
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
  };

  const waterPct  = Math.min(glasses / GOAL_GLASSES, 1);
  const gridCount = Math.min(MAX_GLASSES, Math.max(GOAL_GLASSES, glasses < MAX_GLASSES ? glasses + 1 : MAX_GLASSES));
  const last7     = weightLog.slice(-7);

  const motivational = useMemo(() => {
    if (waterPct >= 1) return 'Hydration goal complete. Glow unlocked.';
    if (waterPct >= 0.75) return 'Almost there — one more push.';
    if (waterPct >= 0.4) return 'Steady flow. Keep the rhythm going.';
    if (glasses > 0) return 'Nice start. Your body thanks you.';
    return 'Start your day with a glass.';
  }, [waterPct, glasses]);

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

  // ── Entrance + ambient loops ───────────────────────────────────────────
  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim,   { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(waterAnim,  { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(weightAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]).start();

    // Breathing avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    // Ring pulse
    Animated.loop(
      Animated.timing(ringPulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true })
    ).start();

    // Shimmer sweep
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Ambient orb drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbA, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbA, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbB, { toValue: 1, duration: 11000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbB, { toValue: 0, duration: 11000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Flame pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(flame, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(flame, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>{i18n.t('ui.completeOnboardingFirst')}</Text>
      </View>
    );
  }

  // Derived animated styles
  const heroParallax = scrollY.interpolate({ inputRange: [0, 200], outputRange: [0, -30], extrapolate: 'clamp' });
  const heroFade     = scrollY.interpolate({ inputRange: [0, 180], outputRange: [1, 0.5], extrapolate: 'clamp' });
  const orbATranslate = orbA.interpolate({ inputRange: [0, 1], outputRange: [-20, 30] });
  const orbBTranslate = orbB.interpolate({ inputRange: [0, 1], outputRange: [20, -30] });
  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-SCREEN_W, SCREEN_W] });
  const breatheScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const ringScale = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const flameScale = flame.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  const glowIntensity = 0.25 + waterPct * 0.55;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Layered ambient backdrop */}
      <Starfield density={0.07} />
      <Animated.View pointerEvents="none" style={[styles.orb, styles.orbPrimary, { transform: [{ translateY: orbATranslate }] }]}>
        <LinearGradient
          colors={[COLORS.primary + '55', 'transparent']}
          style={styles.orbGrad}
          start={{ x: 0.3, y: 0.3 }} end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.orb, styles.orbAccent, { transform: [{ translateX: orbBTranslate }] }]}>
        <LinearGradient
          colors={[COLORS.accent + '4D', 'transparent']}
          style={styles.orbGrad}
          start={{ x: 0.2, y: 0.2 }} end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* HERO — cinematic, editorial */}
        <Animated.View style={[styles.heroBlock, { opacity: heroFade, transform: [{ translateY: heroParallax }] }]}>
          <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }}>
            <View style={styles.heroKickerRow}>
              <Animated.View style={[styles.heroPulse, { opacity: ringPulse.interpolate({ inputRange: [0,1], outputRange: [1,0.2] }), transform: [{ scale: ringPulse.interpolate({ inputRange: [0,1], outputRange: [1,1.6] }) }] }]} />
              <View style={styles.heroPulseCore} />
              <Kicker>Daily tracker</Kicker>
            </View>
            <View style={{ marginTop: 12 }}>
              <Headline line1="Weight &" line2="Hydration." size={34} />
            </View>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
              {motivational}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* ── WATER TRACKER — flagship card ─────────────────────────── */}
        <Animated.View style={[
          styles.card, styles.cardElevated,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
            borderColor: COLORS.accent + '33',
            opacity: waterAnim,
            transform: [{ translateY: waterAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
            shadowColor: COLORS.accent,
            shadowOpacity: 0.18 + glowIntensity * 0.15,
          },
        ]}>
          {/* glow gradient border layer */}
          <LinearGradient
            colors={[COLORS.primary + '33', 'transparent', COLORS.accent + '33']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.cardGlowBorder}
            pointerEvents="none"
          />

          <View style={styles.cardHeader}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.iconBadgeGrad}
            >
              <Ionicons name="water" size={18} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Hydration</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                {glasses} glass{glasses !== 1 ? 'es' : ''} · {Math.round(glasses * 250)}ml today
              </Text>
            </View>
            <View style={[styles.pctBubble, { backgroundColor: COLORS.accent + '1A', borderColor: COLORS.accent + '40' }]}>
              <Text style={[styles.pctLabel, { color: COLORS.accent }]}>{Math.round(waterPct * 100)}%</Text>
            </View>
          </View>

          {/* Avatar with glow ring + breathing + ripple */}
          <View style={styles.avatarWrap}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.avatarGlow,
                { opacity: glowIntensity, transform: [{ scale: breatheScale }] },
              ]}
            >
              <LinearGradient
                colors={[COLORS.accent + '66', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.avatarRing,
                { borderColor: COLORS.accent + '88', opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.avatarRing,
                { borderColor: COLORS.primary + '66', opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
              ]}
            />

            <Animated.View style={{ transform: [{ scale: breatheScale }] }}>
              <WaterBodyAvatar profile={profile} fillPct={waterPct} size={185} animate />
            </Animated.View>

            <View style={[styles.hydrationBadge, { backgroundColor: COLORS.accent + '1F', borderColor: COLORS.accent + '60' }]}>
              <Ionicons name={glasses >= GOAL_GLASSES ? 'sparkles' : 'water'} size={12} color={COLORS.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.hydrationBadgeText, { color: COLORS.accent }]}>
                {glasses >= GOAL_GLASSES ? 'Fully hydrated' : `${glasses} / ${GOAL_GLASSES} goal`}
              </Text>
            </View>
          </View>

          {/* Lottie glass — floating card surface */}
          <View style={[styles.lottieGlassWrap, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderColor: colors.border,
          }]}>
            <Animated.View style={[styles.lottieGlow, { opacity: glowIntensity }]}>
              <LinearGradient
                colors={[COLORS.accent + '55', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }}
              />
            </Animated.View>
            <LottieWaterGlass fillPct={waterPct} size={140} loop={false} />
            <View style={styles.lottieStatsRow}>
              <View style={styles.lottieStat}>
                <Text style={[styles.lottieStatLabel, { color: colors.textSecondary }]}>Today</Text>
                <Text style={[styles.lottieStatValue, { color: colors.text }]}>{Math.round(glasses * 250)}ml</Text>
              </View>
              <View style={[styles.lottieDivider, { backgroundColor: colors.border }]} />
              <View style={styles.lottieStat}>
                <Text style={[styles.lottieStatLabel, { color: colors.textSecondary }]}>Goal</Text>
                <Text style={[styles.lottieStatValue, { color: colors.text }]}>{GOAL_GLASSES * 250}ml</Text>
              </View>
              <View style={[styles.lottieDivider, { backgroundColor: colors.border }]} />
              <View style={styles.lottieStat}>
                <Text style={[styles.lottieStatLabel, { color: colors.textSecondary }]}>Left</Text>
                <Text style={[styles.lottieStatValue, { color: COLORS.accent }]}>
                  {Math.max(0, GOAL_GLASSES - glasses) * 250}ml
                </Text>
              </View>
            </View>
          </View>

          {/* Premium liquid progress bar */}
          <View style={[styles.progressTrack, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          }]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${waterPct * 100}%` as any }]}
            >
              <Animated.View style={[styles.progressShimmer, { transform: [{ translateX: shimmerX }] }]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
                  start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </LinearGradient>
          </View>

          {/* Quick-add presets + streak */}
          <View style={styles.quickAddRow}>
            {[{ q: 1, l: '250ml', i: 'cafe-outline' }, { q: 2, l: '500ml', i: 'wine-outline' }, { q: 3, l: '750ml', i: 'beer-outline' }].map(p => (
              <TouchableOpacity
                key={p.l}
                style={[styles.presetBtn, { borderColor: COLORS.accent + '40', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
                onPress={() => addPreset(p.q)}
                activeOpacity={0.75}
              >
                <Ionicons name={p.i as any} size={14} color={COLORS.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.presetLabel, { color: colors.text }]}>{p.l}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ flex: 1 }} />
            <View style={[styles.streakWrap, streak >= 3 && { backgroundColor: COLORS.primary + '14', borderColor: COLORS.primary + '40', borderWidth: 1 }]}>
              <Animated.View style={{ transform: [{ scale: streak > 0 ? flameScale : 1 }] }}>
                <Ionicons name="flame" size={14} color={streak > 0 ? '#FF7A45' : colors.textSecondary} />
              </Animated.View>
              <Text style={[styles.streakValue, { color: streak > 0 ? COLORS.primary : colors.textSecondary }]}>{streak}d</Text>
            </View>
          </View>

          {/* Glass grid */}
          <View style={styles.glassGridGrouped}>
            {Array.from({ length: gridCount }).reduce<Array<number[]>>((rows, _, idx) => {
              const rowIndex = Math.floor(idx / 4);
              rows[rowIndex] = rows[rowIndex] || [];
              rows[rowIndex].push(idx);
              return rows;
            }, []).map((row, rIdx) => (
              <View key={rIdx} style={styles.glassRow}>
                {row.map((i) => {
                  const filled = i < glasses;
                  const isGoal = i === GOAL_GLASSES - 1;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={filled ? removeGlass : addGlass}
                      activeOpacity={0.85}
                      onPressIn={() => {
                        Animated.spring(iconScales[i], { toValue: 0.85, useNativeDriver: true }).start();
                        iconRipples[i].setValue(0);
                        Animated.timing(iconRipples[i], { toValue: 1, duration: 600, useNativeDriver: true }).start();
                        Haptics.selectionAsync();
                      }}
                      onPressOut={() => Animated.spring(iconScales[i], { toValue: 1, friction: 4, useNativeDriver: true }).start()}
                    >
                      <Animated.View style={{ transform: [{ scale: iconScales[i] }] }}>
                        <View style={[
                          styles.glassIcon,
                          filled && styles.glassIconFull,
                          isGoal && styles.glassIconGoal,
                          filled && { borderColor: COLORS.accent + '55', borderWidth: 1 },
                        ]}>
                          {filled && (
                            <LinearGradient
                              colors={[COLORS.primary + '55', COLORS.accent + '33']}
                              style={StyleSheet.absoluteFill}
                              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                            />
                          )}
                          <Animated.View
                            pointerEvents="none"
                            style={[
                              StyleSheet.absoluteFill,
                              {
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: COLORS.accent,
                                opacity: iconRipples[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                                transform: [{ scale: iconRipples[i].interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
                              },
                            ]}
                          />
                          <Ionicons
                            name={filled ? 'water' : 'water-outline'}
                            size={22}
                            color={filled ? COLORS.accent : (isDark ? 'rgba(255,255,255,0.25)' : '#C5D8EE')}
                          />
                        </View>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Main actions */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.glassBtn, styles.glassBtnMinus, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
              onPress={removeGlass}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={20} color={colors.textSecondary} />
              <Text style={[styles.glassBtnText, { color: colors.textSecondary }]}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.glassBtn} onPress={addGlass} activeOpacity={0.85}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.glassBtnGrad}
              >
                {/* glossy overlay */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.35)', 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.glassBtnTextWhite}>Add glass</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── WEIGHT TRACKER ────────────────────────────────────────── */}
        <Animated.View style={[
          styles.card, styles.cardElevated,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
            borderColor: COLORS.primary + '33',
            opacity: weightAnim,
            transform: [{ translateY: weightAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
            shadowColor: COLORS.primary,
          },
        ]}>
          <LinearGradient
            colors={[COLORS.primary + '33', 'transparent', COLORS.primaryDark + '33']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.cardGlowBorder}
            pointerEvents="none"
          />

          <View style={styles.cardHeader}>
            <LinearGradient
              colors={[COLORS.primaryDark, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.iconBadgeGrad}
            >
              <Ionicons name="body" size={18} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Body weight</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                {todayWeight != null ? 'Logged today' : `Goal · ${profile.goalWeightKg} kg`}
              </Text>
            </View>
            {todayWeight != null && (
              <LinearGradient
                colors={[COLORS.primary + '22', COLORS.primary + '0A']}
                style={styles.weightBubble}
              >
                <Text style={[styles.weightBig, { color: COLORS.primary }]}>{todayWeight}</Text>
                <Text style={[styles.weightUnit, { color: COLORS.primary }]}>kg</Text>
              </LinearGradient>
            )}
          </View>

          <TouchableOpacity onPress={openWeightModal} activeOpacity={0.85} style={{ marginTop: SPACING.sm }}>
            <LinearGradient
              colors={[COLORS.primaryDark, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.logWeightBtn}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="scale-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.logWeightBtnText}>
                {todayWeight != null ? 'Update weight' : "Log today's weight"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {last7.length >= 2 && (
            <View style={{ marginTop: SPACING.md }}>
              <View style={styles.trendHeaderRow}>
                <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>Last {last7.length} entries</Text>
                <View style={[styles.trendDot, { backgroundColor: COLORS.primary }]} />
              </View>
              <View style={styles.trendRow}>
                {last7.map((e, i) => {
                  const min = Math.min(...last7.map(x => x.weightKg));
                  const max = Math.max(...last7.map(x => x.weightKg));
                  const range = max - min || 1;
                  const barH = 14 + ((e.weightKg - min) / range) * 56;
                  const isLatest = i === last7.length - 1;
                  return (
                    <View key={e.date} style={styles.trendBar}>
                      <Text style={[styles.trendVal, { color: isLatest ? COLORS.primary : colors.textSecondary, fontWeight: isLatest ? '900' : '600' }]}>
                        {e.weightKg}
                      </Text>
                      <View style={{ width: '100%', alignItems: 'center' }}>
                        {isLatest && (
                          <View style={[styles.trendGlow, { shadowColor: COLORS.primary }]} />
                        )}
                        <LinearGradient
                          colors={isLatest ? [COLORS.accent, COLORS.primary] : [colors.cardAlt, colors.border]}
                          style={[styles.trendBarFill, { height: barH }]}
                          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                        />
                      </View>
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
                  <View style={[styles.diffChip, { backgroundColor: color + '18', borderColor: color + '45' }]}>
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

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* ── Weight modal ──────────────────────────────────────────── */}
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
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient
              colors={[COLORS.primary + '14', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 28, borderTopRightRadius: 28 }]}
              pointerEvents="none"
            />
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <View style={styles.modalIconRow}>
              <LinearGradient
                colors={[COLORS.primaryDark, COLORS.primary]}
                style={styles.modalIcon}
              >
                <Ionicons name="scale-outline" size={22} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Log weight</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Enter your current weight in kilograms
            </Text>

            <View style={[
              styles.modalInputWrap,
              {
                borderColor: inputError ? COLORS.danger : (weightInput ? COLORS.primary + '88' : colors.border),
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                shadowColor: weightInput && !inputError ? COLORS.primary : 'transparent',
                shadowOpacity: weightInput && !inputError ? 0.3 : 0,
                shadowRadius: 14,
              },
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
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.modalBtnSaveGrad}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
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

  // Ambient orbs
  orb: { position: 'absolute', width: 380, height: 380, borderRadius: 200, opacity: 0.55 },
  orbGrad: { flex: 1, borderRadius: 200 },
  orbPrimary: { top: -120, left: -100 },
  orbAccent:  { top: 220, right: -140 },

  // Hero
  heroBlock: { paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  heroKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroPulse: {
    position: 'absolute', left: 0, width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.accent + '55',
  },
  heroPulseCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginRight: 4 },
  heroSub: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: SPACING.sm, maxWidth: '92%' },

  // Card system
  card: {
    borderRadius: BORDER_RADIUS.lg + 4,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardElevated: {
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  cardGlowBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconBadgeGrad: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: -0.3 },
  cardSub:   { fontSize: FONT_SIZE.xs, marginTop: 2 },
  pctBubble: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1,
  },
  pctLabel:  { fontSize: FONT_SIZE.md, fontWeight: '900', letterSpacing: -0.5 },

  // Avatar
  avatarWrap: { alignItems: 'center', marginVertical: SPACING.md, paddingTop: SPACING.sm },
  avatarGlow: {
    position: 'absolute', top: 0, width: 240, height: 240, borderRadius: 120,
    overflow: 'hidden',
  },
  avatarRing: {
    position: 'absolute', top: 10, width: 200, height: 200, borderRadius: 100,
    borderWidth: 2,
  },
  hydrationBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1,
  },
  hydrationBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.3 },

  // Lottie surface
  lottieGlassWrap: {
    alignItems: 'center', marginVertical: SPACING.md,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, overflow: 'hidden',
  },
  lottieGlow: {
    position: 'absolute', bottom: 0, width: 220, height: 80, borderRadius: 110,
    opacity: 0.4,
  },
  lottieStatsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: SPACING.sm, width: '100%', justifyContent: 'space-around',
  },
  lottieStat: { alignItems: 'center', flex: 1 },
  lottieStatLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 },
  lottieStatValue: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  lottieDivider: { width: 1, height: 24, opacity: 0.6 },

  // Progress bar
  progressTrack: { height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: SPACING.md },
  progressFill:  { height: '100%', borderRadius: 6, overflow: 'hidden' },
  progressShimmer: { position: 'absolute', top: 0, bottom: 0, width: 120 },

  // Quick add
  quickAddRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md, flexWrap: 'wrap' },
  presetBtn: {
    flexDirection: 'row',
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  presetLabel: { fontSize: FONT_SIZE.xs, fontWeight: '800' },
  streakWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  streakValue: { fontSize: FONT_SIZE.sm, fontWeight: '900' },

  // Glass grid
  glassGridGrouped: { marginBottom: SPACING.md },
  glassRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  glassIcon: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', overflow: 'hidden',
  },
  glassIconFull: { backgroundColor: COLORS.accent + '14' },
  glassIconGoal: { borderWidth: 1.5, borderColor: COLORS.accent + '70', borderStyle: 'dashed' },

  // Main buttons
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  glassBtn: { flex: 1, borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  glassBtnMinus: {
    borderWidth: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 6, borderRadius: BORDER_RADIUS.round,
  },
  glassBtnGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 14, gap: 6,
  },
  glassBtnText:      { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  glassBtnTextWhite: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  // Weight
  weightBubble: {
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BORDER_RADIUS.md,
  },
  weightBig:  { fontSize: FONT_SIZE.xl, fontWeight: '900', letterSpacing: -0.5 },
  weightUnit: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  logWeightBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, borderRadius: BORDER_RADIUS.round, overflow: 'hidden',
  },
  logWeightBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: 0.2 },

  trendHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  trendLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  trendDot:   { width: 6, height: 6, borderRadius: 3 },
  trendRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: SPACING.sm },
  trendBar:   { flex: 1, alignItems: 'center', gap: 4 },
  trendBarFill: { width: '70%', borderRadius: 6, minHeight: 14 },
  trendGlow: {
    position: 'absolute', width: '70%', height: '100%',
    shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6,
    borderRadius: 6,
  },
  trendVal:   { fontSize: 10 },
  trendDate:  { fontSize: 9, fontWeight: '600' },

  diffChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start',
  },
  diffText: { fontSize: FONT_SIZE.xs, fontWeight: '800' },

  // Modal
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  modalSheetWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm, paddingBottom: 40,
    borderWidth: 1, borderBottomWidth: 0,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, elevation: 24,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 44, height: 5, borderRadius: 3,
    alignSelf: 'center', marginBottom: SPACING.md,
  },
  modalIconRow: { alignItems: 'center', marginBottom: SPACING.sm },
  modalIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '900', marginBottom: 4, textAlign: 'center', letterSpacing: -0.5 },
  modalSub:   { fontSize: FONT_SIZE.sm, marginBottom: SPACING.lg, textAlign: 'center' },

  modalInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    marginBottom: SPACING.sm,
  },
  modalInput: { flex: 1, fontSize: FONT_SIZE.lg, fontWeight: '800' },
  modalUnit:  { fontSize: FONT_SIZE.md, fontWeight: '700', marginLeft: 4 },
  modalError: { color: COLORS.danger, fontSize: FONT_SIZE.xs, fontWeight: '600', marginBottom: SPACING.sm },

  modalBtnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  modalBtnCancel: {
    flex: 1, borderWidth: 1, borderRadius: BORDER_RADIUS.round,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 15,
  },
  modalBtnCancelText: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  modalBtnSave: { flex: 2, borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  modalBtnSaveGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, gap: 8,
  },
  modalBtnSaveText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '900', letterSpacing: 0.3 },

  // legacy (preserved)
  glassGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center', marginBottom: SPACING.md,
  },
});
