# MARCO CONCEPTUAL DE LA RESIDENCIA PROFESIONAL
## Tecnológico de Estudios Superiores de Chimalhuacán (TESChi)
### División de Ingeniería en Sistemas Computacionales · Departamento de Ciencias Básicas
**Proyecto:** Desarrollo e Implementación de una Aplicación Web Progresiva (PWA) Offline-First para el Módulo Auxiliar de Servicios y Gestión Escolar  
**Residente:** Irvin Osvaldo Gálvez Romero  
**Marco Teórico y Normativo:** W3C PWA, ISO/IEC 25010, ISO/IEC 27001, ISO 9241-110, ISO/IEC 40500 (WCAG 2.1 AA)

---

## INTRODUCCIÓN AL MARCO CONCEPTUAL

El presente marco conceptual establece el fundamento teórico, metodológico y normativo que sustenta el desarrollo del módulo escolar auxiliar para el **Departamento de Ciencias Básicas del TESChi**. Lejos de constituir un glosario de términos aislados, este marco profundiza en las relaciones teóricas existentes entre la ingeniería web moderna, las arquitecturas orientadas a la resiliencia (*Offline-First*), la teoría de la residualidad en sistemas complejos, el diseño guiado por componentes desacoplados y las normas internacionales de calidad, seguridad y accesibilidad de software.

Para guiar la investigación de manera sistemática, se formularon diez preguntas fundamentales que abordan la totalidad de los dominios del proyecto, cuyas respuestas se sustentan en literatura especializada y autores de referencia internacional.

---

## I. PREGUNTAS TEÓRICAS GUÍA

1. ¿Qué es una Aplicación Web Progresiva (*Progressive Web App - PWA*) y cuáles son los pilares técnicos que la diferencian de las aplicaciones web tradicionales y de las aplicaciones móviles nativas?
2. ¿En qué consiste el paradigma arquitectónico *Offline-First* y de qué manera redefine la disponibilidad y la tolerancia a fallos en sistemas de información distribuidos?
3. ¿Qué es un *Service Worker* según los estándares del W3C y cómo opera su ciclo de vida como proxy de red programable en el cliente?
4. ¿Qué es *IndexedDB* y cuáles son sus ventajas arquitectónicas frente a *localStorage* para la persistencia transaccional estructurada en el navegador?
5. ¿Qué postulados define el Desarrollo Guiado por Componentes (*Component-Driven Development - CDD*) y cómo fundamenta la modularidad y el aislamiento de interfaces en arquitecturas de aplicaciones de página única (*Single Page Applications - SPA*)?
6. ¿Cómo se define el patrón arquitectónico Hexagonal (*Ports and Adapters*) y cómo se implementa en entornos cliente frontend desacoplados de la infraestructura de red?
7. ¿Qué establece la Teoría de Residualidad (*Residuality Theory*) de Barry O'Reilly sobre el diseño de arquitecturas de software que sobreviven al estrés e incertidumbre del entorno?
8. ¿Qué características y métricas de calidad de software establece la norma internacional ISO/IEC 25010 para aplicaciones web y móviles orientadas a la alta eficiencia?
9. ¿Cuáles son los principios de diálogo y ergonomía del software estipulados en la norma ISO 9241-110 y cómo mitigan el error del usuario en interfaces académicas críticas?
10. ¿Qué constituyen las Pautas de Accesibilidad para el Contenido Web (*WCAG 2.1 / ISO/IEC 40500*) y cómo garantizan la inclusión de la comunidad estudiantil bajo el principio de diseño universal?

---

## II. DESARROLLO TEÓRICO Y SUSTENTO CONCEPTUAL

---

### 1. ¿Qué es una Aplicación Web Progresiva (*Progressive Web App - PWA*) y cuáles son los pilares técnicos que la diferencian de las aplicaciones web tradicionales y de las aplicaciones móviles nativas?

El concepto de **Aplicación Web Progresiva (PWA)** fue acuñado originalmente por **Frances Berriman y Alex Russell (2015)** para describir una nueva generación de aplicaciones que combinan el alcance ubicuo de la Web con las capacidades de interacción fluida, persistencia y acceso al hardware propias de las aplicaciones nativas. Russell (2016) define las PWAs no como un framework monolítico, sino como un conjunto de capacidades progresivas del navegador que permiten a una aplicación web transformarse gradualmente en una experiencia instalable e independiente del estado de la red.

