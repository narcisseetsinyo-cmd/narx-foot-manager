"""Applique le thème « Nuit bleue » (3.12) au site de présentation web/public/index.html
et remplace les captures par celles de /home/claude/site/shots3 (données de démonstration).
Usage : python3 tools/site_theme.py <shots_dir>"""
import sys, re, io, base64
from PIL import Image

SHOTS = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/site/shots3'
P = 'web/public/index.html'
h = open(P).read()

def sub(old, new, count=1):
    global h
    assert old in h, 'introuvable : ' + old[:90]
    h = h.replace(old, new, count)

def webp(name, w=None, q=82):
    im = Image.open(f'{SHOTS}/{name}.png').convert('RGB')
    if w and im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

def img(alt_start, name, alt, w=None):
    """Remplace la source (et le texte alternatif) de l'image dont l'alt commence par alt_start."""
    global h
    m = re.search(r'<img src="data:image/[a-z]+;base64,[A-Za-z0-9+/=]+" alt="' + re.escape(alt_start) + r'[^"]*"', h)
    assert m, 'image introuvable : ' + alt_start
    h = h[:m.start()] + f'<img src="{webp(name, w)}" alt="{alt}"' + h[m.end():]

# ---------- polices ----------
sub('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Manrope:wght@500;600;700;800&display=swap">')

# ---------- jetons de couleur ----------
root_old = h[h.index(':root{'):h.index('}', h.index(':root{')) + 1]
sub(root_old, ''':root{
  --night:#0A1330;        /* fond « Nuit bleue » */
  --navy:#111D42;         /* cartes */
  --navy-2:#172657;       /* cartes relevées */
  --line:#22336B;
  --fg:#F2F5FF;
  --muted:#A9B8E6;
  --gold:#3D7BF7;         /* couleur d'action : bleu NARX (nom conservé pour les règles existantes) */
  --gold-2:#9CC0FF;
  --pitch:#8BC34A;        /* validé / terminé */
  --red:#D43B3B;
  --glow:0 12px 34px -8px rgba(61,123,247,.65);
  --f-display:"Bricolage Grotesque","Segoe UI",Roboto,Arial,sans-serif;
  --f-body:"Manrope","Segoe UI",Roboto,Arial,sans-serif;
  --f-mono:"Manrope","Segoe UI",Roboto,Arial,sans-serif;
  --wrap:1180px;
  --gut:clamp(16px,4vw,40px);
  color-scheme:dark;
}''')

