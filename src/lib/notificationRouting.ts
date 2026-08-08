export type NotificationRoute = '/(tabs)/worship';

export function routeForNotificationData(data: unknown): NotificationRoute | null {
  if (!data || typeof data !== 'object') return null;
  return 'kind' in data && data.kind === 'prayer-time' ? '/(tabs)/worship' : null;
}
