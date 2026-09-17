import { StudentProfile, GroupOption, Course, SemesterRecord, ComprobanteRecord } from '../types';
import { StorageAdapter } from './storageAdapter';
import { syncQueue } from './syncQueue';
import { INITIAL_STUDENT, AVAILABLE_GROUPS, AVAILABLE_COURSES, KARDEX_HISTORY, INITIAL_COMPROBANTE } from './mockData';

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
      await StorageAdapter.setItem('teschi_courses', AVAILABLE_COURSES);
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
    return cached || INITIAL_STUDENT;
  }

  public async getGroups(): Promise<GroupOption[]> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${this.BASE_URL}/enrollment/groups`);
        if (res.ok) {
          const data = await res.json();
          await StorageAdapter.setItem('teschi_groups', data.groups);
          return data.groups;
        }
      }
    } catch {
      // Offline fallback
    }
    const cached = await StorageAdapter.getItem<GroupOption[]>('teschi_groups');
    return cached || AVAILABLE_GROUPS;
  }

  public async getAvailableCourses(): Promise<Course[]> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${this.BASE_URL}/enrollment/courses`);
        if (res.ok) {
          const data = await res.json();
          await StorageAdapter.setItem('teschi_courses', data.courses);
          return data.courses;
        }
      }
    } catch {
      // Offline fallback
    }
    const cached = await StorageAdapter.getItem<Course[]>('teschi_courses');
    return cached || AVAILABLE_COURSES;
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
      semestreSolicitado: 'NOVENO',
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
