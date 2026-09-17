import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BiometricEnrollModal } from './components/BiometricEnrollModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardView } from './views/DashboardView';
import { ReinscripcionGrupoView } from './views/ReinscripcionGrupoView';
import { ReinscripcionCargaView } from './views/ReinscripcionCargaView';
import { ComprobanteReinscripcionView } from './views/ComprobanteReinscripcionView';
import { KardexView } from './views/KardexView';
import { SeguridadView } from './views/SeguridadView';
import { ComprobanteIntersemestralView } from './views/ComprobanteIntersemestralView';
import { CalendarioEscolarView } from './views/CalendarioEscolarView';
import { LoginView } from './views/LoginView';
import { TeschiLogo } from './components/TeschiLogo';
import { ApiClient } from './services/apiClient';
import { INITIAL_STUDENT } from './services/mockData';
import {
  StudentProfile,
  GroupOption,
  Course,
  SemesterRecord,
  ComprobanteRecord,
} from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Datos Académicos
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [history, setHistory] = useState<SemesterRecord[]>([]);
  const [comprobante, setComprobante] = useState<ComprobanteRecord | null>(null);

  // Estado del Flujo de Reinscripción
  const [selectedGroupId, setSelectedGroupId] = useState<string>('4A');
  const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>([
    'IS101',
    'DB201',
    'NT301',
    'SE401',
    'HU102',
  ]);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  // Carga inicial de datos desde REST API / IndexedDB
  useEffect(() => {
    async function loadInitialData() {
      const [profileData, groupData, courseData, kardexData, compData] = await Promise.all([
        ApiClient.getStudentProfile(),
        ApiClient.getGroups(),
        ApiClient.getAvailableCourses(),
        ApiClient.getKardex(),
        ApiClient.getComprobante(),
      ]);

      setStudent(profileData);
      setGroups(groupData);
      setCourses(courseData);
      setHistory(kardexData);
      setComprobante(compData);
    }

    loadInitialData();
  }, []);

  const handleToggleCourse = (code: string) => {
    setSelectedCourseCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleEnrollSuccess = async () => {
    setIsBiometricModalOpen(false);
    const selectedList = courses.filter((c) => selectedCourseCodes.includes(c.clave));
    const res = await ApiClient.submitEnrollment(selectedGroupId, selectedList);
    setComprobante(res.comprobante);
    setCurrentView('comprobante_reinscripcion');
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 animate-pulse">
          <TeschiLogo variant="full" size="md" className="max-w-[240px]" />
        </div>
        <p className="text-xs font-semibold text-gray-600">
          Iniciando Módulo de Servicios Escolares TESChi...
        </p>
      </div>
    );
  }

  const selectedCoursesList = courses.filter((c) => selectedCourseCodes.includes(c.clave));
  const totalCredits = selectedCoursesList.reduce((acc, c) => acc + c.creditos, 0);

  // Renderizado de las vistas
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            student={student}
            onNavigate={(view) => setCurrentView(view)}
            onLogout={() => setIsAuthenticated(false)}
          />
        );
      case 'reinscripcion_grupo':
        return (
          <ReinscripcionGrupoView
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onContinue={() => setCurrentView('reinscripcion_carga')}
          />
        );
      case 'reinscripcion_carga':
        return (
          <ReinscripcionCargaView
            courses={courses}
            selectedCourseCodes={selectedCourseCodes}
            onToggleCourse={handleToggleCourse}
            onConfirm={() => setIsBiometricModalOpen(true)}
            maxCredits={36}
          />
        );
      case 'comprobante_reinscripcion':
        return comprobante ? (
          <ComprobanteReinscripcionView comprobante={comprobante} />
        ) : (
          <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto bg-emerald-50 text-[#012d1d] rounded-2xl flex items-center justify-center font-bold">
              ✓
            </div>
            <h2 className="text-base font-bold text-[#191c1d]">Comprobante Oficial en Espera</h2>
            <p className="text-xs text-gray-500">
              Aún no has completado el proceso de reinscripción para este ciclo o está cargando el registro escolar.
            </p>
            <button
              onClick={() => setCurrentView('reinscripcion_grupo')}
              className="px-4 py-2.5 bg-[#012d1d] text-white text-xs font-semibold rounded-xl hover:bg-[#1b4332] transition"
            >
              Ir a Proceso de Reinscripción
            </button>
          </div>
        );
      case 'kardex':
        return (
          <ErrorBoundary fallbackTitle="Error al cargar el Kardex Académico">
            <KardexView student={student} history={history} />
          </ErrorBoundary>
        );
      case 'seguridad':
        return (
          <ErrorBoundary fallbackTitle="Error al cargar Seguridad">
            <SeguridadView />
          </ErrorBoundary>
        );
      case 'comprobante_intersemestral':
        return (
          <ErrorBoundary fallbackTitle="Error al cargar Comprobante Intersemestral">
            <ComprobanteIntersemestralView student={student} />
          </ErrorBoundary>
        );
      case 'calendario_escolar':
        return (
          <ErrorBoundary fallbackTitle="Error al cargar el Calendario Escolar">
            <CalendarioEscolarView onBack={() => setCurrentView('dashboard')} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary fallbackTitle="Error al cargar el Panel Principal">
            <DashboardView
              student={student || INITIAL_STUDENT}
              onNavigate={(view) => setCurrentView(view)}
              onLogout={() => setIsAuthenticated(false)}
            />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <main className="flex-1">
        <ErrorBoundary fallbackTitle="Error inesperado en la aplicación">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Modal de Firma Biométrica */}
      <BiometricEnrollModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onSuccess={handleEnrollSuccess}
        totalCredits={totalCredits}
        courseCount={selectedCoursesList.length}
      />

      {/* Indicador Offline y Background Sync */}
      <OfflineIndicator />
    </div>
  );
}
