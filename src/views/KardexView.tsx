import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Award,
  TrendingUp,
  FileText,
  ChevronDown,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { SemesterRecord, StudentProfile } from '../types';
import { DocumentAdapter } from '../services/documentAdapter';
import { KARDEX_HISTORY, INITIAL_STUDENT } from '../services/mockData';

interface KardexViewProps {
  student?: StudentProfile | null;
  history?: SemesterRecord[];
}

export const KardexView: React.FC<KardexViewProps> = ({ student, history }) => {
  const safeHistory = Array.isArray(history) && history.length > 0 ? history : KARDEX_HISTORY;
  const safeStudent = student || INITIAL_STUDENT;

  const [openSemesters, setOpenSemesters] = useState<Record<string, boolean>>({
    'sem-1': true,
    'sem-2': false,
  });
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleSemester = (id: string) => {
    setOpenSemesters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDownloadKardexPDF = async () => {
    setDownloading(true);
    const res = await DocumentAdapter.exportPDF({
      filename: `Kardex_Oficial_${safeStudent.matricula}.pdf`,
      title: 'Kardex Académico Oficial TESChi',
      elementId: 'kardex-printable-container',
    });
    setDownloading(false);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div id="kardex-printable-container" className="max-w-xl mx-auto px-4 py-5 space-y-4 pb-20">
      {/* Tarjetas Superiores de Métricas (2 Columnas - Image 21) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Métrica 1: Promedio General */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700">Promedio General</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#191c1d]">
              {safeStudent.promedioGeneral ?? 9.2}
            </span>
            <span className="text-xs font-semibold text-gray-400">/ 10</span>
          </div>
        </motion.div>

        {/* Métrica 2: Créditos */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <Award className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold text-gray-700">Créditos</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#191c1d]">
              {safeStudent.creditosAcumulados ?? 240}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              / {safeStudent.creditosTotales ?? 350}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Tarjeta de Avance de Carrera (Verde Bosque - Image 21) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-[#173c2a] text-white p-5 space-y-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#86af99] tracking-wide">
            Avance de Carrera
          </span>
          <TrendingUp className="w-5 h-5 text-[#86af99]" />
        </div>

        <div className="text-3xl font-extrabold tracking-tight">
          {safeStudent.avancePorcentaje ?? 68}%
        </div>

        {/* Barra de Progreso */}
        <div className="w-full h-2 bg-[#0d261a] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safeStudent.avancePorcentaje ?? 68}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-[#aeeecb]"
          />
        </div>
      </motion.div>

      {/* Botón 'Descargar Kardex Oficial PDF' (Image 21) */}
      <button
        id="btn-descargar-kardex-pdf"
        onClick={handleDownloadKardexPDF}
        disabled={downloading}
        className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#191c1d] flex items-center justify-center gap-2 shadow-2xs transition active:scale-[0.99] no-print"
      >
        <FileText className="w-4 h-4 text-gray-700" />
        <span>{downloading ? 'Generando PDF Oficial...' : 'Descargar Kardex Oficial PDF'}</span>
      </button>

      {/* Lista de Semestres (Acordeón - Image 21) */}
      <div className="space-y-3 pt-2">
        {safeHistory.map((sem, sIdx) => {
          const semKey = sem.id || `sem-${sIdx + 1}`;
          if (sem.enCurso) {
            // Tarjeta con borde punteado '3º Semestre en Curso'
            return (
              <motion.div
                key={semKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center space-y-3 shadow-2xs"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-[#edeeef] text-gray-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#191c1d]">
                    {sem.semestreTitulo || `${sIdx + 1}º Semestre`}
                  </h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Las calificaciones finales aparecerán aquí al concluir el periodo de evaluación.
                  </p>
                </div>
              </motion.div>
            );
          }

          const isExpanded = !!openSemesters[semKey];

          return (
            <motion.div
              key={semKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-2xs"
            >
              {/* Encabezado del Semestre */}
              <button
                onClick={() => toggleSemester(semKey)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition"
                aria-expanded={isExpanded}
              >
                <div>
                  <h4 className="font-bold text-base text-[#191c1d]">
                    {sem.semestreTitulo || `${sIdx + 1}º Semestre`}
                  </h4>
                  <p className="text-xs text-gray-500">{sem.periodoNombre}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 transition-transform">
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Contenido desplegable de Materias con Calificaciones */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100 divide-y divide-gray-100"
                  >
                    {(sem.materias || []).map((materia, mIdx) => (
                      <div
                        key={materia.clave || `mat-${mIdx}`}
                        className="p-3.5 flex items-center justify-between hover:bg-gray-50/60 transition text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-[#191c1d] leading-snug">
                            {materia.nombre}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Clave: {materia.clave} • {materia.creditos} Créditos
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-[#aeeecb]/40 text-[#002114] text-[11px] font-medium">
                            {materia.tipoEvaluacion || 'Ordinario'}
                          </span>
                          <span className="font-bold text-base text-[#191c1d]">
                            {typeof materia.calificacion === 'number'
                              ? materia.calificacion.toFixed(1)
                              : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#012d1d] text-white px-4 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#aeeecb]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
