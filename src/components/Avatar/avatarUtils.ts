/**
 * avatarUtils.ts — Foundation math, color, geometry, and SVG path helpers
 * for the WaterFastBuddy "Premium Human Companion" avatar system.
 *
 * BACKWARDS COMPAT: every previously-exported symbol is preserved.
 *
 * NEW: image-based avatar system. The SVG character is now replaced by a
 * pre-rendered 3D PNG selected from `assets/avatars/` based on (gender, mood).
 * Use `avatarImageFor(gender, mood)` to fetch the require()'d module.
 */

import { UserProfile } from '../../types';

// ─── Canvas constants ────────────────────────────────────────────────────────
export const VW = 200;
export const VH = 360;
export const CX = VW / 2; // 100

// ─── Types ───────────────────────────────────────────────────────────────────
export type MoodState = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'distressed';
export type Gender = 'male' | 'female';

export interface WaterColors {
  main: string; dark: string; light: string; glow: string; accent: string;
  mid?: string; wave?: string;
}

// ─── Skin / hair / clothing palette (kept for legacy callers) ───────────────
export interface SkinPalette {
  base: string; shadow: string; highlight: string; blush: string; lip: string;
}

export const SKIN: SkinPalette = {
  base: '#F4B58A', shadow: '#C68660', highlight: '#FFD7B5',
  blush: '#F87171', lip: '#C25A6F',
};

export const HAIR = {
  female: { base: '#6B3A2A', shadow: '#3F2114', highlight: '#9C5B3F' },
  male:   { base: '#2C1810', shadow: '#120904', highlight: '#4A2A1A' },
} as const;

export const CLOTHING = {
  primary: '#1A56E8', secondary: '#0EA5E9', shadow: '#0B2F87',
  highlight: '#60A5FA', accent: '#14B8A6',
} as const;

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

// ─── Water colours ────────────────────────────────────────────────────────────
export function purityToColors(purity: number): WaterColors {
  if (purity >= 0.75) return { main: '#38BDF8', dark: '#0369A1', light: '#BAE6FD', glow: '#7DD3FC', accent: '#E0F2FE', mid: '#0EA5E9', wave: '#0284C7' };
  if (purity >= 0.50) return { main: '#22D3EE', dark: '#155E75', light: '#CFFAFE', glow: '#67E8F9', accent: '#ECFEFF', mid: '#06B6D4', wave: '#0891B2' };
  if (purity >= 0.30) return { main: '#14B8A6', dark: '#115E59', light: '#99F6E4', glow: '#5EEAD4', accent: '#CCFBF1', mid: '#0D9488', wave: '#0F766E' };
  if (purity >= 0.15) return { main: '#FACC15', dark: '#A16207', light: '#FEF08A', glow: '#FDE047', accent: '#FEFCE8', mid: '#EAB308', wave: '#CA8A04' };
  return                    { main: '#F97316', dark: '#9A3412', light: '#FED7AA', glow: '#FDBA74', accent: '#FFF7ED', mid: '#EA580C', wave: '#C2410C' };
}

export function fillPctToWater(fillPct: number): WaterColors {
  if (fillPct >= 0.75) return purityToColors(0.85);
  if (fillPct >= 0.50) return purityToColors(0.60);
  if (fillPct >= 0.30) return purityToColors(0.40);
  if (fillPct >= 0.15) return purityToColors(0.20);
  return purityToColors(0.05);
}

// ─── Wave paths (kept for legacy callers) ────────────────────────────────────
export function buildWavePath(offsetX: number, amplitude = 8, period = 30, height = 250, width = 240): string {
  let d = `M ${-offsetX},${height}`;
  for (let x = 0; x <= width; x += 4) {
    d += ` L ${x - offsetX},${amplitude * Math.sin((x / period) * Math.PI)}`;
  }
  return d + ` L ${width - offsetX},${height} Z`;
}

export function buildWaveTop(
  offsetX: number, surfaceY: number, amplitude = 4, period = 28, width = VW
): string {
  let d = `M ${-10},${surfaceY}`;
  for (let x = -10; x <= width + 10; x += 3) {
    const y = surfaceY + amplitude * Math.sin(((x + offsetX) / period) * Math.PI * 2);
    d += ` L ${x},${y}`;
  }
  d += ` L ${width + 10},${VH + 20} L ${-10},${VH + 20} Z`;
  return d;
}

