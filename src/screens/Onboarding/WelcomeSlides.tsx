/**
 * WelcomeSlides — v3.1 "Aurora+" Edition
 * ─────────────────────────────────────────────────────────────
 * Same premium aurora onboarding, now with nuanced secondary accents
 * (violet, amber/gold, soft magenta) layered into a still-blue identity.
 *
 * Changes vs v3:
 *  • Aurora background blobs now mix primary / violet / soft magenta
 *  • Each hero has its own emotional color temperature
 *  • Cards, chips, rails, progress, and CTA use tasteful accent variation
 *  • Blue/cyan remains dominant; backgrounds stay deep navy
 *  • No copy, layout, spacing, or interaction changes
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  Dimensions, FlatList, Linking, NativeSyntheticEvent,
  NativeScrollEvent, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Path, Circle, Defs, LinearGradient as SvgGrad, RadialGradient as SvgRad,
  Stop, Line, Polygon,
} from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

/* ── THEME ─────────────────────────────────────────────────── */
const C = {
  // Primary blue identity (unchanged)
  primary:     '#00B8FF',
  glow:        '#3DEBFF',
  deep:        '#0F6FB3',
  accent:      '#00E5FF',

  // Secondary accents — used sparingly for depth & warmth
  violet:      '#8B7CF6',   // indigo/violet for autophagy, depth, mystery
  violetSoft:  '#A78BFA',
  gold:        '#F5B544',   // amber for achievement, transformation, warmth
  goldSoft:    '#FCD34D',
  magenta:     '#F472B6',   // soft pink for emotion / heart / trust
  magentaSoft: '#FBA8D4',
  mint:        '#5EEAD4',   // very occasional teal-mint for vitality

  // Backgrounds (stay deep navy)
  bg0:         '#03101F',
  bg1:         '#061A33',
  bg2:         '#0A2B52',

  text:        '#EAF6FF',
  textDim:     '#8FB4D6',
  textMute:    '#5A7FA1',
  glass:       'rgba(255,255,255,0.06)',
  glassBd:     'rgba(125,220,255,0.18)',
  glassHi:     'rgba(125,220,255,0.35)',
  glassWarm:   'rgba(245,181,68,0.22)',
  glassViolet: 'rgba(139,124,246,0.22)',
};

/* ═════════════════════════════════════════════════════════════
   HERO 1 — IDENTITY: Orbital droplet  (cool blue + a hint of violet)
   ═════════════════════════════════════════════════════════════ */
function HeroIdentity() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spin, {
      toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true,
    })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateRev = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  const S = 280;
  return (
    <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
      {/* Halo — primary blue (kept) */}
      <Animated.View style={{
        position: 'absolute', width: S * 0.7, height: S * 0.7, borderRadius: S,
        backgroundColor: C.primary, opacity: pulseOpacity, transform: [{ scale: pulseScale }],
      }} />
      {/* Subtle violet outer halo for depth */}
      <Animated.View style={{
        position: 'absolute', width: S * 0.85, height: S * 0.85, borderRadius: S,
        backgroundColor: C.violet, opacity: 0.08,
      }} />
      <Animated.View style={{ position: 'absolute', transform: [{ rotate }] }}>
        <Svg width={S} height={S} viewBox="0 0 280 280">
          <Defs>
            <SvgGrad id="ring1" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={C.glow} stopOpacity={0.9} />
              <Stop offset="60%" stopColor={C.violet} stopOpacity={0.5} />
              <Stop offset="100%" stopColor={C.primary} stopOpacity={0.1} />
            </SvgGrad>
          </Defs>
          <Circle cx="140" cy="140" r="130" stroke="url(#ring1)" strokeWidth="1.5" fill="none" strokeDasharray="2 8" />
          {[0, 60, 120, 180, 240, 300].map((a, i) => {
            const r = 130;
            const x = 140 + r * Math.cos((a * Math.PI) / 180);
            const y = 140 + r * Math.sin((a * Math.PI) / 180);
            // one of six dots tinted violet for subtle variation
            const fill = i === 2 ? C.violetSoft : i === 5 ? C.goldSoft : C.glow;
            return <Circle key={a} cx={x} cy={y} r="3" fill={fill} />;
          })}
        </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', transform: [{ rotate: rotateRev }] }}>
        <Svg width={S * 0.75} height={S * 0.75} viewBox="0 0 210 210">
          <Circle cx="105" cy="105" r="95" stroke={C.accent} strokeOpacity={0.3} strokeWidth="1" fill="none" strokeDasharray="6 6" />
          <Circle cx="200" cy="105" r="5" fill={C.accent} />
          <Circle cx="10"  cy="105" r="3" fill={C.violetSoft} opacity={0.85} />
        </Svg>
      </Animated.View>
      <Svg width={120} height={150} viewBox="0 0 120 150">
        <Defs>
          <SvgGrad id="dropG" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.glow} />
            <Stop offset="55%" stopColor={C.primary} />
            <Stop offset="100%" stopColor={C.deep} />
          </SvgGrad>
          <SvgRad id="dropShine" cx="40%" cy="35%" r="40%">
            <Stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
            <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </SvgRad>
        </Defs>
        <Path
          d="M60 5 C 60 5, 110 70, 110 100 A 50 50 0 0 1 10 100 C 10 70, 60 5, 60 5 Z"
          fill="url(#dropG)"
        />
        <Path
          d="M60 5 C 60 5, 110 70, 110 100 A 50 50 0 0 1 10 100 C 10 70, 60 5, 60 5 Z"
          fill="url(#dropShine)"
        />
        <Path d="M40 40 Q 30 70 38 95" stroke="#fff" strokeOpacity={0.55} strokeWidth="4" strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  );
}

