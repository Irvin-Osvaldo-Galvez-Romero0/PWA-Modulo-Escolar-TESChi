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

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Estado del flujo de verificación
  const [step, setStep] = useState<'verify' | 'authenticate'>('verify');
  const [matricula, setMatricula] = useState('202230129');
  const [studentInfo, setStudentInfo] = useState<{
    nombre?: string;
    carrera?: string;
    registeredMethods: string[];
  }>({
    registeredMethods: ['password', 'pin'],
  });

  // Métodos de autenticación
  const [activeMethod, setActiveMethod] = useState<'password' | 'pin'>('password');
  const [password, setPassword] = useState('Teschi2024*');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');

  // Estados de carga y feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const matriculaInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'verify' && matriculaInputRef.current) {
      matriculaInputRef.current.focus();
    } else if (step === 'authenticate' && activeMethod === 'password' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step, activeMethod]);

  // Manejo de teclado físico para el PIN cuando el método PIN está activo
  useEffect(() => {
    if (step !== 'authenticate' || activeMethod !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlePinBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pin.length >= 4) {
          handlePinSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, activeMethod, pin]);

  // Paso 1: Verificación de Matrícula (POST /api/v1/auth/verify-student)
  const handleVerifyMatricula = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    BiometricsAdapter.triggerHaptic(30);

    const clean = matricula.trim();
    if (!clean) {
      setErrorMsg('Ingresa tu matrícula o número de control.');
      return;
    }

    setLoading(true);
    const result = await AuthService.verifyStudent(clean);
    setLoading(false);

    if (result.exists) {
      const methods = (result.registeredMethods || []).filter((m) => m !== 'biometric');
      const availableMethods = methods.length ? methods : ['password', 'pin'];
      setStudentInfo({
        nombre: result.nombre || 'Alejandro Ruiz',
        carrera: result.carrera || 'Ingeniería en Sistemas Computacionales',
        registeredMethods: availableMethods,
      });
      // Seleccionar el primer método registrado
      if (availableMethods.includes('password')) {
        setActiveMethod('password');
      } else {
        setActiveMethod('pin');
      }
      setStep('authenticate');
      BiometricsAdapter.triggerHaptic([30, 40]);
    } else {
      setErrorMsg(result.message || 'Matrícula no localizada en el sistema de control escolar.');
      BiometricsAdapter.triggerHaptic([100, 50, 100]);
    }
  };

  // Paso 2A: Login con Contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    BiometricsAdapter.triggerHaptic(40);

    const result = await AuthService.authenticatePassword(matricula, password);
    setLoading(false);

    if (result.success) {
      setSuccessNotice('Acceso autorizado');
      BiometricsAdapter.triggerHaptic([40, 50, 60]);
      setTimeout(() => onLoginSuccess(), 400);
    } else {
      setErrorMsg(result.message);
      BiometricsAdapter.triggerHaptic([80, 50, 80]);
    }
  };

  // Paso 2B: Manejo de PIN (Entrada Dual: Teclado Físico + Teclado Numérico Táctil con Háptica)
  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      BiometricsAdapter.triggerHaptic(25);
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg(null);
      // Auto-submit si alcanza 4 dígitos
      if (newPin.length === 4) {
        setTimeout(() => triggerPinLogin(newPin), 250);
      }
    }
  };

  const handlePinBackspace = () => {
    BiometricsAdapter.triggerHaptic(20);
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const triggerPinLogin = async (pinValue: string) => {
    setLoading(true);
    const result = await AuthService.authenticatePin(matricula, pinValue);
    setLoading(false);

    if (result.success) {
      setSuccessNotice('PIN verificado con éxito');
      BiometricsAdapter.triggerHaptic([30, 50, 40]);
      setTimeout(() => onLoginSuccess(), 400);
    } else {
      setErrorMsg(result.message);
      setPin('');
      BiometricsAdapter.triggerHaptic([80, 40, 80]);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length >= 4) {
      triggerPinLogin(pin);
    } else {
      setErrorMsg('Ingresa los 4 dígitos de tu PIN institucional.');
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

        {/* Indicador de Acceso Exclusivo para Alumnos */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f3f1] text-[#012d1d] text-xs font-semibold border border-gray-200">
            <GraduationCap className="w-4 h-4 text-[#1b4332]" />
            <span>Acceso Exclusivo Alumnos</span>
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
                    Matrícula / Número de Control
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">Ej. 202230129</span>
                </div>
                <div className="relative">
                  <input
                    ref={matriculaInputRef}
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="202230129"
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
                <span>{loading ? 'Verificando en padrón escolar...' : 'Continuar con Matrícula'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-gray-400">
                Presiona <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 border border-gray-300 rounded">Enter ↵</kbd> para verificar credenciales.
              </p>
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
                    <p className="text-xs font-bold text-[#012d1d]">{studentInfo.nombre}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Matrícula: {matricula} • {studentInfo.carrera}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    BiometricsAdapter.triggerHaptic(20);
                    setStep('verify');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-[#012d1d] hover:underline font-semibold flex items-center gap-1 shrink-0 p-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cambiar</span>
                </button>
              </div>

              {/* Selector de Método según registeredMethods */}
              <div className="flex border-b border-gray-200">
                {studentInfo.registeredMethods.includes('password') && (
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
                )}
                {studentInfo.registeredMethods.includes('pin') && (
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
                    <span>PIN (4 dígitos)</span>
                  </button>
                )}
              </div>

              {/* Subformulario: Contraseña */}
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
                    className="w-full py-3.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Validando...' : 'Iniciar Sesión'}</span>
                  </button>
                </form>
              )}

              {/* Subformulario: PIN Institucional (Entrada Dual) */}
              {activeMethod === 'pin' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-600">
                      Introduce tu PIN de 4 dígitos (táctil o teclado físico)
                    </p>
                    {/* Visualizador de Dígitos */}
                    <div className="flex justify-center gap-3 py-2">
                      {[0, 1, 2, 3].map((idx) => {
                        const hasVal = pin.length > idx;
                        return (
                          <div
                            key={idx}
                            className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-mono font-bold transition ${
                              hasVal
                                ? 'border-[#012d1d] bg-[#012d1d] text-white shadow-xs'
                                : 'border-gray-300 bg-[#f8f9fa] text-gray-400'
                            }`}
                          >
                            {hasVal ? '•' : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Teclado Numérico Virtual Ergonómico */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handlePinDigit(digit)}
                        className="h-12 rounded-xl bg-[#f0f3f1] hover:bg-[#aeeecb]/30 active:scale-95 text-base font-bold text-[#191c1d] transition flex items-center justify-center shadow-xs"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handlePinBackspace}
                      className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 transition flex items-center justify-center"
                      title="Borrar dígito"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePinDigit('0')}
                      className="h-12 rounded-xl bg-[#f0f3f1] hover:bg-[#aeeecb]/30 active:scale-95 text-base font-bold text-[#191c1d] transition flex items-center justify-center shadow-xs"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handlePinSubmit}
                      disabled={pin.length < 4 || loading}
                      className="h-12 rounded-xl bg-[#012d1d] disabled:opacity-40 text-white font-bold transition flex items-center justify-center"
                      title="Confirmar PIN"
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
