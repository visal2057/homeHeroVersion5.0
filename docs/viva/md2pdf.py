"""Minimal Markdown -> styled HTML for the viva guide (headings, tables,
fenced code, blockquotes, lists, hr, inline code/bold/links)."""
import html
import re
import sys

SRC, DST = sys.argv[1], sys.argv[2]
lines = open(SRC, encoding='utf-8').read().split('\n')


def inline(t):
    t = html.escape(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\w)\*([^*]+)\*(?!\w)', r'<em>\1</em>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
    return t


out, i = [], 0
while i < len(lines):
    ln = lines[i]

    # fenced code
    if ln.startswith('```'):
        i += 1
        buf = []
        while i < len(lines) and not lines[i].startswith('```'):
            buf.append(html.escape(lines[i]))
            i += 1
        i += 1
        out.append('<pre><code>' + '\n'.join(buf) + '</code></pre>')
        continue

    # table: header row followed by separator row
    if ln.startswith('|') and i + 1 < len(lines) and re.match(r'^\|[\s:|-]+\|$', lines[i + 1]):
        def cells(r):
            return [c.strip() for c in r.strip().strip('|').split('|')]
        head = cells(ln)
        i += 2
        body = []
        while i < len(lines) and lines[i].startswith('|'):
            body.append(cells(lines[i]))
            i += 1
        t = ['<table><thead><tr>']
        t += ['<th>%s</th>' % inline(c) for c in head]
        t.append('</tr></thead><tbody>')
        for row in body:
            t.append('<tr>' + ''.join('<td>%s</td>' % inline(c) for c in row) + '</tr>')
        t.append('</tbody></table>')
        out.append(''.join(t))
        continue

    if re.match(r'^---+$', ln):
        out.append('<hr>')
        i += 1
        continue

    m = re.match(r'^(#{1,6})\s+(.*)$', ln)
    if m:
        lvl = len(m.group(1))
        out.append('<h%d>%s</h%d>' % (lvl, inline(m.group(2)), lvl))
        i += 1
        continue

    if ln.startswith('>'):
        buf = []
        while i < len(lines) and lines[i].startswith('>'):
            buf.append(lines[i].lstrip('>').strip())
            i += 1
        out.append('<blockquote>%s</blockquote>' % inline(' '.join(buf)))
        continue

    # lists (ordered / unordered), allowing wrapped continuation lines
    m = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)$', ln)
    if m:
        ordered = bool(re.match(r'^\d+\.$', m.group(2)))
        tag = 'ol' if ordered else 'ul'
        items = []
        while i < len(lines):
            mm = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)$', lines[i])
            if mm:
                items.append(mm.group(3))
                i += 1
            elif lines[i].startswith('   ') and lines[i].strip() and items:
                items[-1] += ' ' + lines[i].strip()
                i += 1
            else:
                break
        out.append('<%s>%s</%s>' % (tag, ''.join('<li>%s</li>' % inline(x) for x in items), tag))
        continue

    if ln.strip() == '':
        i += 1
        continue

    # paragraph
    buf = []
    while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||```|>|---+$|\s*([-*]|\d+\.)\s)', lines[i]):
        buf.append(lines[i].strip())
        i += 1
    if buf:
        out.append('<p>%s</p>' % inline(' '.join(buf)))

CSS = """
@page { size: A4; margin: 16mm 14mm 16mm 14mm; }
* { box-sizing: border-box; }
body { font-family: "Segoe UI", Calibri, sans-serif; font-size: 9.6pt; line-height: 1.5;
       color: #1a202c; margin: 0; }
h1 { font-size: 19pt; color: #2b6cb0; border-bottom: 2.5px solid #2b6cb0;
     padding-bottom: 5px; margin: 0 0 4px; }
h2 { font-size: 13pt; color: #2b6cb0; margin: 20px 0 7px; border-bottom: 1px solid #cbd5e0;
     padding-bottom: 3px; page-break-after: avoid; }
h3 { font-size: 10.8pt; margin: 14px 0 5px; color: #2d3748; page-break-after: avoid; }
p { margin: 6px 0; }
table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 8.6pt;
        page-break-inside: avoid; }
th { background: #ebf4ff; text-align: left; padding: 5px 7px; border: 1px solid #bcd3ee;
     font-weight: 600; }
td { padding: 5px 7px; border: 1px solid #dde5ee; vertical-align: top; }
tr:nth-child(even) td { background: #f8fafc; }
code { font-family: Consolas, "Courier New", monospace; font-size: 8.6pt;
       background: #f1f5f9; padding: 1px 4px; border-radius: 3px; color: #b83280; }
pre { background: #f8fafc; border: 1px solid #dde5ee; border-left: 3px solid #2b6cb0;
      padding: 8px 11px; border-radius: 3px; overflow-x: auto; page-break-inside: avoid;
      margin: 8px 0; }
pre code { background: none; padding: 0; color: #1a202c; font-size: 8.4pt; }
blockquote { border-left: 3px solid #90cdf4; background: #f7fbff; margin: 8px 0;
             padding: 7px 12px; font-style: italic; color: #2d3748; page-break-inside: avoid; }
ul, ol { margin: 6px 0; padding-left: 21px; }
li { margin: 3px 0; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
a { color: #2b6cb0; text-decoration: none; }
strong { color: #1a202c; }
"""

TITLE = next((re.sub(r'^#\s+', '', l) for l in lines if l.startswith('# ')), 'Viva Guide')

doc = ('<!doctype html><html><head><meta charset="utf-8">'
       '<title>%s</title><style>%s</style></head><body>%s</body></html>'
       % (html.escape(TITLE), CSS, '\n'.join(out)))
open(DST, 'w', encoding='utf-8').write(doc)
print('wrote', DST, len(doc), 'bytes')
