# Metodología, Arquitectura y Tecnologías de la PWA
## Módulo Auxiliar de Servicios Escolares - TESChi (Tecnológico de Estudios Superiores de Chimalhuacán)
**Documento Técnico Oficial de Metodología y Selección Tecnológica**  
**Versión:** 2.1.0 Multiplataforma (PWA / Web / Escritorio)  
**Estándares de Referencia:** ISO/IEC 25010 (Calidad del Producto Software), ISO 9241-110 (Ergonomía de Interacción Persona-Sistema), ISO/IEC 27001 (Seguridad de la Información).

---

## 1. Introducción y Contexto del Proyecto

El **Módulo Auxiliar de Servicios Escolares del TESChi** es una solución informática concebida para brindar a la comunidad estudiantil una herramienta ágil, confiable y de alta disponibilidad para efectuar trámites académicos críticos:
1. **Autenticación Institucional Segura:** Acceso por matrícula escolar mediante contraseña institucional o PIN de 4 dígitos.
2. **Proceso Integral de Reinscripción:** Selección de grupo, armado de carga académica semestral, validación de créditos y emisión de comprobante oficial.
3. **Consulta Histórica de Kardex:** Visualización del historial académico semestral con desglose de materias, calificaciones y estatus de acreditación.
4. **Registro a Cursos Intersemestrales:** Formato oficial (FOR-002) de regularización y avance curricular.

Para resolver los desafíos que experimentan las plataformas educativas tradicionales (saturación de servidores en periodos de inscripción, pérdida de datos por caídas de red móvil, inaccesibilidad en equipos antiguos o heterogéneos), se adoptó una **Metodología de Arquitectura PWA Offline-First Basada en Componentes y Adaptadores (OF-CDA)**.

---

## 2. Metodología de Desarrollo Implementada: OF-CDA (Offline-First Component-Driven Architecture)

### 2.1. Fundamentos de la Metodología Offline-First
La metodología **Offline-First** establece que una aplicación debe diseñarse asumiendo que **la red es un recurso intermitente, no garantizado o ausente por defecto**. En lugar de condicionar la interfaz al éxito inmediato de una petición HTTP remota:
- El estado de la interfaz se alimenta primordialmente del **almacenamiento local estructurado** (IndexedDB / Cache API).
- Las operaciones transaccionales (por ejemplo, guardar una selección de materias o confirmar una solicitud) se procesan localmente de forma inmediata y se registran en una **cola de sincronización asíncrona** (`SyncQueue`).
- Cuando la conectividad se restablece, el Service Worker o el despachador reactivo sincroniza silenciosamente las transacciones con el servidor REST.

### 2.2. Desarrollo Guiado por Componentes (Component-Driven Development - CDD)
La construcción del frontend se organizó de forma modular y aislada:
- **Átomos y Moléculas:** Componentes reutilizables con responsabilidades atómicas (`TeschiLogo`, `Navbar`, `OfflineIndicator`, `ErrorBoundary`, `PWAInstallButton`).
- **Organismos (Vistas Especializadas):** Pantallas completas desacopladas que reciben propiedades (`props`) y notifican eventos hacia el orquestador (`LoginView`, `DashboardView`, `ReinscripcionGrupoView`, `ReinscripcionCargaView`, `ComprobanteReinscripcionView`, `KardexView`, `ComprobanteIntersemestralView`).
- **Ventaja Metodológica:** Cada vista es autónoma, fácil de auditar, auditable bajo accesibilidad y reemplazable sin efectos secundarios en el resto del árbol de React.

