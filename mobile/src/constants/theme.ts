// Anaska Cyber-Sonic / Obsidian Precision Design System
// Inspired by stitch_anaska_ai_music_streamer

export const colors = {
  // Pure Obsidian & Deep Black Foundations
  background: '#000000',
  backgroundElevated: '#0a0a0a',
  surface: '#111111',
  surfaceElevated: '#181818',
  surfaceCard: '#111111',
  surfaceCardHover: '#1c1c1c',
  surfaceGlass: 'rgba(17, 17, 17, 0.95)',

  // Electric Blue & Cyber-Sonic Accents
  primary: '#2563eb', // Vibrant Electric Blue
  primaryLight: '#3b82f6', // Light Blue Accent
  primaryDark: '#1d4ed8', // Deep Blue
  primaryGlow: 'rgba(37, 99, 235, 0.35)',

  // Cyan & Rime Highlights
  secondary: '#38bdf8', // Arctic Sky Blue
  secondaryGlow: 'rgba(56, 189, 248, 0.25)',
  cyanAccent: '#06b6d4',

  // Gradient presets
  gradientPrimary: ['#2563eb', '#3b82f6'] as const,
  gradientCyan: ['#00F2FE', '#38BDF8'] as const,
  gradientCard: ['#111111', '#181818'] as const,
  gradientOrb: ['#1d4ed8', '#2563eb', '#38bdf8'] as const,

  // Text Hierarchy
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textFrost: '#e2e8f0',
  textDark: '#000000',

  // Crisp Flat Borders
  border: '#262626',
  borderLight: '#333333',
  borderHighlight: 'rgba(59, 130, 246, 0.5)',

  // Status & Feedback
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 9999,
};