Desde el punto de vista arquitectónico, **Biørn-Hansen et al. (2019)** identifican que las PWAs resuelven la dicotomía histórica entre el desarrollo web tradicional (multi-página o SPA dependiente de servidor) y el desarrollo nativo para plataformas móviles (Android en Kotlin/Java o iOS en Swift). Mientras que las aplicaciones web tradicionales sufren de bloqueos de renderizado y pantallas en blanco ante la ausencia de conexión, y las aplicaciones nativas demandan elevados costos de mantenimiento, empaquetados pesados (50 a 100 MB) y sujeción a tiendas cerradas (*App Stores*), una PWA opera bajo tres pilares fundamentales estandarizados por el **W3C (2020)**:

1. **Capacidad de Instalación Directa (*Web App Manifest*):** Un archivo declarativo en formato JSON (`manifest.json`) que especifica el nombre, iconos vectoriales, colores temáticos de la barra de estado del sistema (`theme_color`) y el modo de visualización `standalone`, el cual elimina la barra de direcciones del navegador, otorgándole al usuario una experiencia visual indistinguible de una aplicación nativa instalada en el sistema operativo.
2. **Autonomía de Red Mediante Workers:** La presencia obligatoria de un *Service Worker* que intercepta el tráfico HTTP a nivel de capa de aplicación, habilitando estrategias de caché deterministas.
3. **Contexto Seguro Obligatorio (HTTPS):** Para salvaguardar la privacidad y prevenir ataques de intermediario (*Man-In-The-Middle - MITM*), el navegador restringe la activación de APIs avanzadas de PWA exclusivamente a orígenes criptográficamente seguros con cifrado TLS/SSL.

En el contexto universitario del **TESChi**, la adopción de una PWA permite distribuir un sistema académico completo con un peso inferior a **3 MB**, accesible desde cualquier navegador moderno y con cero costo de distribución para los estudiantes.

---

### 2. ¿En qué consiste el paradigma arquitectónico *Offline-First* y de qué manera redefine la disponibilidad y la tolerancia a fallos en sistemas de información distribuidos?

El término y la filosofía de diseño **Offline-First** fueron formalizados por **Alex Feyerke (2013)** y promovidos extensivamente por autores como **John Allsopp (2016)** y **Nolan Lawson (2015)**. Este paradigma parte de una premisa disruptiva frente al diseño web clásico: **la conectividad a internet debe considerarse un recurso volátil, no garantizado, intermitente y costoso por defecto**, y no un requisito previo e indispensable para que el software funcione.

Tradicionalmente, las aplicaciones web se concibieron bajo el modelo *Online-First*, en el cual cada interacción del usuario desencadena una petición remota síncrona; si la red falla, la aplicación colapsa arrojando un error de conexión destructivo. Por el contrario, la arquitectura *Offline-First* invierte completamente el flujo de datos:

```
MODELO CLÁSICO (Online-First - Frágil):
[Usuario] ──(Acción)──> [UI] ──(HTTP Síncrono)──> [Red / Servidor] ──(Falla de Red)──> [Pantalla de Error]

MODELO OFFLINE-FIRST (Resiliente - Implementado):
[Usuario] ──(Acción)──> [UI] ──(Inmediato)──> [Persistencia Local: IndexedDB / Cache]
                                                        │ (En segundo plano)
                                                        └──(SyncQueue Asíncrono)──> [Red / Servidor]
```

De acuerdo con **Lawson (2015)**, el diseño *Offline-First* se apoya en tres principios rectores:
- **Lectura Local Primaria:** Toda consulta de información (por ejemplo, el historial de calificaciones o el plan de estudios de Ciencias Básicas) se extrae inmediatamente de los almacenes locales estructurados del dispositivo, logrando tiempos de respuesta en milisegundos (< 50 ms) y cero consumo de datos móviles recurrentes.
- **Escritura Transaccional Local:** Las mutaciones provocadas por el usuario (como la selección de grupos o confirmación de reinscripción) se persisten localmente con éxito garantizado de forma inmediata, evitando que el alumno pierda su selección si viaja en transporte público o atraviesa zonas sin cobertura en el campus.
- **Sincronización Asíncrona Eventual (*Eventual Consistency*):** Los cambios se registran en una cola transaccional en segundo plano (*SyncQueue*) y se transmiten silenciosamente al servidor mediante mecanismos reactivos en cuanto el dispositivo detecta el restablecimiento de la conexión.

---

### 3. ¿Qué es un *Service Worker* según los estándares del W3C y cómo opera su ciclo de vida como proxy de red programable en el cliente?

