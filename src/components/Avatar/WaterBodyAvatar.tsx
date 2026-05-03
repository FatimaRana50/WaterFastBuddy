/**
 * WaterBodyAvatar — Premium full-body human companion for WaterFastBuddy.
 *
 * Visual direction: warm, friendly, slightly stylised human (Headspace /
 * Duolingo / Woebot quality). Soft 3D illusion via radial + linear gradients,
 * detailed expressive eyes, gendered silhouette, mood-driven body language.
 *
 * Tech: react-native-svg + react-native-reanimated v3 + expo-linear-gradient.
 * Pure SVG vector — no raster assets.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withRepeat, withTiming, withSequence,
  Easing, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  G, Path, Circle, Ellipse, Rect,
  Defs, ClipPath,
  LinearGradient as SvgGradient, RadialGradient, Stop,
} from 'react-native-svg';

import { UserProfile } from '../../types';
import {
  calcPurity, calcMood, fillPctToWater,
  buildBodyPath, buildArmPath,
  buildFemaleHairPaths, buildMaleHairPath,
  getGeometry, moodToFace,
  SKIN, HAIR, CLOTHING,
  VW, VH, CX,
  type MoodState,
} from './avatarUtils';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  profile: UserProfile;
  fastingHours?: number;
  fillPct?: number;
  size?: number;
  animate?: boolean;
}

export default function WaterBodyAvatar({
  profile, fastingHours = 0, fillPct = 0.5, size = 200, animate = true,
}: Props) {
  const bmi    = profile.weightKg / ((profile.heightCm / 100) ** 2);
  const purity = calcPurity(profile, fastingHours);
  const mood: MoodState = calcMood(purity, fastingHours);
  const water  = fillPctToWater(fillPct);
  const face   = moodToFace(mood);
  const geom   = getGeometry(profile.gender);

  const bodyD  = useMemo(() => buildBodyPath(profile.gender, bmi), [profile.gender, bmi]);
  const armRaise =
    mood === 'ecstatic'   ?  1    :
    mood === 'happy'      ?  0.35 :
    mood === 'sad'        ? -0.4  :
    mood === 'distressed' ? -0.6  : 0;
  const armL = useMemo(() => buildArmPath('left',  profile.gender, bmi, armRaise), [profile.gender, bmi, armRaise]);
  const armR = useMemo(() => buildArmPath('right', profile.gender, bmi, armRaise), [profile.gender, bmi, armRaise]);

  // ─── Reanimated shared values ─────────────────────────────────────────────
  const bob       = useSharedValue(0);
  const breathe   = useSharedValue(1);
  const shake     = useSharedValue(0);
  const auraPulse = useSharedValue(0);
  const blinkSv   = useSharedValue(1);

  useEffect(() => {
    if (!animate) return;

    const bobAmp =
      mood === 'ecstatic'   ? -10 :
      mood === 'happy'      ? -4  :
      mood === 'sad'        ?  3  :
      mood === 'distressed' ?  4  : -1.5;
    const bobDur =
      mood === 'ecstatic'   ?  480 :
      mood === 'happy'      ? 1400 :
      mood === 'sad'        ? 2400 :
      mood === 'distressed' ? 2200 : 2800;

    bob.value = withRepeat(
      withSequence(
        withTiming(bobAmp, { duration: bobDur, easing: Easing.inOut(Easing.quad) }),
        withTiming(0,      { duration: bobDur, easing: Easing.inOut(Easing.quad) }),
      ), -1, false,
    );

    breathe.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0,   { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );

    if (mood === 'distressed') {
      shake.value = withRepeat(
        withSequence(
          withTiming(-1.2, { duration: 90 }),
          withTiming( 1.2, { duration: 90 }),
        ), -1, true,
      );
    } else {
      shake.value = withTiming(0, { duration: 200 });
    }

    auraPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );

    if (mood !== 'ecstatic') {
      blinkSv.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2800 }),
          withTiming(0, { duration: 90 }),
          withTiming(1, { duration: 110 }),
        ),
        -1, false,
      );
    } else {
      blinkSv.value = withTiming(0.35, { duration: 200 });
    }
  }, [animate, mood]);

  const [waveT, setWaveT] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setWaveT(t => (t + 0.18) % (Math.PI * 100)), 60);
    return () => clearInterval(id);
  }, [animate]);

  const [bubbleT, setBubbleT] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setBubbleT(t => (t + 1) % 1000), 100);
    return () => clearInterval(id);
  }, [animate]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bob.value },
      { translateX: shake.value },
      { scale: breathe.value },
    ],
  }));
  const auraStyle = useAnimatedStyle(() => ({
    opacity:   interpolate(auraPulse.value, [0, 1], [0.25, 0.65]),
    transform: [{ scale: interpolate(auraPulse.value, [0, 1], [0.95, 1.08]) }],
  }));
  const lidProps = useAnimatedProps(() => ({
    opacity: interpolate(blinkSv.value, [0, 1], [1, 0]),
  }) as any);

  // ─── Water surface ────────────────────────────────────────────────────────
  const fillTop = geom.shoulderY - 4;
  const fillBot = geom.legBot;
  const surfaceY = fillBot - (fillBot - fillTop) * Math.max(0, Math.min(1, fillPct));

  let wavePath = `M -10 ${surfaceY}`;
  for (let x = -10; x <= VW + 10; x += 4) {
    const y = surfaceY + 3 * Math.sin((x / 22) + waveT) + 1.5 * Math.sin((x / 9) + waveT * 1.7);
    wavePath += ` L ${x} ${y}`;
  }
  wavePath += ` L ${VW + 10} ${VH + 20} L -10 ${VH + 20} Z`;

  const bubbles = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      x: 40 + ((i * 37) % (VW - 80)),
      r: 2 + (i % 3),
      phase: (i * 0.7) % (Math.PI * 2),
    })),
    [],
  );

  // ─── Face geometry ────────────────────────────────────────────────────────
  const headCX  = CX;
  const headCY  = geom.headCY;
  const eyeY    = headCY + 4;
  const eyeOffX = 9;
  const eyeRx   = 5.5;
  const eyeRy   = 6.5 * face.eyeOpen + 0.5;

  const browPath = (side: 'l' | 'r') => {
    const sgn = side === 'l' ? -1 : 1;
    const x0 = headCX + sgn * (eyeOffX + 6);
    const x1 = headCX + sgn * (eyeOffX - 4);
    const baseY  = eyeY - 9 - face.browLift;
    const yInner = baseY + face.browTilt * 4;
    const yOuter = baseY - face.browTilt * 2;
    return `M ${x0} ${yOuter} Q ${(x0 + x1) / 2} ${(yOuter + yInner) / 2 - 2} ${x1} ${yInner}`;
  };

  const mouthY      = headCY + 17;
  const mouthW      = 18;
  const curve       = face.mouthCurve * 8;
  const openH       = face.mouthOpen * 9;
  const mouthClosed = `M ${headCX - mouthW / 2} ${mouthY} Q ${headCX} ${mouthY + curve} ${headCX + mouthW / 2} ${mouthY}`;
  const mouthOpen   = `M ${headCX - mouthW / 2} ${mouthY}
                       Q ${headCX} ${mouthY + curve + openH * 1.2} ${headCX + mouthW / 2} ${mouthY}
                       Q ${headCX} ${mouthY - openH * 0.2} ${headCX - mouthW / 2} ${mouthY} Z`;

  const femaleHair = useMemo(() => buildFemaleHairPaths(headCX, headCY, geom.headRx, geom.headRy), [geom]);
  const maleHair   = useMemo(() => buildMaleHairPath(headCX, headCY, geom.headRx, geom.headRy),   [geom]);

  const sparkles = useMemo(() =>
    face.sparkles ? [
      { x: headCX - 36, y: headCY - 28, s: 1.0 },
      { x: headCX + 38, y: headCY - 22, s: 0.8 },
      { x: headCX - 48, y: headCY + 4,  s: 0.7 },
      { x: headCX + 50, y: headCY + 8,  s: 0.9 },
      { x: headCX,      y: headCY - 44, s: 1.1 },
    ] : [],
    [face.sparkles, headCX, headCY],
  );

  const aspectH = size * (VH / VW);

  return (
    <View style={[styles.wrap, { width: size, height: aspectH }]}>
      <Animated.View style={[styles.aura, auraStyle]}>
        <LinearGradient
          colors={[face.auraColor + '88', face.auraColor + '00']}
          style={styles.auraGrad}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[wrapStyle, { width: size, height: aspectH }]}>
        <Svg width={size} height={aspectH} viewBox={`0 0 ${VW} ${VH}`}>
          <Defs>
            <RadialGradient id="skinGrad" cx="40%" cy="35%" r="70%">
              <Stop offset="0%"   stopColor={SKIN.highlight} />
              <Stop offset="55%" stopColor={SKIN.base} />
              <Stop offset="100%" stopColor={SKIN.shadow} />
            </RadialGradient>
            <RadialGradient id="bodySkin" cx="50%" cy="20%" r="90%">
              <Stop offset="0%"   stopColor={SKIN.highlight} />
              <Stop offset="60%" stopColor={SKIN.base} />
              <Stop offset="100%" stopColor={SKIN.shadow} />
            </RadialGradient>
            <SvgGradient id="clothGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={CLOTHING.highlight} />
              <Stop offset="60%" stopColor={CLOTHING.primary} />
              <Stop offset="100%" stopColor={CLOTHING.shadow} />
            </SvgGradient>
            <SvgGradient id="clothGrad2" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={CLOTHING.secondary} />
              <Stop offset="100%" stopColor={CLOTHING.shadow} />
            </SvgGradient>
            <SvgGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={profile.gender === 'female' ? HAIR.female.highlight : HAIR.male.highlight} />
              <Stop offset="60%" stopColor={profile.gender === 'female' ? HAIR.female.base       : HAIR.male.base} />
              <Stop offset="100%" stopColor={profile.gender === 'female' ? HAIR.female.shadow    : HAIR.male.shadow} />
            </SvgGradient>
            <SvgGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={water.light} stopOpacity="0.95" />
              <Stop offset="60%" stopColor={water.main}  stopOpacity="0.85" />
              <Stop offset="100%" stopColor={water.dark} stopOpacity="0.95" />
            </SvgGradient>
            <RadialGradient id="waterShimmer" cx="50%" cy="40%" r="60%">
              <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </RadialGradient>
            <ClipPath id="bodyClip">
              <Path d={bodyD} />
            </ClipPath>
            <RadialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor="#3B82F6" />
              <Stop offset="60%" stopColor="#1E40AF" />
              <Stop offset="100%" stopColor="#0F172A" />
            </RadialGradient>
          </Defs>

          {/* Arms behind body */}
          <Path d={armL} fill="url(#bodySkin)" />
          <Path d={armR} fill="url(#bodySkin)" />

          {/* Body */}
          <Path d={bodyD} fill="url(#bodySkin)" />
          <Path d={bodyD} fill={SKIN.shadow} opacity={0.18} />

          {/* Clothing */}
          {profile.gender === 'female' ? (
            <>
              <Path
                d={`M ${CX - geom.shoulderW / 2 + 6} ${geom.shoulderY + 4}
                    L ${CX + geom.shoulderW / 2 - 6} ${geom.shoulderY + 4}
                    L ${CX + geom.waistW / 2 + 6} ${geom.waistY - 18}
                    Q ${CX} ${geom.waistY - 6} ${CX - geom.waistW / 2 - 6} ${geom.waistY - 18} Z`}
                fill="url(#clothGrad)"
              />
              <Path
                d={`M ${CX - geom.hipW / 2 + 2} ${geom.hipY}
                    L ${CX - geom.legGap / 2 - geom.legW + 2} ${geom.legBot - 6}
                    Q ${CX - geom.legGap / 2 - geom.legW / 2} ${geom.legBot + 8} ${CX - geom.legGap / 2 - 2} ${geom.legBot - 6}
                    L ${CX - geom.legGap / 2} ${geom.hipY + 22}
                    Q ${CX} ${geom.hipY + 32} ${CX + geom.legGap / 2} ${geom.hipY + 22}
                    L ${CX + geom.legGap / 2 + 2} ${geom.legBot - 6}
                    Q ${CX + geom.legGap / 2 + geom.legW / 2} ${geom.legBot + 8} ${CX + geom.legGap / 2 + geom.legW - 2} ${geom.legBot - 6}
                    L ${CX + geom.hipW / 2 - 2} ${geom.hipY} Z`}
                fill="url(#clothGrad2)"
              />
            </>
          ) : (
            <>
              <Path
                d={`M ${CX - geom.shoulderW / 2 + 4} ${geom.shoulderY + 2}
                    L ${CX + geom.shoulderW / 2 - 4} ${geom.shoulderY + 2}
                    L ${CX + geom.waistW / 2 + 8} ${geom.hipY - 10}
                    L ${CX - geom.waistW / 2 - 8} ${geom.hipY - 10} Z`}
                fill="url(#clothGrad)"
              />
              <Path
                d={`M ${CX - 10} ${geom.shoulderY + 2} Q ${CX} ${geom.shoulderY + 12} ${CX + 10} ${geom.shoulderY + 2}`}
                stroke={CLOTHING.shadow} strokeWidth={2} fill="none"
              />
              <Path
                d={`M ${CX - geom.hipW / 2 - 2} ${geom.hipY - 6}
                    L ${CX - geom.legGap / 2 - geom.legW - 2} ${geom.hipY + 60}
                    L ${CX - geom.legGap / 2 + 2}             ${geom.hipY + 60}
                    L ${CX} ${geom.hipY + 22}
                    L ${CX + geom.legGap / 2 - 2}             ${geom.hipY + 60}
                    L ${CX + geom.legGap / 2 + geom.legW + 2} ${geom.hipY + 60}
                    L ${CX + geom.hipW / 2 + 2} ${geom.hipY - 6} Z`}
                fill="url(#clothGrad2)"
              />
            </>
          )}

          {/* Water fill */}
          <G clipPath="url(#bodyClip)">
            <Path d={wavePath} fill="url(#waterGrad)" opacity={0.78} />
            <Ellipse cx={CX} cy={surfaceY + 20} rx={VW * 0.35} ry={28} fill="url(#waterShimmer)" />
            <Path
              d={(() => {
                let p = `M -10 ${surfaceY}`;
                for (let x = -10; x <= VW + 10; x += 4) {
                  const y = surfaceY + 3 * Math.sin((x / 22) + waveT) + 1.5 * Math.sin((x / 9) + waveT * 1.7);
                  p += ` L ${x} ${y}`;
                }
                return p;
              })()}
              stroke={water.light} strokeWidth={1.4} fill="none" opacity={0.85}
            />
            {bubbles.map((b, i) => {
              const t = (bubbleT * 0.06 + b.phase) % 1;
              const by = fillBot - t * (fillBot - surfaceY - 4);
              if (by < surfaceY + 4) return null;
              return (
                <Circle key={i} cx={b.x + Math.sin(bubbleT * 0.1 + b.phase) * 3}
                        cy={by} r={b.r} fill={water.light} opacity={0.7} />
              );
            })}
          </G>

          {/* Neck */}
          <Rect
            x={CX - geom.neckW / 2} y={geom.headCY + geom.headRy - 6}
            width={geom.neckW} height={14} rx={4}
            fill="url(#bodySkin)"
          />

          {/* Head — hair volume behind */}
          {profile.gender === 'female' && (
            <Ellipse cx={headCX} cy={headCY + 4} rx={geom.headRx + 4} ry={geom.headRy + 2}
                     fill="url(#hairGrad)" opacity={0.95} />
          )}
          <Ellipse cx={headCX} cy={headCY} rx={geom.headRx} ry={geom.headRy} fill="url(#skinGrad)" />
          <Path
            d={`M ${headCX - geom.headRx + 4} ${headCY + 8}
                Q ${headCX} ${headCY + geom.headRy + 2} ${headCX + geom.headRx - 4} ${headCY + 8}`}
            fill={SKIN.shadow} opacity={0.18}
          />

          {/* Hair on top */}
          {profile.gender === 'female'
            ? femaleHair.map((d, i) => <Path key={i} d={d} fill="url(#hairGrad)" />)
            : <Path d={maleHair} fill="url(#hairGrad)" />
          }

          {/* Ears */}
          <Ellipse cx={headCX - geom.headRx + 1} cy={headCY + 4} rx={3} ry={5} fill={SKIN.shadow} />
          <Ellipse cx={headCX + geom.headRx - 1} cy={headCY + 4} rx={3} ry={5} fill={SKIN.shadow} />

          {/* Blush */}
          {face.blush > 0 && (
            <>
              <Ellipse cx={headCX - 12} cy={headCY + 11} rx={5.5} ry={3.2} fill={SKIN.blush} opacity={face.blush * 0.6} />
              <Ellipse cx={headCX + 12} cy={headCY + 11} rx={5.5} ry={3.2} fill={SKIN.blush} opacity={face.blush * 0.6} />
            </>
          )}

          {/* Eyes */}
          {(['l', 'r'] as const).map(side => {
            const sgn = side === 'l' ? -1 : 1;
            const ex  = headCX + sgn * eyeOffX;
            if (mood === 'ecstatic') {
              return (
                <Path key={side}
                  d={`M ${ex - 5} ${eyeY + 1} Q ${ex} ${eyeY - 4} ${ex + 5} ${eyeY + 1}`}
                  stroke="#1F2937" strokeWidth={1.8} fill="none" strokeLinecap="round"
                />
              );
            }
            return (
              <G key={side}>
                <Ellipse cx={ex} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="#FFFFFF" />
                <Circle cx={ex} cy={eyeY - 0.5} r={3.2 * Math.max(face.eyeOpen, 0.5)} fill="url(#irisGrad)" />
                <Circle cx={ex} cy={eyeY - 0.5} r={2.4 * Math.max(face.eyeOpen, 0.5)} fill="#0B1220" />
                <Circle cx={ex - 1} cy={eyeY - 1} r={1.1} fill="#FFFFFF" />
                <Circle cx={ex + 1.5} cy={eyeY + 1.5} r={0.5} fill="#FFFFFF" opacity={0.7} />
                <Path
                  d={`M ${ex - eyeRx} ${eyeY - eyeRy + 1} Q ${ex} ${eyeY - eyeRy - 0.5} ${ex + eyeRx} ${eyeY - eyeRy + 1}`}
                  stroke="#1F2937" strokeWidth={1.4} fill="none" strokeLinecap="round"
                />
                <AnimatedPath
                  d={`M ${ex - eyeRx} ${eyeY} Q ${ex} ${eyeY + eyeRy} ${ex + eyeRx} ${eyeY}
                      L ${ex + eyeRx} ${eyeY - eyeRy} Q ${ex} ${eyeY - eyeRy} ${ex - eyeRx} ${eyeY - eyeRy} Z`}
                  fill={SKIN.base}
                  animatedProps={lidProps}
                />
              </G>
            );
          })}

          {/* Brows */}
          <Path d={browPath('l')} stroke={profile.gender === 'female' ? HAIR.female.shadow : HAIR.male.shadow}
                strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Path d={browPath('r')} stroke={profile.gender === 'female' ? HAIR.female.shadow : HAIR.male.shadow}
                strokeWidth={2.4} fill="none" strokeLinecap="round" />

          {/* Nose */}
          <Path
            d={`M ${headCX - 1.5} ${headCY + 6} Q ${headCX - 2.5} ${headCY + 11} ${headCX} ${headCY + 12}
                Q ${headCX + 2.5} ${headCY + 11} ${headCX + 1.5} ${headCY + 6}`}
            stroke={SKIN.shadow} strokeWidth={1} fill="none" opacity={0.55}
          />

          {/* Mouth */}
          {face.mouthOpen > 0.4 ? (
            <>
              <Path d={mouthOpen} fill="#7A2A3A" />
              <Rect x={headCX - mouthW / 2 + 2} y={mouthY - 1}
                    width={mouthW - 4} height={openH * 0.45 + 1.5} rx={1.5}
                    fill="#FFFFFF" />
              <Ellipse cx={headCX} cy={mouthY + openH * 0.7 + 1}
                       rx={mouthW * 0.3} ry={openH * 0.25} fill="#E55A6F" />
            </>
          ) : face.mouthOpen > 0 ? (
            <Path d={mouthOpen} fill="#7A2A3A" />
          ) : (
            <Path d={mouthClosed} stroke={SKIN.lip} strokeWidth={2} fill="none" strokeLinecap="round" />
          )}

          {/* Tears */}
          {face.tears >= 1 && (
            <Path d={`M ${headCX - eyeOffX} ${eyeY + 4} q -1 6 0 10 q 2 -2 2 -6 q 0 -2 -2 -4 Z`}
                  fill="#7DD3FC" opacity={0.9} />
          )}
          {face.tears >= 2 && (
            <Path d={`M ${headCX + eyeOffX} ${eyeY + 4} q 1 6 0 10 q -2 -2 -2 -6 q 0 -2 2 -4 Z`}
                  fill="#7DD3FC" opacity={0.9} />
          )}

          {/* Sparkles */}
          {sparkles.map((s, i) => (
            <G key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
              <Path d="M 0 -5 L 1.2 -1.2 L 5 0 L 1.2 1.2 L 0 5 L -1.2 1.2 L -5 0 L -1.2 -1.2 Z"
                    fill="#FDE047" />
              <Circle cx={0} cy={0} r={1} fill="#FFFFFF" />
            </G>
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:     { alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  aura:     { position: 'absolute', top: '8%', left: '5%', right: '5%', bottom: '8%', borderRadius: 999, overflow: 'hidden' },
  auraGrad: { flex: 1, borderRadius: 999 },
});
