/**
 * Represents a single successful attendance check-in record.
 */
export interface AttendanceRecord {
  id: string;
  date: string; // Format: YYYY-MM-DD
  checkInTime: string; // Format: hh:mm A (e.g., '09:24 AM')
  latitude: number;
  longitude: number;
  distanceFromOffice: number; // in meters
  status: 'checked_in';
}
