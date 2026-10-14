/**
 * GOLDEN GENERATION CUP – Formulaire d'inscription des clubs (Google Apps Script)
 * Ouvert à tous, sans compte : les réponses arrivent dans Google Sheets,
 * les photos, logos et PDF dans Google Drive (dossiers privés de l'organisateur).
 *
 * Fonctions à lancer depuis l'éditeur (menu déroulant puis « Exécuter ») :
 *   setup()                        → crée les dossiers Drive et relie la feuille d'organisation (une seule fois)
 *   ouvrirInscriptions()           → autorise les envois (ou choisir « Ouvertes » dans l'onglet Paramètres)
 *   fermerInscriptions()           → bloque les nouveaux envois et les modifications
 *   genererDossiersApplication()   → crée un fichier .ggc-club par club pour l'application Windows
 *   nettoyerEnvoisIncomplets()     → supprime les fichiers d'envois abandonnés (plus de 24 h)
 *   cleSynchronisation()           → affiche la clé de récupération automatique pour l'application Windows
 */

// ===== FEUILLE GÉNÉRALE (réglages communs ; chaque compétition a en plus sa propre feuille et son propre document)
const ORGA_SHEET_ID = '11NhgoTe4VMaILza5s_0euaQCQP0KPwAzkTmj_nsFRtQ';
// Les paramètres de l'édition se modifient dans l'onglet « Paramètres » de cette feuille.
// Valeurs de secours, utilisées seulement si l'onglet est illisible :
const DEFAULTS = {
  EDITION: '2027',               // doit correspondre à l'année de l'édition créée dans l'application
  EDITION_LABEL: 'Édition 2027',
  MAX_PLAYERS: '25',
  BIRTH_MIN: '2003-01-01',       // nés le ou après (U25)
  BIRTH_MAX: '2011-07-17',       // nés le ou avant (16 ans au match d'ouverture)
  OPEN: 'true'
};
const CATS = ['U11','U13','U15','U17','U19','U20','U21','U23','U25','Seniors','Vétérans','Féminines','Autre'];
const STAFF_ROLES = ['Entraîneur principal', 'Entraîneur adjoint', 'Entraîneur des gardiens', 'Kinésithérapeute', 'Kinésithérapeute'];
const MAX_IMAGE = 1.5 * 1024 * 1024, MAX_PDF = 5 * 1024 * 1024;
const NAVY = '#021A62', ROYAL = '#0A3FA8', GOLD = '#F2B400';

function props_() { return PropertiesService.getScriptProperties(); }
function cfg_() {
  const p = props_().getProperties();
  const out = Object.assign({}, DEFAULTS);
  try {
    const v = SpreadsheetApp.openById(ORGA_SHEET_ID).getSheetByName('Paramètres').getRange('B4:B11').getValues().map(r => r[0]);
    const d = x => x instanceof Date ? Utilities.formatDate(x, 'Africa/Lome', 'yyyy-MM-dd') : String(x);
    out.EDITION = String(v[0]); out.EDITION_LABEL = String(v[1]); out.MAX_PLAYERS = String(v[3]);
    out.BIRTH_MIN = d(v[4]); out.BIRTH_MAX = d(v[5]); out.OPEN = String(v[7]).toLowerCase().indexOf('ouvert') === 0 ? 'true' : 'false';
  } catch (e) { /* valeurs de secours */ }
  out.ROOT_ID = p.ROOT_ID; out.SHEET_ID = p.SHEET_ID; out.TMP_ID = p.TMP_ID;
  return out;
}

/* ================= INSTALLATION ================= */
function setup() {
  const p = props_();
  if (p.getProperty('ROOT_ID')) { Logger.log('Déjà installé. Feuille : ' + SpreadsheetApp.openById(ORGA_SHEET_ID).getUrl()); return; }
  const ss = SpreadsheetApp.openById(ORGA_SHEET_ID);
  ['Clubs', 'Staff', 'Joueurs', 'Paramètres'].forEach(n => { if (!ss.getSheetByName(n)) throw new Error("Onglet manquant dans la feuille d'organisation : " + n); });
  const c = cfg_();
  const root = DriveApp.createFolder('NARX Foot Manager – Inscriptions');
  const tmp = root.createFolder('_envois_en_cours');
  root.createFolder('Clubs');
  try { DriveApp.getFileById(ORGA_SHEET_ID).moveTo(root); } catch (e) {}
  p.setProperties({ ROOT_ID: root.getId(), SHEET_ID: ORGA_SHEET_ID, TMP_ID: tmp.getId() });
  Logger.log('Installation terminée.\nFeuille : ' + ss.getUrl() + '\nDossier Drive : ' + root.getUrl() + '\nÉtape suivante : Déployer > Nouveau déploiement > Application Web (Exécuter en tant que : moi ; Accès : Tout le monde).');
}
function setOpen_(open) { SpreadsheetApp.openById(ORGA_SHEET_ID).getSheetByName('Paramètres').getRange('B11').setValue(open ? 'Ouvertes' : 'Fermées'); }
function ouvrirInscriptions() { setOpen_(true); Logger.log('Inscriptions ouvertes.'); }
function fermerInscriptions() { setOpen_(false); Logger.log('Inscriptions fermées.'); }

