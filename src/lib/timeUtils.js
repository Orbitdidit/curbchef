// Server timestamps are UTC but may lack a timezone marker ("Z"),
// which makes `new Date()` wrongly treat them as local time.
export function parseServerDate(dateStr) {
  if (!dateStr) return new Date();
  const hasTz = /Z|[+-]\d{2}:?\d{2}$/.test(dateStr);
  return new Date(hasTz ? dateStr : dateStr + 'Z');
}

export function formatLocalTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}