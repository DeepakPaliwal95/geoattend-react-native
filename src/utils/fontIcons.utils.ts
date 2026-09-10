import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { fSize } from './responsive.utils';

const fontSize = {
  f5: fSize(0.6),
  f8: fSize(0.9),
  f10: fSize(1.2),
  f11: fSize(1.1),
  f12: fSize(1.4),
  f13: fSize(1.5),
  f14: fSize(1.6),
  f15: fSize(1.7),
  f16: fSize(1.8),
  f18: fSize(2.1),
  f20: fSize(2.3),
  f22: fSize(2.5),
  f24: fSize(2.8),
  f26: fSize(3.0),
  f28: fSize(3.2),
  f30: fSize(3.4),
  f32: fSize(3.7),
  f34: fSize(3.9),
  f36: fSize(4.1),
};

const fontFamily = {
  regular: 'Inter-Regular',
  bold: 'Inter-Bold',
  light: 'Inter-Light',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  extraBold: 'Inter-ExtraBold',
};

export { Ionicons, MaterialDesignIcons, fontSize, fontFamily };
