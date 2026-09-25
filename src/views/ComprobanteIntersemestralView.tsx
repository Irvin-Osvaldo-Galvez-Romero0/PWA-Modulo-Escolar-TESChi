import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Mail, CheckCircle2, ShieldCheck, QrCode, ArrowLeft, Edit3 } from 'lucide-react';
import { StudentProfile, ComprobanteRecord, Course } from '../types';
import { DocumentAdapter } from '../services/documentAdapter';
import { TeschiLogo } from '../components/TeschiLogo';

interface ComprobanteIntersemestralViewProps {
  student: StudentProfile;
  comprobante?: ComprobanteRecord | null;
  onNavigate?: (view: string) => void;
}

export const ComprobanteIntersemestralView: React.FC<ComprobanteIntersemestralViewProps> = ({
  student,
  comprobante,
  onNavigate,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Folio y datos dinámicos o fallback oficial
  const folio = comprobante?.folio || 'FOR-002-01/02/19JUN25';
  const fecha = comprobante?.fechaEmision || new Date().toLocaleDateString('es-MX');
  const hash = comprobante?.hashFirmaDigital || '7f8a9b2c3d4e5f60a1b2c3d4e5f67a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f';

  // Lista de materias inscritas
  const materias: Course[] = (comprobante && comprobante.materias && comprobante.materias.length > 0)
    ? comprobante.materias
    : [
        {
          clave: 'ACF-0901',
          nombre: 'Cálculo Diferencial',
          creditos: 5,
          profesor: 'Mtro. José Luis Benítez',
          dias: 'Lun a Vie',
          horario: '08:00 - 12:00',
          aula: 'Edificio B - Aula 101',
          semestre: 1,
        },
      ];

  const totalCreditos = materias.reduce((acc, m) => acc + m.creditos, 0);

  const handleDownload = async () => {
    setDownloading(true);
    const res = await DocumentAdapter.exportPDF({
      filename: `Comprobante_Intersemestral_FOR-002_${student.matricula}.pdf`,
      title: 'Solicitud Oficial de Curso Intersemestral (FOR-002)',
      elementId: 'intersemestral-document',
    });
    setDownloading(false);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleEmail = async () => {
    await DocumentAdapter.shareViaEmail(
      student.email,
      `Solicitud Intersemestral FOR-002 - ${student.matricula}`,
      `Estimado estudiante ${student.nombre},\n\nSe confirma la recepción del formato oficial FOR-002 para Cursos Intersemestrales.\nFolio: ${folio}\nAsignaturas: ${materias.map(m => m.nombre).join(', ')}\nTotal Créditos: ${totalCreditos}\n\nDepartamento de Servicios Escolares - TESChi.`
    );
    setToastMessage('Redirigiendo a tu cliente de correo...');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Barra Superior de Navegación Rápida */}
      {onNavigate && (
        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => onNavigate('intersemestrales')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#012d1d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Selección de Materias</span>
          </button>

          <button
            onClick={() => onNavigate('intersemestrales')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Cambiar Selección</span>
          </button>
        </div>
      )}

      {/* Formato Oficial FOR-002 (Image 23) */}
      <motion.div
        id="intersemestral-document"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="printable-document bg-white rounded-2xl p-6 shadow-md border border-gray-200 space-y-5 text-xs text-[#191c1d]"
      >
        {/* Folio y Estado Oficial */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-gray-400">FORMATO OFICIAL</span>
            <p className="font-mono font-bold text-xs text-[#012d1d]">{folio}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold">
            VALIDADO EN SISTEMA
          </span>
        </div>

        {/* Encabezado Institucional con Logo Oficial */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <TeschiLogo variant="full" size="md" className="max-w-[220px]" />
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Subdirección de Servicios Escolares</p>
          <h4 className="text-sm font-bold text-[#191c1d]">
            Solicitud de Registro a Curso Intersemestral (FOR-002)
          </h4>
          <p className="text-[10px] text-gray-400 font-mono">Fecha de Emisión: {fecha}</p>
        </div>

        {/* Datos del Alumno */}
        <div className="bg-[#f8f9fa] rounded-xl p-3.5 space-y-2 border border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Matrícula</span>
              <p className="font-semibold text-xs text-[#191c1d]">{student.matricula}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Carrera</span>
              <p className="font-semibold text-xs text-[#191c1d]">{student.carrera}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Nombre Completo</span>
              <p className="font-semibold text-xs text-[#191c1d]">{student.nombre}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Semestre Actual</span>
              <p className="font-semibold text-xs text-[#012d1d] font-bold">{student.semestreActual}</p>
            </div>
          </div>
        </div>

        {/* Materias Registradas para Intersemestral (Máximo 2) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-[#191c1d]">
              Asignaturas Solicitadas ({materias.length} / 2 permitidas)
            </h5>
            <span className="text-xs font-extrabold text-[#012d1d] bg-[#aeeecb]/30 px-2 py-0.5 rounded-md">
              Total: {totalCreditos} Créditos
            </span>
          </div>

          <div className="space-y-2">
            {materias.map((m) => (
              <div
                key={m.clave}
                className="rounded-xl border border-gray-200 p-3 flex items-center justify-between bg-white shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#aeeecb]/40 text-[#002114] font-mono text-[11px] font-semibold">
                      {m.clave}
                    </span>
                    <span className="font-bold text-xs">{m.nombre}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Modalidad Intensiva (4 semanas) • {m.dias || 'Lun a Vie'} ({m.horario || '08:00 - 12:00'}) • Aula: {m.aula || 'Edificio A'}
                  </p>
                  {m.profesor && (
                    <p className="text-[10px] text-gray-400">
                      Docente: <strong className="text-gray-600">{m.profesor}</strong>
                    </p>
                  )}
                </div>
                <span className="font-bold text-xs text-[#012d1d] shrink-0 ml-2">
                  {m.creditos} Créditos
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cláusula TecNM de Conformidad */}
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[10px] text-amber-950 space-y-1">
          <p className="font-bold">Conformidad con Lineamientos del TecNM:</p>
          <p>
            El alumno declara que las asignaturas seleccionadas corresponden estrictamente a su plan de estudios y están dentro del límite reglamentario de su semestre en curso ({student.semestreActual}).
          </p>
        </div>

        {/* Sello Digital y Código QR */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
          <div className="space-y-1 max-w-[280px]">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Cadena Digital de Seguridad</span>
            <p className="font-mono text-[9px] text-gray-600 break-all leading-tight">
              SHA256: {hash}
            </p>
          </div>
          <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-700">
            <QrCode className="w-10 h-10 stroke-[1.5]" />
          </div>
        </div>
      </motion.div>

      {/* Botones de Exportación */}
      <div className="space-y-2.5 no-print">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Descargando...' : 'Descargar Formato FOR-002 PDF'}</span>
        </button>

        <button
          onClick={handleEmail}
          className="w-full py-3 bg-white hover:bg-gray-50 border border-[#012d1d] text-[#012d1d] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs transition"
        >
          <Mail className="w-4 h-4" />
          <span>Reenviar a Correo Institucional</span>
        </button>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#012d1d] text-white px-4 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#aeeecb]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
