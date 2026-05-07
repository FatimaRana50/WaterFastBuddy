import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Easing, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

const BLUE      = '#1B8CFF';
const CYAN      = '#21C7FF';
const NAVY      = '#0B5DD1';
const NAVY_DEEP = '#082C6B';

/* ── Floating particle ─────────────────────────────────────────── */
function Particle({ x, size, delay }: { x: number; size: number; delay: number }) {
  const y  = useRef(new Animated.Value(700)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: 40,  duration: 4000, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.5, duration: 600,  useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: 3400, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(y,  { toValue: 700, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: 'rgba(255,255,255,0.55)',
        opacity: op, transform: [{ translateY: y }],
      }}
    />
  );
}

/* ── Male silhouette SVG ───────────────────────────────────────── */
function MaleSVG({ active }: { active: boolean }) {
  const fill = active ? '#fff' : 'rgba(255,255,255,0.55)';
  return (
    <Svg width={52} height={80} viewBox="0 0 52 80">
      <Defs>
        <SvgGrad id="m" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={active ? CYAN : 'rgba(255,255,255,0.6)'} />
          <Stop offset="100%" stopColor={active ? BLUE : 'rgba(255,255,255,0.3)'} />
        </SvgGrad>
      </Defs>
      {/* Head */}
      <Circle cx={26} cy={11} r={9} fill="url(#m)" />
      {/* Shoulders + torso (broader) */}
      <Path
        d="M 10 26 Q 8 32 8 44 L 10 62 Q 10 68 17 68 L 17 76 Q 17 80 22 80 L 24 80 Q 26 70 26 60 Q 26 70 28 80 L 30 80 Q 35 80 35 76 L 35 68 Q 42 68 42 62 L 44 44 Q 44 32 42 26 Q 36 22 26 22 Q 16 22 10 26 Z"
        fill="url(#m)"
      />
    </Svg>
  );
}

/* ── Female silhouette SVG ─────────────────────────────────────── */
function FemaleSVG({ active }: { active: boolean }) {
  return (
    <Svg width={52} height={80} viewBox="0 0 52 80">
      <Defs>
        <SvgGrad id="f" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={active ? CYAN : 'rgba(255,255,255,0.6)'} />
          <Stop offset="100%" stopColor={active ? BLUE : 'rgba(255,255,255,0.3)'} />
        </SvgGrad>
      </Defs>
      {/* Head */}
      <Circle cx={26} cy={11} r={9} fill="url(#f)" />
      {/* Body — narrower waist, wider hips */}
      <Path
        d="M 14 26 Q 10 32 12 40 Q 8 48 8 58 Q 8 68 16 68 L 16 76 Q 16 80 21 80 L 24 80 Q 26 70 26 62 Q 26 70 28 80 L 31 80 Q 36 80 36 76 L 36 68 Q 44 68 44 58 Q 44 48 40 40 Q 42 32 38 26 Q 32 22 26 22 Q 20 22 14 26 Z"
        fill="url(#f)"
      />
    </Svg>
  );
}

/* ── Gender card ───────────────────────────────────────────────── */
function GenderCard({
  type, label, desc, selected, onPress,
}: {
  type: 'male' | 'female';
  label: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1,    useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity
        style={[s.gCard, selected && s.gCardActive]}
        onPress={handlePress}
        activeOpacity={1}
      >
        {selected && (
          <View style={s.gCheckBadge}>
            <Ionicons name="checkmark" size={11} color="#fff" />
          </View>
        )}
        <View style={s.gIconWrap}>
          {type === 'male' ? <MaleSVG active={selected} /> : <FemaleSVG active={selected} />}
        </View>
        <Text style={[s.gLabel, selected && s.gLabelActive]}>{label}</Text>
        <Text style={s.gDesc}>{desc}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ── Screen ────────────────────────────────────────────────────── */
export default function ProfileSetupName() {
  const [name,   setName]   = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const navigation = useNavigation<any>();
  const insets     = useSafeAreaInsets();
  useLanguage();

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const canProceed = name.trim().length > 0 && gender !== null;

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background */}
      <LinearGradient
        colors={[NAVY_DEEP, NAVY, BLUE]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      {/* Particles */}
      {[0.1, 0.28, 0.5, 0.68, 0.85].map((xPct, i) => (
        <Particle key={i} x={xPct * 375} size={5 + (i % 3) * 4} delay={i * 700} />
      ))}

      {/* Step indicator */}
      <View style={[s.dotsRow, { marginTop: insets.top + 18 }]}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              s.dot,
              i === 1 && s.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.View
        style={[s.content, { opacity: fade, transform: [{ translateY: slide }] }]}
      >
        <Text style={s.eyebrow}>STEP 1 OF 3</Text>
        <Text style={s.title}>Let's get{'\n'}to know you.</Text>
        <Text style={s.subtitle}>
          We'll build your personal fasting plan around your body and goals.
        </Text>

        {/* Name input */}
        <View style={s.inputBlock}>
          <Text style={s.fieldLabel}>Your first name</Text>
          <View style={s.inputWrap}>
            <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.5)" style={{ marginRight: 10 }} />
            <TextInput
              style={s.input}
              placeholder="e.g. Alex"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              autoCapitalize="words"
            />
            {name.trim().length > 0 && (
              <View style={s.checkDot}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>
        </View>

        {/* Gender */}
        <Text style={s.fieldLabel}>I identify as</Text>
        <View style={s.gRow}>
          <GenderCard
            type="male"
            label={i18n.t('onboarding.setup.male')}
            desc="His journey"
            selected={gender === 'male'}
            onPress={() => setGender('male')}
          />
          <GenderCard
            type="female"
            label={i18n.t('onboarding.setup.female')}
            desc="Her journey"
            selected={gender === 'female'}
            onPress={() => setGender('female')}
          />
        </View>
      </Animated.View>

      {/* Footer CTA */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <LinearGradient
          colors={['rgba(8,30,80,0)', 'rgba(8,44,107,0.92)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <TouchableOpacity
          disabled={!canProceed}
          onPress={() => navigation.navigate('ProfileSetupBody', { name: name.trim(), gender })}
          activeOpacity={0.85}
          style={{ opacity: canProceed ? 1 : 0.38 }}
        >
          <LinearGradient
            colors={[CYAN, BLUE]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.cta}
          >
            <Text style={s.ctaText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ── Styles ────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1 },

  dotsRow: {
    flexDirection: 'row', gap: 8,
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  dot:       { width: 30, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)' },
  dotActive: { backgroundColor: '#fff' },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },

  eyebrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 44,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },

  // Name input
  inputBlock: { marginBottom: SPACING.xl },
  fieldLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  checkDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
  },

  // Gender cards
  gRow: { flexDirection: 'row', gap: SPACING.md },
  gCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    position: 'relative',
  },
  gCardActive: {
    backgroundColor: 'rgba(27,140,255,0.22)',
    borderColor: BLUE,
    shadowColor: BLUE,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  gCheckBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },
  gIconWrap:   { marginBottom: 10 },
  gLabel:      { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZE.md, fontWeight: '800' },
  gLabelActive:{ color: '#fff' },
  gDesc:       { color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 4, fontWeight: '600' },

  // Footer
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: BORDER_RADIUS.round,
  },
  ctaText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '800' },
});
