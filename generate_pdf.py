import os
import sys
import re
import json
import base64
import asyncio
import subprocess
import time
import urllib.request
import websockets
import markdown_it

def build_pdf():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    md_path = os.path.join(base_dir, "Docs", "Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.md")
    logo_path = os.path.join(base_dir, "public", "teschi-logo.svg")
    pdf_out_path = os.path.join(base_dir, "Docs", "Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.pdf")
    html_out_path = os.path.join(base_dir, "Docs", "documento_impresion_teschi.html")

    print(f"Reading markdown from {md_path}...")
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    print(f"Reading SVG logo from {logo_path}...")
    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
    logo_data_uri = f"data:image/svg+xml;base64,{logo_b64}"

    # Extract parts: Portada and Hoja de Aprobacion are handled with dedicated institutional layouts
    parts = md_text.split(r'\newpage')
    
    # Custom Portada HTML matching Guide Page 3
    portada_html = f'''
<div class="portada-page">
  <div class="portada-top-logo">
    <img src="{logo_data_uri}" alt="Logo Oficial TESCHI" style="height: 52px;" />
  </div>
  <div class="portada-body-container">
    <div class="portada-inst-titles">
      <h2 class="inst-name">TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CHIMALHUACÁN</h2>
      <h3 class="div-name">DIVISIÓN DE INGENIERÍA EN SISTEMAS COMPUTACIONALES</h3>
      <h1 class="report-type">REPORTE FINAL DE RESIDENCIAS PROFESIONALES</h1>
    </div>
    
    <div class="portada-project-title-box">
      <h3 class="project-title-text">
        DESARROLLO DE UNA APLICACIÓN WEB PROGRESIVA (PWA) DE AUTOSERVICIO ACADÉMICO PARA EL MÓDULO AUXILIAR DE SERVICIOS ESCOLARES DEL TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CHIMALHUACÁN (TESCHI)
      </h3>
    </div>

    <div class="portada-presenta-block">
      <p class="presenta-label">P R E S E N T A :</p>
      <p class="student-name">IRVIN OSVALDO GÁLVEZ ROMERO</p>
      <p class="student-ctrl">NÚMERO DE CONTROL: <strong>2022452139</strong></p>
      <p class="student-career">CARRERA: INGENIERÍA EN SISTEMAS COMPUTACIONALES</p>
    </div>

    <div class="portada-signatures-grid">
      <div class="sig-column">
        <div class="sig-line"></div>
        <p class="sig-lbl">NOMBRE Y FIRMA</p>
        <p class="sig-person">M. EN C. GARDUÑO FLORES FRANCISCO ADRIÁN</p>
        <p class="sig-charge">ASESOR INTERNO</p>
      </div>
      <div class="sig-column">
        <div class="sig-line"></div>
        <p class="sig-lbl">NOMBRE Y FIRMA</p>
        <p class="sig-person">ING. OSCAR FERNANDEZ TRUJANO</p>
        <p class="sig-charge">ASESOR EXTERNO</p>
      </div>
    </div>

    <div class="portada-date-location">
      <p>CHIMALHUACÁN, ESTADO DE MÉXICO, SEPTIEMBRE DE 2026</p>
    </div>
  </div>
</div>
<div class="page-break"></div>
'''

    # Hoja de Aprobacion y Dictamen eliminada a peticion del usuario
    approval_html = ''

    # Reassemble remaining markdown content starting from Resumen Ejecutivo (parts[1:])
    remaining_md = r'\newpage'.join(parts[1:])
    
    # Process \vspace in remaining content
    remaining_md = re.sub(r'\\vspace\{[^}]+\}', '', remaining_md)

    # 1. Stash Mermaid blocks so markdown-it never sees them or breaks tags
    mermaid_blocks = {}
    def mermaid_stash(match):
        idx = len(mermaid_blocks)
        code = match.group(1).strip()
        escaped_code = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        mermaid_blocks[f"%%%MERMAID_STASH_{idx}%%%"] = (
            f'<div class="mermaid-diagram-box">'
            f'<div class="diagram-tag">DIAGRAMA DE ARQUITECTURA / FLUJO TÉCNICO</div>'
            f'<pre class="mermaid-code">{escaped_code}</pre>'
            f'</div>'
        )
        return f"\n\n%%%MERMAID_STASH_{idx}%%%\n\n"

    # 2. Stash Figure placeholders
    figure_blocks = {}
    def figure_stash(match):
        idx = len(figure_blocks)
        caption = match.group(1).strip()
        figure_blocks[f"%%%FIGURE_STASH_{idx}%%%"] = (
            f'<div class="figure-placeholder-card">'
            f'<div class="figure-icon">📷</div>'
            f'<div class="figure-text">{caption}</div>'
            f'<div class="figure-subtext">Captura oficial de alta resolución del sistema PWA con sello institucional</div>'
            f'</div>'
        )
        return f"\n\n%%%FIGURE_STASH_{idx}%%%\n\n"

    # 3. Stash Page Breaks so markdown-it does NOT wrap them in <p>...</p>
    pagebreak_blocks = {}
    def pagebreak_stash(match):
        idx = len(pagebreak_blocks)
        pagebreak_blocks[f"%%%PAGEBREAK_STASH_{idx}%%%"] = '<div class="page-break"></div>'
        return f"\n\n%%%PAGEBREAK_STASH_{idx}%%%\n\n"

    remaining_md = re.sub(r'```mermaid\s*\n(.*?)```', mermaid_stash, remaining_md, flags=re.DOTALL)
    remaining_md = re.sub(r'===\s*\n\[INSERTAR FIGURA ([^\]]+)\]\s*\n(?:Dimensiones:[^\n]*\n)?(?:Ubicación de Referencia:[^\n]*\n)?===', figure_stash, remaining_md)
    remaining_md = re.sub(r'\\newpage', pagebreak_stash, remaining_md)

    # Render rest of markdown to HTML with markdown-it
    md = markdown_it.MarkdownIt("commonmark").enable("table")
    content_html = md.render(remaining_md)

    # Wrap tables for responsive APA styling
    content_html = content_html.replace('<table>', '<div class="table-container"><table>')
    content_html = content_html.replace('</table>', '</table></div>')

    # Un-stash all blocks cleanly, replacing any wrapping <p>
    for token, html_code in mermaid_blocks.items():
        content_html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', html_code, content_html)
        content_html = content_html.replace(token, html_code)

    for token, html_code in figure_blocks.items():
        content_html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', html_code, content_html)
        content_html = content_html.replace(token, html_code)

    for token, html_code in pagebreak_blocks.items():
        content_html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', html_code, content_html)
        content_html = content_html.replace(token, html_code)

    # Eliminate any empty paragraphs that trigger blank pages
    content_html = re.sub(r'<p>\s*</p>', '', content_html)
    content_html = re.sub(r'(?:<div class="page-break"></div>\s*){2,}', '<div class="page-break"></div>', content_html)
    content_html = re.sub(r'\s*<div class="page-break"></div>\s*$', '', content_html.strip())

    body_html = portada_html + approval_html + content_html

    # Construct complete HTML document matching TESChi guide styling
    full_html = f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Reporte Final de Residencias Profesionales - TESChi</title>
