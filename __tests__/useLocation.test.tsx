import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useLocation, UseLocationReturn } from '../src/hooks/useLocation';
import * as locationUtils from '../src/utils/location.utils';
import * as usePermissionModule from '../src/hooks/usePermission';

jest.mock('../src/utils/location.utils', () => {
  const actual = jest.requireActual('../src/utils/location.utils');
  return {
    ...actual,
    startLocationTracking: jest.fn(),
    stopLocationTracking: jest.fn(),
  };
});

describe('useLocation hook', () => {
  let mockPermissionState: string = 'granted';
  let hookValue: UseLocationReturn;

  function TestComponent() {
    hookValue = useLocation();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockPermissionState = 'granted';
    jest.spyOn(usePermissionModule, 'usePermission').mockImplementation(() => ({
      permissionState: mockPermissionState as any,
      isChecking: false,
      checkPermission: jest.fn(),
      requestPermission: jest.fn(),
      openSettings: jest.fn(),
    }));
  });

  it('initializes with idle status, null location, and null error', () => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });
    expect(hookValue.status).toBe('idle');
    expect(hookValue.location).toBeNull();
    expect(hookValue.error).toBeNull();
  });

  it('does not start tracking if permission is not granted', () => {
    mockPermissionState = 'denied';
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    expect(locationUtils.startLocationTracking).not.toHaveBeenCalled();
    expect(hookValue.status).toBe('idle');
  });

  it('starts tracking when permission is granted and updates state on location received', () => {
    let successCb: (loc: locationUtils.LocationData) => void = () => {};
    (locationUtils.startLocationTracking as jest.Mock).mockImplementation(
      (onSuccess) => {
        successCb = onSuccess;
        return 101;
      },
    );

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    expect(hookValue.status).toBe('starting');
    expect(locationUtils.startLocationTracking).toHaveBeenCalledTimes(1);

    const now = Date.now();
    ReactTestRenderer.act(() => {
      successCb({
        latitude: 26.885142,
        longitude: 75.811562,
        accuracy: 10,
        timestamp: now,
      });
    });

    expect(hookValue.status).toBe('tracking');
    expect(hookValue.location).toEqual({
      latitude: 26.885142,
      longitude: 75.811562,
      accuracy: 10,
      timestamp: now,
    });
    expect(hookValue.error).toBeNull();
  });

  it('rejects stale location fixes older than 10 seconds', () => {
    let successCb: (loc: locationUtils.LocationData) => void = () => {};
    (locationUtils.startLocationTracking as jest.Mock).mockImplementation(
      (onSuccess) => {
        successCb = onSuccess;
        return 101;
      },
    );

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    // 15 seconds ago (> 10s max age)
    ReactTestRenderer.act(() => {
      successCb({
        latitude: 26.885142,
        longitude: 75.811562,
        accuracy: 10,
        timestamp: Date.now() - 15000,
      });
    });

    expect(hookValue.location).toBeNull();
    expect(hookValue.status).toBe('starting');
  });

  it('rejects poor accuracy fixes (> 30 meters) and retains previous valid location', () => {
    let successCb: (loc: locationUtils.LocationData) => void = () => {};
    (locationUtils.startLocationTracking as jest.Mock).mockImplementation(
      (onSuccess) => {
        successCb = onSuccess;
        return 101;
      },
    );

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    const validTime = Date.now();
    ReactTestRenderer.act(() => {
      successCb({
        latitude: 26.885142,
        longitude: 75.811562,
        accuracy: 15,
        timestamp: validTime,
      });
    });

    expect(hookValue.location?.accuracy).toBe(15);

    // Poor accuracy fix: 45m (> 30m)
    ReactTestRenderer.act(() => {
      successCb({
        latitude: 26.999999,
        longitude: 75.999999,
        accuracy: 45,
        timestamp: Date.now(),
      });
    });

    // Previous valid location is retained, poor fix rejected
    expect(hookValue.location?.accuracy).toBe(15);
    expect(hookValue.location?.latitude).toBe(26.885142);
  });


  it('prevents duplicate watchers when startTracking is called multiple times', () => {
    (locationUtils.startLocationTracking as jest.Mock).mockReturnValue(102);

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
      hookValue.startTracking();
      hookValue.startTracking();
    });

    expect(locationUtils.startLocationTracking).toHaveBeenCalledTimes(1);
  });

  it('handles location error and updates state', () => {
    let errorCb: (err: locationUtils.LocationError) => void = () => {};
    (locationUtils.startLocationTracking as jest.Mock).mockImplementation(
      (_, onError) => {
        errorCb = onError;
        return 103;
      },
    );

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    ReactTestRenderer.act(() => {
      errorCb('position_unavailable');
    });

    expect(hookValue.status).toBe('error');
    expect(hookValue.error).toBe('position_unavailable');
  });

  it('stops active watcher when error is permission_denied', () => {
    let errorCb: (err: locationUtils.LocationError) => void = () => {};
    (locationUtils.startLocationTracking as jest.Mock).mockImplementation(
      (_, onError) => {
        errorCb = onError;
        return 104;
      },
    );

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    ReactTestRenderer.act(() => {
      errorCb('permission_denied');
    });

    expect(locationUtils.stopLocationTracking).toHaveBeenCalledWith(104);
    expect(hookValue.status).toBe('error');
    expect(hookValue.error).toBe('permission_denied');
  });

  it('stops tracking and clears watcher on stopTracking call', () => {
    (locationUtils.startLocationTracking as jest.Mock).mockReturnValue(105);

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    ReactTestRenderer.act(() => {
      hookValue.stopTracking();
    });

    expect(locationUtils.stopLocationTracking).toHaveBeenCalledWith(105);
    expect(hookValue.status).toBe('idle');
  });

  it('cleans up active watcher on unmount', () => {
    (locationUtils.startLocationTracking as jest.Mock).mockReturnValue(106);

    let renderer: ReactTestRenderer.ReactTestRenderer = undefined as any;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    ReactTestRenderer.act(() => {
      renderer.unmount();
    });

    expect(locationUtils.stopLocationTracking).toHaveBeenCalledWith(106);
  });

  it('restarts tracking on retry', () => {
    let errorCb: (err: locationUtils.LocationError) => void = () => {};
    (locationUtils.startLocationTracking as jest.Mock).mockImplementation(
      (_, onError) => {
        errorCb = onError;
        return 107;
      },
    );

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent />);
    });

    ReactTestRenderer.act(() => {
      hookValue.startTracking();
    });

    ReactTestRenderer.act(() => {
      errorCb('timeout');
    });

    expect(hookValue.status).toBe('error');
    expect(hookValue.error).toBe('timeout');

    ReactTestRenderer.act(() => {
      hookValue.retry();
    });

    expect(hookValue.status).toBe('starting');
    expect(hookValue.error).toBeNull();
  });
});
