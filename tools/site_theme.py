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
@media (max-width:1240px){.nav ul{gap:14px}.nav ul a{font-size:14px}}
@media (max-width:1120px){.nav ul li.opt{display:none}}
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
h = h.replace('Version 3.11.0', 'Version 3.13.0')
sub('Gestion de tournois et championnats · Version 3.13.0', 'Tournois et championnats · Version 3.13.0')
sub('<li><a href="#assistant">Assistant</a></li>', '<li><a href="#messages">Messages</a></li>')
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



sub('      <li><a href="#deroule">Déroulé</a></li>\n', '')
sub('<li><a href="#licences">Licences</a></li>', '<li class="opt"><a href="#licences">Licences</a></li>')
sub('<li><a href="#faq">Questions</a></li>', '<li class="opt"><a href="#faq">Questions</a></li>')
# ---------- organisateurs : accès secondaire ----------
ORG_CSS = """
.offers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.offer{border:1px solid var(--line);border-radius:22px;padding:28px;background:var(--navy);display:grid;gap:14px;align-content:start;min-width:0}
.offer.hl{border-color:var(--gold);background:linear-gradient(170deg,rgba(61,123,247,.20),var(--navy) 55%);box-shadow:var(--glow)}
.offer .price{font-family:var(--f-display);font-weight:800;font-size:clamp(40px,4.6vw,56px);letter-spacing:-.04em;line-height:1}
.offer .price small{font-family:var(--f-body);font-size:16px;font-weight:700;letter-spacing:0;color:var(--muted);margin-left:6px}
.offer .tag{justify-self:start;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;border-radius:99px;background:rgba(156,192,255,.12);color:var(--gold-2)}
.offer.hl .tag{background:var(--gold);color:#fff}
.offer p{color:var(--muted)}
.offer .btn{justify-content:center;margin-top:4px}
.howto{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px;padding:0;list-style:none;counter-reset:h}
.howto li{border:1px solid var(--line);border-radius:16px;padding:16px;background:rgba(17,29,66,.55);font-size:15px;color:var(--muted);min-width:0}
.howto li b{display:block;color:var(--fg);margin-bottom:4px}
.howto li::before{counter-increment:h;content:"0" counter(h);display:block;font-weight:800;font-size:12.5px;letter-spacing:.18em;color:var(--gold-2);margin-bottom:8px}
@media (max-width:860px){.offers{grid-template-columns:minmax(0,1fr)}.howto{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:480px){.howto{grid-template-columns:minmax(0,1fr)}}
"""
sub('</style>', ORG_CSS + '</style>')
sub('<li><a href="#telecharger">Télécharger</a></li>', '<li><a href="#organisateurs">Organisateurs</a></li>\n      <li><a href="#telecharger">Télécharger</a></li>')
ORG = """<section id="organisateurs" style="padding-top:0">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Accès organisateur</p>
      <h2>Votre compétition, <span class="accent">vos clubs.</span></h2>
      <p class="lead">Vous organisez un tournoi ou un championnat ? Obtenez votre propre espace dans NARX Foot Manager : vous y créez votre compétition et vos clubs, avec votre e-mail et votre code d'accès personnel. Vos données restent séparées de celles des autres organisateurs.</p>
    </div>
    <div class="offers">
      <div class="offer">
        <span class="tag">Formule autonome</span>
        <div class="price">25 000<small>FCFA</small></div>
        <p>Pour gérer votre propre compétition <b style="color:var(--fg)">sans l'intervention d'un membre de l'équipe NARX Foot Manager</b>.</p>
        <ul class="ticks"><li>Votre espace et votre code d'accès</li><li>Vos clubs, joueurs, staff et licences</li><li>Tirage, matchs, classements et statistiques</li><li>Visuels de match et messages WhatsApp aux clubs</li></ul>
        <a class="btn btn-line" href="/app/#organisateur">Faire la demande</a>
      </div>
      <div class="offer hl">
        <span class="tag">Formule accompagnée</span>
        <div class="price">50 000<small>FCFA</small></div>
        <p>Tout ce que propose la formule autonome, <b style="color:var(--fg)">avec l'intervention d'un membre de l'équipe NARX Foot Manager</b> pour vous accompagner dans la gestion de votre compétition.</p>
        <ul class="ticks"><li>Toutes les fonctions de la formule autonome</li><li>Un membre de l'équipe NARX intervient dans votre espace</li><li>Intervention sur vos compétitions, vos clubs et vos matchs</li></ul>
        <a class="btn btn-gold" href="/app/#organisateur">Faire la demande</a>
      </div>
    </div>
    <ol class="howto">
      <li><b>Faites la demande</b>Sur le site ou dans l'application (Windows, Mac, Android, iPhone), choisissez votre formule et votre code d'accès.</li>
      <li><b>Validation par NARX</b>L'équipe NARX Foot Manager vous contacte et vous communique les modalités de paiement.</li>
      <li><b>Accès activé</b>Dès la validation, connectez-vous avec votre e-mail et votre code d'accès.</li>
      <li><b>Gérez votre compétition</b>Créez vos clubs et votre compétition, puis suivez-la jusqu'à la finale.</li>
    </ol>
    <p class="small" style="margin-top:18px;color:var(--muted)">Déjà organisateur ? <a href="/app/#organisateur-connexion" style="color:var(--gold-2);font-weight:700">Se connecter à mon espace</a></p>
  </div>
</section>

"""
sub('<section id="telecharger"', ORG + '<section id="telecharger"')
sub('<details><summary>Qui peut modifier les compétitions ?</summary><p>Seul l\'administrateur, après avoir saisi le mot de passe. Les dirigeants de club n\'ont accès qu\'à la fiche de leur propre club et à l\'espace de consultation de leurs compétitions.</p></details>',
    '<details><summary>Qui peut modifier les compétitions ?</summary><p>L\'administration NARX, et chaque organisateur pour ses propres compétitions. Un organisateur ne voit et ne modifie que ses compétitions, ses clubs et ses partenaires. Les dirigeants de club n\'ont accès qu\'à la fiche de leur propre club et à la consultation des compétitions.</p></details>\n      <details><summary>Comment devenir organisateur ?</summary><p>Faites votre demande depuis la rubrique Organisateurs ou dans l\'application : choisissez la formule autonome (25 000 FCFA) ou accompagnée (50 000 FCFA) et votre code d\'accès. L\'équipe NARX Foot Manager vous contacte pour la validation et le paiement, puis votre espace est activé.</p></details>')

open(P, 'w').write(h)
print('ok', len(h))