/* ================= APPLICATION WEB ================= */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'list' || p.action === 'get' || p.action === 'create') return syncResponse_(p);
  const titre = p.nom ? String(p.nom).slice(0, 70) + (p.cat ? ' (' + String(p.cat).slice(0, 20) + ')' : '') + ' – Inscription des clubs' : 'Inscription des clubs';
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle(titre)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
function getConfig() {
  const c = cfg_();
  return { edition: c.EDITION, label: c.EDITION_LABEL, maxPlayers: +c.MAX_PLAYERS, birthMin: c.BIRTH_MIN, birthMax: c.BIRTH_MAX, open: c.OPEN === 'true', ready: true, roles: STAFF_ROLES, cats: CATS };
}
function assertOpen_() {
  const c = cfg_();
  if (c.OPEN !== 'true') throw new Error('Les inscriptions sont fermées.');
  return c;
}
const ID_RE = /^[A-Za-z0-9_-]{6,40}$/;

/** Reçoit un fichier (photo ou PDF) encodé en base64 et le place dans le dossier d'envoi temporaire. */
function uploadFile(token, name, mime, b64) {
  assertOpen_();
  if (!ID_RE.test(String(token))) throw new Error('Envoi invalide.');
  const okMime = ['image/jpeg', 'image/png', 'application/pdf'];
  if (okMime.indexOf(mime) < 0) throw new Error('Type de fichier non accepté.');
  const bytes = Utilities.base64Decode(b64);
  if (mime === 'application/pdf') {
    if (bytes.length > MAX_PDF) throw new Error('PDF trop lourd (5 Mo maximum).');
    if (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== '%PDF') throw new Error('PDF invalide.');
  } else if (bytes.length > MAX_IMAGE) throw new Error('Image trop lourde.');
  const tmpRoot = tmpFolder_();
  const it = tmpRoot.getFoldersByName(token);
  const folder = it.hasNext() ? it.next() : tmpRoot.createFolder(token);
  const safe = String(name || 'fichier').replace(/[^\w.\- ]+/g, '_').slice(0, 80);
  const f = folder.createFile(Utilities.newBlob(bytes, mime, safe));
  return f.getId();
}

function makeCode_() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
  for (let i = 0; i < 8; i++) s += a.charAt(Math.floor(Math.random() * a.length));
  return s;
}
function findClubRow_(sh, code) {
  const n = sh.getLastRow(); if (n < 2) return -1;
  const codes = sh.getRange(2, 2, n - 1, 1).getValues();
  for (let i = 0; i < codes.length; i++) if (codes[i][0] === code) return i + 2;
  return -1;
}
function eligible_(d, c) { if (!d) return 'Date manquante'; if (d < c.BIRTH_MIN) return 'Non éligible (trop âgé)'; if (d > c.BIRTH_MAX) return 'Non éligible (moins de 16 ans)'; return 'Éligible'; }
const url_ = id => id ? 'https://drive.google.com/file/d/' + id + '/view' : '';
// Liens cliquables sans formule (indépendant de la langue de la feuille)
const rt_ = (url, label) => url ? SpreadsheetApp.newRichTextValue().setText(label).setLinkUrl(url).build() : SpreadsheetApp.newRichTextValue().setText('').build();
const link_ = (id, label) => rt_(id ? url_(id) : '', label);
function setLinks_(sh, row, col, matrix) { if (matrix.length) sh.getRange(row, col, matrix.length, matrix[0].length).setRichTextValues(matrix); }
const str_ = (v, n) => String(v == null ? '' : v).trim().slice(0, n || 80);

/** Enregistre (ou met à jour) l'inscription complète d'un club. */