/* ═════════════════════════════════════════════════════════════
   HERO 2 — SCIENCE: Metabolic timeline (blue → violet → gold)
   ═════════════════════════════════════════════════════════════ */
function HeroScience() {
  const fill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(fill, { toValue: 1, duration: 4500, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.delay(800),
      Animated.timing(fill, { toValue: 0, duration: 0, useNativeDriver: false }),
    ])).start();
  }, []);

  const stages = [
    { t: '0h',  l: 'Fed',        c: C.textDim },
    { t: '12h', l: 'Glycogen',   c: C.glow },
    { t: '18h', l: 'Ketosis',    c: C.primary },
    { t: '24h', l: 'Autophagy',  c: C.violetSoft },
    { t: '48h', l: 'HGH +500%',  c: C.goldSoft },
  ];

  const railWidth = 260;
  const railFill = fill.interpolate({ inputRange: [0, 1], outputRange: [0, railWidth] });

  return (
    <View style={{ width: 280, alignItems: 'center' }}>
      <View style={s2.card}>
        {/* warm gold corner accent for "achievement" */}
        <View style={s2.cornerAccent} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s2.pulseDot} />
          <Text style={s2.cardLabel}>LIVE METABOLIC STATE</Text>
        </View>
        <Text style={s2.cardValue}>Autophagy</Text>
        <Text style={s2.cardSub}>Cellular cleanup engaged · 24h+</Text>
      </View>

      <View style={{ width: railWidth, marginTop: 22 }}>
        <View style={s2.rail}>
          <Animated.View style={{ width: railFill, height: '100%' }}>
            <LinearGradient
              colors={[C.glow, C.primary, C.violet, C.gold]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ flex: 1, borderRadius: 4 }}
            />
          </Animated.View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {stages.map(st => (
            <View key={st.t} style={{ alignItems: 'center', width: 44 }}>
              <View style={[s2.tick, { backgroundColor: st.c }]} />
              <Text style={s2.tickT}>{st.t}</Text>
              <Text style={[s2.tickL, { color: st.c }]} numberOfLines={1}>{st.l}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
const s2 = StyleSheet.create({
  card: {
    width: 260, padding: 18, borderRadius: 22,
    backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBd,
    overflow: 'hidden',
  },
  cornerAccent: {
    position: 'absolute', top: -30, right: -30,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.gold, opacity: 0.18,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  cardLabel: { color: C.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  cardValue: { color: C.text, fontSize: 30, fontWeight: '900', marginTop: 8, letterSpacing: -0.5 },
  cardSub: { color: C.textDim, fontSize: 12, marginTop: 4 },
  rail: { width: '100%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  tick: { width: 6, height: 6, borderRadius: 3 },
  tickT: { color: C.text, fontSize: 10, fontWeight: '800', marginTop: 6 },
  tickL: { fontSize: 8, fontWeight: '700', marginTop: 2, letterSpacing: 0.3 },
});

/* ═════════════════════════════════════════════════════════════
   HERO 3 — TRANSFORMATION: Stat orbits (warm gold-led, blue base)
   ═════════════════════════════════════════════════════════════ */
function HeroTransform() {
  const stats = [
    { v: '−7.2', u: 'kg', l: 'avg 30 days', x: -90, y: -60, accent: C.gold },
    { v: '+38%', u: '',   l: 'energy',      x:  90, y: -40, accent: C.goldSoft },
    { v: '12h',  u: '',   l: 'deep sleep',  x: -80, y:  70, accent: C.violetSoft },
    { v: '0',    u: '',   l: 'cravings',    x:  85, y:  80, accent: C.glow },
  ];
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 2400, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2400, useNativeDriver: true }),
    ])).start();
  }, []);
  const lift = float.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });

  return (
    <View style={{ width: 280, height: 280, alignItems: 'center', justifyContent: 'center' }}>
      <View style={s3.center}>
        <LinearGradient colors={[C.primary, C.deep]} style={s3.centerGrad}>
          <Ionicons name="person" size={48} color={C.text} />
        </LinearGradient>
        {/* warm achievement ring */}
        <View style={s3.achievementRing} />
        <Text style={s3.centerLabel}>NEW YOU</Text>
      </View>
      {stats.map((st, i) => (
        <Animated.View key={i} style={[s3.chip, {
          left: 140 + st.x - 50,
          top:  140 + st.y - 28,
          borderColor: `${st.accent}55`,
          backgroundColor: `${st.accent}14`,
          transform: [{ translateY: i % 2 === 0 ? lift : Animated.multiply(lift, -1) }],
        }]}>
          <Text style={[s3.chipV, { color: st.accent === C.glow ? C.text : st.accent }]}>
            {st.v}<Text style={s3.chipU}>{st.u}</Text>
          </Text>
          <Text style={s3.chipL}>{st.l}</Text>
        </Animated.View>
      ))}
    </View>
  );
}
const s3 = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  centerGrad: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.glassHi,
  },
  achievementRing: {
    position: 'absolute', width: 124, height: 124, borderRadius: 62,
    borderWidth: 1, borderColor: C.gold, opacity: 0.35,
  },
  centerLabel: { color: C.goldSoft, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  chip: {
    position: 'absolute', width: 100,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipV: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  chipU: { fontSize: 11, fontWeight: '700', color: C.textDim },
  chipL: { color: C.textDim, fontSize: 9, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
});

/* ═════════════════════════════════════════════════════════════
   HERO 4 — TRUST: Shield (blue base + warm magenta + gold stars)
   ═════════════════════════════════════════════════════════════ */
function HeroTrust() {
  return (
    <View style={{ width: 280, alignItems: 'center' }}>
      <View style={s4.shieldWrap}>
        <Svg width={140} height={160} viewBox="0 0 140 160">
          <Defs>
            <SvgGrad id="shieldG" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={C.glow} />
              <Stop offset="70%" stopColor={C.primary} />
              <Stop offset="100%" stopColor={C.violet} stopOpacity={0.85} />
            </SvgGrad>
          </Defs>
          <Path
            d="M70 4 L130 26 L130 80 C130 120, 100 145, 70 156 C40 145, 10 120, 10 80 L10 26 Z"
            fill="url(#shieldG)" opacity={0.95}
          />
          <Path d="M45 80 L65 100 L100 60" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
        <View style={[s4.badge, { top: 0, left: -8, borderColor: C.glassBd }]}>
          <Ionicons name="medkit" size={14} color={C.glow} />
        </View>
        <View style={[s4.badge, { top: 40, right: -12, borderColor: 'rgba(245,181,68,0.4)' }]}>
          <Ionicons name="shield-checkmark" size={14} color={C.goldSoft} />
        </View>
        <View style={[s4.badge, { bottom: 20, left: -14, borderColor: 'rgba(244,114,182,0.45)' }]}>
          <Ionicons name="heart" size={14} color={C.magenta} />
        </View>
      </View>
      <View style={s4.statsRow}>
        <View style={s4.stat}>
          <Text style={[s4.statV, { color: C.goldSoft }]}>4.9</Text>
          <View style={{ flexDirection: 'row', gap: 1 }}>
            {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={9} color={C.goldSoft} />)}
          </View>
        </View>
        <View style={s4.divider} />
        <View style={s4.stat}>
          <Text style={s4.statV}>120k+</Text>
          <Text style={s4.statL}>fasters</Text>
        </View>
        <View style={s4.divider} />
        <View style={s4.stat}>
          <Text style={[s4.statV, { color: C.magentaSoft }]}>MD</Text>
          <Text style={s4.statL}>reviewed</Text>
        </View>
      </View>
    </View>
  );
}
const s4 = StyleSheet.create({
  shieldWrap: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.bg1, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: {
    marginTop: 22, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.glass, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 18,
    borderWidth: 1, borderColor: C.glassBd, gap: 14,
  },
  stat: { alignItems: 'center', minWidth: 56 },
  statV: { color: C.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  statL: { color: C.textDim, fontSize: 9, fontWeight: '700', marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  divider: { width: 1, height: 24, backgroundColor: C.glassBd },
});

/* ═════════════════════════════════════════════════════════════
   HERO 5 — SUMMIT: Mountain (golden sunrise over blue ranges)
   ═════════════════════════════════════════════════════════════ */
function HeroSummit() {
  const beam = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(beam, { toValue: 1, duration: 2200, useNativeDriver: true }),
      Animated.timing(beam, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);
  const beamY = beam.interpolate({ inputRange: [0, 1], outputRange: [60, -40] });
  const beamO = beam.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <View style={{ width: 280, height: 260, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 4, height: 80, borderRadius: 2,
        backgroundColor: C.goldSoft, opacity: beamO, transform: [{ translateY: beamY }],
      }} />
      <Svg width={260} height={220} viewBox="0 0 260 220">
        <Defs>
          <SvgGrad id="mtn" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.glow} />
            <Stop offset="100%" stopColor={C.deep} stopOpacity={0.4} />
          </SvgGrad>
          <SvgGrad id="mtn2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.violet} stopOpacity={0.85} />
            <Stop offset="100%" stopColor={C.bg2} stopOpacity={0.2} />
          </SvgGrad>
          <SvgRad id="sunG" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={C.goldSoft} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={C.gold} stopOpacity={0} />
          </SvgRad>
        </Defs>
        {/* Sun — warm gold for emotional arrival */}
        <Circle cx="130" cy="80" r="44" fill="url(#sunG)" />
        <Circle cx="130" cy="80" r="20" fill={C.goldSoft} opacity={0.85} />
        {/* Back range — violet for atmospheric depth */}
        <Polygon points="0,200 70,90 130,160 190,70 260,200" fill="url(#mtn2)" opacity={0.55} />
        {/* Front mountain — blue, dominant */}
        <Polygon points="20,210 130,40 240,210" fill="url(#mtn)" />
        <Path d="M130 40 L150 70 L140 75 L125 65 L115 75 L110 70 Z" fill="#fff" opacity={0.95} />
        <Line x1="130" y1="40" x2="130" y2="20" stroke={C.text} strokeWidth="2" />
        <Polygon points="130,20 148,26 130,32" fill={C.gold} />
      </Svg>
    </View>
  );
}

