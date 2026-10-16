"""Ajoute « Message aux clubs » (WhatsApp) à un fichier de l'application (HTML en ligne ou app.js Windows/Mac).
Usage : python3 tools/patches/apply_messages.py <fichier> [...]"""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
snippet = open(os.path.join(here, 'messages-clubs.js')).read()
BTN = '<button class="btn ghost" data-act="comp-msg">Message aux clubs</button>'
for f in sys.argv[1:]:
    h = open(f).read()
    if 'function msgModal(' in h:
        print('déjà présent', f); continue
    for cond in ('${isAdmin()?`', '${adm?`'):
        old = cond + '<button class="btn" data-act="comp-link">'
        assert h.count(old) == 1, (f, old)
        h = h.replace(old, cond + BTN + '<button class="btn" data-act="comp-link">')
    mark = '/* ================= ASSISTANT INTÉGRÉ ================= */'
    assert h.count(mark) == 1, (f, mark)
    h = h.replace(mark, snippet + '\n' + mark)
    open(f, 'w').write(h); print('ok', f)
