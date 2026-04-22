import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import type { PotholeCapture } from './capture.types';

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.85,
  allowsEditing: false,
};

async function buildCaptureFromAssetUri(localUri: string, notes?: string): Promise<PotholeCapture> {
  let latitude: number | undefined;
  let longitude: number | undefined;

  const locPermission = await Location.requestForegroundPermissionsAsync();
  if (locPermission.granted) {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // GPS optional; still return image capture
    }
  }

  return {
    localUri,
    createdAt: new Date().toISOString(),
    latitude,
    longitude,
    notes,
  };
}

export async function requestCameraPermission() {
  const cam = await ImagePicker.requestCameraPermissionsAsync();
  return cam.granted;
}

export async function requestMediaLibraryPermission() {
  const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return lib.granted;
}

export async function capturePotholePhoto(input: { notes?: string } = {}): Promise<PotholeCapture> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Camera permission is required to take a photo. Enable it in system settings.');
  }

  const photo = await ImagePicker.launchCameraAsync(imagePickerOptions);

  if (photo.canceled || !photo.assets?.[0]?.uri) {
    throw new Error('Camera was canceled.');
  }

  return buildCaptureFromAssetUri(photo.assets[0].uri, input.notes);
}

export async function pickPotholePhotoFromLibrary(input: { notes?: string } = {}): Promise<PotholeCapture> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library access is required. Enable it in system settings.');
  }

  const photo = await ImagePicker.launchImageLibraryAsync({
    ...imagePickerOptions,
    allowsMultipleSelection: false,
  });

  if (photo.canceled || !photo.assets?.[0]?.uri) {
    throw new Error('No image was selected.');
  }

  return buildCaptureFromAssetUri(photo.assets[0].uri, input.notes);
}
