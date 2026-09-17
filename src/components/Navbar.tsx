import React from 'react';
import { ArrowLeft, User, ShieldCheck, Calendar } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { TeschiLogo } from './TeschiLogo';
import { PlatformTarget } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  platformMode?: PlatformTarget;
  onTogglePlatform?: (mode: PlatformTarget) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
}) => {
  const isDashboard = currentView === 'dashboard';

  // Título según la vista activa
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Panel Principal';
      case 'reinscripcion_grupo':
        return 'Reinscripción Grupo';
      case 'reinscripcion_carga':
        return 'Reinscripción Carga';
      case 'comprobante_reinscripcion':
        return 'Comprobante Reinscripción';
      case 'kardex':
        return 'Kardex';
      case 'seguridad':
        return 'Seguridad';
      case 'comprobante_intersemestral':
        return 'Comprobante Intersemestral';
      case 'calendario_escolar':
        return 'Calendario Escolar 2026-2027';
      default:
        return 'Servicios Escolares';
    }
  };

  if (isDashboard) {
    return (
      <header className="bg-[#012d1d] text-white pt-safe px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Oficial TESChi en contenedor blanco redondeado */}
            <div className="h-9 px-2.5 bg-white rounded-xl flex items-center justify-center shadow-xs shrink-0 border border-emerald-900/20">
              <TeschiLogo variant="symbol" size="sm" className="h-6 w-auto" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Panel Principal</h1>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />

            {/* Acceso Rápido a Calendario Escolar */}
            <button
              id="btn-nav-calendar"
              onClick={() => onNavigate('calendario_escolar')}
              className="w-9 h-9 rounded-full bg-[#173c2a] text-[#aeeecb] hover:bg-[#20523a] flex items-center justify-center transition shadow-xs border border-[#86af99]/30"
              aria-label="Calendario Escolar 2026-2027"
              title="Calendario Escolar 2026-2027"
            >
              <Calendar className="w-5 h-5" />
            </button>

            {/* Botón de Perfil en círculo verde menta */}
            <button
              id="btn-nav-profile"
              onClick={() => onNavigate('seguridad')}
              className="w-9 h-9 rounded-full bg-[#aeeecb] text-[#002114] flex items-center justify-center hover:bg-[#85d7ad] transition shadow-xs"
              aria-label="Perfil y Seguridad"
              title="Perfil y Configuración de Seguridad"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Navbar para vistas internas con flecha atrás y título negro como en Imágenes 11, 13, 15, 19, 21, 23
  return (
    <header className="bg-white border-b border-gray-200 text-[#191c1d] pt-safe px-4 py-3 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="btn-nav-back"
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 -ml-1.5 rounded-lg text-[#012d1d] hover:bg-gray-100 transition focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
            aria-label="Regresar al Panel Principal"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h2 className="text-xl font-bold tracking-tight text-[#191c1d]">{getTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />
          {currentView !== 'calendario_escolar' && (
            <button
              onClick={() => onNavigate('calendario_escolar')}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              title="Calendario Escolar 2026-2027"
            >
              <Calendar className="w-5 h-5 text-[#1b4332]" />
            </button>
          )}
          {currentView !== 'seguridad' && (
            <button
              onClick={() => onNavigate('seguridad')}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              title="Seguridad de la cuenta"
            >
              <ShieldCheck className="w-5 h-5 text-[#1b4332]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
