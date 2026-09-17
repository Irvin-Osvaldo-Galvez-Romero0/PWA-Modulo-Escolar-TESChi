export interface StudentProfile {
  matricula: string;
  nombre: string;
  nombreCorto: string;
  carrera: string;
  periodoActual: string;
  semestreActual: string;
  promedioGeneral: number;
  creditosAcumulados: number;
  creditosTotales: number;
  avancePorcentaje: number;
  avatarUrl: string;
  email: string;
  status: 'regular' | 'irregular';
  biometricsRegistered: boolean;
}

export interface GroupOption {
  id: string;
  nombre: string;
  turno: 'Matutino' | 'Vespertino' | 'Mixto';
  horarioResumen: string;
  cupoDisponible: number;
  cupoMaximo: number;
  semestre: string;
}

export interface Course {
  clave: string;
  nombre: string;
  creditos: number;
  profesor: string;
  dias: string;
  horario: string;
  aula?: string;
  semestre?: number;
  calificacion?: number;
  tipoEvaluacion?: 'Ordinario' | 'Extraordinario' | 'Especial';
}

export interface SemesterRecord {
  id: string;
  semestreTitulo: string;
  periodoNombre: string;
  numMaterias: number;
  materias: Course[];
  enCurso: boolean;
  promedioSemestral?: number;
}

export interface ComprobanteRecord {
  id: string;
  folio: string;
  fechaEmision: string;
  tipo: 'reinscripcion' | 'intersemestral';
  matricula: string;
  nombreAlumno: string;
  carrera: string;
  semestreSolicitado: string;
  grupo: string;
  materias: Course[];
  totalCreditos: number;
  hashFirmaDigital: string;
  esOficial: boolean;
}

export type PlatformTarget = 'pwa' | 'mobile' | 'desktop';

export interface QueuedSyncItem {
  id: string;
  timestamp: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: Record<string, unknown>;
  retryCount: number;
  synced: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  message: string;
  credentialId?: string;
  methodUsed: 'WebAuthn' | 'CapacitorBiometrics' | 'TauriWindowsHello' | 'Simulation';
}
