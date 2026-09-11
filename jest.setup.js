/* eslint-disable no-undef */
jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(),
  PositionError: {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
    PLAY_SERVICE_NOT_AVAILABLE: 4,
    SETTINGS_NOT_SATISFIED: 5,
    INTERNAL_ERROR: -1,
  },
}));

jest.mock('@react-native-vector-icons/ionicons', () => 'Ionicons');
jest.mock('@react-native-vector-icons/material-design-icons', () => 'MaterialDesignIcons');

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-screens', () => {
  const { View } = require('react-native');
  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    screensEnabled: jest.fn(() => false),
    freezeEnabled: jest.fn(() => false),
    Screen: View,
    ScreenContainer: View,
    ScreenStack: View,
    ScreenStackItem: View,
    NativeScreensModule: {},
    compatibilityFlags: {},
  };
});

const { Keyboard } = require('react-native');
Keyboard.addListener = jest.fn(() => ({ remove: jest.fn() }));
Keyboard.removeListener = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      setItem: jest.fn((key, value) => {
        store[key] = value;
        return Promise.resolve(null);
      }),
      getItem: jest.fn(key => {
        return Promise.resolve(store[key] || null);
      }),
      removeItem: jest.fn(key => {
        delete store[key];
        return Promise.resolve(null);
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve(null);
      }),
      getAllKeys: jest.fn(() => {
        return Promise.resolve(Object.keys(store));
      }),
    },
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = React.forwardRef((props, ref) => (
    <View {...props} ref={ref}>
      {props.children}
    </View>
  ));
  const MockMarker = props => <View {...props}>{props.children}</View>;
  const MockCircle = props => <View {...props}>{props.children}</View>;
  const MockUrlTile = props => <View {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Circle: MockCircle,
    UrlTile: MockUrlTile,
  };
});


