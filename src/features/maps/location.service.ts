import * as Location from 'expo-location';

export async function reverseGeocode(latitude: number, longitude: number) {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const first = results[0];
    if (!first) return undefined;
    const parts = [first.name, first.street, first.city, first.region, first.postalCode].filter(Boolean);
    return parts.join(', ');
  } catch {
    return undefined;
  }
}
