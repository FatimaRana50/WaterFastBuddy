import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Switch, Alert, Dimensions, Share, Animated, Easing, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WeightChart from '../../components/WeightChart';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { useFasts } from '../../store/FastsContext';
import { calculateBmi, calculateTDEE, goalWeightForBmi, calculateBodyFatPercentage } from '../../utils/bmi';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import MorphingAvatar from '../../components/Avatar/MorphingAvatar';
import Starfield from '../../components/Starfield';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import { ActivityLevel, Gender, Language, WeightEntry } from '../../types';
import { insertWeightEntry, getAllWeightEntries, insertFast } from '../../store/database';
import {
  isDriveConfigured,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  clearStoredToken as clearDriveToken,
} from '../../utils/googleDrive';
import i18n from '../../i18n';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - SPACING.lg * 4;

const ACTIVITY_OPTIONS: { key: ActivityLevel; labelKey: string; icon: string }[] = [
  { key: 'sedentary',   labelKey: 'profile.activitySedentary',   icon: '🛋️' },
  { key: 'light',       labelKey: 'profile.activityLight',        icon: '🚶' },
  { key: 'moderate',    labelKey: 'profile.activityModerate',     icon: '🏃' },
  { key: 'active',      labelKey: 'profile.activityActive',       icon: '🏋️' },
  { key: 'very_active', labelKey: 'profile.activityVeryActive',   icon: '⚡' },
];

const LANGUAGE_OPTIONS: { key: Language; label: string; flag: string }[] = [
  { key: 'en', label: 'English',    flag: '🇬🇧' },
  { key: 'es', label: 'Español',    flag: '🇪🇸' },
  { key: 'fr', label: 'Français',   flag: '🇫🇷' },
  { key: 'hi', label: 'हिन्दी',      flag: '🇮🇳' },
  { key: 'zh', label: '中文',        flag: '🇨🇳' },
];

// ─── Premium reusable bits ─────────────────────────────────────────────────────

function GlassCard({
  children,
  style,
  glowColor = COLORS.primary,
}: {
  children: React.ReactNode;
  style?: any;
  glowColor?: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: glowColor + '22',
          shadowColor: glowColor,
        },
        style,
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[glowColor + '14', 'transparent', glowColor + '08']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.cardSheen, { backgroundColor: '#FFFFFF' }]} />
      {children}
    </View>
  );
}

function PulseRing({ delay = 0, color = COLORS.primary, size = 200 }) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.85, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.55, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, scale, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color + '70',
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

function Floater({ children, range = 6, duration = 3200 }: { children: React.ReactNode; range?: number; duration?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-range, range] });
  return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
}

function FadeInUp({ children, delay = 0, distance = 12 }: { children: React.ReactNode; delay?: number; distance?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 520,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [t, delay]);
  return (
    <Animated.View
      style={{
        opacity: t,
        transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function PressableScale({ children, onPress, style, disabled }: { children: React.ReactNode; onPress?: () => void; style?: any; disabled?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start()}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border + '80' }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function BodyFatGauge({ value, category, gender }: { value: number; category: string; gender: Gender }) {
  const bands = gender === 'male'
    ? [['#60A5FA', 0,  6],   ['#10B981', 6,  14], ['#34D399', 14, 18], ['#F59E0B', 18, 25], ['#EF4444', 25, 40]]
    : [['#60A5FA', 0,  14],  ['#10B981', 14, 21], ['#34D399', 21, 25], ['#F59E0B', 25, 32], ['#EF4444', 32, 50]];

  const max = bands[bands.length - 1][2] as number;
  const pct = Math.min(Math.max(value / max, 0), 1);

  const colorMap: Record<string, string> = {
    essential: '#60A5FA',
    athletic:  '#10B981',
    fit:       '#34D399',
    average:   '#F59E0B',
    high:      '#EF4444',
  };
  const color = colorMap[category] ?? COLORS.primary;
  const labelKey = `calories.bodyFatCategories.${category}`;

  const animPct = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animPct, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, animPct]);
  const leftStyle = animPct.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1300, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1300, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [glow]);

  return (
    <View style={styles.bmiGaugeWrap}>
      <View style={styles.bmiGaugeTrack}>
        {bands.map(([c, lo, hi]) => {
          const left  = ((lo as number) / max) * 100;
          const width = (((hi as number) - (lo as number)) / max) * 100;
          return (
            <View
              key={String(lo)}
              style={[styles.bmiSegment, { backgroundColor: String(c), left: `${left}%` as any, width: `${width}%` as any }]}
            />
          );
        })}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.bmiThumb, { left: leftStyle as any, borderColor: color, shadowColor: color }]} />
        <Animated.View pointerEvents="none" style={[styles.bmiThumbGlowWrap, { left: leftStyle as any }]}>
          <Animated.View
            style={[
              styles.bmiThumbGlow,
              {
                backgroundColor: color + '55',
                opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] }),
                transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.4] }) }],
              },
            ]}
          />
        </Animated.View>
      </View>
      <View style={styles.bmiLabels}>
        {bands.map((b) => (
          <Text key={String(b[1])} style={styles.bmiTick}>{b[1]}%</Text>
        ))}
        <Text style={styles.bmiTick}>{max}%</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 8 }}>
        <View style={[styles.bmiDot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.7, shadowRadius: 6 }]} />
        <Text style={[styles.bmiVal, { color }]}>
          {value}% — {i18n.t(labelKey)}
        </Text>
      </View>
    </View>
  );
}

