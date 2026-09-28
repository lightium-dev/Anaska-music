export const colors = {
  // Deep obsidian foundations
  background: '#070B14',
  backgroundLow: '#050912',
  surface: '#0A111F',
  surfaceElevated: '#0E182A',
  surfaceCard: '#142135',
  surfaceCardHover: '#1B2C45',
  surfaceGlass: 'rgba(14, 24, 42, 0.75)',

  // Sub-Zero Electric Cyan & Glacial Blues
  primary: '#00F2FE', // Electric Cyan
  primaryLight: '#E0FDFF',
  primaryDark: '#00B8C4',
  primaryGlow: 'rgba(0, 242, 254, 0.45)',
  primaryGlowStrong: 'rgba(0, 242, 254, 0.75)',

  secondary: '#38BDF8', // Arctic Sky Blue
  secondaryContainer: '#0284C7',
  cyanRime: '#67E8F9',

  // Gradient presets
  gradientCyan: ['#00F2FE', '#38BDF8'] as const,
  gradientIce: ['#00F2FE', '#38BDF8', '#67E8F9'] as const,
  gradientOrb: ['#0284C7', '#00F2FE', '#F0F9FF'] as const,
  gradientCard: ['#0E1829', '#142135'] as const,
  gradientGlass: ['rgba(240, 249, 255, 0.08)', 'rgba(7, 11, 20, 0.75)'] as const,

  // Text & Typography
  textPrimary: '#FFFFFF',
  textFrost: '#E0F2FE',
  textSecondary: '#94A9C0',
  textMuted: '#4A6984',
  textDark: '#002022',

  // Crystalline Borders & Outlines
  border: 'rgba(0, 242, 254, 0.18)',
  borderHighlight: 'rgba(0, 242, 254, 0.45)',
  borderMuted: 'rgba(255, 255, 255, 0.08)',

  // Status & Feedback
  error: '#FF5555',
  success: '#00F2FE',
  warning: '#F59E0B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
};
