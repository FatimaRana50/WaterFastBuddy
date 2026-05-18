import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import DrumPicker from '../../components/DrumPicker';
import { useLanguage } from '../../store/LanguageContext';

const { width: W } = Dimensions.get('window');

const BG       = '#060E1E';
const SURFACE  = '#0E1B31';
const CARD     = '#162848';
const PRIMARY  = '#00B8FF';
const TEXT     = '#E8F1FF';
const TEXT_DIM = 'rgba(232,241,255,0.55)';
const TOTAL    = 8;

type BodyStep = 'height' | 'weight' | 'goal';
const STEP_NUM: Record<BodyStep, number> = { height: 3, weight: 4, goal: 5 };

function range(min: number, max: number, step = 1): number[] {
  const arr: number[] = [];
  for (let v = min; v <= max; v = Math.round((v + step) * 10) / 10) arr.push(v);
  return arr;
}

function cmToInches(cm: number) { return Math.round(cm / 2.54); }
function inchesToCm(inches: number) { return Math.round(inches * 2.54); }
function kgToLb(kg: number) { return Math.round(kg * 2.20462); }
function lbToKg(lb: number) { return Math.round(lb / 2.20462); }
function fmtInches(inches: number) {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}

function UnitToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={u.wrap}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          style={[u.pill, value === opt && u.pillActive]}
          activeOpacity={0.8}
        >
          <Text style={[u.pillTxt, value === opt && u.pillTxtActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const u = StyleSheet.create({
  wrap:         { flexDirection: 'row', backgroundColor: SURFACE, borderRadius: 999, padding: 3, alignSelf: 'flex-end', marginBottom: 8 },
  pill:         { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999 },
  pillActive:   { backgroundColor: PRIMARY },
  pillTxt:      { fontSize: 14, fontWeight: '700', color: TEXT_DIM },
  pillTxtActive:{ color: '#fff' },
});

function ProgressHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backBtn} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={TEXT} />
      </TouchableOpacity>
      <View style={s.barWrap}>
        <View style={[s.barFill, { width: `${(step / TOTAL) * 100}%` }]} />
      </View>
      <Text style={s.counter}>{step} / {TOTAL}</Text>
    </View>
  );
}

