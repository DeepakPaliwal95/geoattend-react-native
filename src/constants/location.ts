/**
 * Fixed office location provided for the technical assignment.
 *
 * Single source of truth for:
 * - Map
 * - Geofence
 * - Attendance validation
 */
export const OFFICE_LOCATION = {
  latitude: 25.053778, //26.58333
  longitude: 73.889511, //73.83333
};

/**
 * Assignment requires a 100 meter geofence.
 */
export const GEOFENCE_RADIUS = 100;

/**
 * Maximum acceptable GPS accuracy.
 *
 * Example:
 * 10m -> accepted
 * 20m -> accepted
 * 30m -> accepted
 * 35m -> rejected
 */
export const MAX_ACCURACY_THRESHOLD_METERS = 30;

/**
 * Maximum acceptable age of a GPS fix.
 */
export const MAX_LOCATION_AGE_MS = 10_000;

/**
 * Distance filter for location updates in meters.
 * Set to 0 to enable continuous updates when stationary, allowing
 * the GPS lock to refine and the smoothed UI location to stabilize.
 */
export const LOCATION_DISTANCE_FILTER_METERS = 0;

/**
 * Desired update interval.
 */
export const LOCATION_UPDATE_INTERVAL_MS = 3000;

/**
 * Fastest accepted update interval.
 */
export const LOCATION_FASTEST_INTERVAL_MS = 1500;

/**
 * Smoothing factor used ONLY for UI.
 *
 * 0.25 means:
 *
 * 25% new location
 * 75% previous display location
 */
export const LOCATION_SMOOTHING_ALPHA = 0.25;
