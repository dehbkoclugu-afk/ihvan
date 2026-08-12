import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';
import { buildUserDataExport, serializeUserDataExport, userDataExportFileName } from '@/lib/userData';
import { translate } from '@/i18n';

type UserDataSnapshot = ReturnType<typeof buildUserDataExport>;

export async function shareUserDataExport(snapshot: UserDataSnapshot): Promise<'file' | 'text'> {
  const json = serializeUserDataExport(snapshot);
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync())) {
    await Share.share({ title: translate('data.export'), message: json });
    return 'text';
  }

  const fileUri = `${FileSystem.cacheDirectory}${userDataExportFileName(new Date(snapshot.exportedAt))}`;
  try {
    await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri, {
      dialogTitle: translate('data.export'),
      mimeType: 'application/json',
      UTI: 'public.json',
    });
    return 'file';
  } finally {
    await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
  }
}