export default function ProfileSetupBody() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const insets     = useSafeAreaInsets();
  const gender: 'male' | 'female' = route.params?.gender ?? 'male';
  useLanguage();

  const [bodyStep,    setBodyStep]    = useState<BodyStep>('height');
  const [heightUnit,  setHeightUnit]  = useState<'cm' | 'ft'>('cm');
  const [weightUnit,  setWeightUnit]  = useState<'kg' | 'lb'>('kg');
  const [heightCm,    setHeightCm]    = useState(170);
  const [weightKg,    setWeightKg]    = useState(70);
  const [goalKg,      setGoalKg]      = useState(65);

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  const animateIn = () => {
    fade.setValue(0); slide.setValue(24);
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { animateIn(); }, []);

  const ORDER: BodyStep[] = ['height', 'weight', 'goal'];

  const transition = (action: () => void) => {
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      action();
      animateIn();
    });
  };

  const goBack = () => {
    const idx = ORDER.indexOf(bodyStep);
    if (idx > 0) transition(() => setBodyStep(ORDER[idx - 1]));
    else navigation.goBack();
  };

  const goNext = () => {
    const idx = ORDER.indexOf(bodyStep);
    if (idx < ORDER.length - 1) {
      transition(() => setBodyStep(ORDER[idx + 1]));
    } else {
      navigation.navigate('ProfileSetupLifestyle', {
        ...route.params,
        heightCm,
        weightKg,
        goalWeightKg: goalKg,
      });
    }
  };

  // ── Height picker data ─────────────────────────────────────────
  const heightItems = useMemo(() =>
    heightUnit === 'cm' ? range(120, 220) : range(cmToInches(120), cmToInches(220)),
    [heightUnit],
  );
  const heightValue = heightUnit === 'cm' ? heightCm : cmToInches(heightCm);
  const handleHeightChange = (v: number) => {
    setHeightCm(heightUnit === 'cm' ? v : inchesToCm(v));
  };
  const handleHeightUnitChange = (u: string) => {
    setHeightUnit(u as 'cm' | 'ft');
  };

  // ── Weight picker data ─────────────────────────────────────────
  const weightItems = useMemo(() =>
    weightUnit === 'kg' ? range(30, 200) : range(kgToLb(30), kgToLb(200)),
    [weightUnit],
  );
  const weightValue = weightUnit === 'kg' ? weightKg : kgToLb(weightKg);
  const handleWeightChange = (v: number) => {
    setWeightKg(weightUnit === 'kg' ? v : lbToKg(v));
  };

  const goalValue = weightUnit === 'kg' ? goalKg : kgToLb(goalKg);
  const handleGoalChange = (v: number) => {
    setGoalKg(weightUnit === 'kg' ? v : lbToKg(v));
  };
  const handleWeightUnitChange = (u: string) => {
    setWeightUnit(u as 'kg' | 'lb');
  };

  // ── Avatar shape ───────────────────────────────────────────────
  const bmi = weightKg / ((heightCm / 100) ** 2);
  const avatarProfile: any = { name: 'You', gender, weightKg, heightCm, age: 30 };

  // ── Step config ────────────────────────────────────────────────
  const config = {
    height: {
      question: 'How tall are you?',
      subtitle: 'Your height is a key factor in customising your hydration plan.',
      items:      heightItems,
      value:      heightValue,
      onChange:   handleHeightChange,
      unit:       heightUnit,
      formatter:  heightUnit === 'ft' ? fmtInches : undefined,
      unitOptions:['cm', 'ft'] as string[],
      onUnitChange: handleHeightUnitChange,
    },
    weight: {
      question: 'How much do you weigh?',
      subtitle: 'Your weight plays a crucial role in determining your hydration needs.',
      items:      weightItems,
      value:      weightValue,
      onChange:   handleWeightChange,
      unit:       weightUnit,
      formatter:  undefined,
      unitOptions:['kg', 'lb'] as string[],
      onUnitChange: handleWeightUnitChange,
    },
    goal: {
      question: "What's your goal weight?",
      subtitle: 'We use this to track your progress and personalise fasting plans.',
      items:      weightItems,
      value:      goalValue,
      onChange:   handleGoalChange,
      unit:       weightUnit,
      formatter:  undefined,
      unitOptions:['kg', 'lb'] as string[],
      onUnitChange: handleWeightUnitChange,
    },
  };

  const cfg = config[bodyStep];
  const PICKER_W = W * 0.5;

  return (
    <View style={[s.screen, { backgroundColor: BG }]}>
      <View style={{ paddingTop: insets.top + 12 }}>
        <ProgressHeader step={STEP_NUM[bodyStep]} onBack={goBack} />
      </View>

      <Animated.View style={[s.body, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={s.titleBlock}>
          <Text style={s.question}>{cfg.question}</Text>
          <Text style={s.subtitle}>{cfg.subtitle}</Text>
        </View>

        <View style={s.pickerArea}>
          {/* Avatar left */}
          <View style={s.avatarSide}>
            <WaterBodyAvatar
              profile={avatarProfile}
              size={W * 0.38}
              fillPct={Math.min(0.95, Math.max(0.1, (bmi - 18) / 14 * 0.8 + 0.1))}
            />
            {/* Ground shadow */}
            <View style={s.avatarShadow} />
          </View>

          {/* Picker right */}
          <View style={s.pickerSide}>
            <UnitToggle
              options={cfg.unitOptions}
              value={cfg.unit}
              onChange={cfg.onUnitChange}
            />
            <DrumPicker
              items={cfg.items}
              value={cfg.value}
              onChange={cfg.onChange}
              unit={cfg.unit}
              formatter={cfg.formatter}
              width={PICKER_W}
            />
          </View>
        </View>
      </Animated.View>

      <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={s.cta}>
          <Text style={s.ctaTxt}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, gap: 12, marginBottom: 8,
  },
  backBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' },
  barWrap:  { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 2, backgroundColor: PRIMARY },
  counter:  { fontSize: 12, fontWeight: '800', color: TEXT_DIM, minWidth: 36, textAlign: 'right' },

  body: { flex: 1, paddingHorizontal: 20 },

  titleBlock: { marginBottom: 16 },
  question:   { fontSize: 26, fontWeight: '900', color: TEXT, lineHeight: 32, letterSpacing: -0.4 },
  subtitle:   { fontSize: 13, color: TEXT_DIM, lineHeight: 20, marginTop: 6 },

  pickerArea: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
  },
  avatarSide: {
    width: '45%', alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  avatarShadow: {
    width: 90, height: 10, borderRadius: 45,
    backgroundColor: 'rgba(0,184,255,0.20)',
    marginTop: -6,
  },
  pickerSide: {
    flex: 1, alignItems: 'flex-start', justifyContent: 'center',
  },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17,
    borderRadius: 999, backgroundColor: PRIMARY,
    shadowColor: PRIMARY, shadowOpacity: 0.5,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  ctaTxt: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.2 },
});
