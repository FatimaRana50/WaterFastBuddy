/**
 * avatarUtils.ts — math, color, and SVG path helpers for the WaterFastBuddy avatar.
 * Design: "Translucent Glass Water-Being" — glassy outer shell, living water inside.
 */

import { UserProfile } from '../../types';

export const VW = 120;
export const VH = 260;
export const CX = VW / 2; // 60

// ─── Types ────────────────────────────────────────────────────────────────────
export type MoodState = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'distressed';
export type Gender = 'male' | 'female';

export interface WaterColors {
  main: string; dark: string; light: string; glow: string; accent: string;
  mid?: string; wave?: string;
}

// ─── Purity & Mood ────────────────────────────────────────────────────────────
export function calcPurity(profile: UserProfile, fastingHours = 0): number {
  const bmi = profile.weightKg / ((profile.heightCm / 100) ** 2);
  const bmiFactor = bmi >= 18.5 && bmi <= 25 ? 1.0 : bmi >= 16 && bmi <= 30 ? 0.6 : 0.25;
  const actMap: Record<string, number> = {
    very_active: 1.0, active: 0.85, moderate: 0.65, light: 0.45, sedentary: 0.25,
  };
  const fastFactor = Math.min(fastingHours / 48, 1.0);
  return Math.max(0, Math.min(1,
    bmiFactor * 0.45 + (actMap[profile.activityLevel] ?? 0.5) * 0.30 + fastFactor * 0.25
  ));
}

export function calcMood(purity: number, fastingHours: number): MoodState {
  if (purity >= 0.75 && fastingHours >= 12) return 'ecstatic';
  if (purity >= 0.60) return 'happy';
  if (purity >= 0.40) return 'neutral';
  if (purity >= 0.20) return 'sad';
  return 'distressed';
}

export function moodToLabel(mood: MoodState): string {
  const m: Record<MoodState, string> = {
    ecstatic: '✨ Glowing & Pure!', happy: '😊 Hydrated & Happy',
    neutral: '🙂 Doing Alright', sad: '😐 Needs More Water', distressed: '😟 Dehydrated',
  };
  return m[mood];
}

// ─── Milestones ───────────────────────────────────────────────────────────────
export const FAST_MILESTONES = [12, 16, 18, 24, 36, 48, 72] as const;
export function recentMilestone(fastingHours: number, windowH = 0.25): number | null {
  for (const m of FAST_MILESTONES) {
    if (fastingHours >= m && fastingHours - m <= windowH) return m;
  }
  return null;
}

// ─── Colors ───────────────────────────────────────────────────────────────────
export function purityToColors(purity: number): WaterColors {
  if (purity >= 0.75) return { main: '#60A5FA', dark: '#1D4ED8', light: '#DBEAFE', glow: '#93C5FD', accent: '#EFF6FF', mid: '#3B82F6', wave: '#2563EB' };
  if (purity >= 0.50) return { main: '#38BDF8', dark: '#0369A1', light: '#BAE6FD', glow: '#7DD3FC', accent: '#E0F2FE', mid: '#0EA5E9', wave: '#0284C7' };
  if (purity >= 0.30) return { main: '#2DD4BF', dark: '#0F766E', light: '#99F6E4', glow: '#5EEAD4', accent: '#CCFBF1', mid: '#14B8A6', wave: '#0D9488' };
  if (purity >= 0.15) return { main: '#FACC15', dark: '#A16207', light: '#FEF08A', glow: '#FDE047', accent: '#FEFCE8', mid: '#EAB308', wave: '#CA8A04' };
  return { main: '#FB923C', dark: '#9A3412', light: '#FED7AA', glow: '#FDBA74', accent: '#FFF7ED', mid: '#F97316', wave: '#EA580C' };
}