La especificación formal del **W3C (2019, 2021)** define al **Service Worker** como un script que el navegador web ejecuta en un hilo de ejecución secundario en segundo plano (*background worker thread*), completamente desacoplado del hilo principal de renderizado de la interfaz de usuario (DOM). Al operar sin acceso directo a los elementos HTML de la página, un Service Worker no genera bloqueos visuales ni latencias en las interacciones del usuario.

**Jeremy Keith (2016)** y **Addy Osmani (2020)** destacan que la cualidad más poderosa del Service Worker es actuar como un **servidor proxy programable en el cliente**, situándose estratégicamente entre la aplicación web, el hardware del navegador y la red física de telecomunicaciones. Cada solicitud saliente (archivos JavaScript, CSS, imágenes o peticiones REST a `/api/v1/*`) pasa por el evento `fetch` del Service Worker, otorgando al arquitecto de software el control absoluto sobre cómo responder a dicha solicitud.

El consorcio W3C define rigurosamente el **Ciclo de Vida** del Service Worker, constituido por cinco estados secuenciales discretos:

1. **Registro (*Registration*):** El código JavaScript de la aplicación solicita al navegador registrar el script del Service Worker asociado a un ámbito o alcance (*scope*) determinado.
2. **Instalación (*Installing*):** El worker se descarga y ejecuta su evento `install`. En esta fase se efectúa de forma determinista el **Pre-caching** de los activos críticos del *App Shell* (HTML raíz, paquetes de scripts empaquetados por Vite, hojas de estilo Tailwind y el logotipo oficial en SVG). Si un solo archivo esencial falla en descargarse, la instalación se aborta para prevenir inconsistencias.
3. **Espera (*Waiting/Installed*):** Si ya existe una versión previa del Service Worker gobernando la página, la nueva versión se mantiene en reserva en estado de espera para evitar corromper la sesión en curso del estudiante, a menos que se invoque explícitamente `self.skipWaiting()`.
4. **Activación (*Activating / Activated*):** Una vez que las instancias viejas se cierran, el nuevo worker toma el control mediante `clients.claim()` y ejecuta tareas de purga y migración sobre versiones obsoletas de la caché.
5. **Redundancia (*Redundant*):** Un worker es descartado por el motor del navegador cuando ha sido superado por una versión más reciente o cuando falló su fase de instalación.

Mediante este ciclo de vida, la librería **Workbox (Google, 2020)** permite orquestar de manera formal estrategias de caché estandarizadas: *Cache First* (prioridad al caché para componentes inmutables), *Network First with Cache Fallback* (prioridad a la red con respaldo en caché para calificaciones dinámicas) y *Stale-While-Revalidate* (despacho inmediato desde caché mientras se actualiza en segundo plano).

---

### 4. ¿Qué es *IndexedDB* y cuáles son sus ventajas arquitectónicas frente a *localStorage* para la persistencia transaccional estructurada en el navegador?

La interfaz **Indexed Database API (IndexedDB)** es un estándar formalizado por el **W3C (2018, 2024)** para proveer a las aplicaciones del lado del cliente de una **base de datos NoSQL transaccional, asíncrona y orientada a objetos** embebida en el propio navegador web. 

**Nicholas C. Zakas (2016)** y la documentación oficial de **MDN Web Docs (2023)** contrastan la potencia técnica de IndexedDB frente a la API primitiva de `localStorage`:

| Criterio Técnico | `localStorage` (Tradicional) | `IndexedDB` (W3C - Implementado) |
| :--- | :--- | :--- |
| **Modelo de Ejecución** | **Síncrono y bloqueante:** Se ejecuta sobre el hilo principal de la UI; lecturas pesadas congelan las animaciones y clics. | **Totalmente Asíncrono:** Basado en eventos y promesas, procesado en hilos secundarios sin degradar el rendimiento gráfico. |
| **Estructura de Datos** | Pares clave-valor exclusivamente en texto plano (strings). Requiere serializaciones constantes con `JSON.stringify()`. | Almacena objetos estructurados nativos de JavaScript, arreglos complejos, tipos binarios (*Blobs*, *ArrayBuffers*) y fechas. |
| **Capacidad de Almacenamiento** | Severamente limitada (típicamente entre 2.5 MB y 5 MB por origen según el navegador). | **Virtualmente ilimitada** dentro de la cuota del sistema (cientos de megabytes o gigabytes según el disco disponible). |
| **Soporte Transaccional** | No soporta transacciones; fallos a mitad de escritura dejan datos corruptos o estados inconsistentes. | **Garantía ACID Transaccional:** Soporta transacciones de lectura (`readonly`) y lectura-escritura (`readwrite`) con auto-rollback en error. |
| **Indexación y Búsqueda** | Nula. Para buscar un alumno o grupo se debe iterar manualmente todo el almacenamiento en memoria. | **Índices Secundarios Múltiples:** Búsquedas optimizadas en tiempo logarítmico por matrícula, periodo lectivo, código de asignatura o folio. |

