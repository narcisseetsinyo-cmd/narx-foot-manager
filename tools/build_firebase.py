"""Construit la version Firebase de NARX Foot Manager à partir de la version en ligne (thème 3.10).
Entrée  : narx_foot_manager_app.html (version Claude) + firebase-adapter.js
Sortie  : web/public/app/index.html
Usage   : python3 tools/build_firebase.py <app_claude.html> <sortie.html> [--test]"""
import sys, re, os

src, out = sys.argv[1], sys.argv[2]
test = '--test' in sys.argv
here = os.path.dirname(os.path.abspath(__file__))
adapter = open(os.path.join(here, '..', 'web', 'src', 'firebase-adapter.js')).read()
h = open(src).read()

def sub(old, new, count=1):
    global h
    assert old in h, 'motif introuvable : ' + old[:80]
    h = h.replace(old, new, count)

# 1) SDK Firebase servi par Firebase Hosting (/__/firebase/...) + configuration automatique du projet
SDK = '10.12.2'
if test:
    sdk = '<script src="test-init.js"></script>'
else:
    sdk = (f'<script src="/__/firebase/{SDK}/firebase-app-compat.js"></script>'
           f'<script src="/__/firebase/{SDK}/firebase-auth-compat.js"></script>'
           f'<script src="/__/firebase/{SDK}/firebase-firestore-compat.js"></script>'
           '<script src="/__/firebase/init.js"></script>')
i = h.index('<script>')
h = h[:i] + sdk + '\n<script>\n' + adapter + '\n</script>\n' + h[i:]

# 2) Les téléchargements depuis le formulaire Google passent par l'adresse sécurisée (clé de synchronisation)
sub('const LOCALPDF={};', 'const LOCALPDF={};\nif(window.NARX_FB)window.ggStore.fetchText=async u=>{const r=await fetch(u,{redirect:"follow"});if(!r.ok)throw new Error("HTTP "+r.status);return r.text()};')

# 3) Déverrouillage : le mot de passe administrateur ouvre aussi la session Firebase de l'administration
sub('if(await checkPw(pw)){ui.unlocked=true;',
    'if(await checkPw(pw)){if(window.NARX_FB&&!NARX_FB.isAdmin()){toast("Connexion à l\'administration…");if(!(await NARX_FB.adminSignIn(pw))){toast("Connexion refusée par Firebase : vérifiez le compte administrateur.");return}try{sessionStorage.setItem("narx_unlock","1")}catch(x){}location.reload();return}ui.unlocked=true;')

# 4) Verrouiller : ferme aussi la session administrateur sur cet appareil
sub('if(a==="lock"){ui.unlocked=false;',
    'if(a==="lock"&&window.NARX_FB){try{sessionStorage.removeItem("narx_unlock")}catch(x){}NARX_FB.signOutAdmin().then(()=>location.reload());return}\n  if(a==="lock"){ui.unlocked=false;')

# 5) Accès administrateur depuis l'espace dirigeant + retour à l'espace dirigeant depuis l'écran de connexion
sub('function viewLock(){', '''document.addEventListener("click",e=>{if(!window.NARX_FB)return;
  if(e.target.closest("#mode")&&S.role==="dirigeant"){DATA["local/settings"]={mode:"admin",me:S.me};rebuild();ui.unlocked=false;render()}
  else if(e.target.closest("[data-fbdir]"))location.reload()});
function viewLock(){''')
sub('''<button class="btn" type="submit" style="width:100%;justify-content:center">Déverrouiller</button></form>\n</div>`}''',
    '''<button class="btn" type="submit" style="width:100%;justify-content:center">Déverrouiller</button></form>${window.NARX_FB?`<p class="small muted" style="margin-top:18px">Dirigeant de club ? <button class="back" data-fbdir style="margin:0;display:inline;padding:0;text-decoration:underline">Ouvrir l'espace dirigeant</button></p>`:""}\n</div>`}''')
sub('mode.className="mode live";', 'mode.className="mode live";if(window.NARX_FB&&S.role==="dirigeant"){mode.textContent="Dirigeant de club · Accès admin";mode.style.cursor="pointer";mode.title="Ouvrir l\'administration"}else mode.style.cursor="";')

# 6) Textes propres à la version Firebase
sub("Réglages généraux de NARX Foot Manager en ligne.", "Réglages généraux de NARX Foot Manager (version Firebase).")
sub('''<h3>Donner l'accès</h3><p class="small">Partagez le lien de l'application avec le bouton Partager. <b>Contributeur</b> : un dirigeant inscrit un seul club (le sien), ses catégories, staff, joueurs, photos et PDF, depuis un ordinateur ou un téléphone ; ses informations arrivent directement ici. <b>Lecteur</b> : consulte les compétitions sans rien modifier. <b>Éditeur</b> : mêmes droits que l'administrateur, à réserver aux personnes de confiance. Les PDF des pièces ne sont lisibles que par l'administration et le club concerné.</p>''',
    '''<h3>Donner l'accès</h3><p class="small">Envoyez l'adresse de l'application (<b>${esc(location.origin)}/app/</b>) aux dirigeants. Chaque appareil reçoit automatiquement un accès personnel : le dirigeant y crée et modifie uniquement la fiche de son club (catégories, staff, joueurs, photos et PDF), et consulte les compétitions. Il doit garder le même téléphone ou ordinateur pour modifier son club ensuite ; sinon, il passe par le lien d'inscription de la compétition. L'administration s'ouvre avec le mot de passe administrateur, sur n'importe quel appareil. Les PDF des pièces ne sont lisibles que par l'administration et le club concerné.</p>''')

# 7) Titre de l'onglet
h = h.replace('<title>NARX Foot Manager</title>', '<title>NARX Foot Manager · Application</title>\n<link rel="manifest" href="/app/manifest.webmanifest">\n<link rel="icon" href="/favicon.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
    '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
    '<meta name="apple-mobile-web-app-status-bar-style" content="black">\n<meta name="apple-mobile-web-app-title" content="NARX Foot">', 1)

# 8) Installation (iPhone, Android, ordinateur) : service worker pour l'ouverture hors connexion
if not test:
    h = h.replace('</body>', '<script>if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("/app/sw.js",{scope:"/app/"}).catch(()=>{}));</script>\n</body>', 1)

# 9) Organisateurs (accès secondaire) : demandes, validation, espace propre à chaque organisateur
org = open(os.path.join(here, '..', 'web', 'src', 'organisateurs.js')).read()
sub('async function loadNames(', org + '\nasync function loadNames(')
h = h.replace('</head>', '<style>.org-mode [data-act=comp-link],.org-mode [data-act=lic-saison]{display:none!important}.orgg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0 14px}</style>\n</head>', 1)
assert 'NARX_FB' in h
open(out, 'w').write(h)
print('ok', out, len(h))
