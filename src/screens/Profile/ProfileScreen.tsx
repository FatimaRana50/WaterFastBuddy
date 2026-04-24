import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Switch, Alert, Dimensions, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WeightChart from '../../components/WeightChart';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { useFasts } from '../../store/FastsContext';
import { calculateBmi, calculateTDEE, goalWeightForBmi } from '../../utils/bmi';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import MorphingAvatar from '../../components/Avatar/MorphingAvatar';
import Starfield from '../../components/Starfield';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import StatTile from '../../components/StatTile';
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
// Width for the LineChart — card margins (24×2) + card padding (24×2)
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

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function BmiGauge({ bmi }: { bmi: number }) {
  const pct   = Math.min(Math.max((bmi - 10) / 30, 0), 1);
  const color = bmi < 18.5 ? '#60A5FA' : bmi < 25 ? '#10B981' : bmi < 30 ? '#F59E0B' : '#EF4444';
  const label = bmi < 18.5 ? i18n.t('profile.underweight') : bmi < 25 ? i18n.t('profile.normal') : bmi < 30 ? i18n.t('profile.overweight') : i18n.t('profile.obese');

  return (
    <View style={styles.bmiGaugeWrap}>
      <View style={styles.bmiGaugeTrack}>
        {[['#60A5FA', 0], ['#10B981', 25], ['#F59E0B', 50], ['#EF4444', 75]].map(([c, left]) => (
          <View key={String(left)} style={[styles.bmiSegment, { backgroundColor: String(c), left: `${left}%` as any }]} />
        ))}
        <View style={[styles.bmiThumb, { left: `${pct * 100}%` as any }]} />
      </View>
      <View style={styles.bmiLabels}>
        {['10', '18.5', '25', '30', '40'].map((v) => (
          <Text key={v} style={styles.bmiTick}>{v}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 8 }}>
        <View style={[styles.bmiDot, { backgroundColor: color }]} />
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
          style={[styles.stepperBtn, { backgroundColor: colors.cardAlt }]}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={[styles.stepperBtnText, { color: COLORS.primary }]}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.stepperValue, { color: colors.text }]}>
          {value} <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>{unit}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: colors.cardAlt }]}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={[styles.stepperBtnText, { color: COLORS.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { language: appLanguage, setLanguage: updateAppLanguage } = useLanguage();
  const { profile, updateProfile, saveProfile } = useUser();
  const { fasts, savedFasts, reloadAll, replaceSavedFasts } = useFasts();

  // Edit modal state
  const [showEdit,      setShowEdit]      = useState(false);
  const [editName,      setEditName]      = useState('');
  const [editAge,       setEditAge]       = useState(0);
  const [editWeight,    setEditWeight]    = useState(0);
  const [editHeight,    setEditHeight]    = useState(0);
  const [editGender,    setEditGender]    = useState<Gender>('male');
  const [editActivity,  setEditActivity]  = useState<ActivityLevel>('moderate');
  const [editGoalWeight, setEditGoalWeight] = useState(0);

  // Weight tracking
  const [weightEntries,   setWeightEntries]   = useState<WeightEntry[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput,     setWeightInput]     = useState('');

  // Language modal
  const [showLangModal, setShowLangModal] = useState(false);

  // Restore / import backup modal
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreInput,     setRestoreInput]     = useState('');
  const [restoreBusy,      setRestoreBusy]      = useState(false);

  // Drive sync state
  const [driveBusy, setDriveBusy] = useState(false);

  useEffect(() => {
    getAllWeightEntries().then(setWeightEntries).catch(() => {});
  }, [appLanguage]);

  if (!profile) return null;

  const bmi  = calculateBmi(profile.weightKg, profile.heightCm);
  const tdee = calculateTDEE(profile.weightKg, profile.heightCm, profile.age, profile.gender, profile.activityLevel);
  // Resolve goal weight — fall back to a healthy BMI if not set
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
    // Also update current profile weight
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

  // Shared logic for turning a parsed backup object into local state +
  // persisted rows. Used by both the paste-JSON flow and Google Drive restore.
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

  // Restore data from a pasted JSON backup (the same shape produced by handleExport).
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

  // Upload the full backup JSON to the user's Google Drive (appDataFolder).
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

  // Download the backup JSON from Drive and apply it locally.
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
  // Show last 8 entries on the chart
  const chartEntries  = weightEntries.slice(-8);
  const chartLabels   = chartEntries.map((e) => e.date.slice(5));  // MM-DD
  const chartData     = chartEntries.map((e) => e.weightKg);
  const showChart     = chartEntries.length >= 2;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Starfield density={0.08} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Editorial hero ── */}
        <View style={styles.heroBlock}>
          <View style={{ flex: 1, paddingRight: SPACING.sm }}>
            <Kicker>Personal dashboard</Kicker>
            <View style={{ marginTop: 10 }}>
              <Headline line1={`Hello,`} line2={`${profile.name}.`} size={32} />
            </View>
            <Text style={[styles.heroLead, { color: colors.textSecondary }]}>
              {profile.gender === 'male' ? i18n.t('profile.male') : i18n.t('profile.female')} · {profile.age} {i18n.t('ui.years')} · BMI {bmi.value}
            </Text>
            <TouchableOpacity
              onPress={openEdit}
              style={[styles.heroEditBtn, { backgroundColor: COLORS.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.heroEditText}>{i18n.t('common.edit')} profile</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroAvatarHalo}>
            <WaterBodyAvatar profile={profile} size={104} />
          </View>
        </View>

        {/* ── Stat tile row ── */}
        <View style={styles.statRow}>
          <StatTile
            icon="flash-outline"
            value={`${profile.weightKg}kg`}
            label="Weight"
            style={{ flex: 1 }}
          />
          <StatTile
            icon="body-outline"
            value={`${profile.heightCm}cm`}
            label="Height"
            accent={COLORS.accent}
            style={{ flex: 1 }}
          />
          <StatTile
            icon="pulse-outline"
            value={`${tdee}`}
            label="Kcal/day"
            accent={COLORS.success}
            style={{ flex: 1 }}
          />
        </View>

        {/* ── Body stats ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.bodyStats')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label={i18n.t('ui.gender')}         value={profile.gender === 'male' ? i18n.t('profile.male') : i18n.t('profile.female')} />
          <InfoRow label={i18n.t('ui.age')}            value={`${profile.age} ${i18n.t('ui.years')}`} />
          <InfoRow label={i18n.t('ui.weight')}         value={`${profile.weightKg} ${i18n.t('ui.kg')}`} />
          <InfoRow label={i18n.t('ui.height')}         value={`${profile.heightCm} cm`} />
          <InfoRow label={i18n.t('ui.activityLevel')}   value={activityLabel} last />
        </View>

        {/* ── BMI ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.bmi')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <BmiGauge bmi={bmi.value} />
        </View>

        {/* ── Goal Avatar Morph ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('profile.transformation')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardSubLabel, { color: colors.textSecondary }]}>
            {i18n.t('profile.currentShapeGoalShape')}
          </Text>

          {/* Animated morph — crossfades between current body and goal body */}
          <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
            <MorphingAvatar
              profile={profile}
              goalWeightKg={goalWeight}
              size={140}
              nowLabel={i18n.t('ui.now')}
              goalLabel={i18n.t('ui.goal')}
            />
          </View>

          <View style={styles.morphRow}>
            {/* Current avatar */}
            <View style={styles.morphAvatarWrap}>
              <WaterBodyAvatar profile={profile} size={80} />
              <Text style={[styles.morphLabel, { color: COLORS.primary }]}>{i18n.t('ui.now')}</Text>
              <Text style={[styles.morphWeight, { color: colors.text }]}>{profile.weightKg} {i18n.t('ui.kg')}</Text>
              <Text style={[styles.morphBmi, { color: colors.textSecondary }]}>
                BMI {calculateBmi(profile.weightKg, profile.heightCm).value}
              </Text>
            </View>

            {/* Arrow */}
            <View style={styles.morphArrow}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={styles.morphArrowLine}
              />
              <Text style={[styles.morphArrowText, { color: COLORS.primary }]}>›</Text>
            </View>

            {/* Goal avatar */}
            <View style={styles.morphAvatarWrap}>
              <WaterBodyAvatar profile={{ ...profile, weightKg: goalWeight }} size={80} />
              <Text style={[styles.morphLabel, { color: COLORS.success }]}>{i18n.t('ui.goal')}</Text>
              <Text style={[styles.morphWeight, { color: colors.text }]}>{goalWeight} {i18n.t('ui.kg')}</Text>
              <Text style={[styles.morphBmi, { color: colors.textSecondary }]}>
                BMI {calculateBmi(goalWeight, profile.heightCm).value}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editGoalBtn, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }]}
            onPress={openEdit}
          >
            <Text style={[styles.editGoalBtnText, { color: COLORS.primary }]}>{i18n.t('profile.editGoalWeight')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Weight Tracking ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.weightTracking')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {showChart ? (
            <WeightChart
              data={chartData}
              labels={chartLabels}
              width={CHART_W}
              height={200}
            />
          ) : (
            <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>
              {i18n.t('profile.logAtLeastTwoWeights')}
            </Text>
          )}
          <TouchableOpacity
            style={styles.logWeightBtnWrap}
            onPress={() => setShowWeightModal(true)}
          >
            <LinearGradient
              colors={[COLORS.primaryDark, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.logWeightBtn}
            >
              <Text style={styles.logWeightBtnText}>+ {i18n.t('profile.logWeight')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Daily Calories ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.dailyCalories')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label={i18n.t('ui.maintenanceTDEE')} value={`${tdee} ${i18n.t('calories.kcalPerDay')}`} />
          <InfoRow label={i18n.t('ui.weightLossTarget')}  value={`${tdee - 500} ${i18n.t('calories.kcalPerDay')}`} last />
        </View>

        {/* ── Settings ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.settings')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Dark mode */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t('profile.darkMode')}</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ true: COLORS.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>

          {/* Language */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t('profile.language')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{currentLangLabel} ›</Text>
          </TouchableOpacity>

          {/* Google Drive — Backup */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }, driveBusy && { opacity: 0.6 }]}
            onPress={handleDriveBackup}
            disabled={driveBusy}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>☁️</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t('profile.driveBackup')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: COLORS.primary }]}>{i18n.t('common.save')} ›</Text>
          </TouchableOpacity>

          {/* Google Drive — Restore */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }, driveBusy && { opacity: 0.6 }]}
            onPress={handleDriveRestore}
            disabled={driveBusy}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⬇️</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t('profile.driveRestore')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: COLORS.primary }]}>{i18n.t('profile.driveRestoreCta')} ›</Text>
          </TouchableOpacity>

          {/* Local export (share JSON) */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={handleExport}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💾</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t('profile.backup')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: COLORS.primary }]}>{i18n.t('common.save')} ›</Text>
          </TouchableOpacity>

          {/* Local import (paste JSON) */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => setShowRestoreModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>♻️</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t('profile.restore')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: COLORS.primary }]}>{i18n.t('profile.paste')} ›</Text>
          </TouchableOpacity>

          {/* Sign out of Drive */}
          <TouchableOpacity style={styles.settingRow} onPress={handleDriveSignOut} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🚪</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t('profile.driveSignOut')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Dev reset (debug builds only) ── */}
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
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowEdit(false)}>
              <Text style={[styles.modalBack, { color: COLORS.primary }]}>‹ {i18n.t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{i18n.t('profile.editProfile')}</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Live avatar preview */}
            <View style={styles.modalAvatar}>
              <WaterBodyAvatar
                profile={{ ...profile, weightKg: editWeight, heightCm: editHeight, gender: editGender, activityLevel: editActivity }}
                size={70}
              />
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
                  ]}
                  onPress={() => setEditGender(g.key)}
                >
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
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
              {ACTIVITY_OPTIONS.map((a) => (
                <TouchableOpacity
                  key={a.key}
                  style={[
                    styles.activityChip,
                    {
                      backgroundColor: editActivity === a.key ? COLORS.primary : colors.surface,
                      borderColor: editActivity === a.key ? COLORS.primary : colors.border,
                    },
                  ]}
                  onPress={() => setEditActivity(a.key)}
                >
                  <Text style={{ fontSize: 16 }}>{a.icon}</Text>
                  <Text style={[styles.activityLabel, { color: editActivity === a.key ? '#fff' : colors.text }]}>
                    {i18n.t(a.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.discardBtn, { borderColor: colors.border }]} onPress={() => setShowEdit(false)}>
              <Text style={[styles.discardText, { color: colors.textSecondary }]}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={saveEdit}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>{i18n.t('common.save')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══ Log Weight Modal ══ */}
      <Modal visible={showWeightModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{i18n.t('profile.logWeight')}</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>{i18n.t('ui.enterWeightKg')}</Text>
            <TextInput
              style={[styles.sheetInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.cardAlt }]}
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
              <TouchableOpacity style={styles.sheetConfirmWrap} onPress={handleLogWeight}>
                <LinearGradient
                  colors={[COLORS.primaryDark, COLORS.primary]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.sheetConfirm}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.md }}>{i18n.t('common.save')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ Restore Backup Modal ══ */}
      <Modal visible={showRestoreModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalScreen, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: COLORS.primary, marginTop: SPACING.lg }, restoreBusy && { opacity: 0.6 }]}
              onPress={handleImport}
              disabled={restoreBusy}
            >
              <Text style={styles.saveBtnText}>
                {restoreBusy ? i18n.t('common.loading') : i18n.t('profile.restoreNow')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ══ Language Picker Modal ══ */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <TouchableOpacity style={styles.langOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={[styles.langSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.langTitle, { color: colors.text }]}>{i18n.t('profile.language')}</Text>
            {LANGUAGE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.langRow,
                  { borderBottomColor: colors.border },
                  appLanguage === item.key && { backgroundColor: COLORS.primary + '10' },
                ]}
                onPress={() => handleLanguageChange(item.key)}
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
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(85,170,255,0.22)', top: -120, right: -100,
  },
  orbBottom: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(111,216,238,0.16)', bottom: -170, left: -120,
  },
  scroll: { paddingBottom: 110 },

  // New editorial hero
  heroBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroLead: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  heroEditBtn: {
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.round,
  },
  heroEditText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  heroAvatarHalo: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroHaloRing: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1.5,
  },
  heroHaloRing2: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderStyle: 'dashed',
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  header: {
    paddingTop: 8, paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    marginBottom: SPACING.lg,
    shadowColor: '#2A84E2', shadowOpacity: 0.22, shadowRadius: 16, elevation: 8,
  },
  headerKicker: { color: 'rgba(255,255,255,0.78)', fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle:  { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: '#fff', marginTop: 6 },
  headerSub:    { color: 'rgba(255,255,255,0.88)', fontSize: FONT_SIZE.sm, marginTop: 8, lineHeight: 20, maxWidth: 280 },

  avatarCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1,
    shadowColor: '#1A4D93', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
    gap: SPACING.md, overflow: 'hidden',
  },
  avatarGlow: { position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary + '22' },
  avatarInfo: { flex: 1 },
  avatarName: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  avatarSub:  { fontSize: FONT_SIZE.sm, marginTop: 3 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.round,
  },
  editBtnIcon: { fontSize: 14 },
  editBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  sectionTitle: {
    fontSize: FONT_SIZE.md, fontWeight: '700',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, marginTop: SPACING.sm,
  },

  card: {
    marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md, overflow: 'hidden', borderWidth: 1,
    shadowColor: '#1A4D93', shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
    padding: SPACING.lg,
  },
  cardSubLabel: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: { fontSize: FONT_SIZE.sm },
  infoValue: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  // BMI gauge
  bmiGaugeWrap:  { },
  bmiGaugeTrack: { height: 10, borderRadius: 5, backgroundColor: '#E2E8F0', overflow: 'hidden', position: 'relative', marginBottom: 4 },
  bmiSegment:    { position: 'absolute', top: 0, bottom: 0, width: '25%' },
  bmiThumb:      { position: 'absolute', top: -3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: '#3B82F6', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2, marginLeft: -8 },
  bmiLabels:     { flexDirection: 'row', justifyContent: 'space-between' },
  bmiTick:       { fontSize: 10, color: '#94A3B8' },
  bmiDot:        { width: 10, height: 10, borderRadius: 5 },
  bmiVal:        { fontSize: FONT_SIZE.md, fontWeight: '700' },

  // Goal avatar morph section
  morphRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: SPACING.md },
  morphAvatarWrap: { alignItems: 'center', gap: 4 },
  morphLabel:  { fontSize: FONT_SIZE.sm, fontWeight: '800', marginTop: 6 },
  morphWeight: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  morphBmi:    { fontSize: FONT_SIZE.xs, marginTop: 2 },
  morphArrow:  { alignItems: 'center', gap: 4, flex: 1 },
  morphArrowLine: { height: 2, width: '80%', borderRadius: 1 },
  morphArrowText: { fontSize: 28, fontWeight: '700' },
  editGoalBtn: { borderRadius: BORDER_RADIUS.round, borderWidth: 1, paddingVertical: 10, alignItems: 'center', marginTop: SPACING.sm },
  editGoalBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  // Weight chart
  chartPlaceholder: { textAlign: 'center', fontSize: FONT_SIZE.sm, lineHeight: 22, paddingVertical: SPACING.lg },
  logWeightBtnWrap: { marginTop: SPACING.md },
  logWeightBtn:     { borderRadius: BORDER_RADIUS.round, paddingVertical: 12, alignItems: 'center' },
  logWeightBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.md },

  // Settings rows
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
  },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  settingIcon:  { fontSize: 20 },
  settingLabel: { fontSize: FONT_SIZE.md, fontWeight: '500' },
  settingValue: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  devBtn: { marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },

  // ── Edit modal ──
  modalScreen: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 8, paddingBottom: SPACING.md, borderBottomWidth: 1 },
  modalBack:   { fontSize: FONT_SIZE.md, fontWeight: '600' },
  modalTitle:  { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  modalAvatar: { alignItems: 'center', paddingVertical: SPACING.lg },
  modalScroll: { padding: SPACING.lg, paddingBottom: 20 },

  fieldLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: SPACING.sm, marginTop: SPACING.md },
  fieldInput: { borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZE.md, marginBottom: SPACING.sm },

  genderRow:  { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  genderCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, position: 'relative', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  genderLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', marginTop: 6 },
  genderCheck: { position: 'absolute', bottom: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  stepperRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14 },
  stepperLabel:    { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepperBtn:      { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText:  { fontSize: 22, fontWeight: '300', lineHeight: 26 },
  stepperValue:    { fontSize: FONT_SIZE.md, fontWeight: '700', minWidth: 70, textAlign: 'center' },
  stepperUnit:     { fontSize: FONT_SIZE.sm, fontWeight: '400' },
  stepperDivider:  { height: 1, marginHorizontal: SPACING.md },

  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  activityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5 },
  activityLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  modalFooter: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg, borderTopWidth: 1 },
  discardBtn:  { flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5, padding: SPACING.md, alignItems: 'center' },
  discardText: { fontWeight: '600', fontSize: FONT_SIZE.md },
  saveBtn:     { borderRadius: BORDER_RADIUS.round, padding: SPACING.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.md },

  // ── Log weight modal ──
  overlay:          { flex: 1, backgroundColor: 'rgba(8,15,28,0.42)', justifyContent: 'flex-end' },
  sheet:            { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.xl, paddingTop: SPACING.md, borderTopWidth: 1 },
  sheetHandle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: SPACING.lg },
  sheetTitle:       { fontSize: FONT_SIZE.xl, fontWeight: '800', marginBottom: SPACING.xs },
  sheetSub:         { fontSize: FONT_SIZE.md, marginBottom: SPACING.lg },
  sheetInput:       { borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZE.xl, textAlign: 'center', marginBottom: SPACING.lg },
  sheetBtns:        { flexDirection: 'row', gap: SPACING.md },
  sheetCancel:      { flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5, padding: SPACING.md, alignItems: 'center' },
  sheetConfirmWrap: { flex: 1 },
  sheetConfirm:     { flex: 1, borderRadius: BORDER_RADIUS.round, padding: SPACING.md, alignItems: 'center' },

  // ── Language modal ──
  langOverlay: { flex: 1, backgroundColor: 'rgba(8,15,28,0.42)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  langSheet:   { width: '100%', borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  langTitle:   { fontSize: FONT_SIZE.lg, fontWeight: '800', padding: SPACING.lg, paddingBottom: SPACING.md },
  langRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 14, borderBottomWidth: 1 },
  langFlag:    { fontSize: 22 },
  langLabel:   { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '600' },
});
