import re

md_file = "Docs/Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.md"
with open(md_file, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Standardize Table titles: "**Tabla X.**" -> "**Tabla X**\n*"
# In APA 7, Table number is bold on its own line, followed by title in italics on next line.
def fix_table_header(m):
    num = m.group(1)
    title = m.group(2).strip()
    return f"**Tabla {num}**  \n*{title}*"

text = re.sub(r'\*\*Tabla (\d+)\.\*\*\s*\n?\*([^*]+)\*', fix_table_header, text)

# 2. Standardize Figure titles: "**Figura X.**" -> "**Figura X**\n*"
def fix_fig_header(m):
    num = m.group(1)
    title = m.group(2).strip()
    return f"**Figura {num}**  \n*{title}*"

text = re.sub(r'\*\*Figura (\d+)\.\*\*\s*\n?\*([^*]+)\*', fix_fig_header, text)

# 3. Ensure every Figure 1 to 22 has explicit APA 7 note:
# If note starts with "Nota. La figura...", prepend "Nota. Elaboración propia (2026). "
fig_notes_map = {
    11: "*Nota.* Elaboración propia (2026). La figura ilustra la interfaz de autenticación en sus dos estados secuenciales. En la parte superior destaca el logotipo oficial tridimensional del TESChi en tonos verde bosque y acentos cromados. El formulario presenta bordes suavemente redondeados (`rounded-2xl`), elevación mediante sombra difusa institucional y un diseño responsivo centrado en viewport (`max-w-md`). En la Fase 2, se observa el teclado numérico táctil optimizado para dedos con retroalimentación háptica. Captura directa de la aplicación en ejecución local.",
    12: "*Nota.* Elaboración propia (2026). La figura exhibe la vista principal del estudiante tras autenticarse con éxito. En la zona superior se aprecia el saludo institucional personalizado y el banner del periodo 2026-2 con degradado verde institucional. En el cuerpo central se visualizan las cuatro tarjetas de KPIs con bordes nítidos y las opciones de autoservicio escolar organizadas en una cuadrícula responsiva (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). Captura directa del entorno de pruebas.",
    13: "*Nota.* Elaboración propia (2026). La figura ilustra las tarjetas interactivas de grupos disponibles. Se observa la barra de saturación de cupo con porcentaje numérico y etiqueta de turno en contraste alto. El grupo con cupo lleno aparece debidamente bloqueado (`disabled`) con badge rojo de 'Cupo Lleno', garantizando la tolerancia a fallos estipulada en la norma ISO 9241-110. Captura de pantalla del software en ejecución.",
    14: "*Nota.* Elaboración propia (2026). La figura muestra la interfaz con las materias ofertadas. Cada tarjeta incluye la clave, créditos y nombre del docente. En la parte inferior destaca la barra fija con el indicador verde '25 créditos seleccionados de 36 permitidos' y el botón activo 'Confirmar y Emitir Comprobante'. Captura directa de la aplicación.",
    15: "*Nota.* Elaboración propia (2026). La figura ilustra el documento oficial generado. En el cuadrante superior derecho se aprecia el folio institucional enmarcado y el código QR de verificación. En el cuerpo central se despliega la tabla formal de asignaturas y en la base aparece la cadena del sello digital SHA-256 junto a las leyendas oficiales de validez escolar. Captura directa del componente en modo de previsualización formal.",
    16: "*Nota.* Elaboración propia (2026). La figura muestra el historial académico del alumno. En la cabecera se visualiza la barra de progreso verde esmeralda con el porcentaje de carrera acreditado. Las materias de cada semestre se ordenan en tablas limpias con sus notas finales y tipo de acreditación formal. Captura del sistema operando en modo offline.",
    17: "*Nota.* Elaboración propia (2026). La figura ilustra la oferta de asignaturas intersemestrales intensivas de Ciencias Básicas. Se aprecian los badges de academia, fechas lectivas y el botón de registro con contador de cupos en tiempo real. Captura directa de la plataforma.",
    18: "*Nota.* Elaboración propia (2026). La figura muestra el documento oficial membretado con desglose de la materia intersemestral registrada (ej. Cálculo Integral), folio de caja y sello digital SHA-256. Captura del módulo de comprobantes.",
    19: "*Nota.* Elaboración propia (2026). La figura ilustra la visualización algorítmica de los 14 meses lectivos. Se aprecian las celdas marcadas con barras, triángulos y bloques cromáticos normativos. En la esquina superior se destaca el mes actual con el botón 'Localizar Día de Hoy' y en la parte inferior se despliegan las 14 tarjetas de la simbología oficial con mecanismo interactivo de filtrado. Captura directa de la interfaz.",
    20: "*Nota.* Elaboración propia (2026). La figura exhibe el panel de seguridad con la tabla de eventos de auditoría y los controles de actualización de contraseñas. Cada registro de sesión cuenta con sello criptográfico de trazabilidad. Captura directa de la vista de seguridad.",
    21: "*Nota.* Elaboración propia (2026). La figura muestra el banner ámbar de estado offline informando la persistencia en IndexedDB y el diálogo emergente accesible para instalar la PWA en teléfonos inteligentes. Captura de componentes.",
    22: "*Nota.* Elaboración propia (2026). Panel de auditoría de Google Chrome DevTools certificando el cumplimiento del 100% de los criterios PWA, Service Worker activo, Web App Manifest válido y métricas Core Web Vitals en verde. Auditoría directa sobre el sistema desplegado."
}

for num, note in fig_notes_map.items():
    # Find pattern for Figura {num}
    fig_pattern = rf'(\*\*Figura {num}\*\*.*?\n)(?:(\*Nota\.\*[^\n]+\n))?'
    # Let's replace or ensure note follows
    # Check if there is already a note
    target_search = f"**Figura {num}**"
    pos = text.find(target_search)
    if pos != -1:
        # Find next \n\n or --- or ###
        end_pos = text.find("\n\n---", pos)
        if end_pos == -1: end_pos = text.find("\n\n###", pos)
        if end_pos == -1: end_pos = pos + 600
        block = text[pos:end_pos]
        # Replace existing note or append
        if "*Nota.*" in block:
            new_block = re.sub(r'\*Nota\.\*[^\n]+', note, block)
            text = text[:pos] + new_block + text[end_pos:]
        else:
            new_block = block.strip() + "\n" + note + "\n"
            text = text[:pos] + new_block + text[end_pos:]

# 4. Standardize Table Notes
table_notes_map = {
    1: "*Nota.* Elaboración propia (2026). Análisis comparativo de factibilidad técnica y económica realizado para el proyecto de residencias en el TESChi.",
    2: "*Nota.* Adaptado de Zakas (2016) y MDN Web Docs (2023). Elaboración propia (2026) a partir de los estándares formales W3C.",
    3: "*Nota.* Elaboración propia (2026). Plan de trabajo avalado por los asesores interno y externo para el periodo lectivo de residencias profesionales.",
    4: "*Nota.* Adaptado de O'Reilly (2020, 2022). Elaboración propia (2026). Análisis de resiliencia y antifragilidad formalizado a partir del marco de Residuality Theory.",
    5: "*Nota.* Elaboración propia (2026). Especificación técnica del esquema de persistencia local en storageAdapter.ts.",
    6: "*Nota.* Adaptado de Google Workbox Team (2022) y W3C (2019). Elaboración propia (2026). Especificación formal de enrutamiento de red implementada en Workbox.",
    7: "*Nota.* Elaboración propia (2026). Especificación técnica de contratos de API REST implementados en server.ts.",
    8: "*Nota.* Elaboración propia (2026). Pruebas de laboratorio y benchmarking ejecutadas sobre entorno emulado y hardware real en campus TESChi.",
    9: "*Nota.* Elaboración propia (2026). Especificación de controles ergonómicos de la vista en src/views/LoginView.tsx.",
    10: "*Nota.* Elaboración propia (2026). Indicadores calculados dinámicamente en src/views/DashboardView.tsx.",
    11: "*Nota.* Elaboración propia (2026) a partir de los datos de oferta académica del Departamento de Ciencias Básicas.",
    12: "*Nota.* Elaboración propia (2026). Reglas de compatibilidad y prelación procesadas por el orquestador en src/views/ReinscripcionCargaView.tsx.",
    13: "*Nota.* Elaboración propia (2026). Generado y validado mediante documentAdapter.ts bajo los controles de la norma ISO/IEC 27001.",
    14: "*Nota.* Adaptado de la normativa oficial del TESChi (2026). Elaboración propia (2026). Componentes vectoriales de simbología codificados en src/views/CalendarioEscolarView.tsx.",
    15: "*Nota.* Elaboración propia (2026) a partir del plan de estudios ISIC-2010-224 del Tecnológico de Estudios Superiores de Chimalhuacán."
}

for num, note in table_notes_map.items():
    target_search = f"**Tabla {num}**"
    pos = text.find(target_search)
    if pos != -1:
        end_pos = text.find("\n\n---", pos)
        if end_pos == -1: end_pos = text.find("\n\n###", pos)
        if end_pos == -1: end_pos = pos + 1500
        block = text[pos:end_pos]
        if "*Nota.*" in block:
            new_block = re.sub(r'\*Nota\.\*[^\n]+', note, block)
            text = text[:pos] + new_block + text[end_pos:]
        else:
            new_block = block.strip() + "\n\n" + note + "\n"
            text = text[:pos] + new_block + text[end_pos:]

# 5. Clean up redundant empty lines, \vspace and double \newpage
text = re.sub(r'\\newpage\s*---\s*\\newpage', r'\\newpage', text)
text = re.sub(r'---\s*\\newpage\s*---', r'\\newpage', text)
text = re.sub(r'\\newpage\s*---', r'\\newpage', text)

with open(md_file, "w", encoding="utf-8") as f:
    f.write(text)

print("Markdown updated with APA 7 notes and cleaned page breaks successfully!")
