import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TRootStack } from '../types/navigation.type';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/splash/SplashScreen';
import PermissionScreen from '../screens/permission/PermissionScreen';
import { navigationRef } from '../utils/navigation.utils';
import { usePermission } from '../hooks/usePermission';

const RootNavigator = createNativeStackNavigator<TRootStack>();

export default function Application() {
  const { permissionState, isChecking } = usePermission();
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashDone(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const showSplash = !isSplashDone || isChecking;

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator.Navigator screenOptions={{ headerShown: false }}>
        {showSplash ? (
          <RootNavigator.Screen component={SplashScreen} name="SplashScreen" />
        ) : permissionState === 'granted' ? (
          <RootNavigator.Screen component={TabNavigator} name="TabNavigator" />
        ) : (
          <RootNavigator.Screen
            component={PermissionScreen}
            name="PermissionScreen"
          />
        )}
      </RootNavigator.Navigator>
    </NavigationContainer>
  );
}
