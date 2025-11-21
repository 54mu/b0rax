import { BoraIntensity } from './types';

// Coordinates
export const TRIESTE_COORDS = { lat: 45.6495, lon: 13.7768 };
export const MARIBOR_COORDS = { lat: 46.5547, lon: 15.6459 };

// Thresholds for Pressure Difference (hPa)
// Positive diff = Maribor High, Trieste Low => Bora flows SW
export const THRESHOLDS = {
  MODERATE: 4,
  STRONG: 8,
  EXTREME: 12
};

export const TOKYO_COLORS = {
  bg: '#1a1b26',
  card: '#24283b',
  fg: '#a9b1d6',
  accent: '#7aa2f7',
  red: '#f7768e',
  green: '#9ece6a',
  yellow: '#e0af68',
  orange: '#ff9e64',
  purple: '#bb9af7',
  cyan: '#7dcfff'
};

export const getTimeOfDay = (date: Date): string => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Mattina';
  if (hour >= 12 && hour < 17) return 'Pomeriggio';
  if (hour >= 17 && hour < 22) return 'Sera';
  return 'Notte';
};

export const getBoraIntensity = (diff: number): BoraIntensity => {
  if (diff < 2) return BoraIntensity.NONE;
  if (diff < THRESHOLDS.MODERATE) return BoraIntensity.WEAK;
  if (diff < THRESHOLDS.STRONG) return BoraIntensity.MODERATE;
  if (diff < THRESHOLDS.EXTREME) return BoraIntensity.STRONG;
  return BoraIntensity.EXTREME;
};

export const getIntensityColor = (intensity: BoraIntensity): string => {
  switch (intensity) {
    case BoraIntensity.NONE: return TOKYO_COLORS.fg;
    case BoraIntensity.WEAK: return TOKYO_COLORS.accent;
    case BoraIntensity.MODERATE: return TOKYO_COLORS.green;
    case BoraIntensity.STRONG: return TOKYO_COLORS.yellow;
    case BoraIntensity.EXTREME: return TOKYO_COLORS.red;
    default: return TOKYO_COLORS.fg;
  }
};

/**
 * Calculates Wind Chill using the standard formula.
 * T_wc = 13.12 + 0.6215*Ta - 11.37*v^0.16 + 0.3965*Ta*v^0.16
 * Valid generally for T <= 10°C and v > 4.8 km/h.
 * If conditions aren't met, returns the actual temperature.
 */
export const calculateWindChill = (temp: number, windSpeed: number): number => {
  if (temp > 10 || windSpeed <= 4.8) {
    return temp;
  }
  
  const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
  return parseFloat(wc.toFixed(1));
};