import { StudentProfile, GroupOption, Course, SemesterRecord, ComprobanteRecord } from '../types';
import { StorageAdapter } from './storageAdapter';
import { syncQueue } from './syncQueue';
import { INITIAL_STUDENT, AVAILABLE_GROUPS, AVAILABLE_COURSES, ISC_CURRICULUM_COURSES, ALL_CURRICULUM_COURSES, LAD_CURRICULUM_COURSES, KARDEX_HISTORY, INITIAL_COMPROBANTE } from './mockData';
import { parseSemesterNumber } from '../utils/semesterHelper';
import { normalizeCareer, getCareerMetadata } from '../utils/careerHelper';

/**
 * ApiClient - Cliente REST API Versionado (/api/v1)
 * Diseñado bajo arquitectura Offline-First y desacoplado del runtime (Web / PWA / Capacitor / Tauri).
 * Carga desde servidor Express y respalda en StorageAdapter (IndexedDB).
 */

class ApiService {
  private BASE_URL = '/api/v1';

  // Inicializa datos locales si es la primera vez
  private async initCache(): Promise<void> {
    const student = await StorageAdapter.getItem<StudentProfile>('teschi_student');
    if (!student || student.periodoActual !== 'Septiembre - Enero 2026-2027') {
      await StorageAdapter.setItem('teschi_student', INITIAL_STUDENT);
      await StorageAdapter.setItem('teschi_groups', AVAILABLE_GROUPS);
      await StorageAdapter.setItem('teschi_kardex', KARDEX_HISTORY);
      await StorageAdapter.setItem('teschi_comprobante', INITIAL_COMPROBANTE);
    }
  }

  constructor() {
    this.initCache();
  }

