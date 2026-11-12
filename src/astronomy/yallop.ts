export type YallopClass = "A" | "B" | "C" | "D" | "E" | "F";

export interface YallopResult {
  qValue: number;

  classification: YallopClass;

  /*
   * True when the crescent is predicted
   * to be observable by some conventional
   * means under the Yallop criterion.
   *
   * A-D = observable category
   * E-F = not observable category
   */
  visible: boolean;

  /*
   * True when eventual naked-eye
   * visibility is part of the category.
   *
   * C may require optical aid first
   * to locate the crescent.
   */
  nakedEyeVisible: boolean;

  /*
   * True when optical aid is needed
   * or may be needed.
   */
  opticalAidRequired: boolean;

  description: string;
}

/*
 * Yallop (1997) q-test
 *
 * q = (ARCV - f(W')) / 10
 *
 * where:
 *
 * f(W') =
 *   11.8371
 *   - 6.3226 W'
 *   + 0.7319 W'^2
 *   - 0.1018 W'^3
 *
 * ARCV:
 * geocentric difference in altitude
 * between Moon and Sun at best time,
 * in degrees.
 *
 * W':
 * topocentric crescent width,
 * in arcminutes.
 */
export function calculateYallop(
  arcv: number,
  crescentWidthArcMin: number,
): YallopResult {
  const w = crescentWidthArcMin;

  const threshold = 11.8371 - 6.3226 * w + 0.7319 * w ** 2 - 0.1018 * w ** 3;

  const qValue = (arcv - threshold) / 10;

  /*
   * A
   *
   * q > +0.216
   *
   * Easily visible to the
   * unaided eye.
   */
  if (qValue > 0.216) {
    return {
      qValue,

      classification: "A",

      visible: true,

      nakedEyeVisible: true,

      opticalAidRequired: false,

      description: "Easily visible to the unaided eye",
    };
  }

  /*
   * B
   *
   * +0.216 >= q > -0.014
   *
   * Visible to the unaided eye
   * under perfect atmospheric
   * conditions.
   */
  if (qValue > -0.014) {
    return {
      qValue,

      classification: "B",

      visible: true,

      nakedEyeVisible: true,

      opticalAidRequired: false,

      description: "Visible to the unaided eye under perfect conditions",
    };
  }

  /*
   * C
   *
   * -0.014 >= q > -0.160
   *
   * Optical aid may be required
   * to FIND the crescent first.
   *
   * Once located, naked-eye
   * visibility may be possible.
   */
  if (qValue > -0.16) {
    return {
      qValue,

      classification: "C",

      visible: true,

      nakedEyeVisible: true,

      opticalAidRequired: true,

      description:
        "May need optical aid to find the crescent before naked-eye visibility",
    };
  }

  /*
   * D
   *
   * -0.160 >= q > -0.232
   *
   * Optical aid is required.
   */
  if (qValue > -0.232) {
    return {
      qValue,

      classification: "D",

      visible: true,

      nakedEyeVisible: false,

      opticalAidRequired: true,

      description: "Visible only with optical aid",
    };
  }

  /*
   * E
   *
   * -0.232 >= q > -0.293
   *
   * Not visible with conventional
   * telescopes according to Yallop.
   */
  if (qValue > -0.293) {
    return {
      qValue,

      classification: "E",

      visible: false,

      nakedEyeVisible: false,

      opticalAidRequired: false,

      description: "Not visible with conventional telescopes",
    };
  }

  /*
   * F
   *
   * q <= -0.293
   *
   * Below the nominal Danjon-limit
   * region in the Yallop criterion.
   */
  return {
    qValue,

    classification: "F",

    visible: false,

    nakedEyeVisible: false,

    opticalAidRequired: false,

    description: "Not visible; below the nominal Danjon-limit region",
  };
}
