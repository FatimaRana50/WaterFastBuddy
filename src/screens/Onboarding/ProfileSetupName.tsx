import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Easing, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

const { width: W } = Dimensions.get('window');

const BG       = '#060E1E';
const SURFACE  = '#0E1B31';
const CARD     = '#162848';
const PRIMARY  = '#00B8FF';
const TEXT     = '#E8F1FF';
const TEXT_DIM = 'rgba(232,241,255,0.55)';
const TOTAL    = 8;

function ProgressHeader({
  step, onBack,
}: { step: number; onBack: () => void }) {
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

export default function ProfileSetupName() {
  const [step,   setStep]   = useState<1 | 2>(1);
  const [name,   setName]   = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const navigation = useNavigation<any>();
  const insets     = useSafeAreaInsets();
  useLanguage();

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  const animateIn = () => {
    fade.setValue(0); slide.setValue(24);
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { animateIn(); }, []);

  const transition = (action: () => void) => {
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      action();
      animateIn();
    });
  };

  const goNext = () => {
    if (step === 1 && name.trim().length > 0) {
      transition(() => setStep(2));
    } else if (step === 2 && gender) {
      navigation.navigate('ProfileSetupBody', { name: name.trim(), gender });
    }
  };

  const goBack = () => {
    if (step === 2) transition(() => setStep(1));
    else navigation.goBack();
  };

  const canContinue = step === 1 ? name.trim().length > 0 : gender !== null;

  return (
    <KeyboardAvoidingView
      style={[s.screen, { backgroundColor: BG }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + 12 }}>
        <ProgressHeader step={step} onBack={goBack} />
      </View>

      <Animated.View style={[s.content, { opacity: fade, transform: [{ translateY: slide }] }]}>
        {step === 1 ? (
          <>
            <Text style={s.title}>{i18n.t('onboarding.setup.whatsYourName') || "What's your\nname?"}</Text>
            <Text style={s.subtitle}>{i18n.t('onboarding.setup.nameSubtitle') || "We'll use this to personalise your experience."}</Text>

            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={18} color={TEXT_DIM} style={{ marginRight: 10 }} />
              <TextInput
                style={s.input}
                placeholder="e.g. Alex"
                placeholderTextColor="rgba(232,241,255,0.28)"
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
                autoCapitalize="words"
                onSubmitEditing={goNext}
              />
              {name.trim().length > 0 && (
                <View style={s.checkDot}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={s.title}>{i18n.t('onboarding.setup.whatsYourGender') || "What's your\ngender?"}</Text>
            <Text style={s.subtitle}>{i18n.t('onboarding.setup.genderSubtitle') || "This helps us personalise your body metrics and fasting plan."}</Text>

            <View style={s.genderRow}>
              {([
                { key: 'male',   icon: 'man-outline',   label: i18n.t('onboarding.setup.male')   || 'Male' },
                { key: 'female', icon: 'woman-outline', label: i18n.t('onboarding.setup.female') || 'Female' },
              ] as { key: 'male' | 'female'; icon: any; label: string }[]).map((g) => {
                const sel = gender === g.key;
                return (
                  <TouchableOpacity
                    key={g.key}
                    style={[s.gCard, sel && s.gCardActive]}
                    onPress={() => setGender(g.key)}
                    activeOpacity={0.8}
                  >
                    {sel && (
                      <View style={s.gCheck}>
                        <Ionicons name="checkmark" size={11} color="#fff" />
                      </View>
                    )}
                    <View style={[s.gIconCircle, sel && { backgroundColor: PRIMARY + '22', borderColor: PRIMARY }]}>
                      <Ionicons name={g.icon} size={36} color={sel ? PRIMARY : TEXT_DIM} />
                    </View>
                    <Text style={[s.gLabel, sel && { color: TEXT }]}>{g.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </Animated.View>

      <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          onPress={goNext}
          disabled={!canContinue}
          activeOpacity={0.85}
          style={[s.cta, !canContinue && { opacity: 0.38 }]}
        >
          <Text style={s.ctaTxt}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 34, fontWeight: '900', color: TEXT,
    lineHeight: 42, marginBottom: 10, letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15, color: TEXT_DIM, lineHeight: 22,
    marginBottom: 32,
  },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(0,184,255,0.25)',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  input: {
    flex: 1, color: TEXT,
    fontSize: 18, fontWeight: '700',
  },
  checkDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
  },

  genderRow: { flexDirection: 'row', gap: 14 },
  gCard: {
    flex: 1, alignItems: 'center',
    paddingVertical: 28, paddingHorizontal: 12,
    backgroundColor: SURFACE,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: 'rgba(232,241,255,0.12)',
    position: 'relative',
  },
  gCardActive: {
    borderColor: PRIMARY,
    backgroundColor: CARD,
    shadowColor: PRIMARY, shadowOpacity: 0.35,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  gCheck: {
    position: 'absolute', top: 12, right: 12,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  gIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(232,241,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(232,241,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  gLabel: { fontSize: 16, fontWeight: '800', color: TEXT_DIM },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY, shadowOpacity: 0.5,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  ctaTxt: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.2 },
});
