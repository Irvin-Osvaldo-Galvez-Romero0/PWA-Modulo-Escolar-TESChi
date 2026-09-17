# Catálogo de Vistas, Características, Avances Técnicos y Endpoints
## Módulo Auxiliar de Servicios Escolares TESChi (Versión 2.0.0 Multiplataforma)

---

### Arquitectura Multiplataforma Base (Single Codebase)
- **PWA (React 18 + Vite + Tailwind CSS):** Despliegue web progresivo con soporte offline, Service Worker, WebApp Manifest y API WebAuthn.
- **Desktop (Tauri v2 / Electron Ready):** Contenedor nativo ligero con aislamiento de procesos, bindings nativos de seguridad y atajos de teclado físicos.
- **Mobile (Capacitor 6+):** Contenedor móvil nativo con bindings para `BiometricPrompt` (Android), `Face ID / Touch ID` (iOS), adaptación para safe-area-insets (`env(safe-area-inset-*)`) y retroalimentación háptica por hardware.

---

## 1. Vista: Portal Institucional - Acceso Inicial (Login)
- **Ruta / Estado:** Vista Inicial Predeterminada (`isAuthenticated: false`)
- **Propósito:** Autenticación institucional focalizada y exclusiva para alumnos en dos fases con verificación de matrícula y soporte seguro de credenciales (Contraseña y PIN).
- **Características & Avances UX/UI:**
  - **Logotipo Oficial de la Universidad:** Integración en encabezados y comprobantes del logotipo oficial de TESCHI (TES en verde con sombra 3D, cubos institucionales C verde lima, H plateado e I verde bosque, y la leyenda 'TECNOLÓGICO DE ESTUDIOS SUPERIORES CHIMALHUACÁN' con acento rojo).
  - **Acceso Exclusivo para Alumnos:** Se eliminaron las opciones de Docente y Personal para simplificar el flujo conforme a la fase operativa escolar activa. Se implementó una insignia institucional distintiva de acceso escolar.
  - **Vista Inicial del Sistema:** La aplicación arranca de forma predeterminada en el Login (`isAuthenticated = false`).
  - **Fase 1 (Verificación):** Input estilizado de matrícula/número de control con detección de tecla `Enter ↵`, borrado rápido y consulta al padrón institucional.
  - **Fase 2 (Autenticación Adaptativa Simplificada):** Métodos de acceso estudiantil:
    - *Contraseña:* Campo protegido con alternador de visibilidad (`Eye`/`EyeOff`) y diseño limpio sin barras de sobrecarga cognitiva.
    - *PIN Institucional:* Entrada dual ergonómica (teclado numérico táctil interactivo con vibración háptica de 20-30ms o teclado físico) con avance automático a los 4 dígitos.
    - *Biometría y Mensajes ISO:* Se retiró la opción biométrica y las leyendas de cumplimiento normativo/barra de carga en el login para ofrecer una interfaz ágil y sin distractores.
  - **Responsive & Ergonomía:** Formulario vertical fluido con espaciado `pt-safe pb-safe` en dispositivos móviles y tarjeta centrada con elevación `max-w-md` en escritorio.
- **Animaciones (Framer Motion):**
  - Transición fluida de entrada y cambio de fase con `AnimatePresence` (`opacity` y desplazamiento en `x`).
