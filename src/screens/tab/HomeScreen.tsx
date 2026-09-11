import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemeColors } from '../../utils/theme.utils';
import {
  Ionicons,
  IconNames,
  fontSize,
  fontFamily,
} from '../../utils/fontIcons.utils';
import { wp, hp } from '../../utils/responsive.utils';
import { formatDistance, formatCheckInTime } from '../../utils/helper.utils';
import { calculateDistance, isInsideGeofence } from '../../utils/geofence.utils';
import { OFFICE_LOCATION } from '../../constants/location';
import { MainHeader, AttendanceMap } from '../../components';
import { useLocation } from '../../hooks';
import { useAttendanceStore } from '../../store/attendanceStore';
import { AttendanceRecord } from '../../types/attendance';

export default function HomeScreen() {
  const { location, startTracking, stopTracking } = useLocation();

  const addAttendance = useAttendanceStore(state => state.addAttendance);
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

  // Calculate live distance from office in meters
  const distance =
    location && location.latitude && location.longitude
      ? calculateDistance(
          location.latitude,
          location.longitude,
          OFFICE_LOCATION.latitude,
          OFFICE_LOCATION.longitude,
        )
      : null;

  const isInside = isInsideGeofence(distance);

  const handleCheckIn = () => {
    if (!location || !isInside || hasCheckedIn) {
      return;
    }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      date: todayStr,
      checkInTime: formatCheckInTime(new Date()),
      latitude: location.latitude,
      longitude: location.longitude,
      distanceFromOffice: distance ?? 0,
      status: 'checked_in',
    };

    addAttendance(newRecord);
  };

  return (
    <View style={styles.container}>
      <MainHeader />

      <View style={styles.content}>
        {/* Top Map Section */}
        <AttendanceMap
          userLocation={location}
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
            <Text style={styles.officeSubtitle}>(100 m radius)</Text>
          </View>

          {/* Distance Row */}
          <View style={styles.distanceRow}>
            <View style={styles.distanceLeft}>
              <Text style={styles.distanceLabel}>Distance from office</Text>
              <Text style={styles.distanceValue}>
                {formatDistance(distance)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isInside ? styles.badgeInside : styles.badgeOutside,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isInside ? styles.badgeTextInside : styles.badgeTextOutside,
                ]}
              >
                {isInside ? 'Inside Office' : 'Outside Office'}
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
              hasCheckedIn || !isInside
                ? styles.actionButtonDisabled
                : styles.actionButtonActive,
            ]}
            disabled={hasCheckedIn || !isInside}
            activeOpacity={0.85}
            onPress={handleCheckIn}
          >
            <Text style={styles.actionButtonText}>
              {hasCheckedIn ? 'Checked In' : 'Check In'}
            </Text>
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
    backgroundColor: ThemeColors.outsideAlertBackground,
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
    backgroundColor: ThemeColors.insideAlertBackground,
    borderColor: ThemeColors.insideAlertBorder,
  },
  alertBannerDanger: {
    backgroundColor: ThemeColors.outsideAlertBackground,
    borderColor: ThemeColors.outsideAlertBorder,
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
    color: ThemeColors.insideAlertText,
  },
  alertSubtitleSuccess: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.insideAlertText,
    marginTop: hp('0.2%'),
  },
  alertMessageSuccess: {
    flex: 1,
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
    color: ThemeColors.insideAlertText,
    lineHeight: 18,
  },
  alertMessageDanger: {
    flex: 1,
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
    color: ThemeColors.outsideAlertText,
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
    backgroundColor: ThemeColors.buttonDisabled,
  },
  actionButtonText: {
    color: ThemeColors.white,
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
  },
});
