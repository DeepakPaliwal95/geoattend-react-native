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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { bottom } = useSafeAreaInsets();
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
            height: 60 + bottom,
            paddingBottom: bottom + 10,
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
