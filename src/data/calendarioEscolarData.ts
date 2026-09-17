export type CalendarEventType =
  | 'reinscripcion'
  | 'inscripcion'
  | 'inicio_semestre'
  | 'fin_semestre'
  | 'inicio_curso'
  | 'fin_curso'
  | 'dia_no_laborable'
  | 'vacaciones'
  | 'aniversario_teschi'
  | 'seguimiento'
  | 'preseleccion'
  | 'receso_escolar'
  | 'primera_oportunidad'
  | 'segunda_oportunidad';

export interface LegendItem {
  id: CalendarEventType;
  label: string;
  description: string;
  category: 'academico' | 'asueto' | 'evaluacion' | 'institucional';
  badgeStyle: {
    bg?: string;
    text?: string;
    border?: string;
    glyph?: string;
    glyphColor?: string;
    barTop?: string;
    barBottom?: string;
  };
}

export const CALENDAR_LEGEND: LegendItem[] = [
  {
    id: 'reinscripcion',
    label: 'Reinscripciones',
    description: 'Periodo para que los estudiantes regulares e irregulares formalicen su carga académica.',
    category: 'academico',
    badgeStyle: {
      barTop: '#2563eb',
      text: '#1e3a8a',
    },
  },
  {
    id: 'inscripcion',
    label: 'Inscripciones',
    description: 'Recepción, validación de documentos y registro oficial para alumnos de nuevo ingreso.',
    category: 'academico',
    badgeStyle: {
      barBottom: '#dc2626',
      text: '#991b1b',
    },
  },
  {
    id: 'inicio_semestre',
    label: 'Inicio de semestre',
    description: 'Apertura oficial del periodo semestral de acuerdo con la normatividad académica del TESCHI.',
    category: 'academico',
    badgeStyle: {
      glyph: '△',
      glyphColor: '#0284c7',
    },
  },
  {
    id: 'fin_semestre',
    label: 'Fin de semestre',
    description: 'Conclusión formal del periodo semestral y cierre administrativo de ciclos escolares.',
    category: 'academico',
    badgeStyle: {
      glyph: '▽',
      glyphColor: '#0284c7',
    },
  },
  {
    id: 'inicio_curso',
    label: 'Inicio de curso',
    description: 'Primer día de clases presenciales/híbridas para todas las carreras del sistema escolarizado.',
    category: 'academico',
    badgeStyle: {
      glyph: '⇨',
      glyphColor: '#7e22ce',
    },
  },
  {
    id: 'fin_curso',
    label: 'Fin de curso',
    description: 'Último día lectivo de impartición de clases ordinarias en aula o laboratorios.',
    category: 'academico',
    badgeStyle: {
      glyph: '⇦',
      glyphColor: '#7e22ce',
    },
  },
  {
    id: 'dia_no_laborable',
    label: 'Días No Laborables',
    description: 'Días festivos oficiales por ley o calendario oficial (suspensión total de labores).',
    category: 'asueto',
    badgeStyle: {
      bg: '#18181b',
      text: '#ffffff',
    },
  },
  {
    id: 'vacaciones',
    label: 'Vacaciones',
    description: 'Periodos de descanso de Semana Santa, Verano e Invierno según el calendario oficial.',
    category: 'asueto',
    badgeStyle: {
      bg: '#facc15',
      text: '#1c1917',
    },
  },
  {
    id: 'aniversario_teschi',
    label: 'Aniversario del TESCHI',
    description: '11 de Enero: Conmemoración solemne de la fundación del Tecnológico de Estudios Superiores de Chimalhuacán.',
    category: 'institucional',
    badgeStyle: {
      bg: '#ffffff',
      border: '#0284c7',
      text: '#0369a1',
    },
  },
  {
    id: 'seguimiento',
    label: 'Seguimientos',
    description: 'Semanas de seguimiento académico departamental y registro de avances de objetivos curriculares.',
    category: 'evaluacion',
    badgeStyle: {
      bg: '#f472b6',
      text: '#831843',
    },
  },
  {
    id: 'preseleccion',
    label: 'Curso de Preselección',
    description: 'Curso propedéutico de inducción y preselección para aspirantes a ingeniería o licenciatura.',
    category: 'academico',
    badgeStyle: {
      bg: '#c084fc',
      text: '#ffffff',
    },
  },
  {
    id: 'receso_escolar',
    label: 'Receso Escolar y Administrativo',
    description: 'Periodo de receso para actividades escolares y reorganización de servicios administrativos.',
    category: 'asueto',
    badgeStyle: {
      bg: '#38bdf8',
      text: '#ffffff',
    },
  },
  {
    id: 'primera_oportunidad',
    label: 'Primera Oportunidad',
    description: 'Evaluación ordinaria en primera oportunidad para acreditación de asignaturas.',
    category: 'evaluacion',
    badgeStyle: {
      border: '#84cc16',
      text: '#365314',
    },
  },
  {
    id: 'segunda_oportunidad',
    label: 'Segunda Oportunidad y Calificación Final',
    description: 'Evaluación en segunda oportunidad (extraordinario) y emisión/entrega de actas definitivas.',
    category: 'evaluacion',
    badgeStyle: {
      bg: '#fb923c',
      text: '#ffffff',
    },
  },
];