/* ═════════════════════════════════════════════════════════════
   AMBIENT BACKGROUND — multi-accent aurora
   ═════════════════════════════════════════════════════════════ */
function AuroraBackground() {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(drift, {
      toValue: 1, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
    })).start();
  }, []);
  const tx = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-30, 30, -30] });

  const stars = useMemo(
    () => Array.from({ length: 32 }).map((_, i) => ({
      x: Math.random() * W, y: Math.random() * H * 0.7,
      r: Math.random() * 1.4 + 0.4, o: Math.random() * 0.6 + 0.2,
      color:
        i % 9 === 0 ? C.violetSoft :
        i % 11 === 0 ? C.goldSoft :
        i % 13 === 0 ? C.magentaSoft :
        '#fff',
    })),
    [],
  );

  return (
    <>
      <LinearGradient
        colors={[C.bg0, C.bg1, C.bg2]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      />
      {/* Primary cyan blob — dominant */}
      <Animated.View style={{
        position: 'absolute', top: -120, left: -80,
        width: W * 0.9, height: W * 0.9, borderRadius: W,
        backgroundColor: C.primary, opacity: 0.16,
        transform: [{ translateX: tx }],
      }} />
      {/* Violet aurora — emotional depth */}
      <Animated.View style={{
        position: 'absolute', top: H * 0.12, right: -100,
        width: W * 0.85, height: W * 0.85, borderRadius: W,
        backgroundColor: C.violet, opacity: 0.13,
        transform: [{ translateX: Animated.multiply(tx, -1) }],
      }} />
      {/* Gold warm glow — bottom-left, low opacity */}
      <Animated.View style={{
        position: 'absolute', bottom: -60, left: -40,
        width: W * 0.7, height: W * 0.7, borderRadius: W,
        backgroundColor: C.gold, opacity: 0.07,
        transform: [{ translateX: tx }],
      }} />
      {/* Soft magenta whisper — bottom-right */}
      <Animated.View style={{
        position: 'absolute', bottom: -100, right: -60,
        width: W * 0.65, height: W * 0.65, borderRadius: W,
        backgroundColor: C.magenta, opacity: 0.06,
        transform: [{ translateX: Animated.multiply(tx, -0.6) }],
      }} />
      {/* Accent cyan — keeps blue dominant */}
      <Animated.View style={{
        position: 'absolute', top: H * 0.35, left: W * 0.2,
        width: W * 0.5, height: W * 0.5, borderRadius: W,
        backgroundColor: C.accent, opacity: 0.08,
        transform: [{ translateX: Animated.multiply(tx, 0.4) }],
      }} />
      <Svg style={StyleSheet.absoluteFill} width={W} height={H} pointerEvents="none">
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color} opacity={s.o} />
        ))}
      </Svg>
    </>
  );
}

