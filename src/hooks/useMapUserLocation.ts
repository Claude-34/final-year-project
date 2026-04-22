import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

export type MapUserCoords = { latitude: number; longitude: number };

/**
 * High-accuracy fix on load, optional continuous updates while driving (navigation-style).
 */
export function useMapUserLocation(followWhileDriving: boolean) {
  const [coords, setCoords] = useState<MapUserCoords | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speedMps, setSpeedMps] = useState<number | null>(null);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const applyReading = useCallback((pos: Location.LocationObject) => {
    setCoords({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    const h = pos.coords.heading;
    if (h != null && h >= 0 && h <= 360) {
      setHeading(h);
    }
    const sp = pos.coords.speed;
    setSpeedMps(sp != null && sp >= 0 ? sp : null);
    const acc = pos.coords.accuracy;
    setAccuracyM(acc != null && acc >= 0 ? acc : null);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError('Location permission not granted');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      applyReading(pos);
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to read location';
      setError(message);
      return null;
    }
  }, [applyReading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!followWhileDriving) {
      subRef.current?.remove();
      subRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted || cancelled) return;

      subRef.current?.remove();
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1500,
          distanceInterval: 8,
        },
        (p) => applyReading(p),
      );
      if (cancelled) {
        sub.remove();
        return;
      }
      subRef.current = sub;
    })();

    return () => {
      cancelled = true;
      subRef.current?.remove();
      subRef.current = null;
    };
  }, [followWhileDriving, applyReading]);

  return { coords, error, heading, speedMps, accuracyM, refresh };
}
