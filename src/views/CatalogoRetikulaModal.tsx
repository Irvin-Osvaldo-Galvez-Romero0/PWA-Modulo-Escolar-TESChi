import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, BookOpen, Award, Layers, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { Course, StudentProfile } from '../types';
import { ALL_CURRICULUM_COURSES } from '../services/mockData';
import { parseSemesterNumber, formatSemesterOrdinal } from '../utils/semesterHelper';
import { normalizeCareer, getCareerMetadata } from '../utils/careerHelper';

interface CatalogoRetikulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  initialSemester?: number;
}

export const CatalogoRetikulaModal: React.FC<CatalogoRetikulaModalProps> = ({
  isOpen,
  onClose,
  student,
  initialSemester,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>(
    initialSemester !== undefined ? initialSemester : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');

  const studentSemNum = parseSemesterNumber(student.semestreActual);
  const careerMeta = useMemo(() => getCareerMetadata(student.carrera), [student.carrera]);

  // Materias exclusivas de la carrera del estudiante
  const careerCourses = useMemo(() => {
    return ALL_CURRICULUM_COURSES.filter(
      (c) => normalizeCareer(c.carrera) === normalizeCareer(student.carrera)
    );
  }, [student.carrera]);

  // Áreas curriculares únicas
  const areas = useMemo(() => {
    const set = new Set<string>();
    careerCourses.forEach((c) => {
      if (c.area) set.add(c.area);
    });
    return Array.from(set);
  }, [careerCourses]);

  // Filtrado reactivo
  const filteredCourses = useMemo(() => {
    return careerCourses.filter((c) => {
      const matchSem = selectedSemester === 'all' ? true : c.semestre === selectedSemester;
      const matchArea = selectedArea === 'all' ? true : c.area === selectedArea;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        c.nombre.toLowerCase().includes(query) ||
        c.clave.toLowerCase().includes(query) ||
        (c.area && c.area.toLowerCase().includes(query)) ||
        (c.profesor && c.profesor.toLowerCase().includes(query));

      return matchSem && matchArea && matchSearch;
    });
  }, [careerCourses, selectedSemester, selectedArea, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Superior Temático TESChi */}
          <div className="bg-[#012d1d] text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
            {/* Adorno visual sutil */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#aeeecb]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#aeeecb]/20 text-[#aeeecb] text-[11px] font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Plan de Estudios Oficial {careerMeta.planEstudios}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Catálogo Reticular de la Carrera
                </h3>
                <p className="text-xs text-[#aeeecb]/80">
                  {careerMeta.carrera} • Tecnológico de Estudios Superiores de Chimalhuacán
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Cerrar catálogo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estadísticas de la Carrera */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5">
                <span className="text-[10px] text-[#aeeecb]/80 uppercase font-semibold">Total Créditos</span>
                <p className="font-extrabold text-white text-base">{careerMeta.totalCreditos} SATCA</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5">
                <span className="text-[10px] text-[#aeeecb]/80 uppercase font-semibold">Total Asignaturas</span>
                <p className="font-extrabold text-white text-base">{careerCourses.length} Materias</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5">
                <span className="text-[10px] text-[#aeeecb]/80 uppercase font-semibold">Tu Avance Actual</span>
                <p className="font-extrabold text-[#aeeecb] text-base">{student.semestreActual}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5">
                <span className="text-[10px] text-[#aeeecb]/80 uppercase font-semibold">Residencia & SS</span>
                <p className="font-extrabold text-white text-base">20 Créditos</p>
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="p-4 bg-[#f8f9fa] border-b border-gray-200 space-y-3 shrink-0">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre de materia, clave (ej. ACF-0901, SCD-1008) o profesor..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/15 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Pestañas de Semestres (1 a 9) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedSemester('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
                  selectedSemester === 'all'
                    ? 'bg-[#012d1d] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Todos (1º a 9º)
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => {
                const isCurrent = sem === studentSemNum;
                const isSelected = selectedSemester === sem;
                return (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition relative ${
                      isSelected
                        ? 'bg-[#012d1d] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#aeeecb]/40 text-[#002114] border border-[#012d1d]/30 hover:bg-[#aeeecb]/60'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{sem}º Sem</span>
                    {isCurrent && (
                      <span className="ml-1 text-[9px] px-1 py-0.2 bg-[#012d1d] text-[#aeeecb] rounded-xs font-bold">
                        Tú
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filtros Rápidos por Área */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-gray-400 font-semibold uppercase text-[10px] shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Área:
              </span>
              <button
                onClick={() => setSelectedArea('all')}
                className={`px-2.5 py-1 rounded-full font-medium shrink-0 transition ${
                  selectedArea === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Todas las Áreas
              </button>
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-2.5 py-1 rounded-full font-medium shrink-0 transition ${
                    selectedArea === area
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Materias Reticulares */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
              <span>
                Mostrando <strong className="text-gray-900">{filteredCourses.length}</strong> asignaturas de la carrera
              </span>
              {selectedSemester !== 'all' && (
                <span className="font-semibold text-[#012d1d]">
                  {formatSemesterOrdinal(selectedSemester)}
                </span>
              )}
            </div>

            {filteredCourses.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-gray-500 font-semibold text-sm">
                  No se encontraron asignaturas con los filtros seleccionados.
                </p>
                <button
                  onClick={() => {
                    setSelectedSemester('all');
                    setSelectedArea('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-[#012d1d] font-bold hover:underline"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCourses.map((c) => {
                  const isCurrentSem = c.semestre === studentSemNum;
                  const isPastSem = (c.semestre || 1) < studentSemNum;
                  const isFutureSem = (c.semestre || 1) > studentSemNum;

                  return (
                    <div
                      key={c.clave}
                      className={`p-4 rounded-2xl border transition hover:shadow-md flex flex-col justify-between space-y-2.5 ${
                        isCurrentSem
                          ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                              {c.clave}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#aeeecb]/30 text-[#002114]">
                              {formatSemesterOrdinal(c.semestre || 1)}
                            </span>
                            {c.area && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                {c.area}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-[#191c1d] leading-snug">
                            {c.nombre}
                          </h4>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 py-1 rounded-lg bg-[#012d1d] text-white text-xs font-extrabold shadow-2xs">
                            {c.creditos} CR
                          </span>
                        </div>
                      </div>

                      {/* Detalles: Profesor, Días, Horario */}
                      <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-500 font-medium">Docente Titular:</span>
                          <span className="text-[11px] font-semibold text-gray-800 truncate max-w-[190px]">
                            {c.profesor || 'Por asignar'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-500 font-medium">Horario / Aula:</span>
                          <span className="text-[11px] font-mono text-gray-700">
                            {c.dias} • {c.horario}
                          </span>
                        </div>
                      </div>

                      {/* Estado Relativo al Estudiante */}
                      <div className="pt-1 flex items-center justify-between text-[10px] font-semibold">
                        <span className="text-gray-400 font-mono">Aula: {c.aula || 'Edificio Académico'}</span>
                        {isCurrentSem ? (
                          <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Semestre en Curso
                          </span>
                        ) : isPastSem ? (
                          <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Semestre Previo Acreditado / Regularizable
                          </span>
                        ) : (
                          <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Semestre Futuro
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Informativo */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
            <p className="text-gray-500 text-center sm:text-left">
              Plan curricular validado conforme a los Lineamientos Académicos del TecNM para el ciclo 2026-2027.
            </p>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold rounded-xl text-xs transition"
            >
              Cerrar Catálogo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
