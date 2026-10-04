import os
import sys
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set cell margins (padding) in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for margin_name, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{margin_name}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    """Set background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_apa_table_borders(table):
    """Apply APA 7th edition table borders:
    - Top horizontal border on header
    - Bottom horizontal border on header
    - Bottom horizontal border on last row
    - NO vertical borders anywhere
    - NO horizontal borders on middle body rows
    """
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="8" w:space="0" w:color="333333"/>
            <w:left w:val="none"/>
            <w:bottom w:val="single" w:sz="8" w:space="0" w:color="333333"/>
            <w:right w:val="none"/>
            <w:insideH w:val="none"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(tblBorders)
    
    # Border under header row
    if len(table.rows) > 0:
        for cell in table.rows[0].cells:
            tcPr = cell._tc.get_or_add_tcPr()
            tcBorders = parse_xml(f'''
                <w:tcBorders {nsdecls("w")}>
                    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                </w:tcBorders>
            ''')
            tcPr.append(tcBorders)

def add_page_number_to_run(run):
    """Inserts a dynamic PAGE number field into a run."""
    fldSimple = OxmlElement('w:fldSimple')
    fldSimple.set(qn('w:instr'), 'PAGE')
    run._r.append(fldSimple)

def parse_markdown_runs(paragraph, text, default_font="Arial", default_size=11, default_color=None, is_bold=False, is_italic=False):
    """Parses markdown inline bold (**text**), italic (*text*), and code (`text`) into styled docx runs."""
    # Pattern to match bold, italic, or code
    pattern = re.compile(r'(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)')
    tokens = pattern.split(text)
    
    for token in tokens:
        if not token:
            continue
        run = paragraph.add_run()
        run.font.name = default_font
        run.font.size = Pt(default_size)
        if default_color:
            run.font.color.rgb = default_color
        
        # Check token formatting
        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            run.text = token[2:-2]
            run.bold = True
            run.italic = is_italic
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            run.text = token[1:-1]
            run.bold = is_bold
            run.italic = True
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            run.text = token[1:-1]
            run.bold = True
            run.italic = is_italic
        else:
            run.text = token
            run.bold = is_bold
            run.italic = is_italic

def build_word_document():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    md_path = os.path.join(base_dir, "Docs", "Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.md")
    logo_path = os.path.join(base_dir, "public", "teschi-logo.png")
    docx_out_path = os.path.join(base_dir, "Docs", "Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.docx")
    
    print(f"Reading markdown master from {md_path}...")
    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    doc = docx.Document()

    # Configure Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b) # Dark Slate / Charcoal
    normal_style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.space_before = Pt(0)
    normal_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Page Margins Setup: Standard Institutional APA 7 (Left 3.0 cm, Right 2.5 cm, Top 2.5 cm, Bottom 2.5 cm)
    for section in doc.sections:
        section.top_margin = Inches(0.984)    # 2.5 cm
        section.bottom_margin = Inches(0.984) # 2.5 cm
        section.left_margin = Inches(1.181)   # 3.0 cm
        section.right_margin = Inches(0.984)  # 2.5 cm
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        section.different_first_page_header_footer = True

    # -------------------------------------------------------------
    # 1. INSTITUTIONAL PORTADA (PAGE 1)
    # -------------------------------------------------------------
    print("Generating Portada...")
    first_section = doc.sections[0]
    
    # Header logo on Portada
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(10)
        p_logo.paragraph_format.space_after = Pt(15)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, height=Inches(0.9))

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    r = p_inst.add_run("TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CHIMALHUACÁN")
    r.font.name = 'Arial'
    r.font.size = Pt(13.5)
    r.bold = True
    r.font.color.rgb = RGBColor(0x14, 0x53, 0x2d) # Dark green

    p_gov = doc.add_paragraph()
    p_gov.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_gov.paragraph_format.space_after = Pt(4)
    r = p_gov.add_run("ORGANISMO PÚBLICO DESCENTRALIZADO DEL GOBIERNO DEL ESTADO DE MÉXICO")
    r.font.name = 'Arial'
    r.font.size = Pt(9.5)
    r.bold = True
    r.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_div.paragraph_format.space_after = Pt(22)
    r = p_div.add_run("DIVISIÓN DE INGENIERÍA EN SISTEMAS COMPUTACIONALES")
    r.font.name = 'Arial'
    r.font.size = Pt(11.5)
    r.bold = True
    r.font.color.rgb = RGBColor(0x16, 0x65, 0x34)

    # Decorative green separator rule
    p_sep = doc.add_paragraph()
    p_sep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sep.paragraph_format.space_after = Pt(22)
    r_sep = p_sep.add_run("—" * 38)
    r_sep.font.color.rgb = RGBColor(0x22, 0xc5, 0x5e)
    r_sep.bold = True

    p_rep = doc.add_paragraph()
    p_rep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rep.paragraph_format.space_after = Pt(18)
    r = p_rep.add_run("REPORTE FINAL DE RESIDENCIAS PROFESIONALES")
    r.font.name = 'Arial'
    r.font.size = Pt(14)
    r.bold = True
    r.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)

    p_tit_box = doc.add_paragraph()
    p_tit_box.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tit_box.paragraph_format.space_before = Pt(6)
    p_tit_box.paragraph_format.space_after = Pt(26)
    r = p_tit_box.add_run("DESARROLLO DE UNA APLICACIÓN WEB PROGRESIVA (PWA) DE AUTOSERVICIO ACADÉMICO PARA EL MÓDULO AUXILIAR DE SERVICIOS ESCOLARES DEL TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CHIMALHUACÁN (TESCHI)")
    r.font.name = 'Arial'
    r.font.size = Pt(12)
    r.bold = True
    r.font.color.rgb = RGBColor(0x14, 0x53, 0x2d)

    p_pres = doc.add_paragraph()
    p_pres.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pres.paragraph_format.space_after = Pt(2)
    r = p_pres.add_run("P R E S E N T A :")
    r.font.size = Pt(10)
    r.bold = True
    r.font.color.rgb = RGBColor(0x64, 0x74, 0x8b)

    p_stu = doc.add_paragraph()
    p_stu.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_stu.paragraph_format.space_after = Pt(2)
    r = p_stu.add_run("IRVIN OSVALDO GÁLVEZ ROMERO")
    r.font.size = Pt(12.5)
    r.bold = True
    r.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)

    p_ctrl = doc.add_paragraph()
    p_ctrl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ctrl.paragraph_format.space_after = Pt(2)
    r = p_ctrl.add_run("NÚMERO DE CONTROL: ")
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
    r2 = p_ctrl.add_run("2022452139")
    r2.font.size = Pt(10.5)
    r2.bold = True

    p_car = doc.add_paragraph()
    p_car.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_car.paragraph_format.space_after = Pt(30)
    r = p_car.add_run("CARRERA: INGENIERÍA EN SISTEMAS COMPUTACIONALES")
    r.font.size = Pt(10)
    r.bold = True
    r.font.color.rgb = RGBColor(0x16, 0x65, 0x34)

    # Signatures Table
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False
    sig_table.columns[0].width = Inches(3.2)
    sig_table.columns[1].width = Inches(3.2)

    cell_l = sig_table.rows[0].cells[0]
    p_sl = cell_l.paragraphs[0]
    p_sl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sl.paragraph_format.space_after = Pt(2)
    r = p_sl.add_run("_____________________________________\n")
    r.font.color.rgb = RGBColor(0x94, 0xa3, 0xb8)
    r1 = p_sl.add_run("M. EN C. GARDUÑO FLORES FRANCISCO ADRIÁN\n")
    r1.font.size = Pt(9)
    r1.bold = True
    r1.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)
    r2 = p_sl.add_run("ASESOR INTERNO")
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
    r2.bold = True

    cell_r = sig_table.rows[0].cells[1]
    p_sr = cell_r.paragraphs[0]
    p_sr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sr.paragraph_format.space_after = Pt(2)
    r = p_sr.add_run("_____________________________________\n")
    r.font.color.rgb = RGBColor(0x94, 0xa3, 0xb8)
    r1 = p_sr.add_run("ING. OSCAR FERNANDEZ TRUJANO\n")
    r1.font.size = Pt(9)
    r1.bold = True
    r1.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)
    r2 = p_sr.add_run("ASESOR EXTERNO")
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
    r2.bold = True

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.space_before = Pt(35)
    r = p_date.add_run("CHIMALHUACÁN, ESTADO DE MÉXICO, SEPTIEMBRE DE 2026")
    r.font.size = Pt(9.5)
    r.bold = True
    r.font.color.rgb = RGBColor(0x64, 0x74, 0x8b)

    # -------------------------------------------------------------
    # 2. BODY SECTION SETUP (WITH HEADER AND FOOTER)
    # -------------------------------------------------------------
    print("Setting up Document Header, Footer, and Body Sections...")
    body_section = doc.add_section()
    body_section.different_first_page_header_footer = False
    body_section.top_margin = Inches(0.984)
    body_section.bottom_margin = Inches(0.984)
    body_section.left_margin = Inches(1.181)
    body_section.right_margin = Inches(0.984)

    # Configure Header
    header = body_section.header
    header_tbl = header.add_table(rows=1, cols=2, width=Inches(6.33))
    header_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_tbl.columns[0].width = Inches(2.2)
    header_tbl.columns[1].width = Inches(4.13)

    cell_hl = header_tbl.rows[0].cells[0]
    cell_hl.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    phl = cell_hl.paragraphs[0]
    phl.paragraph_format.space_after = Pt(0)
    if os.path.exists(logo_path):
        r_hl = phl.add_run()
        r_hl.add_picture(logo_path, height=Inches(0.42))

    cell_hr = header_tbl.rows[0].cells[1]
    cell_hr.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    phr = cell_hr.paragraphs[0]
    phr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    phr.paragraph_format.space_after = Pt(0)
    r_hr1 = phr.add_run("TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CHIMALHUACÁN\n")
    r_hr1.font.size = Pt(7.5)
    r_hr1.bold = True
    r_hr1.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
    r_hr2 = phr.add_run("División de Ingeniería en Sistemas Computacionales")
    r_hr2.font.size = Pt(7.0)
    r_hr2.italic = True
    r_hr2.font.color.rgb = RGBColor(0x64, 0x74, 0x8b)

    # Add bottom border line to header table
    for cell in header_tbl.rows[0].cells:
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:bottom w:val="single" w:sz="8" w:space="0" w:color="246A3B"/>
            </w:tcBorders>
        ''')
        tcPr.append(tcBorders)

    # Configure Footer
    footer = body_section.footer
    footer_tbl = footer.add_table(rows=1, cols=2, width=Inches(6.33))
    footer_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    footer_tbl.columns[0].width = Inches(4.5)
    footer_tbl.columns[1].width = Inches(1.83)

    cell_fl = footer_tbl.rows[0].cells[0]
    pfl = cell_fl.paragraphs[0]
    pfl.paragraph_format.space_after = Pt(0)
    r_fl1 = pfl.add_run("Tecnológico de Estudios Superiores de Chimalhuacán\n")
    r_fl1.font.size = Pt(7.5)
    r_fl1.bold = True
    r_fl1.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
    r_fl2 = pfl.add_run("División de Ingeniería en Sistemas Computacionales | Residencia Profesional")
    r_fl2.font.size = Pt(7.0)
    r_fl2.italic = True
    r_fl2.font.color.rgb = RGBColor(0x64, 0x74, 0x8b)

    cell_fr = footer_tbl.rows[0].cells[1]
    pfr = cell_fr.paragraphs[0]
    pfr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pfr.paragraph_format.space_after = Pt(0)
    r_fr = pfr.add_run("Página | ")
    r_fr.font.size = Pt(8.5)
    r_fr.bold = True
    r_fr.font.color.rgb = RGBColor(0x14, 0x53, 0x2d)
    add_page_number_to_run(r_fr)

    # Add top border line to footer table
    for cell in footer_tbl.rows[0].cells:
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            </w:tcBorders>
        ''')
        tcPr.append(tcBorders)

    # -------------------------------------------------------------
    # 3. PARSING MARKDOWN CONTENT INTO WORD ELEMENTS
    # -------------------------------------------------------------
    print("Parsing master markdown content into Word document...")
    
    # Strip Portada from markdown lines
    # The markdown starts with:
    # # TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CHIMALHUACÁN ... \newpage
    # # HOJA DE APROBACIÓN Y DICTAMEN ...
    lines = md_content.splitlines()
    
    # Skip Portada: start parsing from RESUMEN EJECUTIVO
    start_idx = 0
    for i, line in enumerate(lines):
        if line.strip() == "# RESUMEN EJECUTIVO":
            start_idx = i
            break
    
    if start_idx == 0:
        for i, line in enumerate(lines):
            if "RESUMEN EJECUTIVO" in line:
                start_idx = i
                break

    print(f"Content parsing starting from line {start_idx} (Total lines: {len(lines)})")
    
    i = start_idx
    total_lines = len(lines)
    
    in_code_block = False
    code_block_lines = []
    code_block_lang = ""
    
    in_table = False
    table_lines = []

    def flush_table(t_lines):
        if not t_lines:
            return
        # Parse markdown table
        rows_data = []
        for tl in t_lines:
            tl = tl.strip()
            if not tl.startswith('|'):
                continue
            cells = [c.strip() for c in tl.split('|')[1:-1]]
            if all(set(c).issubset({'-', ':', ' '}) for c in cells):
                # separator row
                continue
            rows_data.append(cells)
        
        if not rows_data:
            return
            
        num_cols = max(len(r) for r in rows_data)
        tbl = doc.add_table(rows=len(rows_data), cols=num_cols)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = True
        
        # Populate cells
        for row_idx, rdata in enumerate(rows_data):
            row = tbl.rows[row_idx]
            is_header = (row_idx == 0)
            for col_idx in range(num_cols):
                cell_text = rdata[col_idx] if col_idx < len(rdata) else ""
                cell = row.cells[col_idx]
                set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.05
                
                if is_header:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    set_cell_shading(cell, "F1F5F9")
                    parse_markdown_runs(p, cell_text, default_size=9.5, default_color=RGBColor(0x0f, 0x17, 0x2a), is_bold=True)
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    parse_markdown_runs(p, cell_text, default_size=9.0, default_color=RGBColor(0x1e, 0x29, 0x3b))
        
        set_apa_table_borders(tbl)
        
        # Spacer after table
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)

    def flush_code_block(c_lines, lang):
        if not c_lines:
            return
        code_text = "\n".join(c_lines)
        
        # Create a shaded callout box for diagrams or code
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.3)
        cell = tbl.rows[0].cells[0]
        
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        set_cell_shading(cell, "F8FAFC")
        
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="single" w:sz="18" w:space="0" w:color="246A3B"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            </w:tcBorders>
        ''')
        tcPr.append(tcBorders)
        
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        
        # Header tag inside callout
        r_tag = p.add_run(f"[{'DIAGRAMA DE ARQUITECTURA / ESQUEMA TÉCNICO' if lang == 'mermaid' else 'FRAGMENTO DE CÓDIGO FUENTE'}]\n")
        r_tag.font.name = "Arial"
        r_tag.font.size = Pt(8)
        r_tag.bold = True
        r_tag.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
        
        r_code = p.add_run(code_text)
        r_code.font.name = "Consolas"
        r_code.font.size = Pt(8.5)
        r_code.font.color.rgb = RGBColor(0x0f, 0x4c, 0x3a)

        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)

    # Loop through lines
    while i < total_lines:
        line = lines[i]
        stripped = line.strip()

        # Handle page breaks cleanly
        if stripped == "\\newpage":
            # Add page break
            doc.add_page_break()
            i += 1
            continue

        if stripped.startswith("\\vspace"):
            i += 1
            continue

        # Handle code blocks
        if stripped.startswith("```"):
            if not in_code_block:
                in_code_block = True
                code_block_lang = stripped[3:].strip()
                code_block_lines = []
            else:
                in_code_block = False
                flush_code_block(code_block_lines, code_block_lang)
                code_block_lines = []
                code_block_lang = ""
            i += 1
            continue

        if in_code_block:
            code_block_lines.append(line)
            i += 1
            continue

        # Handle tables
        if stripped.startswith("|") and stripped.endswith("|"):
            if not in_table:
                in_table = True
                table_lines = [stripped]
            else:
                table_lines.append(stripped)
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                flush_table(table_lines)
                table_lines = []

        # Handle figure placeholder cards
        if stripped == "===":
            # Check if next line is [INSERTAR FIGURA ...]
            if i + 1 < total_lines and "[INSERTAR FIGURA" in lines[i+1]:
                fig_match = re.search(r'\[INSERTAR FIGURA ([^\]]+)\]', lines[i+1])
                fig_label = fig_match.group(1) if fig_match else "OFICIAL"
                
                # Advance until ending ===
                i += 2
                while i < total_lines and lines[i].strip() != "===":
                    i += 1
                i += 1 # Skip ending ===

                # Create elegant figure placeholder card in docx
                tbl = doc.add_table(rows=1, cols=1)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                tbl.autofit = False
                tbl.columns[0].width = Inches(6.3)
                cell = tbl.rows[0].cells[0]
                set_cell_margins(cell, top=140, bottom=140, left=140, right=140)
                set_cell_shading(cell, "F8FAFC")
                
                tcPr = cell._tc.get_or_add_tcPr()
                tcBorders = parse_xml(f'''
                    <w:tcBorders {nsdecls("w")}>
                        <w:top w:val="single" w:sz="8" w:space="0" w:color="246A3B"/>
                        <w:left w:val="single" w:sz="8" w:space="0" w:color="246A3B"/>
                        <w:bottom w:val="single" w:sz="8" w:space="0" w:color="246A3B"/>
                        <w:right w:val="single" w:sz="8" w:space="0" w:color="246A3B"/>
                    </w:tcBorders>
                ''')
                tcPr.append(tcBorders)
                
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(2)
                
                r_ico = p.add_run("📷  ")
                r_ico.font.size = Pt(14)
                r_tit = p.add_run(f"CAPTURA OFICIAL DEL SISTEMA: {fig_label}\n")
                r_tit.font.name = "Arial"
                r_tit.font.size = Pt(10)
                r_tit.bold = True
                r_tit.font.color.rgb = RGBColor(0x14, 0x53, 0x2d)
                
                r_sub = p.add_run("Módulo Escolar TESChi — Resolución Retina HD / Certificación Oficial")
                r_sub.font.name = "Arial"
                r_sub.font.size = Pt(8.5)
                r_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8b)
                r_sub.italic = True
                
                p_sp = doc.add_paragraph()
                p_sp.paragraph_format.space_before = Pt(0)
                p_sp.paragraph_format.space_after = Pt(4)
                continue

        # Handle Empty Lines
        if not stripped:
            i += 1
            continue

        # Handle Headings
        if stripped.startswith("#"):
            h_match = re.match(r'^(#{1,6})\s+(.*)$', stripped)
            if h_match:
                level = len(h_match.group(1))
                h_text = h_match.group(2).strip()
                
                # Clean bold markdown in heading if any
                h_text_clean = re.sub(r'\*\*(.*?)\*\*', r'\1', h_text)
                
                # Check if it's a major chapter to add page break
                is_major_chapter = False
                if level == 1:
                    is_major_chapter = True
                elif "CAPÍTULO" in h_text_clean.upper() or "INDICE" in h_text_clean.upper() or "REFERENCIAS" in h_text_clean.upper():
                    is_major_chapter = True
                
                if is_major_chapter and i > start_idx + 5:
                    doc.add_page_break()

                p_h = doc.add_paragraph()
                p_h.paragraph_format.keep_with_next = True
                
                if level == 1:
                    p_h.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    p_h.paragraph_format.space_before = Pt(16)
                    p_h.paragraph_format.space_after = Pt(8)
                    r = p_h.add_run(h_text_clean)
                    r.font.name = 'Arial'
                    r.font.size = Pt(15)
                    r.bold = True
                    r.font.color.rgb = RGBColor(0x14, 0x53, 0x2d)
                elif level == 2:
                    p_h.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    p_h.paragraph_format.space_before = Pt(13)
                    p_h.paragraph_format.space_after = Pt(6)
                    r = p_h.add_run(h_text_clean)
                    r.font.name = 'Arial'
                    r.font.size = Pt(13)
                    r.bold = True
                    r.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
                elif level == 3:
                    p_h.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    p_h.paragraph_format.space_before = Pt(10)
                    p_h.paragraph_format.space_after = Pt(4)
                    r = p_h.add_run(h_text_clean)
                    r.font.name = 'Arial'
                    r.font.size = Pt(11.5)
                    r.bold = True
                    r.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b)
                else:
                    p_h.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    p_h.paragraph_format.space_before = Pt(8)
                    p_h.paragraph_format.space_after = Pt(3)
                    r = p_h.add_run(h_text_clean)
                    r.font.name = 'Arial'
                    r.font.size = Pt(11)
                    r.bold = True
                    r.italic = True
                    r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
                
                i += 1
                continue

        # Handle Blockquotes
        if stripped.startswith(">"):
            quote_text = stripped[1:].strip()
            p_q = doc.add_paragraph()
            p_q.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p_q.paragraph_format.left_indent = Inches(0.4)
            p_q.paragraph_format.right_indent = Inches(0.4)
            p_q.paragraph_format.space_before = Pt(4)
            p_q.paragraph_format.space_after = Pt(6)
            parse_markdown_runs(p_q, quote_text, default_size=10, default_color=RGBColor(0x16, 0x65, 0x34), is_italic=True)
            i += 1
            continue

        # Handle Lists
        list_match = re.match(r'^(\*|-|\+)\s+(.*)$', stripped)
        if list_match:
            p_list = doc.add_paragraph(style='List Bullet')
            p_list.paragraph_format.left_indent = Inches(0.3)
            p_list.paragraph_format.space_before = Pt(1)
            p_list.paragraph_format.space_after = Pt(2)
            parse_markdown_runs(p_list, list_match.group(2))
            i += 1
            continue

        num_list_match = re.match(r'^(\d+)\.\s+(.*)$', stripped)
        if num_list_match:
            p_num = doc.add_paragraph(style='List Number')
            p_num.paragraph_format.left_indent = Inches(0.3)
            p_num.paragraph_format.space_before = Pt(1)
            p_num.paragraph_format.space_after = Pt(2)
            parse_markdown_runs(p_num, num_list_match.group(2))
            i += 1
            continue

        # Handle Horizontal Rules
        if stripped in ("---", "***", "___"):
            # Subtle divider
            p_hr = doc.add_paragraph()
            p_hr.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_hr.paragraph_format.space_before = Pt(6)
            p_hr.paragraph_format.space_after = Pt(6)
            r = p_hr.add_run("—" * 35)
            r.font.color.rgb = RGBColor(0xca, 0xd4, 0xce)
            i += 1
            continue

        # Handle APA 7 Table and Figure titles and notes specially for formatting
        is_figure_or_table_title = bool(re.match(r'^\*?(Figura|Tabla)\s+\d+.*', stripped))
        is_apa_note = stripped.startswith("*Nota.*") or stripped.startswith("Nota:")

        p_body = doc.add_paragraph()
        if is_figure_or_table_title:
            p_body.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p_body.paragraph_format.space_before = Pt(8)
            p_body.paragraph_format.space_after = Pt(3)
            p_body.paragraph_format.keep_with_next = True
            parse_markdown_runs(p_body, stripped, default_size=10.5, default_color=RGBColor(0x0f, 0x17, 0x2a), is_bold=True)
        elif is_apa_note:
            p_body.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p_body.paragraph_format.space_before = Pt(2)
            p_body.paragraph_format.space_after = Pt(8)
            parse_markdown_runs(p_body, stripped, default_size=9.5, default_color=RGBColor(0x47, 0x55, 0x69))
        else:
            p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_body.paragraph_format.space_before = Pt(0)
            p_body.paragraph_format.space_after = Pt(5)
            parse_markdown_runs(p_body, stripped, default_size=11)

        i += 1

    # Save document
    print(f"Saving compiled Word document to {docx_out_path}...")
    doc.save(docx_out_path)
    file_size = os.path.getsize(docx_out_path)
    print(f"SUCCESS: Word Document Generated! Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")

if __name__ == "__main__":
    build_word_document()
