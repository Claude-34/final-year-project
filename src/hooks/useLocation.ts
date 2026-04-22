import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export function useLocation() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError('Location permission not granted');
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCoords(next);
      return next;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to read location';
      setError(message);
      return null;
    }
  }, []);

  return { coords, error, refresh };
}
