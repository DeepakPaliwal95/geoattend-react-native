import { RESULTS } from 'react-native-permissions';

jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);

import {
  mapPermissionResult,
  checkLocationPermission,
  requestLocationPermission,
  openAppSettings,
} from '../src/utils/permission.utils';

describe('permission.utils mapPermissionResult', () => {
  it('maps GRANTED to granted', () => {
    expect(mapPermissionResult(RESULTS.GRANTED)).toBe('granted');
  });

  it('maps LIMITED to granted', () => {
    expect(mapPermissionResult(RESULTS.LIMITED)).toBe('granted');
  });

  it('maps DENIED to denied', () => {
    expect(mapPermissionResult(RESULTS.DENIED)).toBe('denied');
  });

  it('maps BLOCKED to blocked', () => {
    expect(mapPermissionResult(RESULTS.BLOCKED)).toBe('blocked');
  });

  it('maps UNAVAILABLE to unavailable', () => {
    expect(mapPermissionResult(RESULTS.UNAVAILABLE)).toBe('unavailable');
  });

  it('checks location permission successfully', async () => {
    const status = await checkLocationPermission();
    expect(status).toBeDefined();
    expect(['granted', 'denied', 'blocked', 'unavailable']).toContain(status);
  });

  it('requests location permission successfully', async () => {
    const status = await requestLocationPermission();
    expect(status).toBeDefined();
    expect(['granted', 'denied', 'blocked', 'unavailable']).toContain(status);
  });

  it('calls openAppSettings without crashing', async () => {
    await expect(openAppSettings()).resolves.toBeUndefined();
  });
});