- **APIs, Endpoints y JSON:**
  - **Endpoint 1: Verificación de Estudiante**
    - `POST /api/v1/auth/verify-student`
    - *Request:*
      ```json
      {
        "matricula": "202230129"
      }
      ```
    - *Response (200 OK):*
      ```json
      {
        "exists": true,
        "matricula": "202230129",
        "nombre": "Alejandro Ruiz",
        "carrera": "Ingeniería en Sistemas Computacionales",
        "registeredMethods": ["password", "pin", "biometric"]
      }
      ```
  - **Endpoint 2: Autenticación por Contraseña**
    - `POST /api/v1/auth/login-password`
    - *Request:*
      ```json
      {
        "matricula": "202230129",
        "password": "••••••••••••"
      }
      ```
    - *Response (200 OK):*
      ```json
      {
        "success": true,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "matricula": "202230129",
          "nombre": "Alejandro Ruiz Gómez",
          "rol": "alumno"
        }
      }
      ```
  - **Endpoint 3: Autenticación por PIN**
    - `POST /api/v1/auth/login-pin`
    - *Request:*
      ```json
      {
        "matricula": "202230129",
        "pin": "1234"
      }
      ```
    - *Response (200 OK):*
      ```json
      {
        "success": true,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
      ```

---

## 2. Vista: Dashboard Académico
- **Ruta / Estado:** `/dashboard` | `currentView: 'dashboard'`
- **Propósito:** Centro de control escolar del estudiante que consolida estatus académico, periodo activo, promedio, créditos acumulados, convocatorias y accesos a trámites.
- **Características & Avances UX/UI:**
  - Ficha institucional del estudiante en formato tipográfico limpio y contrastado (sin imágenes de avatar innecesarias), destacando el nombre completo, carrera oficial, matrícula y estatus regular.
  - Indicadores clave de rendimiento (KPIs): Promedio acumulado (94.2), Créditos aprobados vs totales (198 / 260), y Semestre actual (9º ISC).
  - Tarjetas de acción rápida para: Reinscripción de Grupo, Selección de Carga, Kárdex Oficial, Intersemestrales y Centro de Seguridad.
  - Alerta contextual con fechas límite del periodo de reinscripción 2026-2.
- **Animaciones:** Entrada suave con fade-in y escalamiento sutil en microinteracciones de botones.
- **APIs, Endpoints y JSON:**
  - `GET /api/v1/student/profile`
  - *Response (200 OK):*
    ```json
    {
      "matricula": "202230129",
      "nombre": "Alejandro Ruiz Gómez",
      "carrera": "Ingeniería en Sistemas Computacionales",
      "semestre": 9,
      "promedio": 94.2,
      "creditosAcumulados": 198,
      "creditosTotales": 260,
      "estatus": "Regular",
      "periodo": "2026-2"
    }
    ```

---

## 3. Vista: Selección y Reinscripción de Grupo
- **Ruta / Estado:** `/reinscripcion/grupo` | `currentView: 'reinscripcion_grupo'`
- **Propósito:** Selección del grupo académico del semestre ofertado con visualización de cupos disponibles en tiempo real, turno y aula asignada.
- **Características & Avances UX/UI:**
  - Selector en cuadrícula de grupos disponibles (ej. Grupo 9A Matutino, 9B Vespertino).
  - Indicador de saturación de cupo (cupo máximo vs ocupado) con barras de progreso codificadas por color.
  - Doble validación y confirmación ergonómica antes de avanzar al paso de carga de materias.
- **APIs, Endpoints y JSON:**
  - `GET /api/v1/reinscripcion/grupos`
  - *Response (200 OK):*
    ```json
    [
      { "id": "9A", "nombre": "ISC-901-M", "turno": "Matutino", "cupoMax": 35, "ocupados": 28, "aula": "Edificio D - Aula 204" },
      { "id": "9B", "nombre": "ISC-902-V", "turno": "Vespertino", "cupoMax": 35, "ocupados": 19, "aula": "Edificio D - Aula 205" }
    ]
    ```

---

## 4. Vista: Selección de Carga Académica
- **Ruta / Estado:** `/reinscripcion/carga` | `currentView: 'reinscripcion_carga'`
- **Propósito:** Configuración personalizada de asignaturas a cursar en el semestre con comprobación de prerrequisitos, límites de créditos (mínimo 20, máximo 36) y prevención de cruces de horario.
- **Características & Avances UX/UI:**
  - Checkboxes táctiles con badges de créditos y docentes asignados.
  - Contador dinámico de créditos en tiempo real con alertas de sobrecarga o carga insuficiente.
  - Detector visual de cruce de horarios para evitar asignaturas simultáneas.
