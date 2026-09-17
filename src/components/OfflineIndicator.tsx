import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { syncQueue } from '../services/syncQueue';
import { QueuedSyncItem } from '../types';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingItems, setPendingItems] = useState<QueuedSyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncedSuccess, setShowSyncedSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncedSuccess(true);
      setTimeout(() => setShowSyncedSuccess(false), 4000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = syncQueue.subscribe((queue) => {
      setPendingItems(queue);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncQueue.processQueue();
    setIsSyncing(false);
  };

  if (isOnline && pendingItems.length === 0 && !showSyncedSuccess) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 z-40 flex flex-col gap-2 max-w-xs text-xs">
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-xl bg-[#ba1a1a] text-white px-3.5 py-2 shadow-lg border border-red-400/30 backdrop-blur-md">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold">Modo Sin Conexión Activo</p>
            <p className="text-[11px] opacity-90">Los cambios se guardan localmente en tu dispositivo.</p>
          </div>
        </div>
      )}

      {pendingItems.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-[#012d1d] text-white px-3.5 py-2 shadow-lg border border-[#aeeecb]/20">
          <div>
            <p className="font-semibold text-[#aeeecb]">{pendingItems.length} trámite(s) en cola</p>
            <p className="text-[11px] text-gray-300">Sincronización en segundo plano pendiente</p>
          </div>
          {isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1 rounded-md bg-[#1b4332] px-2 py-1 text-[11px] hover:bg-[#2c694e] transition"
              title="Sincronizar ahora con el servidor"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Enviando...' : 'Sincronizar'}</span>
            </button>
          )}
        </div>
      )}

      {showSyncedSuccess && isOnline && pendingItems.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-[#1b4332] text-white px-3 py-1.5 shadow-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#aeeecb]" />
          <span>Sincronización institucional completada.</span>
        </div>
      )}
    </div>
  );
};
