export function formatTime(
  date: Date | null,
  timeZone = "Africa/Cairo",
): string {
  if (!date) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
}