export interface DayData {
  day: number;
  events: CalendarEventType[];
  note?: string;
  glyph?: '△' | '▽' | '⇨' | '⇦';
}

export interface MonthData {
  id: string;
  name: string;
  year: number;
  totalDays: number;
  startDayOfWeek: number; // 0 = Lunes, 1 = Martes ... 6 = Domingo
  days: Record<number, DayData>;
}

export const CALENDAR_MONTHS: MonthData[] = [
  // 1. ENERO 2026
  {
    id: '2026-01',
    name: 'ENERO',
    year: 2026,
    totalDays: 31,
    startDayOfWeek: 3, // Jueves
    days: {
      1: { day: 1, events: ['vacaciones', 'dia_no_laborable'], note: 'Año Nuevo / Periodo Vacacional' },
      2: { day: 2, events: ['vacaciones'], note: 'Periodo Vacacional' },
      5: { day: 5, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      6: { day: 6, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      7: { day: 7, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      8: { day: 8, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      9: { day: 9, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      11: { day: 11, events: ['aniversario_teschi'], note: 'Aniversario del TESCHI' },
      19: { day: 19, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      20: { day: 20, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      21: { day: 21, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      22: { day: 22, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      23: { day: 23, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      26: { day: 26, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      27: { day: 27, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      28: { day: 28, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      29: { day: 29, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      30: { day: 30, events: ['segunda_oportunidad', 'fin_curso'], glyph: '⇦', note: 'Segunda Oportunidad y Fin de Curso' },
    },
  },

  // 2. FEBRERO 2026
  {
    id: '2026-02',
    name: 'FEBRERO',
    year: 2026,
    totalDays: 28,
    startDayOfWeek: 6, // Domingo
    days: {
      2: { day: 2, events: ['dia_no_laborable'], note: 'Día No Laborable (Conmemoración Constitución)' },
      3: { day: 3, events: ['preseleccion'], note: 'Curso de Preselección' },
      4: { day: 4, events: ['preseleccion'], note: 'Curso de Preselección' },
      5: { day: 5, events: ['preseleccion'], note: 'Curso de Preselección' },
      6: { day: 6, events: ['preseleccion'], note: 'Curso de Preselección' },
      9: { day: 9, events: ['preseleccion'], note: 'Curso de Preselección' },
      10: { day: 10, events: ['preseleccion'], note: 'Curso de Preselección' },
      11: { day: 11, events: ['preseleccion'], note: 'Curso de Preselección' },
      12: { day: 12, events: ['preseleccion'], note: 'Curso de Preselección' },
      13: { day: 13, events: ['preseleccion'], note: 'Curso de Preselección' },
      16: { day: 16, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      17: { day: 17, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      18: { day: 18, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      19: { day: 19, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      20: { day: 20, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      23: { day: 23, events: ['inicio_semestre'], glyph: '△', note: 'Inicio de Semestre 2026-1' },
      27: { day: 27, events: ['fin_semestre'], glyph: '▽', note: 'Fin de Semestre ciclo anterior' },
    },
  },

  // 3. MARZO 2026
  {
    id: '2026-03',
    name: 'MARZO',
    year: 2026,
    totalDays: 31,
    startDayOfWeek: 6, // Domingo
    days: {
      2: { day: 2, events: ['dia_no_laborable'], note: 'Día No Laborable' },
      3: { day: 3, events: ['inicio_curso', 'inicio_semestre'], glyph: '⇨', note: 'Inicio de Curso Semestre 2026-1' },
      16: { day: 16, events: ['dia_no_laborable'], note: 'Día No Laborable (Natalicio Benito Juárez)' },
      30: { day: 30, events: ['vacaciones'], note: 'Vacaciones de Semana Santa' },
      31: { day: 31, events: ['vacaciones'], note: 'Vacaciones de Semana Santa' },
    },
  },

  // 4. ABRIL 2026
  {
    id: '2026-04',
    name: 'ABRIL',
    year: 2026,
    totalDays: 30,
    startDayOfWeek: 2, // Miércoles
    days: {
      1: { day: 1, events: ['vacaciones'], note: 'Vacaciones de Semana Santa' },
      2: { day: 2, events: ['vacaciones'], note: 'Jueves Santo (Vacaciones)' },
      3: { day: 3, events: ['vacaciones'], note: 'Viernes Santo (Vacaciones)' },
      6: { day: 6, events: ['vacaciones'], note: 'Vacaciones de Pascua' },
      7: { day: 7, events: ['vacaciones'], note: 'Vacaciones de Pascua' },
      8: { day: 8, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      9: { day: 9, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      10: { day: 10, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      13: { day: 13, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      14: { day: 14, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      15: { day: 15, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      16: { day: 16, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      17: { day: 17, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
    },
  },

  // 5. MAYO 2026
  {
    id: '2026-05',
    name: 'MAYO',
    year: 2026,
    totalDays: 31,
    startDayOfWeek: 4, // Viernes
    days: {
      1: { day: 1, events: ['dia_no_laborable'], note: 'Día No Laborable (Día del Trabajo)' },
      5: { day: 5, events: ['dia_no_laborable'], note: 'Día No Laborable (Batalla de Puebla)' },
      15: { day: 15, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo (Día del Maestro)' },
      25: { day: 25, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
      26: { day: 26, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
      27: { day: 27, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
      28: { day: 28, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
      29: { day: 29, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
    },
  },

  // 6. JUNIO 2026
  {
    id: '2026-06',
    name: 'JUNIO',
    year: 2026,
    totalDays: 30,
    startDayOfWeek: 0, // Lunes
    days: {},
  },

  // 7. JULIO 2026
  {
    id: '2026-07',
    name: 'JULIO',
    year: 2026,
    totalDays: 31,
    startDayOfWeek: 2, // Miércoles
    days: {
      6: { day: 6, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      7: { day: 7, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      8: { day: 8, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      9: { day: 9, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      10: { day: 10, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      13: { day: 13, events: ['vacaciones'], note: 'Periodo Vacacional de Verano' },
      14: { day: 14, events: ['vacaciones'], note: 'Periodo Vacacional de Verano' },
      15: { day: 15, events: ['vacaciones'], note: 'Periodo Vacacional de Verano' },
      16: { day: 16, events: ['vacaciones'], note: 'Periodo Vacacional de Verano' },
      17: { day: 17, events: ['vacaciones'], note: 'Periodo Vacacional de Verano' },
      20: { day: 20, events: ['vacaciones'], note: 'Periodo Vacacional de Verano' },
      21: { day: 21, events: ['vacaciones'], note: 'Periodo Vacacional de Verano' },
      22: { day: 22, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      23: { day: 23, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      24: { day: 24, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      27: { day: 27, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      28: { day: 28, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      29: { day: 29, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      30: { day: 30, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      31: { day: 31, events: ['segunda_oportunidad', 'fin_curso'], glyph: '⇦', note: 'Segunda Oportunidad y Fin de Curso 2026-1' },
    },
  },

  // 8. AGOSTO 2026
  {
    id: '2026-08',
    name: 'AGOSTO',
    year: 2026,
    totalDays: 31,
    startDayOfWeek: 5, // Sábado
    days: {
      3: { day: 3, events: ['preseleccion'], note: 'Curso de Preselección' },
      4: { day: 4, events: ['preseleccion'], note: 'Curso de Preselección' },
      5: { day: 5, events: ['preseleccion'], note: 'Curso de Preselección' },
      6: { day: 6, events: ['preseleccion'], note: 'Curso de Preselección' },
      7: { day: 7, events: ['preseleccion'], note: 'Curso de Preselección' },
      10: { day: 10, events: ['preseleccion'], note: 'Curso de Preselección' },
      11: { day: 11, events: ['preseleccion'], note: 'Curso de Preselección' },
      12: { day: 12, events: ['preseleccion'], note: 'Curso de Preselección' },
      13: { day: 13, events: ['preseleccion'], note: 'Curso de Preselección' },
      14: { day: 14, events: ['preseleccion'], note: 'Curso de Preselección' },
      17: { day: 17, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones (Periodo Septiembre - Enero 2026-2027)' },
      18: { day: 18, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      19: { day: 19, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      20: { day: 20, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      21: { day: 21, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      31: { day: 31, events: ['inicio_semestre'], glyph: '△', note: 'Inicio de Semestre Septiembre - Enero 2026-2027' },
    },
  },

  // 9. SEPTIEMBRE 2026
  {
    id: '2026-09',
    name: 'SEPTIEMBRE',
    year: 2026,
    totalDays: 30,
    startDayOfWeek: 1, // Martes
    days: {
      1: { day: 1, events: ['inicio_curso', 'inicio_semestre'], glyph: '⇨', note: 'Inicio de Curso Semestre Septiembre - Enero 2026-2027' },
      16: { day: 16, events: ['dia_no_laborable'], note: 'Día No Laborable (Independencia de México)' },
    },
  },

  // 10. OCTUBRE 2026
  {
    id: '2026-10',
    name: 'OCTUBRE',
    year: 2026,
    totalDays: 31,
    startDayOfWeek: 3, // Jueves
    days: {
      5: { day: 5, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      6: { day: 6, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      7: { day: 7, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      8: { day: 8, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      9: { day: 9, events: ['seguimiento', 'primera_oportunidad'], note: '1er Seguimiento / Primera Oportunidad' },
      12: { day: 12, events: ['dia_no_laborable'], note: 'Día No Laborable (Día de la Raza)' },
    },
  },

  // 11. NOVIEMBRE 2026
  {
    id: '2026-11',
    name: 'NOVIEMBRE',
    year: 2026,
    totalDays: 30,
    startDayOfWeek: 6, // Domingo
    days: {
      2: { day: 2, events: ['dia_no_laborable'], note: 'Día No Laborable (Día de Muertos)' },
      16: { day: 16, events: ['dia_no_laborable'], note: 'Día No Laborable (Revolución Mexicana)' },
      17: { day: 17, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
      18: { day: 18, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
      19: { day: 19, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
      20: { day: 20, events: ['seguimiento', 'primera_oportunidad'], note: '2do Seguimiento / Primera Oportunidad' },
    },
  },

  // 12. DICIEMBRE 2026
  {
    id: '2026-12',
    name: 'DICIEMBRE',
    year: 2026,
    totalDays: 31,
    startDayOfWeek: 1, // Martes
    days: {
      18: { day: 18, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      21: { day: 21, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      22: { day: 22, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      23: { day: 23, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      24: { day: 24, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      25: { day: 25, events: ['dia_no_laborable', 'vacaciones'], note: 'Día No Laborable (Navidad)' },
      28: { day: 28, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      29: { day: 29, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      30: { day: 30, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      31: { day: 31, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
    },
  },

  // 13. ENERO 2027
  {
    id: '2027-01',
    name: 'ENERO',
    year: 2027,
    totalDays: 31,
    startDayOfWeek: 4, // Viernes
    days: {
      1: { day: 1, events: ['dia_no_laborable'], note: 'Día No Laborable (Año Nuevo)' },
      4: { day: 4, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      5: { day: 5, events: ['vacaciones'], note: 'Vacaciones de Invierno' },
      6: { day: 6, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      7: { day: 7, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      8: { day: 8, events: ['receso_escolar'], note: 'Receso Escolar y Administrativo' },
      11: { day: 11, events: ['aniversario_teschi'], note: 'Aniversario del TESCHI' },
      18: { day: 18, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      19: { day: 19, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      20: { day: 20, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      21: { day: 21, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      22: { day: 22, events: ['seguimiento', 'primera_oportunidad'], note: '3er Seguimiento / Primera Oportunidad' },
      25: { day: 25, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      26: { day: 26, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      27: { day: 27, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      28: { day: 28, events: ['segunda_oportunidad'], note: 'Segunda Oportunidad y Calificación Final' },
      29: { day: 29, events: ['segunda_oportunidad', 'fin_curso'], glyph: '⇦', note: 'Fin de Curso Semestre Septiembre - Enero 2026-2027 y Segunda Oportunidad' },
    },
  },

  // 14. FEBRERO 2027
  {
    id: '2027-02',
    name: 'FEBRERO',
    year: 2027,
    totalDays: 28,
    startDayOfWeek: 0, // Lunes
    days: {
      1: { day: 1, events: ['dia_no_laborable'], note: 'Día No Laborable (Constitución Política)' },
      2: { day: 2, events: ['preseleccion'], note: 'Curso de Preselección' },
      3: { day: 3, events: ['preseleccion'], note: 'Curso de Preselección' },
      4: { day: 4, events: ['preseleccion'], note: 'Curso de Preselección' },
      5: { day: 5, events: ['preseleccion'], note: 'Curso de Preselección' },
      8: { day: 8, events: ['preseleccion'], note: 'Curso de Preselección' },
      9: { day: 9, events: ['preseleccion'], note: 'Curso de Preselección' },
      10: { day: 10, events: ['preseleccion'], note: 'Curso de Preselección' },
      11: { day: 11, events: ['preseleccion'], note: 'Curso de Preselección' },
      12: { day: 12, events: ['preseleccion'], note: 'Curso de Preselección' },
      15: { day: 15, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones (Semestre 2027-1)' },
      16: { day: 16, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      17: { day: 17, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      18: { day: 18, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      19: { day: 19, events: ['reinscripcion', 'inscripcion'], note: 'Periodo de Reinscripciones e Inscripciones' },
      26: { day: 26, events: ['fin_semestre'], glyph: '▽', note: 'Fin de Semestre Septiembre - Enero 2026-2027' },
    },
  },
];
