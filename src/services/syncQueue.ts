import { QueuedSyncItem } from '../types';
import { StorageAdapter } from './storageAdapter';

/**
 * SyncQueue - Cola de Sincronización en Segundo Plano (Background Sync)
 * Cumple con PWA Offline First e ISO/IEC 25010 (Tolerancia a Fallos y Fiabilidad).
 */

type SyncListener = (items: QueuedSyncItem[]) => void;

class BackgroundSyncQueue {
  private STORAGE_KEY = 'teschi_offline_sync_queue';
  private listeners: Set<SyncListener> = new Set();
  private isProcessing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.getQueue().then(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(items: QueuedSyncItem[]) {
    this.listeners.forEach((fn) => fn(items));
  }

  public async getQueue(): Promise<QueuedSyncItem[]> {
    const data = await StorageAdapter.getItem<QueuedSyncItem[]>(this.STORAGE_KEY);
    return data || [];
  }

  public async enqueue(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    payload: Record<string, unknown>
  ): Promise<QueuedSyncItem> {
    const queue = await this.getQueue();
    const newItem: QueuedSyncItem = {
      id: 'QUEUE_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      endpoint,
      method,
      payload,
      retryCount: 0,
      synced: false,
    };
    queue.push(newItem);
    await StorageAdapter.setItem(this.STORAGE_KEY, queue);
    this.notify(queue);

    // Si hay conexión, intentar procesar de inmediato
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.processQueue();
    }

    return newItem;
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        this.isProcessing = false;
        return;
      }

      const remaining: QueuedSyncItem[] = [];
      for (const item of queue) {
        try {
          const res = await fetch(item.endpoint, {
            method: item.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });

          if (!res.ok) {
            item.retryCount += 1;
            if (item.retryCount < 4) remaining.push(item);
          }
        } catch {
          // Falla de red aún persistente
          item.retryCount += 1;
          remaining.push(item);
        }
      }

      await StorageAdapter.setItem(this.STORAGE_KEY, remaining);
      this.notify(remaining);
    } finally {
      this.isProcessing = false;
    }
  }

  public async clearQueue(): Promise<void> {
    await StorageAdapter.removeItem(this.STORAGE_KEY);
    this.notify([]);
  }
}

export const syncQueue = new BackgroundSyncQueue();
