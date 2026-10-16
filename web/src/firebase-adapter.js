/* NARX Foot Manager – adaptateur Firebase
   Remplace l'environnement Claude (window.claude.use) par Firebase :
   - "db"        -> Cloud Firestore (chaque document est stocké en JSON dans le champ « v »)
   - "user"      -> Firebase Authentication (anonyme pour les dirigeants, e-mail + mot de passe pour l'administration)
   - "downloads" -> téléchargement direct par le navigateur
   Les autres capacités (mcp, sample) ne sont pas disponibles : l'application utilise alors
   l'adresse du formulaire Google + la clé de synchronisation, et l'assistant fonctionne sans IA. */
(function () {
  if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) return; // pas de Firebase : mode local
  var ADMIN_EMAIL = window.NARX_ADMIN_EMAIL || "admin@narx-foot-manager.app";
  var auth = firebase.auth(), fs = firebase.firestore();
  if (window.NARX_FB_EMULATOR) { try { auth.useEmulator(window.NARX_FB_EMULATOR.auth); fs.useEmulator(window.NARX_FB_EMULATOR.host, window.NARX_FB_EMULATOR.port); } catch (e) {} }
  try { fs.enablePersistence({ synchronizeTabs: true }).catch(function () {}); } catch (e) {}

  var isAdminUser = function () { var u = auth.currentUser; return !!(u && !u.isAnonymous && u.email && u.email.toLowerCase() === ADMIN_EMAIL); };
  // Organisateurs (accès secondaire) : compte e-mail + code d'accès, fiche organizers/<uid> validée par l'administration
  var ORG = null;
  var isOrgUser = function () { var u = auth.currentUser; return !!(u && !u.isAnonymous && !isAdminUser()); };
  var loadOrg = function (u) {
    if (!u || u.isAnonymous || isAdminUser()) { ORG = null; return Promise.resolve(); }
    return fs.doc("organizers/" + u.uid).get().then(function (s) { ORG = s.exists ? Object.assign({ uid: u.uid }, s.data()) : { uid: u.uid, status: "aucune" }; })
      .catch(function (e) { console.warn(e); ORG = { uid: u.uid, status: "erreur" }; });
  };
  var isApprovedOrg = function () { return !!(ORG && ORG.status === "valide" && isOrgUser()); };
  var ready = new Promise(function (resolve) {
    var done = false;
    auth.onAuthStateChanged(function (u) {
      if (done) return;
      if (u) { done = true; loadOrg(u).then(function () { resolve(u); }); return; }
      auth.signInAnonymously().catch(function (e) { console.error(e); done = true; resolve(null); });
    });
  });

  var enc = function (d) { return { v: JSON.stringify(d === undefined ? null : d), t: Date.now(), o: (d && typeof d === "object" && d.owner) || null }; };
  var dec = function (snap) { var x = snap.data() || {}; if (typeof x.v === "string") { try { return JSON.parse(x.v); } catch (e) { return null; } } return x; };
  var mapErr = function (e) {
    var c = e && e.code;
    if (c === "permission-denied" || c === "unauthenticated") throw { code: "invalid_argument", message: e.message };
    if (c === "resource-exhausted") throw { code: "quota_exceeded", message: e.message };
    throw e;
  };
  var db = {
    doc: function (path) {
      var ref = fs.doc(path);
      return {
        get: function () { return ref.get().then(function (s) { return { exists: s.exists, data: function () { return s.exists ? dec(s) : undefined; } }; }); },
        set: function (data) { return ref.set(enc(data)).catch(mapErr); },
        delete: function () { return ref.delete().catch(mapErr); }
      };
    },
    collection: function (path) {
      return {
        onSnapshot: function (cb, err) {
          return fs.collection(path).onSnapshot(function (s) {
            cb({ docs: s.docs.map(function (d) { return { id: d.id, data: function () { return dec(d); } }; }) });
          }, function (e) { console.warn("Lecture refusée :", path, e && e.code); if (err) err(e); });
        }
      };
    }
  };
  var user = {
    canEdit: function () { return Promise.resolve(isAdminUser() || isApprovedOrg()); },
    id: function () { return Promise.resolve(auth.currentUser ? auth.currentUser.uid : "anonyme"); },
    profiles: function () { return Promise.resolve({}); }
  };
  var downloads = {
    save: function (o) {
      var blob = o.data instanceof Blob ? o.data : new Blob([o.data]);
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = o.filename || "fichier";
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      return Promise.resolve(true);
    }
  };

  window.NARX_FB = {
    adminEmail: ADMIN_EMAIL,
    isAdmin: isAdminUser,
    adminSignIn: function (pw) {
      return auth.signInWithEmailAndPassword(ADMIN_EMAIL, pw).then(function () { return true; })
        .catch(function (e) { console.error(e); return false; });
    },
    signOutAdmin: function () { return auth.signOut().then(function () { return auth.signInAnonymously(); }).catch(function () {}); },
    // ---- organisateurs ----
    org: function () { return ORG; },
    isOrg: isApprovedOrg,
    orgSignIn: function (email, code) {
      return auth.signInWithEmailAndPassword(String(email).trim(), code).then(function () { return { ok: true }; })
        .catch(function (e) { return { ok: false, code: e && e.code }; });
    },
    orgCheck: function (code) {
      var u = auth.currentUser; if (!u || !u.email) return Promise.resolve(false);
      return u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, code)).then(function () { return true; }).catch(function () { return false; });
    },
    orgResetCode: function (email) { return auth.sendPasswordResetEmail(String(email).trim()).then(function () { return true; }).catch(function () { return false; }); },
    // Demande d'accès : le compte anonyme de l'appareil devient le compte de l'organisateur (même identifiant)
    orgRequest: function (info, code) {
      var u = auth.currentUser, email = String(info.email).trim();
      var cred = firebase.auth.EmailAuthProvider.credential(email, code);
      var p = u && u.isAnonymous ? u.linkWithCredential(cred) : auth.createUserWithEmailAndPassword(email, code);
      return p.then(function (r) {
        var usr = (r && r.user) ? r.user : auth.currentUser, uid = usr.uid;
        return usr.getIdToken(true).then(function () { return uid; });
      }).then(function (uid) {
        var doc = Object.assign({}, info, { email: email, status: "en_attente", createdAt: new Date().toISOString() });
        return fs.doc("organizers/" + uid).set(doc).then(function () { ORG = Object.assign({ uid: uid }, doc); return { ok: true }; });
      }).catch(function (e) { console.error(e); return { ok: false, code: e && e.code }; });
    },
    orgsListen: function (cb) {
      return fs.collection("organizers").onSnapshot(function (s) { cb(s.docs.map(function (d) { return Object.assign({ uid: d.id }, d.data()); })); }, function (e) { console.warn(e); });
    },
    orgSet: function (uid, patch) { return fs.doc("organizers/" + uid).set(Object.assign({}, patch, { updatedAt: new Date().toISOString() }), { merge: true }); }
  };
  window.claude = {
    use: function (name) {
      return ready.then(function () {
        if (name === "db") return db;
        if (name === "user") return user;
        if (name === "downloads") return downloads;
        return null;
      });
    }
  };
})();
