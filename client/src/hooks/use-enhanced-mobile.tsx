import { useState, useEffect, useCallback } from "react";

// Enhanced breakpoints for better mobile experience
export const BREAKPOINTS = {
  xs: 320,    // Very small phones
  sm: 375,    // Small phones (iPhone SE)
  md: 414,    // Medium phones (iPhone 12)
  lg: 768,    // Tablets
  xl: 1024,   // Small laptops
  xxl: 1280,  // Large screens
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

interface DeviceInfo {
  width: number;
  height: number;
  breakpoint: BreakpointKey;
  isPortrait: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isVerySmall: boolean;
  isSmallPhone: boolean;
  isMediumPhone: boolean;
  isLargePhone: boolean;
  hasNotch: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  devicePixelRatio: number;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsHover: boolean;
}

interface ResponsiveConfig {
  // Layout configurations
  containerPadding: string;
  cardPadding: string;
  spacing: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
  iconSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  // Grid configurations
  gridCols: {
    summary: string;
    main: string;
    table: string;
  };
  // Component specific
  headerHeight: string;
  bottomNavHeight: string;
  fabSize: string;
  modalWidth: string;
  // Touch targets
  minTouchTarget: string;
  buttonHeight: string;
}

export function useEnhancedMobile() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    width: 0,
    height: 0,
    breakpoint: 'md',
    isPortrait: true,
    isLandscape: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isVerySmall: false,
    isSmallPhone: false,
    isMediumPhone: false,
    isLargePhone: false,
    hasNotch: false,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    devicePixelRatio: 1,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    supportsHover: false,
  });

  const getBreakpoint = useCallback((width: number): BreakpointKey => {
    if (width < BREAKPOINTS.xs) return 'xs';
    if (width < BREAKPOINTS.sm) return 'xs';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    if (width < BREAKPOINTS.xxl) return 'xl';
    return 'xxl';
  }, []);

  const detectDevice = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);
    const isPortrait = height > width;
    const isLandscape = width > height;
    
    // Device type detection
    const isMobile = width < BREAKPOINTS.lg;
    const isTablet = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
    const isDesktop = width >= BREAKPOINTS.xl;
    
    // Phone size categories
    const isVerySmall = width < BREAKPOINTS.xs;
    const isSmallPhone = width >= BREAKPOINTS.xs && width < BREAKPOINTS.sm;
    const isMediumPhone = width >= BREAKPOINTS.sm && width < BREAKPOINTS.md;
    const isLargePhone = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    
    // Device capabilities
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Platform detection
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    // Safe area detection (for devices with notches)
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--safe-area-inset-top').replace('px', '')) || 0;
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--safe-area-inset-bottom').replace('px', '')) || 0;
    
    const hasNotch = safeAreaTop > 0 || safeAreaBottom > 0;

    return {
      width,
      height,
      breakpoint,
      isPortrait,
      isLandscape,
      isMobile,
      isTablet,
      isDesktop,
      isVerySmall,
      isSmallPhone,
      isMediumPhone,
      isLargePhone,
      hasNotch,
      safeAreaTop,
      safeAreaBottom,
      devicePixelRatio,
      isTouchDevice,
      isIOS,
      isAndroid,
      supportsHover,
    };
  }, [getBreakpoint]);

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(detectDevice());
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for changes
    const mediaQueries = Object.values(BREAKPOINTS).map(bp => 
      window.matchMedia(`(max-width: ${bp}px)`)
    );

    const handleResize = () => {
      updateDeviceInfo();
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleResize);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleResize);
      });
    };
  }, [detectDevice]);

  // Generate responsive configuration based on device info
  const getResponsiveConfig = useCallback((): ResponsiveConfig => {
    const { breakpoint, isVerySmall, isSmallPhone, isMobile } = deviceInfo;

    if (isVerySmall) {
      return {
        containerPadding: "px-2 py-2",
        cardPadding: "p-2",
        spacing: "space-y-2",
        fontSize: {
          xs: "text-xs",
          sm: "text-xs",
          base: "text-sm",
          lg: "text-base",
          xl: "text-lg",
        },
        iconSize: { xs: 12, sm: 14, md: 16, lg: 18 },
        gridCols: {
          summary: "grid-cols-1",
          main: "grid-cols-1",
          table: "grid-cols-1",
        },
        headerHeight: "h-12",
        bottomNavHeight: "h-14",
        fabSize: "h-12 w-12",
        modalWidth: "w-full max-w-sm",
        minTouchTarget: "min-h-[40px] min-w-[40px]",
        buttonHeight: "h-8",
      };
    }

    if (isSmallPhone) {
      return {
        containerPadding: "px-3 py-3",
        cardPadding: "p-3",
        spacing: "space-y-3",
        fontSize: {
          xs: "text-xs",
          sm: "text-sm",
          base: "text-sm",
          lg: "text-base",
          xl: "text-lg",
        },
        iconSize: { xs: 14, sm: 16, md: 18, lg: 20 },
        gridCols: {
          summary: "grid-cols-2",
          main: "grid-cols-1",
          table: "grid-cols-1",
        },
        headerHeight: "h-14",
        bottomNavHeight: "h-16",
        fabSize: "h-14 w-14",
        modalWidth: "w-full max-w-md",
        minTouchTarget: "min-h-[44px] min-w-[44px]",
        buttonHeight: "h-9",
      };
    }

    if (isMobile) {
      return {
        containerPadding: "px-4 py-4",
        cardPadding: "p-4",
        spacing: "space-y-4",
        fontSize: {
          xs: "text-xs",
          sm: "text-sm",
          base: "text-base",
          lg: "text-lg",
          xl: "text-xl",
        },
        iconSize: { xs: 16, sm: 18, md: 20, lg: 24 },
        gridCols: {
          summary: "grid-cols-2",
          main: "grid-cols-1 sm:grid-cols-2",
          table: "grid-cols-1",
        },
        headerHeight: "h-16",
        bottomNavHeight: "h-16",
        fabSize: "h-14 w-14",
        modalWidth: "w-full max-w-lg",
        minTouchTarget: "min-h-[44px] min-w-[44px]",
        buttonHeight: "h-10",
      };
    }

    // Desktop/tablet configuration
    return {
      containerPadding: "px-6 py-6",
      cardPadding: "p-6",
      spacing: "space-y-6",
      fontSize: {
        xs: "text-sm",
        sm: "text-base",
        base: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
      },
      iconSize: { xs: 18, sm: 20, md: 24, lg: 28 },
      gridCols: {
        summary: "grid-cols-2 lg:grid-cols-4",
        main: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
        table: "grid-cols-1",
      },
      headerHeight: "h-16",
      bottomNavHeight: "h-0", // No bottom nav on desktop
      fabSize: "h-16 w-16",
      modalWidth: "w-full max-w-2xl",
      minTouchTarget: "min-h-[40px] min-w-[40px]",
      buttonHeight: "h-10",
    };
  }, [deviceInfo]);

  const config = getResponsiveConfig();

  // Utility functions
  const isBreakpoint = useCallback((bp: BreakpointKey) => {
    return deviceInfo.breakpoint === bp;
  }, [deviceInfo.breakpoint]);

  const isBreakpointUp = useCallback((bp: BreakpointKey) => {
    return deviceInfo.width >= BREAKPOINTS[bp];
  }, [deviceInfo.width]);

  const isBreakpointDown = useCallback((bp: BreakpointKey) => {
    return deviceInfo.width < BREAKPOINTS[bp];
  }, [deviceInfo.width]);

  return {
    ...deviceInfo,
    config,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    BREAKPOINTS,
  };
}

// Hook for responsive values
export function useResponsiveValue<T>(values: Partial<Record<BreakpointKey, T>>, defaultValue: T): T {
  const { breakpoint } = useEnhancedMobile();
  
  // Find the appropriate value for current breakpoint
  const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  // Look for value at current breakpoint or closest smaller one
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return defaultValue;
}

// Hook for responsive classes
export function useResponsiveClasses(classes: Partial<Record<BreakpointKey, string>>): string {
  const { breakpoint } = useEnhancedMobile();
  return classes[breakpoint] || '';
}