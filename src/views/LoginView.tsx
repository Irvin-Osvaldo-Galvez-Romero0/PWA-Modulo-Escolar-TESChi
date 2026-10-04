import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Delete,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { BiometricsAdapter } from '../services/biometricsAdapter';
import { TeschiLogo } from '../components/TeschiLogo';
import { StudentProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (student: StudentProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Estado del flujo de verificación (Alumnos y Docentes - Conexión directa a API SIIA TESChi)
  const [step, setStep] = useState<'verify' | 'authenticate'>('verify');
  const [matricula, setMatricula] = useState('');
  const [studentInfo, setStudentInfo] = useState<{
    nombre?: string;
    carrera?: string;
    registeredMethods: string[];
    tieneNip?: boolean;
  }>({
    registeredMethods: ['password', 'pin'],
  });

  // Tokens temporales del SIIA (Paso 1 -> Paso 2)
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Métodos de autenticación
  const [activeMethod, setActiveMethod] = useState<'password' | 'pin'>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');

  // Estados de carga y feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const matriculaInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<string>('');
  const isSubmittingPinRef = useRef<boolean>(false);
  const pinSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 'verify' && matriculaInputRef.current) {
      matriculaInputRef.current.focus();
    } else if (step === 'authenticate') {
      if (activeMethod === 'password' && passwordInputRef.current) {
        passwordInputRef.current.focus();
      } else if (activeMethod === 'pin' && pinInputRef.current) {
        pinInputRef.current.focus();
      }
    }
  }, [step, activeMethod]);

  // Actualización reactiva e inmediata del PIN
  const updatePin = (newVal: string) => {
    if (loading || isSubmittingPinRef.current) return;
    const sanitized = newVal.replace(/\D/g, '').slice(0, 4);
    setPin(sanitized);
    pinRef.current = sanitized;
    setErrorMsg(null);
    BiometricsAdapter.triggerHaptic(20);

    if (pinSubmitTimeoutRef.current) {
      clearTimeout(pinSubmitTimeoutRef.current);
      pinSubmitTimeoutRef.current = null;
    }

    if (sanitized.length === 4) {
      pinSubmitTimeoutRef.current = setTimeout(() => {
        triggerPinLogin(sanitized);
      }, 150);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pinRef.current.length < 4) {
      updatePin(pinRef.current + digit);
    }
  };

  const handlePinBackspace = () => {
    if (pinRef.current.length > 0) {
      updatePin(pinRef.current.slice(0, -1));
    }
  };

  // Manejo de teclado físico y eventos globales para el PIN
  useEffect(() => {
    if (step !== 'authenticate' || activeMethod !== 'pin') return;

    const timer = setTimeout(() => pinInputRef.current?.focus(), 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si el foco está en el input nativo invisible, dejamos que onChange procese
      if (document.activeElement === pinInputRef.current) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (pinRef.current.length === 4) {
            triggerPinLogin(pinRef.current);
          } else {
            setErrorMsg('Ingresa los 4 dígitos de tu NIP institucional.');
          }
        }
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlePinBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pinRef.current.length === 4) {
          triggerPinLogin(pinRef.current);
        } else {
          setErrorMsg('Ingresa los 4 dígitos de tu NIP institucional.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (pinSubmitTimeoutRef.current) {
        clearTimeout(pinSubmitTimeoutRef.current);
      }
    };
  }, [step, activeMethod]);

  // Paso 1: Verificación de Matrícula o Usuario Institucional (GET /nip.ashx?usuario={usuario})
  const handleVerifyMatricula = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    BiometricsAdapter.triggerHaptic(30);

    const clean = matricula.trim();
    if (!clean) {
      setErrorMsg('Ingresa tu matrícula o usuario institucional.');
      return;
    }

    setLoading(true);
    const result = await AuthService.verifyStudent(clean);
    setLoading(false);

    if (result.exists) {
      const methods = (result.registeredMethods || []).filter((m) => m !== 'biometric');
      const availableMethods = methods.length ? methods : ['password', 'pin'];
      setStudentInfo({
        nombre: result.nombre || '',
        carrera: result.carrera || 'Comunidad Académica TESChi',
        registeredMethods: availableMethods,
        tieneNip: result.tieneNip,
      });
      setTempToken(null);
      setPassword('');
      setPin('');
      pinRef.current = '';
      setActiveMethod('password');
      setStep('authenticate');
      BiometricsAdapter.triggerHaptic([30, 40]);
    } else {
      setErrorMsg(result.message || 'Matrícula o usuario no localizado en el sistema escolar.');
      BiometricsAdapter.triggerHaptic([100, 50, 100]);
    }
  };

  // Paso 2A: Login con Contraseña Institucional (POST /login.ashx)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    setLoading(true);
    BiometricsAdapter.triggerHaptic(40);

    const result = await AuthService.authenticatePassword(matricula, password);
    setLoading(false);

    if (result.success && result.student) {
      setSuccessNotice(`Bienvenido(a), ${result.student.nombreCorto || result.student.nombre}`);
      BiometricsAdapter.triggerHaptic([40, 50, 60]);
      setTimeout(() => onLoginSuccess(result.student!), 400);
    } else {
      setErrorMsg(result.message);
      BiometricsAdapter.triggerHaptic([80, 50, 80]);
    }
  };

  // Paso 2B: Ejecución segura del login con NIP institucional (sin colisiones ni estados obsoletos)
  const triggerPinLogin = async (pinValue: string) => {
    if (isSubmittingPinRef.current || loading) return;
    if (pinSubmitTimeoutRef.current) {
      clearTimeout(pinSubmitTimeoutRef.current);
      pinSubmitTimeoutRef.current = null;
    }

    const cleanPin = (pinValue || pinRef.current).trim();
    if (!cleanPin || cleanPin.length !== 4) {
      setErrorMsg('Ingresa los 4 dígitos de tu NIP institucional.');
      return;
    }

    isSubmittingPinRef.current = true;
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await AuthService.authenticatePin(matricula, cleanPin);
      if (result.success && result.student) {
        setSuccessNotice(`Bienvenido(a), ${result.student.nombreCorto || result.student.nombre}`);
        BiometricsAdapter.triggerHaptic([30, 50, 40]);
        setTimeout(() => onLoginSuccess(result.student!), 350);
      } else {
        setErrorMsg(result.message);
        setPin('');
        pinRef.current = '';
        BiometricsAdapter.triggerHaptic([80, 40, 80]);
        setTimeout(() => pinInputRef.current?.focus(), 80);
      }
    } catch (err: any) {
      setErrorMsg('Error de comunicación al verificar NIP: ' + (err.message || ''));
      setPin('');
      pinRef.current = '';
    } finally {
      setLoading(false);
      isSubmittingPinRef.current = false;
    }
  };

  const handlePinSubmit = () => {
    if (pinRef.current.length === 4) {
      triggerPinLogin(pinRef.current);
    } else {
      setErrorMsg('Ingresa los 4 dígitos de tu NIP institucional.');
      pinInputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4 pt-safe pb-safe">
      {/* Tarjeta Institucional Centrada (max-w-md en Desktop / Formulario Vertical Fluido en Mobile/PWA) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/90 space-y-6 relative overflow-hidden"
      >
        {/* Marca de agua decorativa institucional de fondo */}
        <div className="absolute -right-4 -top-4 w-36 opacity-[0.06] pointer-events-none text-[#012d1d]">
          <TeschiLogo variant="symbol" size="lg" />
        </div>

        {/* Encabezado Institucional TESChi con Logo Oficial */}
        <div className="text-center space-y-2 relative">
          <div className="flex justify-center pb-1">
            <TeschiLogo variant="full" size="lg" className="max-w-[280px]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#191c1d] tracking-tight">
              Servicios Escolares
            </h1>
            <p className="text-xs text-[#414844] mt-0.5">
              Portal Institucional • Acceso Escolar
            </p>
          </div>
        </div>

        {/* Indicador Institucional Alumnos - Conexión API Activa */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0f3f1] text-[#012d1d] text-xs font-semibold border border-gray-200">
            <GraduationCap className="w-4 h-4 text-[#1b4332]" />
            <span>Padrón de Alumnos • Ciencias Básicas</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="API Conectada"></span>
          </div>
        </div>

        {/* Notificación de Error o Éxito */}
        {errorMsg && (
          <div className="text-xs text-[#ba1a1a] bg-red-50 p-3 rounded-xl border border-red-200 flex items-start gap-2">
            <span className="font-semibold shrink-0">Aviso:</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successNotice && (
          <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* FASE 1: Verificación de Matrícula (POST /api/v1/auth/verify-student) */}
          {step === 'verify' ? (
            <motion.form
              key="verify-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleVerifyMatricula}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">
                    Matrícula o Usuario Institucional
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">Alumnos / Docentes</span>
                </div>
                <div className="relative">
                  <input
                    ref={matriculaInputRef}
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Ej. 2022452139 o usuario docente"
                    className="w-full bg-[#f8f9fa] border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-[#191c1d] tracking-wider focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 focus:outline-hidden transition"
                    required
                  />
                  {matricula && (
                    <button
                      type="button"
                      onClick={() => setMatricula('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loading ? 'Verificando con SIIA TESChi...' : 'Continuar con Credenciales'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Conexión institucional con servidor SIIA TESChi</span>
              </div>
            </motion.form>
          ) : (
            /* FASE 2: Selección de Método de Autenticación */
            <motion.div
              key="auth-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {/* Resumen del Alumno Identificado */}
              <div className="bg-[#f0f3f1] p-3 rounded-2xl flex items-center justify-between border border-[#1b4332]/10">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <p className="text-xs font-bold text-[#012d1d]">
                      {studentInfo.nombre || 'Estudiante TESChi'}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Matrícula: {matricula} • {studentInfo.carrera || 'Comunidad Académica TESChi'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    BiometricsAdapter.triggerHaptic(20);
                    setStep('verify');
                    setPassword('');
                    setPin('');
                    pinRef.current = '';
                    AuthService.clearLockout();
                    setErrorMsg(null);
                  }}
                  className="text-xs text-[#012d1d] hover:underline font-semibold flex items-center gap-1 shrink-0 p-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cambiar</span>
                </button>
              </div>

              {/* Selector de Método: Contraseña O NIP */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    BiometricsAdapter.triggerHaptic(20);
                    setActiveMethod('password');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition flex items-center justify-center gap-1 ${
                    activeMethod === 'password'
                      ? 'border-[#012d1d] text-[#012d1d]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Contraseña</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    BiometricsAdapter.triggerHaptic(20);
                    setActiveMethod('pin');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition flex items-center justify-center gap-1 ${
                    activeMethod === 'pin'
                      ? 'border-[#012d1d] text-[#012d1d]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>NIP (4 dígitos)</span>
                </button>
              </div>

              {/* Subformulario: Exclusivamente Contraseña */}
              {activeMethod === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Contraseña Institucional
                    </label>
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#f8f9fa] border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium pr-11 text-[#191c1d] focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 focus:outline-hidden transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Validando con SIIA TESChi...' : 'Iniciar Sesión con Contraseña'}</span>
                  </button>
                </form>
              )}

              {/* Subformulario: Exclusivamente NIP (4 dígitos) */}
              {activeMethod === 'pin' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-600">
                      Introduce tu NIP de 4 dígitos (teclado físico o táctil)
                    </p>
                    {/* Visualizador de Dígitos con Input Invisible Accesible */}
                    <div
                      className="relative cursor-pointer max-w-[240px] mx-auto py-1"
                      onClick={() => pinInputRef.current?.focus()}
                    >
                      <input
                        ref={pinInputRef}
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => updatePin(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        autoComplete="one-time-code"
                        aria-label="NIP institucional de 4 dígitos"
                      />
                      <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((idx) => {
                          const hasVal = pin.length > idx;
                          const isCurrent = pin.length === idx;
                          return (
                            <div
                              key={idx}
                              className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-mono font-bold transition-all duration-150 ${
                                hasVal
                                  ? 'border-[#012d1d] bg-[#012d1d] text-white shadow-xs scale-102'
                                  : isCurrent
                                  ? 'border-[#012d1d] ring-2 ring-[#012d1d]/20 bg-white text-gray-400'
                                  : 'border-gray-300 bg-[#f8f9fa] text-gray-400'
                              }`}
                            >
                              {hasVal ? '•' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Teclado Numérico Virtual Ergonómico */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handlePinDigit(digit)}
                        disabled={loading}
                        className="h-12 rounded-xl bg-[#f0f3f1] hover:bg-[#aeeecb]/30 active:scale-95 text-base font-bold text-[#191c1d] transition flex items-center justify-center shadow-xs disabled:opacity-50"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handlePinBackspace}
                      disabled={loading || pin.length === 0}
                      className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 transition flex items-center justify-center disabled:opacity-40"
                      title="Borrar dígito"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePinDigit('0')}
                      disabled={loading}
                      className="h-12 rounded-xl bg-[#f0f3f1] hover:bg-[#aeeecb]/30 active:scale-95 text-base font-bold text-[#191c1d] transition flex items-center justify-center shadow-xs disabled:opacity-50"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handlePinSubmit}
                      disabled={pin.length < 4 || loading}
                      className="h-12 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] active:scale-95 disabled:opacity-40 text-white font-bold transition flex items-center justify-center shadow-sm"
                      title="Confirmar NIP"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
