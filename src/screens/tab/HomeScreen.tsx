import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemeColors } from '../../utils/theme.utils';
import {
  Ionicons,
  IconNames,
  fontSize,
  fontFamily,
} from '../../utils/fontIcons.utils';
import { wp, hp } from '../../utils/responsive.utils';
import {
  formatDistance,
  formatCheckInTime,
  getErrorMessage,
} from '../../utils/helper.utils';
import {
  calculateDistanceFromOffice,
  isInsideGeofence,
  isConservativelyInsideGeofence,
} from '../../utils/geofence.utils';
import {
  GEOFENCE_RADIUS,
  MAX_ACCURACY_THRESHOLD_METERS,
} from '../../constants/location';
import {
  getCurrentLocation,
  isValidLocation,
  isFreshLocation,
  isAcceptableAccuracy,
  DEFAULT_CURRENT_OPTIONS,
} from '../../utils/location.utils';
import { MainHeader, AttendanceMap } from '../../components';
import { useLocation, useStableLocation, useNetwork } from '../../hooks';
import { useAttendanceStore } from '../../store/attendanceStore';
import { AttendanceRecord } from '../../types/attendance';

export default function HomeScreen() {
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Real-time network / offline state
  const { isOffline } = useNetwork();

  // Raw accepted GPS tracking
  const { location, status, error, startTracking, stopTracking, retry } =
    useLocation();

  // Visually smoothed location exclusively for UI & Map
  const stableLocation = useStableLocation(location);

  const addAttendance = useAttendanceStore(state => state.addAttendance);
  const hasCheckedInToday = useAttendanceStore(
    state => state.hasCheckedInToday,
  );
  const records = useAttendanceStore(state => state.records);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === todayStr);
  const hasCheckedIn = !!todayRecord;

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  // When GPS fix hasn't arrived yet and no terminal error has occurred
  const isFetchingLocation =
    (!location || !stableLocation) && status !== 'error';

  // Visual distance from office using smoothed location
  const rawStableDistance = calculateDistanceFromOffice(stableLocation);
  const distance = !Number.isNaN(rawStableDistance) ? rawStableDistance : null;

  // Basic visual indicator
  const isInside = isInsideGeofence(distance);
  const isAccurate =
    !!location &&
    isAcceptableAccuracy(location.accuracy, MAX_ACCURACY_THRESHOLD_METERS);


  const handleCheckIn = async () => {
    if (hasCheckedInToday(todayStr)) {
      Alert.alert('Check In', 'You have already checked in today.');
      return;
    }

    if (isCheckingIn) {
      return;
    }

    setIsCheckingIn(true);

    try {
      // Step 9: Check In requests a fresh actual GPS location fix
      const freshLocation = await getCurrentLocation(DEFAULT_CURRENT_OPTIONS);

      // Validate location structure
      if (!isValidLocation(freshLocation)) {
        Alert.alert(
          'Check In',
          'Unable to get your location.\nPlease move to an open area and try again.',
        );
        return;
      }

      // Validate freshness
      if (!isFreshLocation(freshLocation.timestamp)) {
        Alert.alert(
          'Check In',
          'Unable to get your location.\nPlease move to an open area and try again.',
        );
        return;
      }

      // Validate GPS accuracy threshold (<= 30m)
      if (
        !isAcceptableAccuracy(
          freshLocation.accuracy,
          MAX_ACCURACY_THRESHOLD_METERS,
        )
      ) {
        Alert.alert(
          'Check In',
          'Location accuracy is too low.\nPlease move to an open area and try again.',
        );
        return;
      }

      // Calculate distance from office using the fresh location
      const freshDistance = calculateDistanceFromOffice(freshLocation);

      if (Number.isNaN(freshDistance) || freshDistance > GEOFENCE_RADIUS) {
        Alert.alert('Check In', 'You must be within 100m of the office.');
        return;
      }

      // Apply accuracy-aware boundary check: distance + accuracy <= 100m
      if (
        !isConservativelyInsideGeofence(
          freshDistance,
          freshLocation.accuracy,
          GEOFENCE_RADIUS,
        )
      ) {
        Alert.alert(
          'Check In',
          'Location accuracy is too low.\nPlease move to an open area and try again.',
        );
        return;
      }

      // Guard duplicate check-in
      if (hasCheckedInToday(todayStr)) {
        Alert.alert('Check In', 'You have already checked in today.');
        return;
      }

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        date: todayStr,
        checkInTime: formatCheckInTime(new Date()),
        latitude: freshLocation.latitude,
        longitude: freshLocation.longitude,
        accuracy: freshLocation.accuracy,
        distanceFromOffice: freshDistance,
        status: 'checked_in',
      };

      addAttendance(newRecord);
    } catch (checkInError: any) {
      if (checkInError === 'permission_denied') {
        Alert.alert(
          'Check In',
          'Location permission is required to check in.',
        );
      } else if (checkInError === 'position_unavailable') {
        Alert.alert(
          'Check In',
          'Your location is currently unavailable.\nPlease enable GPS and try again.',
        );
      } else if (checkInError === 'timeout') {
        Alert.alert(
          'Check In',
          'Unable to get your location.\nPlease move to an open area and try again.',
        );
      } else {
        Alert.alert(
          'Check In',
          'Unable to get your location.\nPlease move to an open area and try again.',
        );
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <MainHeader />

      {/* Offline Connectivity Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons
            name={IconNames.cloudOfflineFilled}
            size={fontSize.f16}
            color={ThemeColors.background}
            style={styles.offlineIcon}
          />
          <Text style={styles.offlineText}>
            You are offline • Attendance will be saved locally
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Top Map Section: rendered using visually smoothed stableLocation */}
        <AttendanceMap
          userLocation={stableLocation}
          isInside={isInside}
          style={styles.mapSection}
        />

        {/* Bottom Card Section */}
        <ScrollView
          style={styles.bottomSheet}
          contentContainerStyle={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Office Header */}
          <View style={styles.officeHeader}>
            <Text style={styles.officeTitle}>Office</Text>
            <Text style={styles.officeSubtitle}>
              ({GEOFENCE_RADIUS} m radius)
            </Text>
          </View>

          {/* Distance Row */}
          <View style={styles.distanceRow}>
            <View style={styles.distanceLeft}>
              <Text style={styles.distanceLabel}>Distance from office</Text>
              <Text style={styles.distanceValue}>
                {status === 'error' ? '-- m' : formatDistance(distance)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isFetchingLocation
                  ? styles.badgeLocating
                  : status === 'error'
                  ? styles.badgeOutside
                  : !isAccurate
                  ? styles.badgeWeakGps
                  : isInside
                  ? styles.badgeInside
                  : styles.badgeOutside,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isFetchingLocation
                    ? styles.badgeTextLocating
                    : status === 'error'
                    ? styles.badgeTextOutside
                    : !isAccurate
                    ? styles.badgeTextWeakGps
                    : isInside
                    ? styles.badgeTextInside
                    : styles.badgeTextOutside,
                ]}
              >
                {isFetchingLocation
                  ? 'Locating...'
                  : status === 'error'
                  ? 'GPS Off'
                  : !isAccurate
                  ? 'Weak GPS'
                  : isInside
                  ? 'Inside Office'
                  : 'Outside Office'}
              </Text>
            </View>
          </View>

          {/* Dynamic Alert Banner */}
          {hasCheckedIn ? (
            <View style={[styles.alertBanner, styles.alertBannerSuccess]}>
              <Ionicons
                name={IconNames.checkmarkCircleFilled}
                size={fontSize.f24}
                color={ThemeColors.green}
                style={styles.alertIcon}
              />
              <View style={styles.alertTextGroup}>
                <Text style={styles.alertTitleSuccess}>
                  Checked In Successfully!
                </Text>
                <Text style={styles.alertSubtitleSuccess}>
                  Today at {todayRecord.checkInTime}
                </Text>
              </View>
            </View>
          ) : isFetchingLocation ? (
            <View style={[styles.alertBanner, styles.alertBannerLocating]}>
              <ActivityIndicator
                size="small"
                color={ThemeColors.primary}
                style={styles.alertIcon}
              />
              <View style={styles.alertTextGroup}>
                <Text style={styles.alertTitleLocating}>Locating...</Text>
                <Text style={styles.alertSubtitleLocating}>
                  Fetching your current location. Please wait...
                </Text>
              </View>
            </View>
          ) : status === 'error' && error ? (
            <View style={[styles.alertBanner, styles.alertBannerDanger]}>
              <Ionicons
                name={IconNames.alertCircleFilled}
                size={fontSize.f24}
                color={ThemeColors.danger}
                style={styles.alertIcon}
              />
              <View style={styles.alertTextGroup}>
                <Text style={styles.alertTitleDanger}>
                  {error === 'position_unavailable'
                    ? 'Location Services Disabled'
                    : error === 'permission_denied'
                    ? 'Permission Denied'
                    : 'Location Error'}
                </Text>
                <Text style={styles.alertSubtitleDanger}>
                  {error === 'position_unavailable'
                    ? 'GPS is turned off. Please turn on Location in your notification bar or device settings.'
                    : getErrorMessage(error)}
                </Text>
              </View>
            </View>
          ) : !isAccurate && location ? (
            <View style={[styles.alertBanner, styles.alertBannerWarning]}>
              <Ionicons
                name={IconNames.alertCircleFilled}
                size={fontSize.f24}
                color={ThemeColors.warning}
                style={styles.alertIcon}
              />
              <View style={styles.alertTextGroup}>
                <Text style={styles.alertTitleWarning}>
                  Low GPS Accuracy (±{Math.round(location.accuracy)}m)
                </Text>
                <Text style={styles.alertSubtitleWarning}>
                  Using cell tower indoors. Move near a window or outdoors to
                  get satellite GPS lock.
                </Text>
              </View>
            </View>
          ) : isInside ? (
            <View style={[styles.alertBanner, styles.alertBannerSuccess]}>
              <Ionicons
                name={IconNames.checkmarkCircleFilled}
                size={fontSize.f24}
                color={ThemeColors.green}
                style={styles.alertIcon}
              />
              <Text style={styles.alertMessageSuccess}>
                You are inside the office area.{'\n'}You can now mark your
                attendance.
              </Text>
            </View>
          ) : (
            <View style={[styles.alertBanner, styles.alertBannerDanger]}>
              <Ionicons
                name={IconNames.alertCircleFilled}
                size={fontSize.f24}
                color={ThemeColors.danger}
                style={styles.alertIcon}
              />
              <Text style={styles.alertMessageDanger}>
                You are outside the office area.{'\n'}Move closer to mark your
                attendance.
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              hasCheckedIn ||
              isCheckingIn ||
              isFetchingLocation ||
              (!isInside && status !== 'error')
                ? styles.actionButtonDisabled
                : styles.actionButtonActive,
            ]}
            disabled={
              hasCheckedIn ||
              isCheckingIn ||
              isFetchingLocation ||
              (!isInside && status !== 'error')
            }
            activeOpacity={0.85}
            onPress={status === 'error' ? retry : handleCheckIn}
          >
            {isCheckingIn ? (
              <ActivityIndicator size="small" color={ThemeColors.white} />
            ) : (
              <Text style={styles.actionButtonText}>
                {hasCheckedIn
                  ? 'Checked In'
                  : status === 'error'
                  ? 'Enable GPS / Retry'
                  : isFetchingLocation
                  ? 'Locating...'
                  : 'Check In'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
  },
  content: {
    flex: 1,
  },
  mapSection: {
    height: hp('42%'),
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: ThemeColors.cardBackground,
    borderTopLeftRadius: wp('6%'),
    borderTopRightRadius: wp('6%'),
    marginTop: -hp('2%'),
    shadowColor: ThemeColors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomSheetContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
  },
  officeHeader: {
    alignItems: 'center',
    marginBottom: hp('1.8%'),
  },
  officeTitle: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.bold,
    color: ThemeColors.textPrimary,
  },
  officeSubtitle: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
    marginTop: hp('0.2%'),
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  distanceLeft: {
    flex: 1,
  },
  distanceLabel: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
    marginBottom: hp('0.3%'),
  },
  distanceValue: {
    fontSize: fontSize.f24,
    fontFamily: fontFamily.bold,
    color: ThemeColors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.7%'),
    borderRadius: wp('4%'),
  },
  badgeInside: {
    backgroundColor: ThemeColors.greenS2,
  },
  badgeOutside: {
    backgroundColor: ThemeColors.redS1,
  },
  badgeLocating: {
    backgroundColor: ThemeColors.blueS2,
  },
  badgeWeakGps: {
    backgroundColor: ThemeColors.amberS1,
  },
  badgeText: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.semiBold,
  },
  badgeTextInside: {
    color: ThemeColors.green,
  },
  badgeTextOutside: {
    color: ThemeColors.danger,
  },
  badgeTextLocating: {
    color: ThemeColors.blueText,
  },
  badgeTextWeakGps: {
    color: ThemeColors.amberText,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1.4%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
    marginBottom: hp('2.5%'),
  },
  alertBannerSuccess: {
    backgroundColor: ThemeColors.greenS1,
    borderColor: ThemeColors.greenBorder,
  },
  alertBannerDanger: {
    backgroundColor: ThemeColors.redS1,
    borderColor: ThemeColors.redBorder,
  },
  alertBannerLocating: {
    backgroundColor: ThemeColors.blueS1,
    borderColor: ThemeColors.blueBorder,
  },
  alertBannerWarning: {
    backgroundColor: ThemeColors.amberS1,
    borderColor: ThemeColors.amberBorder,
  },
  alertIcon: {
    marginRight: wp('3%'),
  },
  alertTextGroup: {
    flex: 1,
  },
  alertTitleSuccess: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.bold,
    color: ThemeColors.greenDark,
  },
  alertSubtitleSuccess: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.greenDark,
    marginTop: hp('0.2%'),
  },
  alertTitleWarning: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.bold,
    color: ThemeColors.amberDark,
  },
  alertSubtitleWarning: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.amberDark,
    marginTop: hp('0.2%'),
  },
  offlineBanner: {
    backgroundColor: ThemeColors.slateDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('4%'),
  },
  offlineIcon: {
    marginRight: wp('2%'),
  },
  offlineText: {
    color: ThemeColors.background,
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
  },
  alertTitleDanger: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.bold,
    color: ThemeColors.redDark,
  },
  alertSubtitleDanger: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.redDark,
    marginTop: hp('0.2%'),
  },
  alertTitleLocating: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.bold,
    color: ThemeColors.blueDark,
  },
  alertSubtitleLocating: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.blueDark,
    marginTop: hp('0.2%'),
  },
  alertMessageSuccess: {
    flex: 1,
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
    color: ThemeColors.greenDark,
    lineHeight: 18,
  },
  alertMessageDanger: {
    flex: 1,
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
    color: ThemeColors.redDark,
    lineHeight: 18,
  },
  actionButton: {
    height: hp('6%'),
    borderRadius: wp('2.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: ThemeColors.primary,
  },
  actionButtonDisabled: {
    backgroundColor: ThemeColors.disabledBackground,
  },
  actionButtonText: {
    color: ThemeColors.white,
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
  },
});