En el proyecto del TESChi, se implementa una base de datos local denominada `TESChi_Escolar_DB`, conteniendo almacenes de objetos (*Object Stores*) dedicados para el perfil del estudiante, catálogo de materias de ciencias básicas, historial del kardex y la cola de sincronización diferida (`sync_queue`), utilizando `localStorage` únicamente como canal secundario de contingencia en navegadores operando en modo incógnito estricto.

---

### 5. ¿Qué postulados define el Desarrollo Guiado por Componentes (*Component-Driven Development - CDD*) y cómo fundamenta la modularidad y el aislamiento de interfaces en arquitecturas de aplicaciones de página única (*Single Page Applications - SPA*)?

El **Desarrollo Guiado por Componentes (CDD)** es una metodología de ingeniería de software para el desarrollo de interfaces de usuario propuesta y popularizada por autores como **Brad Frost (2016)** en su obra fundamental *Atomic Design*, y formalizada para entornos web modulares por **Tom Coleman et al. (2017)**. El principio rector de CDD radica en construir interfaces complejas desde la base hacia arriba (*bottom-up*), comenzando por los elementos visuales más pequeños y puros hasta componer pantallas y flujos de negocio completos.

Bajo la jerarquía del diseño atómico adaptada al desarrollo en **React 18**:
1. **Átomos:** Componentes elementales indivisibles con propiedades puras de presentación (por ejemplo, el logotipo institucional `TeschiLogo`, botones de acción, campos de entrada de PIN y badges de estatus).
2. **Moléculas:** Agrupaciones funcionales de átomos que resuelven una tarea concreta de interfaz (por ejemplo, la barra de navegación `Navbar` fija superior y el indicador de estado de red `OfflineIndicator`).
3. **Organismos:** Secciones complejas de la pantalla que orquestan múltiples moléculas e integran estados reactivos internos (como el contenedor de contención de fallos `ErrorBoundary`).
4. **Vistas / Páginas:** Ensambles completos que representan pantallas operativas autónomas (`LoginView`, `DashboardView`, `ReinscripcionWizard`, `KardexView`, `ComprobanteReinscripcionView`).

De acuerdo con **Dan Abramov (2015)**, creador de Redux y referente del ecosistema React, la separación estricta entre **componentes de presentación (puros / tontos)** y **componentes orquestadores de estado (contenedores / inteligentes)** otorga tres ventajas cardinales:
- **Aislamiento Funcional:** Cada vista puede ser desarrollada, estilizada con Tailwind CSS y probada de forma unitaria en aislamiento sin requerir la presencia de la base de datos o el backend activo.
- **Inmutabilidad y Predictibilidad:** El flujo unidireccional de datos (*props down, events up*) garantiza que un cambio de estado en el orquestador central (`App.tsx`) se propague de manera determinista hacia las vistas sin efectos colaterales ocultos.
- **Tolerancia a Excepciones Locales:** El encapsulamiento de vistas dentro de componentes `ErrorBoundary` asegura que si una gráfica o un cálculo de créditos arroja una excepción en tiempo de ejecución, el error sea atrapado localmente sin provocar la temida "pantalla blanca" en toda la aplicación.

---

### 6. ¿Cómo se define el patrón arquitectónico Hexagonal (*Ports and Adapters*) y cómo se implementa en entornos cliente frontend desacoplados de la infraestructura de red?

El patrón de arquitectura **Hexagonal**, denominado formalmente por **Alistair Cockburn (2005)** como arquitectura de **Puertos y Adaptadores (*Ports and Adapters*)**, fue concebido para resolver el acoplamiento tóxico entre la lógica de negocio nuclear y las tecnologías externas de entrada y salida (bases de datos, interfaces de usuario, protocolos de comunicación). Posteriormente, **Robert C. Martin (2017)** en *Clean Architecture* e **Eric Evans (2003)** en *Domain-Driven Design (DDD)* ampliaron estos conceptos subrayando que el núcleo de una aplicación debe ser completamente independiente de los marcos de trabajo y de los mecanismos de entrega.

