import {
  getStatusBadgeStyle,
  getErrorMessage,
} from '../src/utils/helper.utils';
import { ThemeColors } from '../src/utils/theme.utils';
import { IconNames } from '../src/utils/fontIcons.utils';

describe('helper.utils - getStatusBadgeStyle', () => {
  it('returns active style for "tracking" status', () => {
    const badge = getStatusBadgeStyle('tracking');
    expect(badge.label).toBe('GPS Active');
    expect(badge.textColor).toBe(ThemeColors.green);
    expect(badge.backgroundColor).toBe(ThemeColors.green + '20');
    expect(badge.icon).toBe(IconNames.checkmarkCircle);
  });

  it('returns starting style for "starting" status', () => {
    const badge = getStatusBadgeStyle('starting');
    expect(badge.label).toBe('Starting GPS...');
    expect(badge.textColor).toBe(ThemeColors.secondary);
    expect(badge.backgroundColor).toBe(ThemeColors.secondary + '20');
    expect(badge.icon).toBeNull();
  });

  it('returns error style for "error" status', () => {
    const badge = getStatusBadgeStyle('error');
    expect(badge.label).toBe('Location Error');
    expect(badge.textColor).toBe(ThemeColors.danger);
    expect(badge.backgroundColor).toBe(ThemeColors.danger + '20');
    expect(badge.icon).toBe(IconNames.alertCircle);
  });

  it('returns inactive style for default / "idle" status', () => {
    const badge = getStatusBadgeStyle('idle');
    expect(badge.label).toBe('GPS Inactive');
    expect(badge.textColor).toBe(ThemeColors.textSecondary);
    expect(badge.backgroundColor).toBe(ThemeColors.disabled + '20');
    expect(badge.icon).toBe(IconNames.alertCircle);
  });
});

describe('helper.utils - getErrorMessage', () => {
  it('returns friendly message for permission_denied', () => {
    expect(getErrorMessage('permission_denied')).toBe(
      'Location permission was denied. Please grant location access in Settings.',
    );
  });

  it('returns friendly message for position_unavailable', () => {
    expect(getErrorMessage('position_unavailable')).toBe(
      'Location unavailable. Please ensure device Location Services (GPS) are turned ON.',
    );
  });

  it('returns friendly message for timeout', () => {
    expect(getErrorMessage('timeout')).toBe(
      'Location request timed out. Please tap retry to try again.',
    );
  });

  it('returns default message for unknown error or null', () => {
    expect(getErrorMessage('unknown')).toBe(
      'An error occurred while tracking location. Please tap retry.',
    );
    expect(getErrorMessage(null)).toBe(
      'An error occurred while tracking location. Please tap retry.',
    );
  });
});