/* ═════════════════════════════════════════════════════════════
   SLIDE DATA  (per-slide accent color drives small UI cues)
   ═════════════════════════════════════════════════════════════ */
type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  body: string;
  Hero: React.FC;
  accent: string;       // per-slide accent (small touches only)
  bullets?: { icon: keyof typeof Ionicons.glyphMap; text: string }[];
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    eyebrow: 'WELCOME',
    title: 'Welcome to',
    highlight: 'WaterFastBuddy.',
    body: 'Your all-in-one solution for safe, guided water fasting.',
    Hero: HeroIdentity,
    accent: C.glow,
  },
  {
    key: 'track',
    eyebrow: 'STAY INFORMED',
    title: 'Track every hour',
    highlight: 'of your fast.',
    body: 'Notifications show you exactly how far along you are. Track your progress, and learn what happens inside your body during each hour of water fasting.',
    Hero: HeroScience,
    accent: C.violetSoft,
  },
  {
    key: 'coach',
    eyebrow: "YOU'RE NEVER ALONE",
    title: '1-on-1 with Krish,',
    highlight: 'your fasting coach.',
    body: 'Book a video call with Krish directly in the app — the person who created WaterFastBuddy and lost 35KG in 6 months purely from water fasting.',
    Hero: HeroTrust,
    accent: C.magentaSoft,
    bullets: [
      { icon: 'person-circle-outline', text: 'A real person, not a call centre' },
      { icon: 'trophy-outline',        text: '35KG lost in 6 months' },
      { icon: 'calendar-outline',      text: 'Book directly in the app' },
    ],
  },
  {
    key: 'benefits',
    eyebrow: 'YOUR HEALTH',
    title: 'Ready to transform',
    highlight: 'your health?',
    body: 'Lose weight. Reduce your chances of diabetes, cancer, and Alzheimer\'s. Lower blood pressure, reverse fatty liver, and see your skin glow.',
    Hero: HeroTransform,
    accent: C.goldSoft,
  },
  {
    key: 'reset',
    eyebrow: 'THE RESET',
    title: 'Feel the benefits from',
    highlight: 'your first 72 hours.',
    body: 'Less bloating, improved sleep, increased libido — think of water fasting as a complete reset for your body. This app will help you achieve ALL of that and more.',
    Hero: HeroSummit,
    accent: C.gold,
  },
  {
    key: 'everyone',
    eyebrow: 'FOR EVERYONE',
    title: 'Safe for everyone,',
    highlight: 'everywhere.',
    body: 'No matter your age, sex, or location — water fasting can be safely practised by all. This app will keep you safe and educated throughout your journey.',
    Hero: HeroIdentity,
    accent: C.glow,
    bullets: [
      { icon: 'globe-outline',         text: 'Available no matter where you are' },
      { icon: 'shield-checkmark',      text: 'Safe & guided at every stage' },
      { icon: 'book-outline',          text: 'Fully educated throughout' },
    ],
  },
];

