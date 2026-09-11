import { useAttendanceStore } from '../src/store/attendanceStore';
import { AttendanceRecord } from '../src/types/attendance';

describe('attendanceStore', () => {
  beforeEach(() => {
    useAttendanceStore.getState().clearAttendance();
  });

  it('initializes with empty records and hasCheckedInToday as false', () => {
    const state = useAttendanceStore.getState();
    expect(state.records).toEqual([]);
    expect(state.hasCheckedInToday()).toBe(false);
  });

  it('adds attendance record successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    const record: AttendanceRecord = {
      id: 'test-1',
      date: today,
      checkInTime: '09:24 AM',
      latitude: 26.885142,
      longitude: 75.811562,
      distanceFromOffice: 38,
      status: 'checked_in',
    };

    useAttendanceStore.getState().addAttendance(record);

    const state = useAttendanceStore.getState();
    expect(state.records.length).toBe(1);
    expect(state.records[0]).toEqual(record);
    expect(state.hasCheckedInToday()).toBe(true);
    expect(state.getTodayRecord()).toEqual(record);
  });

  it('correctly handles historical records not from today', () => {
    const record: AttendanceRecord = {
      id: 'test-past',
      date: '2024-10-14',
      checkInTime: '09:18 AM',
      latitude: 26.885142,
      longitude: 75.811562,
      distanceFromOffice: 52,
      status: 'checked_in',
    };

    useAttendanceStore.getState().addAttendance(record);

    const state = useAttendanceStore.getState();
    expect(state.records.length).toBe(1);
    expect(state.hasCheckedInToday()).toBe(false);
    expect(state.getTodayRecord()).toBeUndefined();
  });

  it('clears all attendance records', () => {
    const today = new Date().toISOString().split('T')[0];
    const record: AttendanceRecord = {
      id: 'test-1',
      date: today,
      checkInTime: '09:24 AM',
      latitude: 26.885142,
      longitude: 75.811562,
      distanceFromOffice: 38,
      status: 'checked_in',
    };

    useAttendanceStore.getState().addAttendance(record);
    expect(useAttendanceStore.getState().records.length).toBe(1);

    useAttendanceStore.getState().clearAttendance();
    expect(useAttendanceStore.getState().records.length).toBe(0);
  });
});
