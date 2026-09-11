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
  IconNames,
  fontSize,
  fontFamily,
} from '../../utils/fontIcons.utils';
import { ThemeColors } from '../../utils/theme.utils';
import { wp, hp } from '../../utils/responsive.utils';
import { usePermission } from '../../hooks/usePermission';

export default function PermissionScreen() {
  const { permissionState, isChecking, requestPermission, openSettings } =
    usePermission();

  const handlePrimaryPress = async () => {
    if (permissionState === 'blocked') {
      await openSettings();
    } else {
      const nextState = await requestPermission();
      if (nextState === 'blocked') {
        await openSettings();
      }
    }
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

  const isBlocked = permissionState === 'blocked';
  const isUnavailable = permissionState === 'unavailable';

  const title = isBlocked
    ? 'Location Access Required'
    : isUnavailable
    ? 'Location Unavailable'
    : 'Allow Location Access';

  const subtitle = isBlocked
    ? 'Location permission has been disabled for GeoAttend. Please enable Location permission from your device Settings.'
    : isUnavailable
    ? 'Location services are not available on this device. Please check your device settings.'
    : 'We need your location to show your position on the map and enable attendance check-in.';

  const primaryButtonText = isBlocked
    ? 'Open Settings'
    : isUnavailable
    ? 'Open Settings'
    : 'Allow Location';

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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

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
              <Text style={styles.featureText}>Show your location on map</Text>
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
              <Text style={styles.featureText}>Mark your attendance</Text>
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
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
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
    backgroundColor: ThemeColors.iconContainerBackground,
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
    backgroundColor: ThemeColors.iconContainerBackground,
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
});
