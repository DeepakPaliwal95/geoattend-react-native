import type { ComponentProps } from 'react';
import { ThemeColors } from './theme.utils';
import { Ionicons, IconNames } from './fontIcons.utils';
import { LocationError, LocationStatus } from './location.utils';

export type IconNameType = ComponentProps<typeof Ionicons>['name'];

export interface StatusBadgeStyle {
  backgroundColor: string;
  textColor: string;
  label: string;
  icon: IconNameType | null;
}

/**
 * Returns visual styling, label, and icon for GPS tracking status badges.
 */
export const getStatusBadgeStyle = (
  status: LocationStatus,
): StatusBadgeStyle => {
  switch (status) {
    case 'tracking':
      return {
        backgroundColor: ThemeColors.green + '20',
        textColor: ThemeColors.green,
        label: 'GPS Active',
        icon: IconNames.checkmarkCircle,
      };
    case 'starting':
      return {
        backgroundColor: ThemeColors.secondary + '20',
        textColor: ThemeColors.secondary,
        label: 'Starting GPS...',
        icon: null,
      };
    case 'error':
      return {
        backgroundColor: ThemeColors.danger + '20',
        textColor: ThemeColors.danger,
        label: 'Location Error',
        icon: IconNames.alertCircle,
      };
    default:
      return {
        backgroundColor: ThemeColors.disabled + '20',
        textColor: ThemeColors.textSecondary,
        label: 'GPS Inactive',
        icon: IconNames.alertCircle,
      };
  }
};

/**
 * Returns human-readable error messages for location tracking errors.
 */
export const getErrorMessage = (error: LocationError | null): string => {
  switch (error) {
    case 'permission_denied':
      return 'Location permission was denied. Please grant location access in Settings.';
    case 'position_unavailable':
      return 'Location unavailable. Please ensure device Location Services (GPS) are turned ON.';
    case 'timeout':
      return 'Location request timed out. Please tap retry to try again.';
    default:
      return 'An error occurred while tracking location. Please tap retry.';
  }
};

/**
 * Formats distance in meters into human-readable string (e.g., '248 m').
 */
export const formatDistance = (
  meters: number | null | undefined,
): string => {
  if (meters === null || meters === undefined || Number.isNaN(meters)) {
    return '-- m';
  }
  return `${Math.round(meters)} m`;
};

/**
 * Formats a Date object into 'hh:mm A' (e.g., '09:24 AM').
 */
export const formatCheckInTime = (date: Date = new Date()): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours < 10 ? `0${hours}` : `${hours}`;
  const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${strHours}:${strMinutes} ${ampm}`;
};

/**
 * Formats a YYYY-MM-DD date string into 'Today, 15 Oct 2024' or 'DayOfWeek, DD Mon YYYY'.
 */
export const formatDateHeader = (dateStr: string): string => {
  if (!dateStr) {
    return '';
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);

  const today = new Date();
  const isToday =
    today.getFullYear() === year &&
    today.getMonth() === month - 1 &&
    today.getDate() === day;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    yesterday.getFullYear() === year &&
    yesterday.getMonth() === month - 1 &&
    yesterday.getDate() === day;

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dayOfWeek = dayNames[targetDate.getDay()];
  const formattedDay = day;
  const formattedMonth = monthNames[month - 1];

  if (isToday) {
    return `Today, ${formattedDay} ${formattedMonth} ${year}`;
  }
  if (isYesterday) {
    return `Yesterday, ${formattedDay} ${formattedMonth} ${year}`;
  }

  return `${dayOfWeek}, ${formattedDay} ${formattedMonth} ${year}`;
};
