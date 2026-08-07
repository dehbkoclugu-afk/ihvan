export interface Ayah {
  id: string;
  surahId: number;
  reference: string;
  arabic: string;
  reflection: string;
}

export interface SurahPreview {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  place: 'Mekke' | 'Medine';
}

// Starter metadata only. Full Quran text/translation is deliberately not fabricated;
// the production content sync will use a vetted Quran provider.
export const FEATURED_SURAHS: SurahPreview[] = [
  { id: 1, name: 'Fâtiha', arabicName: 'الفاتحة', verses: 7, place: 'Mekke' },
  { id: 2, name: 'Bakara', arabicName: 'البقرة', verses: 286, place: 'Medine' },
  { id: 13, name: 'Ra‘d', arabicName: 'الرعد', verses: 43, place: 'Medine' },
  { id: 94, name: 'İnşirah', arabicName: 'الشرح', verses: 8, place: 'Mekke' },
  { id: 67, name: 'Mülk', arabicName: 'الملك', verses: 30, place: 'Mekke' },
  { id: 112, name: 'İhlâs', arabicName: 'الإخلاص', verses: 4, place: 'Mekke' },
  { id: 113, name: 'Felak', arabicName: 'الفلق', verses: 5, place: 'Mekke' },
  { id: 114, name: 'Nâs', arabicName: 'الناس', verses: 6, place: 'Mekke' },
];

export const DAILY_AYAHS: Ayah[] = [
  { id: '94:5', surahId: 94, reference: 'İnşirah 94:5', arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', reflection: 'Zorluk tek başına gelmez. Bugün acele etmeden, önündeki kolaylık ihtimaline de yer aç.' },
  { id: '13:28', surahId: 13, reference: 'Ra‘d 13:28', arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', reflection: 'Kalbi sakinleştirmek için birkaç dakikalık bilinçli bir hatırlayışla güne ara ver.' },
  { id: '2:286', surahId: 2, reference: 'Bakara 2:286', arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', reflection: 'Bugünkü yükü bütünüyle taşımaya değil, sana düşen bir sonraki küçük adıma odaklan.' },
];

export function dailyAyah(date = new Date()): Ayah {
  const seed = Math.floor(date.getTime() / 86_400_000);
  return DAILY_AYAHS[seed % DAILY_AYAHS.length];
}
