import { StyleSheet, View } from 'react-native';
import React from 'react';
import { ThemeColors } from '../../utils/theme.utils';
import { MainHeader } from '../../components';

export default function AttendanceHistory() {
  return (
    <View style={styles.container}>
      <MainHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
  },
});
