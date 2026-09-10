import { Image, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { IMAGES } from '../../assets';
import { hp, wp } from '../../utils/responsive.utils';
import { navigateAndSimpleReset } from '../../utils/navigation.utils';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigateAndSimpleReset('TabNavigator');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return <Image source={IMAGES.splash} style={styles.logo} />;
}

const styles = StyleSheet.create({
  logo: {
    width: wp('100%'),
    height: hp('100%'),
  },
});
