import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  style?: ViewStyle;
  statusBarColor?: string;
  StatusBarStyle?: 'default' | 'light-content' | 'dark-content';
}

const SafeAreaWrapper = ({
  children,
  useSafeArea = true,
  style,
  statusBarColor = 'white',
  StatusBarStyle = 'dark-content',
}: SafeAreaWrapperProps) => {
  const Wrapper = useSafeArea ? SafeAreaView : View;

  return (
    <View style={[styles.outer, { backgroundColor: statusBarColor }]}>
      <StatusBar barStyle={StatusBarStyle} />
      <Wrapper style={[styles.container, style]}>{children}</Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
