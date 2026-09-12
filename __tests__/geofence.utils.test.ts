import {
  calculateDistance,
  calculateDistanceFromOffice,
  isInsideGeofence,
  isConservativelyInsideGeofence,
} from '../src/utils/geofence.utils';
import { GEOFENCE_RADIUS, OFFICE_LOCATION } from '../src/constants/location';

describe('geofence.utils - calculateDistance', () => {
  it('returns 0 when coordinates are identical', () => {
    const lat = 26.885142;
    const lon = 75.811562;
    expect(calculateDistance(lat, lon, lat, lon)).toBe(0);
  });

  it('calculates accurate distance between known points', () => {
    // Approx ~111 meters per 0.001 degree of latitude
    const lat1 = 26.885142;
    const lon1 = 75.811562;
    const lat2 = 26.886042; // ~100m north
    const lon2 = 75.811562;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(90);
    expect(distance).toBeLessThan(110);
  });

  it('returns NaN when coordinates are missing or invalid', () => {
    expect(calculateDistance(NaN, 75.811562, 26.885142, 75.811562)).toBeNaN();
    expect(calculateDistance(26.885142, NaN, 26.885142, 75.811562)).toBeNaN();
    expect(
      calculateDistance(undefined as any, 75.811562, 26.885142, 75.811562),
    ).toBeNaN();
  });
});

describe('geofence.utils - isInsideGeofence', () => {
  it('returns true when distance is strictly less than 100m', () => {
    expect(isInsideGeofence(50)).toBe(true);
    expect(isInsideGeofence(0)).toBe(true);
    expect(isInsideGeofence(99)).toBe(true);
  });

  it('returns true at the boundary (inclusive 100m)', () => {
    expect(isInsideGeofence(100)).toBe(true);
    expect(isInsideGeofence(GEOFENCE_RADIUS)).toBe(true);
  });

  it('returns false when distance is greater than 100m', () => {
    expect(isInsideGeofence(101)).toBe(false);
    expect(isInsideGeofence(248)).toBe(false);
  });

  it('returns false when distance is null, undefined, or NaN', () => {
    expect(isInsideGeofence(null)).toBe(false);
    expect(isInsideGeofence(undefined)).toBe(false);
    expect(isInsideGeofence(NaN)).toBe(false);
  });
});

describe('geofence.utils - calculateDistanceFromOffice', () => {
  it('returns 0 when coordinates match office coordinates exactly', () => {
    expect(
      calculateDistanceFromOffice({
        latitude: OFFICE_LOCATION.latitude,
        longitude: OFFICE_LOCATION.longitude,
      }),
    ).toBe(0);
  });

  it('returns NaN when coordinates are missing or invalid', () => {
    expect(calculateDistanceFromOffice(null)).toBeNaN();
    expect(calculateDistanceFromOffice(undefined)).toBeNaN();
    expect(
      calculateDistanceFromOffice({
        latitude: NaN,
        longitude: 73.889511,
      }),
    ).toBeNaN();
  });
});

describe('geofence.utils - isConservativelyInsideGeofence', () => {
  it('returns true when distance + accuracy <= 100m', () => {
    // 70m + 10m = 80m <= 100m
    expect(isConservativelyInsideGeofence(70, 10)).toBe(true);
    // 95m + 5m = 100m <= 100m (boundary)
    expect(isConservativelyInsideGeofence(95, 5)).toBe(true);
  });

  it('returns false when distance + accuracy > 100m', () => {
    // 95m + 15m = 110m > 100m
    expect(isConservativelyInsideGeofence(95, 15)).toBe(false);
    // 99m + 30m = 129m > 100m
    expect(isConservativelyInsideGeofence(99, 30)).toBe(false);
  });

  it('returns false when distance or accuracy is null/undefined/NaN', () => {
    expect(isConservativelyInsideGeofence(null, 10)).toBe(false);
    expect(isConservativelyInsideGeofence(50, null)).toBe(false);
    expect(isConservativelyInsideGeofence(NaN, 10)).toBe(false);
    expect(isConservativelyInsideGeofence(50, NaN)).toBe(false);
  });
});