/* ================= UNE FEUILLE ET UN DOCUMENT PAR COMPÉTITION ================= */
const HEAD_CLUBS = ['Date d\'envoi', 'Code club', 'Nom du club', 'Sigle', 'Quartier', 'Responsable', 'Téléphone', 'E-mail', 'Couleur', 'Logo', 'Joueurs', 'Staff complet', 'PDF manquants', 'Statut (organisation)', 'Dossier Drive', 'Données du formulaire (ne pas modifier)', 'Compétition', 'Catégorie'];
const HEAD_STAFF = ['Code club', 'Club', 'Fonction', 'Prénoms', 'Nom', 'Téléphone', 'Diplôme / qualification', 'Photo'];
const HEAD_JOUEURS = ['Code club', 'Club', 'Maillot', 'Prénoms', 'Nom', 'Date de naissance', 'Éligibilité', 'Poste', 'N° pièce d\'identité', 'Photo', 'PDF des pièces'];
function registry_() { try { return JSON.parse(props_().getProperty('COMPS') || '{}'); } catch (e) { return {}; } }
function saveRegistry_(r) { props_().setProperty('COMPS', JSON.stringify(r)); }
function rootFolder_() { const c = cfg_(); try { if (c.ROOT_ID) return DriveApp.getFolderById(c.ROOT_ID); } catch (e) {} const f = DriveApp.createFolder('NARX Foot Manager – Inscriptions'); props_().setProperty('ROOT_ID', f.getId()); return f; }
function tmpFolder_() { const c = cfg_(); try { if (c.TMP_ID) return DriveApp.getFolderById(c.TMP_ID); } catch (e) {} const f = rootFolder_().createFolder('_envois_en_cours'); props_().setProperty('TMP_ID', f.getId()); return f; }
function styleHead_(sh, n) { sh.getRange(1, 1, 1, n).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#0A3FA8').setWrap(true).setVerticalAlignment('middle'); sh.setFrozenRows(1); sh.setRowHeight(1, 36); }
function setupCompSheet_(ss, comp) {
  const first = ss.getSheets()[0];
  const tabs = [['Clubs', HEAD_CLUBS], ['Staff', HEAD_STAFF], ['Joueurs', HEAD_JOUEURS]];
  tabs.forEach(([name, head], i) => { let sh = ss.getSheetByName(name); if (!sh) sh = i === 0 ? first.setName(name) : ss.insertSheet(name); sh.getRange(1, 1, 1, head.length).setValues([head]); styleHead_(sh, head.length); });
  let pa = ss.getSheetByName('Paramètres'); if (!pa) pa = ss.insertSheet('Paramètres');
  pa.getRange('A1:B8').setValues([['Identifiant (ne pas modifier)', 'NARX:' + comp.id], ['Compétition', comp.nom || ''], ['Catégorie', comp.cat || 'Toutes catégories'], ['Saison', comp.saison || ''], ['Format', comp.type === 'championnat' ? 'Championnat' : 'Tournoi'], ['Inscriptions', 'Ouvertes'], ['Nés le ou après', comp.bmin || ''], ['Nés le ou avant', comp.bmax || '']]);
  pa.getRange('A1:A8').setFontWeight('bold'); pa.setColumnWidth(1, 240); pa.setColumnWidth(2, 260);
  pa.getRange('B6').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Ouvertes', 'Fermées'], true).build());
  const cl = ss.getSheetByName('Clubs'); cl.getRange('N2:N1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['En attente', 'Validé', 'Refusé'], true).build());
  try { cl.hideColumns(16); } catch (e) {}
}
function writeCompDoc_(doc, comp, link) {
  const b = doc.getBody(); b.clear();
  b.appendParagraph(comp.nom || 'Compétition').setHeading(DocumentApp.ParagraphHeading.TITLE);
  b.appendParagraph((comp.type === 'championnat' ? 'Championnat' : 'Tournoi') + (comp.cat ? ' · Catégorie ' + comp.cat : '') + (comp.saison ? ' · Saison ' + comp.saison : '')).setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
  b.appendParagraph('Informations').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  [['Compétition', comp.nom], ['Format', comp.type === 'championnat' ? 'Championnat (tous contre tous)' : 'Tournoi (poules puis phases finales)'], ['Catégorie', comp.cat || 'Toutes catégories'], ['Saison', comp.saison], ['Nombre d\'équipes', comp.nb], ['Joueurs nés le ou après', comp.bmin], ['Joueurs nés le ou avant', comp.bmax]].forEach(([k, v]) => { if (v) b.appendListItem(k + ' : ' + v); });
  b.appendParagraph('Inscription des clubs').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  if (link) { const p = b.appendParagraph(link); p.setLinkUrl(link); }
  b.appendParagraph('Chaque club s\'inscrit avec ce lien, depuis un téléphone ou un ordinateur, sans créer de compte. À la fin, il reçoit un code club qui permet de compléter ou corriger l\'inscription.');
  b.appendParagraph('À préparer par chaque club').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  ['Le nom, le sigle et le logo du club', 'Le staff technique (3 personnes) et les kinésithérapeutes (2 personnes), avec leur photo', 'La liste des joueurs : nom, prénoms, date de naissance, numéro de maillot, poste, photo', 'Pour chaque joueur, un PDF regroupant ses pièces (acte de naissance, pièce d\'identité), 5 Mo maximum'].forEach(t => b.appendListItem(t));
  b.appendParagraph('Suivi des inscriptions').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  b.appendParagraph('Les inscriptions arrivent dans la feuille Google de la compétition (onglets Clubs, Staff, Joueurs). L\'organisation les récupère dans NARX Foot Manager avec le bouton « Récupérer les inscriptions ».');
  doc.saveAndClose();
}
function createCompResources_(comp, link) {
  const reg = registry_(); if (reg[comp.id] && sheetOk_(reg[comp.id].sheetId)) return reg[comp.id];
  const label = (comp.nom || 'Compétition') + (comp.cat ? ' – ' + comp.cat : '');
  const folder = rootFolder_().createFolder(label); folder.createFolder('Clubs');
  const ss = SpreadsheetApp.create(label + ' – Inscriptions'); DriveApp.getFileById(ss.getId()).moveTo(folder); setupCompSheet_(ss, comp);
  const doc = DocumentApp.create(label + ' – Fiche de la compétition'); DriveApp.getFileById(doc.getId()).moveTo(folder); writeCompDoc_(doc, comp, link);
  const r = { sheetId: ss.getId(), sheetUrl: ss.getUrl(), docId: doc.getId(), docUrl: doc.getUrl(), folderId: folder.getId(), folderUrl: folder.getUrl(), nom: comp.nom || '', cat: comp.cat || '' };
  reg[comp.id] = r; saveRegistry_(reg); return r;
}
/** Feuille de destination d'une inscription : celle de la compétition (créée automatiquement au besoin), sinon la feuille générale. */
function sheetOk_(id) { if (!id) return false; try { if (DriveApp.getFileById(id).isTrashed()) return false; SpreadsheetApp.openById(id); return true; } catch (e) { return false; } }
/** Feuille des inscriptions faites sans lien de compétition (créée automatiquement si besoin). */
function generalSheet_() {
  const pr = props_(); const ids = [pr.getProperty('GENERAL_SHEET_ID'), cfg_().SHEET_ID, ORGA_SHEET_ID];
  for (const id of ids) if (sheetOk_(id)) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('NARX Foot Manager – Inscriptions sans compétition'); DriveApp.getFileById(ss.getId()).moveTo(rootFolder_());
  setupCompSheet_(ss, { id: 'general', nom: 'Inscriptions sans compétition', cat: '', type: 'tournoi' }); pr.setProperty('GENERAL_SHEET_ID', ss.getId()); return ss;
}
function targetSheet_(comp) {
  if (!comp) return { ss: generalSheet_(), folder: rootFolder_() };
  const reg = registry_();
  if (comp.sid && (!reg[comp.id] || reg[comp.id].sheetId !== comp.sid)) {
    try { const ss = SpreadsheetApp.openById(comp.sid); const pa = ss.getSheetByName('Paramètres');
      if (pa && String(pa.getRange('B1').getValue()) === 'NARX:' + comp.id) { const folder = DriveApp.getFileById(comp.sid).getParents().next(); reg[comp.id] = { sheetId: comp.sid, sheetUrl: ss.getUrl(), folderId: folder.getId(), nom: comp.nom, cat: comp.cat }; saveRegistry_(reg); } } catch (e) {}
  }
  let r = reg[comp.id]; if (r && !sheetOk_(r.sheetId)) { delete reg[comp.id]; saveRegistry_(reg); r = null; }
  if (!r) r = createCompResources_(comp, '');
  const ss = SpreadsheetApp.openById(r.sheetId); if (!ss.getSheetByName('Clubs')) setupCompSheet_(ss, comp);
  return { ss, folder: DriveApp.getFolderById(r.folderId) };
}
function allSheets_() { const out = []; const seen = {}; const add = id => { if (!id || seen[id]) return; seen[id] = 1; try { out.push(SpreadsheetApp.openById(id)); } catch (e) {} };
  [props_().getProperty('GENERAL_SHEET_ID'), cfg_().SHEET_ID, ORGA_SHEET_ID].forEach(id => { if (sheetOk_(id)) add(id); }); Object.values(registry_()).forEach(r => { if (sheetOk_(r.sheetId)) add(r.sheetId); }); return out; }
function compOpen_(comp) { if (!comp) return true; const r = registry_()[comp.id]; if (!r) return true; try { return String(SpreadsheetApp.openById(r.sheetId).getSheetByName('Paramètres').getRange('B6').getValue()).toLowerCase().indexOf('ferm') !== 0; } catch (e) { return true; } }

function submitClub(payload, token, code) {
  const c = assertOpen_();
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const pc = payload && payload.comp && /^[A-Za-z0-9_-]{1,40}$/.test(payload.comp.id || '') ? { id: payload.comp.id, nom: String(payload.comp.nom || '').slice(0, 70), cat: String(payload.cat || '').slice(0, 20), sid: /^[A-Za-z0-9_-]{20,}$/.test(payload.comp.sid || '') ? payload.comp.sid : '' } : null;
    if (pc && !compOpen_(pc)) throw new Error('Les inscriptions à cette compétition sont fermées.');
    const tgt = targetSheet_(pc); const ss = tgt.ss;
    const shC = ss.getSheetByName('Clubs'), shS = ss.getSheetByName('Staff'), shJ = ss.getSheetByName('Joueurs');
    let row = -1, prev = null;
    if (code) {
      row = findClubRow_(shC, String(code).toUpperCase());
      if (row < 0) throw new Error('Code club introuvable.');
      prev = JSON.parse(shC.getRange(row, 16).getValue() || '{}');
    } else code = makeCode_();
    code = String(code).toUpperCase();

    // --- nettoyage et validation des données
    const d = payload || {};
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    const comp = d.comp && /^[A-Za-z0-9_-]{1,40}$/.test(d.comp.id || '') ? { id: d.comp.id, sid: /^[A-Za-z0-9_-]{20,}$/.test(d.comp.sid || '') ? d.comp.sid : '', nom: str_(d.comp.nom, 70), bmin: DATE_RE.test(d.comp.bmin || '') ? d.comp.bmin : '', bmax: DATE_RE.test(d.comp.bmax || '') ? d.comp.bmax : '' } : null;
    const cat = CATS.indexOf(d.cat) >= 0 ? d.cat : (comp ? 'Seniors' : 'U25');
    if (comp && (comp.bmin || comp.bmax)) { c.BIRTH_MIN = comp.bmin || '0000-01-01'; c.BIRTH_MAX = comp.bmax || '9999-12-31'; }
    const club = { nom: str_(d.nom, 60), sigle: str_(d.sigle, 6).toUpperCase(), quartier: str_(d.quartier, 60), responsable: str_(d.responsable, 60), tel: str_(d.tel, 30), email: str_(d.email, 80), couleur: /^#[0-9a-fA-F]{6}$/.test(d.couleur) ? d.couleur : '#F2B400', logo: d.logo || null };
    if (!club.nom || !club.sigle) throw new Error('Le nom et le sigle du club sont obligatoires.');
    const n = shC.getLastRow();
    if (n >= 2) {
      const vals = shC.getRange(2, 2, n - 1, 3).getValues(), comps = shC.getRange(2, 17, n - 1, 2).getValues();
      vals.forEach((v, i) => { if (i + 2 !== row && String(comps[i][0] || '') === (comp ? comp.nom : '') && String(comps[i][1] || '') === cat && (String(v[1]).toLowerCase() === club.nom.toLowerCase() || v[2] === club.sigle)) throw new Error('Ce club est déjà inscrit dans cette compétition et cette catégorie. Utilisez « Modifier une inscription » avec votre code club.'); });
    }
    const staff = (d.staff || []).slice(0, 5).map((s, i) => ({ role: i >= 3 ? 'Kinésithérapeute' : (str_(s.role, 40) || STAFF_ROLES[i]), prenom: str_(s.prenom, 40), nom: str_(s.nom, 40).toUpperCase(), tel: str_(s.tel, 30), qualif: str_(s.qualif, 60), photo: s.photo || null }));
    while (staff.length < 5) staff.push({});
    const players = (d.players || []).slice(0, +c.MAX_PLAYERS).map(p => ({ id: ID_RE.test(p.id) ? p.id : Utilities.getUuid().replace(/-/g, '').slice(0, 12), prenom: str_(p.prenom, 40), nom: str_(p.nom, 40).toUpperCase(), naissance: /^\d{4}-\d{2}-\d{2}$/.test(p.naissance) ? p.naissance : '', maillot: Math.max(1, Math.min(99, +p.maillot || 0)), poste: str_(p.poste, 20), piece: str_(p.piece, 40), photo: p.photo || null, pdf: p.pdf || null, pdfName: str_(p.pdfName, 80) }));
    const seen = {}; players.forEach(p => { if (!p.prenom || !p.nom) throw new Error('Chaque joueur doit avoir un nom et des prénoms.'); if (seen[p.maillot]) throw new Error('Numéro de maillot en double : ' + p.maillot); seen[p.maillot] = 1; });

    // --- fichiers : ne garder que ceux de cet envoi ou du précédent, et les ranger dans le dossier du club
    const allowed = {};
    if (prev) collectIds_(prev).forEach(id => allowed[id] = true);
    const tmpRoot = tmpFolder_();
    const it = token && ID_RE.test(token) ? tmpRoot.getFoldersByName(token) : null;
    const tmpFolder = it && it.hasNext() ? it.next() : null;
    if (tmpFolder) { const fs = tmpFolder.getFiles(); while (fs.hasNext()) allowed[fs.next().getId()] = true; }
    const keep = id => (id && allowed[id]) ? id : null;
    club.logo = keep(club.logo); staff.forEach(s => s.photo = keep(s.photo)); players.forEach(p => { p.photo = keep(p.photo); p.pdf = keep(p.pdf); if (!p.pdf) p.pdfName = ''; });

    const cr = tgt.folder.getFoldersByName('Clubs'); const clubsRoot = cr.hasNext() ? cr.next() : tgt.folder.createFolder('Clubs');
    let folder;
    if (prev && prev.folder) { try { folder = DriveApp.getFolderById(prev.folder); } catch (e) { folder = null; } }
    if (!folder) folder = clubsRoot.createFolder(club.sigle + ' – ' + club.nom + ' (' + code + ')');
    else folder.setName(club.sigle + ' – ' + club.nom + ' (' + code + ')');
    const used = collectIds_({ club, staff, players });
    used.forEach(id => { try { const f = DriveApp.getFileById(id); if (!f.getParents().hasNext() || f.getParents().next().getId() !== folder.getId()) f.moveTo(folder); } catch (e) {} });
    if (prev) collectIds_(prev).forEach(id => { if (used.indexOf(id) < 0) { try { DriveApp.getFileById(id).setTrashed(true); } catch (e) {} } });
    if (tmpFolder) { const left = tmpFolder.getFiles(); while (left.hasNext()) left.next().setTrashed(true); tmpFolder.setTrashed(true); }

    // --- feuille Clubs
    const data = { code, club, staff, players, comp, cat, folder: folder.getId(), updatedAt: new Date().toISOString() };
    const staffOk = staff.filter(s => s.nom).length;
    const missingPdf = players.filter(p => !p.pdf).length;
    const statut = row > 0 ? shC.getRange(row, 14).getValue() || 'En attente' : 'En attente';
    const values = [new Date(), code, club.nom, club.sigle, club.quartier, club.responsable, club.tel, club.email, club.couleur, '', players.length, staffOk + ' / 5', missingPdf, statut, '', JSON.stringify(data), comp ? comp.nom : '', cat];
    if (row < 0) { shC.appendRow(values); row = shC.getLastRow(); } else shC.getRange(row, 1, 1, values.length).setValues([values]);
    setLinks_(shC, row, 10, [[link_(club.logo, 'Voir')]]);
    setLinks_(shC, row, 15, [[rt_(folder.getUrl(), 'Ouvrir')]]);
    shC.getRange(row, 1).setNumberFormat('dd/mm/yyyy hh:mm');

    // --- feuilles Staff et Joueurs : on remplace les lignes de ce club
    [shS, shJ].forEach(sh => { const last = sh.getLastRow(); if (last < 2) return; const codes = sh.getRange(2, 1, last - 1, 1).getValues(); for (let i = codes.length - 1; i >= 0; i--) if (codes[i][0] === code) sh.deleteRow(i + 2); });
    const sList = staff.filter(s => s.nom);
    const sRows = sList.map(s => [code, club.nom, s.role, s.prenom, s.nom, s.tel, s.qualif, '']);
    if (sRows.length) { const r0 = shS.getLastRow() + 1; shS.getRange(r0, 1, sRows.length, sRows[0].length).setValues(sRows); setLinks_(shS, r0, 8, sList.map(s => [link_(s.photo, 'Photo')])); }
    const asDate = s => { if (!s) return ''; const t = s.split('-'); return new Date(+t[0], +t[1] - 1, +t[2]); };
    const sorted = players.slice().sort((a, b) => a.maillot - b.maillot);
    const jRows = sorted.map(p => [code, club.nom, p.maillot, p.prenom, p.nom, asDate(p.naissance), eligible_(p.naissance, c), p.poste, p.piece, '', '']);
    if (jRows.length) { const r0 = shJ.getLastRow() + 1; shJ.getRange(r0, 1, jRows.length, jRows[0].length).setValues(jRows); setLinks_(shJ, r0, 10, sorted.map(p => [link_(p.photo, 'Photo'), link_(p.pdf, 'PDF')])); }
    return { code, players: players.length, missingPdf };
  } finally { lock.releaseLock(); }
}
function collectIds_(d) {
  const out = []; const add = x => { if (x) out.push(x); };
  if (d.club) add(d.club.logo);
  (d.staff || []).forEach(s => add(s && s.photo));
  (d.players || []).forEach(p => { add(p.photo); add(p.pdf); });
  return out;
}

/** Recharge une inscription existante à partir du code club (pour la modifier). */
function loadClub(code) {
  const c = assertOpen_();
  code = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(code)) throw new Error('Code club invalide.');
  let sh = null, row = -1; for (const ss of allSheets_()) { const s2 = ss.getSheetByName('Clubs'); if (!s2) continue; const r2 = findClubRow_(s2, code); if (r2 > 0) { sh = s2; row = r2; break; } }
  if (row < 0) throw new Error('Code club introuvable.');
  const d = JSON.parse(sh.getRange(row, 16).getValue());
  const thumb = id => { if (!id) return null; try { const b = DriveApp.getFileById(id).getBlob(); if (b.getContentType() === 'application/pdf') return 'pdf'; return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()); } catch (e) { return null; } };
  return { code, comp: d.comp || null, cat: d.cat || 'U25', club: Object.assign({}, d.club, { logoThumb: thumb(d.club.logo) }), staff: d.staff.map(s => Object.assign({}, s, { photoThumb: thumb(s.photo) })), players: d.players.map(p => Object.assign({}, p, { photoThumb: thumb(p.photo) })) };
}

