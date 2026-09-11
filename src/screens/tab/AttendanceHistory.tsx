import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeColors } from '../../utils/theme.utils';
import {
  Ionicons,
  IconNames,
  fontSize,
  fontFamily,
} from '../../utils/fontIcons.utils';
import { wp, hp } from '../../utils/responsive.utils';
import { formatDateHeader, formatDistance } from '../../utils/helper.utils';
import { MainHeader } from '../../components';
import { useAttendanceStore } from '../../store/attendanceStore';
import { AttendanceRecord } from '../../types/attendance';

export default function AttendanceHistory() {
  const navigation = useNavigation<any>();
  const records = useAttendanceStore(state => state.records);

  const handleBack = () => {
    navigation.navigate('HomeScreen');
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.recordGroup}>
      {/* Date Header */}
      <Text style={styles.dateHeader}>{formatDateHeader(item.date)}</Text>

      {/* Attendance Record Card */}
      <View style={styles.recordCard}>
        <View style={styles.statusDot} />
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>Checked In</Text>
          <Text style={styles.recordTime}>{item.checkInTime}</Text>
        </View>
        <Text style={styles.recordDistance}>
          {formatDistance(item.distanceFromOffice)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MainHeader />

      {/* Subheader with Back Button and Title */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleBack}
        >
          <Ionicons
            name={IconNames.chevronBack}
            size={fontSize.f22}
            color={ThemeColors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Attendance History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* History List or Empty State */}
      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={IconNames.calendarOutline}
            size={fontSize.f36}
            color={ThemeColors.disabled}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No attendance records yet</Text>
          <Text style={styles.emptySubtitle}>
            Your check-in history will appear here once you mark your
            attendance inside the office area.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: ThemeColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: ThemeColors.border,
  },
  backButton: {
    width: wp('8%'),
    height: wp('8%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  screenTitle: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.semiBold,
    color: ThemeColors.textPrimary,
  },
  headerSpacer: {
    width: wp('8%'),
  },
  listContent: {
    paddingHorizontal: wp('4.5%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('4%'),
  },
  recordGroup: {
    marginBottom: hp('1%'),
  },
  dateHeader: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
    color: ThemeColors.textSecondary,
    marginBottom: hp('0.8%'),
    marginLeft: wp('1%'),
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.cardBackground,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.8%'),
    borderWidth: 1,
    borderColor: ThemeColors.border,
    shadowColor: ThemeColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statusDot: {
    width: wp('2.8%'),
    height: wp('2.8%'),
    borderRadius: wp('1.4%'),
    backgroundColor: ThemeColors.green,
    marginRight: wp('3.5%'),
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: fontSize.f14,
    fontFamily: fontFamily.semiBold,
    color: ThemeColors.textPrimary,
  },
  recordTime: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.regular,
    color: ThemeColors.textSecondary,
    marginTop: hp('0.3%'),
  },
  recordDistance: {
    fontSize: fontSize.f12,
    fontFamily: fontFamily.medium,
    color: ThemeColors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
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
