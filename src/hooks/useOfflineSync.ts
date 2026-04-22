import { useEffect } from 'react';

import { subscribeToConnectivity } from '@/services/network/connectivity.service';
import { flushOfflineQueue } from '@/services/storage/offline-queue';

/**
 * MVP stub: listens for connectivity changes and attempts to flush queued items.
 */
export function useOfflineSync() {
  useEffect(() => {
    const unsub = subscribeToConnectivity((state) => {
      if (state.isConnected) {
        void flushOfflineQueue();
      }
    });
    return unsub;
  }, []);
}