/* ================= EXPORT VERS L'APPLICATION WINDOWS ================= */
/** Crée, pour chaque club « Validé » (ou tous si aucun n'est validé), un fichier .ggc-club importable dans l'application Windows. */
function genererDossiersApplication() {
  const c = cfg_();
  let rows = []; allSheets_().forEach(ss => { const sh = ss.getSheetByName('Clubs'); if (!sh) return; const n = sh.getLastRow(); if (n >= 2) rows = rows.concat(sh.getRange(2, 1, n - 1, 16).getValues()); });
  if (!rows.length) { Logger.log('Aucune inscription.'); return; }
  const anyValid = rows.some(r => r[13] === 'Validé');
  const root = rootFolder_();
  const it = root.getFoldersByName('Dossiers pour l\'application');
  const out = it.hasNext() ? it.next() : root.createFolder('Dossiers pour l\'application');
  let count = 0;
  rows.forEach(r => {
    if (anyValid && r[13] !== 'Validé') return;
    const d = JSON.parse(r[15] || '{}'); if (!d.club) return;
    const file = buildDossier_(d, c);
    const name = 'Dossier-' + d.club.sigle + '-' + (d.cat || 'U25') + '-' + d.code + '.ggc-club';
    const old = out.getFilesByName(name); while (old.hasNext()) old.next().setTrashed(true);
    out.createFile(name, JSON.stringify(file), 'application/json'); count++;
  });
  Logger.log(count + ' dossier(s) créé(s) dans : ' + out.getUrl());
}

