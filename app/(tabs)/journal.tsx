import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ArtSlot } from '@/components/ArtSlot';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useArtwork } from '@/hooks/useArtwork';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleDate, useT } from '@/i18n';
import { rowDirection, textAlignment } from '@/i18n/direction';
import { useJournalStore } from '@/state/useJournalStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Journal() {
  const theme = useTheme();
  const artwork = useArtwork();
  const { locale, t } = useT();
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { entries, add, update, remove } = useJournalStore();
  const canSave = Boolean(text.trim());
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
    <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 32, textAlign: textAlignment(locale) }}>{t('journal.title')}</Text>
    <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: 6, textAlign: textAlignment(locale) }}>{t('journal.subtitle')}</Text>

    <TextInput
      accessibilityLabel={t('journal.noteA11y', { date: formatLocaleDate(new Date()) })}
      multiline
      value={text}
      onChangeText={setText}
      placeholder={t(editingId ? 'journal.editPlaceholder' : 'journal.placeholder')}
      placeholderTextColor={theme.inkFaint}
      style={{ minHeight: 148, marginTop: spacing.xl, backgroundColor: theme.surface, borderWidth: 1, borderColor: editingId ? theme.gold : theme.border, borderRadius: radius.card, color: theme.ink, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, padding: spacing.lg, textAlign: textAlignment(locale), textAlignVertical: 'top' }}
    />
    <View style={{ flexDirection: rowDirection(locale), justifyContent: 'flex-start', gap: spacing.sm, marginTop: spacing.md }}>
      {editingId ? <Pressable accessibilityRole="button" onPress={cancelEdit} style={{ minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: spacing.lg, backgroundColor: theme.surface }}><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold }}>{t('common.cancel')}</Text></Pressable> : null}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSave }} disabled={!canSave} onPress={save} style={{ backgroundColor: canSave ? theme.gold : theme.surfaceAlt, borderRadius: radius.pill, minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.xl }}><Text style={{ color: canSave ? theme.onGold : theme.inkFaint, fontFamily: fonts.sansBold }}>{t(editingId ? 'journal.update' : 'journal.save')}</Text></Pressable>
    </View>

    <SectionHeader title={t('common.history')} />
    {entries.length === 0 ? <ArtSlot id="I10-journal-empty" variant="card" height={190}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}><Text style={{ color: artwork.foreground, fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 21, textAlign: textAlignment(locale) }}>{t('journal.empty')}</Text></View>
    </ArtSlot> : <View style={{ gap: spacing.sm }}>{entries.map((entry) => <View key={entry.id} style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: editingId === entry.id ? theme.gold : theme.border, borderRadius: radius.inner, padding: spacing.lg }}>
      <Text style={{ color: theme.ink, fontFamily: fonts.sans, lineHeight: 22, textAlign: textAlignment(locale) }}>{entry.text}</Text>
      <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', marginTop: spacing.sm }}>
        <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, flex: 1, textAlign: textAlignment(locale) }}>{formatLocaleDate(new Date(entry.updatedAt ?? entry.createdAt))}{entry.updatedAt ? ` · ${t('journal.edited')}` : ''}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('journal.editA11y')} hitSlop={8} onPress={() => startEdit(entry.id, entry.text)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="pencil-outline" size={17} color={theme.inkSoft} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('journal.deleteA11y')} hitSlop={8} onPress={() => setPendingDeleteId(entry.id)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={17} color={theme.danger} /></Pressable>
      </View>
      {pendingDeleteId === entry.id ? <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: theme.border }}>
        <Text style={{ color: theme.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11, flex: 1, textAlign: textAlignment(locale) }}>{t('journal.deleteQuestion')}</Text>
        <Pressable accessibilityRole="button" onPress={() => setPendingDeleteId(null)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md }}><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{t('common.cancel')}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('journal.deleteConfirmA11y')} onPress={() => confirmDelete(entry.id)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: theme.danger }}><Text style={{ color: '#FFFFFF', fontFamily: fonts.sansBold, fontSize: 11 }}>{t('common.delete')}</Text></Pressable>
      </View> : null}
    </View>)}</View>}
  </Screen>;
}
