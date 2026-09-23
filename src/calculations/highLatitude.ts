type HighLatitudeRule =
  | "MIDDLE_OF_NIGHT"
  | "ONE_SEVENTH"
  | "ANGLE_BASED"
  | "NONE";

function getNightDuration(sunrise: Date, sunset: Date): number {
  return sunrise.getTime() - sunset.getTime();
}

/**
 * Middle of Night
 */
function middleOfNight(sunrise: Date, sunset: Date): Date {
  const nightDuration = getNightDuration(sunrise, sunset);

  return new Date(sunset.getTime() + nightDuration / 2);
}

/**
 * One Seventh of Night
 */
function oneSeventh(sunrise: Date, sunset: Date, isIsha: boolean): Date {
  const nightDuration = getNightDuration(sunrise, sunset);

  const portion = nightDuration / 7;

  if (isIsha) {
    return new Date(sunset.getTime() + portion);
  }

  return new Date(sunrise.getTime() - portion);
}

/**
 * Apply selected high latitude rule
 */
export function applyHighLatitudeRule(
  rule: HighLatitudeRule,
  sunrise: Date,
  sunset: Date,
  isIsha: boolean,
): Date | null {
  switch (rule) {
    case "MIDDLE_OF_NIGHT":
      return middleOfNight(sunrise, sunset);

    case "ONE_SEVENTH":
      return oneSeventh(sunrise, sunset, isIsha);

    case "ANGLE_BASED":
      /*
       * Placeholder.
       * Later we will implement
       * proportional angle based rule.
       */
      return oneSeventh(sunrise, sunset, isIsha);

    case "NONE":

    default:
      return null;
  }
}