function buildDossier_(d, c) {
    const cid = 'gf-' + d.code.toLowerCase();
    const photos = {}, docs = {};
    const img = id => { if (!id) return null; try { const b = DriveApp.getFileById(id).getBlob(); const ref = cid + '/' + id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 30); photos[ref] = 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()); return ref; } catch (e) { return null; } };
    const club = {
      nom: d.club.nom, sigle: d.club.sigle, couleur: d.club.couleur, quartier: d.club.quartier, responsable: d.club.responsable, tel: d.club.tel,
      logo: img(d.club.logo),
      staff: d.staff.map(s => s && s.nom ? { role: s.role, prenom: s.prenom, nom: s.nom, tel: s.tel, qualif: s.qualif, photo: img(s.photo) } : {}),
      players: d.players.map(p => {
        let pieceDoc = null;
        if (p.pdf) { try { const b = DriveApp.getFileById(p.pdf).getBlob(); const id = p.pdf.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 30); docs[id] = Utilities.base64Encode(b.getBytes()); pieceDoc = { id, name: p.pdfName || 'pieces.pdf', size: b.getBytes().length }; } catch (e) {} }
        return { id: p.id || ('p' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, d.code + '|' + p.maillot + '|' + p.nom + '|' + p.prenom)).replace(/[^A-Za-z0-9]/g, '').slice(0, 12)), prenom: p.prenom, nom: p.nom, naissance: p.naissance, maillot: p.maillot, poste: p.poste, piece: p.piece, suspSup: 0, photo: img(p.photo), pieceDoc };
      })
    };
    const file = { type: 'ggc-club', v: 2, edition: c.EDITION, clubId: cid, club, cat: d.cat || 'U25', competitionId: d.comp ? d.comp.id : null, competitionNom: d.comp ? d.comp.nom : null, photos, docs, exportedAt: new Date().toISOString() };
    return file;
}