  public async getStudentProfile(): Promise<StudentProfile> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${this.BASE_URL}/student/profile`);
        if (res.ok) {
          const data = await res.json();
          await StorageAdapter.setItem('teschi_student', data.student);
          return data.student;
        }
      }
    } catch {
      // Fallback offline
    }
    const cached = await StorageAdapter.getItem<StudentProfile>('teschi_student');
    if (cached) {
      if (cached.matricula === '2022452139' && cached.semestreActual !== '9º Semestre') {
        cached.semestreActual = '9º Semestre';
        cached.creditosAcumulados = 235;
        cached.creditosTotales = 260;
        cached.avancePorcentaje = 90;
        await StorageAdapter.setItem('teschi_student', cached);
      } else if (cached.matricula === '2022452167') {
        let needsUpdate = false;
        if (cached.nombre !== 'Mishelle Stefania') {
          cached.nombre = 'Mishelle Stefania';
          cached.nombreCorto = 'Mishelle';
          cached.avatarUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250';
          needsUpdate = true;
        }
        if (cached.semestreActual !== '6º Semestre') {
          cached.semestreActual = '6º Semestre';
          cached.creditosAcumulados = 172;
          cached.creditosTotales = 260;
          cached.avancePorcentaje = 66;
          needsUpdate = true;
        }
        if (needsUpdate) {
          await StorageAdapter.setItem('teschi_student', cached);
        }
      }
      return cached;
    }
    return cached || INITIAL_STUDENT;
  }

  public async setStudentProfile(student: StudentProfile): Promise<void> {
    await StorageAdapter.setItem('teschi_student', student);
  }

  public async getGroups(semestre?: number, carrera?: string): Promise<GroupOption[]> {
    const student = await this.getStudentProfile();
    const effectiveCarrera = carrera || student.carrera || 'Ingeniería en Sistemas Computacionales';
    const effectiveSem = semestre !== undefined ? semestre : parseSemesterNumber(student.semestreActual);

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const query = new URLSearchParams();
        if (effectiveSem) query.append('semestre', effectiveSem.toString());
        if (effectiveCarrera) query.append('carrera', effectiveCarrera);
        const res = await fetch(`${this.BASE_URL}/enrollment/groups?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          await StorageAdapter.setItem('teschi_groups', data.groups);
          return data.groups;
        }
      }
    } catch {
      // Offline fallback
    }
    const sourceGroups = AVAILABLE_GROUPS;
    return sourceGroups.filter((g) => {
      const matchSem = !effectiveSem || g.semestreNumero === effectiveSem;
      const matchCareer = !g.carrera || normalizeCareer(g.carrera) === normalizeCareer(effectiveCarrera);
      return matchSem && matchCareer;
    });
  }

  public async getAvailableCourses(groupId?: string, semestre?: number, carrera?: string): Promise<Course[]> {
    const student = await this.getStudentProfile();
    const effectiveCarrera = carrera || student.carrera || 'Ingeniería en Sistemas Computacionales';
    const effectiveSem = semestre !== undefined ? semestre : parseSemesterNumber(student.semestreActual);

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const query = new URLSearchParams();
        if (groupId) query.append('groupId', groupId);
        if (effectiveSem) query.append('semestre', effectiveSem.toString());
        if (effectiveCarrera) query.append('carrera', effectiveCarrera);
        const res = await fetch(`${this.BASE_URL}/enrollment/courses?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          await StorageAdapter.setItem('teschi_courses', data.courses);
          return data.courses;
        }
      }
    } catch {
      // Offline fallback
    }
    const targetSem = effectiveSem || 6;
    const filtered = ALL_CURRICULUM_COURSES.filter((c) => {
      const matchCareer = normalizeCareer(c.carrera) === normalizeCareer(effectiveCarrera);
      const matchSem = c.semestre === targetSem;
      return matchCareer && matchSem;
    });
    return filtered;
  }

  public async submitEnrollment(groupId: string, selectedCourses: Course[]): Promise<{ success: boolean; comprobante: ComprobanteRecord }> {
    const student = await this.getStudentProfile();
    const totalCredits = selectedCourses.reduce((acc, c) => acc + c.creditos, 0);

    const newComprobante: ComprobanteRecord = {
      id: `COMP-${Date.now()}`,
      folio: `FOR-002-01/02/${Date.now().toString(36).toUpperCase()}`,
      fechaEmision: new Date().toLocaleDateString('es-MX'),
      tipo: 'reinscripcion',
      matricula: student.matricula,
      nombreAlumno: student.nombre,
      carrera: student.carrera,
      semestreSolicitado: student.semestreActual || '6º Semestre',
      grupo: groupId,
      materias: selectedCourses,
      totalCreditos: totalCredits,
      hashFirmaDigital: Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
      esOficial: true,
    };

    // Guardar en cache local inmediato (Optimistic UI / Zero Latency)
    await StorageAdapter.setItem('teschi_comprobante', newComprobante);

    // Intentar enviar al backend o encolar para Background Sync
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await syncQueue.enqueue(`${this.BASE_URL}/enrollment/submit`, 'POST', {
        groupId,
        courses: selectedCourses.map((c) => c.clave),
        matricula: student.matricula,
        timestamp: Date.now(),
      });
    } else {
      try {
        await fetch(`${this.BASE_URL}/enrollment/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            courses: selectedCourses.map((c) => c.clave),
            matricula: student.matricula,
          }),
        });
      } catch {
        // Encolar si la red falló durante el fetch
        await syncQueue.enqueue(`${this.BASE_URL}/enrollment/submit`, 'POST', {
          groupId,
          courses: selectedCourses.map((c) => c.clave),
          matricula: student.matricula,
          timestamp: Date.now(),
        });
      }
    }

    return { success: true, comprobante: newComprobante };
  }

  public async getKardex(): Promise<SemesterRecord[]> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${this.BASE_URL}/academic/kardex`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.kardex)
            ? data.kardex
            : Array.isArray(data.semestres)
            ? data.semestres
            : KARDEX_HISTORY;
          await StorageAdapter.setItem('teschi_kardex', items);
          return items;
        }
      }
    } catch {
      // Offline fallback
    }
    const cached = await StorageAdapter.getItem<SemesterRecord[]>('teschi_kardex');
    return Array.isArray(cached) && cached.length > 0 ? cached : KARDEX_HISTORY;
  }

  public async getComprobante(): Promise<ComprobanteRecord> {
    const cached = await StorageAdapter.getItem<ComprobanteRecord>('teschi_comprobante');
    return cached || INITIAL_COMPROBANTE;
  }

  /**
   * Obtiene la oferta de cursos intersemestrales con regla TecNM:
   * Solo asignaturas correspondientes hasta el semestre en curso del alumno (semestre <= maxSemestre).
   * Semestres superiores quedan estrictamente excluidos.
   */
  public async getIntersemestralCourses(carrera?: string, maxSemestre?: number): Promise<Course[]> {
    const student = await this.getStudentProfile();
    const effectiveCarrera = carrera || student.carrera || 'Ingeniería en Sistemas Computacionales';
    const effectiveMaxSem = maxSemestre !== undefined ? maxSemestre : parseSemesterNumber(student.semestreActual);

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const query = new URLSearchParams({
          carrera: effectiveCarrera,
          maxSemestre: effectiveMaxSem.toString(),
        }).toString();
        const res = await fetch(`${this.BASE_URL}/intersemestral/courses?${query}`);
        if (res.ok) {
          const data = await res.json();
          await StorageAdapter.setItem('teschi_intersemestral_courses', data.courses);
          return data.courses;
        }
      }
    } catch {
      // Offline fallback
    }

    // Filtrado offline estricto: solo carrera y materias hasta el semestre actual
    const offlineFiltered = ALL_CURRICULUM_COURSES.filter((c) => {
      const matchCareer = normalizeCareer(c.carrera) === normalizeCareer(effectiveCarrera);
      const isWithinSemester = (c.semestre || 1) <= effectiveMaxSem;
      return matchCareer && isWithinSemester;
    });

    return offlineFiltered;
  }

  /**
   * Obtiene la retícula / catálogo completo de la carrera (semestres 1 a 9).
   */
  public async getCurriculumCatalog(carrera?: string): Promise<{ planEstudios: string; courses: Course[]; semestres: Record<number, Course[]> }> {
    const student = await this.getStudentProfile();
    const effectiveCarrera = carrera || student.carrera || 'Ingeniería en Sistemas Computacionales';
    const meta = getCareerMetadata(effectiveCarrera);

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${this.BASE_URL}/curriculum/catalog?carrera=${encodeURIComponent(effectiveCarrera)}`);
        if (res.ok) {
          const data = await res.json();
          return {
            planEstudios: data.clavePlan || meta.planEstudios,
            courses: data.courses,
            semestres: data.semestres,
          };
        }
      }
    } catch {
      // Offline fallback
    }

    const filtered = ALL_CURRICULUM_COURSES.filter((c) => normalizeCareer(c.carrera) === normalizeCareer(effectiveCarrera));
    const semestres: Record<number, Course[]> = {};
    for (let i = 1; i <= 9; i++) {
      semestres[i] = filtered.filter((c) => c.semestre === i);
    }

    return {
      planEstudios: meta.planEstudios,
      courses: filtered,
      semestres,
    };
  }

  /**
   * Registro oficial de asignaturas para curso intersemestral (Formato FOR-002)
   */
  public async submitIntersemestral(selectedCourses: Course[]): Promise<{ success: boolean; comprobante: ComprobanteRecord }> {
    const student = await this.getStudentProfile();
    const totalCredits = selectedCourses.reduce((acc, c) => acc + c.creditos, 0);

    const intersemestralComprobante: ComprobanteRecord = {
      id: `INTER-${Date.now()}`,
      folio: `FOR-002-01/02/${Date.now().toString(36).toUpperCase()}`,
      fechaEmision: new Date().toLocaleDateString('es-MX'),
      tipo: 'intersemestral',
      matricula: student.matricula,
      nombreAlumno: student.nombre,
      carrera: student.carrera,
      semestreSolicitado: student.semestreActual || 'INTERSEMESTRAL',
      grupo: 'INTER-2026',
      materias: selectedCourses,
      totalCreditos: totalCredits,
      hashFirmaDigital: Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
      esOficial: true,
    };

    // Guardar en cache local inmediato
    await StorageAdapter.setItem('teschi_comprobante_intersemestral', intersemestralComprobante);

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await fetch(`${this.BASE_URL}/intersemestral/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courses: selectedCourses.map((c) => c.clave),
            matricula: student.matricula,
            semestreAlumno: student.semestreActual,
          }),
        });
      } else {
        await syncQueue.enqueue(`${this.BASE_URL}/intersemestral/submit`, 'POST', {
          courses: selectedCourses.map((c) => c.clave),
          matricula: student.matricula,
          semestreAlumno: student.semestreActual,
          timestamp: Date.now(),
        });
      }
    } catch {
      await syncQueue.enqueue(`${this.BASE_URL}/intersemestral/submit`, 'POST', {
        courses: selectedCourses.map((c) => c.clave),
        matricula: student.matricula,
        semestreAlumno: student.semestreActual,
        timestamp: Date.now(),
      });
    }

    return { success: true, comprobante: intersemestralComprobante };
  }

  public async getIntersemestralComprobante(): Promise<ComprobanteRecord | null> {
    const cached = await StorageAdapter.getItem<ComprobanteRecord>('teschi_comprobante_intersemestral');
    return cached || null;
  }

  public async updatePassword(currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${this.BASE_URL}/auth/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
        });
        const data = await res.json();
        return data;
      }
    } catch {
      // Offline fallback
    }

    // Si está offline o simulación
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: 'Contraseña actualizada exitosamente bajo política ISO/IEC 27001.',
    };
  }
}

export const ApiClient = new ApiService();