// ─── Geometry (kept for legacy callers / MorphingAvatar maths) ──────────────
const BASE = {
  female: {
    headRx: 28, headRy: 34, headCY: 56,
    neckW: 18, shoulderW: 78, shoulderY: 116,
    waistW: 56, waistY: 196, hipW: 86, hipY: 236,
    legW: 26, legGap: 6, legBot: 348, armW: 18,
  },
  male: {
    headRx: 30, headRy: 36, headCY: 58,
    neckW: 24, shoulderW: 96, shoulderY: 120,
    waistW: 76, waistY: 198, hipW: 80, hipY: 238,
    legW: 30, legGap: 6, legBot: 348, armW: 22,
  },
} as const;

export function getGeometry(gender: Gender) { return BASE[gender]; }

export function fatF(bmi: number)  { return Math.max(0, Math.min(1, (bmi - 22) / 14)); }
export function thinF(bmi: number) { return Math.max(0, Math.min(1, (20 - bmi) / 6)); }

export function buildBodyPath(gender: Gender, bmi = 22): string {
  const g = BASE[gender];
  const ff = fatF(bmi), tf = thinF(bmi);
  const isF = gender === 'female';
  const shW = g.shoulderW + ff * 16 - tf * 8;
  const waW = g.waistW   + ff * 44 - tf * (isF ? 10 : 6);
  const hiW = g.hipW     + ff * 22 - tf * 6;
  const lgW = g.legW     + ff * 10 - tf * 4;
  const shL = CX - shW / 2, shR = CX + shW / 2;
  const waL = CX - waW / 2, waR = CX + waW / 2;
  const hiL = CX - hiW / 2, hiR = CX + hiW / 2;
  const lgLo = CX - g.legGap / 2 - lgW;
  const lgRo = CX + g.legGap / 2 + lgW;
  const lgLi = CX - g.legGap / 2;
  const lgRi = CX + g.legGap / 2;
  const neckY = g.headCY + g.headRy - 4;
  const waistPullF = isF ? 14 - ff * 10 : 4 - ff * 6;
  const lCtrl1x = shL + waistPullF * 0.4;
  const lCtrl2x = waL - 4 + ff * 6;
  const rCtrl1x = shR - waistPullF * 0.4;
  const rCtrl2x = waR + 4 - ff * 6;
  return [
    `M ${CX - g.neckW / 2},${neckY}`,
    `L ${shL},${g.shoulderY}`,
    `C ${lCtrl1x},${g.shoulderY + 32} ${lCtrl2x},${g.waistY - 14} ${waL},${g.waistY}`,
    `C ${waL - 4},${g.waistY + 14} ${hiL - 2},${g.hipY - 16} ${hiL},${g.hipY}`,
    `L ${lgLo},${g.hipY + 6}`,
    `L ${lgLo + 2},${g.legBot}`,
    `Q ${CX - g.legGap / 2 - lgW / 2},${g.legBot + 10} ${lgLi - 2},${g.legBot}`,
    `L ${lgLi},${g.hipY + 22}`,
    `Q ${CX},${g.hipY + 32} ${lgRi},${g.hipY + 22}`,
    `L ${lgRi + 2},${g.legBot}`,
    `Q ${CX + g.legGap / 2 + lgW / 2},${g.legBot + 10} ${lgRo - 2},${g.legBot}`,
    `L ${lgRo},${g.hipY + 6}`,
    `L ${hiR},${g.hipY}`,
    `C ${hiR + 2},${g.hipY - 16} ${rCtrl2x},${g.waistY + 14} ${waR},${g.waistY}`,
    `C ${rCtrl1x},${g.waistY - 14} ${shR},${g.shoulderY + 32} ${shR},${g.shoulderY}`,
    `L ${CX + g.neckW / 2},${neckY}`,
    'Z',
  ].join(' ');
}

export function buildArmPath(
  side: 'left' | 'right', gender: Gender, bmi = 22, raise = 0
): string {
  const g = BASE[gender];
  const ff = fatF(bmi);
  const shW = g.shoulderW + ff * 16;
  const aw  = g.armW + ff * 6;
  const sgn = side === 'left' ? -1 : 1;
  const sX  = CX + sgn * shW / 2;
  const top = g.shoulderY + 6;
  const r = Math.max(-1, Math.min(1, raise));
  const handX = sX + sgn * (32 + ff * 6) - sgn * r * 18;
  const handY = top + 110 - r * 130;
  const elbowX = (sX + handX) / 2 + sgn * (8 - r * 6);
  const elbowY = (top + handY) / 2 + 10;
  const oX = sX + sgn * aw * 0.55;
  const iX = sX + sgn * aw * 0.05;
  return [
    `M ${sX},${top}`,
    `Q ${oX},${top + 14} ${elbowX + sgn * aw / 2},${elbowY}`,
    `Q ${handX + sgn * aw / 2},${handY - 6} ${handX},${handY + aw / 2}`,
    `Q ${handX - sgn * aw / 2},${handY + aw} ${handX - sgn * aw * 0.6},${handY}`,
    `Q ${elbowX - sgn * aw / 2},${elbowY - 4} ${iX},${top + 28}`,
    `Q ${iX + sgn * 4},${top + 14} ${sX},${top}`,
    'Z',
  ].join(' ');
}

