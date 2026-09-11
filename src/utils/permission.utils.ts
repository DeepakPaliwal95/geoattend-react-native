import { Platform, Linking } from 'react-native';
import {
  check,
  request,
  openSettings as openNativeSettings,
  PERMISSIONS,
  RESULTS,
  PermissionStatus,
} from 'react-native-permissions';

export type TPermissionState =
  | 'checking'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

export const LOCATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

/**
 * Maps react-native-permissions status to application TPermissionState
 */
export const mapPermissionResult = (
  result: PermissionStatus,
): TPermissionState => {
  switch (result) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.UNAVAILABLE:
      return 'unavailable';
    default:
      return 'denied';
  }
};

/**
 * Check the current native location permission status
 */
export const checkLocationPermission = async (): Promise<TPermissionState> => {
  if (!LOCATION_PERMISSION) {
    return 'unavailable';
  }
  try {
    const result = await check(LOCATION_PERMISSION);
    return mapPermissionResult(result);
  } catch (error) {
    console.warn('[permission.utils] checkLocationPermission error:', error);
    return 'unavailable';
  }
};

/**
 * Request native location permission from the OS
 */
export const requestLocationPermission =
  async (): Promise<TPermissionState> => {
    if (!LOCATION_PERMISSION) {
      return 'unavailable';
    }
    try {
      const result = await request(LOCATION_PERMISSION);
      return mapPermissionResult(result);
    } catch (error) {
      console.warn('[permission.utils] requestLocationPermission error:', error);
      return 'unavailable';
    }
  };

/**
 * Open the device's application settings page.
 * Uses React Native's core Linking.openSettings() as the primary reliable mechanism,
 * with fallback to react-native-permissions openSettings.
 */
export const openAppSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.warn(
      '[permission.utils] Linking.openSettings failed, trying openNativeSettings:',
      error,
    );
    try {
      await openNativeSettings();
    } catch (nativeError) {
      console.warn('[permission.utils] openNativeSettings failed:', nativeError);
    }
  }
};
