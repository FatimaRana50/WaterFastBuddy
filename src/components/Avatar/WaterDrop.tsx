/**
 * WaterDrop — kawaii animated water drop for compact contexts (active fast
 * screen, list rows, badges).
 *
 * Visual design ("Translucent Water-Being" — drop variant):
 *   • Glassy translucent shell with internal animated water level.
 *   • Mood-driven expression + behaviour:
 *       ecstatic  → big jump + sparkle crown + happy closed eyes
 *       happy     → gentle bob + smile
 *       neutral   → calm idle squish
 *       sad       → slow droop + frown
 *       distressed→ heavy droop, dim, tear drop
 *   • Continuous wave on the water surface.
 *   • Color shifts with fill level.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, {
  Path, Circle, Ellipse, G, Defs, ClipPath, Rect,
  LinearGradient as SvgGradient, RadialGradient, Stop, Line,
} from 'react-native-svg';
import { MoodState } from './avatarUtils';

// Colours keyed to fill level
function fillToColors(fillPct: number) {
  if (fillPct >= 0.8) return { main: '#1D4ED8', mid: '#3B82F6', light: '#BFDBFE', wave: '#2563EB', glow: '#93C5FD' };
  if (fillPct >= 0.5) return { main: '#2563EB', mid: '#60A5FA', light: '#DBEAFE', wave: '#3B82F6', glow: '#BFDBFE' };
  if (fillPct >= 0.3) return { main: '#0EA5E9', mid: '#38BDF8', light: '#BAE6FD', wave: '#0284C7', glow: '#7DD3FC' };
  return                     { main: '#7DD3FC', mid: '#BAE6FD', light: '#E0F2FE', wave: '#38BDF8', glow: '#BAE6FD' };
}

interface Props {
  size?: number;
  fillPct?: number;   // 0–1
  mood?: MoodState;
  /** @deprecated use mood instead */
  happy?: boolean;
}