// ─── Hair (legacy) ───────────────────────────────────────────────────────────
export function buildFemaleHairPaths(cx: number, headCY: number, headRx: number, headRy: number): string[] {
  const topY = headCY - headRy;
  return [
    `M ${cx - headRx - 4},${headCY - 4}
     C ${cx - headRx - 8},${topY - 4} ${cx - 14},${topY - 14} ${cx},${topY - 12}
     C ${cx + 14},${topY - 14} ${cx + headRx + 8},${topY - 4} ${cx + headRx + 4},${headCY - 4}
     C ${cx + headRx + 2},${headCY - 12} ${cx + headRx - 2},${topY + 4} ${cx},${topY - 2}
     C ${cx - headRx + 2},${topY + 4} ${cx - headRx - 2},${headCY - 12} ${cx - headRx - 4},${headCY - 4} Z`,
    `M ${cx - headRx - 3},${headCY - 2}
     C ${cx - headRx - 10},${headCY + 14} ${cx - headRx - 8},${headCY + headRy + 4} ${cx - headRx + 4},${headCY + headRy + 10}
     L ${cx - headRx + 2},${headCY + headRy - 6}
     C ${cx - headRx + 2},${headCY + 6} ${cx - headRx - 1},${headCY - 2} ${cx - headRx - 3},${headCY - 2} Z`,
    `M ${cx + headRx + 3},${headCY - 2}
     C ${cx + headRx + 10},${headCY + 14} ${cx + headRx + 8},${headCY + headRy + 4} ${cx + headRx - 4},${headCY + headRy + 10}
     L ${cx + headRx - 2},${headCY + headRy - 6}
     C ${cx + headRx - 2},${headCY + 6} ${cx + headRx + 1},${headCY - 2} ${cx + headRx + 3},${headCY - 2} Z`,
    `M ${cx - 14},${topY + 4} Q ${cx - 2},${topY - 2} ${cx + 16},${topY + 8} Q ${cx + 4},${topY + 14} ${cx - 14},${topY + 12} Z`,
  ];
}

export function buildMaleHairPath(cx: number, headCY: number, headRx: number, headRy: number): string {
  const topY = headCY - headRy;
  return [
    `M ${cx - headRx - 1},${headCY - 6}
     C ${cx - headRx - 4},${topY - 2} ${cx - 12},${topY - 10} ${cx},${topY - 8}
     C ${cx + 12},${topY - 10} ${cx + headRx + 4},${topY - 2} ${cx + headRx + 1},${headCY - 6}
     C ${cx + headRx - 2},${topY + 8} ${cx + 8},${topY + 2} ${cx - 4},${topY + 6}
     C ${cx - 14},${topY + 4} ${cx - headRx + 2},${topY + 8} ${cx - headRx - 1},${headCY - 6} Z`,
  ].join(' ');
}

// ─── Mood face descriptor (legacy) ───────────────────────────────────────────
export interface MoodFace {
  eyeOpen: number; browTilt: number; browLift: number;
  mouthCurve: number; mouthOpen: number;
  blush: number; tears: 0 | 1 | 2;
  auraColor: string; sparkles: boolean;
}

export function moodToFace(mood: MoodState): MoodFace {
  switch (mood) {
    case 'ecstatic':   return { eyeOpen: 0.35, browTilt: 0,   browLift: 4,  mouthCurve: 1,    mouthOpen: 0.9, blush: 0.85, tears: 0, auraColor: '#FACC15', sparkles: true };
    case 'happy':      return { eyeOpen: 0.85, browTilt: 0,   browLift: 2,  mouthCurve: 0.7,  mouthOpen: 0.25, blush: 0.45, tears: 0, auraColor: '#38BDF8', sparkles: false };
    case 'neutral':    return { eyeOpen: 1.0,  browTilt: 0,   browLift: 0,  mouthCurve: 0.2,  mouthOpen: 0,    blush: 0.15, tears: 0, auraColor: '#60A5FA', sparkles: false };
    case 'sad':        return { eyeOpen: 0.55, browTilt: 0.6, browLift: -1, mouthCurve: -0.6, mouthOpen: 0,    blush: 0.05, tears: 1, auraColor: '#64748B', sparkles: false };
    case 'distressed':
    default:           return { eyeOpen: 0.45, browTilt: 1.0, browLift: -2, mouthCurve: -0.9, mouthOpen: 0.2,  blush: 0.0,  tears: 2, auraColor: '#FB923C', sparkles: false };
  }
}