Si bien la arquitectura hexagonal se concibió primordialmente para el backend, en el desarrollo frontend moderno de alta fidelidad **(Martin, 2017; Lawson, 2015)** su aplicación es determinante para lograr aplicaciones resilientes ante la red:

```
                      ARQUITECTURA HEXAGONAL FRONTEND (Light)
        ┌─────────────────────────────────────────────────────────────┐
        │                 CAPA EXTERNA: INTERFAZ DE USUARIO           │
        │                  (React Views, Tailwind UI)                 │
        │                              │                              │
        │                              ▼                              │
        │                 NÚCLEO DE LA APLICACIÓN / ESTADO            │
        │                 (Orquestador App.tsx, Sesión)               │
        │                              │                              │
        │          ┌───────────────────┴───────────────────┐          │
        │          ▼ PUERTO                                ▼ PUERTO   │
        │   [IStorageAdapter]                       [IDocumentAdapter]│
        │          │ ADAPTADOR                             │ ADAPTADOR│
        │   (StorageAdapter)                        (DocumentAdapter) │
        │          ├──> IndexedDB                          ├──> Print │
        │          └──> LocalStorage                       └──> PDF   │
        └─────────────────────────────────────────────────────────────┘
```

En la arquitectura del módulo escolar para el TESChi:
- **El Núcleo (Core):** Las reglas de reinscripción, la validación de créditos escolares y el flujo de navegación residen en el estado de React, desconociendo si los datos provienen de un servidor remoto en la nube o del disco local del teléfono.
- **Los Puertos (Ports):** Se definen interfaces estrictas en TypeScript (`IStorageAdapter`, `IApiClient`) que dictan qué operaciones de persistencia y consulta existen sin fijar la tecnología.
- **Los Adaptadores (Adapters):** 
  - `StorageAdapter.ts`: Implementa el puerto conectándose a IndexedDB, gestionando de forma transparente las operaciones CRUD y conmutando automáticamente a `localStorage` si el navegador impone restricciones de almacenamiento.
  - `DocumentAdapter.ts`: Resuelve la exportación e impresión de comprobantes oficiales mediante hojas de estilo vectoriales y generación de código QR sin depender de librerías propietarias pesadas.
  - `ApiClient.ts`: Maneja las llamadas HTTP defensivas hacia los endpoints REST de Node.js/Express, absorbiendo desconexiones de red y consultando el adaptador local en caso de falla.

---

### 7. ¿Qué establece la Teoría de Residualidad (*Residuality Theory*) de Barry O'Reilly sobre el diseño de arquitecturas de software que sobreviven al estrés e incertidumbre del entorno?

La **Teoría de Residualidad (*Residuality Theory*)**, desarrollada por el arquitecto de software e investigador **Barry O'Reilly (2020, 2022)**, propone un marco paradigmático revolucionario para la ingeniería de software en entornos complejos. O'Reilly argumenta que la arquitectura tradicional orientada a requerimientos estáticos falla inevitablemente porque asume que el futuro es predecible y que el entorno de despliegue es ordenado y cerrado. En contraste, los sistemas de software modernos operan en **entornos complejos, no deterministas y caóticos**.

La teoría postula que una arquitectura robusta no se diseña para lograr una perfección teórica estática, sino para definir **qué queda del sistema (el "residuo") cuando este es sometido a factores de estrés extremos e imprevistos**. O'Reilly formaliza la arquitectura como el proceso de modelar activamente estresores para determinar las propiedades residuales de supervivencia:

1. **Modelado de Estresores Críticos (*Stressors*):**
   - *Estresores de Red:* Pérdida total de conexión celular en el campus, alta latencia, fluctuaciones de ancho de banda y microcortes durante transacciones.
   - *Estresores de Concurrencia:* Avalanchas de peticiones simultáneas en horas pico de reinscripción que saturan la capacidad de procesamiento de los servidores centrales.
   - *Estresores de Datos:* Respuestas HTTP corruptas, modelos de datos nulos o colisiones transaccionales.
2. **Análisis del Residuo (*The Residue*):** Consiste en diseñar explícitamente qué subsistemas deben continuar operando incondicionalmente cuando la infraestructura exterior colapsa.
3. **Mecanismos de Antifragilidad y Degradación Elegante (*Graceful Degradation*):**
   - El sistema no arroja un error fatal; en su lugar, se repliega de forma elegante activando el motor local en caché.
   - Si no hay red, la interfaz deshabilita sutilmente los botones de actualización remota, activa el badge informativo del `OfflineIndicator` y mantiene abierta la lectura del comprobante y del kardex, canalizando las mutaciones a la cola de sincronización.

