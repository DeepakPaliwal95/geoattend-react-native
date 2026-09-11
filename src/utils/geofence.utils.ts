import { GEOFENCE_RADIUS } from '../constants/location';

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
