/* ================= MESSAGE AUX CLUBS (WhatsApp) ================= */
const MSG_MODELES=[
  ["libre","Message libre",""],
  ["convocation","Convocation","Bonjour {responsable},\n\nLe club {club} est convoqué pour la compétition « {competition} ».\nMerci de vous présenter avec vos joueurs, vos licences et vos maillots 30 minutes avant le coup d'envoi.\n\nSportivement,\nL'organisation"],
  ["programme","Programme","Bonjour {responsable},\n\nVoici le programme de « {competition} » :\n\n(date, heure et lieu)\n\nBonne préparation au club {club} !\nL'organisation"],
  ["pieces","Pièces manquantes","Bonjour {responsable},\n\nIl manque des pièces dans le dossier du club {club} pour « {competition} ». Merci de les compléter au plus vite :\n{lien}\n\nL'organisation"],
  ["resultat","Résultats","Bonjour {responsable},\n\nLes résultats et le classement de « {competition} » sont disponibles. Félicitations à tous les clubs !\n\nL'organisation"]
];
const MSGSENT={};
const msgIndicatif=()=>{try{return localStorage.getItem("narx_indicatif")||"228"}catch(e){return"228"}};
function waNumber(raw){let d=String(raw||"").replace(/[^\d+]/g,"");if(!d)return"";
  if(d.startsWith("+"))d=d.slice(1);else if(d.startsWith("00"))d=d.slice(2);else{d=d.replace(/^0+/,"");if(d.length<=9)d=msgIndicatif()+d}
  d=d.replace(/\D/g,"");return d.length>=8?d:""}
function msgRecipients(){
  const keys=isLeague()?lgParts().filter(p=>p.status!=="retire").map(p=>p.club):[...new Set([...approved(),...entries()])];
  const valid=new Set(isLeague()?lgActive():approved());
  const seen=new Set();const out=[];
  keys.forEach(k=>{const c=clubData(k);if(!c)return;
    const st=(c.staff||[]).find(s=>s&&s.tel&&waNumber(s.tel));
    const num=waNumber(c.tel)||(st?waNumber(st.tel):"");
    const who=c.tel&&waNumber(c.tel)?(c.responsable||""):(st?[st.prenom,st.nom].filter(Boolean).join(" "):"");
    const id=num||("x"+k);if(seen.has(id))return;seen.add(id);
    out.push({key:k,nom:c.nom,sigle:c.sigle,cat:c.catName,responsable:who,num,valide:valid.has(k),c})});
  return out.sort((a,b)=>(a.nom||"").localeCompare(b.nom||"","fr"))}
function msgFill(tpl,r){const comp=edoc()||{};
  return tpl.replace(/\{club\}/g,r.nom||"").replace(/\{responsable\}/g,r.responsable||"responsable").replace(/\{competition\}/g,comp.nom||"").replace(/\{lien\}/g,()=>{try{return compLink(ED())||""}catch(e){return""}})}
