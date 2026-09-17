import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowLeft,
  Grid,
  Maximize2,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  X,
  Eye,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { TeschiLogo } from '../components/TeschiLogo';
import {
  CALENDAR_MONTHS,
  CALENDAR_LEGEND,
  CalendarEventType,
  MonthData,
  DayData,
} from '../data/calendarioEscolarData';

interface CalendarioEscolarViewProps {
  onBack?: () => void;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const WEEKDAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/**
 * Componentes Vectoriales de Alta Visibilidad para la Simbología Oficial del TESCHI
 */
export const GlyphInicioSemestre: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`drop-shadow-xs ${className}`}
  >
    <title>Inicio de semestre</title>
    <polygon
      points="12,3 22,21 2,21"
      fill="#bae6fd"
      stroke="#0284c7"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const GlyphFinSemestre: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`drop-shadow-xs ${className}`}
  >
    <title>Fin de semestre</title>
    <polygon
      points="2,3 22,3 12,21"
      fill="#bae6fd"
      stroke="#0284c7"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const GlyphInicioCurso: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`drop-shadow-xs ${className}`}
  >
    <title>Inicio de curso</title>
    {/* Flecha morada gruesa apuntando a la derecha como en el cartel oficial */}
    <path
      d="M3 8.5H12.5V4.5L21.5 12L12.5 19.5V15.5H3V8.5Z"
      fill="#e9d5ff"
      stroke="#7e22ce"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const GlyphFinCurso: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`drop-shadow-xs ${className}`}
  >
    <title>Fin de curso</title>
    {/* Flecha morada gruesa apuntando a la izquierda como en el cartel oficial */}
    <path
      d="M21 8.5H11.5V4.5L2.5 12L11.5 19.5V15.5H21V8.5Z"
      fill="#e9d5ff"
      stroke="#7e22ce"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const CalendarioEscolarView: React.FC<CalendarioEscolarViewProps> = ({ onBack }) => {
  // Detección dinámica de la fecha actual del usuario (Hoy)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0 = Enero, 8 = Septiembre
  const currentDay = today.getDate();
  const currentMonthId = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const todayMonthIndex = CALENDAR_MONTHS.findIndex((m) => m.id === currentMonthId);
  const todayMonth = todayMonthIndex !== -1 ? CALENDAR_MONTHS[todayMonthIndex] : CALENDAR_MONTHS[8];
  const todayDayOfWeekIdx = (todayMonth.startDayOfWeek + currentDay - 1) % 7;
  const todayWeekdayName = WEEKDAYS_FULL[todayDayOfWeekIdx] || 'Domingo';

  const isToday = (month: MonthData, dayNum: number) => {
    return month.id === currentMonthId && dayNum === currentDay;
  };

  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    todayMonthIndex !== -1 ? todayMonthIndex : 8
  ); // Por defecto el mes actual (Septiembre 2026)
  const [monthSlideDirection, setMonthSlideDirection] = useState<number>(1);
  const [selectedFilter, setSelectedFilter] = useState<CalendarEventType | 'all'>('all');

  const activeMonth = CALENDAR_MONTHS[selectedMonthIndex] || CALENDAR_MONTHS[8];

  const handlePrevMonth = () => {
    setMonthSlideDirection(-1);
    setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : CALENDAR_MONTHS.length - 1));
  };

  const handleNextMonth = () => {
    setMonthSlideDirection(1);
    setSelectedMonthIndex((prev) => (prev < CALENDAR_MONTHS.length - 1 ? prev + 1 : 0));
  };

  const handleGoToToday = () => {
    if (todayMonthIndex !== -1) {
      setSelectedMonthIndex(todayMonthIndex);
    } else {
      setSelectedMonthIndex(8);
    }
    setViewMode('monthly');
  };

  // Determina las clases visuales de fondo y bordes según eventos de la celda y si es hoy
  const getCellClasses = (dayData?: DayData, isFilteredMatch = true, isTodayCell = false) => {
    if (isTodayCell && (!dayData || dayData.events.length === 0)) {
      return 'bg-sky-50 text-[#0284c7] font-black border-[#0284c7]/60 hover:bg-sky-100 shadow-sm';
    }

    if (!dayData || dayData.events.length === 0) {
      return 'bg-white text-gray-800 hover:bg-emerald-50/70 border-gray-100';
    }

    const { events } = dayData;
    const classes: string[] = [];

    // Backgrounds prioritarios de alta visibilidad
    if (events.includes('dia_no_laborable')) {
      classes.push('bg-[#18181b] text-white font-extrabold shadow-inner');
    } else if (events.includes('vacaciones')) {
      classes.push('bg-[#facc15] text-stone-950 font-black');
    } else if (events.includes('aniversario_teschi')) {
      classes.push('bg-white text-[#0284c7] font-black border-[3.5px] border-[#0284c7] shadow-sm');
    } else if (events.includes('segunda_oportunidad')) {
      classes.push('bg-[#fb923c] text-stone-950 font-black');
    } else if (events.includes('seguimiento')) {
      classes.push('bg-[#f472b6] text-stone-950 font-black');
    } else if (events.includes('preseleccion')) {
      classes.push('bg-[#c084fc] text-stone-950 font-black');
    } else if (events.includes('receso_escolar')) {
      classes.push('bg-[#38bdf8] text-stone-950 font-black');
    } else {
      classes.push('bg-white text-gray-900 font-bold');
    }

    // Primera oportunidad: borde exterior verde olivo / lima bien destacado
    if (events.includes('primera_oportunidad')) {
      classes.push('ring-[3px] ring-[#65a30d] ring-inset');
    }

    if (!isFilteredMatch) {
      classes.push('opacity-25 grayscale-[60%]');
    }

    return classes.join(' ');
  };

  // Renderiza las figuras vectoriales destacadas dentro de una celda
  const renderCellFigures = (dayData?: DayData, isLarge = false) => {
    if (!dayData) return null;
    const { events, glyph } = dayData;
    const glyphSize = isLarge ? 24 : 14;

    return (
      <>
        {/* Franja Superior Azul para Reinscripciones (4px a 6px bien visible) */}
        {events.includes('reinscripcion') && (
          <div
            className={`absolute top-0 inset-x-0 ${
              isLarge ? 'h-2' : 'h-1.5'
            } bg-[#2563eb] rounded-t-xs z-10 shadow-xs`}
            title="Reinscripción (Barra azul superior)"
          />
        )}

        {/* Franja Inferior Roja para Inscripciones (4px a 6px bien visible) */}
        {events.includes('inscripcion') && (
          <div
            className={`absolute bottom-0 inset-x-0 ${
              isLarge ? 'h-2' : 'h-1.5'
            } bg-[#dc2626] rounded-b-xs z-10 shadow-xs`}
            title="Inscripción (Barra roja inferior)"
          />
        )}

        {/* Glifos Vectoriales Notorios */}
        {glyph === '△' && (
          <div className="absolute top-1 right-1 z-10">
            <GlyphInicioSemestre size={glyphSize} />
          </div>
        )}
        {glyph === '▽' && (
          <div className="absolute top-1 right-1 z-10">
            <GlyphFinSemestre size={glyphSize} />
          </div>
        )}
        {glyph === '⇨' && (
          <div className="absolute bottom-1 right-1 z-10">
            <GlyphInicioCurso size={glyphSize} />
          </div>
        )}
        {glyph === '⇦' && (
          <div className="absolute bottom-1 left-1 z-10">
            <GlyphFinCurso size={glyphSize} />
          </div>
        )}
      </>
    );
  };

  // Renderizador de un mes individual en cuadrícula
  const renderMonthCard = (month: MonthData, index: number) => {
    const emptyCells = Array.from({ length: month.startDayOfWeek });
    const dayCells = Array.from({ length: month.totalDays }, (_, i) => i + 1);

    // Identificar si es el mes del periodo actual (Septiembre 2026 - Enero 2027)
    const isCurrentPeriodMonth =
      (month.year === 2026 && ['SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'].includes(month.name)) ||
      (month.year === 2027 && month.name === 'ENERO');

    return (
      <motion.div
        key={month.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.035, ease: 'easeOut' }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className={`bg-white rounded-xl border ${
          isCurrentPeriodMonth
            ? 'border-[#012d1d]/40 shadow-sm ring-1 ring-[#012d1d]/20'
            : 'border-gray-200 shadow-2xs'
        } overflow-hidden flex flex-col`}
      >
        {/* Cabecera del mes con colores de cartel TESCHI */}
        <div
          className={`px-3 py-2 border-b flex items-center justify-between transition-colors ${
            month.id === currentMonthId
              ? 'bg-[#0f3424] text-white border-[#0284c7]/50'
              : isCurrentPeriodMonth
              ? 'bg-[#173c2a] text-white border-[#012d1d]'
              : 'bg-[#fef9c3] text-[#713f12] border-[#fde047]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs sm:text-sm tracking-wide">
              {month.name}
            </span>
            {month.id === currentMonthId ? (
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#0284c7] text-white font-black rounded-full shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Mes de Hoy
              </span>
            ) : isCurrentPeriodMonth ? (
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-[#aeeecb] text-[#002114] font-black rounded-full shadow-2xs">
                Activo
              </span>
            ) : null}
          </div>
          <span className="text-xs font-black opacity-90">{month.year}</span>
        </div>

        {/* Encabezado de días de la semana L M M J V S D */}
        <div className="grid grid-cols-7 bg-[#fef08a]/70 border-b border-gray-200 text-center text-[10px] sm:text-xs font-black text-gray-800 py-1 select-none">
          {WEEKDAYS.map((day, idx) => (
            <div key={idx} className={idx >= 5 ? 'text-amber-900' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Cuadrícula de días */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 p-px flex-1">
          {emptyCells.map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-50/60 aspect-square min-h-[30px] sm:min-h-[34px]" />
          ))}

          {dayCells.map((dayNum) => {
            const dayData = month.days[dayNum];
            const hasEvents = !!dayData && dayData.events.length > 0;
            const isMatch =
              selectedFilter === 'all' || (dayData && dayData.events.includes(selectedFilter));
            const isTodayCell = isToday(month, dayNum);
            const isHighlightPulse = selectedFilter !== 'all' && isMatch && hasEvents;

            return (
              <motion.button
                key={`day-${dayNum}`}
                whileHover={{ scale: 1.18, zIndex: 30 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  isTodayCell
                    ? {
                        scale: [1, 1.1, 1],
                        transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
                      }
                    : isHighlightPulse
                    ? {
                        scale: [1, 1.12, 1],
                        transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
                      }
                    : {}
                }
                onClick={() => {
                  setSelectedMonthIndex(index);
                  setViewMode('monthly');
                }}
                className={`relative aspect-square min-h-[30px] sm:min-h-[34px] flex items-center justify-center p-0.5 text-[11px] sm:text-xs transition-all cursor-pointer ${
                  isTodayCell
                    ? 'z-25 ring-[2.5px] ring-[#0284c7] ring-offset-1 shadow-md bg-sky-50 font-black'
                    : isHighlightPulse
                    ? 'z-20 shadow-md ring-2 ring-emerald-600'
                    : ''
                } ${getCellClasses(dayData, isMatch, isTodayCell)}`}
                title={
                  isTodayCell
                    ? `¡HOY! ${dayNum} de ${month.name} ${month.year} (Día en el que te encuentras)`
                    : dayData?.note || `${dayNum} de ${month.name} ${month.year}`
                }
              >
                {/* Indicador de HOY en la esquina superior */}
                {isTodayCell && (
                  <span className="absolute -top-1 -right-1 z-30 flex items-center justify-center pointer-events-none">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-80"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0284c7] border border-white text-[7px] text-white font-black items-center justify-center shadow-xs">
                        ★
                      </span>
                    </span>
                  </span>
                )}

                {/* Indicadores vectoriales y franjas notorias */}
                {renderCellFigures(dayData, false)}

                {/* Número de día */}
                <span
                  className={`relative z-20 leading-none select-none ${
                    isTodayCell
                      ? 'font-black text-[#0284c7] underline decoration-2 decoration-[#0284c7]'
                      : 'font-bold'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Microetiqueta HOY */}
                {isTodayCell && (
                  <span className="absolute -bottom-1 z-25 bg-[#0284c7] text-white text-[6.5px] font-black px-1 rounded-xs tracking-tighter leading-none py-0.5 shadow-xs">
                    HOY
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Barra de Navegación Superior / Header del Calendario Escolar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-[#012d1d] hover:text-white transition shadow-2xs shrink-0"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-900/10 shrink-0">
              <TeschiLogo variant="symbol" size="sm" className="h-7 w-auto" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-[#173c2a] text-[#aeeecb] uppercase tracking-wider">
                  ESCOLARIZADO OFICIAL
                </span>
                <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Ciclo 2026-2027
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-[#191c1d] tracking-tight mt-1">
                Calendario Escolar Oficial 2026-2027
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Tecnológico de Estudios Superiores de Chimalhuacán • Periodo Activo:{' '}
                <strong className="text-[#012d1d] font-bold">Septiembre - Enero 2026-2027</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Selector de modo de vista */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('annual')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'annual'
                  ? 'bg-white text-[#012d1d] shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Vista 14 Meses</span>
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white text-[#012d1d] shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>Mes Detallado</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Banner Informativo del Día Actual (Hoy) - Marcador directo solicitado por el usuario */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
        className="rounded-2xl bg-gradient-to-r from-sky-50 via-sky-50/60 to-emerald-50 border-2 border-sky-200/90 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0284c7] text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-sky-100">
              {todayMonth.name.substring(0, 3)}
            </span>
            <span className="text-xl font-black leading-none">{currentDay}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0284c7] text-white shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Día en el que te encuentras
              </span>
              <span className="text-xs font-bold text-gray-500 hidden md:inline">
                • Ciclo Escolar Activo {todayMonth.year}
              </span>
            </div>
            <p className="text-sm sm:text-base font-black text-gray-900 mt-0.5">
              Hoy es {todayWeekdayName}, {currentDay} de {todayMonth.name} de {todayMonth.year}
            </p>
            <p className="text-xs text-gray-600 font-medium">
              Semestre Activo: Septiembre - Enero 2026-2027 • Semana 1 de actividades lectivas
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoToToday}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <MapPin className="w-4 h-4 text-sky-100" />
          <span>Localizar Día de Hoy en el Calendario</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>

      {/* Banner de Periodo Actual y Acceso Rápido */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.07 }}
        className="rounded-2xl bg-gradient-to-r from-[#012d1d] via-[#173c2a] to-[#012d1d] text-white p-4 sm:p-6 shadow-md border border-emerald-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#aeeecb]/20 text-[#aeeecb] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEMESTRE EN CURSO</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Septiembre - Enero 2026-2027
          </h2>
          <p className="text-xs sm:text-sm text-[#86af99] max-w-2xl">
            Inicio de curso: <strong className="text-white">1 de Septiembre de 2026</strong> • Fin de curso:{' '}
            <strong className="text-white">29 de Enero de 2027</strong> • Conclusión de semestre:{' '}
            <strong className="text-white">26 de Febrero de 2027</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto relative z-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoToToday}
            className="w-full md:w-auto px-4 py-2 bg-[#aeeecb] text-[#002114] hover:bg-[#85d7ad] font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Ir a Hoy ({currentDay} de {todayMonth.name})</span>
          </motion.button>
        </div>
      </motion.div>

      {/* CONTENIDO PRINCIPAL: Vista Anual (14 Meses) o Vista Mensual */}
      <AnimatePresence mode="wait">
        {viewMode === 'annual' ? (
          <motion.div
            key="annual-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Cuadrícula de 14 Meses (Exactamente como el cartel oficial) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CALENDAR_MONTHS.map((month, idx) => renderMonthCard(month, idx))}
            </div>
          </motion.div>
        ) : (
          /* Vista Mensual Detallada */
          <motion.div
            key="monthly-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Navegador de meses con animación */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Mes Anterior</span>
              </motion.button>

              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-black text-[#191c1d] tracking-tight">
                  {activeMonth.name} {activeMonth.year}
                </h3>
                <p className="text-xs font-bold text-emerald-800">
                  {activeMonth.year === 2026 &&
                  ['SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'].includes(activeMonth.name)
                    ? 'Periodo Activo: Septiembre - Enero 2026-2027'
                    : activeMonth.year === 2027 && activeMonth.name === 'ENERO'
                    ? 'Periodo Activo: Septiembre - Enero 2026-2027'
                    : 'Ciclo Escolar 2026-2027'}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <span className="hidden sm:inline">Mes Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Cuadrícula Ampliada del Mes Activo con animación de cambio de mes */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMonth.id}
                initial={{ opacity: 0, x: monthSlideDirection * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -monthSlideDirection * 20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden p-4 sm:p-6"
              >
                <div className="grid grid-cols-7 text-center font-black text-xs sm:text-sm text-gray-800 pb-3 border-b border-gray-200">
                  {WEEKDAYS_FULL.map((d, i) => (
                    <div key={d} className={i >= 5 ? 'text-amber-900' : ''}>
                      <span className="hidden sm:inline">{d}</span>
                      <span className="sm:hidden">{WEEKDAYS[i]}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 pt-4">
                  {Array.from({ length: activeMonth.startDayOfWeek }).map((_, i) => (
                    <div
                      key={`empty-lg-${i}`}
                      className="bg-gray-50/80 rounded-xl aspect-square min-h-[55px] sm:min-h-[75px]"
                    />
                  ))}

                  {Array.from({ length: activeMonth.totalDays }, (_, i) => i + 1).map((dayNum) => {
                    const dayData = activeMonth.days[dayNum];
                    const hasEvents = !!dayData && dayData.events.length > 0;
                    const matchesFilter =
                      selectedFilter === 'all' || (dayData && dayData.events.includes(selectedFilter));
                    const isTodayCell = isToday(activeMonth, dayNum);
                    const dayOfWeekIdx = (activeMonth.startDayOfWeek + dayNum - 1) % 7;
                    const isHighlightPulse = selectedFilter !== 'all' && matchesFilter && hasEvents;

                    return (
                      <motion.button
                        key={`lg-day-${dayNum}`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        animate={
                          isTodayCell
                            ? {
                                scale: [1, 1.04, 1],
                                transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
                              }
                            : isHighlightPulse
                            ? {
                                scale: [1, 1.06, 1],
                                transition: { repeat: Infinity, duration: 1.8 },
                              }
                            : {}
                        }
                        title={dayData?.note || `${dayNum} de ${activeMonth.name} ${activeMonth.year}`}
                        className={`relative rounded-xl aspect-square min-h-[55px] sm:min-h-[80px] p-2 flex flex-col justify-between overflow-hidden transition-all select-none ${
                          isTodayCell
                            ? 'ring-[3px] ring-[#0284c7] ring-offset-2 bg-sky-50/90 shadow-md font-black z-20'
                            : isHighlightPulse
                            ? 'ring-2 ring-emerald-600 shadow-lg z-10'
                            : 'shadow-xs'
                        } ${getCellClasses(dayData, matchesFilter, isTodayCell)}`}
                      >
                        {/* Figuras vectoriales ampliadas y franjas notorias */}
                        {renderCellFigures(dayData, true)}

                        <div className="flex items-start justify-between w-full relative z-10">
                          <span
                            className={`text-base sm:text-lg font-black leading-none ${
                              isTodayCell ? 'text-[#0284c7] underline decoration-2 decoration-[#0284c7]' : ''
                            }`}
                          >
                            {dayNum}
                          </span>
                          {isTodayCell && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#0284c7] text-white text-[9px] font-black tracking-wider flex items-center gap-1 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              HOY
                            </span>
                          )}
                        </div>

                        {dayData?.note ? (
                          <span className="relative z-10 text-[10px] sm:text-[11px] leading-tight text-left line-clamp-2 font-bold opacity-95">
                            {dayData.note}
                          </span>
                        ) : isTodayCell ? (
                          <span className="relative z-10 text-[9.5px] sm:text-[11px] leading-tight text-left font-black text-[#0369a1] bg-white/90 px-1 py-0.5 rounded-sm shadow-2xs">
                            📍 Día en el que te encuentras
                          </span>
                        ) : null}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECCIÓN OFICIAL DE SIMBOLOGÍA Y LEYENDA (Los 14 Puntos Notorios del Cartel) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-sm space-y-5"
      >
        <div className="border-b border-gray-100 pb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[#191c1d] tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#012d1d]" />
              <span>Simbología Oficial del Calendario Escolar (14 Indicadores)</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              El primer clic activa la selección para resaltar en el calendario; al volver a hacer clic en la tarjeta se deselecciona
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedFilter !== 'all' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSelectedFilter('all')}
                className="text-xs text-[#012d1d] hover:underline font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Deseleccionar (Mostrar todos)</span>
              </motion.button>
            )}
            <span className="text-xs font-bold text-gray-400 hidden sm:inline">TESCHI 2026-2027</span>
          </div>
        </div>

        {/* Grilla de la Simbología con figuras de alto impacto y escala visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CALENDAR_LEGEND.map((item) => {
            const isSelected = selectedFilter === item.id;
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFilter(isSelected ? 'all' : item.id)}
                role="button"
                aria-pressed={isSelected}
                title={
                  isSelected
                    ? `${item.label} (Activo - Haz clic para deseleccionar)`
                    : `${item.label} (Haz clic para seleccionar y resaltar en el calendario)`
                }
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-[#012d1d] bg-emerald-50/80 shadow-md ring-2 ring-[#012d1d]/20'
                    : 'border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50/80 shadow-2xs'
                }`}
              >
                {/* Cuadro de muestra en tamaño prominente (48x48px) que replica la celda */}
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm relative bg-white border border-gray-300 overflow-hidden">
                  {/* Número de día de muestra */}
                  <span className="text-xs font-bold text-gray-700 z-10 select-none">15</span>

                  {/* Caso 1: Reinscripciones (Barra azul superior gruesa) */}
                  {item.id === 'reinscripcion' && (
                    <div className="w-full h-2.5 bg-[#2563eb] absolute top-0 inset-x-0 shadow-xs" />
                  )}

                  {/* Caso 2: Inscripciones (Barra roja inferior gruesa) */}
                  {item.id === 'inscripcion' && (
                    <div className="w-full h-2.5 bg-[#dc2626] absolute bottom-0 inset-x-0 shadow-xs" />
                  )}

                  {/* Caso 3: Inicio de Semestre (Triángulo azul arriba) */}
                  {item.id === 'inicio_semestre' && (
                    <div className="absolute top-1 right-1 z-20">
                      <GlyphInicioSemestre size={20} />
                    </div>
                  )}

                  {/* Caso 4: Fin de Semestre (Triángulo azul abajo) */}
                  {item.id === 'fin_semestre' && (
                    <div className="absolute top-1 right-1 z-20">
                      <GlyphFinSemestre size={20} />
                    </div>
                  )}

                  {/* Caso 5: Inicio de Curso (Flecha morada derecha) */}
                  {item.id === 'inicio_curso' && (
                    <div className="absolute bottom-1 right-1 z-20">
                      <GlyphInicioCurso size={20} />
                    </div>
                  )}

                  {/* Caso 6: Fin de Curso (Flecha morada izquierda) */}
                  {item.id === 'fin_curso' && (
                    <div className="absolute bottom-1 left-1 z-20">
                      <GlyphFinCurso size={20} />
                    </div>
                  )}

                  {/* Caso 7: Días No Laborables (Cuadro negro) */}
                  {item.id === 'dia_no_laborable' && (
                    <div className="absolute inset-0 bg-[#18181b] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">15</span>
                    </div>
                  )}

                  {/* Caso 8: Vacaciones (Cuadro amarillo) */}
                  {item.id === 'vacaciones' && (
                    <div className="absolute inset-0 bg-[#facc15] flex items-center justify-center">
                      <span className="text-xs font-bold text-stone-950">15</span>
                    </div>
                  )}

                  {/* Caso 9: Aniversario TESCHI (Cuadro con borde azul grueso de 4px) */}
                  {item.id === 'aniversario_teschi' && (
                    <div className="absolute inset-0 bg-white border-[3.5px] border-[#0284c7] flex items-center justify-center">
                      <span className="text-xs font-black text-[#0284c7]">15</span>
                    </div>
                  )}

                  {/* Caso 10: Seguimientos (Rosa) */}
                  {item.id === 'seguimiento' && (
                    <div className="absolute inset-0 bg-[#f472b6] flex items-center justify-center">
                      <span className="text-xs font-bold text-stone-950">15</span>
                    </div>
                  )}

                  {/* Caso 11: Curso de Preselección (Morado) */}
                  {item.id === 'preseleccion' && (
                    <div className="absolute inset-0 bg-[#c084fc] flex items-center justify-center">
                      <span className="text-xs font-bold text-stone-950">15</span>
                    </div>
                  )}

                  {/* Caso 12: Receso Escolar y Administrativo (Celeste) */}
                  {item.id === 'receso_escolar' && (
                    <div className="absolute inset-0 bg-[#38bdf8] flex items-center justify-center">
                      <span className="text-xs font-bold text-stone-950">15</span>
                    </div>
                  )}

                  {/* Caso 13: Primera Oportunidad (Borde verde olivo grueso) */}
                  {item.id === 'primera_oportunidad' && (
                    <div className="absolute inset-0 ring-[3px] ring-[#65a30d] ring-inset bg-[#f7fee7] flex items-center justify-center">
                      <span className="text-xs font-bold text-stone-900">15</span>
                    </div>
                  )}

                  {/* Caso 14: Segunda Oportunidad y Calificación Final (Naranja) */}
                  {item.id === 'segunda_oportunidad' && (
                    <div className="absolute inset-0 bg-[#fb923c] flex items-center justify-center">
                      <span className="text-xs font-bold text-stone-950">15</span>
                    </div>
                  )}
                </div>

                {/* Texto descriptivo */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#191c1d] truncate">
                      {item.label}
                    </h4>
                    {isSelected && (
                      <span className="text-[10px] bg-[#012d1d] text-[#aeeecb] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#aeeecb] animate-pulse" />
                        <span>Seleccionado</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 font-medium">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Pie Institucional Oficial (Basado en la franja del cartel) */}
      <div className="bg-[#83152c] text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border-b border-rose-900/40 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-200">
              SECRETARÍA DE EDUCACIÓN, CIENCIA, TECNOLOGÍA E INNOVACIÓN
            </p>
            <h4 className="text-base font-extrabold text-white">
              Gobierno del Estado de México • TESChi
            </h4>
          </div>
          <div className="text-xs text-rose-200 font-medium">
            Portal oficial: <span className="underline font-bold">seduc.edomex.gob.mx</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-rose-200/90 font-medium flex-wrap">
          <span>Ingeniería en Sistemas Computacionales</span>
          <span>•</span>
          <span>Ingeniería Industrial</span>
          <span>•</span>
          <span>Ingeniería Mecatrónica</span>
          <span>•</span>
          <span>Ingeniería Química</span>
          <span>•</span>
          <span>Licenciatura en Administración</span>
        </div>
      </div>
    </div>
  );
};
