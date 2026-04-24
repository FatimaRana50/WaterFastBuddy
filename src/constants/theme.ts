// WaterFastBuddy design tokens — matches the web brand
// Palette distilled from the website: near-white backgrounds with vivid blue
// accents (light) and deep navy with electric blue (dark). Both modes share
// the same primary accent so screenshots look consistent side-by-side.
export const COLORS = {
  // Brand blues — used across both themes
  primary:      '#1B8CFF',   // vivid "WaterFastBuddy" blue
  primaryDark:  '#0B5DD1',
  primaryDeep:  '#083B8A',
  primaryLight: '#7FBEFF',
  accent:       '#21C7FF',   // cyan-ish gradient tail
  accentLight:  '#BCE9FF',

  // Kicker text (small uppercase section label)
  kicker:       '#1B8CFF',

  // Atmospheric support — kept for legacy callers
  mist:      '#EEF5FF',
  frost:     '#F6FAFF',
  navyInk:   '#0B1530',

  // Gradients (start → end)
  gradientStart: '#0B5DD1',
  gradientMid:   '#1B8CFF',
  gradientEnd:   '#21C7FF',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger:  '#EF4444',

  // BMI gauge
  underweight: '#60A5FA',
  normal:      '#10B981',
  overweight:  '#F59E0B',
  obese:       '#EF4444',

  white: '#FFFFFF',
  black: '#060E1E',
};

// Near-white neutrals, soft blue tint — matches the website's light hero
export const LIGHT_THEME = {
  background:    '#F4F8FE',
  surface:       '#FFFFFF',
  card:          '#FFFFFF',
  cardAlt:       '#EBF2FB',
  text:          '#0B1530',
  textSecondary: '#5C6B85',
  border:        '#D6E2F2',
  tabBar:        'rgba(255,255,255,0.96)',
  tabBarActive:  COLORS.primary,
  tabBarInactive:'#7E8DA8',
  headerBg:      '#0B5DD1',
  headerText:    '#FFFFFF',
  // Extras used by the new design system
  pillBg:        'rgba(255,255,255,0.94)', // floating top bar fill
  pillBorder:    'rgba(27,140,255,0.12)',
  glow:          'rgba(27,140,255,0.18)',
};

// Deep navy — matches the website's dark hero
export const DARK_THEME = {
  background:    '#060E1E',
  surface:       '#0E1B31',
  card:          '#162848',
  cardAlt:       '#0A142A',
  text:          '#E8F1FF',
  textSecondary: '#8BA2C8',
  border:        '#1F3358',
  tabBar:        'rgba(10,17,33,0.94)',
  tabBarActive:  COLORS.accent,
  tabBarInactive:'#5A7299',
  headerBg:      '#0A1630',
  headerText:    '#EAF4FF',
  pillBg:        'rgba(14,27,49,0.92)',
  pillBorder:    'rgba(27,140,255,0.28)',
  glow:          'rgba(33,199,255,0.22)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   18,
  xl:   22,
  xxl:  28,
  hero: 36,
};

export const BORDER_RADIUS = {
  sm:    8,
  md:    12,
  lg:    20,
  xl:    32,
  round: 9999,
};

// Inter font family names — loaded in App.tsx via @expo-google-fonts/inter.
export const FONT = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
  extra:    'Inter_800ExtraBold',
  black:    'Inter_900Black',
} as const;
