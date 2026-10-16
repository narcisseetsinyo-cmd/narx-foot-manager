/* ================= ORGANISATEURS : accès secondaire (version Firebase) =================
   - Un organisateur fait sa demande (formule autonome ou accompagnée), choisit son code d'accès,
     puis l'administration NARX valide la demande.
   - Une fois validé, il crée et gère SES compétitions, SES clubs et SES partenaires (champ owner = son identifiant).
   - L'administration voit les demandes, valide / suspend, et peut intervenir dans l'espace d'un organisateur. */
const ORGF = window.NARX_FB || null;
const ORG_FORMULES = {
  autonome: { nom: "Formule autonome", prix: "25 000 FCFA", duree: "1 an (365 jours)", txt: "Vous créez et gérez votre propre compétition et vos clubs vous-même, sans l'intervention d'un membre de l'équipe NARX Foot Manager." },
  accompagne: { nom: "Formule accompagnée", prix: "50 000 FCFA", duree: "1 an (365 jours)", txt: "Un membre de l'équipe NARX Foot Manager intervient pour vous accompagner dans la gestion de votre compétition." }
};
const ORG_DUREE_J = 365, ORG_DUREE_MS = ORG_DUREE_J * 864e5;   // accès valable 1 an (365 jours) à partir de la validation
const orgExp = o => (o && +o.expiresMs) || 0;
const orgExpired = o => !!(o && o.status === "valide" && orgExp(o) <= Date.now());
const orgDays = o => Math.ceil((orgExp(o) - Date.now()) / 864e5);
const orgDate = ms => new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const ORG_STATUTS = { en_attente: ["En attente", ""], valide: ["Validé", "ok"], suspendu: ["Suspendu", "bad"], refuse: ["Refusé", "bad"] };
let ORGS = [], orgUnsub = null, orgHashDone = false;
const orgMe = () => (ORGF && ORGF.isOrg() ? ORGF.org() : null);            // organisateur connecté et validé
const orgPending = () => { const o = ORGF && ORGF.org(); return o && (o.status !== "valide" || orgExpired(o)) ? o : null };
const orgSuper = () => !!(ORGF && ORGF.isAdmin());                          // administration NARX
const orgScope = () => { const o = orgMe(); if (o) return o.uid; return orgSuper() && ui.scope ? ui.scope : null };
const orgWa = () => ((DATA["settings/public"] || {}).wa || "").replace(/\D/g, "");
const orgName = o => (o && (o.structure || o.nom)) || "Organisateur";
const orgCount = uid => Object.entries(DATA).filter(([k, v]) => /^competitions\/[^/]+$/.test(k) && v && v.owner === uid).length;
const orgWaLink = (num, txt) => `https://wa.me/${num}?text=${encodeURIComponent(txt)}`;
const orgPhone = t => { let d = String(t || "").replace(/[^\d+]/g, ""); if (d.startsWith("+")) d = d.slice(1); else if (d.startsWith("00")) d = d.slice(2); else { d = d.replace(/^0+/, ""); if (d.length <= 9) d = "228" + d } return d.replace(/\D/g, "") };

