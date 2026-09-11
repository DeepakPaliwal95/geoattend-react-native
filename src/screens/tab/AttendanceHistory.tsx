import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ThemeColors } from '../../utils/theme.utils';

export default function AttendanceHistory() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AttendanceHistory</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: ThemeColors.textPrimary,
  },
});
