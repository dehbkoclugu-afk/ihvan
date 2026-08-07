import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then((result) => {
      setPermission(result.status);
      if (result.status === Location.PermissionStatus.GRANTED) void loadLocation();
    });
  }, [loadLocation]);

  const requestLocation = useCallback(async () => {
    setError(null);
    const result = await Location.requestForegroundPermissionsAsync();
    setPermission(result.status);
    if (result.status !== Location.PermissionStatus.GRANTED) {
      setError('Namaz vakitleri ve kıble için konum izni gerekli.');
      return;
    }
    await loadLocation();
  }, [loadLocation]);

  return { location, permission, loading, error, requestLocation, refresh: loadLocation };
}
