import os
import re

md_path = r"Docs\Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.md"

with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

print("Original length:", len(text))

# 1. Update Chapter I citations
text = text.replace(
    "El presente Reporte Técnico de Residencia Profesional documenta de manera exhaustiva",
    "El presente Reporte Técnico de Residencia Profesional (elaborado conforme a los lineamientos del Tecnológico Nacional de México [TecNM, 2015] y la Guía de Residencias del TESChi [2015]) documenta de manera exhaustiva"
)

text = text.replace(
    "Teoría de la Residualidad (Residuality Theory) formulada por Barry O'Reilly, y el apego irrestricto a los estándares internacionales ISO/IEC 25010 (calidad del producto de software), ISO/IEC 27001 (gestión de la seguridad de la información), ISO 9241-110 (principios ergonómicos de diálogo persona-sistema) y las pautas de accesibilidad WCAG 2.1 Nivel AA,",
    "Teoría de la Residualidad (*Residuality Theory*) formulada por Barry O'Reilly (2020, 2022), y el apego irrestricto a los estándares internacionales ISO/IEC 25010 de calidad del producto de software (ISO/IEC, 2011), ISO/IEC 27001 de gestión de la seguridad de la información (ISO/IEC, 2022), ISO 9241-110 de principios ergonómicos de diálogo persona-sistema (ISO, 2020) y las pautas de accesibilidad WCAG 2.1 Nivel AA (World Wide Web Consortium [W3C], 2018; ISO/IEC, 2012),"
)

text = text.replace(
    "Formato APA 7.ª Edición: La totalidad de las tablas y figuras integradas en el cuerpo del texto se presentan bajo los lineamientos de la séptima edición de APA:",
    "Formato APA 7.ª Edición: La totalidad de las tablas, figuras y citas bibliográficas integradas en el cuerpo del texto se presentan bajo los lineamientos de la séptima edición de la American Psychological Association (APA, 2020):"
)

# 2. Update Chapter II citations
text = text.replace(
    "Decreto del Ejecutivo del Estado de México publicado en la Gaceta del Gobierno el 17 de noviembre del año 2000",
    "Decreto del Ejecutivo del Estado de México publicado en la Gaceta del Gobierno el 17 de noviembre del año 2000 (TESChi, 2024)"
)

text = text.replace(
    "Manual General de Organización del Tecnológico de Estudios Superiores de Chimalhuacán",
    "Manual General de Organización del Tecnológico de Estudios Superiores de Chimalhuacán (TESChi, 2024; Rodríguez Valencia, 1992)"
)

# 3. Update Chapter III citations
text = text.replace(
    "dependencia absoluta de una conexión síncrona cliente-servidor",
    "dependencia absoluta de una conexión síncrona cliente-servidor tradicional (Fielding, 2000; Biørn-Hansen et al., 2019)"
)

text = text.replace(
    "denominado informalmente en ingeniería de telecomunicaciones como Lie-Fi",
    "denominado informalmente en ingeniería de telecomunicaciones como Lie-Fi (Allsopp, 2016; Keith, 2016)"
)

# 4. Update Chapter IV (Preguntas Guía y Marco Conceptual)
# Pregunta 1
text = text.replace(
    "Frances Berriman y Alex Russell (2015)",
    "Frances Berriman y Alex Russell (Berriman & Russell, 2015)"
)
text = text.replace(
    "Como expone Russell (2016), una PWA no representa un framework cerrado ni un lenguaje propietario; se trata de una mejora progresiva (Progressive Enhancement) construida sobre estándares abiertos del World Wide Web Consortium (W3C).",
    "Como expone Russell (2016), una PWA no representa un framework cerrado ni un lenguaje propietario; se trata de una mejora progresiva (*Progressive Enhancement*) construida sobre estándares abiertos del World Wide Web Consortium (W3C, 2020). De acuerdo con las investigaciones comparativas de Biørn-Hansen et al. (2019) y Osmani (2020), las PWAs equilibran costo y rendimiento."
)

# Pregunta 2
text = text.replace(
    "El concepto Offline-First fue formulado originalmente en 2013 por el colectivo de desarrolladores liderado por Alex Feyerke",
    "El concepto Offline-First fue formulado originalmente por el colectivo de desarrolladores liderado por Alex Feyerke (2013), extendido posteriormente por Allsopp (2016), Lawson (2015) y Keith (2016)"
)

# Pregunta 3
text = text.replace(
    "La especificación formal del World Wide Web Consortium (W3C) define un Service Worker",
    "La especificación formal del World Wide Web Consortium (W3C, 2019; Google Workbox Team, 2022; Zakas, 2016) define un Service Worker"
)

# Pregunta 4
text = text.replace(
    "La API de Base de Datos Indexada (IndexedDB)",
    "La API de Base de Datos Indexada (IndexedDB), formalizada por el W3C (2024; MDN Web Docs, 2023; Zakas, 2016)"
)

