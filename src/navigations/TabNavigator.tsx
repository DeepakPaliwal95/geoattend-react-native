import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/tab/HomeScreen';
import AttendanceHistory from '../screens/tab/AttendanceHistory';
import { TBottomTabStack } from '../types/navigation.type';
import { SafeAreaWrapper } from '../components';
import {
  MaterialDesignIcons,
  fontFamily,
  fontSize,
} from '../utils/fontIcons.utils';
import { ThemeColors } from '../utils/theme.utils';

const Tab = createBottomTabNavigator<TBottomTabStack>();

const renderHomeIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <MaterialDesignIcons
    name={focused ? 'home' : 'home-outline'}
    size={size}
    color={color}
  />
);

const renderHistoryIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <MaterialDesignIcons
    name={focused ? 'receipt-text-clock' : 'receipt-text-clock-outline'}
    size={size}
    color={color}
  />
);

export default function TabNavigator() {
  return (
    <SafeAreaWrapper>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ThemeColors.primary,
          tabBarInactiveTintColor: ThemeColors.gray,
          tabBarLabelStyle: {
            fontSize: fontSize.f12,
            fontFamily: fontFamily.medium,
          },
          tabBarStyle: {
            shadowColor: 'transparent',
          },
          tabBarItemStyle: {
            paddingVertical: 5,
          },
        }}
      >
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: renderHomeIcon,
          }}
        />
        <Tab.Screen
          name="AttendanceHistory"
          component={AttendanceHistory}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: renderHistoryIcon,
          }}
        />
      </Tab.Navigator>
    </SafeAreaWrapper>
  );
}
