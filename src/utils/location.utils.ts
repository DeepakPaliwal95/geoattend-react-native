import Geolocation, {
  GeoError,
  GeoPosition,
  GeoOptions,
  GeoWatchOptions,
  PositionError,
} from 'react-native-geolocation-service';
import {
  MAX_ACCURACY_THRESHOLD_METERS,
  MAX_LOCATION_AGE_MS,
  LOCATION_DISTANCE_FILTER_METERS,
  LOCATION_UPDATE_INTERVAL_MS,
  LOCATION_FASTEST_INTERVAL_MS,
} from '../constants/location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type LocationStatus = 'idle' | 'starting' | 'tracking' | 'error';

export type LocationError =
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unknown';

export const DEFAULT_LOCATION_OPTIONS: GeoWatchOptions = {
  accuracy: {
    android: 'high',
    ios: 'best',
  },
  enableHighAccuracy: true,
  distanceFilter: LOCATION_DISTANCE_FILTER_METERS,
  interval: LOCATION_UPDATE_INTERVAL_MS,
  fastestInterval: LOCATION_FASTEST_INTERVAL_MS,
  showLocationDialog: true,
  forceRequestLocation: true,
};

export const DEFAULT_CURRENT_OPTIONS: GeoOptions = {
  accuracy: {
    android: 'high',
    ios: 'best',
  },
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0,
  showLocationDialog: true,
  forceRequestLocation: true,
};

/**
 * Validates that coordinates and accuracy are present, non-null, non-NaN,
 * and within standard geographic bounds.
 *
 * Latitude: -90 <= latitude <= 90
 * Longitude: -180 <= longitude <= 180
 * Accuracy: >= 0
 */
export const isValidLocation = (
  coords?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  } | null,
): boolean => {
  if (!coords) {
    return false;
  }
  const { latitude, longitude, accuracy } = coords;
  if (
    latitude === undefined ||
    latitude === null ||
    typeof latitude !== 'number' ||
    Number.isNaN(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return false;
  }
  if (
    longitude === undefined ||
    longitude === null ||
    typeof longitude !== 'number' ||
    Number.isNaN(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return false;
  }
  if (
    accuracy === undefined ||
    accuracy === null ||
    typeof accuracy !== 'number' ||
    Number.isNaN(accuracy) ||
    accuracy < 0
  ) {
    return false;
  }
  return true;
};

/**
 * Checks if a GPS fix timestamp is fresh (within maxAgeMs).
 * Defaults to MAX_LOCATION_AGE_MS (10 seconds).
 * Also tolerates up to 10 seconds of forward clock skew between device clock and GPS satellite clock.
 */
export const isFreshLocation = (
  timestamp?: number | null,
  maxAgeMs: number = MAX_LOCATION_AGE_MS,
): boolean => {
  if (
    timestamp === undefined ||
    timestamp === null ||
    typeof timestamp !== 'number' ||
    Number.isNaN(timestamp)
  ) {
    return false;
  }
  const age = Date.now() - timestamp;
  return age >= -10000 && age <= maxAgeMs;
};

/**
 * Validates if the GPS accuracy is acceptable.
 * Threshold defaults to MAX_ACCURACY_THRESHOLD_METERS (30 meters).
 */
export const isAcceptableAccuracy = (
  accuracy?: number | null,
  maxAccuracyMeters: number = MAX_ACCURACY_THRESHOLD_METERS,
): boolean => {
  if (
    accuracy === undefined ||
    accuracy === null ||
    typeof accuracy !== 'number' ||
    Number.isNaN(accuracy) ||
    accuracy < 0
  ) {
    return false;
  }
  return accuracy <= maxAccuracyMeters;
};

/**
 * Maps react-native-geolocation-service error codes to application-level LocationError.
 */
export const mapNativeLocationError = (error: GeoError): LocationError => {
  if (!error) {
    return 'unknown';
  }
  switch (error.code) {
    case PositionError.PERMISSION_DENIED:
      return 'permission_denied';
    case PositionError.POSITION_UNAVAILABLE:
    case PositionError.PLAY_SERVICE_NOT_AVAILABLE:
    case PositionError.SETTINGS_NOT_SATISFIED:
      return 'position_unavailable';
    case PositionError.TIMEOUT:
      return 'timeout';
    default:
      return 'unknown';
  }
};

/**
 * One-time fetch of current location coordinates.
 * Defaults to maximumAge: 0 to ensure a fresh GPS fix.
 */
export const getCurrentLocation = (
  options: GeoOptions = DEFAULT_CURRENT_OPTIONS,
): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        console.log('current position---->', position);
        if (!isValidLocation(position?.coords)) {
          reject(new Error('Invalid location coordinates received'));
          return;
        }
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp || Date.now(),
        });
      },
      (error: GeoError) => {
        reject(mapNativeLocationError(error));
      },
      options,
    );
  });
};

/**
 * Initiates continuous foreground location tracking.
 * Returns the native watcher ID.
 */
export const startLocationTracking = (
  onSuccess: (location: LocationData) => void,
  onError: (error: LocationError) => void,
  options: GeoWatchOptions = DEFAULT_LOCATION_OPTIONS,
): number => {
  return Geolocation.watchPosition(
    (position: GeoPosition) => {
      if (!isValidLocation(position?.coords)) {
        return;
      }
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp || Date.now(),
      });
    },
    (error: GeoError) => {
      onError(mapNativeLocationError(error));
    },
    options,
  );
};

/**
 * Clears an active location watcher and stops observing.
 */
export const stopLocationTracking = (watchId: number | null): void => {
  if (watchId !== null && watchId !== undefined) {
    try {
      Geolocation.clearWatch(watchId);
    } catch (error) {
      console.warn('[location.utils] clearWatch error:', error);
    }
  }
  try {
    Geolocation.stopObserving();
  } catch (error) {
    console.warn('[location.utils] stopObserving error:', error);
  }
};
