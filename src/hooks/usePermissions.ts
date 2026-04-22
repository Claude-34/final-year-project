import { useCallback, useState } from 'react';

import { requestCameraPermission } from '@/features/capture/camera.service';

export function usePermissions() {
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);

  const requestCamera = useCallback(async () => {
    const granted = await requestCameraPermission();
    setCameraGranted(granted);
    return granted;
  }, []);

  return { cameraGranted, requestCamera };
}
