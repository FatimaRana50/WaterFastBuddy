// WaterFastBuddy design tokens — blue water aesthetic
export const COLORS = {
  // Brand blues
  primary: '#1972E8',
  primaryDark: '#0A3E93',
  primaryLight: '#7DB7FF',
  accent: '#21B0D8',
  accentLight: '#C7EEFF',

  // Atmospheric support
  mist: '#EAF4FF',
  frost: '#F6FAFF',
  navyInk: '#0E2443',

  // Gradients (start → end)
  gradientStart: '#0E5EE4',
  gradientMid: '#2A85F2',
  gradientEnd: '#63C7E8',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // BMI gauge
  underweight: '#60A5FA',
  normal: '#10B981',
  overweight: '#F59E0B',
  obese: '#EF4444',

  white: '#FFFFFF',
  black: '#0F172A',
};

export const LIGHT_THEME = {
  background: '#EAF4FF',
  surface: '#F7FBFF',
  card: '#FFFFFF',
  cardAlt: '#E6F2FF',
  text: '#0E2443',
  textSecondary: '#5F7897',
  border: '#CCE0F7',
  tabBar: 'rgba(255,255,255,0.94)',
  tabBarActive: COLORS.primary,
  tabBarInactive: '#7E99B8',
  headerBg: '#1E63E9',
  headerText: '#FFFFFF',
};

export const DARK_THEME = {
  background: '#071429',
  surface: '#102B4A',
  card: '#163A61',
  cardAlt: '#0C213D',
  text: '#E8F4FF',
  textSecondary: '#8FB4D7',
  border: '#214B75',
  tabBar: 'rgba(10,27,49,0.92)',
  tabBarActive: COLORS.accent,
  tabBarInactive: '#5D85A8',
  headerBg: '#10243E',
  headerText: '#EAF4FF',
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
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  round: 9999,
};