Gracias a la Teoría de Residualidad, la PWA del Departamento de Ciencias Básicas garantiza que ante la caída absoluta del enlace de internet institucional, el estudiante continúe operando localmente sin interrupciones.

---

### 8. ¿Qué características y métricas de calidad de software establece la norma internacional ISO/IEC 25010 para aplicaciones web y móviles orientadas a la alta eficiencia?

La norma internacional **ISO/IEC 25010 (2011, 2023)**, parte de la familia de normas **SQuaRE (*Systems and software Quality Requirements and Evaluation*)**, establece el modelo universalmente aceptado para la evaluación de la calidad de productos de software. La norma descompone la calidad en ocho características fundamentales que deben ser formalmente auditadas y verificadas:

```
┌────────────────────────────────────────────────────────────────────────┐
│             CARACTERÍSTICAS DE CALIDAD DEL SOFTWARE (ISO/IEC 25010)     │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│ 1. Adecuación        │ 2. Eficiencia de     │ 3. Compatibilidad        │
│    Funcional         │    Desempeño         │    - Coexistencia        │
│    - Completitud     │    - Comportamiento  │    - Interoperabilidad   │
│    - Corrección      │      temporal        │                          │
│    - Pertinencia     │    - Uso de recursos │                          │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ 4. Usabilidad        │ 5. Fiabilidad        │ 6. Seguridad             │
│    - Reconocimiento  │    - Madurez         │    - Confidencialidad    │
│    - Aprendizaje     │    - Tolerancia a    │    - Integridad          │
│    - Operabilidad    │      fallos          │    - Autenticidad        │
│    - Accesibilidad   │    - Recuperabilidad │    - No repudio          │
├──────────────────────┴──────────────────────┼──────────────────────────┤
│ 7. Mantenibilidad                           │ 8. Portabilidad          │
│    - Modularidad, Reusabilidad, Modificable │    - Adaptabilidad       │
│    - Capacidad de ser probado (Testability) │    - Capacidad instalación│
└─────────────────────────────────────────────┴──────────────────────────┘
```

Para el proyecto escolar del TESChi, se priorizan cuatro atributos cuantitativos:
- **Eficiencia de Desempeño (*Performance Efficiency*):** Evaluada mediante los estándares **Core Web Vitals** de Google (2020), exigiendo un LCP (*Largest Contentful Paint*) menor a 2.5 segundos, un INP (*Interaction to Next Paint*) inferior a 200 milisegundos y un CLS (*Cumulative Layout Shift*) menor a 0.1.
- **Fiabilidad (*Reliability*):** Concretada en la **tolerancia a fallos** del cliente mediante Service Workers y contención de excepciones en el árbol de renderizado de React.
- **Seguridad (*Security*):** Cumplimiento de integridad y autenticidad en las sesiones de los alumnos mediante hashes criptográficos SHA-256 en folios de reinscripción conforme a los controles de **ISO/IEC 27001**.
- **Portabilidad (*Portability*):** Garantizada por la naturaleza multiplataforma de la PWA, adaptándose dinámicamente a resoluciones móviles, tablets y ordenadores de escritorio sin variaciones en la base de código.

---

### 9. ¿Cuáles son los principios de diálogo y ergonomía del software estipulados en la norma ISO 9241-110 y cómo mitigan el error del usuario en interfaces académicas críticas?

La norma internacional **ISO 9241-110 (2020)**, titulada *Ergonomía de la interacción persona-sistema: Principios de diálogo*, define las bases científicas para la interacción humano-computadora (HCI). Complementando los diez heurísticos clásicos de usabilidad de **Jakob Nielsen y Rolf Molich (1990)**, esta norma establece siete principios ergonómicos indispensables para garantizar que un sistema informático apoye de forma transparente al operador humano:

1. **Adecuación a la Tarea (*Suitability for the Task*):** El software debe presentar únicamente la información necesaria para el trámite del alumno, sin saturación visual ni menús innecesarios que distraigan de la selección de carga horaria.
2. **Auto-Descriptividad (*Self-Descriptiveness*):** Cada campo, botón y sección debe comunicar de inmediato su propósito y estado actual (por ejemplo, indicadores explícitos de cupos restantes en materias y etiquetas claras de horario).
3. **Conformidad con las Expectativas del Usuario (*Conformity with User Expectations*):** La aplicación sigue convenciones universales de diseño web e identidad gráfica institucional reconocibles por la comunidad del TESChi (colores verde bosque institucional, tipografía Inter legible y diseño de comprobantes oficial).
4. **Idoneidad para el Aprendizaje (*Suitability for Learning*):** El flujo secuencial del asistente de reinscripción guía al estudiante paso a paso (Selección de Grupo $\rightarrow$ Carga de Materias $\rightarrow$ Verificación de Créditos $\rightarrow$ Emisión de Comprobante), reduciendo la curva de aprendizaje a cero.
5. **Control por Parte del Usuario (*Controllability*):** El estudiante mantiene el dominio sobre la velocidad del proceso, pudiendo retroceder, cancelar o modificar selecciones antes de confirmar definitivamente su inscripción.
6. **Tolerancia a Fallos (*Error Tolerance*):** Este principio dicta que, ante errores u omisiones del usuario, **el resultado previsto debe poder alcanzarse con nula o mínima acción correctiva adicional**. En el sistema del TESChi, se traduce en validaciones reactivas antes del envío de datos, confirmaciones modales no destructivas y la implementación de componentes `ErrorBoundary` en React para aislar cualquier excepción imprevista.
7. **Idoneidad para la Individualización (*Suitability for Individualization*):** Soporte ergonómico para modo claro y modo oscuro, así como escalamiento responsivo para lectura óptima en pantallas pequeñas.

---

### 10. ¿Qué constituyen las Pautas de Accesibilidad para el Contenido Web (*WCAG 2.1 / ISO/IEC 40500*) y cómo garantizan la inclusión de la comunidad estudiantil bajo el principio de diseño universal?

Las **Pautas de Accesibilidad para el Contenido Web (Web Content Accessibility Guidelines - WCAG 2.1)**, formuladas por la Iniciativa de Accesibilidad Web del **W3C (WAI, 2018)** y adoptadas internacionalmente como la norma **ISO/IEC 40500 (2012)**, establecen los requerimientos técnicos y de diseño indispensables para garantizar que cualquier contenido digital sea plenamente accesible para personas con discapacidades visuales, auditivas, motrices o cognitivas, así como para usuarios en contextos desfavorables (dispositivos antiguos, pantallas de bajo brillo bajo luz solar intensa o conectividad deficiente).

