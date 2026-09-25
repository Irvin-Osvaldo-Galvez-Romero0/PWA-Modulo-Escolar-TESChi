# ANTEPROYECTO DE RESIDENCIA PROFESIONAL
## Tecnológico de Estudios Superiores de Chimalhuacán (TESChi)
### División de Ingeniería en Sistemas Computacionales
**Área de Adscripción:** Departamento de Ciencias Básicas  
**Proyecto:** Desarrollo e Implementación de una Aplicación Web Progresiva (PWA) Offline-First para el Módulo Auxiliar de Servicios y Gestión Escolar  
**Estudiante / Residente:** Irvin Osvaldo Gálvez Romero  
**Marco Normativo de Referencia:** ISO/IEC 25010, ISO/IEC 27001, ISO 9241-110, W3C PWA  

---

## 1. PROBLEMÁTICA DE LA RESIDENCIA PROFESIONAL

Al iniciar la residencia profesional en el **Tecnológico de Estudios Superiores de Chimalhuacán (TESChi)**, asignado al **Departamento de Ciencias Básicas**, se identificó que la administración, seguimiento y consulta de procesos escolares de los estudiantes presenta serias limitaciones operativas y tecnológicas derivadas de la dependencia exclusiva de sistemas web centralizados tradicionales y de la infraestructura de conectividad en el campus.

El Departamento de Ciencias Básicas atiende a la totalidad de la matrícula estudiantil de nuevo ingreso y semestres formativos de todas las carreras de ingeniería y licenciaturas del instituto, coordinando asignaturas nodales de alta demanda (Cálculo Diferencial, Cálculo Integral, Álgebra Lineal, Física, Química, Probabilidad y Estadística). Durante las jornadas de reinscripción, consulta de horarios, verificación de calificaciones (kardex) y emisión de comprobantes, se presentan las siguientes problemáticas organizadas de forma jerárquica:

```
┌─────────────────────────────────────────────────────────────────────────┐
│              JERARQUÍA DE LA PROBLEMÁTICA OPERATIVA                     │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Nivel Crítico: Caídas de Conectividad y Saturación Concurrente       │
│    - Picos masivos de peticiones que colapsan portales tradicionales.   │
│    - Cobertura celular inestable en aulas, pasillos y transporte.       │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Nivel Transaccional: Pérdida de Datos y Trámites Incompletos        │
│    - Aborto de reinscripción al cortarse la conexión a mitad de carga.  │
│    - Inconsistencias entre cupos seleccionados y registros finales.     │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Nivel Administrativo: Sobrecarga en Ventanillas de Ciencias Básicas  │
│    - Filas presenciales masivas por alumnos sin acceso a su estatus.    │
│    - Aclaraciones manuales de carga horaria y validación de materias.   │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. Nivel Usuario: Inaccesibilidad y Dependencia de Datos Móviles        │
│    - Imposibilidad de consultar comprobantes o códigos QR offline.      │
│    - Barreras en dispositivos modestos (almacenamiento y hardware).     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Nivel Crítico: Saturación de Servidores y Vulnerabilidad ante la Red Móvil
Durante los periodos de alta concurrencia académica, los servidores institucionales tradicionales experimentan saturación por avalancha de peticiones HTTP simultáneas, provocando denegación de servicio, latencias excesivas (>10 segundos) o caídas totales de la plataforma. A esto se suma que la infraestructura de telecomunicaciones dentro del campus y en las zonas aledañas del municipio de Chimalhuacán presenta intermitencia, zonas de sombra y microcortes de red móvil, impidiendo que los alumnos carguen las páginas del sistema escolar en el momento exacto en que requieren realizar o consultar sus trámites.

### 1.2. Nivel Transaccional: Pérdida de Datos y Bloqueo de Trámites
En las aplicaciones web tradicionales monolíticas, si un estudiante pierde la señal de internet mientras selecciona sus grupos o confirma su reinscripción, la transacción se interrumpe abruptamente sin que exista memoria local en el cliente. Esto obliga al alumno a reiniciar el proceso desde cero, perdiendo frecuentemente los cupos disponibles en asignaturas críticas de ciencias básicas y generando estados inconsistentes en la base de datos.

### 1.3. Nivel Administrativo: Saturación de Ventanillas y Carga Burocrática
La falta de una herramienta digital resiliente que funcione aún en condiciones de desconexión obliga a cientos de alumnos a acudir físicamente a las oficinas del Departamento de Ciencias Básicas para solicitar reimpresión de comprobantes, aclaración de horarios y validación de estatus académico, congestionando las instalaciones y consumiendo horas de trabajo del personal docente y administrativo.

### 1.4. Nivel de Usuario: Brecha Digital y Dependencia Permanente de Datos Móviles
Gran parte de la comunidad estudiantil cuenta con dispositivos móviles heterogéneos de gama media o baja con planes de datos celulares limitados o agotados. Exigir la descarga de aplicaciones nativas pesadas (50 a 100 MB) desde tiendas de aplicaciones (Play Store / App Store) impone barreras de memoria y costos adicionales, mientras que una web tradicional no permite abrir el comprobante de reinscripción o el horario una vez que el alumno se queda sin conexión activa.

---

## 2. JUSTIFICACIÓN DEL PROYECTO

### 2.1. ¿Cuál es la finalidad de este trabajo?
La finalidad de este proyecto de residencia profesional es diseñar, construir e implementar una **Aplicación Web Progresiva (PWA) con Arquitectura Offline-First Basada en Componentes y Adaptadores (OF-CDA)** para el Departamento de Ciencias Básicas del TESChi, que actúe como un módulo escolar auxiliar de alta disponibilidad. Su propósito primordial es desacoplar la experiencia del usuario y la persistencia de datos de la presencia continua de red, permitiendo que la comunidad estudiantil consulte expedientes, gestione reinscripciones y visualice comprobantes oficiales de forma inmediata, ininterrumpida y segura.

### 2.2. ¿Qué pretendes alcanzar o resolver?
Se pretende resolver de raíz la fragilidad transaccional provocada por las caídas de internet y la saturación de servidores mediante:
1. **Disponibilidad Permanente (Offline-First):** Garantizar que el 100% de las interfaces clave (Dashboard, Kardex, Horarios, Comprobantes de Reinscripción) sean plenamente funcionales y consultables sin conexión activa mediante *Service Workers* y almacenamiento local estructurado en *IndexedDB*.
2. **Cero Pérdida de Información:** Implementar una cola de sincronización asíncrona en segundo plano (*SyncQueue*) que capture y resguarde las confirmaciones de trámites realizadas sin red, transmitiéndolas automáticamente al servidor central al restablecerse la conectividad.
3. **Descongestión de Oficinas Administrativas:** Dotar al estudiante de un comprobante académico digital autocontenido con folio formal y código QR institucional que puede descargarse en PDF o imprimirse localmente sin requerir validación presencial en ventanilla.
4. **Resiliencia y Rendimiento Superior:** Reducir los tiempos de carga a menos de 50 ms para vistas cacheadas y garantizar el cumplimiento estricto de las normas **ISO/IEC 25010** (calidad de software) e **ISO/IEC 27001** (seguridad de la información).

### 2.3. ¿Hasta dónde deseas llegar al respecto? (Alcance y Delimitación)
* **Alcance Técnico:**
  - Desarrollo de una SPA (Single Page Application) PWA instalable multiplataforma (Android, iOS, Windows, macOS, Linux) con peso inferior a 3 MB.
  - Implementación del App Shell estático inmutable con estrategias de caché diferenciadas (*Cache-First* para assets, *Network-First* con fallback a caché para datos dinámicos y *Stale-While-Revalidate* para catálogos).
  - Capa de persistencia local transaccional mediante base de datos NoSQL nativa del navegador (*IndexedDB: TESChi_Escolar_DB*) con mecanismo de fallback resiliente a *localStorage*.
  - Microservidor backend ligero en Node.js y Express con endpoints REST `/api/v1/*` para autenticación, kardex, oferta de asignaturas de ciencias básicas y procesamiento de reinscripción.
  - Generación de comprobantes oficiales con validación QR y estilos optimizados para impresión formal `@media print`.
* **Delimitación:**
  - El sistema operará como módulo auxiliar del Departamento de Ciencias Básicas y enlace con Servicios Escolares; no sustituye la base de datos de nómina ni sistemas contables institucionales ajenos al ámbito académico-estudiantil.
  - La sincronización asíncrona opera en el ámbito del navegador del alumno mediante eventos nativos de conectividad del dispositivo.

### 2.4. ¿Qué orientación pretendes seguir?
Se adoptará un enfoque metodológico mixto basado en:
- **Desarrollo Guiado por Componentes (Component-Driven Development - CDD):** Construcción modular y aislada de átomos, moléculas y organismos visuales reutilizables, blindados mediante límites de contención de errores (*ErrorBoundary* según ISO 9241-110).
- **Patrón Arquitectónico en Capas con Adaptadores (Hexagonal Light):** Separación rigurosa entre la interfaz de usuario en React, el orquestador central de estado (`App.tsx`), los servicios de negocio (`ApiClient`, `AuthService`, `SyncQueue`) y los adaptadores de infraestructura (`StorageAdapter`, `DocumentAdapter`).
- **Residuality Theory (Barry O'Reilly):** Modelado de estresores de red, de carga concurrente y de datos para diseñar un sistema residual antifrágil que sobreviva ante fallas extremas de infraestructura.
- **Estándares Web y Accesibilidad:** Cumplimiento de las especificaciones W3C PWA, Web App Manifest, Service Workers 1.0 y pautas WCAG 2.1 nivel AA en contraste cromático y ergonomía táctil.

### 2.5. ¿Cuáles son las posibles respuestas al problema planteado?

| Alternativa Tecnológica | Viabilidad Offline | Costo de Despliegue | Consumo de Datos / Almacenamiento | Veredicto Técnico |
| :--- | :---: | :---: | :---: | :--- |
| **Web Tradicional Multi-Página (MPA)** | **Nula** (pantalla en blanco sin red) | Bajo | Recarga completa del DOM en cada clic (>2 MB por pantalla) | **Inviable:** Colapsa en campus y no tolera microcortes. |
| **App Móvil Nativa (Android / iOS)** | Alta (requiere desarrollo doble) | Muy Alto (dos bases de código) | Descarga pesada (50–100 MB en tienda), inaccesible en PC | **Descartada:** Excluye alumnos sin espacio o en laptops. |
| **PWA Offline-First OF-CDA (Nuestra Solución)** | **Total** (IndexedDB + Service Worker) | **Óptimo** (código único multiplataforma) | **< 3 MB totales**, datos cacheados, cero costo en tiendas | **Seleccionada:** Máxima disponibilidad, universal y costo cero. |

---

## 3. OBJETIVOS DEL PROYECTO

### 3.1. Objetivo General
**Construir** para el Tecnológico de Estudios Superiores de Chimalhuacán (TESChi), adscrito al Departamento de Ciencias Básicas, una Aplicación Web Progresiva (PWA) multiplataforma basada en la metodología de arquitectura por componentes *Offline-First* (OF-CDA), que opere con almacenamiento local en IndexedDB, estrategias de caché con Service Workers y sincronización asíncrona de mutaciones, con la finalidad de erradicar la pérdida de datos por intermitencia de red, eliminar la saturación de ventanillas y garantizar la consulta continua del kardex, oferta académica y comprobantes de reinscripción con código QR en un periodo de desarrollo de **500 horas lectivas (4 a 6 meses)**.

### 3.2. Objetivos Específicos
A partir de la taxonomía de verbos de ingeniería aplicables al anteproyecto, se definen los siguientes objetivos específicos:

1. **Inventariar** los requisitos funcionales, flujos de reinscripción y reglas de validación de asignaturas de ciencias básicas (cálculo, álgebra, física y química) mediante entrevistas con el personal administrativo y análisis de la normativa escolar.
2. **Planear** la arquitectura de software en capas desacopladas aplicando el patrón *Hexagonal Light* y el modelado de estresores de conectividad basado en *Residuality Theory*.
3. **Diseñar** las interfaces de usuario (UI/UX) institucionales accesibles bajo los lineamientos WCAG 2.1 AA e ISO 9241-110, integrando el logotipo oficial vectorial y la paleta cromática del TESChi.
4. **Programar** el frontend reactivo modular en TypeScript y React 18 con Vite, estructurando los componentes bajo el enfoque de desarrollo guiado por componentes (CDD).
5. **Construir** la capa de persistencia local transaccional utilizando la API nativa de *IndexedDB* (`TESChi_Escolar_DB`) y diseñar la cola de sincronización en segundo plano (*SyncQueue*) con reintentos exponenciales automáticos.
6. **Implementar** el ciclo de vida del *Service Worker* con Workbox, configurando políticas deterministas de almacenamiento (*Cache-First* para App Shell y *Network-First* con fallback local para endpoints de la API).
7. **Desarrollar** el microservidor backend en Node.js y Express para la simulación y despacho de endpoints REST `/api/v1/*`, aplicando filtros de seguridad CORS, cabeceras CSP y empaquetado optimizado con *esbuild*.
8. **Probar y comprobar** la resiliencia del sistema ante escenarios de desconexión total (modo avión), validando el rendimiento con Google Lighthouse (PWA 100%, Core Web Vitals LCP < 2.5s) y la calidad de código según la norma ISO/IEC 25010.
9. **Organizar y documentar** el paquete técnico de entrega, incluyendo la bitácora de modificaciones, el catálogo formal de diagramas de arquitectura en Archify/Mermaid y la guía de despliegue para la infraestructura del instituto.