THEME = '''
/* ===== Thème « Nuit bleue » (identique à l'application 3.12) ===== */
body{background:radial-gradient(120% 80% at 100% 100%,rgba(38,72,170,.35),transparent 60%) fixed,var(--night);font-weight:500}
h1,h2,h3{text-transform:none;font-style:normal!important;letter-spacing:-.035em;line-height:1.02}
h2{font-size:clamp(36px,4.8vw,60px)}
h3{font-size:clamp(22px,2.2vw,28px);letter-spacing:-.025em}
.hero h1{font-size:clamp(46px,6vw,84px);letter-spacing:-.045em}
.hero h1 em,.accent{font-style:normal;color:var(--gold)}
.eyebrow{display:flex;align-items:center;gap:14px;font-size:12.5px;font-weight:700;letter-spacing:.2em;color:var(--gold-2)}
.eyebrow::before{content:"";width:36px;height:2px;border-radius:2px;background:var(--red);flex-shrink:0}
.btn{font-family:var(--f-body);font-weight:700;font-size:16px;letter-spacing:0;text-transform:none;border-radius:14px;padding:13px 22px}
.btn-gold{background:var(--gold);color:#fff;box-shadow:var(--glow)}
.btn-gold:hover{background:#5A8FFF}
.btn-line{background:rgba(17,29,66,.6)}
.btn-line:hover{border-color:var(--gold-2)}
.nav{background:rgba(10,19,48,.82)}
.brand b{font-family:var(--f-display);text-transform:none;letter-spacing:-.03em;font-size:21px}
.brand b span{color:var(--fg)}
.nav .btn{font-size:14.5px;padding:9px 16px;white-space:nowrap}
.nav ul{gap:20px}
.hero::before{background:radial-gradient(60% 70% at 85% 10%,rgba(61,123,247,.40),transparent 70%),radial-gradient(40% 50% at 0% 100%,rgba(212,59,59,.10),transparent 70%)}
.hero::after{background:repeating-linear-gradient(115deg,transparent 0 120px,rgba(156,192,255,.04) 120px 122px)}
.plat{font-size:13.5px;font-weight:600}
.screen{border-radius:20px;background:var(--night);box-shadow:0 40px 90px -30px rgba(0,0,0,.85),0 0 0 6px rgba(61,123,247,.06)}
.screen .bar small{font-size:11.5px}
.phone{border-color:#060C22;border-radius:30px}
.phone img{height:auto!important}
.spec{background:linear-gradient(90deg,rgba(23,38,87,.75),rgba(17,29,66,.45))}
.spec b{font-family:var(--f-display);letter-spacing:-.03em;color:var(--fg)}
.spec div.k:first-child b{color:var(--gold)}
.flow{border-radius:22px}
.flow li{background:var(--navy)}
.flow .n{font-weight:800;letter-spacing:.18em;color:var(--gold-2)}
.flow h3{font-size:24px}
.ticks li::before{border-color:var(--pitch)}
.feat figcaption{font-size:12.5px}
.table-scroll{border-radius:20px}
.st caption{font-family:var(--f-display);text-transform:none;letter-spacing:-.02em}
.st caption span{border-color:rgba(139,195,74,.45)}
.st td.p{color:var(--fg)}
.st i{border-radius:7px}
.lic-wrap{border-radius:22px;background:radial-gradient(80% 80% at 50% 0%,rgba(61,123,247,.30),transparent 70%),var(--navy)}
.vis img{border-radius:18px}
.sizes span{border-radius:99px;font-weight:600}
.console{border-radius:22px}
.prompt{border-radius:14px}
.plan{border-radius:14px}
.plan .go span{font-family:var(--f-body);text-transform:none;letter-spacing:0;border-radius:10px}
.plan .go span.y{color:#fff;box-shadow:var(--glow)}
.card{border-radius:20px}
.card svg{color:var(--gold-2)}
.fmt{border-radius:22px}
.fmt .tag{color:#fff;font-weight:700}
.grid-f b{color:var(--fg);letter-spacing:-.03em}
.pf{border-radius:20px}
.pf.hl{background:linear-gradient(170deg,rgba(61,123,247,.18),var(--navy) 55%);box-shadow:var(--glow)}
.faq details{border-radius:16px}
.faq summary::after{font-family:var(--f-body);font-weight:700}
.final{border-radius:26px;background:linear-gradient(120deg,#2557D6,#132A6B 60%)}
.final::after{border-color:rgba(156,192,255,.25)}
.final .btn-gold{background:#fff;color:#0A1330;box-shadow:none}
/* message aux clubs */
.wa{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.9fr);gap:clamp(28px,5vw,72px);align-items:center}
.wa .duo{position:relative;padding-right:56px;padding-bottom:40px;min-width:0}
.wa .duo .phone{width:clamp(120px,30%,190px)}
.wa .bubble{display:grid;gap:6px;margin-top:6px;padding:14px 16px;border-radius:16px 16px 16px 4px;background:#103B2E;border:1px solid rgba(139,195,74,.35);font-size:14.5px;color:#E7F6E1;max-width:440px}
.wa .bubble small{color:#9CD38A;font-weight:700;font-size:12px;letter-spacing:.04em}
.steps3{display:grid;gap:10px;margin:4px 0 0;padding:0;list-style:none;counter-reset:s}
.steps3 li{position:relative;padding-left:40px;font-size:16px}
.steps3 li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:-1px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--glow)}
@media (max-width:900px){.wa{grid-template-columns:minmax(0,1fr)}.wa .txt{order:-1}}
'''
sub('</style>', THEME + '</style>')

# ---------- textes ----------
h = h.replace('Version 3.11.0', 'Version 3.12.0')
sub('Gestion de tournois et championnats · Version 3.12.0', 'Tournois et championnats · Version 3.12.0')
sub('<li><a href="#assistant">Assistant</a></li>', '<li><a href="#messages">Messages</a></li>\n      <li><a href="#assistant">Assistant</a></li>')
sub('<a class="btn btn-line" href="#telecharger">Windows et Mac</a>', '<a class="btn btn-line" href="#telecharger">Installer l\'application</a>')
sub('<div class="plat"><span>Windows</span><span>macOS</span><span>Navigateur web</span><span>Téléphone</span></div>',
    '<div class="plat"><span>Windows</span><span>macOS</span><span>Android</span><span>iPhone</span><span>Navigateur web</span></div>')
