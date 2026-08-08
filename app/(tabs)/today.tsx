import { Text, View } from 'react-native';
import { AyahCard } from '@/components/AyahCard';
import { RitualCard } from '@/components/RitualCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { dailyAyah } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { useStreakStore, type RitualStep } from '@/state/useStreakStore';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { activeStreakCount, dayKey } from '@/lib/dates';

export default function Today() {
  const t = useTheme();
  const name = useUserStore((s) => s.name);
  const { count, lastTickDay, doneSteps, doneDay, toggleStep } = useStreakStore();
  const recordAyahRead = useQuranProgressStore((s) => s.recordAyahRead);
  const today = dayKey();
  const todayDoneSteps = doneDay === today ? doneSteps : [];
  const streakCount = activeStreakCount(lastTickDay, count);
  const done = (step: RitualStep) => todayDoneSteps.includes(step);
  const ayah = dailyAyah();
  const date = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return <Screen tabbed>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.6 }}>{date}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 29, marginTop: 4 }}>Selam{name ? `, ${name}` : ''}</Text></View>
      <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, paddingHorizontal: 13, paddingVertical: 10, alignItems: 'center' }}><Text style={{ fontSize: 20 }}>🔥</Text><Text style={{ color: t.ink, fontFamily: fonts.sansBold, fontSize: 12 }}>{streakCount} gün</Text></View>
    </View>
    <View style={{ marginTop: spacing.xl }}><AyahCard ayah={ayah} done={done('ayah')} onComplete={() => {
      if (!done('ayah')) recordAyahRead(ayah.surah, ayah.ayah);
      toggleStep('ayah');
    }} /></View>
    <SectionHeader title="Bugünün ritmi" right={<Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium }}>{todayDoneSteps.length}/4</Text>} />
    <View style={{ gap: spacing.md }}>
      <RitualCard icon="bulb-outline" title="Anlam üzerinde düşün" subtitle="2 dakikalık sessiz bir ara" done={done('meaning')} onPress={() => toggleStep('meaning')} />
      <RitualCard icon="heart-outline" title="Günün duası" subtitle="Kısa bir niyet ve dua" done={done('dua')} onPress={() => toggleStep('dua')} />
      <RitualCard icon="ellipse-outline" title="33 zikir" subtitle="Ritmini yavaşlat, hatırla" done={done('dhikr')} onPress={() => toggleStep('dhikr')} />
    </View>
  </Screen>;
}
