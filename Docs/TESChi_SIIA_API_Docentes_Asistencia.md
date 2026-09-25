# ESPECIFICACIÓN TÉCNICA: API SIIA TESCHI (DOCENTES Y ASISTENCIA)
## Tecnológico de Estudios Superiores de Chimalhuacán (TESChi)
### Análisis de Integración para la PWA del Departamento de Ciencias Básicas

---

## 📌 1. Información General de la API

* **Host Institucional:** `https://siia.teschi.edu.mx`
* **Swagger UI:** `https://siia.teschi.edu.mx/Teschi/api/swagger/index.html#/Autenticacion/post_login_ashx`
* **Especificación OpenAPI:** `https://siia.teschi.edu.mx/Teschi/api/swagger/openapi.json` (OpenAPI 3.0.3)
* **Versión de la API:** `1.0.0`
* **Tecnología Backend:** ASP.NET (`.ashx` HTTP Handlers) con respuestas estándar en JSON.
* **Módulos Disponibles:** Autenticación de usuarios y captura/gestión de asistencia escolar para docentes.

---

## 🔐 2. Modelo de Seguridad y Autenticación

* **Mecanismo:** Autenticación basada en **Bearer Token**.
* **Vigencia del Token:** **480 minutos (8 horas)**, coincidente con la jornada laboral docente.
* **Control de Tasa (Rate Limiting):** Máximo **5 intentos cada 60 segundos** por usuario e IP en el inicio de sesión (`HTTP 429 Too Many Requests`).
* **Header de Autorización:**
  ```http
  Authorization: Bearer <TOKEN_DE_SESION>
  ```

---

## 🛣️ 3. Catálogo de Endpoints

### 3.1. `POST /Teschi/api/login.ashx`
* **Etiqueta:** Autenticación
* **Descripción:** Valida credenciales de docentes/usuarios del SIIA y genera el token de sesión.
* **Content-Type:** `application/json` o `application/x-www-form-urlencoded`
* **Cuerpo de Solicitud:**
  ```json
  {
    "usuario": "docente_cb",
    "password": "********"
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "mensaje": "Inicio de sesión correcto",
    "token": "eyJhbGciOi...",
    "expiraEnMinutos": 480,
    "usuario": {
      "usuario": "docente_cb",
      "numUsuario": "1045",
      "nombre": "Juan",
      "paterno": "Pérez",
      "materno": "Gómez",
      "nombreCompleto": "Juan Pérez Gómez",
      "correo": "jperez@teschi.edu.mx",
      "tipo": "DOCENTE",
      "idArea": 1,
      "area": "CIENCIAS BASICAS",
      "idCarrera": 1,
      "tipoCarrera": "INGENIERIA",
      "permisos": "ASISTENCIA,CALIFICACIONES",
      "cambioPw": 0,
      "puedeAsistencia": true
    }
  }
  ```

---

### 3.2. `GET /Teschi/api/asistencia/grupos.ashx`
* **Etiqueta:** Asistencia
* **Seguridad:** `Bearer <token>`
* **Parámetros Query:**
  * `periodo` (opcional, ej. `"2026-1"`). Si se omite, el backend asigna el periodo activo.
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "mensaje": "Grupos asignados",
    "periodo": "2026-1",
    "numProfesor": 1045,
    "grupos": [
      {
        "grupo": "1ISC11",
        "idMateria": 1137,
        "clave": "ACF-0901",
        "materia": "Cálculo Diferencial",
        "idCarrera": 1,
        "carrera": "Ingeniería en Sistemas Computacionales",
        "tipoCurso": "ORDINARIO",
        "totalAlumnos": 35
      },
      {
        "grupo": "2ISC11",
        "idMateria": 1142,
        "clave": "ACF-0902",
        "materia": "Cálculo Integral",
        "idCarrera": 1,
        "carrera": "Ingeniería en Sistemas Computacionales",
        "tipoCurso": "ORDINARIO",
        "totalAlumnos": 32
      }
    ]
  }
  ```

---

### 3.3. `GET /Teschi/api/asistencia/alumnos.ashx`
* **Etiqueta:** Asistencia
* **Seguridad:** `Bearer <token>`
* **Parámetros Query:**
  * `periodo` (string, opcional, ej. `"2026-1"`)
  * `grupo` (string, **requerido**, ej. `"1ISC11"`)
  * `idMateria` (integer, **requerido**, ej. `1137`)
  * `fecha` (string, opcional, formato `"dd/MM/yyyy"`, ej. `"23/09/2026"`)
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "mensaje": "Lista de alumnos obtenida",
    "periodo": "2026-1",
    "grupo": "1ISC11",
    "idMateria": 1137,
    "fecha": "23/09/2026",
    "alumnos": [
      {
        "num": 1,
        "matricula": "2026151001",
        "nombre": "Álvarez Morales, Sofía",
        "sexo": "M",
        "tipoCurso": "ORDINARIO",
        "fecha": "23/09/2026",
        "asistencia": true
      },
      {
        "num": 2,
        "matricula": "2026151002",
        "nombre": "Benítez Cruz, Alan",
        "sexo": "H",
        "tipoCurso": "ORDINARIO",
        "fecha": "23/09/2026",
        "asistencia": false
      }
    ]
  }
  ```

---

### 3.4. `POST /Teschi/api/asistencia/guardar.ashx`
* **Etiqueta:** Asistencia
* **Seguridad:** `Bearer <token>`
* **Content-Type:** `application/json`
* **Cuerpo de Solicitud:**
  ```json
  {
    "periodo": "2026-1",
    "grupo": "1ISC11",
    "idMateria": 1137,
    "matricula": "2026151001",
    "fecha": "23/09/2026",
    "asistencia": true
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "mensaje": "Asistencia actualizada correctamente",
    "periodo": "2026-1",
    "grupo": "1ISC11",
    "idMateria": 1137,
    "matricula": "2026151001",
    "fecha": "23/09/2026",
    "asistencia": true
  }
  ```

---

## 💡 4. Impacto y Estrategia de Integración Offline-First en la PWA

### El Problema Operativo en Ciencias Básicas
Los docentes del Departamento de Ciencias Básicas imparten materias de alta matrícula (Cálculo, Álgebra Lineal, Física y Química) distribuidas en salones y laboratorios donde:
1. La señal celular móvil (4G/5G) es deficiente o nula debido al blindaje de concreto y distancia a las antenas repetidoras.
2. El WiFi institucional sufre saturación y microdesconexiones concurrentes.
3. Con la aplicación web estándar, una caída de conexión mientras se toma asistencia provoca pérdida de captura y bloqueo de pantalla.

### Solución Arquitectónica con la PWA
1. **Precarga en el cubículo / red estable (Online):** Al ingresar, el docente descarga sus grupos y alumnos del día (`GET /asistencia/grupos.ashx` y `GET /asistencia/alumnos.ashx`), almacenándose íntegramente en **IndexedDB**.
2. **Pase de lista en aula sin internet (Offline):** El docente marca asistencias/faltas de forma instantánea. La interfaz reacciona en menos de **16 ms** y registra cada cambio en `IndexedDB` y en la cola de sincronización (`SyncQueue`).
3. **Sincronización diferida transparente (Background Sync):** Al salir del aula y recuperar conectividad, el Service Worker o la cola local procesa automáticamente los `POST /asistencia/guardar.ashx` pendientes, garantizando cero pérdida de datos.
