/**
 * Utilidades para normalización y filtrado académico de semestres conforme a normativas TecNM / TESChi.
 */

export function parseSemesterNumber(semText?: string | number | null): number {
  if (semText === undefined || semText === null) return 4;
  if (typeof semText === 'number') return semText;
  
  const match = semText.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  
  const lower = semText.toLowerCase().trim();
  if (lower.includes('primer')) return 1;
  if (lower.includes('segund')) return 2;
  if (lower.includes('tercer')) return 3;
  if (lower.includes('cuart')) return 4;
  if (lower.includes('quint')) return 5;
  if (lower.includes('sext')) return 6;
  if (lower.includes('sépt') || lower.includes('sept')) return 7;
  if (lower.includes('octav')) return 8;
  if (lower.includes('noven')) return 9;
  if (lower.includes('docente') || lower.includes('profesor')) return 9;
  
  return 4; // Valor por defecto seguro para alumnos en periodo intermedio
}

export function formatSemesterOrdinal(num: number): string {
  switch (num) {
    case 1: return '1º Semestre';
    case 2: return '2º Semestre';
    case 3: return '3º Semestre';
    case 4: return '4º Semestre';
    case 5: return '5º Semestre';
    case 6: return '6º Semestre';
    case 7: return '7º Semestre';
    case 8: return '8º Semestre';
    case 9: return '9º Semestre';
    default: return `${num}º Semestre`;
  }
}
