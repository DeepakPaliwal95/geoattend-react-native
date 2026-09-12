import {
  isValidLocation,
  isFreshLocation,
  isAcceptableAccuracy,
  mapNativeLocationError,
  getCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
} from '../src/utils/location.utils';
import Geolocation, {
  PositionError,
} from 'react-native-geolocation-service';

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  PositionError: {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
    PLAY_SERVICE_NOT_AVAILABLE: 4,
    SETTINGS_NOT_SATISFIED: 5,
    INTERNAL_ERROR: -1,
  },
}));

describe('location.utils - isValidLocation', () => {
  it('returns true for valid coordinates', () => {
    expect(
      isValidLocation({
        latitude: 26.885142,
        longitude: 75.811562,
        accuracy: 10,
      }),
    ).toBe(true);
  });

  it('returns false when coords is null or undefined', () => {
    expect(isValidLocation(null)).toBe(false);
    expect(isValidLocation(undefined)).toBe(false);
  });

  it('returns false when latitude or longitude is missing', () => {
    expect(isValidLocation({ longitude: 75.811562, accuracy: 10 } as any)).toBe(
      false,
    );
    expect(isValidLocation({ latitude: 26.885142, accuracy: 10 } as any)).toBe(
      false,
    );
    expect(
      isValidLocation({ latitude: 26.885142, longitude: 75.811562 } as any),
    ).toBe(false);
  });

  it('returns false when latitude or longitude is NaN', () => {
    expect(
      isValidLocation({ latitude: NaN, longitude: 75.811562, accuracy: 10 }),
    ).toBe(false);
    expect(
      isValidLocation({ latitude: 26.885142, longitude: NaN, accuracy: 10 }),
    ).toBe(false);
    expect(
      isValidLocation({ latitude: 26.885142, longitude: 75.811562, accuracy: NaN }),
    ).toBe(false);
  });

  it('returns false when latitude or longitude is outside valid bounds', () => {
    expect(
      isValidLocation({ latitude: 91, longitude: 75.811562, accuracy: 10 }),
    ).toBe(false);
    expect(
      isValidLocation({ latitude: -91, longitude: 75.811562, accuracy: 10 }),
    ).toBe(false);
    expect(
      isValidLocation({ latitude: 26.885142, longitude: 181, accuracy: 10 }),
    ).toBe(false);
    expect(
      isValidLocation({ latitude: 26.885142, longitude: -181, accuracy: 10 }),
    ).toBe(false);
  });

  it('returns false when accuracy is negative', () => {
    expect(
      isValidLocation({ latitude: 26.885142, longitude: 75.811562, accuracy: -5 }),
    ).toBe(false);
  });
});

describe('location.utils - isFreshLocation', () => {
  it('returns true when timestamp is within 10 seconds', () => {
    expect(isFreshLocation(Date.now())).toBe(true);
    expect(isFreshLocation(Date.now() - 3000)).toBe(true);
    expect(isFreshLocation(Date.now() - 10000)).toBe(true);
  });

  it('returns false when timestamp is older than 10 seconds', () => {
    expect(isFreshLocation(Date.now() - 10001)).toBe(false);
    expect(isFreshLocation(Date.now() - 60000)).toBe(false);
  });

  it('returns false when timestamp is null, undefined, or NaN', () => {
    expect(isFreshLocation(null)).toBe(false);
    expect(isFreshLocation(undefined)).toBe(false);
    expect(isFreshLocation(NaN)).toBe(false);
  });
});

describe('location.utils - isAcceptableAccuracy', () => {
  it('returns true when accuracy is within threshold (<= 30m)', () => {
    expect(isAcceptableAccuracy(5)).toBe(true);
    expect(isAcceptableAccuracy(20)).toBe(true);
    expect(isAcceptableAccuracy(30)).toBe(true);
  });

  it('returns false when accuracy exceeds threshold (> 30m)', () => {
    expect(isAcceptableAccuracy(31)).toBe(false);
    expect(isAcceptableAccuracy(45)).toBe(false);
  });

  it('returns false when accuracy is negative, null, undefined, or NaN', () => {
    expect(isAcceptableAccuracy(-1)).toBe(false);
    expect(isAcceptableAccuracy(null)).toBe(false);
    expect(isAcceptableAccuracy(undefined)).toBe(false);
    expect(isAcceptableAccuracy(NaN)).toBe(false);
  });
});


