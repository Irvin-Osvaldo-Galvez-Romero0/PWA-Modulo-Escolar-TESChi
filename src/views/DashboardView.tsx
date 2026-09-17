import React from 'react';
import { motion } from 'motion/react';
import {
  FileEdit,
  FolderArchive,
  GraduationCap,
  ShieldCheck,
  Calendar,
  LogOut,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface DashboardViewProps {
  student: StudentProfile;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  onNavigate,
  onLogout,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-12 overflow-hidden">
      {/* Contenedor Principal */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Encabezado del Estudiante - Solo Texto */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Bienvenido,
            </p>
            <h2 className="text-2xl font-extrabold text-[#1b4332] leading-tight">
              {student.nombreCorto || student.nombre}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-sm bg-[#edeeef] text-[#414844] text-[11px] font-semibold tracking-wide uppercase">
                {student.carrera}
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-sm bg-[#aeeecb]/40 text-[#002114] text-[11px] font-semibold">
                Matrícula: {student.matricula}
              </span>
            </div>
          </div>

          {/* Botón de Cierre de Sesión Seguro */}
          <button
            id="btn-dashboard-logout"
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-[#edeeef] text-[#414844] hover:bg-[#e1e3e4] hover:text-[#ba1a1a] flex items-center justify-center transition shadow-xs"
            title="Cerrar Sesión Segura"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Banner de Periodo Actual con acceso interactivo al Calendario Escolar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          onClick={() => onNavigate('calendario_escolar')}
          className="rounded-2xl bg-[#173c2a] text-white p-5 flex items-center justify-between shadow-md border border-emerald-900/30 cursor-pointer hover:bg-[#153726] hover:shadow-lg transition group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onNavigate('calendario_escolar');
            }
          }}
          title="Ver Calendario Escolar 2026-2027 Oficial"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[11px] font-bold text-[#86af99] tracking-wider uppercase">
                PERIODO ACTUAL
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#aeeecb]/20 text-[#aeeecb] font-bold">
                Activo
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {student.periodoActual}
            </h3>
            <p className="text-xs text-[#86af99] flex items-center gap-1 mt-1 group-hover:text-[#aeeecb] transition">
              <span>Toca el icono o el banner para ver el Calendario Escolar 2026-2027</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          <button
            id="btn-dashboard-calendar"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('calendario_escolar');
            }}
            className="w-12 h-12 rounded-full bg-[#0d261a] group-hover:bg-[#aeeecb] group-hover:text-[#002114] text-white flex items-center justify-center shrink-0 shadow-inner transition duration-200"
            title="Abrir Calendario Escolar Oficial"
            aria-label="Abrir Calendario Escolar Oficial"
          >
            <Calendar className="w-6 h-6 stroke-[1.8]" />
          </button>
        </motion.div>

        {/* Sección Trámites y Servicios */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#191c1d] tracking-tight">
            Trámites y Servicios
          </h3>

          {/* Cuadrícula de 4 Tarjetas 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tarjeta 1: Solicitud de Reinscripción */}
            <motion.button
              id="card-tramite-reinscripcion"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('reinscripcion_grupo')}
              className="text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between min-h-[150px] group focus:outline-hidden focus:ring-2 focus:ring-[#1b4332]"
            >
              <div className="w-11 h-11 rounded-xl bg-[#aeeecb]/40 text-[#1b4332] flex items-center justify-center mb-3">
                <FileEdit className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#191c1d] text-base mb-2 group-hover:text-[#1b4332] transition">
                  Solicitud de Reinscripción
                </h4>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#aeeecb]/40 text-[#002114] text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] animate-pulse"></span>
                  <span>Abierto</span>
                </div>
              </div>
            </motion.button>

            {/* Tarjeta 2: Historial Académico / Kardex */}
            <motion.button
              id="card-tramite-kardex"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('kardex')}
              className="text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between min-h-[150px] group focus:outline-hidden focus:ring-2 focus:ring-[#1b4332]"
            >
              <div className="w-11 h-11 rounded-xl bg-[#edeeef] text-[#414844] flex items-center justify-center mb-3">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#191c1d] text-base mb-2 group-hover:text-[#1b4332] transition">
                  Historial Académico / Kardex
                </h4>
                <p className="text-xs font-semibold text-[#1b4332] flex items-center gap-1">
                  <span>Ver calificaciones</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </motion.button>

            {/* Tarjeta 3: Cursos Intersemestrales */}
            <motion.button
              id="card-tramite-intersemestrales"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('comprobante_intersemestral')}
              className="text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between min-h-[150px] group focus:outline-hidden focus:ring-2 focus:ring-[#1b4332]"
            >
              <div className="w-11 h-11 rounded-xl bg-[#edeeef] text-[#414844] flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#191c1d] text-base mb-2 group-hover:text-[#1b4332] transition">
                  Cursos Intersemestrales
                </h4>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#edeeef] text-[#414844] text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>Próximamente</span>
                </div>
              </div>
            </motion.button>

            {/* Tarjeta 4: Seguridad de la Cuenta */}
            <motion.button
              id="card-tramite-seguridad"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('seguridad')}
              className="text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between min-h-[150px] group focus:outline-hidden focus:ring-2 focus:ring-[#1b4332]"
            >
              <div className="w-11 h-11 rounded-xl bg-[#edeeef] text-[#414844] flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#191c1d] text-base mb-2 group-hover:text-[#1b4332] transition">
                  Seguridad de la Cuenta
                </h4>
                <p className="text-xs font-semibold text-[#1b4332] flex items-center gap-1">
                  <span>Configurar</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Marca de agua institucional institucional estilo templo clásico en el fondo como en Image 9 */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 opacity-[0.04] select-none">
        <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
          {/* Templo / Columnas Clásicas */}
          <polygon points="50,15 15,35 85,35" />
          <rect x="20" y="38" width="60" height="6" />
          <rect x="24" y="46" width="8" height="36" />
          <rect x="38" y="46" width="8" height="36" />
          <rect x="54" y="46" width="8" height="36" />
          <rect x="68" y="46" width="8" height="36" />
          <rect x="16" y="84" width="68" height="8" />
        </svg>
      </div>
    </div>
  );
};
