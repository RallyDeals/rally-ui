/** Seconds between now and `endTime`, floored and clamped to 0 once it has passed. */
export function timeRemainingInSeconds(endTime: Date | string | null | undefined): number {
  if (!endTime) {
    return 0;
  }
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  return Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
}