function msgModal(){
  if(!ED())return;const id=ED();MSGSENT[id]=MSGSENT[id]||new Set();
  const st={who:"tous",txt:""};
  openModal(`<header><h2>Message aux clubs</h2><button class="x" data-close aria-label="Fermer">×</button></header>
  <p class="small muted" style="margin-top:0">Rédigez le message une seule fois : il est personnalisé pour chaque club et s'ouvre dans WhatsApp, prêt à partir vers le numéro du club. Appuyez ensuite sur Envoyer dans WhatsApp.</p>
  <div class="f"><label for="msgtpl">Modèle</label><select id="msgtpl">${MSG_MODELES.map(([k,l])=>`<option value="${k}">${esc(l)}</option>`).join("")}</select></div>
  <div class="f"><label for="msgtxt">Message</label><textarea id="msgtxt" rows="7" maxlength="3000" placeholder="Votre message…" style="display:block;width:100%;box-sizing:border-box;resize:vertical;font:inherit"></textarea>
  <div class="small muted" style="margin-top:6px">Remplacés automatiquement : <b>{club}</b>, <b>{responsable}</b>, <b>{competition}</b>, <b>{lien}</b> (lien d'inscription).</div></div>
  <div class="two"><div class="f"><label for="msgwho">Destinataires</label><select id="msgwho"><option value="tous">Tous les clubs inscrits</option><option value="valides">Clubs validés uniquement</option></select></div>
  <div class="f"><label for="msgind">Indicatif par défaut</label><input id="msgind" type="text" inputmode="numeric" maxlength="4" value="${esc(msgIndicatif())}"></div></div>
  <div class="row" style="justify-content:space-between;margin:6px 0 10px"><b id="msgcount"></b><div class="row"><a class="btn" id="msgnext" target="_blank" rel="noopener noreferrer">Envoyer au club suivant</a><button type="button" class="btn ghost sm" id="msgnums">Copier les numéros</button></div></div>
  <div id="msglist" style="display:grid;gap:8px"></div>`,null,(root)=>{
    const $q=s=>root.querySelector(s);
    const list=()=>msgRecipients().filter(r=>st.who==="tous"||r.valide);
    const link=r=>`https://wa.me/${r.num}?text=${encodeURIComponent(msgFill(st.txt,r))}`;
    const paint=()=>{const L=list();const sent=MSGSENT[id];const ok=L.filter(r=>r.num);const done=ok.filter(r=>sent.has(r.num)).length;
      $q("#msgcount").textContent=`${done} / ${ok.length} envoyé(s)${L.length>ok.length?` · ${L.length-ok.length} sans numéro`:""}`;
      const nx=ok.find(r=>!sent.has(r.num));const b=$q("#msgnext");
      if(nx&&st.txt.trim()){b.href=link(nx);b.dataset.num=nx.num;b.textContent=`Envoyer à ${nx.sigle||nx.nom}`;b.removeAttribute("aria-disabled")}
      else{b.removeAttribute("href");b.dataset.num="";b.setAttribute("aria-disabled","true");b.textContent=!st.txt.trim()?"Écrivez d'abord le message":"Tous les messages sont partis"}
      $q("#msglist").innerHTML=L.length?L.map(r=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px">
        <div class="row" style="flex-wrap:nowrap;min-width:0">${crest(r.c,"sm")}<div style="min-width:0"><div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.nom)}${r.cat?` <span class="small muted">· ${esc(r.cat)}</span>`:""}</div>
        <div class="small muted">${r.num?`+${esc(r.num)}${r.responsable?" · "+esc(r.responsable):""}`:"Aucun numéro : ajoutez le téléphone du club"}${r.valide?"":" · en attente"}</div></div></div>
        ${r.num?(sent.has(r.num)?`<a class="btn ghost sm" data-wa="${r.num}" href="${esc(link(r))}" target="_blank" rel="noopener noreferrer">Envoyé ✓</a>`:`<a class="btn sm" data-wa="${r.num}" ${st.txt.trim()?`href="${esc(link(r))}"`:'aria-disabled="true"'} target="_blank" rel="noopener noreferrer">WhatsApp</a>`):""}</div>`).join(""):`<div class="empty"><h3>Aucun club inscrit</h3><p>Ajoutez des participants à la compétition.</p></div>`};
    const mark=num=>{if(num){MSGSENT[id].add(num);setTimeout(paint,50)}};
    root.addEventListener("click",e=>{const a=e.target.closest("[data-wa],#msgnext");if(!a)return;if(!a.getAttribute("href")){e.preventDefault();if(!st.txt.trim())toast("Écrivez d'abord le message.");return}mark(a.dataset.wa||a.dataset.num)});
    $q("#msgtpl").addEventListener("change",e=>{const m=MSG_MODELES.find(x=>x[0]===e.target.value);if(m&&m[2]){$q("#msgtxt").value=m[2];st.txt=m[2];MSGSENT[id]=new Set();paint()}});
    $q("#msgtxt").addEventListener("input",e=>{st.txt=e.target.value;paint()});
    $q("#msgtxt").addEventListener("change",()=>{MSGSENT[id]=new Set();paint()});
    $q("#msgwho").addEventListener("change",e=>{st.who=e.target.value;paint()});
    $q("#msgind").addEventListener("change",e=>{const v=e.target.value.replace(/\D/g,"")||"228";e.target.value=v;try{localStorage.setItem("narx_indicatif",v)}catch(x){}paint()});
    $q("#msgnums").addEventListener("click",()=>{const n=list().filter(r=>r.num).map(r=>"+"+r.num);if(!n.length)return toast("Aucun numéro.");copyText(n.join("\n"))});
    paint();setTimeout(()=>$q("#msgtxt").focus(),30)})}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;if(t.dataset.act==="comp-msg"&&ED()&&isAdmin())msgModal()});
