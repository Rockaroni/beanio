/**
 * Beanio App Theme
 * 
 * A coffee-themed color palette and styling constants for the Beanio app.
 */

export const COLORS = {
  // Primary colors
  primary: '#6F4E37', // Coffee brown
  primaryDark: '#4A332A', // Dark roast
  primaryLight: '#A67C52', // Light roast
  
  // Secondary colors
  secondary: '#D4B996', // Creamy coffee
  secondaryDark: '#B69F82', // Darker cream
  secondaryLight: '#E6D2B5', // Lighter cream
  
  // Accent colors
  accent: '#C25E5E', // Berry notes (for highlighting)
  accentDark: '#8F4545', // Dark berry
  accentLight: '#D68A8A', // Light berry
  
  // Background colors
  background: '#FAF3E0', // Paper/coffee filter
  backgroundDark: '#E8DCC5', // Darker paper
  card: '#FFFFFF', // White
  
  // Text colors
  text: '#333333', // Almost black
  textLight: '#777777', // Gray
  textInverse: '#FFFFFF', // White text for dark backgrounds
  
  // Utility colors
  success: '#4CAF50', // Green
  warning: '#FFC107', // Amber
  error: '#F44336', // Red
  info: '#2196F3', // Blue
  
  // Rating colors
  starActive: '#FFD700', // Gold for active stars
  starInactive: '#E0E0E0', // Gray for inactive stars
};

export const SIZES = {
  // Font sizes
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 32,
  
  // Spacing
  spacing: 8,
  spacingSmall: 4,
  spacingMedium: 12,
  spacingLarge: 16,
  spacingXLarge: 24,
  spacingXXLarge: 32,
  
  // Border radius
  borderRadius: 8,
  borderRadiusSmall: 4,
  borderRadiusLarge: 12,
  borderRadiusRound: 999, // For circular elements
  
  // Icon sizes
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
};

export const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
};
