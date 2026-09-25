---
name: second-brain-autolog
description: >-
  Autonomous logger and project centralizer that connects Antigravity projects with the user's Obsidian Second Brain vault (c:/Users/User/Documents/vault). Captures technical decisions, tools used, skills, architectures, Mermaid diagrams, Archify HTML/JSON diagrams, and session syntheses without interrupting the user.
---

# Skill: Second Brain Auto-Logger

Esta habilidad le enseña al agente cómo extraer el valor técnico de cualquier sesión de trabajo en Antigravity y compilarlo en el Segundo Cerebro de Obsidian sin interrumpir al usuario.

---

## 📍 Rutas del Vault
- **Raíz del Vault:** `c:/Users/User/Documents/vault`
- **Síntesis de Sesiones:** `c:/Users/User/Documents/vault/pages/syntheses/`
- **Conceptos Nuevos:** `c:/Users/User/Documents/vault/pages/concepts/`
- **Entidades/Herramientas:** `c:/Users/User/Documents/vault/pages/entities/`
- **Índice:** `c:/Users/User/Documents/vault/index.md`
- **Bitácora:** `c:/Users/User/Documents/vault/log.md`

---

## 📋 Pasos de Ejecución

### 1. Extracción de Metadatos y Aprendizajes
Revisa la conversación actual e identifica:
- **Herramientas empleadas:** (e.g. `run_command`, `replace_file_content`, scripts PowerShell, linters).
- **Skills invocadas:** (e.g. `archify`, `agy-customizations`, skills de tests, skills de deployment).
- **Decisiones arquitectónicas:** Por qué se eligió una solución sobre otra.
- **Diagramas y Entregables:**
  - Diagrama visual en **Mermaid** que resuma el flujo, los módulos o la secuencia.
  - Diagramas generados con **Archify** (`Docs/diagramas/*.json` y `*.html`), registrando tipo (`architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`) y rutas.

### 2. Redacción de la Nota de Síntesis
Escribe el archivo en:
`c:/Users/User/Documents/vault/pages/syntheses/YYYY-MM-DD-[NombreProyecto]-[Tema].md`

Asegúrate de incluir:
- Frontmatter YAML con etiquetas claras.
- Tabla formateada de herramientas y skills (incluyendo `archify` si aplica).
- Diagrama Mermaid delimitado con cuatro o tres backticks según corresponda.
- Referencias y enlaces a los diagramas interactivos HTML generados en `Docs/diagramas/`.
- Puntos clave y lecciones aprendidas.
- Enlaces internos `[[...]]` (e.g. `[[Archify]]`).

### 3. Actualización de Catálogo e Historial
- Añade el enlace a `index.md` bajo `## 📊 4. Síntesis & Comparativas (pages/syntheses/)`.
- Si se creó una entidad de herramienta o concepto nuevo, regístralo en `pages/entities/` o `pages/concepts/` y en `index.md`.
- Añade una entrada con encabezado `## [YYYY-MM-DD] SESION | [NombreProyecto] - [Tema]` en `log.md`.

### 4. Verificación de Salud
Si tienes acceso a ejecutar comandos en la bóveda, ejecuta:
`python c:/Users/User/Documents/vault/scripts/vault_lint.py`
para asegurar que no quedaron enlaces rotos ni cabeceras mal formateadas (10/10 salud).