function BmiGauge({ bmi }: { bmi: number }) {
  const pct   = Math.min(Math.max((bmi - 10) / 30, 0), 1);
  const color = bmi < 18.5 ? '#60A5FA' : bmi < 25 ? '#10B981' : bmi < 30 ? '#F59E0B' : '#EF4444';
  const label = bmi < 18.5 ? i18n.t('profile.underweight') : bmi < 25 ? i18n.t('profile.normal') : bmi < 30 ? i18n.t('profile.overweight') : i18n.t('profile.obese');

  const animPct = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animPct, { toValue: pct, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct, animPct]);
  const leftStyle = animPct.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1300, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1300, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [glow]);

  return (
    <View style={styles.bmiGaugeWrap}>
      <View style={styles.bmiGaugeTrack}>
        {[['#60A5FA', 0], ['#10B981', 25], ['#F59E0B', 50], ['#EF4444', 75]].map(([c, left]) => (
          <View key={String(left)} style={[styles.bmiSegment, { backgroundColor: String(c), left: `${left}%` as any }]} />
        ))}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.bmiThumb, { left: leftStyle as any, borderColor: color, shadowColor: color }]} />
        <Animated.View pointerEvents="none" style={[styles.bmiThumbGlowWrap, { left: leftStyle as any }]}>
          <Animated.View
            style={[
              styles.bmiThumbGlow,
              {
                backgroundColor: color + '55',
                opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] }),
                transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.4] }) }],
              },
            ]}
          />
        </Animated.View>
      </View>
      <View style={styles.bmiLabels}>
        {['10', '18.5', '25', '30', '40'].map((v) => (
          <Text key={v} style={styles.bmiTick}>{v}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 8 }}>
        <View style={[styles.bmiDot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.7, shadowRadius: 6 }]} />
        <Text style={[styles.bmiVal, { color }]}>BMI {bmi} — {label}</Text>
      </View>
    </View>
  );
}

