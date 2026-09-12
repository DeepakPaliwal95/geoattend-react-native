import React, { useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeColors } from '../../utils/theme.utils';
import { fontSize, fontFamily } from '../../utils/fontIcons.utils';
import { wp, hp } from '../../utils/responsive.utils';
import { formatDateHeader, formatDistance } from '../../utils/helper.utils';
import StackHeader from '../../components/headers/StackHeader';
import EmptyListComponent from '../../components/common/EmptyListComponent';
import { useAttendanceStore } from '../../store/attendanceStore';
import { AttendanceRecord } from '../../types/attendance';

interface AttendanceRecordItemProps {
  item: AttendanceRecord;
}

const AttendanceRecordItem = React.memo(
  ({ item }: AttendanceRecordItemProps) => (
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
  ),
);

const keyExtractor = (item: AttendanceRecord): string => item.id;

export default function AttendanceHistory() {
  const navigation = useNavigation<any>();
  const records = useAttendanceStore(state => state.records);

  const handleBack = useCallback(() => {
    navigation.navigate('HomeScreen');
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: AttendanceRecord }) => (
      <AttendanceRecordItem item={item} />
    ),
    [],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <EmptyListComponent
        title="No attendance records yet"
        subtitle="Your check-in history will appear here once you mark your attendance inside the office area."
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <StackHeader title="Attendance History" onBack={handleBack} />

      <FlatList
        data={records}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          records.length === 0 && styles.emptyListContent,
        ]}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
  },
  listContent: {
    paddingHorizontal: wp('4.5%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('4%'),
  },
  emptyListContent: {
    flexGrow: 1,
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
});
