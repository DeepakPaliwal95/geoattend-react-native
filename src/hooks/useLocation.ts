import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  LocationData,
  LocationStatus,
  LocationError,
  isValidLocation,
  isFreshLocation,
  isAcceptableAccuracy,
  startLocationTracking,
  stopLocationTracking,
  getCurrentLocation,
  DEFAULT_CURRENT_OPTIONS,
} from '../utils/location.utils';
import { usePermission } from './usePermission';

export interface UseLocationReturn {
  location: LocationData | null;
  status: LocationStatus;
  error: LocationError | null;
  startTracking: () => void;
  stopTracking: () => void;
  retry: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<LocationError | null>(null);

  const { permissionState } = usePermission();

  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const hasAccurateLocationRef = useRef<boolean>(false);
  const appStateRef = useRef<AppStateStatus>(
    (AppState.currentState as AppStateStatus) || 'active',
  );

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      stopLocationTracking(watchIdRef.current);
      watchIdRef.current = null;
    }
    hasAccurateLocationRef.current = false;
    if (isMountedRef.current) {
      setStatus('idle');
    }
  }, []);

  const startTracking = useCallback(() => {
    // Section 6: Do not start GPS if permission is not granted
    if (permissionState !== 'granted') {
      return;
    }

    // Section 9: Duplicate Watcher Protection
    if (watchIdRef.current !== null) {
      return;
    }

    setError(null);
    setStatus('starting');

    const handleAcceptedLocation = (newLocation: LocationData) => {
      if (!isMountedRef.current) {
        return;
      }

      // Validate coordinates and freshness
      if (!isValidLocation(newLocation)) {
        return;
      }
      if (!isFreshLocation(newLocation.timestamp)) {
        return;
      }

      // If we already have an accurate fix (<= 30m), reject subsequent poor accuracy fixes (> 30m)
      if (
        hasAccurateLocationRef.current &&
        !isAcceptableAccuracy(newLocation.accuracy)
      ) {
        return;
      }

      if (isAcceptableAccuracy(newLocation.accuracy)) {
        hasAccurateLocationRef.current = true;
      }

      // Keep raw accepted location as single source of truth (no coordinate averaging)
      setLocation(newLocation);
      setStatus('tracking');
      setError(null);
    };

    const id = startLocationTracking(
      handleAcceptedLocation,
      (locError: LocationError) => {
        if (!isMountedRef.current) {
          return;
        }
        // If permission was revoked or GPS was disabled (from notification bar/settings)
        if (
          locError === 'permission_denied' ||
          locError === 'position_unavailable'
        ) {
          if (watchIdRef.current !== null) {
            stopLocationTracking(watchIdRef.current);
            watchIdRef.current = null;
          }
          setLocation(null);
        }
        hasAccurateLocationRef.current = false;
        setError(locError);
        setStatus('error');
      },
    );

    watchIdRef.current = id;

    // Concurrently fetch immediate GPS fix to eliminate initial cold-start delay
    getCurrentLocation(DEFAULT_CURRENT_OPTIONS)
      .then(freshLocation => {
        handleAcceptedLocation(freshLocation);
      })
      .catch(() => {
        // Continuous tracking watcher will still handle updates
      });
  }, [permissionState]);

  const retry = useCallback(() => {
    // Clean up existing watcher if any, then re-start tracking
    if (watchIdRef.current !== null) {
      stopLocationTracking(watchIdRef.current);
      watchIdRef.current = null;
    }
    hasAccurateLocationRef.current = false;
    setError(null);
    startTracking();
  }, [startTracking]);

  // Handle AppState transitions (e.g. user toggled Location in notification bar or settings)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // If permission is still granted and watcher was lost or in error state, resume tracking
          if (permissionState === 'granted') {
            if (watchIdRef.current === null || status === 'error') {
              retry();
            }
          }
        }
        appStateRef.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [permissionState, retry, status]);

  // Auto-recovery polling when Location is turned off from notification bar
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'test' ||
      status !== 'error' ||
      error !== 'position_unavailable' ||
      permissionState !== 'granted'
    ) {
      return;
    }

    const intervalId = setInterval(() => {
      getCurrentLocation({
        accuracy: { android: 'high', ios: 'best' },
        timeout: 2500,
        maximumAge: 0,
        showLocationDialog: false,
        forceRequestLocation: false,
      })
        .then(() => {
          // Location Services are back ON, restart tracking
          retry();
        })
        .catch(() => {
          // Still disabled, keep waiting
        });
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [status, error, permissionState, retry]);

  // Component lifecycle and unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null) {
        stopLocationTracking(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    location,
    status,
    error,
    startTracking,
    stopTracking,
    retry,
  };
};
