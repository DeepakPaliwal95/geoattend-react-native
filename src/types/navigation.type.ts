import { NavigatorScreenParams } from '@react-navigation/native';

export type TRootStack = {
  SplashScreen: undefined;
  PermissionScreen: undefined;
  TabNavigator: NavigatorScreenParams<TBottomTabStack>;
};

export type TBottomTabStack = {
  HomeScreen: undefined;
  AttendanceHistory: undefined;
};
