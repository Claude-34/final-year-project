import { useQuery } from '@tanstack/react-query';

import { detectPotholeFromImage } from '@/features/detection/detection.service';

export function useDetection(input: { imageUri?: string; latitude?: number; longitude?: number; notes?: string }) {
  const enabled = Boolean(input.imageUri);

  return useQuery({
    enabled,
    queryKey: ['detection', input.imageUri, input.latitude, input.longitude, input.notes],
    queryFn: async () =>
      detectPotholeFromImage(input.imageUri!, {
        latitude: input.latitude,
        longitude: input.longitude,
      }),
  });
}
