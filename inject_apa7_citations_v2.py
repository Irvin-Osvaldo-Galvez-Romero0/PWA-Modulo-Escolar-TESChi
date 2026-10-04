import os
import re

md_path = os.path.abspath(os.path.join("Docs", "Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.md"))

with open(md_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Ensure Kárdex is described as View-Only (No Download)
kardex_find = "5.3.2. Vista 2: Historial Académico y Kárdex Calificado"
kardex_replace_section = """### 5.3.2. Vista 2: Historial Académico y Kárdex Calificado

```
================================================================================
[INSERTAR FIGURA 7: VISTA DE HISTORIAL ACADÉMICO / KÁRDEX CALIFICADO]
Dimensiones: 1080 x 1920 px (Mobile FHD+) / 1920 x 1080 px (Desktop)
Ubicación de Referencia: src/views/KardexView.tsx
================================================================================
```

**Figura 7**  
*Captura de Pantalla: Historial Académico, Promedio Ponderado y Desglose por Semestres*  
*Nota.* Elaboración propia (2026). Interfaz de autoservicio académico de consulta de calificaciones del TESChi.

- **Identificador de Ruta:** `/kardex`
- **Componente Rector:** `KardexView.tsx`
- **Función en el Sistema:** Permite al estudiante consultar su avance curricular acumulado, promedio ponderado, total de créditos y desglose semestral detallado de asignaturas aprobadas y en curso.
- **Modalidad Operativa Institucional (Solo Consulta en Pantalla):** Conforme a las directrices de seguridad de la información escolar y protección de datos personales del TESChi (TESChi, 2024; ISO/IEC, 2022), el sistema opera en modalidad de visualización directa y segura en pantalla, prescindiendo deliberadamente de botones de descarga de archivos PDF externos. Esto garantiza que las calificaciones se consulten en tiempo real de forma fidedigna e interactiva, salvaguardando la confidencialidad y evitando la proliferación de archivos desactualizados o alterables.

**Tabla 5**  
*Especificación Técnica de la Vista de Historial Académico (Kárdex)*

| Parámetro | Definición Técnica |
| :--- | :--- |
| **Fuentes de Datos** | Almacén `kardex_historial` en IndexedDB (W3C, 2024) y endpoint REST `/api/v1/academic/kardex` (Fielding, 2000). |
| **Métricas Clave** | Promedio general (9.6/10), Créditos acumulados (235/260) y Porcentaje de avance de carrera (90%). |
| **Componentes Visuales** | Tarjetas de métricas, barra de progreso reactiva en verde bosque, acordeón interactivo de semestres y badge de solo consulta (Frost, 2016; Abramov, 2015). |
| **Acción Principal** | Visualización interactiva y filtrado ágil de materias por semestre con estado de acreditación (ISO, 2020). |

*Nota.* Elaboración propia (2026). Especificación ergonómica y técnica de la interfaz de consulta de kárdex del TESChi."""

if kardex_find in content:
    # Find until next heading ### 5.3.3
    pattern = r"### 5\.3\.2\. Vista 2: Historial Académico y Kárdex Calificado.*?(?=### 5\.3\.3)"
    content = re.sub(pattern, kardex_replace_section + "\n\n", content, flags=re.DOTALL)
    print("Updated Vista 2 (Kardex) section to View-Only mode!")
else:
    print("Warning: Kardex heading not found!")

# 2. Update Login View description for NIP & Swagger post_login_ashx
login_find = "5.3.1. Vista 1: Autenticación de Acceso Institucional"
login_replace_section = """### 5.3.1. Vista 1: Autenticación de Acceso Institucional (Login NIP y Contraseña)

```
================================================================================
[INSERTAR FIGURA 6: VISTA DE ACCESO INSTITUCIONAL (LOGIN MULTIFACTORIAL)]
Dimensiones: 1080 x 1920 px (Mobile FHD+) / 1920 x 1080 px (Desktop)
Ubicación de Referencia: src/views/LoginView.tsx
================================================================================
```

**Figura 6**  
*Captura de Pantalla: Interfaz de Inicio de Sesión Institucional con NIP y Contraseña SIIA*  
*Nota.* Elaboración propia (2026). Interfaz oficial con integración a Swagger API post_login_ashx.

- **Identificador de Ruta:** `/login`
- **Componente Rector:** `LoginView.tsx`
- **Función en el Sistema:** Valida la identidad del estudiante o docente conectándose directamente a la API central del SIIA TESChi mediante el endpoint Swagger `POST /login.ashx` (`post_login_ashx`), soportando prioritariamente el ingreso con NIP institucional (clave numérica de 4 a 6 dígitos asignada al alumno) o contraseña alfanumérica central (ISO/IEC, 2022).
- **Mecanismos de Entrada:** Formulario de dos etapas: (1) Ingreso y verificación de matrícula o número de control; (2) Ingreso de NIP numérico mediante teclado táctil interactivo con retroalimentación háptica y compatibilidad total con teclado físico, o ingreso de contraseña alfanumérica con visibilidad conmutable.

**Tabla 4**  
*Especificación Técnica de la Vista de Inicio de Sesión Institucional*

| Parámetro | Definición Técnica |
| :--- | :--- |
| **Endpoint Oficial** | `POST https://siia.teschi.edu.mx/Teschi/api/login.ashx` (`post_login_ashx`; SIIA TESChi, 2026; Fielding, 2000). |
| **Métodos Soportados** | NIP numérico (4 a 6 dígitos) y Contraseña institucional SIIA con cifrado de transporte TLS/HTTPS (ISO/IEC, 2022). |
| **Seguridad Activa** | Bloqueo temporal tras 5 intentos fallidos consecutivos bajo norma ISO/IEC 27001 (ISO/IEC, 2022). |
| **Resiliencia Offline** | Verificación local transaccional mediante perfiles cacheados en IndexedDB para estudiantes registrados (Feyerke, 2013; W3C, 2024). |

*Nota.* Elaboración propia (2026). Especificación técnica y de seguridad de la interfaz de acceso."""

if login_find in content:
    pattern = r"### 5\.3\.1\. Vista 1: Autenticación de Acceso Institucional.*?(?=### 5\.3\.2)"
    content = re.sub(pattern, login_replace_section + "\n\n", content, flags=re.DOTALL)
    print("Updated Vista 1 (Login NIP) section!")

# 3. Add explicit parenthetical APA 7 citations at the end of each Theoretical Question in Chapter IV
q_citations = [
    (
        "### 4.2.1. Pregunta 1: Aplicaciones Web Progresivas (PWA)",
        "Las aplicaciones web progresivas representan la convergencia definitiva entre la ubicuidad de la web y la potencia del software local (Berriman & Russell, 2015; Russell, 2016; Biørn-Hansen et al., 2019; Osmani, 2020; World Wide Web Consortium [W3C], 2020)."
    ),
    (
        "### 4.2.2. Pregunta 2: Arquitectura Sin Conexión Primero (Offline-First)",
        "El paradigma Offline-First sitúa la experiencia humana y la integridad transaccional por encima de la volatilidad de las telecomunicaciones móviles (Feyerke, 2013; Allsopp, 2016; Lawson, 2015; Keith, 2016)."
    ),
    (
        "### 4.2.3. Pregunta 3: Ciclo de Vida del Trabajador de Servicio (SW)",
        "El Service Worker actúa como un proxy cliente determinista y programable que gobierna el flujo de datos sin bloquear la interfaz visual (W3C, 2019; Google Workbox Team, 2022; Keith, 2016; Zakas, 2016)."
    ),
    (
        "### 4.2.4. Pregunta 4: Persistencia Local Transaccional con IndexedDB",
        "IndexedDB brinda el soporte NoSQL estructurado, tipado y asíncrono indispensable para la soberanía de datos del estudiante en su propio dispositivo (W3C, 2024; MDN Web Docs, 2023; Zakas, 2016)."
    ),
    (
        "### 4.2.5. Pregunta 5: Desarrollo Guiado por Componentes (CDD)",
        "La arquitectura modular por componentes garantiza mantenibilidad, reusabilidad y aislamiento estricto de fallas en aplicaciones de alta escala (Coleman et al., 2017; Frost, 2016; Abramov, 2015)."
    ),
    (
        "### 4.2.6. Pregunta 6: Arquitectura Hexagonal y Puertos/Adaptadores",
        "El desacoplamiento de la lógica de dominio mediante puertos y adaptadores permite la sustitución transparente de servicios remotos por proveedores locales (Cockburn, 2005; Martin, 2017; Evans, 2003)."
    ),
    (
        "### 4.2.7. Pregunta 7: Teoría de Residualidad (Residuality Theory)",
        "La arquitectura basada en residualidad permite que el sistema escolar sobreviva al estrés del entorno enfocándose en la resiliencia del residuo funcional remanente (O'Reilly, 2020, 2022)."
    ),
    (
        "### 4.2.8. Pregunta 8: Modelo de Calidad del Software ISO/IEC 25010",
        "La evaluación cuantitativa y cualitativa bajo SQuaRE garantiza niveles superiores de adecuación funcional, fiabilidad, eficiencia de desempeño y usabilidad (ISO/IEC, 2011; Google Developers, 2020)."
    ),
    (
        "### 4.2.9. Pregunta 9: Seguridad de la Información ISO/IEC 27001",
        "La seguridad por diseño protege la confidencialidad, integridad y autenticidad criptográfica de los trámites escolares de los alumnos (ISO/IEC, 2022; Zakas, 2016)."
    ),
    (
        "### 4.2.10. Pregunta 10: Ergonomía de Software ISO 9241-110 y Accesibilidad WCAG 2.1",
        "El apego a principios ergonómicos y pautas de accesibilidad universal asegura que la plataforma académica sea operable e inclusiva para toda la comunidad tecnológica (ISO, 2020; Nielsen & Molich, 1990; W3C, 2018; ISO/IEC, 2012; Chisholm et al., 2001)."
    )
]

for heading, summary_cite in q_citations:
    if heading in content:
        # Check if summary cite is already there
        if summary_cite[:40] not in content:
            # We add it right before the next section divider --- or heading
            pos = content.find(heading)
            next_div = content.find("---", pos)
            if next_div != -1:
                content = content[:next_div] + f"\n\n> {summary_cite}\n\n" + content[next_div:]
                print(f"Added APA 7 summary citation to {heading[:35]}...")
            else:
                print(f"Divider not found after {heading[:35]}")

# 4. Save updated markdown
with open(md_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Completed! Total length: {len(content)} characters.")
