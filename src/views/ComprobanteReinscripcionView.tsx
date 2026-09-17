import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ComprobanteRecord } from '../types';
import { DocumentAdapter } from '../services/documentAdapter';
import { TeschiLogo } from '../components/TeschiLogo';

interface ComprobanteReinscripcionViewProps {
  comprobante: ComprobanteRecord;
}

export const ComprobanteReinscripcionView: React.FC<ComprobanteReinscripcionViewProps> = ({
  comprobante,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const res = await DocumentAdapter.exportPDF({
      filename: `Comprobante_Reinscripcion_${comprobante.matricula}.pdf`,
      title: 'Comprobante de Reinscripción Oficial',
      elementId: 'printable-voucher-card',
    });
    setDownloading(false);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendEmail = async () => {
    const subject = `Comprobante de Reinscripción TESChi - ${comprobante.matricula}`;
    const body = `Estimado alumno ${comprobante.nombreAlumno},\n\nSe adjunta la confirmación de su reinscripción para el periodo ${comprobante.folio}.\nTotal de Créditos: ${comprobante.totalCreditos}\nFirma digital: ${comprobante.hashFirmaDigital}\n\nTecnológico de Estudios Superiores de Chimalhuacán.`;
    await DocumentAdapter.shareViaEmail('alumno@teschi.edu.mx', subject, body);
    setToastMessage('Redirigiendo a tu cliente de correo institucional...');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-16">
      {/* Tarjeta del Documento Oficial (Image 15) */}
      <motion.div
        id="printable-voucher-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="printable-document bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative overflow-hidden space-y-5"
      >
        {/* Badge 'OFICIAL' superior derecha */}
        <div className="flex justify-end">
          <span className="px-3 py-1 rounded-full bg-[#012d1d] text-[#aeeecb] text-xs font-bold tracking-wider">
            OFICIAL
          </span>
        </div>

        {/* Encabezado con Logo y Título */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <TeschiLogo variant="full" size="md" className="max-w-[240px]" />
          </div>
          <h2 className="text-lg font-bold text-[#191c1d]">
            Comprobante de Reinscripción
          </h2>
          <p className="text-xs text-gray-500">Periodo Septiembre - Enero 2026-2027</p>
        </div>

        <hr className="border-gray-200" />

        {/* Metadatos del Estudiante (Grid 2 columnas) */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                MATRÍCULA
              </p>
              <p className="font-semibold text-sm text-[#191c1d]">{comprobante.matricula}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                PROGRAMA
              </p>
              <p className="font-semibold text-sm text-[#191c1d]">{comprobante.carrera}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              ALUMNO
            </p>
            <p className="font-semibold text-sm text-[#191c1d]">{comprobante.nombreAlumno}</p>
          </div>
        </div>

        {/* Tabla de Carga Académica */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-[#191c1d]">Carga Académica</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                  <th className="py-2 pr-2">Clave</th>
                  <th className="py-2 px-2">Materia</th>
                  <th className="py-2 px-2 text-center">Grupo</th>
                  <th className="py-2 pl-2 text-right">Créditos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comprobante.materias.map((materia) => (
                  <tr key={materia.clave} className="text-gray-800">
                    <td className="py-2.5 pr-2 font-mono font-medium text-gray-600">
                      {materia.clave}
                    </td>
                    <td className="py-2.5 px-2 font-medium">{materia.nombre}</td>
                    <td className="py-2.5 px-2 text-center font-medium">
                      {comprobante.grupo || '4A'}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-semibold">
                      {materia.creditos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pastilla TOTAL de Créditos */}
          <div className="flex justify-end pt-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#aeeecb] text-[#002114] text-xs font-bold">
              TOTAL {comprobante.totalCreditos} Créditos
            </span>
          </div>
        </div>

        {/* Leyenda y Sello Oficial */}
        <div className="pt-2 text-center space-y-3">
          <p className="text-[11px] italic text-gray-500 leading-tight">
            Este documento es un comprobante no oficial. Para obtener el sello oficial, preséntese en Servicios Escolares.
          </p>

          {/* Caja con borde punteado de sello y validación */}
          <div className="mx-auto w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-2 text-gray-400">
            <ShieldCheck className="w-8 h-8 stroke-[1.5] text-gray-300 mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider">SELLO DIGITAL</span>
          </div>
        </div>
      </motion.div>

      {/* Botones de Acción (Image 15) */}
      <div className="space-y-2.5 no-print">
        <button
          id="btn-enviar-correo"
          onClick={handleSendEmail}
          className="w-full py-3 rounded-xl border border-[#1b4332] text-[#1b4332] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-2xs"
        >
          <Mail className="w-4 h-4" />
          <span>Enviar por Correo</span>
        </button>

        <button
          id="btn-descargar-pdf"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full py-3 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Generando PDF...' : 'Descargar PDF'}</span>
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
