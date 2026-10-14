# NARX Foot Manager

Gestion de tournois et de championnats de football : inscriptions des clubs en ligne, tirage au sort des poules, feuilles de match, classements, suspensions, licences 6 × 4 cm et visuels pour les réseaux sociaux.
Version **3.10.0** – thème « Nuit bleue ».

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| `desktop/` | Application Windows et Mac (Electron). |
| `web/public/` | Site publié sur Firebase Hosting : site de présentation (`/`) et application en ligne (`/app/`). |
| `web/src/firebase-adapter.js` | Branchement de l'application sur Firebase (Firestore + Authentication). |
| `web/claude/` | Version en ligne d'origine (Claude), source de la version Firebase. |
| `formulaire-google/` | Formulaire d'inscription des clubs (Google Apps Script : `Code.gs`, `Index.html`). |
| `tools/build_firebase.py` | Régénère `web/public/app/index.html` à partir de la version Claude. |
| `firestore.rules` | Règles de sécurité de la base de données. |
| `docs/GUIDE-FIREBASE.md` | Mise en ligne pas à pas sur Firebase. |

## Mise en ligne sur Firebase

Suivez **[docs/GUIDE-FIREBASE.md](docs/GUIDE-FIREBASE.md)**. Une fois configuré, chaque envoi sur la branche `main` publie automatiquement le site (workflow *Déployer sur Firebase*).

## Fabriquer les installateurs Windows et Mac

Onglet **Actions → Applications Windows et Mac → Run workflow**. Après quelques minutes, les fichiers `.exe` (Windows), `.dmg` et `.zip` (Mac, puce Apple et Intel) se téléchargent en bas de la page du lancement, rubrique **Artifacts**.

En local :

```bash
cd desktop
npm ci
npm start            # lancer l'application
npm run dist:win     # installateur Windows
npm run dist:mac     # application Mac (sur un Mac)
```

## Mettre à jour la version Firebase après une modification de l'application en ligne

```bash
python3 tools/build_firebase.py web/claude/narx_foot_manager_app.html web/public/app/index.html
git commit -am "Mise à jour de l'application" && git push
```

## Sécurité

- L'administration est protégée par le mot de passe administrateur (empreinte SHA-256 dans le code) et, sur Firebase, par le compte `admin@narx-foot-manager.app`.
- Le dépôt doit rester **privé**. Ne jamais y ajouter le fichier JSON du compte de service Google.