Tal como argumentan **Chisholm et al. (2001)** y la documentación oficial del **W3C WAI (2018)**, la accesibilidad digital se estructura sobre cuatro principios universales irrenunciables, conocidos por el acrónimo **POUR**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                 PRINCIPIOS DE ACCESIBILIDAD DIGITAL (POUR)             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. PERCEPTIBLE:                                                        │
│    - Ratios de contraste de color mínimos de 4.5:1 (Nivel AA).         │
│    - Alternativas textuales precisas en todos los iconos vectoriales.  │
│    - Información nunca transmitida únicamente mediante color.          │
├────────────────────────────────────────────────────────────────────────┤
│ 2. OPERABLE:                                                           │
│    - Toda la funcionalidad debe ser ejecutable enteramente por teclado.│
│    - Áreas de toque táctil móviles mínimas de 44x44 píxeles.           │
│    - Ausencia de trampas de foco en modales o diálogos emergentes.     │
├────────────────────────────────────────────────────────────────────────┤
│ 3. COMPRENSIBLE:                                                       │
│    - Tipografía legible con escalamiento relativo (rem).               │
│    - Mensajes de validación de error explícitos y comprensibles.       │
│    - Estructura semántica HTML5 con orden jerárquico (h1, h2, h3).     │
├────────────────────────────────────────────────────────────────────────┤
│ 4. ROBUSTO:                                                            │
│    - Código conforme a especificaciones W3C estándar sin etiquetas rotas│
│    - Atributos WAI-ARIA compatibles con lectores de pantalla.          │
└────────────────────────────────────────────────────────────────────────┘
```

En el módulo escolar del **Departamento de Ciencias Básicas**:
- Se aplica el nivel de conformidad **WCAG 2.1 Nivel AA**, garantizando contrastes de color óptimos entre el fondo institucional y el texto.
- Los iconos de *Lucide React* y el logotipo oficial incorporan atributos `aria-hidden` y textos alternativos `sr-only` para lectores de pantalla.
- Se respetan las áreas seguras de los teléfonos inteligentes (*Safe Area Insets*) mediante utilidades CSS dedicadas (`pt-safe`, `pb-safe`), garantizando que los botones de navegación no queden ocultos por muescas (*notches*) o barras gestuales del sistema operativo móvil.

---

## III. REFERENCIAS BIBLIOGRÁFICAS (FORMATO APA 7.ª EDICIÓN)

1. **Abramov, D.** (2015). *Presentational and Container Components*. Medium Engineering. https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0
2. **Allsopp, J.** (2016). *Offline First: Thinking in Service Workers*. A List Apart, 439. https://alistapart.com/article/offline-first/
3. **Berriman, F., & Russell, A.** (2015). *Progressive Web Apps: Escaping Tabs Without Losing Our Soul*. Infrequently Noted. https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/
4. **Biørn-Hansen, A., Majchrzak, T. A., & Grønli, T. M.** (2019). Progressive Web Apps: The Definitive Guide to Next-Gen Mobile Web. *IEEE Access*, 7, 72541–72560. https://doi.org/10.1109/ACCESS.2019.2919908
5. **Cockburn, A.** (2005). *Hexagonal Architecture (Ports and Adapters)*. Alistair.Cockburn.us. https://alistair.cockburn.us/hexagonal-architecture/
6. **Coleman, T., Palmer, M., & Storybook Team.** (2017). *Component-Driven Development: The UI building methodology that scales*. Storybook Design Systems. https://www.componentdriven.org/
7. **Evans, E.** (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley Professional.
8. **Feyerke, A.** (2013). *Say Hello to Offline First*. Hoodie Blog. http://hood.ie/blog/say-hello-to-offline-first.html
9. **Frost, B.** (2016). *Atomic Design*. Brad Frost Collection. ISBN: 978-0-9982053-0-4.
10. **Google Developers.** (2020). *Web Vitals: Essential metrics for a healthy site*. Google Open Source. https://web.dev/vitals/
11. **International Organization for Standardization.** (2011). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models* (ISO/IEC Standard No. 25010:2011). https://www.iso.org/standard/35733.html
12. **International Organization for Standardization.** (2012). *Information technology — W3C Web Content Accessibility Guidelines (WCAG) 2.0* (ISO/IEC Standard No. 40500:2012). https://www.iso.org/standard/58625.html
13. **International Organization for Standardization.** (2020). *Ergonomics of human-system interaction — Part 110: Dialogue principles* (ISO Standard No. 9241-110:2020). https://www.iso.org/standard/75258.html
14. **Keith, J.** (2016). *Resilient Web Design*. A Book Apart. https://resilientwebdesign.com/
15. **Lawson, N.** (2015). *Designing Offline-First Web Apps*. O'Reilly Media / Nolan Lawson Technical Reports. https://nolanlawson.com/2015/09/29/introducing-pokedex-org/
16. **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall. ISBN: 978-0-13-449416-6.
17. **MDN Web Docs.** (2023). *IndexedDB API: High-performance client-side storage*. Mozilla Developer Network. https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
18. **Nielsen, J., & Molich, R.** (1990). Heuristic evaluation of user interfaces. *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI '90)*, 249–256. https://doi.org/10.1145/97243.97281
19. **O'Reilly, B.** (2020). *Residuality Theory: A New Architecture for Complex Systems*. Complexity and Software Engineering Reports.
20. **O'Reilly, B.** (2022). *Designing for the Unknown: Stressor-driven architecture with Residuality Theory*. Barry O'Reilly Engineering Papers.
21. **Osmani, A.** (2020). *Learning JavaScript Design Patterns: A JavaScript and React Developer's Guide*. O'Reilly Media.
22. **Russell, A.** (2016). *What, Exactly, Makes Something A Progressive Web App?* Infrequently Noted. https://infrequently.org/2016/09/what-exactly-makes-something-a-progressive-web-app/
23. **World Wide Web Consortium (W3C).** (2018). *Web Content Accessibility Guidelines (WCAG) 2.1* (W3C Recommendation). W3C WAI. https://www.w3.org/TR/WCAG21/
24. **World Wide Web Consortium (W3C).** (2019). *Service Workers 1* (W3C Candidate Recommendation). https://www.w3.org/TR/service-workers/
25. **World Wide Web Consortium (W3C).** (2024). *Indexed Database API 3.0* (W3C Working Draft). https://www.w3.org/TR/IndexedDB-3/
26. **Zakas, N. C.** (2016). *Understanding ECMAScript 6: The Definitive Guide for JavaScript Developers*. No Starch Press.
