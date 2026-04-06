/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Ensure the theme exists and has the required color
    const themeColors = Colors[theme];
    if (themeColors && themeColors[colorName]) {
      return themeColors[colorName];
    }
    
    // Fallback to light theme if dark theme is missing the color
    if (theme === 'dark' && Colors.light[colorName]) {
      return Colors.light[colorName];
    }
    
    // Final fallback to a safe default color based on the colorName
    const fallbackColors: { [key: string]: string } = {
      background: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
      text: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
      primary: theme === 'dark' ? '#3A5A8F' : '#25467D',
      secondary: theme === 'dark' ? '#FF8A65' : '#FF6B35',
      border: theme === 'dark' ? '#404040' : '#E9ECEF',
      cardBackground: theme === 'dark' ? '#2D2D2D' : '#FFFFFF',
      surfaceBackground: theme === 'dark' ? '#252525' : '#F8F9FA',
      textPrimary: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
      textSecondary: theme === 'dark' ? '#B0B0B0' : '#6C757D',
      textTertiary: theme === 'dark' ? '#808080' : '#ADB5BD',
      textInverse: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
      success: theme === 'dark' ? '#4CAF50' : '#28A745',
      warning: theme === 'dark' ? '#FF9800' : '#FFC107',
      error: theme === 'dark' ? '#F44336' : '#DC3545',
      info: theme === 'dark' ? '#2196F3' : '#17A2B8',
      borderLight: theme === 'dark' ? '#505050' : '#F1F3F4',
      divider: theme === 'dark' ? '#333333' : '#DEE2E6',
      shadow: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(37, 70, 125, 0.1)',
      shadowLight: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(37, 70, 125, 0.05)',
      accent: theme === 'dark' ? '#3A5A8F' : '#25467D',
      highlight: theme === 'dark' ? '#FF8A65' : '#FF6B35',
      overlay: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(37, 70, 125, 0.8)',
      cardGradient: theme === 'dark' ? ['#2D2D2D', '#404040'] : ['#25467D', '#3A5A8F'],
      successGradient: theme === 'dark' ? ['#4CAF50', '#388E3C'] : ['#28A745', '#20C997'],
      warningGradient: theme === 'dark' ? ['#FF9800', '#F57C00'] : ['#FFC107', '#FD7E14'],
      errorGradient: theme === 'dark' ? ['#F44336', '#D32F2F'] : ['#DC3545', '#E83E8C'],
      primaryLight: theme === 'dark' ? '#4A6A9F' : '#3A5A8F',
      primaryDark: theme === 'dark' ? '#25467D' : '#1A2F5A',
      secondaryLight: theme === 'dark' ? '#FFAB91' : '#FF8A65',
      secondaryDark: theme === 'dark' ? '#FF6B35' : '#E55A2B',
      successLight: theme === 'dark' ? '#2E7D32' : '#D4EDDA',
      warningLight: theme === 'dark' ? '#F57C00' : '#FFF3CD',
      errorLight: theme === 'dark' ? '#D32F2F' : '#F8D7DA',
      infoLight: theme === 'dark' ? '#1976D2' : '#D1ECF1',
      tint: theme === 'dark' ? '#4A6A9F' : '#0a7ea4',
      icon: theme === 'dark' ? '#B0B0B0' : '#6C757D'
    };
    
    return fallbackColors[colorName] || (theme === 'dark' ? '#FFFFFF' : '#000000');
  }
}
