import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaWrapper } from '../../components';
import {
  Ionicons,
  MaterialDesignIcons,
  IconNames,
  fontSize,
  fontFamily,
} from '../../utils/fontIcons.utils';
import { ThemeColors } from '../../utils/theme.utils';
import { wp, hp } from '../../utils/responsive.utils';
import { usePermission } from '../../hooks/usePermission';

export default function PermissionScreen() {
  const {
    permissionState,
    isChecking,
    requestPermission,
    checkPermission,
    openSettings,
  } = usePermission();

  const isBlocked = permissionState === 'blocked';
  const isUnavailable = permissionState === 'unavailable';
  const isDisabled = isBlocked || isUnavailable;

  const handlePrimaryPress = async () => {
    if (isDisabled) {
      await openSettings();
    } else {
      await requestPermission();
    }
  };

  const handleTryAgain = async () => {
    await checkPermission();
  };

  const handleNotNowPress = () => {
    Alert.alert(
      'Location Access Required',
      'GeoAttend requires your location to verify office attendance within the 100-meter geofence. You can enable it anytime.',
      [{ text: 'Understood', style: 'default' }],
    );
  };

  if (isChecking) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ThemeColors.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  // --- UI when Location Permission / Services are Disabled (Blocked or Unavailable) ---
  if (isDisabled) {
    return (
      <SafeAreaWrapper>
        <View style={styles.screen}>
          <View style={styles.contentContainer}>
            {/* Satellite Icon with Red X Badge */}
            <View style={styles.satelliteCircleWrapper}>
              <View style={styles.satelliteCircle}>
                <MaterialDesignIcons
                  name={IconNames.satelliteVariant}
                  size={fontSize.f36 * 1.8}
                  color={ThemeColors.slateMuted}
                />
              </View>
              <View style={styles.disabledBadge}>
                <MaterialDesignIcons
                  name={IconNames.closeThick}
                  size={fontSize.f15}
                  color={ThemeColors.white}
                />
              </View>
            </View>

            {/* Heading and Subtitle */}
            <Text style={styles.disabledTitle}>Location Services Disabled</Text>
            <Text style={styles.disabledSubtitle}>
              Please enable Location Services (GPS) to use GeoAttend. This is
              required to track your location and mark attendance.
            </Text>
          </View>

          {/* Bottom Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handlePrimaryPress}
            >
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tryAgainButton}
              activeOpacity={0.8}
              onPress={handleTryAgain}
            >
              <Text style={styles.tryAgainButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  // --- UI for Initial / Requestable Location Access ---
  return (
    <SafeAreaWrapper>
      <View style={styles.screen}>
        <View style={styles.contentContainer}>
          {/* Smartphone Illustration */}
          <View style={styles.illustrationWrapper}>
            <View style={styles.phoneFrame}>
              <View style={styles.phoneSpeaker} />
              <View style={styles.phoneInner}>
                <View style={styles.pinCircle}>
                  <Ionicons
                    name={IconNames.locationFilled}
                    size={fontSize.f28}
                    color={ThemeColors.primary}
                  />
                </View>
              </View>
              <View style={styles.phoneIndicator} />
            </View>
          </View>

          {/* Heading and Subtitle */}
          <Text style={styles.title}>Allow Location Access</Text>
          <Text style={styles.subtitle}>
            We need your location to show your position on the map and enable
            attendance check-in.
          </Text>

          {/* Feature List Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View style={styles.iconBadge}>
                <Ionicons
                  name={IconNames.location}
                  size={fontSize.f18}
                  color={ThemeColors.primary}
                />
              </View>
              <Text style={styles.featureText}>
                Show your location on map
              </Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={styles.iconBadge}>
                <Ionicons
                  name={IconNames.office}
                  size={fontSize.f18}
                  color={ThemeColors.primary}
                />
              </View>
              <Text style={styles.featureText}>
                Verify if you are inside office area
              </Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={styles.iconBadge}>
                <Ionicons
                  name={IconNames.checkSquare}
                  size={fontSize.f18}
                  color={ThemeColors.primary}
                />
              </View>
              <Text style={styles.featureText}>
                Mark your attendance
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handlePrimaryPress}
          >
            <Text style={styles.primaryButtonText}>Allow Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={handleNotNowPress}
          >
            <Text style={styles.secondaryButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ThemeColors.background,
    paddingHorizontal: wp('6%'),
    justifyContent: 'space-between',
    paddingBottom: hp('3%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ThemeColors.background,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp('2%'),
  },
  illustrationWrapper: {
    marginBottom: hp('3%'),
    alignItems: 'center',
  },
  satelliteCircleWrapper: {
    width: wp('38%'),
    height: wp('38%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('3.5%'),
    position: 'relative',
  },
  satelliteCircle: {
    width: '100%',
    height: '100%',
    borderRadius: wp('19%'),
    backgroundColor: ThemeColors.blueS1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBadge: {
    position: 'absolute',
    bottom: hp('0.5%'),
    right: wp('1.5%'),
    width: wp('10.5%'),
    height: wp('10.5%'),
    borderRadius: wp('5.25%'),
    backgroundColor: ThemeColors.danger,
    borderWidth: 3.5,
    borderColor: ThemeColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneFrame: {
    width: wp('22%'),
    height: hp('18%'),
    minHeight: 125,
    borderWidth: 2.5,
    borderColor: ThemeColors.textPrimary,
    borderRadius: wp('4.5%'),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('1%'),
    backgroundColor: ThemeColors.cardBackground,
  },
  phoneSpeaker: {
    width: wp('6%'),
    height: 3,
    backgroundColor: ThemeColors.textPrimary,
    borderRadius: 2,
  },
  phoneInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCircle: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: ThemeColors.blueS1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIndicator: {
    width: wp('8%'),
    height: 2.5,
    backgroundColor: ThemeColors.border,
    borderRadius: 1.5,
  },
  title: {
    fontSize: fontSize.f24,
    fontFamily: fontFamily.bold,
    color: ThemeColors.textPrimary,
    textAlign: 'center',
    marginBottom: hp('1.2%'),
  },
  subtitle: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: wp('4%'),
    marginBottom: hp('3.5%'),
  },
  disabledTitle: {
    fontSize: fontSize.f24,
    fontFamily: fontFamily.bold,
    color: ThemeColors.textPrimary,
    textAlign: 'center',
    marginBottom: hp('1.5%'),
    maxWidth: wp('70%'),
  },
  disabledSubtitle: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: wp('4%'),
    marginBottom: hp('3%'),
  },
  featureCard: {
    width: '100%',
    backgroundColor: ThemeColors.cardBackground,
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: ThemeColors.border,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
  },
  featureDivider: {
    height: 1,
    backgroundColor: ThemeColors.border,
    width: '100%',
  },
  iconBadge: {
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('4.25%'),
    backgroundColor: ThemeColors.blueS1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3.5%'),
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.f14,
    fontFamily: fontFamily.medium,
    color: ThemeColors.textPrimary,
  },
  actionsContainer: {
    width: '100%',
    paddingTop: hp('2%'),
  },
  primaryButton: {
    width: '100%',
    height: hp('6%'),
    minHeight: 48,
    backgroundColor: ThemeColors.primary,
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: ThemeColors.white,
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
  },
  secondaryButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    marginTop: hp('0.5%'),
  },
  secondaryButtonText: {
    color: ThemeColors.secondary,
    fontSize: fontSize.f14,
    fontFamily: fontFamily.medium,
  },
  tryAgainButton: {
    width: '100%',
    height: hp('6%'),
    minHeight: 48,
    backgroundColor: ThemeColors.blueS1,
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('1.5%'),
  },
  tryAgainButtonText: {
    color: ThemeColors.primary,
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
  },
});
