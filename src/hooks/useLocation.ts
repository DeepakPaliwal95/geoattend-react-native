import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  LocationData,
  LocationStatus,
  LocationError,
  startLocationTracking,
  stopLocationTracking,
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
  const appStateRef = useRef<AppStateStatus>(
    (AppState.currentState as AppStateStatus) || 'active',
  );

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      stopLocationTracking(watchIdRef.current);
      watchIdRef.current = null;
    }
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

    const id = startLocationTracking(
      (newLocation: LocationData) => {
        if (!isMountedRef.current) {
          return;
        }
        setLocation(newLocation);
        setStatus('tracking');
        setError(null);
      },
      (locError: LocationError) => {
        if (!isMountedRef.current) {
          return;
        }
        // If permission was revoked while tracking, stop the active watcher
        if (locError === 'permission_denied') {
          if (watchIdRef.current !== null) {
            stopLocationTracking(watchIdRef.current);
            watchIdRef.current = null;
          }
        }
        setError(locError);
        setStatus('error');
      },
    );

    watchIdRef.current = id;
  }, [permissionState]);

  const retry = useCallback(() => {
    // Clean up existing watcher if any, then re-start tracking
    if (watchIdRef.current !== null) {
      stopLocationTracking(watchIdRef.current);
      watchIdRef.current = null;
    }
    setError(null);
    startTracking();
  }, [startTracking]);

  // Handle AppState transitions (Background -> Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // If permission is still granted and watcher was lost, resume tracking
          if (permissionState === 'granted' && watchIdRef.current === null) {
            startTracking();
          }
        }
        appStateRef.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [permissionState, startTracking]);

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