<style>
  @page {{
    size: letter;
    margin-top: 3.2cm;
    margin-bottom: 2.0cm;
    margin-left: 3.0cm;
    margin-right: 2.2cm;
  }}

  *, *:before, *:after {{
    box-sizing: border-box;
  }}

  body {{
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a202c;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
  }}

  /* Page Break Utilities */
  .page-break {{
    page-break-before: always;
    break-before: page;
    clear: both;
    display: block;
    height: 0;
    margin: 0;
    padding: 0;
  }}

  p:empty {{
    display: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }}

  /* Headings */
  h1 {{
    font-size: 14.5pt;
    font-weight: bold;
    color: #14532d; /* Verde institucional bosque */
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    border-bottom: 2px solid #246a3b;
    padding-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }}

  .page-break + h1 {{
    margin-top: 0;
  }}

  h2 {{
    font-size: 12.5pt;
    font-weight: bold;
    color: #1e293b;
    margin-top: 1.1em;
    margin-bottom: 0.4em;
    page-break-after: avoid;
    break-after: avoid;
  }}

  h3 {{
    font-size: 11.5pt;
    font-weight: bold;
    color: #334155;
    margin-top: 1.0em;
    margin-bottom: 0.35em;
    page-break-after: avoid;
    break-after: avoid;
  }}

  h4, h5, h6 {{
    font-size: 11pt;
    font-weight: bold;
    color: #475569;
    margin-top: 0.8em;
    margin-bottom: 0.3em;
    page-break-after: avoid;
    break-after: avoid;
  }}

  p {{
    text-align: justify;
    text-justify: inter-word;
    margin-top: 0;
    margin-bottom: 0.7em;
    text-indent: 1.25cm; /* Sangría formal APA 7 en párrafos */
  }}

  /* Eliminar sangría en elementos específicos */
  p.no-indent, .table-container + p, h1 + p, h2 + p, h3 + p, blockquote p, .figure-placeholder-card + p, .mermaid-diagram-box + p {{
    text-indent: 0;
  }}

  blockquote {{
    margin: 1.0em 0 1.0em 1.25cm;
    padding: 0.6em 1.2em;
    border-left: 4px solid #246a3b;
    background-color: #f8fafc;
    font-style: italic;
    color: #334155;
  }}

  /* APA 7 Tables */
  .table-container {{
    margin: 1.2em 0;
    width: 100%;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    line-height: 1.35;
    margin: 0.5em 0;
    border-top: 1.5pt solid #0f172a;
    border-bottom: 1.5pt solid #0f172a;
    page-break-inside: auto;
    break-inside: auto;
  }}

  tr {{
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  th {{
    font-weight: bold;
    text-align: left;
    padding: 6px 8px;
    border-bottom: 1pt solid #0f172a;
    background-color: #f1f5f9;
    color: #0f172a;
  }}

  td {{
    padding: 5px 8px;
    border: none;
    vertical-align: top;
  }}

  hr {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.5em 0;
  }}

  ul, ol {{
    margin-top: 0;
    margin-bottom: 0.8em;
    padding-left: 2.2cm;
  }}

  li {{
    margin-bottom: 0.4em;
    text-align: justify;
  }}

  pre {{
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 10px 14px;
    font-family: "Courier New", Courier, monospace;
    font-size: 8pt;
    line-height: 1.35;
    overflow-x: auto;
    margin: 0.8em 0;
    page-break-inside: auto !important;
    break-inside: auto !important;
    white-space: pre-wrap;
    word-break: break-all;
  }}

  code {{
    font-family: inherit;
    font-size: inherit;
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    font-weight: bold;
    color: inherit;
  }}

  /* Diagram Boxes & Figure Placeholders */
  .mermaid-diagram-box {{
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #246a3b;
    border-radius: 4px;
    padding: 10px 12px;
    margin: 1.0em 0;
    page-break-inside: auto;
    break-inside: auto;
  }}

  .mermaid-diagram-box .diagram-tag {{
    font-size: 8pt;
    font-weight: bold;
    color: #166534;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }}

  .mermaid-code {{
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    font-size: 8.5pt;
    line-height: 1.35;
    color: #0f4c3a;
  }}

  .figure-placeholder-card {{
    background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
    border: 1.5px dashed #246a3b;
    border-radius: 6px;
    padding: 16px 20px;
    margin: 1.2em 0;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  .figure-icon {{
    font-size: 20pt;
    margin-bottom: 4px;
  }}

  .figure-text {{
    font-size: 10.5pt;
    font-weight: bold;
    color: #14532d;
    margin-bottom: 3px;
  }}

  .figure-subtext {{
    font-size: 8.5pt;
    color: #64748b;
    font-style: italic;
  }}

  /* Portada Styling */
  .portada-page {{
    height: 100%;
    min-height: 23cm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    padding: 0.5cm 0;
    page-break-after: always;
    break-after: page;
  }}

  .portada-top-logo {{
    margin-bottom: 12px;
  }}

  .inst-name {{
    font-size: 13.5pt;
    font-weight: bold;
    color: #14532d;
    margin: 0 0 4px 0;
    line-height: 1.25;
  }}

  .div-name {{
    font-size: 11.5pt;
    font-weight: bold;
    color: #1e3a2b;
    margin: 0 0 16px 0;
  }}

  .report-type {{
    font-size: 14pt;
    font-weight: bold;
    color: #0f172a;
    border: none;
    padding: 0;
    margin: 14px 0;
    letter-spacing: 1px;
  }}

  .portada-project-title-box {{
    margin: 18px 0;
    padding: 12px 18px;
    border-top: 2px solid #246a3b;
    border-bottom: 2px solid #246a3b;
  }}

  .project-title-text {{
    font-size: 11.5pt;
    line-height: 1.4;
    color: #14532d;
    font-weight: bold;
    margin: 0;
  }}

  .portada-presenta-block {{
    margin: 16px 0;
  }}

  .presenta-label {{
    font-size: 10pt;
    letter-spacing: 2px;
    color: #64748b;
    margin: 0 0 4px 0;
    text-indent: 0;
    text-align: center;
  }}

  .student-name {{
    font-size: 13pt;
    font-weight: bold;
    color: #0f172a;
    margin: 0 0 4px 0;
    text-indent: 0;
    text-align: center;
  }}

  .student-ctrl, .student-career {{
    font-size: 10pt;
    margin: 0 0 2px 0;
    color: #334155;
    text-indent: 0;
    text-align: center;
  }}

  .portada-signatures-grid {{
    display: flex;
    justify-content: space-around;
    margin: 32px 0 16px 0;
    gap: 30px;
  }}

  .sig-column {{
    flex: 1;
    text-align: center;
  }}

  .sig-line {{
    width: 80%;
    margin: 0 auto 8px auto;
    border-top: 1px solid #0f172a;
  }}

  .sig-lbl {{
    font-size: 8pt;
    color: #64748b;
    margin: 0 0 2px 0;
    text-indent: 0;
    text-align: center;
  }}

  .sig-person {{
    font-size: 9pt;
    font-weight: bold;
    color: #0f172a;
    margin: 0 0 2px 0;
    text-indent: 0;
    text-align: center;
  }}

  .sig-charge {{
    font-size: 8pt;
    color: #166534;
    font-weight: bold;
    margin: 0;
    text-indent: 0;
    text-align: center;
  }}

  .portada-date-location {{
    margin-top: 20px;
  }}

  .portada-date-location p {{
    font-size: 9.5pt;
    color: #64748b;
    margin: 0;
    text-indent: 0;
    text-align: center;
  }}

  /* Approval Page */
  .approval-page {{
    padding: 0.5cm 0;
  }}

  .approval-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px 35px;
    margin-top: 25px;
  }}

  .app-sig-box {{
    text-align: center;
  }}

  .app-sig-line {{
    width: 85%;
    margin: 0 auto 8px auto;
    border-top: 1px solid #334155;
  }}

  .app-sig-name {{
    font-size: 9pt;
    font-weight: bold;
    color: #0f172a;
    margin: 0 0 3px 0;
    text-indent: 0;
    text-align: center;
  }}

  .app-sig-role {{
    font-size: 8pt;
    color: #475569;
    line-height: 1.25;
    margin: 0;
    text-indent: 0;
    text-align: center;
  }}
</style>
</head>
<body>

{body_html}

</body>
</html>
'''

    print(f"Writing compiled HTML to {html_out_path}...")
    with open(html_out_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    # Now use Chrome headless via CDP to print to PDF with authentic headers/footers
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    port = 9222

    print("Launching Chrome headless with remote debugging port 9222...")
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        f"--remote-debugging-port={port}",
        "--disable-gpu",
        "--allow-file-access-from-files"
    ])
    time.sleep(1.8)

    async def render_pdf_cdp():
        try:
            # Create a new target / tab
            req = urllib.request.Request(f"http://localhost:{port}/json/new", method="PUT")
            with urllib.request.urlopen(req) as r:
                target = json.loads(r.read())
                ws_url = target["webSocketDebuggerUrl"]

            print(f"Connecting to Chrome DevTools WebSocket: {ws_url}...")
            async with websockets.connect(ws_url, max_size=100_000_000) as ws:
                # 1. Enable Page
                await ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
                await ws.recv()

                # 2. Navigate to file URL
                file_url = f"file:///{html_out_path.replace(os.sep, '/')}"
                print(f"Navigating to {file_url}...")
                await ws.send(json.dumps({"id": 2, "method": "Page.navigate", "params": {"url": file_url}}))
                await ws.recv()

                # Give time for styles and rendering to settle
                print("Waiting for page rendering to complete...")
                await asyncio.sleep(2.5)

                # 3. Build Header and Footer HTML Templates for CDP
                header_html = f'''<div style="font-size: 8pt; width: 100%; margin-left: 3.0cm; margin-right: 2.2cm; display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #246a3b; padding-bottom: 4px; font-family: Arial, sans-serif;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="{logo_data_uri}" style="height: 22px; vertical-align: middle;" />
                      <span style="font-weight: bold; color: #166534; font-size: 7.5pt; letter-spacing: 0.3px;">TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CHIMALHUACÁN</span>
                    </div>
                    <span style="font-size: 7pt; color: #64748b; font-style: italic;">Ingeniería en Sistemas Computacionales</span>
                </div>'''

                footer_html = '''<div style="font-size: 8pt; width: 100%; margin-left: 3.0cm; margin-right: 2.2cm; display: flex; justify-content: space-between; align-items: flex-end; font-family: Arial, sans-serif; color: #334155; padding-top: 4px; border-top: 0.8px solid #cbd5e1;">
                    <div style="line-height: 1.25; font-size: 7.5pt;">
                      <span style="display: block; font-weight: 500;">Tecnológico de Estudios Superiores de Chimalhuacán</span>
                      <span style="display: block; font-style: italic; color: #64748b;">División de Ingeniería en Sistemas Computacionales</span>
                    </div>
                    <div style="font-weight: bold; font-size: 8pt; color: #1e293b;">
                      Página | <span class="pageNumber"></span>
                    </div>
                </div>'''

                # Print to PDF Parameters
                print_params = {
                    "paperWidth": 8.5,       # Letter width in inches
                    "paperHeight": 11.0,     # Letter height in inches
                    "marginTop": 1.26,       # 3.2 cm in inches
                    "marginBottom": 0.787,   # 2.0 cm in inches
                    "marginLeft": 1.181,     # 3.0 cm in inches
                    "marginRight": 0.866,    # 2.2 cm in inches
                    "printBackground": True,
                    "displayHeaderFooter": True,
                    "headerTemplate": header_html,
                    "footerTemplate": footer_html,
                    "preferCSSPageSize": False
                }

                print("Requesting Page.printToPDF via CDP...")
                await ws.send(json.dumps({"id": 3, "method": "Page.printToPDF", "params": print_params}))

                resp = None
                while True:
                    raw_resp = await ws.recv()
                    msg = json.loads(raw_resp)
                    if msg.get("id") == 3:
                        resp = msg
                        break

                if "error" in resp:
                    print("CDP Error:", resp["error"])
                    return False

                pdf_data = base64.b64decode(resp["result"]["data"])
                with open(pdf_out_path, "wb") as pf:
                    pf.write(pdf_data)

                print(f"SUCCESS: PDF Generated at {pdf_out_path}")
                print(f"PDF File Size: {len(pdf_data):,} bytes ({len(pdf_data) / 1024:.1f} KB)")
                return True
        finally:
            proc.terminate()

    asyncio.run(render_pdf_cdp())

if __name__ == "__main__":
    build_pdf()
