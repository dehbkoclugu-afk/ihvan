import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { QURAN_SURAHS } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Quran() {
  const t = useTheme();
  const [query, setQuery] = useState('');
  const surahs = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    if (!needle) return QURAN_SURAHS;
    return QURAN_SURAHS.filter((surah) =>
      `${surah.id} ${surah.transliteration} ${surah.arabicName}`.toLocaleLowerCase('tr-TR').includes(needle),
    );
  }, [query]);

  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>Kur’an</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: 6 }}>114 sûre · 6.236 ayet · Arapça Uthmani metin</Text>
    <View style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: radius.inner, paddingHorizontal: spacing.md }}>
      <Ionicons name="search-outline" size={18} color={t.inkFaint} />
      <TextInput value={query} onChangeText={setQuery} placeholder="Sûre adı veya numarası" placeholderTextColor={t.inkFaint} autoCapitalize="none" style={{ flex: 1, color: t.ink, fontFamily: fonts.sans, paddingHorizontal: spacing.sm, paddingVertical: 13 }} />
      {query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={t.inkFaint} /></Pressable> : null}
    </View>
    <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.md }}>
      <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 }}>Meal ve tefsir, insan tarafından hazırlanmış kaynak ve kullanım hakları doğrulandıktan sonra açılacak. Makine/AI çevirisi kullanılmaz.</Text>
    </View>
    <SectionHeader title={query ? `${surahs.length} sonuç` : 'Tüm sûreler'} />
    <View style={{ gap: spacing.sm }}>{surahs.map((surah) => <Pressable key={surah.id} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${surah.id}` } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: radius.inner, opacity: pressed ? 0.75 : 1 })}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold }}>{surah.id}</Text></View>
      <View style={{ flex: 1, marginLeft: spacing.md }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>{surah.transliteration}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, marginTop: 2 }}>{surah.revelationPlace === 'meccan' ? 'Mekke' : 'Medine'} · {surah.ayahCount} ayet</Text></View>
      <Text style={{ color: t.ink, fontSize: 20, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Ionicons name="chevron-forward" size={17} color={t.inkFaint} style={{ marginLeft: spacing.sm }} />
    </Pressable>)}</View>
    {!surahs.length ? <Text style={{ color: t.inkSoft, textAlign: 'center', fontFamily: fonts.sans, marginVertical: spacing.xl }}>Sûre bulunamadı.</Text> : null}
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: spacing.xl }}>Arapça Kur’an metni: Tanzil Project · tanzil.net · CC BY 3.0 · verbatim</Text>
  </Screen>;
}
