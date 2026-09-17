import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Si ya está instalado y ejecutándose en modo standalone, ocultamos
  if (isInstalled) {
    return null;
  }

  // Flujo Chromium / Android / Desktop (PWA Installable)
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-[#aeeecb] text-[#002114] px-3 py-1.5 text-xs font-semibold hover:bg-[#85d7ad] transition shadow-xs focus:ring-2 focus:ring-[#aeeecb] focus:outline-hidden"
        title="Instalar como aplicación nativa institucional"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar Aplicación</span>
      </button>
    );
  }

  // Flujo iOS Safari (Guía interactiva amigable)
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[#3f6653] text-[#ffffff] px-2.5 py-1.5 text-xs font-medium hover:bg-[#1b4332] transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl text-[#191c1d]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-[#012d1d]">Instalar en iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-500 hover:text-gray-800 p-1 rounded-md"
                  aria-label="Cerrar guía"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-[#414844] space-y-2 mb-4 leading-relaxed">
                1. Toca el botón <strong>Compartir</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600" /> en la barra inferior de Safari.<br />
                2. Desplázate hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong>.<br />
                3. Disfruta de la aplicación con acceso instantáneo sin conexión a internet.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-[#012d1d] text-white py-2 text-sm font-medium hover:bg-[#1b4332] transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