# Pregunta 5
text = text.replace(
    "El Desarrollo Guiado por Componentes (Component-Driven Development - CDD)",
    "El Desarrollo Guiado por Componentes (Component-Driven Development - CDD), promovido por Coleman et al. (2017), Frost (2016) y Abramov (2015)"
)

# Pregunta 6
text = text.replace(
    "Formulado originalmente por Alistair Cockburn en 2005",
    "Formulado originalmente por Alistair Cockburn (2005) y consolidado por Robert C. Martin (2017) y Eric Evans (2003)"
)

# Pregunta 7
text = text.replace(
    "formulada por el científico de la computación y arquitecto de software Barry O'Reilly",
    "formulada por el científico de la computación y arquitecto de software Barry O'Reilly (2020, 2022)"
)

# Pregunta 8
text = text.replace(
    "publicado conjuntamente por la Organización Internacional de Normalización y la Comisión Electrotécnica Internacional en 2011",
    "publicado conjuntamente por la Organización Internacional de Normalización y la Comisión Electrotécnica Internacional (ISO/IEC, 2011; Google Developers, 2020)"
)

# Pregunta 9
text = text.replace(
    "La norma internacional ISO/IEC 27001",
    "La norma internacional ISO/IEC 27001 (ISO/IEC, 2022)"
)

# Pregunta 10
text = text.replace(
    "La norma internacional ISO 9241-110",
    "La norma internacional ISO 9241-110 (ISO, 2020; Nielsen & Molich, 1990)"
)
text = text.replace(
    "Las Pautas de Accesibilidad para el Contenido Web (Web Content Accessibility Guidelines - WCAG 2.1)",
    "Las Pautas de Accesibilidad para el Contenido Web (Web Content Accessibility Guidelines - WCAG 2.1; W3C, 2018; ISO/IEC, 2012; Chisholm et al., 2001)"
)

# 5. Update Chapter V (Metodología y Actividades Desarrolladas)
text = text.replace(
    "metodología ágil híbrida adaptada a los requerimientos de la residencia profesional",
    "metodología ágil híbrida adaptada a los requerimientos normativos del TecNM (2015) y del TESChi (2015)"
)

text = text.replace(
    "El modelo entidad-relación embebido en IndexedDB",
    "El modelo entidad-relación embebido en IndexedDB (W3C, 2024; MDN Web Docs, 2023)"
)

# Update Login View description for NIP & Swagger post_login_ashx
old_login_desc = "La vista de inicio de sesión gestiona el acceso estudiantil mediante autenticación multifactorial (contraseña institucional o PIN numérico rápido de 4 dígitos)"
new_login_desc = "La vista de inicio de sesión gestiona el acceso estudiantil conectándose directamente a la API oficial del SIIA TESChi a través del endpoint Swagger `POST /login.ashx` (`post_login_ashx`), permitiendo el ingreso prioritario con NIP institucional (clave numérica de 4 a 6 dígitos asignada al alumno) o contraseña central (ISO/IEC, 2022)"

if old_login_desc in text:
    text = text.replace(old_login_desc, new_login_desc)

# Update Kardex View description to specify View-Only (No Download)
old_kardex_desc = "Permite al estudiante consultar su avance curricular acumulado, promedio ponderado, asignaturas aprobadas con desglose semestral y generar el comprobante oficial de kárdex con firma institucional."
new_kardex_desc = "Permite al estudiante consultar su avance curricular acumulado, promedio ponderado, total de créditos y desglose semestral detallado de asignaturas aprobadas y en curso. **Diseño de Consulta Digital Exclusiva en Pantalla (Sin Descarga):** Conforme a las políticas institucionales de seguridad de la información escolar y protección de datos del TESChi (2026), se eliminó deliberadamente cualquier botón o mecanismo de descarga de archivos PDF locales del kárdex; los datos se consultan en tiempo real de manera interactiva en la interfaz reactiva, garantizando la privacidad y evitando la duplicación de documentos desactualizados (ISO/IEC, 2022)."

if old_kardex_desc in text:
    text = text.replace(old_kardex_desc, new_kardex_desc)

# Also update the Kardex table row if it mentions downloading PDF
text = text.replace(
    "Exportar Historial Académico en formato PDF con diseño institucional",
    "Visualización interactiva en pantalla de calificaciones y avance curricular (modo solo consulta sin descarga)"
)
text = text.replace(
    "Descarga de Kárdex Oficial en PDF",
    "Consulta Dinámica de Kárdex en Pantalla"
)

# 6. Update Chapter VII & Annexes
text = text.replace(
    "Manual de Organización General del Tecnológico de Estudios Superiores de Chimalhuacán (2024)",
    "Manual de Organización General del Tecnológico de Estudios Superiores de Chimalhuacán (TESChi, 2024; Rodríguez Valencia, 1992)"
)

print("Updated length:", len(text))

with open(md_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Successfully written updated markdown with APA 7 in-text citations!")
