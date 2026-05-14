import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../../store/UserContext';
import { useLanguage } from '../../store/LanguageContext';
import { ActivityLevel, ClimateType } from '../../types';
import DrumPicker from '../../components/DrumPicker';
import i18n from '../../i18n';

const { width: W } = Dimensions.get('window');

const BG       = '#060E1E';
const SURFACE  = '#0E1B31';
const CARD     = '#162848';
const PRIMARY  = '#00B8FF';
const TEXT     = '#E8F1FF';
const TEXT_DIM = 'rgba(232,241,255,0.55)';
const TOTAL    = 8;

type LifeStep = 'age' | 'activity' | 'climate';
const STEP_NUM: Record<LifeStep, number> = { age: 6, activity: 7, climate: 8 };

function range(min: number, max: number): number[] {
  const arr: number[] = [];
  for (let v = min; v <= max; v++) arr.push(v);
  return arr;
}

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

const ACTIVITIES: { key: ActivityLevel; icon: string; label: string; desc: string }[] = [
  { key: 'sedentary',   icon: 'bed-outline',          label: 'Sedentary',         desc: 'Little or no exercise' },
  { key: 'light',       icon: 'walk-outline',          label: 'Lightly active',    desc: '1–3 days / week' },
  { key: 'moderate',    icon: 'bicycle-outline',       label: 'Moderately active', desc: '3–5 days / week' },
  { key: 'active',      icon: 'barbell-outline',       label: 'Active',            desc: '6–7 days / week' },
  { key: 'very_active', icon: 'flash-outline',         label: 'Very active',       desc: 'Twice daily training' },
];

const CLIMATES: { key: ClimateType; icon: string; label: string }[] = [
  { key: 'cold',      icon: 'snow-outline',        label: 'Cold' },
  { key: 'temperate', icon: 'partly-sunny-outline', label: 'Temperate' },
  { key: 'hot',       icon: 'sunny-outline',        label: 'Hot' },
];

