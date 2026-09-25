import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Course } from '../types';

interface ReinscripcionCargaViewProps {
  courses: Course[];
  selectedCourseCodes: string[];
  onToggleCourse: (code: string) => void;
  onConfirm: () => void;
  maxCredits?: number;
}

export const ReinscripcionCargaView: React.FC<ReinscripcionCargaViewProps> = ({
  courses,
  selectedCourseCodes,
  onToggleCourse,
  onConfirm,
  maxCredits = 30,
}) => {
  const currentCredits = courses
    .filter((c) => selectedCourseCodes.includes(c.clave))
    .reduce((acc, c) => acc + c.creditos, 0);

  const progressPercent = Math.min(Math.round((currentCredits / maxCredits) * 100), 100);

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-24 space-y-4">
      {/* Barra Superior de Créditos (Exactamente como en Image 13) */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-[60px] z-20 bg-[#f8f9fa] pt-1 pb-3 space-y-2 border-b border-gray-200/80 backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#191c1d]">
            Créditos Seleccionados
          </h2>
          <span className="text-xl sm:text-2xl font-extrabold text-[#191c1d]">
            {currentCredits} / {maxCredits}
          </span>
        </div>

        {/* Barra de progreso redondeada */}
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35 }}
            className={`h-full rounded-full transition-colors ${
              currentCredits > maxCredits ? 'bg-[#ba1a1a]' : 'bg-[#1b4332]'
            }`}
          />
        </div>

        <p className="text-xs text-center text-gray-500 font-medium">
          {currentCredits === 0
            ? 'Selecciona materias para continuar'
            : currentCredits > maxCredits
            ? 'Has excedido el límite máximo de créditos'
            : `${selectedCourseCodes.length} materia(s) elegida(s) correctamente`}
        </p>
      </motion.div>

      {/* Lista de Tarjetas de Materias (Image 13) */}
      <div className="space-y-3.5 pt-2">
        {courses.map((course) => {
          const isSelected = selectedCourseCodes.includes(course.clave);

          return (
            <motion.div
              key={course.clave}
              whileTap={{ scale: 0.99 }}
              onClick={() => onToggleCourse(course.clave)}
              className={`rounded-2xl p-4 bg-white border cursor-pointer transition shadow-2xs ${
                isSelected
                  ? 'border-[#1b4332] ring-1 ring-[#1b4332]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Checkbox circular / redondeado */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors border ${
                    isSelected
                      ? 'bg-[#1b4332] border-[#1b4332] text-white'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-[#1b4332]" />}
                </div>

                {/* Contenido de la Materia: Exclusivamente Código, Nombre y Créditos */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-[#aeeecb]/40 text-[#002114] text-xs font-semibold">
                      {course.clave}
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {course.creditos} Créditos
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#191c1d] leading-snug">
                    {course.nombre}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Botón inferior flotante fijo 'Confirmar e Inscribir' (Image 13) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-gray-200 backdrop-blur-md z-30 shadow-lg">
        <div className="max-w-xl mx-auto">
          <button
            id="btn-confirmar-inscribir"
            onClick={onConfirm}
            disabled={selectedCourseCodes.length === 0 || currentCredits > maxCredits}
            className={`w-full py-3.5 rounded-xl font-medium text-base flex items-center justify-center gap-2 transition shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#1b4332] ${
              selectedCourseCodes.length > 0 && currentCredits <= maxCredits
                ? 'bg-[#5e7e6e] hover:bg-[#1b4332] text-white active:scale-[0.99]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Confirmar e Inscribir</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
