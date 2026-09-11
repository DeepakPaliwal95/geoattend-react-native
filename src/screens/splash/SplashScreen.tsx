import { View, Image, StyleSheet } from 'react-native';
import React from 'react';
import { IMAGES } from '../../assets';
import { hp, wp } from '../../utils/responsive.utils';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={IMAGES.splash} style={styles.logo} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: wp('100%'),
    height: hp('100%'),
  },
});
