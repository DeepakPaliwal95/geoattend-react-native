export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  distanceFromOffice: number;
  status: 'checked_in';
}
