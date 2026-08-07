import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { useJournalStore } from '@/state/useJournalStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Journal() {
  const t = useTheme();
  const [text, setText] = useState('');
  const { entries, add, remove } = useJournalStore();
  const save = () => { if (!text.trim()) return; add(text); setText(''); };
  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>Tefekkür notları</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: 6 }}>Sadece cihazında kalan küçük notlar.</Text>
    <TextInput multiline value={text} onChangeText={setText} placeholder="Bugün aklında kalan ne?" placeholderTextColor={t.inkFaint} style={{ minHeight: 132, marginTop: spacing.xl, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, color: t.ink, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, padding: spacing.lg, textAlignVertical: 'top' }} />
    <Pressable onPress={save} style={{ backgroundColor: t.gold, alignSelf: 'flex-end', borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: 11, marginTop: spacing.md }}><Text style={{ color: t.onGold, fontFamily: fonts.sansBold }}>Kaydet</Text></Pressable>
    <SectionHeader title="Geçmiş" />
    {entries.length === 0 ? <Text style={{ color: t.inkFaint, fontFamily: fonts.sans }}>İlk notın burada görünecek.</Text> : <View style={{ gap: spacing.sm }}>{entries.map((entry) => <Pressable key={entry.id} onLongPress={() => remove(entry.id)} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.ink, fontFamily: fonts.sans, lineHeight: 22 }}>{entry.text}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>{new Date(entry.createdAt).toLocaleDateString('tr-TR')}</Text></Pressable>)}</View>}
  </Screen>;
}
