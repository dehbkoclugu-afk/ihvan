import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan';

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerMoment {
  key: PrayerKey;
  label: string;
  time: Date;
  isPrayer: boolean;
}

export interface PrayerDay {
  moments: PrayerMoment[];
  qibla: number;
  methodLabel: string;
}

const labels: Record<PrayerKey, string> = {
  fajr: 'İmsak',
  sunrise: 'Güneş',
  dhuhr: 'Öğle',
  asr: 'İkindi',
  maghrib: 'Akşam',
  isha: 'Yatsı',
};

const prayerKeys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function prayerDay(latitude: number, longitude: number, date = new Date()): PrayerDay {
  const coordinates = new Coordinates(latitude, longitude);
  const times = new PrayerTimes(coordinates, date, CalculationMethod.Turkey());

  return {
    moments: prayerKeys.map((key) => ({
      key,
      label: labels[key],
      time: times[key],
      isPrayer: key !== 'sunrise',
    })),
    qibla: Qibla(coordinates),
    methodLabel: 'Adhan Turkey · Diyanet yöntemi yaklaşımı',
  };
}

export function nextPrayer(latitude: number, longitude: number, now = new Date()): PrayerMoment {
  const today = prayerDay(latitude, longitude, now).moments.filter((moment) => moment.isPrayer);
  const next = today.find((moment) => moment.time.getTime() > now.getTime());
  if (next) return next;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const first = prayerDay(latitude, longitude, tomorrow).moments.find((moment) => moment.key === 'fajr');
  if (!first) throw new Error('Tomorrow fajr could not be calculated');
  return first;
}

export function formatPrayerTime(date: Date, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);
}

export function compassTurn(qibla: number, heading: number): number {
  return ((qibla - heading) % 360 + 360) % 360;
}
