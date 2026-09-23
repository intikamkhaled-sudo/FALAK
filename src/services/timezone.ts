export interface LocalDate {
  year: number;
  month: number;
  day: number;
}

export function parseLocalDate(dateString: string): LocalDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function formatLocalDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatLocalTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function localDateTimeToUTC(
  dateString: string,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const [year, month, day] = dateString.split("-").map(Number);

  /*
   * Initial UTC guess.
   */
  let utcMillis = Date.UTC(year, month - 1, day, hour, minute, second);

  /*
   * Resolve timezone offset iteratively.
   *
   * This avoids hard-coding UTC+2 / UTC+3.
   */
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(utcMillis));

    const getPart = (type: string): number => {
      const value = parts.find((part) => part.type === type)?.value;

      if (!value) {
        throw new Error(`Missing timezone part: ${type}`);
      }

      return Number(value);
    };

    const localMillis = Date.UTC(
      getPart("year"),
      getPart("month") - 1,
      getPart("day"),
      getPart("hour"),
      getPart("minute"),
      getPart("second"),
    );

    const requestedMillis = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
    );

    const offset = localMillis - requestedMillis;

    utcMillis -= offset;
  }

  return new Date(utcMillis);
}
