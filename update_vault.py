import os

vault_dir = r"c:\Users\User\Documents\vault"
synthesis_path = os.path.join(vault_dir, "pages", "syntheses", "2026-09-29-PWA-TESChi-Conversion-Docx-Correccion-Margenes-APA7.md")
index_path = os.path.join(vault_dir, "index.md")
log_path = os.path.join(vault_dir, "log.md")

content = """---
title: "Generación de Documento Word (.docx) y Corrección de Márgenes y Páginas en Blanco APA 7"
type: synthesis
project: "PWA-Modulo-Escolar-TESChi"
created: 2026-09-29
updated: 2026-09-29
tools_used:
  - python-docx
  - Chrome-DevTools-Protocol
  - markdown-it
  - pypdf
skills_used:
  - agency-document-generator
tags:
  - sesion-antigravity
  - sintesis
  - arquitectura
  - apa7
  - word-docx
  - pwa-teschi
sources:
  - "Conversación Antigravity (PWA Modulo Escolar TESChi)"
---

# Generación de Documento Word (.docx) y Corrección de Márgenes y Páginas en Blanco APA 7

> **Proyecto:** `PWA-Modulo-Escolar-TESChi` | **Fecha:** 2026-09-29  
> **Sistema:** Antigravity AI Assistant → [[Segundo Cerebro con IA]]

---

## 🎯 Contexto y Objetivo
El usuario solicitó la entrega de la memoria técnica de residencia profesional en formato nativo Microsoft Word (`.docx` / `.doc`), corrigiendo dos anomalías estructurales severas detectadas en versiones previas del documento:
1. **Reducción progresiva del ancho de texto:** Las páginas finales (ej. página 143) se comprimían en una franja angosta central de apenas ~2 cm de ancho debido a márgenes concéntricos multiplicados.
2. **Hojas en blanco recurrentes:** Presencia de páginas vacías intermedias (páginas 37, 40, 47, 51, 64, 71, 78, 84 y 144) provocadas por rupturas forzadas de párrafo y saltos de bloque.
3. **Estandarización APA 7.ª edición:** Inclusión formal de notas explicativas en la totalidad de tablas y figuras, explicitando `*Nota.* Adaptado de [Autor] ([Año])...` para fuentes bibliográficas o `*Nota.* Elaboración propia (2026).` para artefactos de diseño propio institucional.

---

## 🛠️ Herramientas, MCPs y Skills Empleados

| Categoría | Nombre / Identificador | Propósito en la Sesión |
| :--- | :--- | :--- |
| **Herramienta** | `python-docx` | Generación nativa de documento Word con estilos tipográficos, tablas APA y membretes |
| **Herramienta** | `Chrome DevTools Protocol (CDP)` | Compilación de PDF de alta resolución con encabezados y pies institucionales |
| **Herramienta** | `markdown-it` | Motor de parsing léxico y renderizado semántico |
| **Herramienta** | `pypdf` | Auditoría algorítmica de densidad de caracteres y detección de páginas en blanco |
| **Skill** | `agency-document-generator` | Reglas de diseño documental, espaciado y estándares editoriales institucionales |

---

## 📐 Diagrama de Arquitectura / Flujo

```mermaid
flowchart TD
    A[Master Markdown: 2,298 líneas] --> B[Standardize APA 7 Script]
    B --> C{Generación Dual de Artefactos}
    C -->|Pipeline Word| D[build_word_doc.py: python-docx]
    D --> E[Reporte_Final.docx / .doc<br/>Márgenes estándar 3.0 / 2.5 cm<br/>47 Tablas APA + Portada Oficial]
    C -->|Pipeline PDF| F[generate_pdf.py con Token Stashing]
    F --> G[documento_impresion_teschi.html<br/>Div balance 78 / 78 exacto]
    G --> H[Chrome Headless CDP<br/>95 Páginas / 0 Páginas en blanco]
```

---

## 💡 Decisiones Técnicas & Aprendizajes Clave

### 1. Diagnóstico de Causa Raíz: Reducción Concéntrica de Márgenes
- **El Problema:** En el script original de PDF, los bloques ````mermaid```` eran sustituidos por `<div class="mermaid-diagram-box">` antes del renderizado con CommonMark. Debido a que los diagramas incluían saltos de línea internos, el parser interrumpía el bloque HTML sin emitir las etiquetas de cierre `</div>`.
- **Efecto Cascada:** Se acumularon **9 etiquetas `<div>` abiertas sin cerrar**. Cada contenedor agregaba bordes y márgenes internos, anidándose como una matrioska. Para la página 143, el ancho útil de lectura se había reducido a un estrecho canal central.
- **La Solución (Token Stashing):** Se implementó una técnica de aislamiento léxico donde los bloques de código y figuras se reemplazan por identificadores temporales (`%%%MERMAID_STASH_N%%%`, `%%%FIGURE_STASH_N%%%`) antes de llamar a `markdown-it`, reintegrándolos como HTML puro y cerrado una vez concluido el parseo. Esto restableció el balance perfecto: **78 aperturas y 78 cierres de `<div>`**.

### 2. Erradicación de Hojas en Blanco
- Se detectó que las instrucciones de salto de página eran embebidas dentro de etiquetas de párrafo (`<p><div class="page-break"></div></p>`). Al ser inválido en la especificación HTML5, los navegadores creaban párrafos huérfanos con márgenes propios antes y después del salto, empujando los encabezados `<h1>` (que poseían `break-after: avoid`) a páginas sucesivas y dejando hojas enteras en blanco.
- Se configuró la regla CSS `p:empty { display: none !important; }`, se purgaron los párrafos vacíos y se permitió que las filas de las tablas (`tr`) respeten `break-inside: avoid` mientras que los contenedores (`table`) fluyan libremente (`break-inside: auto`).
- **Resultado:** El PDF pasó de 144 páginas infladas con espacios muertos a **95 páginas densas, armoniosas y con 0 hojas en blanco**, auditadas por `pypdf`.

### 3. Pipeline Microsoft Word (.docx / .doc)
- Se desarrolló el compilador `build_word_doc.py` utilizando `python-docx`, configurando:
  - **Márgenes:** Izquierdo 3.0 cm, Derecho 2.5 cm, Superior 2.5 cm, Inferior 2.5 cm.
  - **Tipografía:** Arial 11 pt, interlineado 1.15, alineación justificada.
  - **Membrete:** Encabezado con logotipo vectorizado oficial del TESChi (`teschi-logo.png`) y pleca verde esmeralda institucional (`#246A3B`), más pie de página con campos dinámicos XML `<w:fldSimple w:instr="PAGE"/>`.
  - **Tablas APA 7:** Borde superior e inferior negro sólido de 1 pt, borde separador de cabecera de 0.75 pt, sombreado gris sutil (`#F1F5F9`) y ausencia total de bordes verticales.

---

## 🔗 Referencias y Conexiones en el Vault
- [[PWA-Modulo-Escolar-TESChi]]
- [[2026-09-29-PWA-TESChi-Reporte-Final-Residencias-APA7]]
- [[Segundo Cerebro con IA]]
"""

