import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ThemeColors } from '../../utils/theme.utils';
import {
  Ionicons,
  IconNames,
  fontSize,
  fontFamily,
} from '../../utils/fontIcons.utils';
import { wp, hp } from '../../utils/responsive.utils';
import { navigateBack } from '../../utils/navigation.utils';

export interface StackHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

export default function StackHeader({
  title,
  onBack,
  showBack = true,
  rightComponent,
}: StackHeaderProps) {
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      navigateBack();
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleBackPress}
            testID="stack-header-back-button"
          >
            <Ionicons
              name={IconNames.chevronBack}
              size={fontSize.f22}
              color={ThemeColors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent ?? <View style={styles.headerSpacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: ThemeColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: ThemeColors.border,
  },
  leftContainer: {
    width: wp('10%'),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: wp('8%'),
    height: wp('8%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
    color: ThemeColors.textPrimary,
  },
  rightContainer: {
    width: wp('10%'),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: wp('8%'),
  },
});