sub('inscriptions des clubs en ligne, tirage des poules, feuilles de match, classements, suspensions, licences et visuels pour vos réseaux.',
    'inscriptions des clubs en ligne, tirage des poules, feuilles de match, classements, suspensions, licences, visuels pour vos réseaux et messages WhatsApp aux clubs.')
sub('<small>NARX Foot Manager — Statistiques</small>', '<small>NARX Foot Manager — Tableau de bord</small>')
sub('<h3>Communiquer</h3><p>Affiches, résultats, tirages et classements exportés en PNG ou PDF, prêts pour WhatsApp et Facebook.</p>',
    '<h3>Communiquer</h3><p>Messages WhatsApp personnalisés à chaque club, affiches, résultats et classements exportés en PNG ou PDF.</p>')

# ---------- captures ----------
img('Écran Statistiques', 'dash', "Tableau de bord : « Bonjour, place au jeu. », compétitions, clubs, licences et partenaires", w=1280)
img('La même compétition affichée sur téléphone', 'mobile', "Le tableau de bord sur téléphone, avec la navigation en bas")
img('Tirage au sort', 'tirage', 'Tirage au sort : 16 clubs répartis dans les poules A, B, C et D', w=1280)
img('Liste des matchs', 'matchs', 'Liste des matchs de la phase de poules avec les scores et le statut Terminé', w=1280)
img('Base des clubs', 'clubs', 'Base des clubs : 16 clubs avec leur sigle, leur couleur et leur catégorie', w=1280)
img('Exemple de licence', 'lic', 'Exemple de licence « Nuit bleue » avec photo, nom, fonction, club, catégorie et date de naissance')
img('Affiche Jour de match', 'vaff', 'Affiche « Jour de match. » d\'une demi-finale, avec les écussons des deux clubs', w=720)
img('Visuel de résultat', 'vres', 'Visuel « Résultat. » d\'un quart de finale avec le score et les buteurs', w=720)

# ---------- nouvelle section : message aux clubs ----------
MSG = f'''<section id="messages" style="padding-top:0">
  <div class="wrap wa">
    <div class="duo">
      <div class="screen"><div class="bar"><i></i><i></i><i></i><small>Message aux clubs</small></div><img src="{webp('msg', 1280)}" alt="Fenêtre Message aux clubs : modèle Convocation, 16 clubs avec leur numéro, 3 messages déjà envoyés" width="1280" height="800"></div>
      <div class="phone"><img src="{webp('msg_mobile')}" alt="Message aux clubs sur téléphone" width="390" height="844"></div>
    </div>
    <div class="txt" style="display:grid;gap:16px;min-width:0">
      <p class="eyebrow">Nouveau · Message aux clubs</p>
      <h2>Un message, <span class="accent">tous les clubs.</span></h2>
      <p class="lead">Dans chaque compétition, rédigez une convocation, un programme ou un rappel une seule fois. L'application le personnalise pour chaque club et l'ouvre dans WhatsApp, directement sur le numéro du responsable.</p>
      <ol class="steps3">
        <li>Choisissez un modèle ou écrivez un message libre.</li>
        <li>Les mots {{club}}, {{responsable}} et {{competition}} sont remplacés pour chaque club.</li>
        <li>Touchez « Envoyer au club suivant » : WhatsApp s'ouvre, le message est prêt, il suffit d'envoyer.</li>
      </ol>
      <div class="bubble"><small>WhatsApp · AS Légbassito</small>Bonjour Kossi, le club AS Légbassito est convoqué pour la compétition « Coupe des Vacances Agoè-Nyivé 2 »…</div>
    </div>
  </div>
</section>

'''
sub('<section id="assistant"', MSG + '<section id="assistant"')

# ---------- FAQ ----------
sub('<details><summary>Que faut-il pour imprimer les licences ?</summary>',
    '<details><summary>Les messages WhatsApp partent-ils tout seuls ?</summary><p>Presque : l\'application prépare le message personnalisé et ouvre WhatsApp sur la bonne conversation, il ne reste qu\'à appuyer sur Envoyer. Un envoi 100 % automatique demande l\'offre payante WhatsApp Business de Meta. Les numéros utilisés sont ceux des fiches des clubs, visibles uniquement par l\'administration.</p></details>\n      <details><summary>Que faut-il pour imprimer les licences ?</summary>')

open(P, 'w').write(h)
print('ok', len(h))
