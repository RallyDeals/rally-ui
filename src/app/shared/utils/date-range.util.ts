function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

export function dateInRange(iso: string, start: string, end: string): boolean {
  if (!start && !end) {
    return true;
  }
  const startMs = start ? new Date(`${start}T00:00:00`).getTime() : -Infinity;
  const endMs = end ? new Date(`${end}T23:59:59.999`).getTime() : Infinity;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) || (time >= startMs && time <= endMs);
}
