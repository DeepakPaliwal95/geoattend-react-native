import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Application from './src/navigations/Application';

export default function App() {
  return (
    <SafeAreaProvider>
      <Application />
    </SafeAreaProvider>
  );
}
