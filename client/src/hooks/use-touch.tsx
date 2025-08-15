import { useState, useEffect, useRef, TouchEvent } from 'react';

interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
}

interface UseTouchOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

export function useTouch({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
}: UseTouchOptions = {}) {
  const [gesture, setGesture] = useState<TouchGesture | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }
  };

  const handleTouchMove = () => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    // Cancel long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const endTime = Date.now();
    
    const gestureData: TouchGesture = {
      startX: touchStartRef.current.x,
      startY: touchStartRef.current.y,
      endX: touch.clientX,
      endY: touch.clientY,
      deltaX: touch.clientX - touchStartRef.current.x,
      deltaY: touch.clientY - touchStartRef.current.y,
      duration: endTime - touchStartRef.current.time,
    };

    setGesture(gestureData);

    const { deltaX, deltaY, duration } = gestureData;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check for tap (short duration, minimal movement)
    if (duration < 200 && absDeltaX < 10 && absDeltaY < 10) {
      onTap?.();
      return;
    }

    // Check for swipe gestures
    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    touchStartRef.current = null;
  };

  return {
    gesture,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

// Hook for detecting device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasTouch: false,
    hasHover: false,
    isStandalone: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
  });

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHover: window.matchMedia('(hover: hover)').matches,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      });
    };

    updateCapabilities();
    
    window.addEventListener('resize', updateCapabilities);
    window.addEventListener('orientationchange', updateCapabilities);

    return () => {
      window.removeEventListener('resize', updateCapabilities);
      window.removeEventListener('orientationchange', updateCapabilities);
    };
  }, []);

  return capabilities;
}