print(f"Writing synthesis note to {synthesis_path}...")
with open(synthesis_path, "w", encoding="utf-8") as f:
    f.write(content)

# Update index.md
with open(index_path, "r", encoding="utf-8") as f:
    idx_content = f.read()

new_index_entry = "- [[2026-09-29-PWA-TESChi-Conversion-Docx-Correccion-Margenes-APA7]] — Conversión a Word (.docx / .doc), corrección de márgenes concéntricos y eliminación de páginas en blanco APA 7. *(Síntesis | 2026-09-29 | Proyecto: PWA-Modulo-Escolar-TESChi)*\n"

if "2026-09-29-PWA-TESChi-Conversion-Docx-Correccion-Margenes-APA7" not in idx_content:
    target_section = "## 📊 4. Síntesis & Comparativas (pages/syntheses/)\n"
    idx_content = idx_content.replace(target_section, target_section + new_index_entry)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(idx_content)
    print("Updated index.md with new synthesis link.")

# Update log.md
log_entry = """---

## [2026-09-29] SESION | PWA-Modulo-Escolar-TESChi - Conversion-Docx-Correccion-Margenes-APA7
- **Objetivo:** Generación del Reporte Final de Residencias en formato Microsoft Word (.docx / .doc), resolución del bug de márgenes anidados (9 divs sin cerrar) y purga de hojas en blanco en el PDF.
- **Herramientas & Skills:** python-docx, Chrome DevTools Protocol, markdown-it, pypdf, agency-document-generator.
- **Nota generada:** [[2026-09-29-PWA-TESChi-Conversion-Docx-Correccion-Margenes-APA7]]
- **Catálogo:** Actualizado en [[index]].
"""

with open(log_path, "r", encoding="utf-8") as f:
    log_content = f.read()

if "Conversion-Docx-Correccion-Margenes-APA7" not in log_content:
    with open(log_path, "a", encoding="utf-8") as f:
        f.write("\n" + log_entry)
    print("Updated log.md with session entry.")

print("Vault update complete!")
