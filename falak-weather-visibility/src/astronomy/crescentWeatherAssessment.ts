import type {
  CrescentWeatherAssessment,
  WeatherForecast,
} from "../types/weather";

type Impact = "GOOD" | "CAUTION" | "BAD" | "UNKNOWN";

function factor(
  key: string,
  value: number | null,
  unit: string,
  goodMax: number,
  cautionMax: number,
  lowerIsBetter: boolean,
  goodText: string,
  cautionText: string,
  badText: string,
) {
  if (value === null) {
    return {
      key, value, unit, impact: "UNKNOWN" as Impact,
      explanation: "لا توجد بيانات كافية لهذا المؤشر.",
    };
  }

  const good = lowerIsBetter ? value <= goodMax : value >= goodMax;
  const caution = lowerIsBetter ? value <= cautionMax : value >= cautionMax;

  return {
    key, value, unit,
    impact: (good ? "GOOD" : caution ? "CAUTION" : "BAD") as Impact,
    explanation: good ? goodText : caution ? cautionText : badText,
  };
}

/**
 * Operational weather suitability indicator.
 * This is a transparent heuristic, NOT a validated probability of sighting.
 * Astronomical Yallop/Odeh results must remain independent and unchanged.
 */
export function assessCrescentWeather(
  weather: WeatherForecast,
): CrescentWeatherAssessment {
  const w = weather.snapshot;
  const factors = [
    factor(
      "cloudCover", w.cloudCover, "%",
      20, 50, true,
      "غطاء سحابي منخفض نسبيًا.",
      "السحب قد تعيق جزءًا من الأفق.",
      "غطاء سحابي مرتفع؛ الرصد قد يكون صعبًا.",
    ),
    factor(
      "lowCloudCover", w.lowCloudCover, "%",
      15, 40, true,
      "السحب المنخفضة محدودة.",
      "توجد سحب منخفضة محتملة قرب الأفق.",
      "السحب المنخفضة كثيفة وقد تحجب الهلال.",
    ),
    factor(
      "midCloudCover", w.midCloudCover, "%",
      20, 60, true,
      "السحب المتوسطة محدودة.",
      "السحب المتوسطة قد تقلل وضوح الهلال.",
      "السحب المتوسطة كثيفة وقد تؤثر في الرصد.",
    ),
    factor(
      "highCloudCover", w.highCloudCover, "%",
      25, 100, true,
      "السحب المرتفعة محدودة.",
      "السحب المرتفعة قد تقلل التباين؛ ويختلف تأثيرها حسب سماكتها.",
      "انتشار السحب المرتفعة كبير؛ وقد تقلل تباين الهلال، مع أن تأثيرها يعتمد على سماكتها ونوعها.",
    ),
    factor(
      "visibility", w.visibilityMeters, "m",
      10000, 5000, false,
      "مدى الرؤية الأفقية جيد.",
      "مدى الرؤية متوسط.",
      "مدى الرؤية ضعيف.",
    ),
    factor(
      "relativeHumidity", w.relativeHumidity, "%",
      70, 85, true,
      "الرطوبة ليست مرتفعة بشدة.",
      "الرطوبة قد تزيد الضباب/العوالق قرب الأفق.",
      "رطوبة مرتفعة؛ احتمال الضباب أو العوالق أكبر.",
    ),
    factor(
      "precipitationProbability", w.precipitationProbability, "%",
      10, 35, true,
      "احتمال الهطول منخفض.",
      "يوجد احتمال لهطول.",
      "احتمال الهطول مرتفع.",
    ),
  ];

  const known = factors.filter((item) => item.impact !== "UNKNOWN");
  if (known.length !== factors.length) {
    return {
      condition: "UNKNOWN",
      score: null,
      summary: "بيانات الطقس غير كافية لإصدار تقييم موثوق لظروف الرصد.",
      factors,
      limitations: [
        "هذا تقييم لملاءمة الطقس وليس إثباتًا لرؤية الهلال.",
        "توقعات الطقس لا تعادل قياسًا أرضيًا مباشرًا أو صورة قمر صناعي لحظية.",
      ],
      weather,
    };
  }

  // Total cloud cover is the strongest cloud indicator; low clouds carry
  // greater weight because they are more likely to obstruct the horizon.
  // Mid/high layers have smaller weights because opacity is not available.
  const weights: Record<string, number> = {
    cloudCover: 0.30,
    lowCloudCover: 0.25,
    midCloudCover: 0.10,
    highCloudCover: 0.05,
    visibility: 0.15,
    relativeHumidity: 0.10,
    precipitationProbability: 0.05,
  };

  const points: Record<Impact, number> = {
    GOOD: 100,
    CAUTION: 50,
    BAD: 0,
    UNKNOWN: 0,
  };

  let weightedScore = 0;
  let totalWeight = 0;

  for (const item of known) {
    const weight = weights[item.key] ?? 0;
    weightedScore += points[item.impact] * weight;
    totalWeight += weight;
  }

  const score = Math.round(weightedScore / totalWeight);
  // High-cloud coverage is a caution signal only because its percentage
  // does not describe optical thickness/transparency. Core obstruction
  // factors still prevent a FAVORABLE classification.
  const hasCriticalBadFactor = factors.some(
    (item) =>
      ["cloudCover", "lowCloudCover", "visibility", "precipitationProbability"].includes(item.key) &&
      item.impact === "BAD",
  );

  const condition =
    score >= 75 && !hasCriticalBadFactor
      ? "FAVORABLE"
      : score >= 40
        ? "MIXED"
        : "UNFAVORABLE";

  const summary =
    condition === "FAVORABLE"
      ? "ظروف الطقس تبدو ملائمة نسبيًا للرصد؛ يلزم التحقق الميداني."
      : condition === "MIXED"
        ? "ظروف الرصد متوسطة؛ قد تؤثر السحب أو الرؤية على المشاهدة."
        : "ظروف الطقس غير ملائمة غالبًا للرصد في هذا التوقيت.";

  return {
    condition,
    score,
    summary,
    factors,
    limitations: [
      "الدرجة مؤشر تشغيلي تقريبي وليست احتمالًا إحصائيًا لرؤية الهلال.",
      "بيانات Open-Meteo توقعات نماذج عددية؛ لا تمثل رصدًا مباشرًا للسماء عند موقع الراصد.",
      "يجب عرض نتيجة الحساب الفلكي منفصلة عن تقييم الطقس، وعدم تعديل تصنيف Yallop/Odeh بهذه الدرجة.",
    ],
    weather,
  };
}
