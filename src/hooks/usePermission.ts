import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  checkLocationPermission,
  requestLocationPermission,
  openAppSettings,
  TPermissionState,
} from '../utils/permission.utils';

export interface UsePermissionReturn {
  permissionState: TPermissionState;
  isChecking: boolean;
  checkPermission: () => Promise<TPermissionState>;
  requestPermission: () => Promise<TPermissionState>;
  openSettings: () => Promise<void>;
}

// Module-level shared state so Application.tsx and PermissionScreen.tsx stay in sync
let globalPermissionState: TPermissionState = 'checking';
const stateListeners = new Set<(state: TPermissionState) => void>();

const setGlobalState = (newState: TPermissionState) => {
  globalPermissionState = newState;
  stateListeners.forEach((listener) => listener(newState));
};

export const usePermission = (): UsePermissionReturn => {
  const [permissionState, setPermissionState] =
    useState<TPermissionState>(globalPermissionState);
  const appState = useRef<AppStateStatus>(
    (AppState.currentState as AppStateStatus) || 'active',
  );

  const checkStatus = useCallback(async (): Promise<TPermissionState> => {
    try {
      const nativeState = await checkLocationPermission();
      // On Android, check() only returns 'granted' or 'denied'.
      // If the permission was already identified as 'blocked', check() returning 'denied'
      // indicates it is still blocked in settings until the user grants it.
      let nextState: TPermissionState = nativeState;
      if (globalPermissionState === 'blocked') {
        if (nativeState === 'granted') {
          nextState = 'granted';
        } else {
          nextState = 'blocked';
        }
      }
      setGlobalState(nextState);
      return nextState;
    } catch {
      setGlobalState('unavailable');
      return 'unavailable';
    }
  }, []);

  const request = useCallback(async (): Promise<TPermissionState> => {
    try {
      const state = await requestLocationPermission();
      setGlobalState(state);
      return state;
    } catch {
      setGlobalState('unavailable');
      return 'unavailable';
    }
  }, []);

  const openSettings = useCallback(async (): Promise<void> => {
    try {
      await openAppSettings();
    } catch (error) {
      console.warn('[usePermission] Failed to open settings:', error);
    }
  }, []);

  useEffect(() => {
    const listener = (newState: TPermissionState) => {
      setPermissionState(newState);
    };
    stateListeners.add(listener);

    // Initial permission check
    checkStatus();

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          checkStatus();
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      stateListeners.delete(listener);
      subscription.remove();
    };
  }, [checkStatus]);

  return {
    permissionState,
    isChecking: permissionState === 'checking',
    checkPermission: checkStatus,
    requestPermission: request,
    openSettings,
  };
};