function Stepper({
  label, value, unit, min, max, step = 1, onChange,
}: {
  label: string; value: number; unit: string;
  min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepperRow}>
      <Text style={[styles.stepperLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: colors.cardAlt, borderColor: COLORS.primary + '25' }]}
          onPress={() => onChange(Math.max(min, value - step))}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepperBtnText, { color: COLORS.primary }]}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.stepperValue, { color: colors.text }]}>
          {value} <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>{unit}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: colors.cardAlt, borderColor: COLORS.primary + '25' }]}
          onPress={() => onChange(Math.min(max, value + step))}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepperBtnText, { color: COLORS.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SettingRow({
  icon, label, valueText, valueColor, onPress, disabled, isSwitch, switchValue, onSwitchChange, last,
}: {
  icon: string; label: string;
  valueText?: string; valueColor?: string;
  onPress?: () => void; disabled?: boolean;
  isSwitch?: boolean; switchValue?: boolean; onSwitchChange?: (v: boolean) => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  const inner = (
    <View
      style={[
        styles.settingRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border + '80' },
        disabled && { opacity: 0.6 },
      ]}
    >
      <View style={styles.settingLeft}>
        <LinearGradient
          colors={[COLORS.primary + '28', COLORS.primary + '08']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.settingIconChip}
        >
          <Text style={styles.settingIcon}>{icon}</Text>
        </LinearGradient>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={!!switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ true: COLORS.primary, false: colors.border }}
          thumbColor="#fff"
        />
      ) : (
        <Text style={[styles.settingValue, { color: valueColor ?? colors.textSecondary }]}>{valueText} ›</Text>
      )}
    </View>
  );
  if (isSwitch) return inner;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={disabled}>
      {inner}
    </TouchableOpacity>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { language: appLanguage, setLanguage: updateAppLanguage } = useLanguage();
  const { profile, updateProfile, saveProfile } = useUser();
  const { fasts, savedFasts, reloadAll, replaceSavedFasts } = useFasts();

  const [showEdit,      setShowEdit]      = useState(false);
  const [editName,      setEditName]      = useState('');
  const [editAge,       setEditAge]       = useState(0);
  const [editWeight,    setEditWeight]    = useState(0);
  const [editHeight,    setEditHeight]    = useState(0);
  const [editGender,    setEditGender]    = useState<Gender>('male');
  const [editActivity,  setEditActivity]  = useState<ActivityLevel>('moderate');
  const [editGoalWeight, setEditGoalWeight] = useState(0);

  const [weightEntries,   setWeightEntries]   = useState<WeightEntry[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput,     setWeightInput]     = useState('');

  const [showLangModal, setShowLangModal] = useState(false);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreInput,     setRestoreInput]     = useState('');
  const [restoreBusy,      setRestoreBusy]      = useState(false);

  const [driveBusy, setDriveBusy] = useState(false);

  const orbDrift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbDrift, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbDrift, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [orbDrift]);

  useEffect(() => {
    getAllWeightEntries().then(setWeightEntries).catch(() => {});
  }, [appLanguage]);

  if (!profile) return null;

  const bmi  = calculateBmi(profile.weightKg, profile.heightCm);
  const tdee = calculateTDEE(profile.weightKg, profile.heightCm, profile.age, profile.gender, profile.activityLevel);
  const goalWeight = profile.goalWeightKg > 0
    ? profile.goalWeightKg
    : Math.round(goalWeightForBmi(22.5, profile.heightCm));

  const currentLangLabel = LANGUAGE_OPTIONS.find((l) => l.key === appLanguage)?.label ?? 'English';
  const activityLabel    = i18n.t(ACTIVITY_OPTIONS.find((a) => a.key === profile.activityLevel)?.labelKey ?? 'profile.activityModerate') as string;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openEdit = () => {
    setEditName(profile.name);
    setEditAge(profile.age);
    setEditWeight(profile.weightKg);
    setEditHeight(profile.heightCm);
    setEditGender(profile.gender);
    setEditActivity(profile.activityLevel);
    setEditGoalWeight(goalWeight);
    setShowEdit(true);
  };

  const saveEdit = async () => {
    await updateProfile({
      name: editName,
      age: editAge,
      weightKg: editWeight,
      heightCm: editHeight,
      gender: editGender,
      activityLevel: editActivity,
      goalWeightKg: editGoalWeight,
    });
    setShowEdit(false);
  };

  const handleLogWeight = async () => {
    const kg = parseFloat(weightInput);
    if (!kg || kg < 20 || kg > 500) {
      Alert.alert(i18n.t('ui.invalidWeightTitle'), i18n.t('ui.invalidWeightBody'));
      return;
    }
    const entry: WeightEntry = {
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      weightKg: kg,
    };
    await insertWeightEntry(entry);
    setWeightEntries((prev) => [...prev, entry]);
    await updateProfile({ weightKg: kg });
    setWeightInput('');
    setShowWeightModal(false);
  };

  const handleLanguageChange = async (lang: Language) => {
    await updateAppLanguage(lang);
    setShowLangModal(false);
  };

  const handleExport = async () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      fasts,
      weightEntries,
      savedFasts,
    };
    try {
      await Share.share({
        title: 'WaterFastBuddy Backup',
        message: JSON.stringify(backupData, null, 2),
      });
    } catch {
      // user cancelled share sheet — ignore
    }
  };

  const applyParsedBackup = async (parsed: any): Promise<boolean> => {
    if (!parsed || typeof parsed !== 'object' || !parsed.profile) return false;
    await saveProfile(parsed.profile);
    if (Array.isArray(parsed.fasts)) {
      for (const f of parsed.fasts as any[]) {
        if (f && f.id) await insertFast(f);
      }
    }
    if (Array.isArray(parsed.weightEntries)) {
      for (const w of parsed.weightEntries as WeightEntry[]) {
        if (w && w.id) await insertWeightEntry(w);
      }
    }
    if (Array.isArray(parsed.savedFasts)) {
      await replaceSavedFasts(parsed.savedFasts);
    }
    await reloadAll();
    getAllWeightEntries().then(setWeightEntries).catch(() => {});
    return true;
  };

  const handleImport = async () => {
    if (restoreBusy) return;
    const raw = restoreInput.trim();
    if (!raw) {
      Alert.alert(i18n.t('profile.restoreEmptyTitle'), i18n.t('profile.restoreEmptyBody'));
      return;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      Alert.alert(i18n.t('profile.restoreInvalidTitle'), i18n.t('profile.restoreInvalidBody'));
      return;
    }
    setRestoreBusy(true);
    try {
      const ok = await applyParsedBackup(parsed);
      if (!ok) {
        Alert.alert(i18n.t('profile.restoreInvalidTitle'), i18n.t('profile.restoreInvalidBody'));
        return;
      }
      setRestoreInput('');
      setShowRestoreModal(false);
      Alert.alert(i18n.t('profile.restoreDoneTitle'), i18n.t('profile.restoreDoneBody'));
    } catch {
      Alert.alert(i18n.t('profile.restoreFailedTitle'), i18n.t('profile.restoreFailedBody'));
    } finally {
      setRestoreBusy(false);
    }
  };

  const handleDriveBackup = async () => {
    if (driveBusy) return;
    if (!isDriveConfigured()) {
      Alert.alert(i18n.t('profile.driveUnconfiguredTitle'), i18n.t('profile.driveUnconfiguredBody'));
      return;
    }
    setDriveBusy(true);
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profile,
        fasts,
        weightEntries,
        savedFasts,
      };
      await uploadBackupToDrive(backupData);
      Alert.alert(i18n.t('profile.driveBackupDoneTitle'), i18n.t('profile.driveBackupDoneBody'));
    } catch (e: any) {
      if (String(e?.message) === 'drive_auth_cancelled') return;
      Alert.alert(i18n.t('profile.driveFailedTitle'), i18n.t('profile.driveFailedBody'));
    } finally {
      setDriveBusy(false);
    }
  };

  const handleDriveRestore = async () => {
    if (driveBusy) return;
    if (!isDriveConfigured()) {
      Alert.alert(i18n.t('profile.driveUnconfiguredTitle'), i18n.t('profile.driveUnconfiguredBody'));
      return;
    }
    setDriveBusy(true);
    try {
      const parsed = await downloadBackupFromDrive();
      if (!parsed) {
        Alert.alert(i18n.t('profile.driveEmptyTitle'), i18n.t('profile.driveEmptyBody'));
        return;
      }
      const ok = await applyParsedBackup(parsed);
      if (!ok) {
        Alert.alert(i18n.t('profile.restoreInvalidTitle'), i18n.t('profile.restoreInvalidBody'));
        return;
      }
      Alert.alert(i18n.t('profile.restoreDoneTitle'), i18n.t('profile.restoreDoneBody'));
    } catch (e: any) {
      if (String(e?.message) === 'drive_auth_cancelled') return;
      Alert.alert(i18n.t('profile.driveFailedTitle'), i18n.t('profile.driveFailedBody'));
    } finally {
      setDriveBusy(false);
    }
  };

  const handleDriveSignOut = async () => {
    await clearDriveToken();
    Alert.alert(i18n.t('profile.driveSignedOutTitle'), i18n.t('profile.driveSignedOutBody'));
  };

  const resetOnboarding = () =>
    Alert.alert(i18n.t('ui.resetOnboarding'), i18n.t('profile.resetOnboardingPrompt'), [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      { text: i18n.t('profile.reset'), style: 'destructive', onPress: () => updateProfile({ onboardingComplete: false }) },
    ]);

  // ── Chart data ───────────────────────────────────────────────────────────────
  const chartEntries  = weightEntries.slice(-8);
  const chartLabels   = chartEntries.map((e) => e.date.slice(5));
  const chartData     = chartEntries.map((e) => e.weightKg);
  const showChart     = chartEntries.length >= 2;

  // ── Body fat ─────────────────────────────────────────────────────────────────
  const bodyFat       = calculateBodyFatPercentage(bmi.value, profile.age, profile.gender);
  const bodyFatSeries = chartEntries.map((e) => {
    const bmiAt = calculateBmi(e.weightKg, profile.heightCm).value;
    return calculateBodyFatPercentage(bmiAt, profile.age, profile.gender).value;
  });
  const showBodyFatChart = bodyFatSeries.length >= 2;
  const bodyFatTrend = showBodyFatChart
    ? +(bodyFatSeries[bodyFatSeries.length - 1] - bodyFatSeries[0]).toFixed(1)
    : 0;

  const orbTopTranslate = orbDrift.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });
  const orbBotTranslate = orbDrift.interpolate({ inputRange: [0, 1], outputRange: [10, -10] });

  // Stat tiles data
  const statTiles = [
    { icon: '⚡', value: `${profile.weightKg}kg`, label: 'Weight',   color: COLORS.primary },
    { icon: '📏', value: `${profile.heightCm}cm`, label: 'Height',   color: COLORS.accent  },
    { icon: '🔥', value: `${tdee}`,               label: 'Kcal/day', color: COLORS.success },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.orbTop, { transform: [{ translateY: orbTopTranslate }] }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.orbBottom, { transform: [{ translateY: orbBotTranslate }] }]}
      />
      <Starfield density={0.08} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Editorial hero ── */}
        <FadeInUp delay={0}>
          <View style={styles.heroBlock}>
            <View style={{ flex: 1, paddingRight: SPACING.sm }}>
              <Kicker>Personal dashboard</Kicker>
              <View style={{ marginTop: 10 }}>
                <Headline line1={`Hello,`} line2={`${profile.name}.`} size={32} />
              </View>
              <LinearGradient
                colors={[COLORS.primary + '18', COLORS.primary + '04']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroGlassChip}
              >
                <Text style={[styles.heroLead, { color: colors.text }]}>
                  {profile.gender === 'male' ? i18n.t('profile.male') : i18n.t('profile.female')} · {profile.age} {i18n.t('ui.years')} · BMI {bmi.value}
                </Text>
              </LinearGradient>

              <PressableScale onPress={openEdit} style={{ alignSelf: 'flex-start', marginTop: SPACING.md }}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.heroEditBtn}
                >
                  <Text style={styles.heroEditText}>{i18n.t('common.edit')} profile</Text>
                </LinearGradient>
              </PressableScale>
            </View>

            <View style={styles.heroAvatarHalo}>
              <PulseRing color={COLORS.primary} size={170} delay={0} />
              <PulseRing color={COLORS.accent} size={170} delay={1100} />
              <LinearGradient
                pointerEvents="none"
                colors={[COLORS.primary + '55', 'transparent']}
                style={styles.heroAvatarGlowDisc}
              />
              <Floater range={5} duration={3400}>
                <WaterBodyAvatar profile={profile} size={136} />
              </Floater>
            </View>
          </View>
        </FadeInUp>

        {/* ── Stat tile row — FIXED: inline tiles, no StatTile component ── */}
        <FadeInUp delay={80}>
          <View style={styles.statRow}>
            {statTiles.map((tile) => (
              <View
                key={tile.label}
                style={[styles.statTileWrap, { shadowColor: tile.color }]}
              >
                <LinearGradient
                  colors={[tile.color + '22', 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.statTileInner}>
                  <Text style={styles.statTileIcon}>{tile.icon}</Text>
                  <Text
                    style={[styles.statTileValue, { color: colors.text }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {tile.value}
                  </Text>
                  <Text style={[styles.statTileLabel, { color: colors.textSecondary }]}>
                    {tile.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </FadeInUp>

        {/* ── Body stats ── */}
        <FadeInUp delay={120}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.bodyStats')}</Text>
          <GlassCard>
            <InfoRow label={i18n.t('ui.gender')}         value={profile.gender === 'male' ? i18n.t('profile.male') : i18n.t('profile.female')} />
            <InfoRow label={i18n.t('ui.age')}            value={`${profile.age} ${i18n.t('ui.years')}`} />
            <InfoRow label={i18n.t('ui.weight')}         value={`${profile.weightKg} ${i18n.t('ui.kg')}`} />
            <InfoRow label={i18n.t('ui.height')}         value={`${profile.heightCm} cm`} />
            <InfoRow label={i18n.t('ui.activityLevel')}   value={activityLabel} last />
          </GlassCard>
        </FadeInUp>

        {/* ── BMI ── */}
        <FadeInUp delay={150}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.bmi')}</Text>
          <GlassCard>
            <BmiGauge bmi={bmi.value} />
          </GlassCard>
        </FadeInUp>

        {/* ── Body Fat ── */}
        <FadeInUp delay={180}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Fat</Text>
          <GlassCard>
            <View style={styles.bfHeader}>
              <View>
                <Text style={[styles.bfHeaderLabel, { color: colors.textSecondary }]}>Current</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={[styles.bfHeaderVal, { color: colors.text }]}>{bodyFat.value}</Text>
                  <Text style={[styles.bfHeaderUnit, { color: colors.textSecondary }]}>%</Text>
                </View>
                <Text style={[styles.bfHeaderCat, { color: COLORS.primary }]}>
                  {i18n.t(`calories.bodyFatCategories.${bodyFat.category}`)}
                </Text>
              </View>

              {showBodyFatChart && (
                <View style={[
                  styles.bfTrendChip,
                  {
                    backgroundColor: (bodyFatTrend < 0 ? COLORS.success : bodyFatTrend > 0 ? COLORS.danger : colors.textSecondary) + '18',
                    borderColor:     (bodyFatTrend < 0 ? COLORS.success : bodyFatTrend > 0 ? COLORS.danger : colors.textSecondary) + '40',
                    shadowColor:     bodyFatTrend < 0 ? COLORS.success : bodyFatTrend > 0 ? COLORS.danger : '#000',
                  },
                ]}>
                  <Text style={[
                    styles.bfTrendText,
                    { color: bodyFatTrend < 0 ? COLORS.success : bodyFatTrend > 0 ? COLORS.danger : colors.textSecondary },
                  ]}>
                    {bodyFatTrend < 0 ? '▼' : bodyFatTrend > 0 ? '▲' : '—'} {Math.abs(bodyFatTrend)}%
                  </Text>
                  <Text style={[styles.bfTrendSub, { color: colors.textSecondary }]}>
                    over last {bodyFatSeries.length} logs
                  </Text>
                </View>
              )}
            </View>

            <View style={{ marginTop: SPACING.md }}>
              <BodyFatGauge value={bodyFat.value} category={bodyFat.category} gender={profile.gender} />
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              {showBodyFatChart ? (
                <View style={styles.chartFrame}>
                  <LinearGradient
                    pointerEvents="none"
                    colors={[COLORS.primary + '14', 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.bfChartTitle, { color: colors.textSecondary }]}>Progress over time</Text>
                  <WeightChart
                    data={bodyFatSeries}
                    labels={chartLabels}
                    width={CHART_W}
                    height={180}
                  />
                </View>
              ) : (
                <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>
                  {i18n.t('profile.logAtLeastTwoWeights')}
                </Text>
              )}
            </View>
          </GlassCard>
        </FadeInUp>

        {/* ── Goal Avatar Morph ── */}
        <FadeInUp delay={210}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('profile.transformation')}</Text>
          <GlassCard glowColor={COLORS.accent}>
            <Text style={[styles.cardSubLabel, { color: colors.textSecondary }]}>
              {i18n.t('profile.currentShapeGoalShape')}
            </Text>

            <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
              <Floater range={4} duration={3000}>
                <MorphingAvatar
                  profile={profile}
                  goalWeightKg={goalWeight}
                  size={140}
                  nowLabel={i18n.t('ui.now')}
                  goalLabel={i18n.t('ui.goal')}
                />
              </Floater>
            </View>

            <View style={styles.morphRow}>
              <View style={styles.morphAvatarWrap}>
                <WaterBodyAvatar profile={profile} size={100} />
                <Text style={[styles.morphLabel, { color: COLORS.primary }]}>{i18n.t('ui.now')}</Text>
                <Text style={[styles.morphWeight, { color: colors.text }]}>{profile.weightKg} {i18n.t('ui.kg')}</Text>
                <Text style={[styles.morphBmi, { color: colors.textSecondary }]}>
                  BMI {calculateBmi(profile.weightKg, profile.heightCm).value}
                </Text>
              </View>

              <View style={styles.morphArrow}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={styles.morphArrowLine}
                />
                <Text style={[styles.morphArrowText, { color: COLORS.primary }]}>›</Text>
              </View>

              <View style={styles.morphAvatarWrap}>
                <WaterBodyAvatar profile={{ ...profile, weightKg: goalWeight }} size={100} />
                <Text style={[styles.morphLabel, { color: COLORS.success }]}>{i18n.t('ui.goal')}</Text>
                <Text style={[styles.morphWeight, { color: colors.text }]}>{goalWeight} {i18n.t('ui.kg')}</Text>
                <Text style={[styles.morphBmi, { color: colors.textSecondary }]}>
                  BMI {calculateBmi(goalWeight, profile.heightCm).value}
                </Text>
              </View>
            </View>
            <PressableScale onPress={openEdit}>
              <View
                style={[styles.editGoalBtn, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '40' }]}
              >
                <Text style={[styles.editGoalBtnText, { color: COLORS.primary }]}>{i18n.t('profile.editGoalWeight')}</Text>
              </View>
            </PressableScale>
          </GlassCard>
        </FadeInUp>

        {/* ── Weight Tracking ── */}
        <FadeInUp delay={240}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.weightTracking')}</Text>
          <GlassCard>
            {showChart ? (
              <View style={styles.chartFrame}>
                <LinearGradient
                  pointerEvents="none"
                  colors={[COLORS.primary + '14', 'transparent']}
                  style={StyleSheet.absoluteFill}
                />
                <WeightChart
                  data={chartData}
                  labels={chartLabels}
                  width={CHART_W}
                  height={200}
                />
              </View>
            ) : (
              <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>
                {i18n.t('profile.logAtLeastTwoWeights')}
              </Text>
            )}
            <PressableScale onPress={() => setShowWeightModal(true)} style={styles.logWeightBtnWrap}>
              <LinearGradient
                colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.logWeightBtn}
              >
                <Text style={styles.logWeightBtnText}>+ {i18n.t('profile.logWeight')}</Text>
              </LinearGradient>
            </PressableScale>
          </GlassCard>
        </FadeInUp>

        {/* ── Daily Calories ── */}
        <FadeInUp delay={270}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.dailyCalories')}</Text>
          <GlassCard>
            <InfoRow label={i18n.t('ui.maintenanceTDEE')} value={`${tdee} ${i18n.t('calories.kcalPerDay')}`} />
            <InfoRow label={i18n.t('ui.weightLossTarget')}  value={`${tdee - 500} ${i18n.t('calories.kcalPerDay')}`} last />
          </GlassCard>
        </FadeInUp>

        {/* ── Settings ── */}
        <FadeInUp delay={300}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.settings')}</Text>
          <GlassCard>
            <SettingRow icon="🌙" label={i18n.t('profile.darkMode')} isSwitch switchValue={theme === 'dark'} onSwitchChange={toggleTheme} />
            <SettingRow icon="🌐" label={i18n.t('profile.language')} valueText={currentLangLabel} onPress={() => setShowLangModal(true)} />
            <SettingRow icon="☁️" label={i18n.t('profile.driveBackup')} valueText={i18n.t('common.save')} valueColor={COLORS.primary} onPress={handleDriveBackup} disabled={driveBusy} />
            <SettingRow icon="⬇️" label={i18n.t('profile.driveRestore')} valueText={i18n.t('profile.driveRestoreCta')} valueColor={COLORS.primary} onPress={handleDriveRestore} disabled={driveBusy} />
            <SettingRow icon="💾" label={i18n.t('profile.backup')} valueText={i18n.t('common.save')} valueColor={COLORS.primary} onPress={handleExport} />
            <SettingRow icon="♻️" label={i18n.t('profile.restore')} valueText={i18n.t('profile.paste')} valueColor={COLORS.primary} onPress={() => setShowRestoreModal(true)} />
            <SettingRow icon="🚪" label={i18n.t('profile.driveSignOut')} valueText="" onPress={handleDriveSignOut} last />
          </GlassCard>
        </FadeInUp>

        {/* ── Dev reset ── */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.devBtn, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}
            onPress={resetOnboarding}
          >
            <Text style={{ color: '#C2410C', fontWeight: '700' }}>🛠  {i18n.t('ui.resetOnboarding')}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* ══ Edit Profile Modal ══ */}
      <Modal visible={showEdit} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalScreen, { backgroundColor: colors.background }]}>
          <LinearGradient
            pointerEvents="none"
            colors={[COLORS.primary + '20', 'transparent']}
            style={styles.modalTopGlow}
          />
          <View style={[styles.modalHeader, { backgroundColor: colors.surface + 'F2', borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowEdit(false)}>
              <Text style={[styles.modalBack, { color: COLORS.primary }]}>‹ {i18n.t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{i18n.t('profile.editProfile')}</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalAvatar}>
              <PulseRing color={COLORS.primary} size={130} delay={0} />
              <Floater range={4}>
                <WaterBodyAvatar
                  profile={{ ...profile, weightKg: editWeight, heightCm: editHeight, gender: editGender, activityLevel: editActivity }}
                  size={90}
                />
              </Floater>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{i18n.t('ui.fullName')}</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={editName}
              onChangeText={setEditName}
              placeholder={i18n.t('ui.yourName')}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{i18n.t('ui.gender')}</Text>
            <View style={styles.genderRow}>
              {([
                { key: 'male',   icon: '👨', label: i18n.t('profile.male')   },
                { key: 'female', icon: '👩', label: i18n.t('profile.female') },
              ] as { key: Gender; icon: string; label: string }[]).map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[
                    styles.genderCard,
                    { backgroundColor: colors.surface, borderColor: editGender === g.key ? COLORS.primary : colors.border },
                    editGender === g.key && { shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 14, elevation: 6 },
                  ]}
                  onPress={() => setEditGender(g.key)}
                  activeOpacity={0.85}
                >
                  {editGender === g.key && (
                    <LinearGradient
                      pointerEvents="none"
                      colors={[COLORS.primary + '22', 'transparent']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={{ fontSize: 32 }}>{g.icon}</Text>
                  <Text style={[styles.genderLabel, { color: editGender === g.key ? COLORS.primary : colors.text }]}>
                    {g.label}
                  </Text>
                  {editGender === g.key && (
                    <View style={styles.genderCheck}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{i18n.t('ui.bodyMeasurements')}</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: COLORS.primary + '22', shadowColor: COLORS.primary }]}>
              <Stepper label={i18n.t('ui.age')}         value={editAge}        unit={i18n.t('ui.years')} min={10}  max={100} onChange={setEditAge} />
              <View style={[styles.stepperDivider, { backgroundColor: colors.border }]} />
              <Stepper label={i18n.t('ui.weight')}      value={editWeight}     unit={i18n.t('ui.kg')}  min={30}  max={250} onChange={setEditWeight} />
              <View style={[styles.stepperDivider, { backgroundColor: colors.border }]} />
              <Stepper label={i18n.t('ui.height')}      value={editHeight}     unit="cm"  min={100} max={220} onChange={setEditHeight} />
              <View style={[styles.stepperDivider, { backgroundColor: colors.border }]} />
              <Stepper label={i18n.t('profile.goalBmi')} value={editGoalWeight} unit={i18n.t('ui.kg')}  min={30}  max={250} onChange={setEditGoalWeight} />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{i18n.t('ui.activityLevel')}</Text>
            <View style={styles.activityGrid}>
              {ACTIVITY_OPTIONS.map((a) => {
                const active = editActivity === a.key;
                return (
                  <TouchableOpacity
                    key={a.key}
                    style={[
                      styles.activityChip,
                      {
                        backgroundColor: active ? COLORS.primary : colors.surface,
                        borderColor: active ? COLORS.primary : colors.border,
                      },
                      active && { shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 10, elevation: 4 },
                    ]}
                    onPress={() => setEditActivity(a.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 16 }}>{a.icon}</Text>
                    <Text style={[styles.activityLabel, { color: active ? '#fff' : colors.text }]}>
                      {i18n.t(a.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: colors.surface + 'F2', borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.discardBtn, { borderColor: colors.border }]} onPress={() => setShowEdit(false)}>
              <Text style={[styles.discardText, { color: colors.textSecondary }]}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
            <PressableScale onPress={saveEdit} style={{ flex: 1 }}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.saveBtn, { shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 }]}
              >
                <Text style={styles.saveBtnText}>{i18n.t('common.save')}</Text>
              </LinearGradient>
            </PressableScale>
          </View>
        </View>
      </Modal>

      {/* ══ Log Weight Modal ══ */}
      <Modal visible={showWeightModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: COLORS.primary + '30' }]}>
            <LinearGradient
              pointerEvents="none"
              colors={[COLORS.primary + '14', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 28, borderTopRightRadius: 28 }]}
            />
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{i18n.t('profile.logWeight')}</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>{i18n.t('ui.enterWeightKg')}</Text>
            <TextInput
              style={[styles.sheetInput, { borderColor: COLORS.primary + '40', color: colors.text, backgroundColor: colors.cardAlt }]}
              keyboardType="numeric"
              placeholder={i18n.t('profile.weightExample')}
              placeholderTextColor={colors.textSecondary}
              value={weightInput}
              onChangeText={setWeightInput}
              autoFocus
            />
            <View style={styles.sheetBtns}>
              <TouchableOpacity
                style={[styles.sheetCancel, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
                onPress={() => { setShowWeightModal(false); setWeightInput(''); }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{i18n.t('common.cancel')}</Text>
              </TouchableOpacity>
              <PressableScale onPress={handleLogWeight} style={styles.sheetConfirmWrap}>
                <LinearGradient
                  colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.sheetConfirm, { shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 12, elevation: 6 }]}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.md }}>{i18n.t('common.save')}</Text>
                </LinearGradient>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ Restore Backup Modal ══ */}
      <Modal visible={showRestoreModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalScreen, { backgroundColor: colors.background }]}>
          <LinearGradient pointerEvents="none" colors={[COLORS.primary + '20', 'transparent']} style={styles.modalTopGlow} />
          <View style={[styles.modalHeader, { backgroundColor: colors.surface + 'F2', borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowRestoreModal(false)} disabled={restoreBusy}>
              <Text style={[styles.modalBack, { color: COLORS.primary }]}>‹ {i18n.t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{i18n.t('profile.restore')}</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: SPACING.sm }]}>
              {i18n.t('profile.restoreHelp')}
            </Text>
            <TextInput
              multiline
              value={restoreInput}
              onChangeText={setRestoreInput}
              placeholder={'{ "version": "1.0", ... }'}
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.fieldInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  minHeight: 200,
                  textAlignVertical: 'top',
                  fontFamily: 'monospace',
                  fontSize: FONT_SIZE.sm,
                },
              ]}
            />

            <PressableScale onPress={handleImport} disabled={restoreBusy} style={{ marginTop: SPACING.lg }}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.saveBtn, restoreBusy && { opacity: 0.6 }, { shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 12, elevation: 6 }]}
              >
                <Text style={styles.saveBtnText}>
                  {restoreBusy ? i18n.t('common.loading') : i18n.t('profile.restoreNow')}
                </Text>
              </LinearGradient>
            </PressableScale>
          </ScrollView>
        </View>
      </Modal>

      {/* ══ Language Picker Modal ══ */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <TouchableOpacity style={styles.langOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={[styles.langSheet, { backgroundColor: colors.surface, borderColor: COLORS.primary + '30' }]}>
            <LinearGradient
              pointerEvents="none"
              colors={[COLORS.primary + '14', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={[styles.langTitle, { color: colors.text }]}>{i18n.t('profile.language')}</Text>
            {LANGUAGE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.langRow,
                  { borderBottomColor: colors.border + '60' },
                  appLanguage === item.key && { backgroundColor: COLORS.primary + '14' },
                ]}
                onPress={() => handleLanguageChange(item.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.langFlag}>{item.flag}</Text>
                <Text style={[styles.langLabel, { color: appLanguage === item.key ? COLORS.primary : colors.text }]}>
                  {item.label}
                </Text>
                {appLanguage === item.key && <Text style={{ color: COLORS.primary, fontWeight: '800' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  orbTop: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(85,170,255,0.20)', top: -140, right: -110,
  },
  orbBottom: {
    position: 'absolute', width: 360, height: 360, borderRadius: 180,
    backgroundColor: 'rgba(111,216,238,0.16)', bottom: -190, left: -130,
  },
  scroll: { paddingBottom: 110 },

  // Editorial hero
  heroBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroGlassChip: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  heroLead: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    fontWeight: '600',
  },
  heroEditBtn: {
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: 11,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  heroEditText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heroAvatarHalo: {
    width: 175,
    height: 185,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroAvatarGlowDisc: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.85,
  },

  // ── FIXED stat tile row ──────────────────────────────────────────────────────
  statRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statTileWrap: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(120,170,255,0.18)',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    minHeight: 88,
  },
  statTileInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  statTileIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statTileValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  statTileLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginTop: 3,
    textAlign: 'center',
  },
  // ────────────────────────────────────────────────────────────────────────────

  sectionTitle: {
    fontSize: FONT_SIZE.md, fontWeight: '800',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, marginTop: SPACING.sm,
    letterSpacing: 0.3,
  },

  card: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    padding: SPACING.lg,
  },
  cardSheen: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    opacity: 0.18,
  },
  cardSubLabel: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  infoValue: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  // BMI gauge
  bmiGaugeWrap:  { },
  bmiGaugeTrack: {
    height: 12, borderRadius: 6, backgroundColor: 'rgba(148,163,184,0.18)',
    overflow: 'hidden', position: 'relative', marginBottom: 6,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.10)',
  },
  bmiSegment:    { position: 'absolute', top: 0, bottom: 0, width: '25%', opacity: 0.9 },
  bmiThumb: {
    position: 'absolute', top: -4, width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#fff', borderWidth: 2.5, borderColor: '#3B82F6',
    shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 5,
    marginLeft: -9,
    zIndex: 3,
  },
  bmiThumbGlowWrap: {
    position: 'absolute', top: -10, width: 30, height: 30,
    marginLeft: -15, zIndex: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  bmiThumbGlow: {
    width: 30, height: 30, borderRadius: 15,
  },
  bmiLabels:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  bmiTick:       { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  bmiDot:        { width: 10, height: 10, borderRadius: 5 },
  bmiVal:        { fontSize: FONT_SIZE.md, fontWeight: '800' },

  // Body fat
  bfHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bfHeaderLabel:  { fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  bfHeaderVal:    { fontSize: 48, fontWeight: '900', lineHeight: 54, letterSpacing: -1 },
  bfHeaderUnit:   { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  bfHeaderCat:    { fontSize: FONT_SIZE.sm, fontWeight: '800', marginTop: 2, letterSpacing: 0.3 },
  bfTrendChip:    {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  bfTrendText:    { fontSize: FONT_SIZE.md, fontWeight: '900' },
  bfTrendSub:     { fontSize: 10, fontWeight: '600', marginTop: 2 },
  bfChartTitle:   { fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.xs, paddingLeft: 4 },

  chartFrame: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120,170,255,0.16)',
  },

  // Goal avatar morph section
  morphRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: SPACING.md },
  morphAvatarWrap: { alignItems: 'center', gap: 4 },
  morphLabel:  { fontSize: FONT_SIZE.sm, fontWeight: '800', marginTop: 6, letterSpacing: 0.3 },
  morphWeight: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  morphBmi:    { fontSize: FONT_SIZE.xs, marginTop: 2 },
  morphArrow:  { alignItems: 'center', gap: 4, flex: 1 },
  morphArrowLine: { height: 2, width: '80%', borderRadius: 1 },
  morphArrowText: { fontSize: 28, fontWeight: '700' },
  editGoalBtn: { borderRadius: BORDER_RADIUS.round, borderWidth: 1, paddingVertical: 12, alignItems: 'center', marginTop: SPACING.sm },
  editGoalBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '800', letterSpacing: 0.3 },

  // Weight chart
  chartPlaceholder: { textAlign: 'center', fontSize: FONT_SIZE.sm, lineHeight: 22, paddingVertical: SPACING.lg },
  logWeightBtnWrap: { marginTop: SPACING.md },
  logWeightBtn: {
    borderRadius: BORDER_RADIUS.round, paddingVertical: 14, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  logWeightBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.md, letterSpacing: 0.4 },

  // Settings rows
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm + 2 },
  settingIconChip: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(120,170,255,0.20)',
  },
  settingIcon:  { fontSize: 18 },
  settingLabel: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  settingValue: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  devBtn: { marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },

  // ── Edit modal ──
  modalScreen: { flex: 1 },
  modalTopGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 10, paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalBack:   { fontSize: FONT_SIZE.md, fontWeight: '700' },
  modalTitle:  { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: 0.3 },
  modalAvatar: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.lg, height: 150 },
  modalScroll: { padding: SPACING.lg, paddingBottom: 20 },

  fieldLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md, letterSpacing: 0.4, textTransform: 'uppercase' },
  fieldInput: { borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZE.md, marginBottom: SPACING.sm },

  genderRow:  { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  genderCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 2,
    position: 'relative', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  genderLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', marginTop: 6 },
  genderCheck: { position: 'absolute', bottom: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  stepperRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14 },
  stepperLabel:    { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepperBtn:      { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  stepperBtnText:  { fontSize: 22, fontWeight: '300', lineHeight: 26 },
  stepperValue:    { fontSize: FONT_SIZE.md, fontWeight: '800', minWidth: 70, textAlign: 'center' },
  stepperUnit:     { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  stepperDivider:  { height: 1, marginHorizontal: SPACING.md, opacity: 0.5 },

  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  activityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5 },
  activityLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  modalFooter: {
    flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  discardBtn:  { flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5, padding: SPACING.md, alignItems: 'center' },
  discardText: { fontWeight: '700', fontSize: FONT_SIZE.md },
  saveBtn:     { borderRadius: BORDER_RADIUS.round, padding: SPACING.md + 2, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.md, letterSpacing: 0.4 },

  // ── Log weight modal ──
  overlay:          { flex: 1, backgroundColor: 'rgba(8,15,28,0.55)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SPACING.xl, paddingTop: SPACING.md,
    borderTopWidth: 1,
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 12,
    overflow: 'hidden',
  },
  sheetHandle:      { width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(148,163,184,0.5)', alignSelf: 'center', marginBottom: SPACING.lg },
  sheetTitle:       { fontSize: FONT_SIZE.xl, fontWeight: '800', marginBottom: SPACING.xs, letterSpacing: 0.3 },
  sheetSub:         { fontSize: FONT_SIZE.md, marginBottom: SPACING.lg },
  sheetInput:       { borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZE.xl, textAlign: 'center', marginBottom: SPACING.lg, fontWeight: '700' },
  sheetBtns:        { flexDirection: 'row', gap: SPACING.md },
  sheetCancel:      { flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5, padding: SPACING.md, alignItems: 'center' },
  sheetConfirmWrap: { flex: 1 },
  sheetConfirm:     { flex: 1, borderRadius: BORDER_RADIUS.round, padding: SPACING.md, alignItems: 'center' },

  // ── Language modal ──
  langOverlay: { flex: 1, backgroundColor: 'rgba(8,15,28,0.55)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  langSheet: {
    width: '100%', borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 14,
  },
  langTitle:   { fontSize: FONT_SIZE.lg, fontWeight: '800', padding: SPACING.lg, paddingBottom: SPACING.md, letterSpacing: 0.3 },
  langRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  langFlag:    { fontSize: 22 },
  langLabel:   { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '600' },
});