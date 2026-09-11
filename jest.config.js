module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-permissions|react-native-responsive-fontsize|react-native-responsive-screen|react-native-iphone-x-helper)/)',
  ],
};
