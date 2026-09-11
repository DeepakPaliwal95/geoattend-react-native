import Geolocation, {
  GeoError,
  GeoPosition,
  GeoOptions,
  GeoWatchOptions,
  PositionError,
} from 'react-native-geolocation-service';

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
  enableHighAccuracy: true,
  distanceFilter: 0,
  interval: 5000,
  fastestInterval: 2000,
  showLocationDialog: true,
  forceRequestLocation: false,
};

export const DEFAULT_CURRENT_OPTIONS: GeoOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Validates that coordinates and accuracy are present, non-null, and non-NaN.
 */
export const isValidLocation = (coords?: {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
} | null): boolean => {
  if (!coords) {
    return false;
  }
  const { latitude, longitude, accuracy } = coords;
  if (
    latitude === undefined ||
    latitude === null ||
    typeof latitude !== 'number' ||
    Number.isNaN(latitude)
  ) {
    return false;
  }
  if (
    longitude === undefined ||
    longitude === null ||
    typeof longitude !== 'number' ||
    Number.isNaN(longitude)
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
 */
export const getCurrentLocation = (
  options: GeoOptions = DEFAULT_CURRENT_OPTIONS,
): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
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
