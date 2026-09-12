/**
 * Centralized Design System Palette & Theme Tokens
 *
 * Single source of truth for all application styling.
 * Organized by core semantics and color families (green, red, blue, amber, slate, neutrals)
 * with reusable surface (S1, S2), border, and dark text shades.
 */
export const ThemeColors = {
  // Brand & Core Semantics
  primary: '#2563EB',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  disabled: '#94A3B8',
  disabledBackground: '#CBD5E1',

  // Green Family (Success, Inside Geofence, Active)
  green: '#10B981',
  greenDark: '#065F46',
  greenBorder: '#A7F3D0',
  greenS1: '#ECFDF5',
  greenS2: '#DCFCE7',

  // Red Family (Danger, Outside Geofence, Error)
  red: '#EF4444',
  redDark: '#991B1B',
  redBorder: '#FECACA',
  redS1: '#FEE2E2',

  // Blue Family (Info, Locating, Active Highlights)
  blue: '#2563EB',
  blueDark: '#1E40AF',
  blueText: '#1D4ED8',
  blueBorder: '#BFDBFE',
  blueS1: '#EFF6FF',
  blueS2: '#DBEAFE',

  // Amber Family (Warning, Weak GPS, Stale Fix)
  amber: '#F59E0B',
  amberDark: '#92400E',
  amberText: '#D97706',
  amberBorder: '#FDE68A',
  amberS1: '#FEF3C7',

  // Slate Family (Dark Neutral, Offline Banner, Muted Icons)
  slateDark: '#1E293B',
  slateBorder: '#334155',
  slateMuted: '#475569',
  slateLight: '#F1F5F9',

  // Grayscale & Basics
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8D8D8D',
  grayS1: '#C8C8C8',
  grayS2: '#E5E5E5',
  grayS3: '#F9F9FB',
  transparent: 'transparent',

  // Map Alpha Overlays
  geofenceInsideStroke: '#10B981',
  geofenceInsideFill: 'rgba(16, 185, 129, 0.15)',
  geofenceOutsideStroke: '#3B82F6',
  geofenceOutsideFill: 'rgba(59, 130, 246, 0.12)',
  userMarkerRing: 'rgba(37, 99, 235, 0.2)',
  userAccuracyStroke: 'rgba(59, 130, 246, 0.35)',
  userAccuracyFill: 'rgba(59, 130, 246, 0.08)',

  // Semantic Aliases
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