/* ═════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════════════════════════ */
export default function WelcomeSlides() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [active, setActive] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const onMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== active) setActive(idx);
  }, [active]);

  const goTo = (i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    setActive(i);
  };

  const onPrimary = () => {
    if (active < SLIDES.length - 1) goTo(active + 1);
    else navigation.navigate('ProfileSetupName');
  };

  const onSkip = () => navigation.navigate('ProfileSetupName');

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * W, index * W, (index + 1) * W];
    const translateY = scrollX.interpolate({ inputRange, outputRange: [40, 0, 40], extrapolate: 'clamp' });
    const opacity    = scrollX.interpolate({ inputRange, outputRange: [0,  1, 0 ], extrapolate: 'clamp' });
    const scale      = scrollX.interpolate({ inputRange, outputRange: [0.85, 1, 0.85], extrapolate: 'clamp' });

    const Hero = item.Hero;
    return (
      <View style={{ width: W, paddingHorizontal: 28 }}>
        <Animated.View style={{
          marginTop: insets.top + 70,
          height: 300,
          alignItems: 'center', justifyContent: 'center',
          transform: [{ scale }],
          opacity,
        }}>
          <Hero />
        </Animated.View>

        <Animated.View style={{ marginTop: 36, transform: [{ translateY }], opacity }}>
          <Text style={[st.eyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
          <Text style={st.title}>
            {item.title}{'\n'}
            <Text style={[st.titleHi, { color: item.accent }]}>{item.highlight}</Text>
          </Text>
          <Text style={st.body}>{item.body}</Text>

          {item.bullets && (
            <View style={{ marginTop: 18, gap: 10 }}>
              {item.bullets.map((b, i) => {
                // gentle accent rotation across bullets, anchored to slide accent
                const tint = i === 0 ? item.accent : i === 1 ? C.glow : C.violetSoft;
                return (
                  <View key={b.text} style={st.bulletRow}>
                    <View style={[st.bulletIcon, {
                      backgroundColor: `${tint}1F`,
                      borderColor: `${tint}55`,
                    }]}>
                      <Ionicons name={b.icon} size={14} color={tint} />
                    </View>
                    <Text style={st.bulletTxt}>{b.text}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  const isLast = active === SLIDES.length - 1;
  const activeAccent = SLIDES[active].accent;

  return (
    <View style={st.root}>
      <AuroraBackground />

      <View style={[st.topBar, { paddingTop: insets.top + 14 }]}>
        <View style={st.brand}>
          <View style={st.brandDot}>
            <Ionicons name="water" size={14} color={C.text} />
          </View>
          <Text style={st.brandTxt}>WaterFastBuddy</Text>
        </View>
        {!isLast && (
          <Pressable hitSlop={12} onPress={onSkip}>
            <Text style={st.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Progress — each completed segment carries its slide's accent */}
      <View style={[st.progress, { top: insets.top + 56 }]}>
        {SLIDES.map((slide, i) => {
          const isActive = i === active;
          const isDone = i < active;
          const segColor = isActive ? activeAccent : isDone ? slide.accent : C.glow;
          return (
            <View key={i} style={st.segWrap}>
              <View style={st.seg}>
                <Animated.View style={[st.segFill, {
                  width: isDone ? '100%' : isActive ? '100%' : '0%',
                  opacity: isActive || isDone ? 1 : 0.2,
                  backgroundColor: segColor,
                }]} />
              </View>
            </View>
          );
        })}
      </View>

      <Animated.FlatList
        ref={flatRef as any}
        data={SLIDES}
        keyExtractor={i => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        renderItem={renderSlide}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        style={{ flex: 1 }}
      />

      <View style={[st.dock, { paddingBottom: insets.bottom + 18 }]}>
        <LinearGradient
          colors={['rgba(3,16,31,0)', 'rgba(3,16,31,0.85)', C.bg0]}
          style={StyleSheet.absoluteFill}
        />
        <View style={st.dots}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={10}>
              <View style={[
                st.dot,
                i === active && [st.dotActive, { backgroundColor: activeAccent, shadowColor: activeAccent }],
              ]} />
            </Pressable>
          ))}
        </View>

        {/* CTA — blue stays dominant; final slide gets a warm gold finish */}
        <Pressable onPress={onPrimary} style={({ pressed }) => [
          st.cta, pressed && { transform: [{ scale: 0.98 }] },
        ]}>
          <LinearGradient
            colors={
              isLast
                ? [C.glow, C.primary, C.gold]
                : [C.glow, C.primary, C.violet]
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={st.ctaGrad}
          >
            <Text style={st.ctaTxt}>
              {isLast ? "Let's get started" : 'Continue'}
            </Text>
            <View style={st.ctaArrow}>
              <Ionicons
                name={isLast ? 'rocket' : 'arrow-forward'}
                size={16}
                color={C.bg0}
              />
            </View>
          </LinearGradient>
        </Pressable>

        {isLast && (
          <Pressable onPress={() => Linking.openURL('https://waterfastbuddy.com/benefits')}>
            <Text style={st.secondary}>For full benefits and cautions, visit waterfastbuddy.com/benefits  ›</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ── STYLES ─────────────────────────────────────────────────── */
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg0 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 24, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.glow, shadowOpacity: 0.8, shadowRadius: 10,
  },
  brandTxt: { color: C.text, fontWeight: '900', fontSize: 14, letterSpacing: 0.3 },
  skip: { color: C.textDim, fontWeight: '700', fontSize: 13 },

  progress: {
    position: 'absolute', left: 24, right: 24,
    flexDirection: 'row', gap: 6, zIndex: 10,
  },
  segWrap: { flex: 1 },
  seg: {
    height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden',
  },
  segFill: { height: '100%', borderRadius: 2 },

  eyebrow: {
    fontSize: 11, fontWeight: '900',
    letterSpacing: 2.2, marginBottom: 12,
  },
  title: {
    color: C.text, fontSize: 28, fontWeight: '900',
    lineHeight: 34, letterSpacing: -0.6,
  },
  titleHi: {},
  body: {
    color: C.textDim, fontSize: 14.5, lineHeight: 22,
    marginTop: 14, fontWeight: '500',
  },

  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletIcon: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  bulletTxt: { color: C.text, fontSize: 13, fontWeight: '600' },

  dock: {
    paddingHorizontal: 24, paddingTop: 20,
    alignItems: 'center', gap: 14,
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 22,
    shadowOpacity: 0.9, shadowRadius: 6,
  },

  cta: {
    width: '100%', borderRadius: 999, overflow: 'hidden',
    shadowColor: C.primary, shadowOpacity: 0.55,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, paddingHorizontal: 22, gap: 10,
  },
  ctaTxt: {
    color: C.bg0, fontSize: 16, fontWeight: '900', letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(3,16,31,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  secondary: {
    color: C.textDim, fontSize: 13, fontWeight: '600',
    textAlign: 'center', marginTop: 2,
  },
});
