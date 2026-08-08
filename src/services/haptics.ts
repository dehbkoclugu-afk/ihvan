import * as Haptics from 'expo-haptics';

export function selectionFeedback() {
  void Haptics.selectionAsync().catch(() => {});
}

export function successFeedback() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