// ─── Wave path ────────────────────────────────────────────────────────────────
export function buildWavePath(offsetX: number, amplitude = 8, period = 30, height = 250, width = 240): string {
  let d = `M ${-offsetX},${height}`;
  for (let x = 0; x <= width; x += 4) {
    d += ` L ${x - offsetX},${amplitude * Math.sin((x / period) * Math.PI)}`;
  }
  return d + ` L ${width - offsetX},${height} Z`;
}

// ─── Geometry ─────────────────────────────────────────────────────────────────
const BASE = {
  female: {
    headRx: 17, headRy: 20, headCY: 28,
    neckW: 12, shoulderW: 46, shoulderY: 64,
    waistW: 32, waistY: 124, hipW: 50, hipY: 158,
    legW: 19, legGap: 4, legBot: 250, armW: 12,
  },
  male: {
    headRx: 18, headRy: 21, headCY: 28,
    neckW: 15, shoulderW: 56, shoulderY: 64,
    waistW: 42, waistY: 124, hipW: 46, hipY: 158,
    legW: 21, legGap: 4, legBot: 250, armW: 15,
  },
} as const;

export function getGeometry(gender: Gender) { return BASE[gender]; }

// BMI morph helpers (0=lean, 1=very obese)
function fatF(bmi: number)  { return Math.max(0, Math.min(1, (bmi - 20) / 18)); }
function thinF(bmi: number) { return Math.max(0, Math.min(1, (20 - bmi) / 6)); }

// ─── Body silhouette (BMI-morphed) ───────────────────────────────────────────
export function buildBodyPath(gender: Gender, bmi = 22): string {
  const g = BASE[gender];
  const ff = fatF(bmi), tf = thinF(bmi);

  const shW = g.shoulderW + ff * 10 - tf * 7;
  const waW = g.waistW   + ff * 38 - tf * 9;
  const hiW = g.hipW     + ff * 16 - tf * 5;
  const lgW = g.legW     + ff * 7  - tf * 3;

  const shL = CX - shW / 2, shR = CX + shW / 2;
  const waL = CX - waW / 2, waR = CX + waW / 2;
  const hiL = CX - hiW / 2, hiR = CX + hiW / 2;
  const lgLo = CX - g.legGap / 2 - lgW;
  const lgRo = CX + g.legGap / 2 + lgW;
  const lgLi = CX - g.legGap / 2;
  const lgRi = CX + g.legGap / 2;
  const neckY = g.headCY + g.headRy - 2;

  // Control points: fat bodies don't curve inward at waist
  const lCtrl1x = shL - 3 + ff * 10;
  const lCtrl2x = waL - 2 + ff * 5;
  const rCtrl1x = shR + 3 - ff * 10;
  const rCtrl2x = waR + 2 - ff * 5;

  return [
    `M ${CX - g.neckW / 2},${neckY}`,
    `L ${shL},${g.shoulderY}`,
    `C ${lCtrl1x},${g.shoulderY + 24} ${lCtrl2x},${g.waistY - 10} ${waL},${g.waistY}`,
    `C ${waL},${g.waistY + 12} ${hiL - 2},${g.hipY - 14} ${hiL},${g.hipY}`,
    `L ${lgLo},${g.hipY + 4}`,
    `L ${lgLo + 1},${g.legBot}`,
    `Q ${CX - g.legGap / 2 - lgW / 2},${g.legBot + 8} ${lgLi - 1},${g.legBot}`,
    `L ${lgLi},${g.hipY + 18}`,
    `Q ${CX},${g.hipY + 27} ${lgRi},${g.hipY + 18}`,
    `L ${lgRi + 1},${g.legBot}`,
    `Q ${CX + g.legGap / 2 + lgW / 2},${g.legBot + 8} ${lgRo - 1},${g.legBot}`,
    `L ${lgRo},${g.hipY + 4}`,
    `L ${hiR},${g.hipY}`,
    `C ${hiR + 2},${g.hipY - 14} ${rCtrl2x},${g.waistY + 12} ${waR},${g.waistY}`,
    `C ${rCtrl1x},${g.waistY - 10} ${shR + 3},${g.shoulderY + 24} ${shR},${g.shoulderY}`,
    `L ${CX + g.neckW / 2},${neckY}`,
    'Z',
  ].join(' ');
}

