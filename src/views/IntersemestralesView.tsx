import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Check,
  Info,
} from 'lucide-react';
import { Course, StudentProfile, ComprobanteRecord } from '../types';
import { ApiClient } from '../services/apiClient';
import { parseSemesterNumber, formatSemesterOrdinal } from '../utils/semesterHelper';

interface IntersemestralesViewProps {
  student: StudentProfile;
  onNavigate: (view: string) => void;
  onOpenCatalog: () => void;
  onEnrollSuccess: (comprobante: ComprobanteRecord) => void;
}

export const IntersemestralesView: React.FC<IntersemestralesViewProps> = ({
  student,
  onNavigate,
  onOpenCatalog,
  onEnrollSuccess,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>([]);
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const studentSemNum = parseSemesterNumber(student.semestreActual);

  // Cargar materias disponibles desde el backend filtradas estrictamente:
  // carrera === student.carrera && semestre <= studentSemNum
  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const data = await ApiClient.getIntersemestralCourses(student.carrera, studentSemNum);
        setCourses(data);
      } catch (err) {
        console.error('Error al cargar cursos intersemestrales:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [student.carrera, studentSemNum]);

  // Lista de semestres permitidos para filtros (exclusivamente hasta el semestre actual)
  const allowedSemesters = useMemo(() => {
    const sems: number[] = [];
    for (let i = 1; i <= studentSemNum; i++) {
      sems.push(i);
    }
    return sems;
  }, [studentSemNum]);

  // Filtrado reactivo de materias (garantizando que ninguna materia > studentSemNum se muestre)
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Regla estricta: nunca superar el semestre del alumno
      if ((c.semestre || 1) > studentSemNum) return false;

      // Filtro por pestaña de semestre
      if (selectedSemesterFilter !== 'all' && c.semestre !== selectedSemesterFilter) {
        return false;
      }

      // Filtro de búsqueda por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.nombre.toLowerCase().includes(q);
        const matchCode = c.clave.toLowerCase().includes(q);
        const matchArea = c.area?.toLowerCase().includes(q);
        const matchProf = c.profesor?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchArea && !matchProf) return false;
      }

      return true;
    });
  }, [courses, studentSemNum, selectedSemesterFilter, searchQuery]);

  const handleToggleCourse = (clave: string) => {
    setErrorBanner(null);
    if (selectedCourseCodes.includes(clave)) {
      setSelectedCourseCodes(selectedCourseCodes.filter((c) => c !== clave));
    } else {
      if (selectedCourseCodes.length >= 2) {
        setErrorBanner('Límite reglamentario alcanzado: El TecNM permite un máximo de 2 materias en periodos intersemestrales.');
        return;
      }
      setSelectedCourseCodes([...selectedCourseCodes, clave]);
    }
  };

  const selectedCoursesList = courses.filter((c) => selectedCourseCodes.includes(c.clave));
  const totalSelectedCredits = selectedCoursesList.reduce((acc, c) => acc + c.creditos, 0);

  const handleSubmit = async () => {
    if (selectedCoursesList.length === 0) {
      setErrorBanner('Debes seleccionar al menos 1 materia para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ApiClient.submitIntersemestral(selectedCoursesList);
      if (res.success && res.comprobante) {
        onEnrollSuccess(res.comprobante);
        onNavigate('comprobante_intersemestral');
      }
    } catch (err: any) {
      setErrorBanner('Ocurrió un error al registrar la solicitud: ' + (err.message || 'Error de red'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-28 max-w-4xl mx-auto px-4 pt-6 space-y-6">
      {/* Encabezado Principal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#aeeecb]/40 text-[#002114] text-xs font-bold uppercase tracking-wider mb-1.5">
              <GraduationCap className="w-4 h-4 text-[#012d1d]" />
              <span>Cursos Intersemestrales • Periodo 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191c1d] tracking-tight">
              Oferta y Selección de Asignaturas
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Programa de regularización y avance curricular para estudiantes de <strong>{student.carrera}</strong>.
            </p>
          </div>

          {/* Botón para abrir el Catálogo Curricular Completo */}
          <button
            onClick={onOpenCatalog}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-[#012d1d] text-[#012d1d] font-semibold text-xs rounded-xl shadow-2xs transition group shrink-0"
          >
            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Ver Catálogo de Retícula</span>
          </button>
        </div>
      </motion.div>

      {/* Alerta de Regla TecNM Estricta */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs"
      >
        <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-amber-950">
          <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
            <span>Restricción de Nivel y Semestre (Lineamiento TecNM Art. 4.2)</span>
          </h4>
          <p className="leading-relaxed">
            Solo se muestran materias de tu carrera correspondientes hasta tu semestre actual (
            <strong className="underline decoration-amber-400 font-bold">{student.semestreActual}</strong>
            ). Las asignaturas de semestres superiores ({studentSemNum + 1}º en adelante) están{' '}
            <strong>estrictamente bloqueadas</strong> para cursos intersemestrales.
          </p>
          <div className="pt-1.5 flex flex-wrap items-center gap-3 font-semibold text-[11px] text-amber-900">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Máximo 2 materias por periodo
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Modalidad Intensiva (4 Semanas)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Banner de error o advertencia */}
      {errorBanner && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <span>{errorBanner}</span>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-red-900 font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Controles de Búsqueda y Pestañas de Semestres */}
      <div className="space-y-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por materia, clave (ej. ACF-0901) o docente..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/15 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtro por Semestre (SOLO hasta studentSemNum) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedSemesterFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
              selectedSemesterFilter === 'all'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todos hasta {studentSemNum}º Semestre
          </button>

          {allowedSemesters.map((sem) => {
            const isSelected = selectedSemesterFilter === sem;
            const isCurrent = sem === studentSemNum;
            return (
              <button
                key={sem}
                onClick={() => setSelectedSemesterFilter(sem)}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition relative ${
                  isSelected
                    ? 'bg-[#012d1d] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#aeeecb]/40 text-[#002114] border border-[#012d1d]/30 hover:bg-[#aeeecb]/60'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{formatSemesterOrdinal(sem)}</span>
                {isCurrent && (
                  <span className="ml-1 text-[9px] px-1 py-0.2 bg-[#012d1d] text-[#aeeecb] rounded-xs font-bold">
                    Actual
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Materias Elegibles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Mostrando <strong>{filteredCourses.length}</strong> materias elegibles de {student.carrera}
          </span>
          <span className="font-semibold text-gray-700">
            {selectedCourseCodes.length} de 2 materias seleccionadas
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-3 border-[#012d1d] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">
              Consultando catálogo de materias permitidas...
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 p-6 space-y-2">
            <Info className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-bold text-gray-700">
              No hay materias disponibles con los filtros actuales.
            </p>
            <p className="text-xs text-gray-500">
              Prueba cambiando la búsqueda o restableciendo los semestres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCourses.map((c) => {
              const isSelected = selectedCourseCodes.includes(c.clave);
              const isDisabled = !isSelected && selectedCourseCodes.length >= 2;

              return (
                <div
                  key={c.clave}
                  onClick={() => !isDisabled && handleToggleCourse(c.clave)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-[#012d1d] shadow-sm ring-1 ring-[#012d1d]'
                      : isDisabled
                      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                          {c.clave}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#aeeecb]/30 text-[#002114]">
                          {formatSemesterOrdinal(c.semestre || 1)}
                        </span>
                        {c.area && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                            {c.area}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#191c1d] leading-snug">
                        {c.nombre}
                      </h4>
                    </div>

                    {/* Selector / Checkbox Circular */}
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-[#012d1d] border-[#012d1d] text-white'
                          : isDisabled
                          ? 'border-gray-300 bg-gray-100 text-transparent'
                          : 'border-gray-400 bg-white hover:border-[#012d1d]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Detalles Académicos */}
                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">Profesor:</span>
                      <span className="text-[11px] font-semibold text-gray-800 truncate max-w-[200px]">
                        {c.profesor || 'Mtro. Titular de Área'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">Horario Intensivo:</span>
                      <span className="text-[11px] font-mono text-gray-700">
                        {c.dias} ({c.horario})
                      </span>
                    </div>
                  </div>

                  {/* Footer de Tarjeta */}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500 font-mono">Aula: {c.aula || 'Edificio A'}</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-900 font-bold text-xs">
                      {c.creditos} Créditos
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Barra Flotante Inferior de Acción */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3.5 px-4 shadow-xl z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-gray-400 uppercase font-semibold text-[10px] block">
                Selección Intersemestral
              </span>
              <p className="font-extrabold text-[#191c1d] text-sm">
                {selectedCourseCodes.length} / 2 materias ({totalSelectedCredits} Créditos)
              </p>
            </div>
            {selectedCourseCodes.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                {selectedCourseCodes.length === 2 ? 'Límite Completo' : '1 Materia Restante'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition w-1/2 sm:w-auto"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={selectedCourseCodes.length === 0 || isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition w-1/2 sm:w-auto ${
                selectedCourseCodes.length === 0 || isSubmitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#012d1d] hover:bg-[#1b4332] text-white'
              }`}
            >
              <span>{isSubmitting ? 'Registrando...' : 'Generar Formato FOR-002'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
