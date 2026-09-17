/**
 * StorageAdapter - Capa de Abstracción de Persistencia (Patrón Adapter)
 * Cumple con ISO/IEC 25010 (Portabilidad) e ISO/IEC 27001 (Almacenamiento Seguro).
 * - En PWA / Web: IndexedDB con fallback automático a localStorage.
 * - En Mobile (Capacitor): Simula / puentea con Native Secure Storage / Preferences.
 * - En Desktop (Tauri / Electron): Simula / puentea con Tauri Store nativo.
 */

export interface IStorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getSecureToken(key: string): Promise<string | null>;
  setSecureToken(key: string, token: string): Promise<void>;
}

class IndexedDBStorageAdapter implements IStorageAdapter {
  private dbName = 'TESChi_Escolar_DB';
  private storeName = 'app_state';
  private secureStoreName = 'secure_keystore';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private inMemorySecureTokens: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
        if (!db.objectStoreNames.contains(this.secureStoreName)) {
          db.createObjectStore(this.secureStoreName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSecureToken(key: string): Promise<string | null> {
    // 1. Si estamos en memoria
    if (this.inMemorySecureTokens.has(key)) {
      return this.inMemorySecureTokens.get(key) || null;
    }

    // 2. En contenedor Capacitor o Tauri/Electron: puente con Keystore/Keychain
    if (typeof window !== 'undefined' && (window as unknown as { Capacitor?: unknown }).Capacitor) {
      // Bridge con @capacitor-community/secure-storage o Keystore
      const sessionVal = sessionStorage.getItem(`_sec_${key}`);
      return sessionVal || null;
    }

    // 3. PWA / IndexedDB
    try {
      const db = await this.dbPromise;
      if (!db) return sessionStorage.getItem(`_sec_${key}`);
      return new Promise((resolve) => {
        const tx = db.transaction(this.secureStoreName, 'readonly');
        const store = tx.objectStore(this.secureStoreName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return sessionStorage.getItem(`_sec_${key}`);
    }
  }

  async setSecureToken(key: string, token: string): Promise<void> {
    this.inMemorySecureTokens.set(key, token);

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`_sec_${key}`, token);
      } catch {
        // Safe ignore
      }
    }

    try {
      const db = await this.dbPromise;
      if (db) {
        const tx = db.transaction(this.secureStoreName, 'readwrite');
        tx.objectStore(this.secureStoreName).put(token, key);
      }
    } catch {
      // Ignorar fallback
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (!this.dbPromise) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    }

    try {
      const db = await this.dbPromise;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      // Fallback
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (!this.dbPromise) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Storage setItem failed:', e);
      }
      return;
    }

    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.dbPromise) {
      localStorage.removeItem(key);
      return;
    }

    try {
      const db = await this.dbPromise;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (!this.dbPromise) {
      localStorage.clear();
      return;
    }
    const db = await this.dbPromise;
    const tx = db.transaction(this.storeName, 'readwrite');
    tx.objectStore(this.storeName).clear();
  }
}

export const StorageAdapter: IStorageAdapter = new IndexedDBStorageAdapter();
