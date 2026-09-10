import {Dimensions} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as WP,
  heightPercentageToDP as HP,
} from 'react-native-responsive-screen';

export const {width, height} = Dimensions.get('screen');

export const fSize = (size: number) => {
  return RFPercentage(size);
};

export const hp = (val: string) => {
  return HP(val);
};

export const wp = (val: string) => {
  return WP(val);
};