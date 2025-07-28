// Responsive utility functions for AI Stock Analysis PWA

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export const breakpoints: BreakpointConfig = {
  mobile: 0,
  tablet: 768,
  desktop: 1024
};

// Get current screen size category
export const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < breakpoints.tablet) {
    return 'mobile';
  } else if (width < breakpoints.desktop) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

// Check if current screen is mobile
export const isMobile = (): boolean => {
  return getScreenSize() === 'mobile';
};

// Check if current screen is tablet or larger
export const isTabletUp = (): boolean => {
  const size = getScreenSize();
  return size === 'tablet' || size === 'desktop';
};

// Check if current screen is desktop
export const isDesktop = (): boolean => {
  return getScreenSize() === 'desktop';
};

// Get responsive grid columns based on screen size
export const getGridColumns = (
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 3
): number => {
  const size = getScreenSize();
  
  switch (size) {
    case 'mobile':
      return mobileColumns;
    case 'tablet':
      return tabletColumns;
    case 'desktop':
      return desktopColumns;
    default:
      return desktopColumns;
  }
};

// Get responsive spacing based on screen size
export const getResponsiveSpacing = (
  mobileSpacing: string = '1rem',
  tabletSpacing: string = '1.5rem',
  desktopSpacing: string = '2rem'
): string => {
  const size = getScreenSize();
  
  switch (size) {
    case 'mobile':
      return mobileSpacing;
    case 'tablet':
      return tabletSpacing;
    case 'desktop':
      return desktopSpacing;
    default:
      return desktopSpacing;
  }
};

// Get responsive font size
export const getResponsiveFontSize = (
  mobileFontSize: string = '1rem',
  tabletFontSize: string = '1.125rem',
  desktopFontSize: string = '1.25rem'
): string => {
  const size = getScreenSize();
  
  switch (size) {
    case 'mobile':
      return mobileFontSize;
    case 'tablet':
      return tabletFontSize;
    case 'desktop':
      return desktopFontSize;
    default:
      return desktopFontSize;
  }
};

// Check if device supports touch
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

// Get safe area insets for devices with notches
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

// Debounce function for resize events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Hook-like function to get responsive value
export const useResponsiveValue = <T>(
  mobileValue: T,
  tabletValue: T,
  desktopValue: T
): T => {
  const size = getScreenSize();
  
  switch (size) {
    case 'mobile':
      return mobileValue;
    case 'tablet':
      return tabletValue;
    case 'desktop':
      return desktopValue;
    default:
      return desktopValue;
  }
};

// Format numbers for mobile display (shorter format)
export const formatNumberForMobile = (
  num: number,
  isMobileScreen: boolean = isMobile()
): string => {
  if (!isMobileScreen) {
    return num.toLocaleString();
  }
  
  // Use shorter format for mobile
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};

// Get optimal image size based on screen
export const getOptimalImageSize = (): { width: number; height: number } => {
  const size = getScreenSize();
  
  switch (size) {
    case 'mobile':
      return { width: 300, height: 200 };
    case 'tablet':
      return { width: 500, height: 300 };
    case 'desktop':
      return { width: 800, height: 400 };
    default:
      return { width: 800, height: 400 };
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if user prefers high contrast
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
};
