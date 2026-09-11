import {
  getStatusBadgeStyle,
  getErrorMessage,
  formatDistance,
  formatCheckInTime,
  formatDateHeader,
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

describe('helper.utils - formatDistance', () => {
  it('formats valid numbers with rounded meter unit', () => {
    expect(formatDistance(248)).toBe('248 m');
    expect(formatDistance(41.8)).toBe('42 m');
    expect(formatDistance(0)).toBe('0 m');
  });

  it('returns placeholder when null, undefined, or NaN', () => {
    expect(formatDistance(null)).toBe('-- m');
    expect(formatDistance(undefined)).toBe('-- m');
    expect(formatDistance(NaN)).toBe('-- m');
  });
});

describe('helper.utils - formatCheckInTime', () => {
  it('formats morning time correctly', () => {
    const morning = new Date(2024, 9, 15, 9, 24, 0);
    expect(formatCheckInTime(morning)).toBe('09:24 AM');
  });

  it('formats afternoon/evening time correctly', () => {
    const evening = new Date(2024, 9, 15, 17, 5, 0);
    expect(formatCheckInTime(evening)).toBe('05:05 PM');
  });

  it('formats midnight and noon correctly', () => {
    const midnight = new Date(2024, 9, 15, 0, 0, 0);
    expect(formatCheckInTime(midnight)).toBe('12:00 AM');
    const noon = new Date(2024, 9, 15, 12, 0, 0);
    expect(formatCheckInTime(noon)).toBe('12:00 PM');
  });
});

describe('helper.utils - formatDateHeader', () => {
  it('formats today date properly', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const formatted = formatDateHeader(dateStr);
    expect(formatted.startsWith('Today,')).toBe(true);
  });

  it('formats historical date with day of week', () => {
    // 2024-10-14 was Monday
    const formatted = formatDateHeader('2024-10-14');
    expect(formatted).toBe('Mon, 14 Oct 2024');
  });

  it('returns empty string for empty input', () => {
    expect(formatDateHeader('')).toBe('');
  });
});
