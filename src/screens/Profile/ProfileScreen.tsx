import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../store/ThemeContext';
import { useUser } from '../../store/UserContext';
import { calculateBmi, calculateTDEE } from '../../utils/bmi';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import { ActivityLevel, Gender } from '../../types';


const ACTIVITY_OPTIONS: { key: ActivityLevel; label: string; icon: string }[] = [
  { key: 'sedentary',   label: 'Sedentary',   icon: '🛋️' },
  { key: 'light',       label: 'Light',        icon: '🚶' },
  { key: 'moderate',    label: 'Moderate',     icon: '🏃' },
  { key: 'active',      label: 'Active',       icon: '🏋️' },
  { key: 'very_active', label: 'Very Active',  icon: '⚡' },
];

// ─── Info row inside cards ─────────────────────────────────────────────────────
function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ─── BMI gauge bar ─────────────────────────────────────────────────────────────
function BmiGauge({ bmi }: { bmi: number }) {
  const pct    = Math.min(Math.max((bmi - 10) / 30, 0), 1);
  const color  = bmi < 18.5 ? '#60A5FA' : bmi < 25 ? '#10B981' : bmi < 30 ? '#F59E0B' : '#EF4444';
  const label  = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

  return (
    <View style={styles.bmiGaugeWrap}>
      <View style={styles.bmiGaugeTrack}>
        {/* Colour segments */}
        {[['#60A5FA', 0], ['#10B981', 25], ['#F59E0B', 50], ['#EF4444', 75]].map(([c, left]) => (
          <View key={String(left)} style={[styles.bmiSegment, { backgroundColor: String(c), left: `${left}%` as any }]} />
        ))}
        {/* Thumb */}
        <View style={[styles.bmiThumb, { left: `${pct * 100}%` as any }]} />
      </View>
      <View style={styles.bmiLabels}>
        {['10', '18.5', '25', '30', '40'].map((v) => (
          <Text key={v} style={styles.bmiTick}>{v}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 8 }}>
        <View style={[styles.bmiDot, { backgroundColor: color }]} />
        <Text style={[styles.bmiVal, { color: color }]}>BMI {bmi} — {label}</Text>
      </View>
    </View>
  );
}

// ─── Slider row ────────────────────────────────────────────────────────────────
// Simple +/− stepper (Slider component requires extra install; this is clean & reliable)
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

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { profile, updateProfile } = useUser();
  const [showEdit, setShowEdit] = useState(false);

  // Edit form state — mirrors profile fields
  const [editName,     setEditName]     = useState('');
  const [editAge,      setEditAge]      = useState(0);
  const [editWeight,   setEditWeight]   = useState(0);
  const [editHeight,   setEditHeight]   = useState(0);
  const [editGender,   setEditGender]   = useState<Gender>('male');
  const [editActivity, setEditActivity] = useState<ActivityLevel>('moderate');

  if (!profile) return null;

  const bmi  = calculateBmi(profile.weightKg, profile.heightCm);
  const tdee = calculateTDEE(profile.weightKg, profile.heightCm, profile.age, profile.gender, profile.activityLevel);

  const openEdit = () => {
    setEditName(profile.name);
    setEditAge(profile.age);
    setEditWeight(profile.weightKg);
    setEditHeight(profile.heightCm);
    setEditGender(profile.gender);
    setEditActivity(profile.activityLevel);
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
    });
    setShowEdit(false);
  };

  const resetOnboarding = () =>
    Alert.alert('Reset Onboarding', 'Dev only — see welcome screens again?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => updateProfile({ onboardingComplete: false }) },
    ]);

  const activityLabel = ACTIVITY_OPTIONS.find((a) => a.key === profile.activityLevel)?.label ?? '';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[COLORS.mist, '#DCEEFF', '#EEF8FF']} style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
          <Text style={styles.headerKicker}>Personal dashboard</Text>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSub}>Keep your body metrics, appearance, and preferences in one calm place.</Text>
        </LinearGradient>

        {/* ── Avatar card ── */}
        <View style={[styles.avatarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.avatarGlow} />
          <WaterBodyAvatar profile={profile} size={90} />
          <View style={styles.avatarInfo}>
            <Text style={[styles.avatarName, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[styles.avatarSub, { color: colors.textSecondary }]}>
              {profile.gender === 'male' ? 'Male' : 'Female'} · {profile.age} yrs
            </Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: COLORS.primary + '18' }]} onPress={openEdit}>
            <Text style={styles.editBtnIcon}>⌁</Text>
            <Text style={[styles.editBtnText, { color: COLORS.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Body stats ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Stats</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <InfoRow label="Gender"         value={profile.gender === 'male' ? 'Male' : 'Female'} />
          <InfoRow label="Age"            value={`${profile.age} years`} />
          <InfoRow label="Weight"         value={`${profile.weightKg} kg`} />
          <InfoRow label="Height"         value={`${profile.heightCm} cm`} />
          <InfoRow label="Activity Level" value={activityLabel} last />
        </View>

        {/* ── BMI card ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>BMI</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <BmiGauge bmi={bmi.value} />
        </View>

        {/* ── Calorie card ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Calories</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <InfoRow label="Maintenance (TDEE)" value={`${tdee} kcal/day`} />
          <InfoRow label="Weight Loss Target"  value={`${tdee - 500} kcal/day`} last />
        </View>

        {/* ── Settings ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>◌</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ true: COLORS.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>◌</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Language</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>English ›</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>◌</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Google Drive Backup</Text>
            </View>
            <Text style={[styles.settingValue, { color: COLORS.primary }]}>Backup ›</Text>
          </View>
        </View>

        {/* ── Dev only ── */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.devBtn, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}
            onPress={resetOnboarding}
          >
            <Text style={{ color: '#C2410C', fontWeight: '700' }}>🛠  Reset Onboarding (Dev)</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* ══ Edit Profile Modal ══ */}
      <Modal visible={showEdit} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalScreen, { backgroundColor: colors.background }]}>
          {/* Modal header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowEdit(false)}>
              <Text style={[styles.modalBack, { color: COLORS.primary }]}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View style={styles.modalAvatar}>
              <WaterBodyAvatar profile={{ ...profile, weightKg: editWeight, heightCm: editHeight, gender: editGender, activityLevel: editActivity }} size={70} />
            </View>

            {/* Name */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Gender */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Gender</Text>
            <View style={styles.genderRow}>
              {([
                { key: 'male',   icon: '👨', label: 'Male'   },
                { key: 'female', icon: '👩', label: 'Female' },
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

            {/* Steppers */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Other Info</Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Stepper label="Age"    value={editAge}    unit="yrs" min={10} max={100} onChange={setEditAge} />
              <View style={[styles.stepperDivider, { backgroundColor: colors.border }]} />
              <Stepper label="Weight" value={editWeight} unit="kg"  min={30} max={250} onChange={setEditWeight} />
              <View style={[styles.stepperDivider, { backgroundColor: colors.border }]} />
              <Stepper label="Height" value={editHeight} unit="cm"  min={100} max={220} onChange={setEditHeight} />
            </View>

            {/* Activity level */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Activity Level</Text>
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
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Discard / Save buttons */}
          <View style={[styles.modalFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.discardBtn, { borderColor: colors.border }]}
              onPress={() => setShowEdit(false)}
            >
              <Text style={[styles.discardText, { color: colors.textSecondary }]}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={saveEdit}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  orbTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(85,170,255,0.22)',
    top: -120,
    right: -100,
  },
  orbBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(111,216,238,0.16)',
    bottom: -170,
    left: -120,
  },
  scroll: { paddingBottom: 110 },

  header: {
    paddingTop: 54, paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    marginBottom: SPACING.lg,
    shadowColor: '#2A84E2',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  headerKicker: { color: 'rgba(255,255,255,0.78)', fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: '#fff', marginTop: 6 },
  headerSub: { color: 'rgba(255,255,255,0.88)', fontSize: FONT_SIZE.sm, marginTop: 8, lineHeight: 20, maxWidth: 280 },

  // Avatar card
  avatarCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1,
    shadowColor: '#1A4D93', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
    gap: SPACING.md,
    overflow: 'hidden',
  },
  avatarGlow: { position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary + '22' },
  avatarInfo: { flex: 1 },
  avatarName: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  avatarSub:  { fontSize: FONT_SIZE.sm, marginTop: 3 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
  },
  editBtnIcon: { fontSize: 14 },
  editBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  sectionTitle: {
    fontSize: FONT_SIZE.md, fontWeight: '700',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, marginTop: SPACING.sm,
  },

  card: {
    marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md, overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#1A4D93', shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 14,
  },
  infoLabel: { fontSize: FONT_SIZE.sm },
  infoValue: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  // BMI gauge
  bmiGaugeWrap: { padding: SPACING.md },
  bmiGaugeTrack: {
    height: 10, borderRadius: 5, backgroundColor: '#E2E8F0',
    overflow: 'hidden', position: 'relative', marginBottom: 4,
  },
  bmiSegment: { position: 'absolute', top: 0, bottom: 0, width: '25%' },
  bmiThumb: {
    position: 'absolute', top: -3, width: 16, height: 16,
    borderRadius: 8, backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#3B82F6',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2,
    marginLeft: -8,
  },
  bmiLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  bmiTick:   { fontSize: 10, color: '#94A3B8' },
  bmiDot:    { width: 10, height: 10, borderRadius: 5 },
  bmiVal:    { fontSize: FONT_SIZE.md, fontWeight: '700' },

  // Settings
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 14,
  },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  settingIcon:  { fontSize: 20 },
  settingLabel: { fontSize: FONT_SIZE.md, fontWeight: '500' },
  settingValue: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  devBtn: {
    marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, padding: SPACING.md, alignItems: 'center',
    marginTop: SPACING.sm,
  },

  // ── Edit modal ──
  modalScreen: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 54, paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  modalBack:  { fontSize: FONT_SIZE.md, fontWeight: '600' },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  modalAvatar: { alignItems: 'center', paddingVertical: SPACING.lg },
  modalScroll: { padding: SPACING.lg, paddingBottom: 20 },

  fieldLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: SPACING.sm, marginTop: SPACING.md },
  fieldInput: {
    borderWidth: 1.5, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZE.md, marginBottom: SPACING.sm,
  },

  // Gender selector
  genderRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  genderCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2, position: 'relative',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  genderLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', marginTop: 6 },
  genderCheck: {
    position: 'absolute', bottom: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },

  // Steppers
  stepperRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 14,
  },
  stepperLabel:    { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepperBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 22, fontWeight: '300', lineHeight: 26 },
  stepperValue:   { fontSize: FONT_SIZE.md, fontWeight: '700', minWidth: 70, textAlign: 'center' },
  stepperUnit:    { fontSize: FONT_SIZE.sm, fontWeight: '400' },
  stepperDivider: { height: 1, marginHorizontal: SPACING.md },

  // Activity
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  activityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1.5,
  },
  activityLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  // Footer buttons
  modalFooter: {
    flexDirection: 'row', gap: SPACING.md,
    padding: SPACING.lg, borderTopWidth: 1,
  },
  discardBtn: {
    flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5,
    padding: SPACING.md, alignItems: 'center',
  },
  discardText: { fontWeight: '600', fontSize: FONT_SIZE.md },
  saveBtn: {
    borderRadius: BORDER_RADIUS.round, padding: SPACING.md, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.md },
});
