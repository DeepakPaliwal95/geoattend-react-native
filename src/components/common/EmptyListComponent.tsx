import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { ThemeColors } from '../../utils/theme.utils';
import {
  Ionicons,
  IconNames,
  fontSize,
  fontFamily,
} from '../../utils/fontIcons.utils';
import { wp, hp } from '../../utils/responsive.utils';

export interface EmptyListComponentProps {
  title?: string;
  subtitle?: string;
  iconName?: any;
  iconSize?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function EmptyListComponent({
  title = '',
  subtitle = '',
  iconName = IconNames.calendarOutline,
  iconSize = fontSize.f36,
  iconColor = ThemeColors.disabled,
  style,
}: EmptyListComponentProps) {
  return (
    <View style={[styles.emptyContainer, style]}>
      {iconName && (
        <Ionicons
          name={iconName}
          size={iconSize}
          color={iconColor}
          style={styles.emptyIcon}
        />
      )}
      {title?.trim()?.length > 0 && (
        <Text style={styles.emptyTitle}>{title}</Text>
      )}
      {subtitle?.trim()?.length > 0 && (
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
    paddingVertical: hp('8%'),
  },
  emptyIcon: {
    marginBottom: hp('2%'),
  },
  emptyTitle: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
    color: ThemeColors.textPrimary,
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
