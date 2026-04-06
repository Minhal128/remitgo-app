/**
 * Modern Banking App Color System - White Theme Only
 * Professional colors inspired by top banking apps like Chase, Bank of America, and Wells Fargo
 * Clean white background with beautiful blue accents
 */

const tintColorLight = '#0a7ea4';

export const Colors = {
  light: {
    // Primary colors
    primary: '#25467D', // Main blue from user's image
    primaryLight: '#3A5A8F',
    primaryDark: '#1A2F5A',
    
    // Secondary colors
    secondary: '#FF6B35', // Orange accent color
    secondaryLight: '#FF8A65',
    secondaryDark: '#E55A2B',
    
    // Background colors
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    surfaceBackground: '#F8F9FA',
    
    // Text colors
    text: '#1A1A1A', // Added missing text property
    textPrimary: '#1A1A1A',
    textSecondary: '#6C757D',
    textTertiary: '#ADB5BD',
    textInverse: '#FFFFFF',
    
    // Status colors
    success: '#28A745',
    successLight: '#D4EDDA',
    warning: '#FFC107',
    warningLight: '#FFF3CD',
    error: '#DC3545',
    errorLight: '#F8D7DA',
    info: '#17A2B8',
    infoLight: '#D1ECF1',
    
    // Border and divider colors
    border: '#E9ECEF',
    borderLight: '#F1F3F4',
    divider: '#DEE2E6',
    
    // Shadow colors
    shadow: 'rgba(37, 70, 125, 0.1)',
    shadowLight: 'rgba(37, 70, 125, 0.05)',
    
    // Special colors
    accent: '#25467D',
    highlight: '#FF6B35',
    overlay: 'rgba(37, 70, 125, 0.8)',
    tint: '#0a7ea4', // Added missing tint property
    icon: '#6C757D', // Added missing icon property
    
    // Banking specific colors
    cardGradient: ['#25467D', '#3A5A8F'],
    successGradient: ['#28A745', '#20C997'],
    warningGradient: ['#FFC107', '#FD7E14'],
    errorGradient: ['#DC3545', '#E83E8C'],
  },
  dark: {
    // Primary colors
    primary: '#3A5A8F',
    primaryLight: '#4A6A9F',
    primaryDark: '#25467D',
    
    // Secondary colors
    secondary: '#FF8A65',
    secondaryLight: '#FFAB91',
    secondaryDark: '#FF6B35',
    
    // Background colors
    background: '#1A1A1A',
    cardBackground: '#2D2D2D',
    surfaceBackground: '#252525',
    
    // Text colors
    text: '#FFFFFF', // Added missing text property
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textInverse: '#1A1A1A',
    
    // Status colors
    success: '#4CAF50',
    successLight: '#2E7D32',
    warning: '#FF9800',
    warningLight: '#F57C00',
    error: '#F44336',
    errorLight: '#D32F2F',
    info: '#2196F3',
    infoLight: '#1976D2',
    
    // Border and divider colors
    border: '#404040',
    borderLight: '#505050',
    divider: '#333333',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    
    // Special colors
    accent: '#3A5A8F',
    highlight: '#FF8A65',
    overlay: 'rgba(0, 0, 0, 0.8)',
    tint: '#4A6A9F', // Added missing tint property
    icon: '#B0B0B0', // Added missing icon property
    
    // Banking specific colors
    cardGradient: ['#2D2D2D', '#404040'],
    successGradient: ['#4CAF50', '#388E3C'],
    warningGradient: ['#FF9800', '#F57C00'],
    errorGradient: ['#F44336', '#D32F2F'],
  }
};

export const getColors = () => Colors.light;

export const ColorUtils = {
  // Opacity variations
  withOpacity: (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  // Lighten color
  lighten: (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
  
  // Darken color
  darken: (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
};