- **APIs, Endpoints y JSON:**
  - `GET /api/v1/reinscripcion/materias`
  - `POST /api/v1/reinscripcion/validar-carga`
  - *Request:*
    ```json
    {
      "matricula": "202230129",
      "materiasSeleccionadas": ["IS901", "IS902", "IS903", "IS904"]
    }
    ```
  - *Response (200 OK):*
    ```json
    {
      "valido": true,
      "totalCreditos": 30,
      "conflictosHorario": [],
      "prerrequisitosCumplidos": true
    }
    ```

---

## 5. Vista: Comprobante Oficial de Reinscripción
- **Ruta / Estado:** `/reinscripcion/comprobante` | `currentView: 'comprobante_reinscripcion'`
- **Propósito:** Emisión y resguardo del documento oficial que acredita la reinscripción del estudiante, provisto de sello digital SHA-256 y código QR verificable.
- **Características & Avances UX/UI:**
  - Formato institucional oficial del TESChi con logotipos de control escolar, desglose de materias, firmas digitales y código de validación.
  - Sello digital criptográfico generado en backend con hash SHA-256.
  - Botones de acción desacoplados mediante `DocumentAdapter`:
    - *Imprimir:* Dispara `@media print` optimizado para salida en papel sin elementos de interfaz.
    - *Descargar PDF:* Genera blob descargable o invoca el guardado en disco nativo en entornos de escritorio/móvil.
  - Estado vacío informativo ("Comprobante Oficial en Espera") con redirección guiada si aún no hay registro concluido.
- **APIs, Endpoints y JSON:**
  - `GET /api/v1/reinscripcion/comprobante`
  - *Response (200 OK):*
    ```json
    {
      "folio": "TESCHI-REIN-2026-08492",
      "matricula": "202230129",
      "fecha": "2026-09-03T10:30:00Z",
      "selloDigital": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "qrData": "https://teschi.edu.mx/validador/comprobante?folio=TESCHI-REIN-2026-08492",
      "materias": [
        { "clave": "IS901", "nombre": "Administración de Servidores", "creditos": 5, "horario": "L-M-V 07:00-09:00" },
        { "clave": "IS902", "nombre": "Seguridad Informática Avanzada", "creditos": 5, "horario": "M-J 09:00-11:00" }
      ]
    }
    ```

---

## 6. Vista: Kárdex Académico
- **Ruta / Estado:** `/kardex` | `currentView: 'kardex'`
- **Propósito:** Consulta histórica integral de asignaturas acreditadas, no acreditadas, periodos de evaluación (ordinario, regularización, extraordinario) y porcentaje de avance reticular.
- **Características & Avances UX/UI:**
  - Desglose cronológico por semestres (1º al 9º).
  - Píldoras de estatus de acreditación (Ordinario = Verde, Regularización = Ámbar).
  - Gráfico de progreso curricular del 76% de la carrera.
- **APIs, Endpoints y JSON:**
  - `GET /api/v1/kardex`
  - *Response (200 OK):*
    ```json
    {
      "matricula": "202230129",
      "promedioGeneral": 94.2,
      "avancePorcentaje": 76.15,
      "historial": [
        { "semestre": 1, "materias": [{ "codigo": "CB101", "nombre": "Cálculo Diferencial", "calificacion": 95, "tipo": "ORD" }] }
      ]
    }
    ```

---

## 7. Vista: Centro de Seguridad y Cumplimiento ISO/IEC 27001
- **Ruta / Estado:** `/seguridad` | `currentView: 'seguridad'`
- **Propósito:** Gestión de credenciales biométricas, enrolamiento de hardware seguro (WebAuthn/Passkeys), revocación de sesiones remotas y bitácora criptográfica de accesos.
- **Características & Avances UX/UI:**
  - Enrolamiento guiado de biometría mediante modal interactivo.
  - Indicadores de política de contraseñas y renovación de PIN.
  - Registro de auditoría con IP, agente de usuario, método de ingreso y timestamp ISO 8601.