export function buildArmPath(side: 'left' | 'right', gender: Gender, bmi = 22): string {
  const g = BASE[gender];
  const ff = fatF(bmi);
  const shW = g.shoulderW + ff * 10;
  const aw  = g.armW + ff * 5;
  const sX  = side === 'left' ? CX - shW / 2 : CX + shW / 2;
  const sgn = side === 'left' ? -1 : 1;
  const oX  = sX + sgn * aw * 0.85;
  const iX  = sX + sgn * aw * 0.1;
  const top = g.shoulderY + 4;
  const bot = g.shoulderY + 80;
  return [
    `M ${sX},${top}`,
    `C ${oX},${top + 12} ${oX + sgn * 3},${top + 44} ${oX - sgn},${bot}`,
    `Q ${oX - sgn * aw / 2},${bot + 9} ${iX},${bot - 5}`,
    `C ${iX + sgn * 2},${top + 28} ${iX},${top + 12} ${sX},${top}`,
    'Z',
  ].join(' ');
}

// ─── Hair paths ───────────────────────────────────────────────────────────────

/** Female: bun on top + flowing side strands. Returns array of SVG path strings. */
export function buildFemaleHairPaths(cx: number, headCY: number, headRx: number, headRy: number): string[] {
  const topY = headCY - headRy;
  return [
    // Bun dome (filled ellipse shape)
    `M ${cx - 17},${topY + 5} A 17 13 0 0 1 ${cx + 17},${topY + 5} L ${cx + 13},${topY + 11} L ${cx - 13},${topY + 11} Z`,
    // Bun bump at very top
    `M ${cx - 10},${topY + 3} A 10 9 0 0 1 ${cx + 10},${topY + 3}`,
    // Left flowing strand
    `M ${cx - headRx + 1},${headCY - 4} C ${cx - headRx - 7},${headCY + 10} ${cx - headRx - 5},${headCY + 24} ${cx - headRx},${headCY + 33}`,
    // Right flowing strand
    `M ${cx + headRx - 1},${headCY - 4} C ${cx + headRx + 7},${headCY + 10} ${cx + headRx + 5},${headCY + 24} ${cx + headRx},${headCY + 33}`,
    // Front hair fringe across forehead
    `M ${cx - 15},${topY + 2} Q ${cx - 5},${topY - 4} ${cx},${topY - 2} Q ${cx + 5},${topY - 4} ${cx + 15},${topY + 2}`,
  ];
}

/** Male: short swept strokes. Returns a single SVG path string (multi-stroke). */
export function buildMaleHairPath(cx: number, headCY: number, _headRx: number, headRy: number): string {
  const topY = headCY - headRy;
  return [
    `M ${cx - 18},${topY + 5} Q ${cx - 10},${topY - 5} ${cx - 2},${topY - 3}`,
    `M ${cx - 10},${topY + 3} Q ${cx},${topY - 7} ${cx + 10},${topY - 4}`,
    `M ${cx - 2},${topY + 1} Q ${cx + 8},${topY - 7} ${cx + 17},${topY - 2}`,
    `M ${cx + 8},${topY + 4} Q ${cx + 15},${topY - 3} ${cx + 19},${topY + 3}`,
    `M ${cx - 18},${topY + 7} C ${cx - 20},${topY + 13} ${cx - 17},${topY + 17} ${cx - 14},${topY + 18}`,
    `M ${cx + 16},${topY + 7} C ${cx + 19},${topY + 12} ${cx + 17},${topY + 17} ${cx + 14},${topY + 18}`,
  ].join(' ');
}

// ─── Backwards-compat stubs ───────────────────────────────────────────────────
export function bmiToScale(_bmi: number) { return 1; }
export function heightToScale(_h: number) { return 1; }