/* ================= SYNCHRONISATION AVEC NARX FOOT MANAGER (application Windows) ================= */
/** Exécutez cette fonction une fois : elle crée la clé à coller dans NARX Foot Manager (Admin → Récupération des inscriptions → Réglages). */
function cleSynchronisation() {
  const pr = props_(); let k = pr.getProperty('SYNC_KEY');
  if (!k) { k = Utilities.getUuid().replace(/-/g, '').slice(0, 24).toUpperCase(); pr.setProperty('SYNC_KEY', k); }
  Logger.log('Clé de synchronisation à coller dans NARX Foot Manager : ' + k);
}
/** Change la clé (l'ancienne ne fonctionne plus). */
function nouvelleCleSynchronisation() { props_().deleteProperty('SYNC_KEY'); cleSynchronisation(); }
function syncResponse_(p) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  const k = props_().getProperty('SYNC_KEY');
  if (!k || String(p.key || '') !== k) return out({ ok: false, error: 'key' });
  try {
    const c = cfg_();
    if (p.action === 'create') {
      if (!/^[A-Za-z0-9_-]{1,40}$/.test(p.comp || '')) return out({ ok: false, error: 'bad_request' });
      const comp = { id: p.comp, nom: String(p.nom || '').slice(0, 70), cat: String(p.cat || '').slice(0, 20), saison: String(p.saison || '').slice(0, 20), type: p.type === 'championnat' ? 'championnat' : 'tournoi', nb: String(p.nb || '').slice(0, 3), bmin: String(p.min || '').slice(0, 10), bmax: String(p.max || '').slice(0, 10) };
      const r = createCompResources_(comp, String(p.link || ''));
      if (p.link) { let l = String(p.link); if (l.indexOf('sid=') < 0) l += (l.indexOf('?') < 0 ? '?' : '&') + 'sid=' + r.sheetId; try { writeCompDoc_(DocumentApp.openById(r.docId), comp, l); } catch (e) {} }
      return out({ ok: true, sheetId: r.sheetId, sheetUrl: r.sheetUrl, docId: r.docId, docUrl: r.docUrl, folderUrl: r.folderUrl });
    }
    let rows = []; allSheets_().forEach(ss => { const sh = ss.getSheetByName('Clubs'); if (!sh) return; const n = sh.getLastRow(); if (n >= 2) rows = rows.concat(sh.getRange(2, 1, n - 1, 16).getValues()); });
    if (p.action === 'list') {
      const list = []; rows.forEach(r => { if (!r[1] || r[13] === 'Refusé') return; try { const d = JSON.parse(r[15] || '{}'); if (d.club) list.push({ code: r[1], updatedAt: d.updatedAt || '' }); } catch (e) {} });
      return out({ ok: true, list });
    }
    const row = rows.find(r => r[1] === String(p.code || ''));
    if (!row) return out({ ok: false, error: 'not_found' });
    const d = JSON.parse(row[15] || '{}');
    return out({ ok: true, code: row[1], updatedAt: d.updatedAt || '', dossier: buildDossier_(d, c) });
  } catch (e) { return out({ ok: false, error: 'server', message: String(e && e.message || e) }); }
}

/** Supprime les envois de fichiers abandonnés depuis plus de 24 heures. */
function nettoyerEnvoisIncomplets() {
  const tmp = tmpFolder_(); const limit = Date.now() - 24 * 3600 * 1000;
  const it = tmp.getFolders(); let n = 0;
  while (it.hasNext()) { const f = it.next(); if (f.getDateCreated().getTime() < limit) { f.setTrashed(true); n++; } }
  Logger.log(n + ' envoi(s) incomplet(s) supprimé(s).');
}
