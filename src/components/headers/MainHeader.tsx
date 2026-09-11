import { Image, StyleSheet, View } from 'react-native';
import React from 'react';
import { IMAGES } from '../../assets';
import { ThemeColors } from '../../utils/theme.utils';
import { hp } from '../../utils/responsive.utils';

export default function MainHeader() {
  return (
    <View style={[styles.container]}>
      <Image source={IMAGES.logo} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: hp('7%'),
    backgroundColor: ThemeColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
});
