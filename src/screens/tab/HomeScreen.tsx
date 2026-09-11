import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
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
import {
  getStatusBadgeStyle,
  getErrorMessage,
} from '../../utils/helper.utils';
import { MainHeader } from '../../components';
import { useLocation } from '../../hooks';

export default function HomeScreen() {
  const { location, status, error, startTracking, stopTracking, retry } =
    useLocation();

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  const badge = getStatusBadgeStyle(status);

  return (
    <View style={styles.container}>
      <MainHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>GPS Tracking Status</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: badge.backgroundColor },
              ]}
            >
              {status === 'starting' ? (
                <ActivityIndicator
                  size="small"
                  color={badge.textColor}
                  style={styles.badgeSpinner}
                />
              ) : badge.icon ? (
                <Ionicons
                  name={badge.icon}
                  size={fontSize.f14}
                  color={badge.textColor}
                  style={styles.badgeIcon}
                />
              ) : null}
              <Text style={[styles.badgeText, { color: badge.textColor }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          {status === 'starting' && (
            <View style={styles.startingContainer}>
              <Text style={styles.startingText}>
                Acquiring initial satellite fix...
              </Text>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={retry}
              >
                <Ionicons
                  name={IconNames.refresh}
                  size={fontSize.f16}
                  color={ThemeColors.white}
                />
                <Text style={styles.retryButtonText}>Retry GPS</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Location Details when available */}
          {location && (
            <View style={styles.detailsContainer}>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Latitude</Text>
                  <Text style={styles.metricValue}>
                    {location.latitude.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Longitude</Text>
                  <Text style={styles.metricValue}>
                    {location.longitude.toFixed(6)}°
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>GPS Accuracy</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      {
                        color:
                          location.accuracy <= 20
                            ? ThemeColors.green
                            : ThemeColors.warning,
                      },
                    ]}
                  >
                    ±{Math.round(location.accuracy)} m
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Last Updated</Text>
                  <Text style={styles.metricValue}>
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Manual Controls */}
          <View style={styles.controlsRow}>
            {status === 'tracking' ? (
              <TouchableOpacity
                style={styles.stopButton}
                activeOpacity={0.8}
                onPress={stopTracking}
              >
                <Text style={styles.stopButtonText}>Stop Tracking</Text>
              </TouchableOpacity>
            ) : status === 'idle' ? (
              <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.8}
                onPress={startTracking}
              >
                <Text style={styles.startButtonText}>Start Tracking</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
  },
  scrollContent: {
    paddingHorizontal: wp('4.5%'),
    paddingVertical: hp('2%'),
  },
  card: {
    backgroundColor: ThemeColors.cardBackground,
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: ThemeColors.border,
    padding: wp('4.5%'),
    marginBottom: hp('2%'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  cardTitle: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
    color: ThemeColors.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('3%'),
  },
  badgeSpinner: {
    marginRight: wp('1.5%'),
  },
  badgeIcon: {
    marginRight: wp('1.5%'),
  },
  badgeText: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
  },
  startingContainer: {
    paddingVertical: hp('2%'),
    alignItems: 'center',
  },
  startingText: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
  },
  errorContainer: {
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.regular,
    color: ThemeColors.danger,
    textAlign: 'center',
    marginBottom: hp('1.5%'),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.primary,
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2.5%'),
  },
  retryButtonText: {
    color: ThemeColors.white,
    fontSize: fontSize.f14,
    fontFamily: fontFamily.semiBold,
    marginLeft: wp('2%'),
  },
  detailsContainer: {
    paddingTop: hp('1%'),
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
    marginBottom: hp('0.4%'),
  },
  metricValue: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
    color: ThemeColors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: ThemeColors.border,
    marginVertical: hp('1.5%'),
  },
  controlsRow: {
    marginTop: hp('2%'),
  },
  startButton: {
    backgroundColor: ThemeColors.primary,
    height: hp('5.5%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: ThemeColors.white,
    fontSize: fontSize.f14,
    fontFamily: fontFamily.semiBold,
  },
  stopButton: {
    backgroundColor: ThemeColors.iconContainerBackground,
    height: hp('5.5%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ThemeColors.border,
  },
  stopButtonText: {
    color: ThemeColors.textSecondary,
    fontSize: fontSize.f14,
    fontFamily: fontFamily.semiBold,
  },
});
