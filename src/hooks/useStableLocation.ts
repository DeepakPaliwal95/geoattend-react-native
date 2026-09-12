import { useState, useEffect, useRef } from 'react';
import { LocationData, isValidLocation } from '../utils/location.utils';
import { LOCATION_SMOOTHING_ALPHA } from '../constants/location';

/**
 * Custom hook that applies exponential smoothing to raw GPS coordinates
 * exclusively for UI rendering (Map marker and distance readout).
 *
 * Smoothing formula:
 * newDisplay = previousDisplay * (1 - alpha) + newGPS * alpha
 *
 * NOTE: NEVER use this smoothed location for Check-In geofence validation.
 */
export const useStableLocation = (
  rawLocation: LocationData | null,
  alpha: number = LOCATION_SMOOTHING_ALPHA,
): LocationData | null => {
  const [stableLocation, setStableLocation] = useState<LocationData | null>(
    rawLocation,
  );
  const stableRef = useRef<LocationData | null>(rawLocation);

  useEffect(() => {
    if (!rawLocation) {
      stableRef.current = null;
      setStableLocation(null);
      return;
    }

    if (!isValidLocation(rawLocation)) {
      return;
    }

    if (!stableRef.current) {
      // First valid fix: seed the smoothed location directly
      stableRef.current = rawLocation;
      setStableLocation(rawLocation);
      return;
    }

    const prev = stableRef.current;
    const smoothedLat =
      prev.latitude * (1 - alpha) + rawLocation.latitude * alpha;
    const smoothedLon =
      prev.longitude * (1 - alpha) + rawLocation.longitude * alpha;

    const updated: LocationData = {
      latitude: smoothedLat,
      longitude: smoothedLon,
      accuracy: rawLocation.accuracy,
      timestamp: rawLocation.timestamp,
    };

    stableRef.current = updated;
    setStableLocation(updated);
  }, [rawLocation, alpha]);

  return stableLocation;
};
