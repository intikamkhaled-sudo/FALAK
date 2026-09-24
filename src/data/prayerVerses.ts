export type PrayerVerseKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerVerse {
  surah: string;
  surahEn: string;
  ayah: number;
  text: string;
}

export const prayerVerses: Record<PrayerVerseKey, PrayerVerse> = {
  fajr: {
    surah: "الإسراء",
    surahEn: "Al-Isra",
    ayah: 78,
    text: "أَقِمِ ٱلصَّلَوٰةَ لِدُلُوكِ ٱلشَّمْسِ إِلَىٰ غَسَقِ ٱلَّيْلِ وَقُرْءَانَ ٱلْفَجْرِ ۖ إِنَّ قُرْءَانَ ٱلْفَجْرِ كَانَ مَشْهُودًۭا",
  },

  dhuhr: {
    surah: "الروم",
    surahEn: "Ar-Rum",
    ayah: 18,
    text: "وَلَهُ ٱلْحَمْدُ فِى ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَعَشِيًّۭا وَحِينَ تُظْهِرُونَ",
  },

  asr: {
    surah: "البقرة",
    surahEn: "Al-Baqarah",
    ayah: 238,
    text: "حَٰفِظُواْ عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ وَقُومُواْ لِلَّهِ قَٰنِتِينَ",
  },

  maghrib: {
    surah: "هود",
    surahEn: "Hud",
    ayah: 114,
    text: "وَأَقِمِ ٱلصَّلَوٰةَ طَرَفَىِ ٱلنَّهَارِ وَزُلَفًۭا مِّنَ ٱلَّيْلِ ۚ إِنَّ ٱلْحَسَنَـٰتِ يُذْهِبْنَ ٱلسَّيِّـَٔاتِ ۚ ذَٰلِكَ ذِكْرَىٰ لِلذَّٰكِرِينَ",
  },

  isha: {
    surah: "الروم",
    surahEn: "Ar-Rum",
    ayah: 17,
    text: "فَسُبْحَـٰنَ ٱللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ",
  },
};
