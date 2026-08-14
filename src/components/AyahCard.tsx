import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View, type NativeSyntheticEvent, type TextLayoutEventData } from 'react-native';
import type { DailyAyah } from '@/data/quran';
import { useT } from '@/i18n';
import { getDirectionalIconName, rowDirection } from '@/i18n/direction';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { selectionFeedback } from '@/services/haptics';
import { useUserStore } from '@/state/useUserStore';
import { radius, spacing } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { ArtSlot } from './ArtSlot';
import { ayahCardHeight } from './ayahCardLayout';

const PREVIEW_LINES = 7;

export function AyahCard({ ayah, done, onComplete, onOpen }: { ayah: DailyAyah; done?: boolean; onComplete?: () => void; onOpen?: () => void }) {
  const { locale, t } = useT();
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  const [measuredLines, setMeasuredLines] = useState(0);
  const cardHeight = ayahCardHeight({ text: ayah.text, measuredLines, lineHeight: metrics.lineHeight, hasAction: Boolean(onComplete || onOpen), maxLines: onOpen ? PREVIEW_LINES : undefined });
  useEffect(() => { setMeasuredLines(0); }, [ayah.id, metrics.fontSize]);
  const captureTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    const next = event.nativeEvent.lines.length;
    setMeasuredLines((current) => current === next ? current : next);
  };

  return <ArtSlot id="I3-daily-ayah" variant="hero" height={cardHeight} radius={radius.hero} contentStyle={{ padding: 0 }}>
    <View style={{ minHeight: cardHeight, padding: spacing.xl, justifyContent: 'space-between' }}>
      <View>
        <Text style={{ color: '#B6E3D4', fontFamily: fonts.sansSemiBold, fontSize: 12, letterSpacing: 1.6 }}>{ayah.reference.toUpperCase()}</Text>
        <Text selectable numberOfLines={onOpen ? PREVIEW_LINES : undefined} ellipsizeMode="tail" onTextLayout={captureTextLayout} style={{ color: '#F6F2E9', fontFamily: fonts.quran, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', marginTop: spacing.xl, writingDirection: 'rtl' }}>{ayah.text}</Text>
        <Text style={{ color: 'rgba(246,242,233,0.68)', fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.md }}>{t('today.ayahAttribution', { surah: ayah.surah, ayah: ayah.ayah })}</Text>
      </View>
      <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg }}>
      {onComplete ? <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: Boolean(done) }}
        accessibilityLabel={t('today.ayahReadA11y', { surah: ayah.surah, ayah: ayah.ayah })}
        onPress={() => { selectionFeedback(); onComplete(); }}
        style={{ minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: done ? '#B6E3D4' : 'rgba(255,255,255,0.14)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill }}
      >
        <Ionicons name={done ? 'checkmark' : 'bookmark-outline'} size={16} color={done ? '#10231E' : '#F6F2E9'} />
        <Text style={{ color: done ? '#10231E' : '#F6F2E9', fontFamily: fonts.sansSemiBold }}>{t(done ? 'today.readDone' : 'today.read')}</Text>
      </Pressable> : null}
      {onOpen ? <Pressable accessibilityRole="button" accessibilityLabel={t('today.openFullAyah')} onPress={onOpen} style={{ minHeight: 44, flexDirection: rowDirection(locale), gap: 5, alignItems: 'center', paddingHorizontal: 12 }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: '#B6E3D4', fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{t('today.openFullAyah')}</Text><Ionicons name={getDirectionalIconName('arrow-forward', locale)} size={15} color="#B6E3D4" /></Pressable> : null}
      </View>
    </View>
  </ArtSlot>;
}