describe('location.utils - mapNativeLocationError', () => {
  it('maps PERMISSION_DENIED to permission_denied', () => {
    expect(
      mapNativeLocationError({
        code: PositionError.PERMISSION_DENIED,
        message: 'Permission denied',
      }),
    ).toBe('permission_denied');
  });

  it('maps POSITION_UNAVAILABLE to position_unavailable', () => {
    expect(
      mapNativeLocationError({
        code: PositionError.POSITION_UNAVAILABLE,
        message: 'Location unavailable',
      }),
    ).toBe('position_unavailable');
  });

  it('maps PLAY_SERVICE_NOT_AVAILABLE to position_unavailable', () => {
    expect(
      mapNativeLocationError({
        code: PositionError.PLAY_SERVICE_NOT_AVAILABLE,
        message: 'Play services not available',
      }),
    ).toBe('position_unavailable');
  });

  it('maps SETTINGS_NOT_SATISFIED to position_unavailable', () => {
    expect(
      mapNativeLocationError({
        code: PositionError.SETTINGS_NOT_SATISFIED,
        message: 'GPS disabled',
      }),
    ).toBe('position_unavailable');
  });

  it('maps TIMEOUT to timeout', () => {
    expect(
      mapNativeLocationError({
        code: PositionError.TIMEOUT,
        message: 'Timeout',
      }),
    ).toBe('timeout');
  });

  it('maps INTERNAL_ERROR or unknown code to unknown', () => {
    expect(
      mapNativeLocationError({
        code: PositionError.INTERNAL_ERROR,
        message: 'Internal',
      }),
    ).toBe('unknown');
    expect(mapNativeLocationError(null as any)).toBe('unknown');
  });
});

describe('location.utils - getCurrentLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves valid location data', async () => {
    (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (success) => {
        success({
          coords: {
            latitude: 26.885142,
            longitude: 75.811562,
            accuracy: 8.5,
          },
          timestamp: 1700000000000,
        });
      },
    );

    const location = await getCurrentLocation();
    expect(location).toEqual({
      latitude: 26.885142,
      longitude: 75.811562,
      accuracy: 8.5,
      timestamp: 1700000000000,
    });
  });

  it('rejects on invalid location data', async () => {
    (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (success) => {
        success({
          coords: {
            latitude: NaN,
            longitude: 75.811562,
            accuracy: 8.5,
          },
          timestamp: 1700000000000,
        });
      },
    );

    await expect(getCurrentLocation()).rejects.toThrow(
      'Invalid location coordinates received',
    );
  });

  it('rejects on native geolocation error', async () => {
    (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (_, error) => {
        error({
          code: PositionError.TIMEOUT,
          message: 'Timed out',
        });
      },
    );

    await expect(getCurrentLocation()).rejects.toBe('timeout');
  });
});

describe('location.utils - startLocationTracking and stopLocationTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invokes watchPosition and handles valid location callbacks', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    (Geolocation.watchPosition as jest.Mock).mockImplementation(
      (successCallback) => {
        successCallback({
          coords: {
            latitude: 26.885142,
            longitude: 75.811562,
            accuracy: 12,
          },
          timestamp: 1700000000000,
        });
        return 42;
      },
    );

    const watchId = startLocationTracking(onSuccess, onError);
    expect(watchId).toBe(42);
    expect(onSuccess).toHaveBeenCalledWith({
      latitude: 26.885142,
      longitude: 75.811562,
      accuracy: 12,
      timestamp: 1700000000000,
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('ignores invalid location in watchPosition', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    (Geolocation.watchPosition as jest.Mock).mockImplementation(
      (successCallback) => {
        successCallback({
          coords: {
            latitude: NaN,
            longitude: 75.811562,
            accuracy: 12,
          },
          timestamp: 1700000000000,
        });
        return 43;
      },
    );

    startLocationTracking(onSuccess, onError);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('handles error in watchPosition', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    (Geolocation.watchPosition as jest.Mock).mockImplementation(
      (_, errorCallback) => {
        errorCallback({
          code: PositionError.POSITION_UNAVAILABLE,
          message: 'GPS unavailable',
        });
        return 44;
      },
    );

    startLocationTracking(onSuccess, onError);
    expect(onError).toHaveBeenCalledWith('position_unavailable');
  });

  it('calls clearWatch and stopObserving in stopLocationTracking', () => {
    stopLocationTracking(42);
    expect(Geolocation.clearWatch).toHaveBeenCalledWith(42);
    expect(Geolocation.stopObserving).toHaveBeenCalled();
  });

  it('handles null watchId in stopLocationTracking gracefully', () => {
    stopLocationTracking(null);
    expect(Geolocation.clearWatch).not.toHaveBeenCalled();
    expect(Geolocation.stopObserving).toHaveBeenCalled();
  });
});
