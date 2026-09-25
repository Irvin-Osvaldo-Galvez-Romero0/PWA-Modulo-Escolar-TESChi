import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Info, ChevronDown, Check, Users, Clock } from 'lucide-react';
import { GroupOption, StudentProfile } from '../types';
import { parseSemesterNumber } from '../utils/semesterHelper';
import { normalizeCareer } from '../utils/careerHelper';

interface ReinscripcionGrupoViewProps {
  groups: GroupOption[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onContinue: () => void;
  student?: StudentProfile;
}

export const ReinscripcionGrupoView: React.FC<ReinscripcionGrupoViewProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onContinue,
  student,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const studentSemNum = student ? parseSemesterNumber(student.semestreActual) : 6;

  // FILTRADO ESTRICTO: Solo mostrar grupos correspondientes a la carrera y semestre del estudiante
  const eligibleGroups = groups.filter((g) => {
    const matchSem = g.semestreNumero === studentSemNum;
    const matchCareer = !student?.carrera || !g.carrera || normalizeCareer(g.carrera) === normalizeCareer(student.carrera);
    return matchSem && matchCareer;
  });
  const displayGroups = eligibleGroups.length > 0 ? eligibleGroups : groups;

  // Auto-seleccionar grupo válido de su semestre si el seleccionado actual no pertenece a sus grupos elegibles
  React.useEffect(() => {
    if (eligibleGroups.length > 0 && !eligibleGroups.some((g) => g.id === selectedGroupId)) {
      onSelectGroup(eligibleGroups[0].id);
    }
  }, [eligibleGroups, selectedGroupId, onSelectGroup]);

  const selectedGroup = displayGroups.find((g) => g.id === selectedGroupId) || displayGroups[0];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between max-w-xl mx-auto px-5 py-6">
      {/* Contenido Superior */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1d] tracking-tight mb-2">
            Selecciona tu Grupo
          </h2>
          <p className="text-sm text-[#414844] leading-relaxed">
            Elige el horario de grupo correspondiente a tu semestre ({student?.semestreActual || '6º Semestre'}). Esto determinará la distribución de tus asignaturas y aulas.
          </p>
        </div>

        {/* Input Select con etiqueta flotante exacta como en Image 11 */}
        <div className="relative pt-2">
          {/* Label superpuesta en el borde */}
          <label className="absolute top-0 left-3 px-1.5 bg-[#f8f9fa] text-xs font-semibold text-gray-700 z-10">
            Selección de Grupo
          </label>

          {/* Trigger Dropdown */}
          <button
            id="select-group-trigger"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left bg-white border border-gray-400 rounded-lg px-4 py-3.5 flex items-center justify-between shadow-2xs hover:border-[#1b4332] focus:border-[#1b4332] focus:ring-2 focus:ring-[#1b4332]/20 focus:outline-hidden transition"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={selectedGroup ? 'font-medium text-[#191c1d]' : 'text-gray-500'}>
              {selectedGroup ? selectedGroup.nombre : 'Seleccionar un grupo...'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú Desplegable con opciones de Grupo (exclusivamente del semestre del alumno) */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              <div className="p-1 space-y-1">
                {displayGroups.map((group) => {
                  const isSelected = group.id === selectedGroupId;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        onSelectGroup(group.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-lg flex items-center justify-between transition text-sm ${
                        isSelected
                          ? 'bg-[#aeeecb]/30 text-[#002114] font-semibold'
                          : 'hover:bg-gray-100 text-[#191c1d]'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-[#191c1d]">{group.nombre}</p>
                        <p className="text-xs text-gray-500">{group.horarioResumen} • Cupo: {group.cupoDisponible} lugares</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#1b4332]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Texto de ayuda con icono de información exacto como en Image 11 */}
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-600">
            <Info className="w-4 h-4 text-gray-500 shrink-0" />
            <span>Por favor, selecciona un grupo para consultar los detalles del horario.</span>
          </p>
        </div>

        {/* Tarjeta de detalles del grupo si está seleccionado */}
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-white border border-gray-200 p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1b4332]">
                Detalles del Horario
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#aeeecb]/40 text-[#002114] text-[11px] font-semibold">
                {selectedGroup.turno}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{selectedGroup.horarioResumen}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{selectedGroup.cupoDisponible} de {selectedGroup.cupoMaximo} disponibles</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Botón inferior fijo/adaptable exacto como en Image 11 */}
      <div className="pt-8 pb-safe">
        <button
          id="btn-continuar-grupo"
          onClick={onContinue}
          disabled={!selectedGroupId}
          className={`w-full py-3.5 rounded-xl font-medium text-base flex items-center justify-center gap-2 transition shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#1b4332] ${
            selectedGroupId
              ? 'bg-[#1b4332] text-white hover:bg-[#012d1d] active:scale-[0.99]'
              : 'bg-[#e1e3e4] text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
