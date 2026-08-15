export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDuration(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) {
    return '0 minutes';
  }
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  return parts.join(' and ') || '0 minutes';
}