- **APIs, Endpoints y JSON:**
  - `GET /api/v1/security/audit-log`
  - `POST /api/v1/auth/biometrics-verify`

---

## 8. Vista: Calendario Escolar Oficial 2026-2027 (14 Meses y Simbología Completa)
- **Ruta / Estado:** `/calendario` | `currentView: 'calendario_escolar'`
- **Propósito:** Consulta integral, estructurada e interactiva del calendario oficial del Tecnológico de Estudios Superiores de Chimalhuacán para el ciclo 2026-2027 y el periodo activo Septiembre - Enero 2026-2027.
- **Acceso:** Directamente desde el icono de calendario y el banner del Periodo Actual en el Dashboard, o mediante el botón de calendario en la barra de navegación superior.
- **Características & Avances UX/UI:**
  - **Estructura Dinámica (No imagen estática):** Renderizado algorítmico y matemático de 14 meses (Enero 2026 a Febrero 2027) con alineación exacta de días de semana (L-M-M-J-V-S-D).
  - **Simbología Oficial (14 Indicadores del Cartel Institucional):**
    1. Reinscripciones (Barra superior azul)
    2. Inscripciones (Barra inferior roja)
    3. Inicio de semestre (Triángulo azul arriba △)
    4. Fin de semestre (Triángulo azul abajo ▽)
    5. Inicio de curso (Flecha morada derecha ⇨)
    6. Fin de curso (Flecha morada izquierda ⇦)
    7. Días No Laborables (Bloque negro)
    8. Vacaciones (Bloque amarillo vivo)
    9. Aniversario del TESCHI (Bloque blanco con borde azul grueso de 3px)
    10. Seguimientos (Bloque rosa/malva)
    11. Curso de Preselección (Bloque morado pastel)
    12. Receso Escolar y Administrativo (Bloque azul cielo)
    13. Primera Oportunidad (Borde verde olivo)
    14. Segunda Oportunidad y Calificación Final (Bloque durazno/naranja)
  - **Componentes Vectoriales SVG de Alta Fidelidad para Simbología:**
    - `GlyphInicioSemestre`: Triángulo equilátero azul celeste (#bae6fd) con contorno reforzado azul rey (#0284c7) de 2.8px y sombra sutil.
    - `GlyphFinSemestre`: Triángulo invertido con las mismas propiedades cromáticas institucionales.
    - `GlyphInicioCurso`: Flecha dimensional morada hacia la derecha (#e9d5ff relleno, contorno #7e22ce de 2.4px).
    - `GlyphFinCurso`: Flecha dimensional morada hacia la izquierda.
    - Marcadores numéricos de contraste alto en blanco puro para fondos oscuros (días no laborables) o negro carbón para fondos pasteles (receso, vacaciones, seguimientos).
  - **Sistema de Animaciones Fluidas (Motion):**
    - Entrada escalonada de las 14 tarjetas de mes con `staggerChildren` y desvanecimiento suave.
    - Transición deslizante con `AnimatePresence` (`x: -20` / `x: 20`) al alternar entre la cuadrícula general y el mes individual.
    - Microinteracciones de hover (`scale: 1.05`) y tap táctil (`scale: 0.95`) en celdas interactivas.
    - Pulso visual continuo (`scale: [1, 1.08, 1]` con anillo de sombra brillante) en las fechas que coinciden con el filtro de evento seleccionado por el usuario.
  - **Selector de Modo de Visualización:**
    - *Vista Anual:* Cuadrícula responsiva de 14 meses con resaltado del periodo escolar activo.
    - *Vista Mensual Detallada:* Navegación mes por mes con celdas ampliadas y visualización contextual de notas.
  - **Consolidación de la Simbología Oficial (14 Indicadores):**
    - Se eliminó el módulo duplicado superior para optimizar el viewport vertical y dar acceso inmediato a la cuadrícula de meses.
    - Única fuente canónica ubicada al pie del calendario: 14 tarjetas de alta fidelidad con figuras a escala real (48x48px), glifos vectoriales oficiales y descripciones normativas.
    - Mecánica de alternancia (*toggle*): el primer clic activa el filtro y el resaltado en los 14 meses; un segundo clic sobre la misma tarjeta deselecciona automáticamente (`selectedFilter = 'all'`).
    - Atributo de accesibilidad `aria-pressed`, indicador visual activo con baliza verde esmeralda animada y opción de deselección global inmediata en cabecera (`Deseleccionar (Mostrar todos)`).
  - **Marcador Dinámico del Día Actual ("Hoy") y Localizador Temporal:**
    - Detección reactiva de la fecha del sistema (`Date()`) sincronizada con el periodo lectivo (`2026-09-06`).
    - *Banner Informativo Superior:* Indicador con estado activo (`animate-ping`), fecha completa, semana de actividades lectivas y botón directo con `MapPin` (*"Localizar Día de Hoy en el Calendario"*).
    - *Resaltado en Vista Panorámica (14 Meses):* Cabecera del mes con insignia `Mes de Hoy`, anillo de contorno `ring-[2.5px] ring-[#0284c7]`, micro-etiqueta `"HOY"`, estrella superior flotante y animación de respiración armónica.
    - *Resaltado en Vista Mensual Detallada:* Celda resaltada con anillo triple `ring-[3px] ring-[#0284c7]`, badge `HOY` en esquina superior y leyenda de ubicación temporal *"📍 Día en el que te encuentras"*.
  - **Navegación Limpia y Directa:** Se eliminó la tarjeta modal flotante superpuesta para garantizar máxima fluidez y visibilidad panorámica de los 14 meses y de la vista mensual, mostrando los detalles directamente en cada celda y mediante tooltips nativos accesibles sin interrumpir la visualización.

---

## 9. Política de Estandarización Lingüística Institucional (100% Español)
- **Alcance:** Todas las vistas, componentes de navegación, diálogos modales, adaptadores de documentos y microtextos de estado.
- **Cumplimiento:** Cero anglicismos en la interfaz de usuario para preservar la fidelidad institucional del Tecnológico de Estudios Superiores de Chimalhuacán (TESChi).
- **Adecuaciones Clave Realizadas:**
  - `Navbar`: Renombrado de `Dashboard` a `Panel Principal`; etiquetas de accesibilidad `aria-label` formalizadas en español (`Regresar al Panel Principal`).
  - `ReinscripcionGrupoView`: Sustitución integral de encabezados (`Selecciona tu Grupo`), etiquetas flotantes (`Selección de Grupo`), placeholders (`Seleccionar un grupo...`) y ayudas de selección de horarios.
  - `PWAInstallButton`: Botones y diálogos en español (`Instalar Aplicación`, `Instalar en iPhone`, instrucciones de Safari detalladas).
  - `OfflineIndicator`: Indicadores de estado de red en español (`Modo Sin Conexión Activo`, `Sincronización en segundo plano pendiente`).
  - `BiometricEnrollModal` & `SeguridadView`: Descripciones de métodos de autenticación formalizados como `huella digital, reconocimiento facial o llave de seguridad`.
  - `App.tsx`: Captura de errores con títulos en español (`Error al cargar el Panel Principal`).

---

## Próximas Modificaciones Técnicas Programadas
1. Implementación de sincronización bidireccional en segundo plano mediante Background Sync API de Service Worker para envíos diferidos de reinscripción sin cobertura de red.
2. Integración de firma electrónica avanzada (FIEL / e.firma) como alternativa de validación para trámites de titulación y servicio social.
3. Incorporación de notificaciones push nativas en Capacitor y Web Push para avisos de publicación de calificaciones.
