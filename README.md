# NARX Foot Manager

Gestion de tournois et de championnats de football : inscriptions des clubs en ligne, tirage au sort des poules, feuilles de match, classements, suspensions, licences 6 × 4 cm et visuels pour les réseaux sociaux.
Version **3.13.0** – thème « Nuit bleue ».

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| `desktop/` | Application Windows et Mac (Electron) : affiche les données partagées en ligne, avec un mode « données de cet ordinateur ». |
| `android/` | Application Android (Trusted Web Activity) ; clé de signature `narx-release.jks` (à conserver, nécessaire aux mises à jour). |
| `web/public/` | Site publié sur Firebase Hosting : site de présentation (`/`) et application en ligne (`/app/`). |
| `web/src/organisateurs.js` | Accès organisateur (2ᵉ niveau d'administration) : demandes, validation, espace propre à chaque organisateur. |
| `web/src/firebase-adapter.js` | Branchement de l'application sur Firebase (Firestore + Authentication). |
| `web/claude/` | Version en ligne d'origine (Claude), source de la version Firebase. |
| `formulaire-google/` | Formulaire d'inscription des clubs (Google Apps Script : `Code.gs`, `Index.html`). |
| `tools/patches/` | Ajouts appliqués aux sources (ex. « Message aux clubs » par WhatsApp : `apply_messages.py`). |
| `tools/build_firebase.py` | Régénère `web/public/app/index.html` à partir de la version Claude. |
| `firestore.rules` | Règles de sécurité de la base de données. |
| `docs/GUIDE-FIREBASE.md` | Mise en ligne pas à pas sur Firebase. |

## Mise en ligne sur Firebase

Suivez **[docs/GUIDE-FIREBASE.md](docs/GUIDE-FIREBASE.md)**. Une fois configuré, chaque envoi sur la branche `main` publie automatiquement le site (workflow *Déployer sur Firebase*).

## Fabriquer les applications à installer

Onglet **Actions → Applications (Windows, Mac, Android) → Run workflow**. Après environ 15 minutes, la page **Releases** du dépôt contient l'installateur Windows (.exe), les .dmg Mac (puce Apple et Intel) et l'APK Android . L'offre gratuite de Firebase n'accepte pas les fichiers .apk/.exe/.dmg : ils se partagent depuis Releases (ou par WhatsApp, e-mail…). Mode d'emploi : [docs/INSTALLATION.md](docs/INSTALLATION.md).

iPhone et iPad : pas de fichier, l'application s'installe depuis Safari (Partager → Sur l'écran d'accueil).

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

## Organisateurs (accès secondaire)

- Un organisateur fait sa demande depuis le site (rubrique **Organisateurs**, lien `/app/#organisateur`) ou depuis l'application : formule **autonome (25 000 FCFA)** ou **accompagnée (50 000 FCFA)**, coordonnées, e-mail et code d'accès personnel (8 caractères minimum).
- L'accès est valable **1 an (365 jours)** à partir de la validation (champ `expiresMs`, vérifié par `firestore.rules`). À l'échéance, l'organisateur garde ses données mais ne peut plus les modifier ; il demande le renouvellement depuis l'application, et l'administration clique sur **Renouveler 1 an** (la nouvelle année s'ajoute à la date de fin en cours). Un bandeau signale les accès qui expirent dans moins de 30 jours.
- L'administration voit les demandes dans **Admin → Organisateurs** (et un bandeau sur le tableau de bord), puis **Valide**, **Refuse** ou **Suspend**. Le bouton WhatsApp prévient l'organisateur.
- Un organisateur validé se connecte avec son e-mail et son code (`/app/#organisateur-connexion`). Il ne voit et ne modifie que ses compétitions, ses clubs et ses partenaires (champ `o` des documents, contrôlé par `firestore.rules`).
- Formule accompagnée : **Admin → Organisateurs → Gérer ses compétitions** ouvre l'espace de l'organisateur pour y intervenir ; « Revenir aux données NARX » ramène à vos propres données.
- Le numéro WhatsApp NARX qui reçoit les demandes se règle dans **Admin → Organisateurs**.
- Code oublié : « Code oublié ? » envoie un e-mail de réinitialisation (Firebase Authentication).
- Fonction réservée à la version en ligne (site, Android, iPhone, et Windows/Mac en mode « Données partagées »).
