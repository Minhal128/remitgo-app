import { Colors } from './Colors';

// Theme interfaces
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  cardBackground: string;
  surfaceBackground: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  border: string;
  borderLight: string;
  divider: string;
  shadow: string;
  shadowLight: string;
  accent: string;
  highlight: string;
  overlay: string;
  cardGradient: string[];
  successGradient: string[];
  warningGradient: string[];
  errorGradient: string[];
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  h1: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  h2: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  h3: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  h4: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  body: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  bodySmall: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  caption: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  button: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
}

export interface ThemeShadows {
  small: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  medium: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  large: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface ThemeBorderRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
}

// Spacing constants
export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography constants
export const typography: ThemeTypography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
};

// Border radius constants
export const borderRadius: ThemeBorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

// Create shadows with the new color system
export const createShadows = (): ThemeShadows => {
  const colors = Colors.light;
  
  return {
    small: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  };
};

// Create theme with the new color system
export const createTheme = (): Theme => {
  return {
    colors: Colors.light,
    spacing,
    typography,
    shadows: createShadows(),
    borderRadius,
  };
};

// Theme utilities
export const ThemeUtils = {
  // Get current theme (always light)
  getTheme: () => createTheme(),
  
  // Get colors
  getColors: () => Colors.light,
  
  // Get spacing
  getSpacing: () => spacing,
  
  // Get typography
  getTypography: () => typography,
  
  // Get shadows
  getShadows: () => createShadows(),
  
  // Get border radius
  getBorderRadius: () => borderRadius,
};
