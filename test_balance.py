import re
import markdown_it

with open('Docs/Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.md', 'r', encoding='utf-8') as f:
    md_text = f.read()

parts = md_text.split(r'\newpage')
remaining_md = r'\newpage'.join(parts[2:])

mermaid_blocks = {}
def mermaid_stash(match):
    idx = len(mermaid_blocks)
    code = match.group(1).strip()
    escaped = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    mermaid_blocks[f'%%%MERMAID_BLOCK_{idx}%%%'] = f'<div class="mermaid-diagram-box"><div class="diagram-tag">DIAGRAMA</div><pre class="mermaid-code">{escaped}</pre></div>'
    return f'\n\n%%%MERMAID_BLOCK_{idx}%%%\n\n'

figure_blocks = {}
def figure_stash(match):
    idx = len(figure_blocks)
    caption = match.group(1).strip()
    figure_blocks[f'%%%FIGURE_BLOCK_{idx}%%%'] = f'<div class="figure-placeholder-card"><div>{caption}</div></div>'
    return f'\n\n%%%FIGURE_BLOCK_{idx}%%%\n\n'

remaining_md = re.sub(r'```mermaid\s*\n(.*?)```', mermaid_stash, remaining_md, flags=re.DOTALL)
remaining_md = re.sub(r'===\s*\n\[INSERTAR FIGURA ([^\]]+)\]\s*\n(?:Dimensiones:[^\n]*\n)?(?:Ubicación de Referencia:[^\n]*\n)?===', figure_stash, remaining_md)

# Replace newpage with pagebreak token
newpage_blocks = {}
def newpage_stash(match):
    idx = len(newpage_blocks)
    newpage_blocks[f'%%%NEWPAGE_BLOCK_{idx}%%%'] = '<div class="page-break"></div>'
    return f'\n\n%%%NEWPAGE_BLOCK_{idx}%%%\n\n'

remaining_md = re.sub(r'\\newpage', newpage_stash, remaining_md)

md = markdown_it.MarkdownIt('commonmark').enable('table')
content_html = md.render(remaining_md)

content_html = content_html.replace('<table>', '<div class="table-container"><table>')
content_html = content_html.replace('</table>', '</table></div>')

for token, html_code in mermaid_blocks.items():
    content_html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', html_code, content_html)
    content_html = content_html.replace(token, html_code)

for token, html_code in figure_blocks.items():
    content_html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', html_code, content_html)
    content_html = content_html.replace(token, html_code)

for token, html_code in newpage_blocks.items():
    content_html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', html_code, content_html)
    content_html = content_html.replace(token, html_code)

opens = len(re.findall(r'<div\b', content_html))
closes = len(re.findall(r'</div>', content_html))
print('Mermaid blocks count:', len(mermaid_blocks))
print('Figure blocks count:', len(figure_blocks))
print('Newpage blocks count:', len(newpage_blocks))
print(f'Div opens: {opens}, Div closes: {closes}, Difference: {opens - closes}')
