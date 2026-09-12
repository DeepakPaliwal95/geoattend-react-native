export interface AttendanceRecord {
  id: string;

  /**
   * Local calendar date.
   *
   * Example:
   * 2026-09-12
   */
  date: string;

  /**
   * Formatted time for display.
   */
  checkInTime: string;

  /**
   * Actual coordinates captured during Check In.
   */
  latitude: number;
  longitude: number;

  /**
   * GPS accuracy at Check In.
   */
  accuracy: number;

  /**
   * Distance from office at Check In.
   */
  distanceFromOffice: number;

  status: 'checked_in';
}

