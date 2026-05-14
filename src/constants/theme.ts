// WaterFastBuddy design tokens — matches the web brand
export const COLORS = {
  // Brand blues — light-theme values used by default for shared UI
  primary:      '#0694F9',   // hsl(205 95% 50%)
  primaryGlow:  '#4DD2FF',   // hsl(195 100% 65%)
  primaryDeep:  '#073D88',   // hsl(215 90% 28%)
  primaryDark:  '#073D88',   // alias for primaryDeep
  primaryLight: '#7FBEFF',
  accent:       '#38DAFA',   // hsl(190 95% 60%)
  accentLight:  '#BCE9FF',

  // Kicker text (small uppercase section label)
  kicker:       '#0694F9',

  // Atmospheric support — kept for legacy callers
  mist:      '#EEF5FF',
  frost:     '#F6FAFF',
  navyInk:   '#0B1530',

  // Gradients (start → end)
  gradientStart: '#073D88',
  gradientMid:   '#0694F9',
  gradientEnd:   '#38DAFA',

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
  tabBarActive:  '#0694F9',
  tabBarInactive:'#7E8DA8',
  headerBg:      '#073D88',
  headerText:    '#FFFFFF',
  pillBg:        'rgba(255,255,255,0.94)',
  pillBorder:    'rgba(6,148,249,0.12)',
  glow:          'rgba(6,148,249,0.18)',
  // Theme-specific brand blues — hsl(205 95% 50%), hsl(195 100% 65%), hsl(215 90% 28%), hsl(190 95% 60%)
  primary:      '#0694F9',
  primaryGlow:  '#4DD2FF',
  primaryDeep:  '#073D88',
  accent:       '#38DAFA',
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
  tabBarActive:  '#00B8FF',
  tabBarInactive:'#5A7299',
  headerBg:      '#0A1630',
  headerText:    '#EAF4FF',
  pillBg:        'rgba(14,27,49,0.92)',
  pillBorder:    'rgba(0,184,255,0.28)',
  glow:          'rgba(0,229,255,0.22)',
  // Theme-specific brand blues — hsl(193 100% 50%), hsl(185 100% 62%), hsl(200 85% 38%), hsl(185 100% 50%)
  primary:      '#00B8FF',
  primaryGlow:  '#3DEBFF',
  primaryDeep:  '#0F6FB3',
  accent:       '#00E5FF',
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
