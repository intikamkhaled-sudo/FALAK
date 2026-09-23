export const translations = {
  en: {
    appName: "FALAK",
    subtitle: "Astronomy & Prayer Companion",

    useMyLocation: "Use My Location",
    currentLocation: "Current Location",

    nextPrayer: "Next Prayer",
    remainingTime: "Remaining Time",
    prayerTimes: "Prayer Times",

    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",

    hijriDate: "Hijri Date",

    moon: "Moon",
    illumination: "Illumination",
    age: "Age",
    phaseAngle: "Phase Angle",
    nextNewMoon: "Next New Moon",
    days: "days",

    crescent: "Crescent",
    visibility: "Visibility",
    confidence: "Confidence",
    altitude: "Altitude",
    elongation: "Elongation",
    moonsetLag: "Moonset Lag",
    moonAge: "Moon Age",
    yallopClass: "Yallop Class",
    minutes: "min",

    visible: "VISIBLE",
    possible: "POSSIBLE",
    notVisible: "NOT VISIBLE",

    certain: "CERTAIN",
    likely: "LIKELY",
    uncertain: "UNCERTAIN",

    qibla: "Qibla",
    direction: "Direction",
    distanceToKaaba: "Distance to Kaaba",
    km: "km",

    north: "North",
    northEast: "North East",
    east: "East",
    southEast: "South East",
    south: "South",
    southWest: "South West",
    west: "West",
    northWest: "North West",
  },

  ar: {
    appName: "فلك",
    subtitle: "رفيقك للفلك ومواقيت الصلاة",

    useMyLocation: "استخدم موقعي",
    currentLocation: "موقعي الحالي",

    nextPrayer: "الصلاة القادمة",
    remainingTime: "الوقت المتبقي",
    prayerTimes: "مواقيت الصلاة",

    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",

    hijriDate: "التاريخ الهجري",

    moon: "القمر",
    illumination: "الإضاءة",
    age: "عمر القمر",
    phaseAngle: "زاوية الطور",
    nextNewMoon: "المحاق القادم",
    days: "يوم",

    crescent: "الهلال",
    visibility: "الرؤية",
    confidence: "درجة الثقة",
    altitude: "الارتفاع",
    elongation: "الاستطالة",
    moonsetLag: "الفارق حتى غروب القمر",
    moonAge: "عمر القمر",
    yallopClass: "تصنيف يالوب",
    minutes: "دقيقة",

    visible: "مرئي",
    possible: "محتمل الرؤية",
    notVisible: "غير مرئي",

    certain: "مؤكد",
    likely: "مرجح",
    uncertain: "غير مؤكد",

    qibla: "القبلة",
    direction: "الاتجاه",
    distanceToKaaba: "المسافة إلى الكعبة",
    km: "كم",

    north: "شمال",
    northEast: "شمال شرق",
    east: "شرق",
    southEast: "جنوب شرق",
    south: "جنوب",
    southWest: "جنوب غرب",
    west: "غرب",
    northWest: "شمال غرب",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
