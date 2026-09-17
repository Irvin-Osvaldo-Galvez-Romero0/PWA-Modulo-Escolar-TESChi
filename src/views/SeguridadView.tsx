import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Shield, CheckCircle2, Fingerprint, KeyRound, AlertTriangle } from 'lucide-react';
import { AuthService } from '../services/authService';
import { ApiClient } from '../services/apiClient';

export const SeguridadView: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Biometría de hardware
  const [biometricsActive, setBiometricsActive] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    AuthService.isBiometricsConfigured().then(setBiometricsActive);
  }, []);

  const entropy = AuthService.evaluatePasswordEntropy(newPassword);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    // Prevención de errores ergonómicos ISO 9241-110
    if (!currentPassword) {
      setFeedbackMessage({ type: 'error', text: 'Por favor ingresa tu contraseña actual.' });
      return;
    }

    if (newPassword.length < 8) {
      setFeedbackMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedbackMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    const res = await ApiClient.updatePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setFeedbackMessage({ type: 'success', text: 'Contraseña actualizada de forma segura (ISO/IEC 27001).' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedbackMessage({ type: 'error', text: res.message || 'Error al actualizar contraseña.' });
    }
  };

  const handleToggleBiometrics = async () => {
    setBioLoading(true);
    const res = await AuthService.authenticateBiometrics('Habilitar acceso biométrico institucional');
    setBioLoading(false);
    if (res.success) {
      setBiometricsActive(true);
      setFeedbackMessage({
        type: 'success',
        text: `Biometría configurada con éxito usando ${res.methodUsed}.`,
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-6 space-y-6 pb-20">
      {/* Encabezado de la Pantalla */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1d] tracking-tight">
          Cambiar Contraseña
        </h2>
        <p className="text-sm text-[#414844] leading-relaxed">
          Mantén tu cuenta segura actualizando tu contraseña periódicamente.
        </p>
      </motion.div>

      {/* Formulario (Exacto como en Image 19) */}
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        {/* Campo 1: Contraseña Actual */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#191c1d]">
            Contraseña Actual
          </label>
          <div className="relative">
            <input
              id="input-current-password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm pr-11 focus:border-[#1b4332] focus:ring-2 focus:ring-[#1b4332]/20 focus:outline-hidden transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              aria-label={showCurrent ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Campo 2: Nueva Contraseña */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#191c1d]">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              id="input-new-password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm pr-11 focus:border-[#1b4332] focus:ring-2 focus:ring-[#1b4332]/20 focus:outline-hidden transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              aria-label={showNew ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Indicador de entropía y requisitos ISO 27001 */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
              <span>Mínimo 8 caracteres, números y símbolos.</span>
              {newPassword.length > 0 && (
                <span className={`font-semibold ${
                  entropy.level === 'Excelente' ? 'text-emerald-700' :
                  entropy.level === 'Robusta' ? 'text-green-700' :
                  entropy.level === 'Aceptable' ? 'text-amber-700' : 'text-red-600'
                }`}>
                  Nivel: {entropy.level}
                </span>
              )}
            </div>
            {newPassword.length > 0 && (
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    entropy.score >= 80 ? 'bg-emerald-600' :
                    entropy.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${entropy.score}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Campo 3: Confirmar Nueva Contraseña */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#191c1d]">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              id="input-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm pr-11 focus:border-[#1b4332] focus:ring-2 focus:ring-[#1b4332]/20 focus:outline-hidden transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mensajes de Feedback Ergonómico */}
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </motion.div>
        )}

        {/* Botón 'Actualizar Contraseña' (Image 19) */}
        <div className="pt-2">
          <button
            id="btn-actualizar-contrasena"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#1b4332]"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
          </button>
        </div>
      </form>

      {/* Módulo Abstracto de Biometría / Passkeys (WebAuthn / Windows Hello / Touch ID) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#aeeecb]/40 text-[#012d1d] flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#191c1d]">Autenticación Biométrica</h3>
              <p className="text-[11px] text-gray-500">Huella digital, reconocimiento facial o llave de seguridad</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            biometricsActive ? 'bg-[#aeeecb] text-[#002114]' : 'bg-gray-100 text-gray-600'
          }`}>
            {biometricsActive ? 'Habilitado' : 'Inactivo'}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Accede a tu cuenta institucional sin necesidad de escribir contraseñas mediante hardware criptográfico seguro FIDO2.
        </p>
        <button
          onClick={handleToggleBiometrics}
          disabled={bioLoading}
          className="w-full py-2.5 rounded-xl border border-[#1b4332] text-[#1b4332] font-semibold text-xs hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-4 h-4" />
          <span>{bioLoading ? 'Consultando Hardware...' : biometricsActive ? 'Probar / Reconfigurar Biometría' : 'Vincular Biometría a este Dispositivo'}</span>
        </button>
      </div>

      {/* Tarjeta 'Consejos de Seguridad' (Exacta como en Image 19) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-[#edeeef]/60 border border-gray-200/80 p-5 space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-[#191c1d]">
            Consejos de Seguridad
          </h3>
        </div>

        <ul className="space-y-2 text-xs text-[#414844] pl-2">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] mt-1.5 shrink-0" />
            <span>No uses información personal como fechas de nacimiento.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] mt-1.5 shrink-0" />
            <span>Evita reciclar contraseñas de otros sitios.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] mt-1.5 shrink-0" />
            <span>Considera usar un gestor de contraseñas.</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};