export default function WaterDrop({
  size = 140, fillPct = 0, mood, happy = true,
}: Props) {
  const resolvedMood: MoodState = mood ?? (happy ? 'happy' : 'sad');
  const colors = fillToColors(fillPct);

  // ─── Animated values ────────────────────────────────────────────────────
  const bob     = useRef(new Animated.Value(0)).current;
  const squish  = useRef(new Animated.Value(1)).current;
  const sparkle = useRef(new Animated.Value(1)).current;

  // ─── Wave JS state (continuous slosh) ───────────────────────────────────
  const [waveT, setWaveT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWaveT(t => (t + 0.12) % (Math.PI * 4)), 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bob.stopAnimation(); squish.stopAnimation(); sparkle.stopAnimation();

    if (resolvedMood === 'ecstatic') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bob,    { toValue: -22, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(bob,    { toValue:   0, duration: 320, easing: Easing.bounce,           useNativeDriver: true }),
          Animated.delay(180),
        ]),
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkle, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(sparkle, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else if (resolvedMood === 'happy') {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bob,    { toValue: -10, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(squish, { toValue: 0.96, duration: 900, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(bob,    { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(squish, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    } else if (resolvedMood === 'neutral') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(squish, { toValue: 0.98, duration: 1800, useNativeDriver: true }),
          Animated.timing(squish, { toValue: 1.00, duration: 1800, useNativeDriver: true }),
        ]),
      ).start();
    } else if (resolvedMood === 'sad') {
      Animated.timing(bob,    { toValue: 4,    duration: 800, useNativeDriver: true }).start();
      Animated.timing(squish, { toValue: 1.05, duration: 800, useNativeDriver: true }).start();
    } else {
      // distressed
      Animated.timing(bob,    { toValue: 8,    duration: 1000, useNativeDriver: true }).start();
      Animated.timing(squish, { toValue: 1.10, duration: 1000, useNativeDriver: true }).start();
    }
  }, [resolvedMood, bob, squish, sparkle]);

  const W = size;
  const H = size * 1.2;
  const cx = W / 2;
  const cy = H * 0.58;

  // Drop outline (teardrop)
  const dropPath = `
    M ${cx},${H * 0.04}
    C ${cx + W * 0.10},${H * 0.18} ${cx + W * 0.5},${H * 0.32} ${cx + W * 0.5},${H * 0.62}
    A ${W * 0.5} ${H * 0.40} 0 1 1 ${cx - W * 0.5},${H * 0.62}
    C ${cx - W * 0.5},${H * 0.32} ${cx - W * 0.10},${H * 0.18} ${cx},${H * 0.04}
    Z
  `;

  // Water level inside drop
  const topFill    = H * 0.18;
  const bottomFill = H * 1.02;
  const fillTopY   = bottomFill - fillPct * (bottomFill - topFill);

  // Animated wave on surface
  const waveAmp = resolvedMood === 'distressed' ? 1.5 : resolvedMood === 'sad' ? 2 : 4;
  let wavePath = `M 0,${fillTopY}`;
  for (let x = 0; x <= W; x += 4) {
    const y = fillTopY + Math.sin(x / 12 + waveT) * waveAmp;
    wavePath += ` L ${x},${y}`;
  }
  wavePath += ` L ${W},${H} L 0,${H} Z`;

  const eyeY   = cy - size * 0.06;
  const eyeGap = size * 0.13;
  const eyeR   = size * 0.05;

  const dim = resolvedMood === 'distressed' ? 0.6 : resolvedMood === 'sad' ? 0.8 : 1;

  function MouthEl() {
    const mY    = cy + size * 0.1;
    const mHalf = size * 0.1;
    switch (resolvedMood) {
      case 'ecstatic':
        return (
          <G>
            <Path d={`M ${cx - mHalf * 1.2},${mY - 4} Q ${cx},${mY + 14} ${cx + mHalf * 1.2},${mY - 4} Z`}
              fill={colors.main} opacity={0.85} />
            <Path d={`M ${cx - mHalf * 0.9},${mY + 1} Q ${cx},${mY + 9} ${cx + mHalf * 0.9},${mY + 1}`}
              fill="#FB7185" opacity={0.55} />
          </G>
        );
      case 'happy':
        return <Path d={`M ${cx - mHalf},${mY} Q ${cx},${mY + 11} ${cx + mHalf},${mY}`}
          fill="none" stroke={colors.main} strokeWidth={2.6} strokeLinecap="round" />;
      case 'neutral':
        return <Path d={`M ${cx - mHalf * 0.8},${mY + 2} L ${cx + mHalf * 0.8},${mY + 2}`}
          fill="none" stroke={colors.main} strokeWidth={2.4} strokeLinecap="round" />;
      case 'sad':
        return <Path d={`M ${cx - mHalf},${mY + 8} Q ${cx},${mY + 1} ${cx + mHalf},${mY + 8}`}
          fill="none" stroke={colors.main} strokeWidth={2.4} strokeLinecap="round" />;
      case 'distressed':
        return (
          <G>
            <Path d={`M ${cx - mHalf * 1.1},${mY + 11} Q ${cx},${mY + 1} ${cx + mHalf * 1.1},${mY + 11}`}
              fill="none" stroke={colors.main} strokeWidth={2.6} strokeLinecap="round" />
            {/* tear */}
            <Path d={`M ${cx - eyeGap - 2},${eyeY + 4} Q ${cx - eyeGap - 4},${eyeY + 14} ${cx - eyeGap},${eyeY + 14} Q ${cx - eyeGap + 2},${eyeY + 9} ${cx - eyeGap - 2},${eyeY + 4} Z`}
              fill="#7DD3FC" opacity={0.85} />
          </G>
        );
    }
  }

  return (
    <Animated.View style={{
      transform: [{ translateY: bob }, { scaleX: squish }],
      alignItems: 'center',
    }}>
      {/* Sparkle crown (ecstatic) */}
      {resolvedMood === 'ecstatic' && (
        <Animated.View style={{
          opacity: sparkle,
          flexDirection: 'row',
          gap: size * 0.14,
          marginBottom: -size * 0.05,
        }}>
          {[0, 1, 2].map(i => (
            <Svg key={i} width={size * 0.12} height={size * 0.12} viewBox="0 0 14 14">
              <Line x1={7} y1={1}  x2={7} y2={13} stroke={colors.mid} strokeWidth={1.6} strokeLinecap="round" />
              <Line x1={1} y1={7}  x2={13} y2={7} stroke={colors.mid} strokeWidth={1.6} strokeLinecap="round" />
              <Line x1={3} y1={3}  x2={11} y2={11} stroke={colors.light} strokeWidth={1.1} strokeLinecap="round" />
              <Line x1={11} y1={3} x2={3}  y2={11} stroke={colors.light} strokeWidth={1.1} strokeLinecap="round" />
            </Svg>
          ))}
        </Animated.View>
      )}

      {/* Glow halo */}
      <View pointerEvents="none" style={{
        position: 'absolute',
        width: W * 1.2, height: H * 0.55,
        top: H * 0.3,
        borderRadius: W,
        backgroundColor: colors.glow,
        opacity: 0.25 * dim,
      }} />

      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <ClipPath id="dropClip">
            <Path d={dropPath} />
          </ClipPath>
          <SvgGradient id="dropShell" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.light} stopOpacity="0.85" />
            <Stop offset="1" stopColor={colors.light} stopOpacity="0.55" />
          </SvgGradient>
          <SvgGradient id="dropFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.mid}  stopOpacity="0.95" />
            <Stop offset="1" stopColor={colors.main} stopOpacity="1"    />
          </SvgGradient>
          <RadialGradient id="dropHi" cx="32%" cy="22%" r="55%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Glass shell */}
        <Path d={dropPath} fill="url(#dropShell)" />

        {/* Animated water fill, clipped to drop */}
        <G clipPath="url(#dropClip)">
          <Path d={wavePath} fill="url(#dropFill)" opacity={0.92} />
          {/* surface shine */}
          <Rect x={4} y={fillTopY - 1} width={W - 8} height={3} fill="#ffffff" opacity={0.45} rx={1.5} />
        </G>

        {/* Outline + highlight */}
        <Path d={dropPath} fill="none" stroke={colors.mid} strokeWidth={2.2} opacity={0.7 * dim} />
        <Ellipse cx={cx - size * 0.16} cy={H * 0.27} rx={size * 0.10} ry={size * 0.16}
          fill="white" opacity={0.55} transform={`rotate(-20, ${cx - size * 0.16}, ${H * 0.27})`} />
        <Path d={dropPath} fill="url(#dropHi)" opacity={0.6} />

        {/* Eyes */}
        {resolvedMood === 'ecstatic' ? (
          <G stroke={colors.main} strokeWidth={2.5} strokeLinecap="round" fill="none">
            <Path d={`M ${cx - eyeGap - eyeR},${eyeY} Q ${cx - eyeGap},${eyeY - eyeR * 1.5} ${cx - eyeGap + eyeR},${eyeY}`} />
            <Path d={`M ${cx + eyeGap - eyeR},${eyeY} Q ${cx + eyeGap},${eyeY - eyeR * 1.5} ${cx + eyeGap + eyeR},${eyeY}`} />
          </G>
        ) : (
          <G>
            <Circle cx={cx - eyeGap} cy={eyeY} r={eyeR} fill={colors.main} opacity={0.95} />
            <Circle cx={cx + eyeGap} cy={eyeY} r={eyeR} fill={colors.main} opacity={0.95} />
            <Circle cx={cx - eyeGap + eyeR * 0.35} cy={eyeY - eyeR * 0.35} r={eyeR * 0.35} fill="white" opacity={0.95} />
            <Circle cx={cx + eyeGap + eyeR * 0.35} cy={eyeY - eyeR * 0.35} r={eyeR * 0.35} fill="white" opacity={0.95} />
            {(resolvedMood === 'sad' || resolvedMood === 'distressed') && (
              <G stroke={colors.main} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.9}>
                <Path d={`M ${cx - eyeGap - eyeR - 1},${eyeY - eyeR + 0.5} Q ${cx - eyeGap},${eyeY - eyeR * 1.7} ${cx - eyeGap + eyeR + 1},${eyeY - eyeR + 0.5}`} />
                <Path d={`M ${cx + eyeGap - eyeR - 1},${eyeY - eyeR + 0.5} Q ${cx + eyeGap},${eyeY - eyeR * 1.7} ${cx + eyeGap + eyeR + 1},${eyeY - eyeR + 0.5}`} />
              </G>
            )}
          </G>
        )}

        {/* Cheek blush */}
        <Ellipse cx={cx - eyeGap - size * 0.09} cy={eyeY + size * 0.07} rx={size * 0.06} ry={size * 0.03}
          fill={resolvedMood === 'distressed' ? '#F87171' : '#FB7185'} opacity={0.5} />
        <Ellipse cx={cx + eyeGap + size * 0.09} cy={eyeY + size * 0.07} rx={size * 0.06} ry={size * 0.03}
          fill={resolvedMood === 'distressed' ? '#F87171' : '#FB7185'} opacity={0.5} />

        <MouthEl />
      </Svg>
    </Animated.View>
  );
}