// ─── Backwards-compat stubs ───────────────────────────────────────────────────
export function bmiToScale(_bmi: number) { return 1; }
export function heightToScale(_h: number) { return 1; }

// ============================================================================
// NEW: Image-based avatar lookup
// ============================================================================
//
// 10 hand-rendered 3D portraits live in `assets/avatars/`. Selection is driven
// purely by (gender, mood). Body-shape variation by BMI is encoded into the
// art direction itself (lean/athletic/fuller silhouettes are blended across
// the moods); fillPct / fasting state drives the mood, which drives the asset.
//
// Paths are relative to this file (src/components/Avatar/avatarUtils.ts):
//   ../../../assets/avatars/avatar_<gender>_<mood>.png
//
// All assets must use require() so Metro bundles them.

export type AvatarImage = number; // require() returns a numeric module id in RN

// Wrapped in an IIFE so a missing/unresolved image can't crash the whole module.
// If any require() fails (e.g. stale Metro cache before images were added),
// avatarImageFor() returns undefined safely rather than throwing.
const AVATAR_IMAGES: Partial<Record<Gender, Partial<Record<MoodState, AvatarImage>>>> = (() => {
  try {
    return {
      female: {
        happy:      require('../../../assets/avatars/avatar_female_happy.png'),
        ecstatic:   require('../../../assets/avatars/avatar_female_ecstatic.png'),
        neutral:    require('../../../assets/avatars/avatar_female_neutral.png'),
        sad:        require('../../../assets/avatars/avatar_female_sad.png'),
        distressed: require('../../../assets/avatars/avatar_female_distressed.png'),
      },
      male: {
        happy:      require('../../../assets/avatars/avatar_male_happy.png'),
        ecstatic:   require('../../../assets/avatars/avatar_male_ecstatic.png'),
        neutral:    require('../../../assets/avatars/avatar_male_neutral.png'),
        sad:        require('../../../assets/avatars/avatar_male_sad.png'),
        distressed: require('../../../assets/avatars/avatar_male_distressed.png'),
      },
    };
  } catch (e) {
    console.warn('WaterFastBuddy: avatar images failed to load. Run: npx expo start --clear');
    return {};
  }
})();

/**
 * Returns the require()'d PNG module for the given gender + mood.
 * Falls back to neutral if anything is off.
 */
export function avatarImageFor(gender: Gender, mood: MoodState): AvatarImage {
  // Prefer exact match
  const bucket = AVATAR_IMAGES[gender] ?? AVATAR_IMAGES.female ?? Object.values(AVATAR_IMAGES)[0] ?? {};
  const byMood = (bucket as Partial<Record<MoodState, AvatarImage>>)[mood] ?? (bucket as any).neutral;
  if (typeof byMood === 'number') return byMood as AvatarImage;

  // Try female neutral as a known-good fallback
  const femaleNeutral = AVATAR_IMAGES.female?.neutral;
  if (typeof femaleNeutral === 'number') return femaleNeutral;

  // Pick any available image from the map
  for (const g of Object.keys(AVATAR_IMAGES) as Gender[]) {
    const b = AVATAR_IMAGES[g];
    if (!b) continue;
    const anyImg = b.neutral ?? Object.values(b)[0];
    if (typeof anyImg === 'number') return anyImg as AvatarImage;
  }

  // Last resort: return 0 to satisfy the type system (shouldn't happen in normal builds)
  return 0 as AvatarImage;
}

/**
 * Convenience: derive (gender, mood) → image directly from a profile +
 * fasting state + hydration fill, using the existing purity/mood pipeline.
 */
export function avatarImageForProfile(
  profile: UserProfile,
  fastingHours = 0,
  fillPct = 0.6,
): AvatarImage {
  // Blend hydration fill into purity so low fill drags mood down.
  const purity = calcPurity(profile, fastingHours) * 0.6 + Math.max(0, Math.min(1, fillPct)) * 0.4;
  const mood = calcMood(purity, fastingHours);
  return avatarImageFor(profile.gender, mood);
}