### 2.3. Patrón Arquitectónico en Capas con Adaptadores (Hexagonal Light)
Se diseñó una estructura de software desacoplada de la infraestructura subyacente mediante el patrón **Adapter**:
```
┌──────────────────────────────────────────────────────────┐
│             Capa de Presentación (React Views)           │
├──────────────────────────────────────────────────────────┤
│             Orquestador Central de Flujo (App.tsx)       │
├──────────────────────────────────────────────────────────┤
│          Capa de Servicios y Lógica de Negocio           │
│   (ApiClient, AuthService, SyncQueue, MockData)          │
├──────────────────────────────────────────────────────────┤
│             Capa de Adaptadores de Plataforma            │
│   (StorageAdapter, DocumentAdapter, BiometricsAdapter)   │
├──────────────────────────────────────────────────────────┤
│       Almacenamiento Local (IndexedDB) / Servidor REST   │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Pila Tecnológica (Tech Stack) y Justificación Técnica

| Capa / Dominio | Tecnología Seleccionada | Versión | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Framework UI** | **React** | 18.3+ | Paradigma funcional, Virtual DOM de alto rendimiento, gestión de estados complejos con hooks nativos (`useState`, `useEffect`, `useRef`), ecosistema masivo y compatibilidad universal con navegadores modernos. |
| **Lenguaje** | **TypeScript** | 5.5+ | Tipado estático estricto en tiempo de compilación. Previene el 90% de los errores de datos nulos/indefinidos en peticiones académicas complejas (calificaciones, semestres, cargas horarias). |
| **Empaquetador & Dev Server** | **Vite** | 5.4+ | Arquitectura nativa sobre ESM (ECMAScript Modules), arranque instantáneo en milisegundos, optimización de empaquetado de producción con *tree-shaking* profundo y plugins PWA de primer nivel. |
| **Motor de Estilos** | **Tailwind CSS** | 4.0+ | Sistema de clases de utilidad atómicas compiladas a CSS minúsculo sin duplicación. Soporte nativo para Safe Areas móviles (`pt-safe`, `pb-safe`), breakpoints responsivos (`sm:`, `md:`, `lg:`) y diseño visual institucional. |
| **Motor de Animaciones** | **Motion (`motion/react`)** | 12.0+ | Orquestación de transiciones entre vistas (`AnimatePresence`), feedback táctil en botones y micro-interacciones sin bloquear el hilo principal de JavaScript. |
| **Iconografía** | **Lucide React** | 0.400+ | Set de iconos vectoriales SVG limpios, consistentes, escalables y con carga modular tree-shakeable (cero peso innecesario). |
| **Backend & API Mock** | **Node.js + Express** | Express 4.x | Servidor backend ultraligero que implementa los endpoints REST `/api/v1/*` de perfil, grupos, materias, kardex y autenticación, sirviendo la SPA en un único puerto unificado (3000). |
| **Compilador Backend** | **esbuild** | 0.21+ | Compila el backend TypeScript a un bundle CommonJS (`dist/server.cjs`) ultra rápido en menos de 100 ms para despliegues en contenedores Cloud Run. |
| **Caché & Service Worker** | **Vite PWA / Workbox** | 0.20+ | Generación determinista del manifiesto de pre-caché para activos estáticos (HTML, JS, CSS, SVG) y políticas de almacenamiento en red. |
| **Almacenamiento Local** | **IndexedDB (W3C)** | N/A | Base de datos NoSQL transaccional nativa del navegador con soporte para miles de registros académicos y consultas asíncronas estructuradas. |

---

## 4. Implementación Técnica de la PWA (Paso a Paso)

### 4.1. Web App Manifest (`manifest.json` / `vite-plugin-pwa`)
Se configuró en el empaquetador Vite el manifiesto de la aplicación para cumplir con los estándares de la W3C y permitir la instalación directa:
- **`display: "standalone"`:** La aplicación se abre en una ventana independiente, sin la barra de direcciones ni controles del navegador, ofreciendo una experiencia idéntica a una app de tienda de aplicaciones.
- **`start_url: "/"`:** Punto de entrada predeterminado en el portal de acceso.
- **`theme_color: "#012d1d"`:** Color institucional verde bosque aplicado a la barra de estado de Android e iOS.
- **`background_color: "#f8f9fa"`:** Color neutro para evitar destellos en blanco durante la carga.
- **`icons`:** Iconos vectoriales de alta definición (`/icon.svg` y `/teschi-logo.svg`) escalables desde 192x192 hasta 512x512 píxeles con propósito `any maskable`.

### 4.2. Estrategias de Cacheo con Service Worker
La PWA implementa tres políticas de caché combinadas mediante el Service Worker:
1. **Precaching (Cache-First para Activos Críticos):** El bundle de scripts (`index-[hash].js`), estilos compilados, tipografías y el logotipo oficial institucional se descargan y persisten en la instalación.
2. **Network-First con Fallback a Caché para Datos Dinámicos:** Las llamadas a `/api/v1/academic/*` intentan primero obtener la versión más reciente del servidor; si el estudiante no tiene señal, el Service Worker devuelve inmediatamente la última respuesta cacheada.
3. **Stale-While-Revalidate para Documentos Estáticos:** Los formatos de catálogo de asignaturas y grupos se sirven inmediatamente desde caché local mientras en segundo plano se descarga cualquier actualización de cupos.

### 4.3. Detección de Conectividad y Adaptación de Interfaz
El componente `OfflineIndicator.tsx` monitorea los eventos nativos `window.addEventListener('online')` y `window.addEventListener('offline')`. Ante una desconexión, la interfaz:
- Despliega una alerta no intrusiva con el icono de modo sin conexión.
- Garantiza la navegación irrestricta en el Dashboard y la consulta del Kardex.
- Mantiene habilitado el comprobante de reinscripción con sus datos y código QR institucional.

---

## 5. Arquitectura de Servicios y Adaptadores

### 5.1. `ApiClient.ts` (Cliente de Comunicación y Fallback)
Encapsula todas las peticiones hacia la API REST institucional con manejo defensivo de respuestas:
- **Validación de Arreglos:** Garantiza que propiedades como listas de semestres o asignaturas no provoquen errores en tiempo de ejecución (`safeHistory = Array.isArray(...)`).
- **Sincronización Local:** Ante fallas de red, recurre automáticamente a los datos almacenados en `storageAdapter.ts`.

### 5.2. `StorageAdapter.ts` (Abstracción de Persistencia Local)
Implementa la interfaz `IStorageAdapter`:
- Utiliza **IndexedDB** (`TESChi_Escolar_DB`) como almacén primario de alta capacidad para objetos complejos (expediente del alumno, comprobantes y cola de sincronización).
- Implementa **fallback automático a `localStorage`** en caso de que el navegador opere en modo incógnito estricto con IndexedDB restringido.
- Provee almacenamiento seguro en memoria para tokens transaccionales de sesión.

### 5.3. `SyncQueue.ts` (Cola de Sincronización en Segundo Plano)
Maneja las operaciones efectuadas fuera de línea:
- Si el alumno confirma su reinscripción sin internet, la petición se encapsula como un `QueuedSyncItem` con identificador único y estampilla de tiempo en IndexedDB.
- Se suscribe al evento `online` del navegador para vaciar la cola mediante reintentos exponenciales cuando se recupera la conectividad.

### 5.4. `DocumentAdapter.ts` (Generación y Descarga Multiplataforma)
Resuelve la exportación de comprobantes oficiales sin dependencias binarias pesadas:
- En **Web / PWA:** Invoca `window.print()` con hojas de estilo optimizadas `@media print` que formatean el documento en tamaño carta institucional con encabezados oficiales y código QR.
- En **Móviles Nativos / Capacitor:** Enlaza con el sistema de archivos seguro (`Filesystem`) o la hoja de compartir nativa del sistema operativo (`Share API`).
- En **Escritorio / Tauri:** Se conecta al diálogo nativo de guardado del sistema operativo del usuario.

### 5.5. `AuthService.ts` (Seguridad de Acceso Escolar)
Gestiona la autenticación estudiantil en dos etapas:
- **Etapa 1 (Verificación):** Comprobación de matrícula en el padrón institucional y recuperación de métodos registrados.
- **Etapa 2 (Validación de Credenciales):** Validación criptográfica de contraseña o PIN escolar de 4 dígitos.

---

## 6. Manejo de Flujo de Estados y Navegación entre Vistas

La aplicación emplea un **modelo de flujo de datos unidireccional** orquestado centralmente en `src/App.tsx`:

```
┌─────────────────────────────────────────────────────────────┐
│                       src/App.tsx                           │
│   (Estados: isAuthenticated, currentView, student, etc.)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Prop Drilling / Callbacks)
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  LoginView   │       │DashboardView │       │ Reinscrip... │
│  (Auth Flow) │       │(Hub Central) │       │ (Asistente)  │
└──────────────┘       └──────────────┘       └──────────────┘
```

### 6.1. Estados Centralizados en `App.tsx`
- `isAuthenticated: boolean`: Controla si el usuario está en el portal de acceso (`false`) o dentro del sistema académico (`true`).
- `currentView: string`: Almacena el identificador de la vista activa (`'dashboard'`, `'reinscripcion_grupo'`, `'reinscripcion_carga'`, `'comprobante_reinscripcion'`, `'kardex'`, `'seguridad'`, `'comprobante_intersemestral'`).
- `student: StudentProfile | null`: Registro completo del estudiante autenticado.
- `selectedGroupId`, `selectedCourseCodes`: Estados compartidos entre los pasos del asistente de reinscripción.

### 6.2. Asistente Guiado de Reinscripción (Wizard Pattern)
La reinscripción se divide en vistas secuenciales para evitar sobrecarga de información:
1. **`reinscripcion_grupo`:** El estudiante compara y selecciona el grupo (horarios, turnos y docentes).
2. **`reinscripcion_carga`:** Visualiza las asignaturas asociadas al grupo elegido, verifica créditos máximos permitidos y confirma la carga.
3. **`comprobante_reinscripcion`:** Presenta el documento consolidado con folio oficial, firma digital institucional y opciones de impresión/descarga.

### 6.3. Transiciones Fluidas con `AnimatePresence`
Todas las vistas se renderizan dentro de un bloque animado de `motion/react` con transiciones de opacidad y desplazamiento suave (`fade-in` de 200 ms), eliminando los parpadeos bruscos característicos de las páginas web convencionales.

### 6.4. Aislamiento y Resiliencia con `ErrorBoundary`
Cada vista principal se encuentra envuelta en un contenedor `ErrorBoundary`. Si se produce una anomalía aislada en la renderización de un componente secundario, el límite de errores atrapa la excepción, evitando la caída general del sistema y permitiendo al estudiante recargar la vista con un solo clic.

---

## 7. ¿Por Qué se Eligió Esta Metodología y Stack?

La decisión de adoptar esta metodología y arquitectura responde directamente a las necesidades operativas de la comunidad estudiantil de TESCHI:

1. **Heterogeneidad de Dispositivos:** Los alumnos acceden desde teléfonos móviles económicos (Android con versiones diversas), computadoras personales con Windows/macOS/Linux o terminales de cómputo universitarias. Una PWA garantiza el **100% de compatibilidad sin requerir instalaciones pesadas**.
2. **Conectividad Inestable en el Campus y Transporte:** La señal de red celular en áreas de Chimalhuacán y dentro de las aulas puede sufrir interrupciones. El enfoque **Offline-First** permite que un estudiante consulte su horario o comprobante ya emitido sin importar si tiene datos móviles activos.
3. **Distribución Instantánea Sin Tiendas de Apps:** La publicación de una app en Google Play Store o Apple App Store implica semanas de revisión burocrática, comisiones y barreras para estudiantes con poco almacenamiento en su teléfono. La PWA se instala instantáneamente desde el navegador mediante un botón ligero (`PWAInstallButton`).
4. **Mantenimiento Ágil y Centralizado:** Una sola base de código en TypeScript y React atiende Web, Android, iOS y Escritorio. Las correcciones o actualizaciones son inmediatas para todos los usuarios sin exigirles actualizar manualmente una APK.

---

## 8. Análisis Comparativo con Otras Metodologías y Paradigmas

A continuación se contrastan las alternativas arquitectónicas evaluadas para el desarrollo del sistema:

### 8.1. PWA Offline-First (Nuestra Solución) vs. Aplicación Web Tradicional Multi-Página (MPA)
- **MPA (Ej. PHP / JSP tradicional):** Cada clic recarga la página completa desde el servidor. Si la conexión falla a mitad del trámite de reinscripción, el estudiante pierde los datos del formulario y debe reiniciar.
- **PWA Offline-First:** La interfaz nunca se recarga; el estado vive en memoria local y los datos se preservan ante caídas de red. El tiempo de respuesta es casi instantáneo (< 50 ms).

### 8.2. PWA Offline-First vs. Aplicación Móvil Nativa Pura (Kotlin en Android / Swift en iOS)
- **Nativo Puro:** Ofrece el máximo rendimiento para videojuegos o procesamiento de video pesado, pero requiere **dos equipos de desarrollo distintos**, dos códigos fuente separados y no funciona en computadoras portátiles o navegadores web.
- **PWA Offline-First:** Provee rendimiento de 60 fps para interfaces de gestión académica, ocupa menos de 3 MB de almacenamiento (frente a 50–100 MB de una app nativa) y cubre el 100% de plataformas con un único código fuente.

### 8.3. PWA Offline-First vs. Frameworks Híbridos Empaquetados (Cordova / Capacitor Puro / Electron)
- **Híbridos Empaquetados Tradicionales:** Suelen arrastrar motores Chromium pesados (en escritorio consumen 200 MB de RAM) o requerir instalación obligatoria de archivos ejecutables (`.exe` / `.apk`) que muchos estudiantes no pueden instalar en equipos universitarios bloqueados por administradores.
- **PWA Offline-First:** Se ejecuta sobre el motor de renderizado nativo del sistema operativo sin sobrecarga adicional y ofrece compatibilidad web universal directa.

### 8.4. PWA Offline-First vs. Frameworks Full-Stack SSR (Next.js / Remix)
- **SSR Tradicional:** Requiere que cada solicitud viaje al servidor para pre-renderizar HTML en Node.js. Si el servidor universitario experimenta saturación o el alumno pierde conexión en el trayecto, la página arroja error 502 / 504.
- **PWA Offline-First (SPA + Service Worker):** El HTML y los componentes residen en el dispositivo del alumno. El servidor únicamente transfiere paquetes ligeros de datos JSON vía API REST.

---

## 9. Matriz Comparativa Exhaustiva: Pros y Contras

| Criterio de Evaluación | PWA Offline-First (Implementada) | Web Tradicional (MPA) | App Nativa (Android/iOS) | Framework SSR (Next.js) |
| :--- | :---: | :---: | :---: | :---: |
| **Disponibilidad Sin Conexión** | ⭐⭐⭐⭐⭐ **Excelente** (IndexedDB + Service Worker) | ❌ **Nula** (Requiere conexión continua) | ⭐⭐⭐⭐⭐ **Excelente** (SQLite nativo) | ⭐⭐ **Baja** (Depende del servidor) |
| **Costo y Tiempo de Desarrollo** | ⭐⭐⭐⭐⭐ **Óptimo** (1 base de código para todo) | ⭐⭐⭐⭐ **Medio** | ❌ **Muy Alto** (Equipos separados Android/iOS) | ⭐⭐⭐ **Medio** |
| **Consumo de Almacenamiento** | ⭐⭐⭐⭐⭐ **Mínimo** (< 4 MB en caché) | ⭐⭐⭐⭐⭐ **Ninguno** | ❌ **Pesado** (50 a 120 MB por app) | ⭐⭐⭐⭐ **Bajo** |
| **Fricción de Distribución** | ⭐⭐⭐⭐⭐ **Cero** (Acceso web + 1 clic para instalar) | ⭐⭐⭐⭐⭐ **Cero** (Acceso web) | ❌ **Alta** (Tiendas Google/Apple, login obligatorio) | ⭐⭐⭐⭐⭐ **Cero** (Acceso web) |
| **Resiliencia ante Picos de Servidor** | ⭐⭐⭐⭐⭐ **Máxima** (Tráfico descentralizado a JSON) | ❌ **Muy Vulnerable** (Colapso por renderizado HTML) | ⭐⭐⭐⭐ **Buena** (Consume solo APIs) | ⭐⭐ **Vulnerable** (Carga de CPU en SSR) |
| **Acceso a Hardware Avanzado** | ⭐⭐⭐ **Medio-Alto** (Cámara, GPS, WebAuthn, Storage) | ❌ **Bajo** | ⭐⭐⭐⭐⭐ **Total** (Acceso directo a APIs del SO) | ⭐⭐⭐ **Medio** |
| **Soporte Multiplataforma** | ⭐⭐⭐⭐⭐ **Universal** (Móvil, Tablet, Desktop, Mac, Win) | ⭐⭐⭐⭐⭐ **Universal** | ❌ **Limitado** (Solo sistemas operativos móviles) | ⭐⭐⭐⭐⭐ **Universal** |

### Análisis Detallado de Ventajas y Limitaciones:

#### Ventajas Destacadas (Pros):
1. **Velocidad de Carga Instantánea:** Gracias al pre-caché de Workbox y Vite, la aplicación abre en menos de un segundo tras la primera visita.
2. **Consistencia de Marca Oficial:** El componente `TeschiLogo` y los colores institucionales se renderizan idénticos en cualquier pantalla mediante SVG puro.
3. **Tolerancia a Errores:** La arquitectura con `ErrorBoundary` y la validación defensiva en `apiClient.ts` eliminan las caídas por inconsistencias de datos en tiempo de ejecución.
4. **Privacidad y Seguridad ISO 27001:** Los datos de sesión y credenciales temporales se manejan en memorias aisladas sin exponer tokens sensibles en texto plano.

#### Limitaciones y Mitigaciones (Contras):
1. **Compatibilidad Histórica en Navegadores Muy Antiguos:** Navegadores anteriores a 2017 pueden carecer de soporte completo para Service Workers modernos.
   - *Mitigación Aplicada:* Se implementó un fallback transparente para que la aplicación funcione como una SPA estándar si los Service Workers no están disponibles.
2. **Límites de Almacenamiento en iOS Safari:** Safari impone políticas de depuración de almacenamiento si una PWA no se utiliza durante periodos prolongados.
   - *Mitigación Aplicada:* Al sincronizar el estado crítico en la API REST institucional en cada inicio de sesión, los datos se reconstituyen instantáneamente al volver a ingresar.

---

## 10. Conclusiones y Recomendaciones de Operación

La adopción de la metodología **Offline-First Component-Driven Architecture (OF-CDA)** para el Módulo Auxiliar de Servicios Escolares del TESChi representa la mejor solución tecnológica para el contexto universitario actual:
- Garantiza que ningún estudiante pierda su trámite escolar por intermitencias en su conexión.
- Ofrece una experiencia de usuario moderna, fluida y con la identidad gráfica oficial de la institución.
- Optimiza los recursos computacionales de la universidad al reducir la carga sobre los servidores escolares durante las horas pico de reinscripción.
- Mantiene el sistema completamente alineado a las normas internacionales **ISO/IEC 25010**, **ISO 9241-110** e **ISO/IEC 27001**.

---

## 11. Documento Maestro de Arquitectura y Diagramación Técnica (Catálogo Baseline: 20 Diagramas)

El presente catálogo formaliza los 20 diagramas baseline que gobiernan el ciclo de vida, persistencia, seguridad, componentes y flujos de la aplicación conforme a las directrices de la arquitectura de software.

*(Ver especificación y renderizado de los 20 diagramas en el cuerpo principal de la arquitectura).*