export default function ProfileSetupLifestyle() {
  const navigation      = useNavigation<any>();
  const route           = useRoute<any>();
  const insets          = useSafeAreaInsets();
  const { saveProfile } = useUser();
  useLanguage();

  const [lifeStep,  setLifeStep]  = useState<LifeStep>('age');
  const [age,       setAge]       = useState(28);
  const [activity,  setActivity]  = useState<ActivityLevel>('moderate');
  const [climate,   setClimate]   = useState<ClimateType>('temperate');

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

  const ORDER: LifeStep[] = ['age', 'activity', 'climate'];

  const goBack = () => {
    const idx = ORDER.indexOf(lifeStep);
    if (idx > 0) { setLifeStep(ORDER[idx - 1]); animateIn(); }
    else navigation.goBack();
  };

  const goNext = async () => {
    const idx = ORDER.indexOf(lifeStep);
    if (idx < ORDER.length - 1) {
      setLifeStep(ORDER[idx + 1]);
      animateIn();
    } else {
      await saveProfile({
        ...route.params,
        age,
        activityLevel: activity,
        climateType: climate,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      });
      navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const ageItems = useMemo(() => range(10, 100), []);

  const isLast = lifeStep === 'climate';

  return (
    <View style={[s.screen, { backgroundColor: BG }]}>
      <View style={{ paddingTop: insets.top + 12 }}>
        <ProgressHeader step={STEP_NUM[lifeStep]} onBack={goBack} />
      </View>

      <Animated.View style={[s.body, { opacity: fade, transform: [{ translateY: slide }] }]}>

        {/* ── Age ── */}
        {lifeStep === 'age' && (
          <>
            <View style={s.titleBlock}>
              <Text style={s.question}>How old are you?</Text>
              <Text style={s.subtitle}>Age helps us fine-tune your metabolic rate and hydration targets.</Text>
            </View>
            <View style={s.centeredPicker}>
              <DrumPicker
                items={ageItems}
                value={age}
                onChange={setAge}
                unit="yrs"
                width={W * 0.55}
              />
            </View>
          </>
        )}

        {/* ── Activity ── */}
        {lifeStep === 'activity' && (
          <>
            <View style={s.titleBlock}>
              <Text style={s.question}>How active are you?</Text>
              <Text style={s.subtitle}>Your activity level shapes your daily calorie and water requirements.</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={s.actList}>
              {ACTIVITIES.map((opt) => {
                const sel = activity === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[s.actRow, sel && s.actRowActive]}
                    onPress={() => setActivity(opt.key)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.actIconCircle, sel && { backgroundColor: PRIMARY + '22', borderColor: PRIMARY }]}>
                      <Ionicons name={opt.icon as any} size={20} color={sel ? PRIMARY : TEXT_DIM} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.actLabel, sel && { color: TEXT }]}>{opt.label}</Text>
                      <Text style={s.actDesc}>{opt.desc}</Text>
                    </View>
                    {sel && (
                      <View style={s.actCheck}>
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── Climate ── */}
        {lifeStep === 'climate' && (
          <>
            <View style={s.titleBlock}>
              <Text style={s.question}>What's your climate?</Text>
              <Text style={s.subtitle}>Your environment affects how much water your body needs each day.</Text>
            </View>
            <View style={s.climateRow}>
              {CLIMATES.map((c) => {
                const sel = climate === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[s.climateCard, sel && s.climateCardActive]}
                    onPress={() => setClimate(c.key)}
                    activeOpacity={0.8}
                  >
                    {sel && (
                      <View style={s.climateCheck}>
                        <Ionicons name="checkmark" size={11} color="#fff" />
                      </View>
                    )}
                    <View style={[s.climateIconCircle, sel && { backgroundColor: PRIMARY + '22', borderColor: PRIMARY }]}>
                      <Ionicons name={c.icon as any} size={32} color={sel ? PRIMARY : TEXT_DIM} />
                    </View>
                    <Text style={[s.climateLabel, sel && { color: TEXT }]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={s.disclaimer}>You can update these at any time from your profile.</Text>
          </>
        )}

      </Animated.View>

      <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={s.cta}>
          <Text style={s.ctaTxt}>{isLast ? (i18n.t('onboarding.startJourney') || 'Start my journey') : 'Continue'}</Text>
          <Ionicons name={isLast ? 'rocket-outline' : 'arrow-forward'} size={18} color="#fff" />
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

  centeredPicker: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },

  actList: { gap: 10, paddingBottom: 8 },
  actRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: SURFACE,
    borderRadius: 16, borderWidth: 1.5,
    borderColor: 'rgba(232,241,255,0.10)',
    paddingVertical: 14, paddingHorizontal: 14,
  },
  actRowActive: {
    borderColor: PRIMARY,
    backgroundColor: CARD,
    shadowColor: PRIMARY, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  actIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(232,241,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(232,241,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  actLabel: { fontSize: 15, fontWeight: '700', color: TEXT_DIM },
  actDesc:  { fontSize: 11, color: 'rgba(232,241,255,0.35)', marginTop: 2 },
  actCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },

  climateRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  climateCard: {
    flex: 1, alignItems: 'center',
    paddingVertical: 28, paddingHorizontal: 8,
    backgroundColor: SURFACE,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: 'rgba(232,241,255,0.12)',
    position: 'relative',
  },
  climateCardActive: {
    borderColor: PRIMARY,
    backgroundColor: CARD,
    shadowColor: PRIMARY, shadowOpacity: 0.35,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  climateCheck: {
    position: 'absolute', top: 12, right: 12,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  climateIconCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(232,241,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(232,241,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  climateLabel: { fontSize: 14, fontWeight: '800', color: TEXT_DIM },

  disclaimer: {
    marginTop: 24,
    color: 'rgba(232,241,255,0.28)',
    fontSize: 12, fontWeight: '600', textAlign: 'center',
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
