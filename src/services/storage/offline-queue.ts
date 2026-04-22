import { appConfig } from '@/config/app.config';
import { apiFetch } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { getJson, setJson } from '@/services/storage/async-storage';
import { useAuthStore } from '@/store/auth.store';

type OfflineOp =
  | {
      id: string;
      type: 'CREATE_REPORT';
      payload: unknown;
      createdAt: string;
    }
  | {
      id: string;
      type: 'UPLOAD_IMAGE';
      payload: unknown;
      createdAt: string;
    };

const QUEUE_KEY = 'offline_queue_v1';

async function readQueue(): Promise<OfflineOp[]> {
  return (await getJson<OfflineOp[]>(QUEUE_KEY)) ?? [];
}

async function writeQueue(queue: OfflineOp[]) {
  await setJson(QUEUE_KEY, queue);
}

export async function enqueueOfflineOp(op: Omit<OfflineOp, 'id' | 'createdAt'>) {
  const queue = await readQueue();
  const next: OfflineOp = {
    ...op,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  queue.push(next);
  await writeQueue(queue);
}

export async function flushOfflineQueue() {
  const queue = await readQueue();
  if (queue.length === 0) return;
  if (!appConfig.apiBaseUrl || !useAuthStore.getState().token) return;

  const remaining: OfflineOp[] = [];
  for (const op of queue) {
    if (op.type === 'CREATE_REPORT') {
      try {
        await apiFetch(endpoints.reports, { method: 'POST', body: op.payload });
      } catch {
        remaining.push(op);
      }
    } else {
      remaining.push(op);
    }
  }
  await writeQueue(remaining);
}
