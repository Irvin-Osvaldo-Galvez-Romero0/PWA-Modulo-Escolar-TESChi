import { BiometricAuthResult, StudentProfile } from '../types';
import { StorageAdapter } from './storageAdapter';
import { BiometricsAdapter } from './biometricsAdapter';
import { detectCareerFromMatricula } from '../utils/careerHelper';

/**
 * AuthService - Servicios de Autenticación y Seguridad
 * Cumplimiento estricto ISO/IEC 27001:2022 (Gestión de Identidad y Criptografía)
 * e ISO 9241-110 (Manejo de errores y retroalimentación ergonómica).
 */

export class AuthService {
  private static FAILED_ATTEMPTS_KEY = 'teschi_auth_failed_attempts';
  private static LOCKOUT_TIME_KEY = 'teschi_auth_lockout_until';
  private static BIOMETRIC_KEY = 'teschi_biometric_registered';

  /**
   * Valida la existencia del estudiante y obtiene sus métodos registrados
   * Endpoint: POST /api/v1/auth/verify-student
   */
  public static async verifyStudent(matricula: string): Promise<{
    exists: boolean;
    registeredMethods: string[];
    matricula?: string;
    nombre?: string;
    carrera?: string;
    tieneNip?: boolean;
    message?: string;
  }> {
    const cleanMatricula = matricula.trim();
    if (!cleanMatricula) {
      return {
        exists: false,
        registeredMethods: [],
        message: 'Por favor, ingresa tu matrícula o número de control.',
      };
    }

    try {
      const res = await fetch('/api/v1/auth/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula: cleanMatricula }),
      });
      const data = await res.json();
      if (res.ok && data.exists) {
        return {
          exists: true,
          registeredMethods: data.registeredMethods || ['password', 'pin'],
          matricula: data.matricula || cleanMatricula,
          nombre: data.nombre || '',
          carrera: data.carrera || '',
          tieneNip: Boolean(data.tieneNip),
          message: data.message,
        };
      }
      return {
        exists: false,
        registeredMethods: [],
        message: data.message || 'Matrícula o usuario no localizado en el sistema escolar.',
      };
    } catch (err: any) {
      return {
        exists: false,
        registeredMethods: [],
        message: 'Error al contactar el servicio escolar: ' + (err.message || ''),
      };
    }
  }

  /**
   * Valida la autenticación con NIP Institucional contra la API oficial del SIIA TESChi
   * Swagger: POST /nip.ashx (accion: 'verificar')
   */
  public static async authenticateNip(
    param1: string | { matricula?: string; nip: string },
    param2?: string
  ): Promise<{
    success: boolean;
    message: string;
    student?: StudentProfile;
    token?: string;
    usuario?: any;
  }> {
    const lockout = await this.checkLockout();
    if (lockout.locked) {
      return {
        success: false,
        message: `Cuenta bloqueada temporalmente por seguridad. Reintenta en ${lockout.remainingSeconds}s.`,
      };
    }

    let matricula = '';
    let nip = '';

    if (typeof param1 === 'string') {
      matricula = param1.trim();
      nip = (param2 || '').trim();
    } else {
      matricula = (param1.matricula || '').trim();
      nip = (param1.nip || '').trim();
    }

    if (!nip) {
      return {
        success: false,
        message: 'Por favor, ingresa tu NIP institucional de 4 dígitos.',
      };
    }

    if (nip.length !== 4 || !/^\d{4}$/.test(nip)) {
      return {
        success: false,
        message: 'El NIP institucional debe contener exactamente 4 dígitos numéricos.',
      };
    }

    try {
      const res = await fetch('/api/v1/auth/nip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'verificar',
          matricula,
          usuario: matricula,
          nip,
          pin: nip,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await this.resetFailedAttempts();

        if (data.token) {
          await StorageAdapter.setItem('teschi_siia_token', data.token);
        }
        if (data.usuario) {
          await StorageAdapter.setItem('teschi_siia_user', data.usuario);
        }
        if (data.student) {
          await StorageAdapter.setItem('teschi_student', data.student);
        }

        return {
          success: true,
          message: data.message || 'Acceso autorizado con NIP institucional.',
          student: data.student,
          token: data.token,
          usuario: data.usuario,
        };
      }

      const attempts = await this.recordFailedAttempt();
      return {
        success: false,
        message: data.message || `NIP incorrecto en el sistema escolar. Intento ${attempts} de 5 antes del bloqueo.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Error al contactar con el servidor escolar: ' + (err.message || ''),
      };
    }
  }

  /**
   * Configura un nuevo NIP institucional de 4 dígitos para usuarios primerizos
   * Swagger: POST /nip.ashx (accion: 'configurar')
   */
  public static async configureNip(params: {
    tempToken: string;
    nuevoNip: string;
    confirmarNip: string;
    matricula?: string;
  }): Promise<{
    success: boolean;
    message: string;
    student?: StudentProfile;
    token?: string;
  }> {
    try {
      const res = await fetch('/api/v1/auth/nip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'configurar',
          tempToken: params.tempToken,
          nuevoNip: params.nuevoNip,
          confirmarNip: params.confirmarNip,
          usuario: params.matricula,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          await StorageAdapter.setItem('teschi_siia_token', data.token);
        }
        if (data.usuario) {
          await StorageAdapter.setItem('teschi_siia_user', data.usuario);
        }
        if (data.student) {
          await StorageAdapter.setItem('teschi_student', data.student);
        }

        return {
          success: true,
          message: data.message || 'NIP institucional configurado exitosamente.',
          student: data.student,
          token: data.token,
        };
      }

      return {
        success: false,
        message: data.message || 'No fue posible registrar el nuevo NIP.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Error de conexión con el servidor escolar: ' + (err.message || ''),
      };
    }
  }

  /**
   * Alias de compatibilidad para autenticación con PIN / NIP
   */
  public static async authenticatePin(
    matricula: string,
    pin: string
  ): Promise<{ success: boolean; message: string; student?: StudentProfile; token?: string; usuario?: any }> {
    return this.authenticateNip(matricula, pin);
  }

  /**
   * Valida la entropía de la contraseña bajo directrices ISO/IEC 27001
   */
  public static evaluatePasswordEntropy(password: string): {
    score: number; // 0 a 100
    level: 'Débil' | 'Aceptable' | 'Robusta' | 'Excelente';
    hasMinLength: boolean;
    hasNumber: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasSpecial: boolean;
    feedback: string;
  } {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (hasNumber) score += 15;
    if (hasUpper) score += 15;
    if (hasLower) score += 15;
    if (hasSpecial) score += 15;

    let level: 'Débil' | 'Aceptable' | 'Robusta' | 'Excelente' = 'Débil';
    let feedback = 'Mínimo 8 caracteres, números y símbolos.';

    if (score >= 85) {
      level = 'Excelente';
      feedback = 'Contraseña altamente segura bajo norma ISO/IEC 27001.';
    } else if (score >= 70) {
      level = 'Robusta';
      feedback = 'Cumple con los requisitos de seguridad institucional.';
    } else if (score >= 40) {
      level = 'Aceptable';
      feedback = 'Agrega caracteres especiales o números para mayor solidez.';
    }

    return {
      score: Math.min(score, 100),
      level,
      hasMinLength,
      hasNumber,
      hasUpper,
      hasLower,
      hasSpecial,
      feedback,
    };
  }

  /**
   * Invoca BiometricsAdapter.verify() para autenticación biométrica multiplataforma
   */
  public static async authenticateBiometrics(reason: string = 'Confirmar identidad académica'): Promise<BiometricAuthResult> {
    const res = await BiometricsAdapter.verify(reason);
    if (res.success) {
      await StorageAdapter.setItem(this.BIOMETRIC_KEY, true);
    }
    return res;
  }

  public static async isBiometricsConfigured(): Promise<boolean> {
    const configured = await StorageAdapter.getItem<boolean>(this.BIOMETRIC_KEY);
    return !!configured;
  }

  /**
   * Autenticación en tiempo real contra la API Oficial del SIIA TESChi (https://siia.teschi.edu.mx)
   * Vía BFF Proxy con token Bearer de 480 min y consulta a base de datos de producción.
   */
  public static async authenticateSiia(
    usuario: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: any; token?: string; student?: StudentProfile }> {
    const cleanUser = usuario.trim();
    if (!cleanUser || !password) {
      return {
        success: false,
        message: 'Ingresa tu usuario institucional y contraseña.',
      };
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch('/api/v1/auth/siia-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario: cleanUser, password }),
        });

        const data = await res.json();
        if (data.ok && data.token && data.usuario) {
          await StorageAdapter.setItem('teschi_siia_token', data.token);
          await StorageAdapter.setItem('teschi_siia_user', data.usuario);

          const studentProfile = {
            matricula: data.usuario.numUsuario || data.usuario.usuario || cleanUser,
            nombre: data.usuario.nombreCompleto || `${data.usuario.nombre || ''} ${data.usuario.paterno || ''}`.trim(),
            nombreCorto: data.usuario.nombre || cleanUser,
            carrera: data.usuario.area || 'Departamento de Ciencias Básicas',
            periodoActual: 'Septiembre - Enero 2026-2027',
            semestreActual: data.usuario.tipo || 'DOCENTE',
            promedioGeneral: 10.0,
            creditosAcumulados: 350,
            creditosTotales: 350,
            avancePorcentaje: 100,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            email: data.usuario.correo || `${cleanUser}@teschi.edu.mx`,
            status: 'regular' as const,
            biometricsRegistered: true,
          };
          await StorageAdapter.setItem('teschi_student', studentProfile);

          return {
            success: true,
            message: data.mensaje || 'Autenticación exitosa en SIIA TESChi.',
            user: data.usuario,
            token: data.token,
            student: studentProfile,
          };
        } else {
          return {
            success: false,
            message: data.mensaje || 'Usuario o contraseña incorrectos en el sistema SIIA TESChi.',
          };
        }
      } else {
        return {
          success: false,
          message: 'Sin conexión a internet. La validación en vivo con el SIIA requiere conexión inicial.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'No fue posible contactar con el servidor central de TESChi: ' + (err.message || ''),
      };
    }
  }

  public static async getSiiaToken(): Promise<string | null> {
    return await StorageAdapter.getItem<string>('teschi_siia_token');
  }

  public static async getSiiaUser(): Promise<any | null> {
    return await StorageAdapter.getItem<any>('teschi_siia_user');
  }

  public static async authenticatePassword(
    matricula: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    student?: StudentProfile;
    token?: string;
    usuario?: any;
  }> {
    const lockout = await this.checkLockout();
    if (lockout.locked) {
      return {
        success: false,
        message: `Cuenta bloqueada temporalmente por intentos fallidos. Reintenta en ${lockout.remainingSeconds}s.`,
      };
    }

    const cleanMatricula = matricula.trim();
    if (!cleanMatricula || !password) {
      return {
        success: false,
        message: 'Por favor, ingresa tu matrícula o usuario y tu contraseña institucional.',
      };
    }

    try {
      const res = await fetch('/api/v1/auth/login-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: cleanMatricula,
          usuario: cleanMatricula,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.student) {
        await this.resetFailedAttempts();

        if (data.token) {
          await StorageAdapter.setItem('teschi_siia_token', data.token);
        }
        if (data.usuario) {
          await StorageAdapter.setItem('teschi_siia_user', data.usuario);
        }
        await StorageAdapter.setItem('teschi_student', data.student);

        return {
          success: true,
          message: data.message || 'Acceso autorizado correctamente.',
          student: data.student,
          token: data.token,
          usuario: data.usuario,
        };
      }

      const attempts = await this.recordFailedAttempt();
      return {
        success: false,
        message: data.message || `Usuario o contraseña incorrectos. Intento ${attempts} de 5 antes del bloqueo.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Error de comunicación con el servidor central SIIA TESChi: ' + (err.message || ''),
      };
    }
  }

  /**
   * Cierre de sesión seguro: Limpia credenciales locales y sesión en backend
   */
  public static async logout(): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
      }
    } catch {}
    await StorageAdapter.removeItem('teschi_student');
    await StorageAdapter.removeItem('teschi_siia_token');
    await StorageAdapter.removeItem('teschi_siia_user');
  }

  public static async checkLockout(): Promise<{ locked: boolean; remainingSeconds: number }> {
    const lockoutUntil = (await StorageAdapter.getItem<number>(this.LOCKOUT_TIME_KEY)) || 0;
    const now = Date.now();
    if (lockoutUntil > now) {
      return {
        locked: true,
        remainingSeconds: Math.ceil((lockoutUntil - now) / 1000),
      };
    }
    if (lockoutUntil > 0 && lockoutUntil <= now) {
      await this.resetFailedAttempts();
    }
    return { locked: false, remainingSeconds: 0 };
  }

  public static async recordFailedAttempt(): Promise<number> {
    const current = ((await StorageAdapter.getItem<number>(this.FAILED_ATTEMPTS_KEY)) || 0) + 1;
    await StorageAdapter.setItem(this.FAILED_ATTEMPTS_KEY, current);

    // Si excede 5 intentos, aplicar bloqueo preventivo de 60 segundos
    if (current >= 5) {
      const lockoutUntil = Date.now() + 60 * 1000;
      await StorageAdapter.setItem(this.LOCKOUT_TIME_KEY, lockoutUntil);
    }
    return current;
  }

  public static async resetFailedAttempts(): Promise<void> {
    await StorageAdapter.removeItem(this.FAILED_ATTEMPTS_KEY);
    await StorageAdapter.removeItem(this.LOCKOUT_TIME_KEY);
  }

  public static async clearLockout(): Promise<void> {
    await this.resetFailedAttempts();
  }
}
