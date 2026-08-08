import { Ionicons } from '@expo/vector-icons';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { entries, add, update, remove } = useJournalStore();
  const cancelEdit = () => { setEditingId(null); setText(''); };
  const save = () => {
    if (!text.trim()) return;
    if (editingId) update(editingId, text);
    else add(text);
    cancelEdit();
  };
  const startEdit = (id: string, value: string) => { setEditingId(id); setText(value); setPendingDeleteId(null); };
  const confirmDelete = (id: string) => {
    remove(id);
    if (editingId === id) cancelEdit();
    setPendingDeleteId(null);
  };
  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>Tefekkür notları</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: 6 }}>Sadece cihazında kalan küçük notlar.</Text>
    <TextInput multiline value={text} onChangeText={setText} placeholder={editingId ? 'Notunu düzenle' : 'Bugün aklında kalan ne?'} placeholderTextColor={t.inkFaint} style={{ minHeight: 132, marginTop: spacing.xl, backgroundColor: t.surface, borderWidth: 1, borderColor: editingId ? t.gold : t.border, borderRadius: radius.card, color: t.ink, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, padding: spacing.lg, textAlignVertical: 'top' }} />
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md }}>{editingId ? <Pressable onPress={cancelEdit} style={{ borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 11, backgroundColor: t.surface }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold }}>Vazgeç</Text></Pressable> : null}<Pressable onPress={save} style={{ backgroundColor: t.gold, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: 11 }}><Text style={{ color: t.onGold, fontFamily: fonts.sansBold }}>{editingId ? 'Güncelle' : 'Kaydet'}</Text></Pressable></View>
    <SectionHeader title="Geçmiş" />
    {entries.length === 0 ? <Text style={{ color: t.inkFaint, fontFamily: fonts.sans }}>İlk notın burada görünecek.</Text> : <View style={{ gap: spacing.sm }}>{entries.map((entry) => <View key={entry.id} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: editingId === entry.id ? t.gold : t.border, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.ink, fontFamily: fonts.sans, lineHeight: 22 }}>{entry.text}</Text><View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, flex: 1 }}>{new Date(entry.updatedAt ?? entry.createdAt).toLocaleDateString('tr-TR')}{entry.updatedAt ? ' · düzenlendi' : ''}</Text><Pressable accessibilityLabel="Notu düzenle" hitSlop={8} onPress={() => startEdit(entry.id, entry.text)} style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="pencil-outline" size={17} color={t.inkSoft} /></Pressable><Pressable accessibilityLabel="Notu sil" hitSlop={8} onPress={() => setPendingDeleteId(entry.id)} style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={17} color={t.danger} /></Pressable></View>{pendingDeleteId === entry.id ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: t.border }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11, flex: 1 }}>Bu not silinsin mi?</Text><Pressable onPress={() => setPendingDeleteId(null)} style={{ paddingHorizontal: spacing.md, paddingVertical: 8 }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>Vazgeç</Text></Pressable><Pressable onPress={() => confirmDelete(entry.id)} style={{ paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: t.danger }}><Text style={{ color: '#FFFFFF', fontFamily: fonts.sansBold, fontSize: 11 }}>Sil</Text></Pressable></View> : null}</View>)}</View>}
  </Screen>;
}
