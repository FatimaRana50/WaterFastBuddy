/**
 * WaterBodyAvatar — Fresh, Modern Humanoid Character
 *
 * Design: "Friendly Water Hydration Character"
 *   • Clean, modern human silhouette with cute proportions
 *   • Large expressive eyes with mood-driven expressions
 *   • Water visualization: glowing fill inside body, animated waves
 *   • BMI morphs body shape (slim ↔ round)
 *   • Mood animates expression and movement
 *   • Purity drives color (crystal blue → amber/orange)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, {
  G, Ellipse, Rect, Path, Circle,
  Defs, ClipPath,
  LinearGradient as SvgGradient,
  RadialGradient, Stop,
} from 'react-native-svg';
import { UserProfile } from '../../types';
import {
  calcPurity, calcMood, purityToColors,
  VW, VH, CX,
} from './avatarUtils';
import type { MoodState, WaterColors } from './avatarUtils';

// ─── Constants ──────────────────────────────────────────────────────────────
const VIEW_W = 160;
const VIEW_H = 280;
const CENTER_X = VIEW_W / 2;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function fatF(bmi: number) {
  return clamp((bmi - 20) / 18, 0, 1);
}

function thinF(bmi: number) {
  return clamp((20 - bmi) / 6, 0, 1);
}

// ─── Build Body Path ────────────────────────────────────────────────────────
function buildBody(gender: 'male' | 'female', bmi: number): string {
  const iF = gender === 'female';
  const ff = fatF(bmi);
  const tf = thinF(bmi);

  const shW = iF ? 45 + ff * 18 - tf * 6 : 55 + ff * 20 - tf * 8;
  const waW = iF ? 28 + ff * 40 - tf * 8 : 38 + ff * 42 - tf * 10;
  const hiW = iF ? 50 + ff * 20 - tf * 6 : 45 + ff * 18 - tf * 5;
  const lgW = 18 + ff * 10 - tf * 4;
  const legGap = 4;

  const shY = 90;
  const waY = 145;
  const hiY = 180;
  const legBot = 265;
  const neckY = 65;
  const neckW = iF ? 11 : 13;

  const shL = CENTER_X - shW / 2, shR = CENTER_X + shW / 2;
  const waL = CENTER_X - waW / 2, waR = CENTER_X + waW / 2;
  const hiL = CENTER_X - hiW / 2, hiR = CENTER_X + hiW / 2;
  const lgLo = CENTER_X - legGap - lgW, lgRo = CENTER_X + legGap + lgW;
  const lgLi = CENTER_X - legGap, lgRi = CENTER_X + legGap;

  return [
    `M ${CENTER_X - neckW},${neckY}`,
    `L ${shL},${shY}`,
    `C ${shL - 3},${shY + 15} ${waL - 2},${waY - 18} ${waL},${waY}`,
    `C ${waL - 2},${waY + 16} ${hiL - 1},${hiY - 12} ${hiL},${hiY}`,
    `L ${lgLo},${hiY + 8} L ${lgLo},${legBot} L ${lgLi},${legBot} L ${lgLi},${hiY + 12}`,
    `L ${lgRi},${hiY + 12} L ${lgRi},${legBot} L ${lgRo},${legBot} L ${lgRo},${hiY + 8}`,
    `L ${hiR},${hiY}`,
    `C ${hiR + 1},${hiY - 12} ${waR + 2},${waY + 16} ${waR},${waY}`,
    `C ${waR + 2},${waY - 18} ${shR + 3},${shY + 15} ${shR},${shY}`,
    `L ${CENTER_X + neckW},${neckY} Z`,
  ].join(' ');
}

function buildArm(
  side: 'left' | 'right',
  gender: 'male' | 'female',
  bmi: number,
): string {
  const iF = gender === 'female';
  const ff = fatF(bmi);
  const shW = (iF ? 45 : 55) + ff * 18;
  const armW = (iF ? 10 : 13) + ff * 6;
  const sgn = side === 'left' ? -1 : 1;
  const sx = side === 'left' ? CENTER_X - shW / 2 : CENTER_X + shW / 2;
  const mid = sx + sgn * armW * 0.7;
  const hand = sx + sgn * armW * 1.0;
  const top = 92,
    bot = 165;

  return [
    `M ${sx},${top}`,
    `C ${mid - sgn * 2},${top + 25} ${hand + sgn * 2},${top + 50} ${hand},${bot}`,
    `C ${hand - sgn * 3},${bot + 8} ${mid - sgn * 4},${top + 48} ${sx - sgn * 2},${top} Z`,
  ].join(' ');
}

// ─── Eye Component ──────────────────────────────────────────────────────────
function Eye({
  cx,
  cy,
  rx,
  ry,
  irisColor,
  mood,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  irisColor: string;
  mood: MoodState;
}) {
  const eyePath = `M ${cx - rx},${cy} Q ${cx - rx * 0.3},${cy - ry * 1.1} ${cx},${cy - ry} Q ${cx + rx * 0.3},${cy - ry * 1.1} ${cx + rx},${cy} Q ${cx + rx * 0.3},${cy + ry * 0.85} ${cx},${cy + ry * 0.8} Q ${cx - rx * 0.3},${cy + ry * 0.85} ${cx - rx},${cy} Z`;

  const irisR = ry * 0.74;
  const pupilR = irisR * 0.52;
  const hiR = irisR * 0.32;

  const topLidLift =
    mood === 'ecstatic' ? ry * 0.25 : mood === 'happy' ? ry * 0.1 : 0;
  const squintPath =
    topLidLift > 0
      ? `M ${cx - rx},${cy} Q ${cx},${cy - ry + topLidLift} ${cx + rx},${cy}`
      : null;

  return (
    <G>
      <Path d={eyePath} fill="white" opacity={0.96} />
      <Circle cx={cx} cy={cy + ry * 0.05} r={irisR} fill={irisColor} />
      <Circle cx={cx} cy={cy + ry * 0.05} r={pupilR} fill="#0d1b3e" />
      <Circle cx={cx - irisR * 0.28} cy={cy - irisR * 0.28} r={hiR} fill="white" opacity={0.92} />
      <Path d={eyePath} fill="none" stroke="#1a2e5a" strokeWidth={0.7} opacity={0.4} />
      {squintPath && <Path d={squintPath} fill="white" opacity={0.85} />}
    </G>
  );
}

// ─── Eyebrow Component ──────────────────────────────────────────────────────
function Eyebrow({
  mood,
  cx,
  eyeCY,
  eyeOffX,
  color,
}: {
  mood: MoodState;
  cx: number;
  eyeCY: number;
  eyeOffX: number;
  color: string;
}) {
  const by = eyeCY - 9;
  const bw = 6.5;
  const arch =
    mood === 'ecstatic'
      ? -3.2
      : mood === 'happy'
        ? -2.5
        : mood === 'neutral'
          ? -1.2
          : mood === 'sad'
            ? 0.8
            : 1.2;

  const innerRaise = mood === 'sad' || mood === 'distressed' ? -2.2 : 0;

  return (
    <G stroke={color} strokeWidth={2.3} strokeLinecap="round" fill="none" opacity={0.8}>
      <Path
        d={`M ${cx - eyeOffX - bw},${by + 1} Q ${cx - eyeOffX},${by + arch} ${cx - eyeOffX + bw},${by + 1 + innerRaise}`}
      />
      <Path
        d={`M ${cx + eyeOffX - bw},${by + 1 + innerRaise} Q ${cx + eyeOffX},${by + arch} ${cx + eyeOffX + bw},${by + 1}`}
      />
    </G>
  );
}

// ─── Mouth Component ────────────────────────────────────────────────────────
function Mouth({
  mood,
  cx,
  mY,
  mw,
  color,
  hopeful = false,
}: {
  mood: MoodState;
  cx: number;
  mY: number;
  mw: number;
  color: string;
  hopeful?: boolean;
}) {
  switch (mood) {
    case 'ecstatic':
      return (
        <G>
          <Path
            d={`M ${cx - mw * 1.1},${mY} Q ${cx},${mY + 12} ${cx + mw * 1.1},${mY}`}
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d={`M ${cx - mw * 0.8},${mY + 2} Q ${cx},${mY + 10} ${cx + mw * 0.8},${mY + 2} Z`}
            fill="white"
            opacity={0.8}
          />
        </G>
      );
    case 'happy':
      return (
        <Path
          d={`M ${cx - mw},${mY} Q ${cx},${mY + 9} ${cx + mw},${mY}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.88}
        />
      );
    case 'neutral':
      return (
        <Path
          d={`M ${cx - mw * 0.75},${mY + 2} Q ${cx},${mY + 5} ${cx + mw * 0.75},${mY + 2}`}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.7}
        />
      );
    case 'sad':
      return (
        <Path
          d={hopeful
            ? `M ${cx - mw},${mY + 6} Q ${cx},${mY + 4} ${cx + mw},${mY + 6}`
            : `M ${cx - mw},${mY + 7} Q ${cx},${mY + 2} ${cx + mw},${mY + 7}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.78}
        />
      );
    case 'distressed':
      return (
        <G>
          <Path
            d={hopeful
              ? `M ${cx - mw * 1.05},${mY + 8} Q ${cx},${mY + 4} ${cx + mw * 1.05},${mY + 8}`
              : `M ${cx - mw * 1.05},${mY + 9} Q ${cx},${mY + 1} ${cx + mw * 1.05},${mY + 9}`}
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            opacity={0.82}
          />
          <Path
            d={`M ${cx - 12},${mY - 2} Q ${cx - 14},${mY + 8} ${cx - 11},${mY + 9} Q ${cx - 9},${mY + 3} ${cx - 12},${mY - 2} Z`}
            fill="#93C5FD"
            opacity={0.85}
          />
        </G>
      );
  }
}

// ─── Props ──────────────────────────────────────────────────────────────────
interface Props {
  profile: UserProfile;
  fastingHours?: number;
  fillPct?: number;
  size?: number;
  animate?: boolean;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function WaterBodyAvatar({
  profile,
  fastingHours = 0,
  fillPct,
  size = 200,
  animate = true,
}: Props) {
  const bmi = profile.weightKg / ((profile.heightCm / 100) ** 2);
  const purity = calcPurity(profile, fastingHours);
  const mood = calcMood(purity, fastingHours);
  const colors = purityToColors(purity);
  const isF = profile.gender === 'female';
  const ff = fatF(bmi);
  const tf = thinF(bmi);
  const isFit = bmi < 23;
  const isOverweight = bmi >= 30;
  const encouragingMode = isOverweight && (mood === 'sad' || mood === 'distressed');

  // Keep health feedback visible, but avoid demotivating "muddy" tones.
  const renderColors = encouragingMode
    ? {
        ...colors,
        main: '#53ACEF',
        dark: '#1966A8',
        light: '#D9EFFF',
        glow: '#9ED3FF',
        accent: '#EEF7FF',
        mid: '#2E8FD6',
        wave: '#247BC0',
      }
    : colors;

  // Paths
  const bodyPath = buildBody(profile.gender, bmi);
  const armLPath = buildArm('left', profile.gender, bmi);
  const armRPath = buildArm('right', profile.gender, bmi);

  // Head
  const headRx = isF ? 18 * (1 + ff * 0.15 - tf * 0.08) : 20 * (1 + ff * 0.12 - tf * 0.07);
  const headRy = isF ? 21 * (1 + ff * 0.14 - tf * 0.08) : 22 * (1 + ff * 0.12 - tf * 0.07);
  const headCY = 42;

  // Water
  const fill = fillPct !== undefined ? clamp(fillPct, 0, 1) : 0.25 + purity * 0.65;
  const bodyTop = 90;
  const bodyBot = 265;
  const waterTopY = bodyTop + (1 - fill) * (bodyBot - bodyTop);

  // Animation
  const [waveX, setWaveX] = useState(0);
  const [wobble, setWobble] = useState(0);
  const [glowOp, setGlowOp] = useState(0.5);
  const [tearProg, setTearProg] = useState(0);
  const glowT = useRef(0);
  const tearT = useRef(0);

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => {
      setWaveX(t => (t + 2.2) % VIEW_W);
      setWobble(w => (w + 0.08) % (Math.PI * 2));
      glowT.current += 0.045;
      setGlowOp(0.35 + 0.45 * Math.sin(glowT.current));
      tearT.current = (tearT.current + 0.035) % 1;
      setTearProg(tearT.current);
    }, 33);
    return () => clearInterval(id);
  }, [animate]);

  const bobY = useRef(new Animated.Value(0)).current;
  const scaleVal = useRef(new Animated.Value(1)).current;
  const spinVal = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    bobY.stopAnimation();
    scaleVal.stopAnimation();
    spinVal.stopAnimation();
    shakeX.stopAnimation();

    spinVal.setValue(0);
    shakeX.setValue(0);

    const amt =
      mood === 'ecstatic' ? -12 : mood === 'happy' ? -6 : mood === 'sad' ? 4 : mood === 'distressed' ? 5 : -4;
    const dur = mood === 'ecstatic' ? 600 : mood === 'happy' ? 1000 : mood === 'distressed' ? 2500 : 1600;

    Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, {
          toValue: amt,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobY, {
          toValue: 0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    if (mood === 'ecstatic') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleVal, {
            toValue: 1.05,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleVal, {
            toValue: 0.98,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleVal, {
            toValue: 1.0,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }

    if (isFit && (mood === 'happy' || mood === 'ecstatic')) {
      const jumpHeight = mood === 'ecstatic' ? -16 : -10;
      const jumpDur = mood === 'ecstatic' ? 420 : 560;

      Animated.loop(
        Animated.sequence([
          Animated.timing(bobY, {
            toValue: jumpHeight,
            duration: jumpDur,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bobY, {
            toValue: 0,
            duration: jumpDur,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      if (mood === 'ecstatic') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(spinVal, {
              toValue: 1,
              duration: 1200,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(spinVal, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    }

    if (isOverweight && (mood === 'sad' || mood === 'distressed')) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeX, { toValue: -1.5, duration: 120, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 1.5, duration: 120, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: -1, duration: 120, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 0, duration: 140, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [mood, animate, isFit, isOverweight]);

  // Wave
  function wavePath(offsetX: number, amp: number): string {
    let d = `M ${-offsetX},0`;
    for (let x = 0; x <= VIEW_W + offsetX; x += 4) {
      d += ` L ${x - offsetX},${amp * Math.sin((x / 32) * Math.PI)}`;
    }
    return d + ` L ${VIEW_W - offsetX},${VIEW_H + 14} L ${-offsetX},${VIEW_H + 14} Z`;
  }

  const waveAmp = purity > 0.6 ? 3 : purity > 0.3 ? 4.5 : 5.5;
  const wPath = wavePath(waveX, waveAmp);

  const showMicrobes = purity < 0.45;
  const blushOp = mood === 'ecstatic' ? 0.75 : mood === 'happy' ? 0.55 : mood === 'sad' ? 0.2 : 0.3;
  const crying = encouragingMode;

  // Face
  const eyeCY = headCY - 3;
  const eyeOffX = Math.min(headRx * 0.45, 9);
  const eyeRx = 7.5;
  const eyeRy = 8.2;
  const mY = headCY + 12;
  const mw = 8.5;

  const svgW = size;
  const svgH = size * (VIEW_H / VIEW_W);
  const spinDeg = spinVal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const tearA = tearProg;
  const tearB = (tearProg + 0.45) % 1;

  return (
    <Animated.View
      style={{
        transform: [{ translateX: shakeX }, { translateY: bobY }, { scale: scaleVal }, { rotate: spinDeg }],
      }}
    >
      {/* Glow aura */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: svgW * 1.25,
          height: svgH * 0.5,
          left: -svgW * 0.125,
          top: svgH * 0.35,
          borderRadius: svgW,
          backgroundColor: renderColors.glow,
          opacity: glowOp * 0.18,
        }}
      />

      <Svg width={svgW} height={svgH} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Defs>
          {/* Clip path for body */}
          <ClipPath id="bodyClip">
            <Path d={bodyPath} />
            <Path d={armLPath} />
            <Path d={armRPath} />
            <Ellipse cx={CENTER_X} cy={headCY} rx={headRx} ry={headRy} />
          </ClipPath>

          {/* Water gradient */}
          <SvgGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={renderColors.light} stopOpacity="0.9" />
            <Stop offset="0.5" stopColor={renderColors.main} stopOpacity="1" />
            <Stop offset="1" stopColor={renderColors.dark} stopOpacity="1" />
          </SvgGradient>

          {/* Body surface */}
          <SvgGradient id="bodyGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor={renderColors.light} stopOpacity="0.35" />
            <Stop offset="0.6" stopColor={renderColors.main} stopOpacity="0.18" />
            <Stop offset="1" stopColor={renderColors.dark} stopOpacity="0.25" />
          </SvgGradient>

          {/* Highlight */}
          <RadialGradient id="highlight" cx="35%" cy="20%" r="50%">
            <Stop offset="0" stopColor="white" stopOpacity="0.65" />
            <Stop offset="0.4" stopColor="white" stopOpacity="0.15" />
            <Stop offset="1" stopColor="white" stopOpacity="0" />
          </RadialGradient>

          {/* Iris */}
          <RadialGradient id="irisGrad" cx="40%" cy="30%" r="60%">
            <Stop offset="0" stopColor={renderColors.light} stopOpacity="1" />
            <Stop offset="0.6" stopColor={renderColors.main} stopOpacity="1" />
            <Stop offset="1" stopColor={renderColors.dark} stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Hair (female) */}
        {isF && (
          <>
            <Ellipse cx={CENTER_X} cy={headCY - headRy + 2} rx={headRx * 0.7} ry={13} fill="url(#bodyGrad)" opacity={0.85} />
            <Ellipse
              cx={CENTER_X - headRx * 0.2}
              cy={headCY - headRy - 1}
              rx={headRx * 0.22}
              ry={4}
              fill="white"
              opacity={0.25}
            />
          </>
        )}

        {/* Body */}
        <Path d={bodyPath} fill="url(#bodyGrad)" />
        <Path d={armLPath} fill="url(#bodyGrad)" />
        <Path d={armRPath} fill="url(#bodyGrad)" />

        {/* Head */}
        <Ellipse cx={CENTER_X} cy={headCY} rx={headRx} ry={headRy} fill="url(#bodyGrad)" />

        {/* Head highlight */}
        <Ellipse cx={CENTER_X} cy={headCY} rx={headRx} ry={headRy} fill="url(#highlight)" />

        {/* Water inside body */}
        <G clipPath="url(#bodyClip)">
          {/* Fill */}
          <Rect x={0} y={waterTopY} width={VIEW_W} height={VIEW_H - waterTopY + 20} fill="url(#waterGrad)" />

          {/* Wave */}
          <Path
            d={wPath}
            fill={renderColors.dark}
            opacity={0.5}
            transform={`translate(0, ${waterTopY - waveAmp})`}
          />

          {/* Surface shine */}
          <Rect
            x={4}
            y={waterTopY - waveAmp - 2}
            width={VIEW_W - 8}
            height={8}
            fill="white"
            opacity={0.3}
            rx={4}
          />

          {/* Bubbles */}
          {[0, 1, 2].map(i => (
            <Circle key={i} cx={CENTER_X + (i - 1) * 18} cy={waterTopY + 20 + i * 15} r={3 + i * 0.8} fill="white" opacity={0.2 + i * 0.08} />
          ))}

          {/* Microbes */}
          {showMicrobes && (
            <>
              <G opacity={0.48}>
                <Circle cx={CENTER_X - 18} cy={waterTopY + 40} r={7} fill="#15803D" />
                <Circle cx={CENTER_X - 18} cy={waterTopY + 40} r={3.5} fill="rgba(255,255,255,0.3)" />
              </G>
              <G opacity={0.42}>
                <Circle cx={CENTER_X + 16} cy={waterTopY + 70} r={5.5} fill="#166534" />
                <Circle cx={CENTER_X + 16} cy={waterTopY + 70} r={2.75} fill="rgba(255,255,255,0.3)" />
              </G>
              {purity < 0.25 && (
                <G opacity={0.4}>
                  <Circle cx={CENTER_X - 8} cy={waterTopY + 100} r={6} fill="#14532D" />
                  <Circle cx={CENTER_X - 8} cy={waterTopY + 100} r={3} fill="rgba(255,255,255,0.3)" />
                </G>
              )}
            </>
          )}
        </G>

        {/* Water level indicator */}
        <Rect x={CENTER_X - 2} y={bodyTop} width={4} height={bodyBot - bodyTop} fill={colors.dark} opacity={0.2} rx={2} />
        <Rect x={CENTER_X - 2} y={waterTopY} width={4} height={Math.max(0, bodyBot - waterTopY)} fill={renderColors.main} opacity={0.6} rx={2} />

        {/* Eyes */}
        <Eye cx={CENTER_X - eyeOffX} cy={eyeCY} rx={eyeRx} ry={eyeRy} irisColor="url(#irisGrad)" mood={mood} />
        <Eye cx={CENTER_X + eyeOffX} cy={eyeCY} rx={eyeRx} ry={eyeRy} irisColor="url(#irisGrad)" mood={mood} />

        {/* Tears for sad/distressed overweight state */}
        {crying && (
          <>
            <Path
              d={`M ${CENTER_X - eyeOffX - 2},${eyeCY + 7 + tearA * 10} Q ${CENTER_X - eyeOffX - 4},${eyeCY + 13 + tearA * 14} ${CENTER_X - eyeOffX - 2},${eyeCY + 19 + tearA * 16} Q ${CENTER_X - eyeOffX},${eyeCY + 13 + tearA * 14} ${CENTER_X - eyeOffX - 2},${eyeCY + 7 + tearA * 10} Z`}
              fill="#7DD3FC"
              opacity={0.58 + 0.25 * (1 - tearA)}
            />
            <Path
              d={`M ${CENTER_X + eyeOffX + 2},${eyeCY + 7 + tearB * 10} Q ${CENTER_X + eyeOffX + 4},${eyeCY + 13 + tearB * 14} ${CENTER_X + eyeOffX + 2},${eyeCY + 19 + tearB * 16} Q ${CENTER_X + eyeOffX},${eyeCY + 13 + tearB * 14} ${CENTER_X + eyeOffX + 2},${eyeCY + 7 + tearB * 10} Z`}
              fill="#7DD3FC"
              opacity={0.58 + 0.25 * (1 - tearB)}
            />
          </>
        )}

        {/* Eyebrows */}
        <Eyebrow mood={mood} cx={CENTER_X} eyeCY={eyeCY} eyeOffX={eyeOffX} color={renderColors.dark} />

        {/* Nose */}
        <G opacity={0.35}>
          <Ellipse cx={CENTER_X - 2.5} cy={headCY + 2} rx={1.8} ry={1.2} fill={colors.dark} />
          <Ellipse cx={CENTER_X + 2.5} cy={headCY + 2} rx={1.8} ry={1.2} fill={renderColors.dark} />
        </G>

        {/* Mouth */}
        <Mouth mood={mood} cx={CENTER_X} mY={mY} mw={mw} color={renderColors.dark} hopeful={encouragingMode} />

        {/* Hope accent for difficult states: subtle upward spark */}
        {encouragingMode && (
          <Path
            d={`M ${CENTER_X + 26},${headCY - 18} L ${CENTER_X + 29},${headCY - 11} L ${CENTER_X + 22},${headCY - 11} Z`}
            fill="#EAF6FF"
            opacity={0.75 + 0.15 * Math.sin(wobble)}
          />
        )}

        {/* Blush */}
        <Ellipse cx={CENTER_X - 14} cy={headCY + 6} rx={5} ry={3.5} fill={renderColors.main} opacity={blushOp * 0.4} />
        <Ellipse cx={CENTER_X + 14} cy={headCY + 6} rx={5} ry={3.5} fill={renderColors.main} opacity={blushOp * 0.4} />

        {/* Ears */}
        <Ellipse cx={CENTER_X - headRx - 1} cy={headCY} rx={4.5} ry={6.5} fill="url(#bodyGrad)" opacity={0.85} />
        <Ellipse cx={CENTER_X + headRx + 1} cy={headCY} rx={4.5} ry={6.5} fill="url(#bodyGrad)" opacity={0.85} />
        <Ellipse cx={CENTER_X - headRx - 1} cy={headCY - 1} rx={1.5} ry={2.5} fill="white" opacity={0.22} />
        <Ellipse cx={CENTER_X + headRx + 1} cy={headCY - 1} rx={1.5} ry={2.5} fill="white" opacity={0.22} />

        {/* Outlines */}
        <Path d={bodyPath} fill="none" stroke={renderColors.light} strokeWidth={1.6} opacity={0.6} />
        <Path d={armLPath} fill="none" stroke={renderColors.light} strokeWidth={1.4} opacity={0.55} />
        <Path d={armRPath} fill="none" stroke={renderColors.light} strokeWidth={1.4} opacity={0.55} />
        <Ellipse cx={CENTER_X} cy={headCY} rx={headRx} ry={headRy} fill="none" stroke={renderColors.light} strokeWidth={1.5} opacity={0.58} />
      </Svg>
    </Animated.View>
  );
}
