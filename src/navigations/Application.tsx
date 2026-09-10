import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TRootStack } from '../types/navigation.type';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/splash/SplashScreen';
import { navigationRef } from '../utils/navigation.utils';

const RootNavigator = createNativeStackNavigator<TRootStack>();

export default function Application() {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator.Navigator screenOptions={{ headerShown: false }}>
        <RootNavigator.Screen component={SplashScreen} name="SplashScreen" />
        <RootNavigator.Screen component={TabNavigator} name="TabNavigator" />
      </RootNavigator.Navigator>
    </NavigationContainer>
  );
}
