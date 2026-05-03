/**
 * WaterDrop — compact "portrait mode" of the human companion.
 * Round chibi face + shoulders, animated water fill from the bottom,
 * full mood system. Used in list rows, badges, the active-fast screen.
 *
 * Tech: react-native-svg + react-native-reanimated v3.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withRepeat, withTiming, withSequence,
  Easing, interpolate,
} from 'react-native-reanimated';
import Svg, {
  G, Path, Circle, Ellipse, Rect,
  Defs, ClipPath,
  LinearGradient as SvgGradient, RadialGradient, Stop,
} from 'react-native-svg';

import {
  fillPctToWater, moodToFace,
  SKIN, HAIR,
  type MoodState,
} from './avatarUtils';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  size?: number;
  fillPct?: number;
  mood?: MoodState;
  /** @deprecated use mood */
  happy?: boolean;
}

const VW = 160;
const VH = 180;
const CX = VW / 2;

export default function WaterDrop({
  size = 140, fillPct = 0, mood, happy = true,
}: Props) {
  const resolvedMood: MoodState = mood ?? (happy ? 'happy' : 'sad');
  const water = fillPctToWater(fillPct);
  const face  = moodToFace(resolvedMood);

  const bob     = useSharedValue(0);
  const shake   = useSharedValue(0);
  const blinkSv = useSharedValue(1);

  useEffect(() => {
    const amp =
      resolvedMood === 'ecstatic'   ? -7  :
      resolvedMood === 'happy'      ? -3  :
      resolvedMood === 'sad'        ?  2  :
      resolvedMood === 'distressed' ?  3  : -1;
    const dur =
      resolvedMood === 'ecstatic'   ?  480 :
      resolvedMood === 'happy'      ? 1300 :
      resolvedMood === 'sad'        ? 2200 :
      resolvedMood === 'distressed' ? 2000 : 2600;

    bob.value = withRepeat(
      withSequence(
        withTiming(amp, { duration: dur, easing: Easing.inOut(Easing.quad) }),
        withTiming(0,   { duration: dur, easing: Easing.inOut(Easing.quad) }),
      ), -1, false,
    );

    if (resolvedMood === 'distressed') {
      shake.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 80 }),
          withTiming( 1, { duration: 80 }),
        ), -1, true,
      );
    } else {
      shake.value = withTiming(0, { duration: 200 });
    }

    if (resolvedMood !== 'ecstatic') {
      blinkSv.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2800 }),
          withTiming(0, { duration: 80 }),
          withTiming(1, { duration: 100 }),
        ),
        -1, false,
      );
    } else {
      blinkSv.value = withTiming(0.35, { duration: 200 });
    }
  }, [resolvedMood]);

  const [waveT, setWaveT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWaveT(t => (t + 0.18) % (Math.PI * 100)), 60);
    return () => clearInterval(id);
  }, []);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { translateX: shake.value }],
  }));
  const lidProps = useAnimatedProps(() => ({
    opacity: interpolate(blinkSv.value, [0, 1], [1, 0]),
  }) as any);

  const headCY = 70;
  const headRx = 50;
  const headRy = 54;

  const silhouetteD = `
    M ${CX - headRx} ${headCY}
    a ${headRx} ${headRy} 0 1 1 ${headRx * 2} 0
    L ${CX + 60} ${VH - 4}
    L ${CX - 60} ${VH - 4}
    Z
  `;

  const fillTop  = headCY - headRy + 8;
  const fillBot  = VH - 6;
  const surfaceY = fillBot - (fillBot - fillTop) * Math.max(0, Math.min(1, fillPct));
  let wavePath = `M -10 ${surfaceY}`;
  for (let x = -10; x <= VW + 10; x += 4) {
    const y = surfaceY + 2.5 * Math.sin((x / 18) + waveT) + 1.2 * Math.sin((x / 7) + waveT * 1.6);
    wavePath += ` L ${x} ${y}`;
  }
  wavePath += ` L ${VW + 10} ${VH + 20} L -10 ${VH + 20} Z`;

  const eyeY   = headCY + 2;
  const eyeOffX = 16;
  const eyeRx  = 8;
  const eyeRy  = 9 * face.eyeOpen + 1;

  const browPath = (side: 'l' | 'r') => {
    const sgn = side === 'l' ? -1 : 1;
    const x0 = CX + sgn * (eyeOffX + 9);
    const x1 = CX + sgn * (eyeOffX - 6);
    const baseY  = eyeY - 14 - face.browLift;
    const yInner = baseY + face.browTilt * 5;
    const yOuter = baseY - face.browTilt * 3;
    return `M ${x0} ${yOuter} Q ${(x0 + x1) / 2} ${(yOuter + yInner) / 2 - 3} ${x1} ${yInner}`;
  };

  const mouthY      = headCY + 26;
  const mouthW      = 30;
  const curve       = face.mouthCurve * 12;
  const openH       = face.mouthOpen * 14;
  const mouthClosed = `M ${CX - mouthW / 2} ${mouthY} Q ${CX} ${mouthY + curve} ${CX + mouthW / 2} ${mouthY}`;
  const mouthOpen   = `M ${CX - mouthW / 2} ${mouthY}
                       Q ${CX} ${mouthY + curve + openH} ${CX + mouthW / 2} ${mouthY}
                       Q ${CX} ${mouthY - 1} ${CX - mouthW / 2} ${mouthY} Z`;

  const sparkles = useMemo(() => face.sparkles ? [
    { x: CX - 50, y: headCY - 36, s: 0.8 },
    { x: CX + 52, y: headCY - 30, s: 0.7 },
    { x: CX,      y: headCY - 52, s: 0.9 },
  ] : [], [face.sparkles]);

  return (
    <Animated.View style={[styles.wrap, { width: size, height: size * (VH / VW) }, wrapStyle]}>
      <Svg width={size} height={size * (VH / VW)} viewBox={`0 0 ${VW} ${VH}`}>
        <Defs>
          <RadialGradient id="dSkin" cx="40%" cy="35%" r="70%">
            <Stop offset="0%"   stopColor={SKIN.highlight} />
            <Stop offset="55%" stopColor={SKIN.base} />
            <Stop offset="100%" stopColor={SKIN.shadow} />
          </RadialGradient>
          <SvgGradient id="dHair" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor={HAIR.female.highlight} />
            <Stop offset="100%" stopColor={HAIR.female.shadow} />
          </SvgGradient>
          <SvgGradient id="dWater" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor={water.light} stopOpacity="0.95" />
            <Stop offset="60%" stopColor={water.main}  stopOpacity="0.85" />
            <Stop offset="100%" stopColor={water.dark} stopOpacity="0.95" />
          </SvgGradient>
          <RadialGradient id="dShimmer" cx="50%" cy="40%" r="60%">
            <Stop offset="0%"   stopColor="#fff" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="dIris" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#3B82F6" />
            <Stop offset="60%" stopColor="#1E40AF" />
            <Stop offset="100%" stopColor="#0F172A" />
          </RadialGradient>
          <ClipPath id="dClip"><Path d={silhouetteD} /></ClipPath>
        </Defs>

        {/* Body / shoulders */}
        <Path d={silhouetteD} fill="url(#dSkin)" />

        {/* Hair behind head */}
        <Ellipse cx={CX} cy={headCY + 2} rx={headRx + 6} ry={headRy + 4} fill="url(#dHair)" opacity={0.95} />
        {/* Face over hair */}
        <Ellipse cx={CX} cy={headCY} rx={headRx} ry={headRy} fill="url(#dSkin)" />
        {/* Front hair sweep */}
        <Path
          d={`M ${CX - headRx + 4} ${headCY - headRy + 14}
              Q ${CX - 8} ${headCY - headRy + 2} ${CX + 28} ${headCY - headRy + 18}
              Q ${CX + 4} ${headCY - headRy + 22} ${CX - headRx + 4} ${headCY - headRy + 22} Z`}
          fill="url(#dHair)"
        />

        {/* Water fill */}
        <G clipPath="url(#dClip)">
          <Path d={wavePath} fill="url(#dWater)" opacity={0.78} />
          <Ellipse cx={CX} cy={surfaceY + 14} rx={VW * 0.3} ry={20} fill="url(#dShimmer)" />
          <Path
            d={(() => {
              let p = `M -10 ${surfaceY}`;
              for (let x = -10; x <= VW + 10; x += 4) {
                const y = surfaceY + 2.5 * Math.sin((x / 18) + waveT) + 1.2 * Math.sin((x / 7) + waveT * 1.6);
                p += ` L ${x} ${y}`;
              }
              return p;
            })()}
            stroke={water.light} strokeWidth={1.2} fill="none" opacity={0.85}
          />
        </G>

        {/* Blush */}
        {face.blush > 0 && (
          <>
            <Ellipse cx={CX - 22} cy={headCY + 18} rx={9} ry={5} fill={SKIN.blush} opacity={face.blush * 0.55} />
            <Ellipse cx={CX + 22} cy={headCY + 18} rx={9} ry={5} fill={SKIN.blush} opacity={face.blush * 0.55} />
          </>
        )}

        {/* Eyes */}
        {(['l', 'r'] as const).map(side => {
          const sgn = side === 'l' ? -1 : 1;
          const ex  = CX + sgn * eyeOffX;
          if (resolvedMood === 'ecstatic') {
            return (
              <Path key={side}
                d={`M ${ex - 7} ${eyeY + 1} Q ${ex} ${eyeY - 6} ${ex + 7} ${eyeY + 1}`}
                stroke="#1F2937" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            );
          }
          return (
            <G key={side}>
              <Ellipse cx={ex} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="#FFFFFF" />
              <Circle cx={ex} cy={eyeY - 0.5} r={4.6 * Math.max(face.eyeOpen, 0.5)} fill="url(#dIris)" />
              <Circle cx={ex} cy={eyeY - 0.5} r={2.6 * Math.max(face.eyeOpen, 0.5)} fill="#0B1220" />
              <Circle cx={ex - 1.5} cy={eyeY - 2} r={1.6} fill="#FFFFFF" />
              <Path
                d={`M ${ex - eyeRx} ${eyeY - eyeRy + 1} Q ${ex} ${eyeY - eyeRy - 1} ${ex + eyeRx} ${eyeY - eyeRy + 1}`}
                stroke="#1F2937" strokeWidth={1.8} fill="none" strokeLinecap="round"
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
        <Path d={browPath('l')} stroke={HAIR.female.shadow} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d={browPath('r')} stroke={HAIR.female.shadow} strokeWidth={3} fill="none" strokeLinecap="round" />

        {/* Nose */}
        <Path
          d={`M ${CX - 2} ${headCY + 10} Q ${CX - 3} ${headCY + 17} ${CX} ${headCY + 18}
              Q ${CX + 3} ${headCY + 17} ${CX + 2} ${headCY + 10}`}
          stroke={SKIN.shadow} strokeWidth={1.2} fill="none" opacity={0.55}
        />

        {/* Mouth */}
        {face.mouthOpen > 0.4 ? (
          <>
            <Path d={mouthOpen} fill="#7A2A3A" />
            <Rect x={CX - mouthW / 2 + 3} y={mouthY - 1} width={mouthW - 6} height={openH * 0.4 + 2} rx={2} fill="#FFFFFF" />
          </>
        ) : face.mouthOpen > 0 ? (
          <Path d={mouthOpen} fill="#7A2A3A" />
        ) : (
          <Path d={mouthClosed} stroke={SKIN.lip} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        )}

        {/* Tears */}
        {face.tears >= 1 && (
          <Path d={`M ${CX - eyeOffX} ${eyeY + 8} q -1.4 8 0 14 q 2.5 -2 2.5 -7 q 0 -3 -2.5 -7 Z`}
                fill="#7DD3FC" opacity={0.9} />
        )}
        {face.tears >= 2 && (
          <Path d={`M ${CX + eyeOffX} ${eyeY + 8} q 1.4 8 0 14 q -2.5 -2 -2.5 -7 q 0 -3 2.5 -7 Z`}
                fill="#7DD3FC" opacity={0.9} />
        )}

        {/* Sparkles */}
        {sparkles.map((s, i) => (
          <G key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
            <Path d="M 0 -7 L 1.6 -1.6 L 7 0 L 1.6 1.6 L 0 7 L -1.6 1.6 L -7 0 L -1.6 -1.6 Z" fill="#FDE047" />
            <Circle cx={0} cy={0} r={1.4} fill="#FFFFFF" />
          </G>
        ))}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
