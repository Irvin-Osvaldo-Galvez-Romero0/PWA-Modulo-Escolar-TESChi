/**
 * careerHelper.ts - Normalización y Detección de Carreras Institucionales del TESChi
 * Conforme a la Oferta Académica Oficial del Tecnológico de Estudios Superiores de Chimalhuacán (TecNM)
 */

export interface CareerMetadata {
  carrera: string;
  planEstudios: string;
  claveCarrera: string;
  totalCreditos: number;
}

/**
 * Normaliza cualquier variante de texto de una carrera a su clave canónica
 */
export function normalizeCareer(carrera?: string): string {
  if (!carrera) return 'sistemas';
  const c = carrera.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (c.includes('admin')) return 'administracion';
  if (c.includes('sist') || c.includes('comput')) return 'sistemas';
  if (c.includes('indust')) return 'industrial';
  if (c.includes('meca')) return 'mecatronica';
  if (c.includes('contad')) return 'contaduria';
  if (c.includes('gastro')) return 'gastronomia';
  if (c.includes('animac')) return 'animacion';
  if (c.includes('quimic')) return 'quimica';
  return c;
}

/**
 * Detecta la carrera y el plan de estudios del TecNM a partir de los dígitos de la matrícula
 * Estructura de matrícula TESChi:
 * Posición 0-3: Año de ingreso (ej. 2022)
 * Posición 4-5: Código institucional de carrera:
 *   - 22: Licenciatura en Administración (LADM-2010-234)
 *   - 45: Ingeniería en Sistemas Computacionales (ISIC-2010-224)
 *   - 30: Ingeniería Industrial (IIND-2010-227)
 *   - 15: Ingeniería Mecatrónica (IMCT-2010-229)
 *   - 21: Licenciatura en Contaduría (LCON-2010-230)
 *   - 25: Licenciatura en Gastronomía (LGAS-2010-231)
 *   - 48: Ingeniería en Animación Digital y Efectos Visuales (IADE-2010-232)
 *   - 16 / 60: Ingeniería Química (IQUI-2010-233)
 */
export function detectCareerFromMatricula(matricula?: string): CareerMetadata {
  const clean = (matricula || '').toString().trim();
  if (clean.length >= 6) {
    const code = clean.substring(4, 6);
    switch (code) {
      case '22':
        return {
          carrera: 'Licenciatura en Administración',
          planEstudios: 'LADM-2010-234 (TecNM / TESChi)',
          claveCarrera: 'LAD',
          totalCreditos: 260,
        };
      case '45':
        return {
          carrera: 'Ingeniería en Sistemas Computacionales',
          planEstudios: 'ISIC-2010-224 (TecNM / TESChi)',
          claveCarrera: 'ISC',
          totalCreditos: 260,
        };
      case '30':
        return {
          carrera: 'Ingeniería Industrial',
          planEstudios: 'IIND-2010-227 (TecNM / TESChi)',
          claveCarrera: 'IIN',
          totalCreditos: 260,
        };
      case '15':
        return {
          carrera: 'Ingeniería Mecatrónica',
          planEstudios: 'IMCT-2010-229 (TecNM / TESChi)',
          claveCarrera: 'IMC',
          totalCreditos: 260,
        };
      case '21':
        return {
          carrera: 'Licenciatura en Contaduría',
          planEstudios: 'LCON-2010-230 (TecNM / TESChi)',
          claveCarrera: 'LCO',
          totalCreditos: 260,
        };
      case '25':
        return {
          carrera: 'Licenciatura en Gastronomía',
          planEstudios: 'LGAS-2010-231 (TecNM / TESChi)',
          claveCarrera: 'LGA',
          totalCreditos: 260,
        };
      case '48':
        return {
          carrera: 'Ingeniería en Animación Digital y Efectos Visuales',
          planEstudios: 'IADE-2010-232 (TecNM / TESChi)',
          claveCarrera: 'IAD',
          totalCreditos: 260,
        };
      case '16':
      case '60':
        return {
          carrera: 'Ingeniería Química',
          planEstudios: 'IQUI-2010-233 (TecNM / TESChi)',
          claveCarrera: 'IQU',
          totalCreditos: 260,
        };
    }
  }
  return {
    carrera: 'Ingeniería en Sistemas Computacionales',
    planEstudios: 'ISIC-2010-224 (TecNM / TESChi)',
    claveCarrera: 'ISC',
    totalCreditos: 260,
  };
}

/**
 * Obtiene los metadatos de carrera a partir del nombre o texto
 */
export function getCareerMetadata(carreraText?: string): CareerMetadata {
  const norm = normalizeCareer(carreraText);
  switch (norm) {
    case 'administracion':
      return {
        carrera: 'Licenciatura en Administración',
        planEstudios: 'LADM-2010-234 (TecNM / TESChi)',
        claveCarrera: 'LAD',
        totalCreditos: 260,
      };
    case 'industrial':
      return {
        carrera: 'Ingeniería Industrial',
        planEstudios: 'IIND-2010-227 (TecNM / TESChi)',
        claveCarrera: 'IIN',
        totalCreditos: 260,
      };
    case 'mecatronica':
      return {
        carrera: 'Ingeniería Mecatrónica',
        planEstudios: 'IMCT-2010-229 (TecNM / TESChi)',
        claveCarrera: 'IMC',
        totalCreditos: 260,
      };
    case 'contaduria':
      return {
        carrera: 'Licenciatura en Contaduría',
        planEstudios: 'LCON-2010-230 (TecNM / TESChi)',
        claveCarrera: 'LCO',
        totalCreditos: 260,
      };
    case 'gastronomia':
      return {
        carrera: 'Licenciatura en Gastronomía',
        planEstudios: 'LGAS-2010-231 (TecNM / TESChi)',
        claveCarrera: 'LGA',
        totalCreditos: 260,
      };
    case 'animacion':
      return {
        carrera: 'Ingeniería en Animación Digital y Efectos Visuales',
        planEstudios: 'IADE-2010-232 (TecNM / TESChi)',
        claveCarrera: 'IAD',
        totalCreditos: 260,
      };
    case 'quimica':
      return {
        carrera: 'Ingeniería Química',
        planEstudios: 'IQUI-2010-233 (TecNM / TESChi)',
        claveCarrera: 'IQU',
        totalCreditos: 260,
      };
    default:
      return {
        carrera: 'Ingeniería en Sistemas Computacionales',
        planEstudios: 'ISIC-2010-224 (TecNM / TESChi)',
        claveCarrera: 'ISC',
        totalCreditos: 260,
      };
  }
}

/**
 * Estima el semestre académico a cursar basado en los primeros 4 dígitos de la matrícula (Año de Ingreso)
 */
export function estimateSemesterFromMatricula(matricula?: string): { semestreNumero: number; semestreActual: string } {
  const clean = (matricula || '').toString().trim();
  if (clean.length >= 4) {
    const year = parseInt(clean.substring(0, 4), 10);
    if (!isNaN(year)) {
      if (year === 2022) return { semestreNumero: 6, semestreActual: '6º Semestre' };
      if (year === 2023) return { semestreNumero: 4, semestreActual: '4º Semestre' };
      if (year === 2024) return { semestreNumero: 2, semestreActual: '2º Semestre' };
      if (year <= 2021) return { semestreNumero: 9, semestreActual: '9º Semestre' };
      if (year >= 2025) return { semestreNumero: 1, semestreActual: '1º Semestre' };
    }
  }
  return { semestreNumero: 6, semestreActual: '6º Semestre' };
}