if (ORGF) {
  // 1) Chacun ne voit que son périmètre : l'organisateur ses données, l'administration les données NARX (ou celles d'un organisateur pendant une intervention)
  const _rebuild0 = rebuild;
  rebuild = function () {
    _rebuild0();
    if (S.role === "dirigeant") return;
    const sc = orgScope(); const keep = v => ((v && v.owner) || null) === sc;
    ["comps", "clubs", "partners"].forEach(k => { const o = {}; Object.entries(S[k] || {}).forEach(([id, v]) => { if (keep(v)) o[id] = v }); S[k] = o });
    if (ED() && !S.comps[ED()]) { S.matches = {}; S.lmatches = S.matches }
    S.league = isLeague() ? edoc() : null;
    if (orgMe()) ui.unlocked = true;
  };
  // 2) Tout ce qui est créé dans un périmètre organisateur lui appartient
  const _write0 = write;
  write = async function (path, data) {
    const sc = S.role !== "dirigeant" ? orgScope() : null;
    if (sc && data && typeof data === "object" && /^(competitions|clubreg|partners)\/[^/]+$/.test(path) && !data.owner) data = { ...data, owner: sc };
    return _write0(path, data);
  };
  // 3) Confirmations sensibles : l'organisateur saisit SON code d'accès
  const _pwModal0 = pwModal;
  pwModal = function (title, msg, onOk, btn = "Valider") {
    if (!orgMe()) return _pwModal0(title, msg, onOk, btn);
    openModal(`<header><h2>${title}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form><p class="small">${String(msg).replace(/le mot de passe administrateur/g, "votre code d'accès")}</p><div class="f"><label for="pwm">Code d'accès organisateur</label><input id="pwm" name="pw" type="password" required style="width:100%"></div><div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="${btn}">${btn}</button></div></form>`,
      async fd => { if (!(await ORGF.orgCheck(fd.get("pw")))) { toast("Code d'accès incorrect."); return false } await onOk(); return true });
  };
  // 4) Onglet Admin : espace organisateur, ou panneau des organisateurs pour l'administration
  const _viewAdmin0 = viewAdmin;
  viewAdmin = function () {
    if (orgMe()) return orgSpaceHTML();
    const h = _viewAdmin0(); const i = h.indexOf("</div></div></div>") + 18;
    return h.slice(0, i) + orgAdminPanelHTML() + h.slice(i);
  };
  // 5) Écran de connexion : entrée « Espace organisateur »
  const _viewLock0 = viewLock;
  viewLock = function () {
    const h = _viewLock0(); const i = h.lastIndexOf("</div>");
    return h.slice(0, i) + `<div class="panel authcard" style="margin-top:16px"><h3 style="margin:0 0 6px">Espace organisateur</h3><p class="small muted" style="margin:0 0 12px">Gérez votre propre compétition avec vos clubs et votre code d'accès.</p><div class="row"><button class="btn ghost" type="button" data-org="login">Se connecter</button><button class="btn" type="button" data-org="request">Demander un accès</button></div></div>` + h.slice(i);
  };
  // 5 bis) Le lien d'inscription (formulaire Google de NARX) n'est pas proposé aux organisateurs : ils ajoutent leurs clubs eux-mêmes
  const _linkPanel0 = linkPanel;
  linkPanel = function () { return orgMe() ? "" : _linkPanel0() };
  // 6) Après chaque affichage : libellés, bandeaux, demandes en attente
  const _render0 = render;
  render = function () { _render0(); try { orgAfterRender() } catch (e) { console.error(e) } };
}

