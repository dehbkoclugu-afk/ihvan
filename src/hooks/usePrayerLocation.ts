import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { AppState, Linking } from 'react-native';

export interface PrayerLocation {
  latitude: number;
  longitude: number;
  label: string;
}

function addressLabel(address?: Location.LocationGeocodedAddress): string {
  if (!address) return 'Mevcut konum';
  const city = address.city ?? address.district ?? address.subregion ?? address.region;
  return [city, address.country].filter(Boolean).join(', ') || 'Mevcut konum';
}

export function usePrayerLocation() {
  const [location, setLocation] = useState<PrayerLocation | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const permissionRequestInFlight = useRef(false);

  const loadLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      let addresses: Location.LocationGeocodedAddress[] = [];
      try {
        addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      } catch {
        // Prayer calculation only requires coordinates; geocoding is cosmetic.
      }
      setLocation({ latitude, longitude, label: addressLabel(addresses[0]) });
    } catch {
      setError('Konum alınamadı. Konum servisinin açık olduğundan emin ol.');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncPermission = useCallback(async () => {
    try {
      const result = await Location.getForegroundPermissionsAsync();
      setPermission(result.status);
      setCanAskAgain(result.canAskAgain);
      if (result.status === Location.PermissionStatus.GRANTED) {
        await loadLocation();
      } else {
        // Never keep using coordinates after the OS permission is revoked.
        setLocation(null);
      }
    } catch {
      setLocation(null);
      setPermission(null);
      setError('Konum izni durumu okunamadı. Biraz sonra tekrar deneyebilirsin.');
    }
  }, [loadLocation]);

  useEffect(() => {
    void syncPermission();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncPermission();
    });
    return () => subscription.remove();
  }, [syncPermission]);

  const openLocationSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      setError('Sistem ayarları açılamadı. İhvan için konum iznini cihaz ayarlarından açabilirsin.');
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (permissionRequestInFlight.current) return;
    permissionRequestInFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await Location.requestForegroundPermissionsAsync();
      setPermission(result.status);
      setCanAskAgain(result.canAskAgain);
      if (result.status !== Location.PermissionStatus.GRANTED) {
        setLocation(null);
        setError(result.canAskAgain ? 'Namaz vakitleri ve kıble için konum izni gerekli.' : 'Konum izni kapalı. İzni cihaz ayarlarından açabilirsin.');
        return;
      }
      await loadLocation();
    } catch {
      setLocation(null);
      setError('Konum izni istenemedi. Biraz sonra tekrar deneyebilirsin.');
    } finally {
      permissionRequestInFlight.current = false;
      setLoading(false);
    }
  }, [loadLocation]);

  return { location, permission, canAskAgain, loading, error, requestLocation, openLocationSettings, refresh: loadLocation };
}
