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
