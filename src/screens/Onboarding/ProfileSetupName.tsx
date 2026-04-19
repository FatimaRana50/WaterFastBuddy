import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function ProfileSetupName() {
  const [name,   setName]   = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const navigation = useNavigation<any>();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const canProceed = name.trim().length > 0 && gender !== null;

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#0F172A', '#1D4ED8', '#06B6D4']} style={StyleSheet.absoluteFill} />

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[1,2,3].map(i => (
          <View key={i} style={[styles.stepDot, i === 1 && styles.stepDotActive]} />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideY }] }]}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.title}>What's your{'\n'}name?</Text>
        <Text style={styles.subtitle}>We'll personalise your experience just for you.</Text>

        {/* Name input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex Johnson"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />
          {name.length > 0 && (
            <View style={styles.inputCheck}>
              <Text style={{ color: '#10B981', fontSize: 16 }}>✓</Text>
            </View>
          )}
        </View>

        {/* Gender */}
        <Text style={styles.inputLabel}>I am a...</Text>
        <View style={styles.genderRow}>
          {([
            { key: 'male',   emoji: '🧑', label: 'Male',   desc: 'His journey' },
            { key: 'female', emoji: '👩', label: 'Female', desc: 'Her journey' },
          ] as const).map((g) => (
            <TouchableOpacity
              key={g.key}
              style={[styles.genderCard, gender === g.key && styles.genderCardActive]}
              onPress={() => setGender(g.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.genderEmoji}>{g.emoji}</Text>
              <Text style={[styles.genderLabel, gender === g.key && styles.genderLabelActive]}>{g.label}</Text>
              <Text style={styles.genderDesc}>{g.desc}</Text>
              {gender === g.key && (
                <View style={styles.checkBadge}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!canProceed}
          onPress={() => navigation.navigate('ProfileSetupBody', { name, gender })}
          activeOpacity={0.85}
          style={{ opacity: canProceed ? 1 : 0.4 }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stepRow: {
    flexDirection: 'row', gap: 8, alignSelf: 'center',
    marginTop: 60, marginBottom: SPACING.lg,
  },
  stepDot:       { width: 28, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepDotActive: { backgroundColor: '#fff' },

  content: { flex: 1, paddingHorizontal: SPACING.xl },
  stepLabel: { color: 'rgba(255,255,255,0.55)', fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 6 },
  title:    { fontSize: 34, fontWeight: '900', color: '#fff', lineHeight: 42, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.65)', marginBottom: SPACING.xl, lineHeight: 22 },

  inputLabel:  { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: SPACING.sm },
  inputWrapper: { marginBottom: SPACING.xl, position: 'relative' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.md, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: SPACING.md, fontSize: FONT_SIZE.lg,
    color: '#fff',
  },
  inputCheck: {
    position: 'absolute', right: SPACING.md,
    top: 0, bottom: 0, justifyContent: 'center',
  },

  genderRow: { flexDirection: 'row', gap: SPACING.md },
  genderCard: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)', position: 'relative',
  },
  genderCardActive: {
    backgroundColor: 'rgba(59,130,246,0.3)',
    borderColor: COLORS.primary,
  },
  genderEmoji: { fontSize: 44, marginBottom: 8 },
  genderLabel: { fontSize: FONT_SIZE.md, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  genderLabelActive: { color: '#fff' },
  genderDesc:  { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  footer: { paddingHorizontal: SPACING.xl, paddingBottom: 44 },
  continueBtn: {
    borderRadius: BORDER_RADIUS.round,
    paddingVertical: 18, alignItems: 'center',
  },
  continueBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '800' },
});
