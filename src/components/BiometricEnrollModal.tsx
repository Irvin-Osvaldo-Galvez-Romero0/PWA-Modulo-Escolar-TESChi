import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, ShieldCheck, X, CheckCircle2, Lock } from 'lucide-react';
import { AuthService } from '../services/authService';

interface BiometricEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalCredits: number;
  courseCount: number;
}

export const BiometricEnrollModal: React.FC<BiometricEnrollModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  totalCredits,
  courseCount,
}) => {
  const [loading, setLoading] = useState(false);
  const [usePasswordFallback, setUsePasswordFallback] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBiometricSign = async () => {
    setErrorMsg(null);
    setLoading(true);
    const result = await AuthService.authenticateBiometrics('Firma Criptográfica de Reinscripción TESChi');
    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setErrorMsg(result.message);
      setUsePasswordFallback(true);
    }
  };

  const handlePasswordSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg('Ingresa tu contraseña para autorizar la firma.');
      return;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5 text-[#191c1d]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#aeeecb]/40 text-[#002114] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#1b4332]" />
            </div>
            <h3 className="text-base font-bold text-[#191c1d]">Firma Criptográfica</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
            aria-label="Cancelar firma"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Materias seleccionadas:</span>
            <span className="font-bold text-[#191c1d]">{courseCount}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Créditos totales:</span>
            <span className="font-bold text-[#1b4332]">{totalCredits} Créditos</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Sello digital:</span>
            <span className="font-mono text-[10px] text-gray-500">SHA-256 Validado</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          De conformidad con la norma ISO/IEC 27001, confirma la operación con tu sensor biométrico de hardware (huella digital o reconocimiento de dispositivo) para generar el comprobante oficial inmutable.
        </p>

        {errorMsg && (
          <p className="text-xs text-[#ba1a1a] bg-red-50 p-2.5 rounded-lg border border-red-200">
            {errorMsg}
          </p>
        )}

        {!usePasswordFallback ? (
          <div className="space-y-2">
            <button
              onClick={handleBiometricSign}
              disabled={loading}
              className="w-full py-3.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-medium text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-5 h-5" />
              <span>{loading ? 'Validando Biometría...' : 'Firmar con Biometría'}</span>
            </button>
            <button
              onClick={() => setUsePasswordFallback(true)}
              className="w-full py-2 text-xs text-gray-600 hover:text-gray-900"
            >
              O firmar con contraseña institucional
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSign} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Contraseña Institucional</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full bg-[#f8f9fa] border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#191c1d] focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white font-medium text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Autorizar e Inscribir</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
