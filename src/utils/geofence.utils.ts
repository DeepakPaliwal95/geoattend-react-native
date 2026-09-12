import { OFFICE_LOCATION, GEOFENCE_RADIUS } from '../constants/location';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in meters (rounded to nearest integer)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    Number.isNaN(lat1) ||
    Number.isNaN(lon1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lon2)
  ) {
    return NaN;
  }

  const R = 6371000; // Earth's mean radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Calculates distance between a given location and the fixed OFFICE_LOCATION.
 * Returns distance in meters, or NaN if location is invalid.
 */
export const calculateDistanceFromOffice = (
  location?: { latitude: number; longitude: number } | null,
): number => {
  if (
    !location ||
    location.latitude === undefined ||
    location.longitude === undefined ||
    Number.isNaN(location.latitude) ||
    Number.isNaN(location.longitude)
  ) {
    return NaN;
  }
  return calculateDistance(
    location.latitude,
    location.longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude,
  );
};

/**
 * Checks if a distance falls within the geofence boundary.
 * Boundary is inclusive (distance <= radius).
 *
 * @param distance Distance in meters
 * @param radius Geofence radius in meters (defaults to GEOFENCE_RADIUS)
 */
export const isInsideGeofence = (
  distance: number | null | undefined,
  radius: number = GEOFENCE_RADIUS,
): boolean => {
  if (distance === null || distance === undefined || Number.isNaN(distance)) {
    return false;
  }
  return distance <= radius;
};

/**
 * Conservative accuracy-aware geofence boundary check.
 * Requires: distance + accuracy <= radius
 *
 * @param distance Distance from office in meters
 * @param accuracy GPS accuracy in meters
 * @param radius Geofence radius in meters (defaults to GEOFENCE_RADIUS)
 */
export const isConservativelyInsideGeofence = (
  distance: number | null | undefined,
  accuracy: number | null | undefined,
  radius: number = GEOFENCE_RADIUS,
): boolean => {
  if (
    distance === null ||
    distance === undefined ||
    Number.isNaN(distance) ||
    accuracy === null ||
    accuracy === undefined ||
    Number.isNaN(accuracy)
  ) {
    return false;
  }
  return distance + accuracy <= radius;
};

