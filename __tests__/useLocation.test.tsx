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

    ReactTestRenderer.act(() => {
      successCb({
        latitude: 26.885142,
        longitude: 75.811562,
        accuracy: 10,
        timestamp: 1700000000000,
      });
    });

    expect(hookValue.status).toBe('tracking');
    expect(hookValue.location).toEqual({
      latitude: 26.885142,
      longitude: 75.811562,
      accuracy: 10,
      timestamp: 1700000000000,
    });
    expect(hookValue.error).toBeNull();
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
