import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { AppState, Linking } from 'react-native';
import { useT } from '@/i18n';
import { isValidPrayerCoordinates } from '@/services/prayerTimes';

export interface PrayerLocation {
  latitude: number;
  longitude: number;
  label: string;
}

function addressLabel(address: Location.LocationGeocodedAddress | undefined, fallback: string): string {
  if (!address) return fallback;
  const city = address.city ?? address.district ?? address.subregion ?? address.region;
  return [city, address.country].filter(Boolean).join(', ') || fallback;
}

export function usePrayerLocation() {
  const { t } = useT();
  const [location, setLocation] = useState<PrayerLocation | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const permissionRequestInFlight = useRef(false);
  const mounted = useRef(true);
  const permissionOperation = useRef(0);
  const locationOperation = useRef(0);

  const loadLocation = useCallback(async () => {
    const operation = ++locationOperation.current;
    if (mounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      if (!mounted.current || operation !== locationOperation.current) return;
      if (!isValidPrayerCoordinates(latitude, longitude)) {
        setLocation(null);
        setError(t('location.invalidCoordinates'));
        return;
      }
      let addresses: Location.LocationGeocodedAddress[] = [];
      try {
        addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      } catch {
        // Prayer calculation only requires coordinates; geocoding is cosmetic.
      }
      if (!mounted.current || operation !== locationOperation.current) return;
      setLocation({ latitude, longitude, label: addressLabel(addresses[0], t('location.current')) });
    } catch {
      if (mounted.current && operation === locationOperation.current) {
        setError(t('location.unavailable'));
      }
    } finally {
      if (mounted.current && operation === locationOperation.current) setLoading(false);
    }
  }, [t]);

  const syncPermission = useCallback(async () => {
    const operation = ++permissionOperation.current;
    try {
      const result = await Location.getForegroundPermissionsAsync();
      if (!mounted.current || operation !== permissionOperation.current) return;
      setPermission(result.status);
      setCanAskAgain(result.canAskAgain);
      if (result.status === Location.PermissionStatus.GRANTED) {
        await loadLocation();
      } else {
        // Never keep using coordinates after the OS permission is revoked.
        locationOperation.current += 1;
        setLocation(null);
      }
    } catch {
      if (!mounted.current || operation !== permissionOperation.current) return;
      locationOperation.current += 1;
      setLocation(null);
      setPermission(null);
      setError(t('location.permissionReadFailed'));
    }
  }, [loadLocation, t]);

  useEffect(() => {
    mounted.current = true;
    void syncPermission();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncPermission();
    });
    return () => {
      mounted.current = false;
      permissionOperation.current += 1;
      locationOperation.current += 1;
      subscription.remove();
    };
  }, [syncPermission]);

  const openLocationSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      setError(t('location.settingsFailed'));
    }
  }, [t]);

  const requestLocation = useCallback(async () => {
    if (permissionRequestInFlight.current) return;
    permissionRequestInFlight.current = true;
    const operation = ++permissionOperation.current;
    if (mounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current || operation !== permissionOperation.current) return;
      setPermission(result.status);
      setCanAskAgain(result.canAskAgain);
      if (result.status !== Location.PermissionStatus.GRANTED) {
        locationOperation.current += 1;
        setLocation(null);
        setError(t(result.canAskAgain ? 'location.permissionRequired' : 'location.permissionDenied'));
        return;
      }
      await loadLocation();
    } catch {
      if (!mounted.current || operation !== permissionOperation.current) return;
      locationOperation.current += 1;
      setLocation(null);
      setError(t('location.permissionRequestFailed'));
    } finally {
      permissionRequestInFlight.current = false;
      if (mounted.current && operation === permissionOperation.current) setLoading(false);
    }
  }, [loadLocation, t]);

  return { location, permission, canAskAgain, loading, error, requestLocation, openLocationSettings, refresh: loadLocation };
}
