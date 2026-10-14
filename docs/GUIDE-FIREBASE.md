# Mettre NARX Foot Manager en ligne sur Firebase

Ce guide se fait **une seule fois**, entièrement dans le navigateur (aucune installation sur l'ordinateur).
À la fin, le site est disponible à l'adresse **https://VOTRE-PROJET.web.app** :

- `https://VOTRE-PROJET.web.app/` : le site de présentation ;
- `https://VOTRE-PROJET.web.app/app/` : l'application (administration + espace des dirigeants), avec sa propre base de données.

Ensuite, chaque modification envoyée sur GitHub (branche `main`) met le site à jour automatiquement.

---

## 1. Créer le projet Firebase (gratuit)

1. Ouvrez <https://console.firebase.google.com> avec votre compte Google.
2. **Créer un projet** → nom : `NARX Foot Manager` → Continuer.
3. Google Analytics : vous pouvez le désactiver → **Créer le projet**.
4. Notez l'**identifiant du projet** (sous le nom, par exemple `narx-foot-manager-1a2b3`). Il servira à l'étape 6.

## 2. Activer les connexions

1. Menu de gauche : **Créer → Authentication** → **Commencer**.
2. Onglet **Mode de connexion** (Sign-in method), activez :
   - **Anonyme** → Activer → Enregistrer (pour les dirigeants de club) ;
   - **Adresse e-mail/Mot de passe** → Activer → Enregistrer (pour l'administration).
3. Onglet **Utilisateurs** → **Ajouter un utilisateur** :
   - e-mail : `admin@narx-foot-manager.app`
   - mot de passe : **le même mot de passe administrateur que dans l'application**
   - → Ajouter un utilisateur.

> L'adresse `admin@narx-foot-manager.app` n'a pas besoin d'exister : c'est seulement l'identifiant du compte administrateur.

## 3. Créer la base de données

1. **Créer → Firestore Database** → **Créer une base de données**.
2. Emplacement : **eur3 (Europe)** → Suivant.
3. Choisissez **Démarrer en mode production** → Créer.

(Les règles de sécurité du fichier `firestore.rules` sont envoyées automatiquement à l'étape 7.)

## 4. Déclarer l'application Web et l'hébergement

1. Roue dentée en haut à gauche → **Paramètres du projet** → onglet **Général**.
2. Rubrique **Vos applications** → icône **`</>`** (Web).
3. Surnom : `NARX Web` → cochez **Configurer également Firebase Hosting** → **Enregistrer l'application**.
4. Cliquez sur **Suivant** jusqu'à la fin (inutile de copier le code affiché, ni d'installer quoi que ce soit).

## 5. Créer la clé de déploiement pour GitHub

1. Ouvrez <https://console.cloud.google.com/iam-admin/serviceaccounts> et choisissez votre projet en haut de la page.
2. **Créer un compte de service** → nom : `github-deploy` → Créer et continuer.
3. Rôle : recherchez et choisissez **Administrateur Firebase** (Firebase Admin) → Continuer → OK.
4. Cliquez sur le compte `github-deploy` créé → onglet **Clés** → **Ajouter une clé → Créer une clé** → **JSON** → Créer.
   Un fichier `.json` se télécharge. **Ne le partagez avec personne** et ne l'envoyez pas dans le dépôt.

## 6. Donner la clé à GitHub

Dans le dépôt <https://github.com/narcisseetsinyo-cmd/narx-foot-manager> :

1. **Settings → Secrets and variables → Actions**.
2. Onglet **Secrets** → **New repository secret** :
   - Name : `FIREBASE_SERVICE_ACCOUNT`
   - Secret : ouvrez le fichier `.json` téléchargé (avec TextEdit ou le Bloc-notes), copiez **tout** son contenu et collez-le ici → Add secret.
3. (L'identifiant du projet, `narx-foot-manager`, est déjà inscrit dans le fichier `.firebaserc`.)
4. Vous pouvez ensuite supprimer le fichier `.json` de votre ordinateur.

## 7. Publier

1. Onglet **Actions** du dépôt → **Déployer sur Firebase** → **Run workflow** → Run workflow.
2. Attendez la coche verte (environ 1 minute).
3. Ouvrez `https://VOTRE-PROJET.web.app/app/`.

Si une croix rouge apparaît, ouvrez le lancement et envoyez le message d'erreur : il indique en général un rôle manquant sur le compte de service.

## 8. Premiers réglages dans l'application

1. Ouvrez `/app/` → cliquez sur **Dirigeant de club · Accès admin** en haut → saisissez le mot de passe administrateur.
2. **Admin → Récupération des inscriptions → Réglages** :
   - adresse du formulaire Google (…/exec) ;
   - clé de synchronisation (dans script.google.com, exécutez la fonction `cleSynchronisation` et copiez la clé affichée).
3. Pour reprendre les données de la version Claude : dans la version Claude, **Admin → Exporter une sauvegarde**, puis dans la version Firebase, **Admin → Restaurer une sauvegarde**.

## Bon à savoir

- **Dirigeants** : chaque téléphone ou ordinateur reçoit automatiquement un accès personnel. Un dirigeant modifie son club depuis le même appareil ; s'il change d'appareil, il passe par le lien d'inscription de la compétition.
- **Offre gratuite (Spark)** : 1 Go de données, 50 000 lectures et 20 000 écritures par jour, largement suffisant pour quelques compétitions.
- **Installer sur téléphone** : ouvrez `/app/` dans Chrome (Android) ou Safari (iPhone) → menu → **Ajouter à l'écran d'accueil**.