function orgAfterRender() {
  const m = $("#main"), mode = $("#mode"), o = orgMe();
  document.body.classList.toggle("org-mode", !!o);
  if (!S.loaded || !m) return;
  if (o && mode) { mode.textContent = "Organisateur · " + orgName(o); mode.title = "Mon espace organisateur"; mode.style.cursor = "pointer"; mode.onclick = () => { ui.tab = "admin"; ui.inComp = false; render() } }
  else if (mode) mode.onclick = null;
  if (orgSuper() && !orgUnsub) orgUnsub = ORGF.orgsListen(l => { ORGS = l.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")); render() });
  const ins = html => m.insertAdjacentHTML("afterbegin", html);
  // intervention de l'administration dans l'espace d'un organisateur
  if (orgSuper() && ui.scope && S.role === "admin" && ui.unlocked) {
    const x = ORGS.find(z => z.uid === ui.scope);
    ins(`<div class="panel" style="margin-bottom:16px;border-color:var(--royal);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>Intervention pour ${esc(orgName(x))}</b><div class="small muted">Vous voyez et modifiez les compétitions, clubs et partenaires de cet organisateur.</div></div><button class="btn ghost sm" data-org="scope" data-v="">Revenir aux données NARX</button></div>`);
  }
  // demandes en attente sur le tableau de bord de l'administration
  const pend = ORGS.filter(z => z.status === "en_attente");
  const soon = ORGS.filter(z => z.status === "valide" && orgDays(z) <= 30);
  if (orgSuper() && S.role === "admin" && ui.unlocked && !ui.scope && ui.tab === "comps" && !ui.inComp && pend.length)
    ins(`<div class="panel" style="margin-bottom:16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>${pend.length} demande${pend.length > 1 ? "s" : ""} d'accès organisateur en attente</b><div class="small muted">${pend.map(z => esc(orgName(z))).join(", ")}</div></div><button class="btn sm" data-act="tab" data-v="admin">Voir les demandes</button></div>`);
  if (orgSuper() && S.role === "admin" && ui.unlocked && !ui.scope && ui.tab === "comps" && !ui.inComp && soon.length)
    ins(`<div class="panel" style="margin-bottom:16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>${soon.length} accès organisateur ${soon.length > 1 ? "arrivent" : "arrive"} à échéance</b><div class="small muted">${soon.map(z => esc(orgName(z)) + (orgExp(z) <= Date.now() ? " (expiré)" : ` (${orgDays(z)} j)`)).join(", ")}</div></div><button class="btn ghost sm" data-act="tab" data-v="admin">Renouveler</button></div>`);
  // demande en cours (compte organisateur non validé)
  const p = orgPending();
  if (p && S.role === "dirigeant") {
    const exp = orgExpired(p), f0 = ORG_FORMULES[p.formule] || {};
    const [lbl] = exp ? ["Expiré"] : (ORG_STATUTS[p.status] || ["En attente"]);
    ins(`<div class="panel" style="margin-bottom:16px"><h3 style="margin:0 0 6px">Votre accès organisateur : ${esc(lbl.toLowerCase())}</h3><p class="small" style="margin:0 0 12px">${exp ? `Votre accès (${esc(f0.nom || "")}) a pris fin le ${esc(orgDate(orgExp(p)))}. Vos compétitions et vos clubs sont conservés : renouvelez votre accès pour 1 an (${esc(ORG_FORMULES.autonome.prix)} en autonomie, ${esc(ORG_FORMULES.accompagne.prix)} avec l'intervention de l'équipe NARX).${p.renouvellement ? ` <b>Demande de renouvellement envoyée le ${esc(new Date(p.renouvellement.date).toLocaleDateString("fr-FR"))}.</b>` : ""}` : p.status === "en_attente" ? `Votre demande (${esc((ORG_FORMULES[p.formule] || {}).nom || "")} · ${esc((ORG_FORMULES[p.formule] || {}).prix || "")}) a bien été reçue. L'équipe NARX Foot Manager vous contacte pour la suite ; vous aurez accès à votre espace dès sa validation.` : p.status === "aucune" ? "Ce compte n'a pas encore de demande d'accès organisateur." : "Votre accès organisateur n'est pas actif. Contactez l'équipe NARX Foot Manager."}</p><div class="row">${exp ? `<button class="btn sm" data-org="renewreq" data-v="autonome">Renouveler · ${esc(ORG_FORMULES.autonome.prix)}</button><button class="btn ghost sm" data-org="renewreq" data-v="accompagne">Renouveler · ${esc(ORG_FORMULES.accompagne.prix)}</button>` : p.status === "aucune" ? `<button class="btn sm" data-org="request">Faire la demande</button>` : `<button class="btn ghost sm" data-org="refresh">Vérifier à nouveau</button>`}${orgWa() ? `<a class="btn ghost sm" target="_blank" rel="noopener noreferrer" href="${esc(orgWaLink(orgWa(), `Bonjour NARX Foot Manager, je suis ${p.nom || ""} (${p.structure || ""}). Où en est ma demande d'accès organisateur ?`))}">Contacter NARX sur WhatsApp</a>` : ""}<button class="btn ghost sm" data-org="logout">Se déconnecter</button></div></div>`);
  } else if (S.role === "dirigeant" && ui.tab === "comps" && !ui.inComp && !p) {
    m.insertAdjacentHTML("beforeend", `<div class="panel" style="margin-top:18px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>Vous organisez une compétition ?</b><div class="small muted">Obtenez votre accès organisateur pour 1 an et gérez-la avec vos clubs : ${ORG_FORMULES.autonome.prix} en autonomie, ${ORG_FORMULES.accompagne.prix} avec l'intervention de l'équipe NARX.</div></div><div class="row"><button class="btn ghost sm" data-org="login">Se connecter</button><button class="btn sm" data-org="request">Demander un accès</button></div></div>`);
  }
  // liens directs depuis le site : /app/#organisateur et /app/#organisateur-connexion
  if (!orgHashDone) { orgHashDone = true; const hs = location.hash; if (hs === "#organisateur" && !o && !(p && p.status !== "aucune")) setTimeout(orgRequestForm, 700); else if (hs === "#organisateur-connexion" && !o) setTimeout(orgLoginForm, 700) }
}

function orgSpaceHTML() {
  const o = orgMe(); const f = ORG_FORMULES[o.formule] || {};
  const n = Object.keys(S.comps).length, c = Object.keys(S.clubs).length;
  return `<div class="head"><div><h1>Mon espace organisateur</h1><div class="muted">${esc(orgName(o))}</div></div></div>
  <div class="panel" style="margin-bottom:16px"><h3>Mon accès</h3><p class="small" style="margin:0 0 10px"><span class="chip ok">Validé</span> ${esc(f.nom || "")} · <b>${esc(f.prix || "")}</b> · 1 an</p><p class="small" style="margin:0 0 10px">Accès valable jusqu'au <b>${esc(orgDate(orgExp(o)))}</b> (${orgDays(o)} jour${orgDays(o) > 1 ? "s" : ""} restant${orgDays(o) > 1 ? "s" : ""}).${orgDays(o) <= 30 ? ` <button class="btn sm" data-org="renewreq" data-v="${esc(o.formule || "autonome")}" style="margin-left:6px">Demander le renouvellement</button>` : ""}${o.renouvellement ? ` <span class="small muted">Renouvellement demandé le ${esc(new Date(o.renouvellement.date).toLocaleDateString("fr-FR"))}.</span>` : ""}</p><p class="small muted" style="margin:0 0 6px">${esc(f.txt || "")}</p>
  <p class="small" style="margin:10px 0 0">Responsable : <b>${esc(o.nom || "")}</b> · ${esc(o.tel || "")} · ${esc(o.email || "")}</p><p class="small muted" style="margin:6px 0 0">${n} compétition${n > 1 ? "s" : ""} · ${c} club${c > 1 ? "s" : ""} dans votre espace.</p></div>
  <div class="panel" style="margin-bottom:16px"><h3>Comment ça marche</h3><p class="small" style="margin:0">Créez vos clubs dans l'onglet <b>Clubs</b>, puis vos compétitions dans <b>Compétitions</b> : tirage, matchs, classements, licences, visuels et messages WhatsApp fonctionnent comme pour l'organisation NARX. Vos données ne sont visibles et modifiables que par vous${o.formule === "accompagne" ? " et par l'équipe NARX Foot Manager qui vous accompagne" : " et par l'administration NARX"}.</p></div>
  <div class="row">${orgWa() ? `<a class="btn ghost" target="_blank" rel="noopener noreferrer" href="${esc(orgWaLink(orgWa(), `Bonjour NARX Foot Manager, je suis ${o.nom || ""} (${o.structure || ""}), organisateur.`))}">Contacter NARX sur WhatsApp</a>` : ""}<button class="btn ghost" data-org="logout">Se déconnecter</button></div>`;
}

function orgAdminPanelHTML() {
  if (!orgSuper()) return "";
  const rows = ORGS.map(z => {
    const ex = orgExpired(z); const [lbl, cls] = ex ? ["Expiré", "bad"] : (ORG_STATUTS[z.status] || [z.status || "?", ""]); const f = ORG_FORMULES[z.formule] || {}; const num = orgPhone(z.tel);
    const until = z.status === "valide" ? (orgExp(z) ? (ex ? ` · expiré le ${esc(orgDate(orgExp(z)))}` : ` · valable jusqu'au <b>${esc(orgDate(orgExp(z)))}</b> (${orgDays(z)} j)`) : " · sans date de fin : cliquez « Renouveler 1 an »") : "";
    const msg = z.status === "valide" ? `Bonjour ${z.nom || ""}, votre accès organisateur NARX Foot Manager (${f.nom || ""}) est validé jusqu'au ${orgExp(z) ? orgDate(orgExp(z)) : ""} (1 an). Connectez-vous sur ${location.origin}/app/#organisateur-connexion avec votre e-mail ${z.email || ""} et votre code d'accès.` : `Bonjour ${z.nom || ""}, nous avons bien reçu votre demande d'accès organisateur NARX Foot Manager (${f.nom || ""} · ${f.prix || ""}).`;
    const act = z.status === "en_attente" ? `<button class="btn sm" data-org="set" data-v="valide" data-u="${esc(z.uid)}">Valider</button><button class="btn ghost sm" data-org="set" data-v="refuse" data-u="${esc(z.uid)}">Refuser</button>`
      : z.status === "valide" ? `${ex ? "" : `<button class="btn sm" data-org="scope" data-v="${esc(z.uid)}">Gérer ses compétitions</button>`}<button class="btn ${ex ? "" : "ghost "}sm" data-org="renew" data-u="${esc(z.uid)}">Renouveler 1 an</button>${ex ? "" : `<button class="btn ghost sm" data-org="set" data-v="suspendu" data-u="${esc(z.uid)}">Suspendre</button>`}`
      : `<button class="btn ghost sm" data-org="set" data-v="valide" data-u="${esc(z.uid)}">Valider</button>`;
    return `<div style="border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:grid;gap:8px"><div class="row" style="justify-content:space-between;gap:10px"><div style="min-width:0"><b>${esc(orgName(z))}</b> <span class="chip ${cls}">${esc(lbl)}</span><div class="small muted">${esc(z.nom || "")} · ${esc(z.tel || "")} · ${esc(z.email || "")}</div><div class="small">${esc(f.nom || "")} · <b>${esc(f.prix || "")}</b> ${until} · ${orgCount(z.uid)} compétition(s)${z.createdAt ? ` · demande du ${esc(new Date(z.createdAt).toLocaleDateString("fr-FR"))}` : ""}</div>${z.message ? `<div class="small muted" style="margin-top:4px">« ${esc(z.message)} »</div>` : ""}${z.renouvellement ? `<div class="small" style="margin-top:4px;color:var(--royal)">Renouvellement demandé le ${esc(new Date(z.renouvellement.date).toLocaleDateString("fr-FR"))} · ${esc((ORG_FORMULES[z.renouvellement.formule] || {}).nom || "")} · ${esc((ORG_FORMULES[z.renouvellement.formule] || {}).prix || "")}</div>` : ""}</div></div>
      <div class="row" style="gap:8px">${act}${num ? `<a class="btn ghost sm" target="_blank" rel="noopener noreferrer" href="${esc(orgWaLink(num, msg))}">WhatsApp</a>` : ""}</div></div>`;
  }).join("");
  return `<div class="panel" style="margin-bottom:16px"><h3>Organisateurs (accès secondaire)</h3><p class="small">Les organisateurs font leur demande depuis le site ou l'application, puis vous les validez ici. Un organisateur validé gère uniquement ses propres compétitions, clubs et partenaires, avec son e-mail et son code d'accès. Formules : <b>${ORG_FORMULES.autonome.prix}</b> (autonome) et <b>${ORG_FORMULES.accompagne.prix}</b> (avec intervention de l'équipe NARX : bouton « Gérer ses compétitions »), chacune pour <b>1 an (365 jours)</b> à partir de la validation. À l'échéance, l'organisateur ne peut plus modifier ses compétitions (elles restent conservées) jusqu'au renouvellement.</p>
  <div style="display:grid;gap:10px;margin:12px 0">${rows || `<p class="small muted" style="margin:0">Aucune demande pour le moment.</p>`}</div>
  <form id="orgwaform" class="row" style="gap:8px;align-items:flex-end"><div class="f" style="margin:0;flex:1;min-width:200px"><label for="orgwa">Numéro WhatsApp NARX (reçoit les demandes)</label><input id="orgwa" type="tel" maxlength="20" value="${esc((DATA["settings/public"] || {}).wa || "")}" placeholder="+228 90 00 00 00" style="width:100%"></div><button class="btn ghost" type="submit">Enregistrer</button></form></div>`;
}

function orgLoginForm() {
  openModal(`<header><h2>Espace organisateur</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <div class="f"><label for="ole">E-mail</label><input id="ole" name="email" type="email" autocomplete="username" required style="width:100%"></div>
  <div class="f"><label for="olc">Code d'accès</label><input id="olc" name="code" type="password" autocomplete="current-password" required style="width:100%"></div>
  <div class="row" style="justify-content:space-between;align-items:center"><button type="button" class="back" data-org="reset" style="margin:0;padding:0;text-decoration:underline">Code oublié ?</button><button class="btn" type="submit" data-l="Se connecter">Se connecter</button></div>
  <p class="small muted" style="margin-top:14px">Pas encore d'accès ? <button type="button" class="back" data-org="request" style="margin:0;display:inline;padding:0;text-decoration:underline">Faire une demande</button></p></form>`,
    async fd => {
      const r = await ORGF.orgSignIn(fd.get("email"), fd.get("code"));
      if (!r.ok) { toast(/too-many/.test(r.code || "") ? "Trop d'essais : réessayez dans quelques minutes." : "E-mail ou code d'accès incorrect."); return false }
      try { sessionStorage.removeItem("narx_unlock") } catch (e) { } location.hash = ""; location.reload(); return true;
    });
}

function orgRequestForm() {
  const opt = k => `<label style="display:flex;gap:12px;align-items:flex-start;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;cursor:pointer"><input type="radio" name="formule" value="${k}" ${k === "autonome" ? "checked" : ""} style="margin-top:4px"><span><b>${ORG_FORMULES[k].nom} · ${ORG_FORMULES[k].prix} · 1 an</b><span class="small muted" style="display:block">${ORG_FORMULES[k].txt}</span></span></label>`;
  openModal(`<header><h2>Demander un accès organisateur</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <p class="small muted" style="margin-top:0">Gérez votre propre compétition avec vos propres clubs. Votre accès est activé après validation par l'équipe NARX Foot Manager, qui vous communique les modalités de paiement. Il est valable <b>1 an (365 jours)</b> à partir de la validation.</p>
  <div style="display:grid;gap:8px;margin-bottom:12px">${opt("autonome")}${opt("accompagne")}</div>
  <div class="orgg"><div class="f"><label for="orn">Nom et prénom</label><input id="orn" type="text" name="nom" required maxlength="80" style="width:100%"></div><div class="f"><label for="ors">Structure ou compétition</label><input id="ors" type="text" name="structure" required maxlength="80" placeholder="Ex. : Ligue de quartier de Zanguéra" style="width:100%"></div></div>
  <div class="orgg"><div class="f"><label for="ort">Téléphone WhatsApp</label><input id="ort" name="tel" type="tel" required maxlength="20" style="width:100%"></div><div class="f"><label for="ore">E-mail (identifiant)</label><input id="ore" name="email" type="email" required autocomplete="username" style="width:100%"></div></div>
  <div class="orgg"><div class="f"><label for="orc">Code d'accès (8 caractères min.)</label><input id="orc" name="code" type="password" required minlength="8" autocomplete="new-password" style="width:100%"></div><div class="f"><label for="orc2">Confirmer le code</label><input id="orc2" name="code2" type="password" required minlength="8" autocomplete="new-password" style="width:100%"></div></div>
  <div class="f"><label for="orm">Message (facultatif)</label><input id="orm" type="text" name="message" maxlength="200" placeholder="Catégorie, nombre d'équipes, dates…" style="width:100%"></div>
  <p class="small muted">Gardez votre code d'accès pour vous : l'équipe NARX ne vous le demandera jamais.</p>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Envoyer la demande">Envoyer la demande</button></div></form>`,
    async fd => {
      const code = fd.get("code"); if (code !== fd.get("code2")) { toast("Les deux codes ne sont pas identiques."); return false }
      const info = { formule: fd.get("formule") === "accompagne" ? "accompagne" : "autonome", nom: fd.get("nom").trim(), structure: fd.get("structure").trim(), tel: fd.get("tel").trim(), email: fd.get("email").trim(), message: (fd.get("message") || "").trim() };
      const r = await ORGF.orgRequest(info, code);
      if (!r.ok) {
        const c = r.code || "";
        toast(/already-in-use|credential-already/.test(c) ? "Cette adresse e-mail a déjà un compte : utilisez « Se connecter »." : /weak-password/.test(c) ? "Code trop simple : 8 caractères minimum." : /invalid-email/.test(c) ? "Adresse e-mail invalide." : /provider-already-linked/.test(c) ? "Cet appareil est déjà relié à un compte organisateur." : "Demande impossible pour le moment. Réessayez.");
        return false;
      }
      setTimeout(() => orgRequestDone(info), 30); return true;
    });
}

function orgRequestDone(info) {
  const f = ORG_FORMULES[info.formule]; const wa = orgWa();
  const txt = `Bonjour NARX Foot Manager, je viens de demander un accès organisateur.\n${f.nom} · ${f.prix} (1 an)\nNom : ${info.nom}\nStructure : ${info.structure}\nTéléphone : ${info.tel}\nE-mail : ${info.email}${info.message ? "\nMessage : " + info.message : ""}`;
  openModal(`<header><h2>Demande envoyée</h2><button class="x" data-close aria-label="Fermer">×</button></header>
  <p>Merci ${esc(info.nom)}. Votre demande (<b>${esc(f.nom)} · ${esc(f.prix)} · 1 an</b>) est enregistrée. L'équipe NARX Foot Manager vous contacte pour la validation et le paiement.</p>
  <p class="small muted">Dès la validation, connectez-vous avec <b>${esc(info.email)}</b> et votre code d'accès (Espace organisateur).</p>
  <div class="row" style="justify-content:flex-end">${wa ? `<a class="btn" target="_blank" rel="noopener noreferrer" href="${esc(orgWaLink(wa, txt))}">Prévenir NARX sur WhatsApp</a>` : ""}<button class="btn ghost" data-org="reload">Terminer</button></div>`);
}

document.addEventListener("click", async e => {
  const t = e.target.closest("[data-org]"); if (!t || !ORGF) return; const a = t.dataset.org;
  if (a === "login") { e.preventDefault(); orgLoginForm() }
  else if (a === "request") { e.preventDefault(); orgRequestForm() }
  else if (a === "reload" || a === "refresh") { location.hash = ""; location.reload() }
  else if (a === "logout") { try { sessionStorage.removeItem("narx_unlock") } catch (x) { } ORGF.signOutAdmin().then(() => { location.hash = ""; location.reload() }) }
  else if (a === "reset") { const i = document.querySelector("#ole"); const em = i && i.value.trim(); if (!em) { toast("Saisissez d'abord votre e-mail."); return } toast((await ORGF.orgResetCode(em)) ? "Un e-mail pour choisir un nouveau code vous a été envoyé." : "Envoi impossible : vérifiez l'adresse.") }
  else if (a === "scope" && orgSuper()) { ui.scope = t.dataset.v || null; ui.inComp = false; ui.club = null; ui.team = null; ui.tab = "comps"; rebuild(); render(); scrollTo(0, 0) }
  else if (a === "renewreq") {
    const fo = t.dataset.v === "accompagne" ? "accompagne" : "autonome", F = ORG_FORMULES[fo], me = ORGF.org() || {};
    if (!(await ORGF.orgRenewRequest(fo))) { toast("Demande impossible pour le moment."); return }
    toast("Demande de renouvellement envoyée."); render();
    const wa = orgWa(); if (wa) setTimeout(() => openModal(`<header><h2>Renouvellement demandé</h2><button class="x" data-close aria-label="Fermer">×</button></header><p>Votre demande (<b>${esc(F.nom)} · ${esc(F.prix)} · 1 an</b>) est enregistrée. Prévenez l'équipe NARX pour le paiement.</p><div class="row" style="justify-content:flex-end"><a class="btn" target="_blank" rel="noopener noreferrer" href="${esc(orgWaLink(wa, `Bonjour NARX Foot Manager, je souhaite renouveler mon accès organisateur pour 1 an (${F.nom} · ${F.prix}). ${me.nom || ""} · ${me.structure || ""} · ${me.email || ""}`))}">Prévenir NARX sur WhatsApp</a><button class="btn ghost" data-close>Fermer</button></div>`), 30);
  }
  else if (a === "renew" && orgSuper()) {
    const z = ORGS.find(x => x.uid === t.dataset.u); if (!z) return;
    const from = Math.max(Date.now(), orgExp(z)), ms = from + ORG_DUREE_MS;
    if (!(await askConfirm(`Renouveler l'accès de ${orgName(z)} pour 1 an, jusqu'au ${orgDate(ms)} ?`, "Renouveler"))) return;
    const patch = { status: "valide", expiresMs: ms, expiresAt: new Date(ms).toISOString(), renouvelleLe: new Date().toISOString(), renouvellement: null };
    if (z.renouvellement && z.renouvellement.formule) patch.formule = z.renouvellement.formule;
    try { await ORGF.orgSet(z.uid, patch); toast(`Accès renouvelé jusqu'au ${orgDate(ms)}.`) } catch (x) { console.error(x); toast("Modification impossible.") }
  }
  else if (a === "set" && orgSuper()) {
    const uid = t.dataset.u, st = t.dataset.v;
    if (st !== "valide" && !(await askConfirm(st === "suspendu" ? "Suspendre cet organisateur ? Il ne pourra plus modifier ses compétitions." : "Refuser cette demande ?", "Confirmer"))) return;
    const z = ORGS.find(x => x.uid === uid) || {}; const patch = { status: st };
    if (st === "valide" && orgExp(z) <= Date.now()) { const ms = Date.now() + ORG_DUREE_MS; Object.assign(patch, { expiresMs: ms, expiresAt: new Date(ms).toISOString(), valideLe: new Date().toISOString() }) }
    try { await ORGF.orgSet(uid, patch); toast(st === "valide" ? `Organisateur validé jusqu'au ${orgDate(patch.expiresMs || orgExp(z))}. Prévenez-le avec le bouton WhatsApp.` : "Statut mis à jour.") } catch (x) { console.error(x); toast("Modification impossible.") }
  }
});
document.addEventListener("submit", async e => {
  if (e.target.id !== "orgwaform") return; e.preventDefault();
  const v = document.querySelector("#orgwa").value.trim();
  await write("settings/public", { ...(DATA["settings/public"] || {}), wa: v }); toast("Numéro enregistré.");
});
addEventListener("hashchange", () => { if (/^#organisateur/.test(location.hash)) { orgHashDone = false; render() } });
