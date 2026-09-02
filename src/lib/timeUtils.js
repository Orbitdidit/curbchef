// Server timestamps are UTC but may lack a timezone marker ("Z"),
// which makes `new Date()` wrongly treat them as local time.
export const APP_TIMEZONE = 'America/Chicago';

export function parseServerDate(dateStr) {
  if (!dateStr) return new Date();
  const hasTz = /Z|[+-]\d{2}:?\d{2}$/.test(dateStr);
  return new Date(hasTz ? dateStr : dateStr + 'Z');
}

export function formatLocalTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: APP_TIMEZONE });
}

export function formatLocalDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: APP_TIMEZONE });
}

export function formatLocalDateTime(date) {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: APP_TIMEZONE });
}

// Calendar day key in Houston time (for streaks / "today" checks)
export function localDayKey(date) {
  return date.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}