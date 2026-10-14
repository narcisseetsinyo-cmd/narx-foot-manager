"use strict";
/* ================= constants ================= */
const FORMATS={8:{g:2,size:4},12:{g:4,size:3},16:{g:4,size:4},24:{g:8,size:3},32:{g:8,size:4}};
const STAGES=["G","R16","QF","SF","3P","F"];
const STAGE_NAME={G:"Phase de poules",R16:"Huitièmes de finale",QF:"Quarts de finale",SF:"Demi-finales","3P":"Match pour la 3e place",F:"Finale"};
const STAGE_SHORT={G:"Poules",R16:"8es",QF:"Quarts",SF:"Demies","3P":"3e/F",F:"3e/F"};
const STAFF_ROLES=["Entraîneur principal","Entraîneur adjoint","Entraîneur des gardiens","Kinésithérapeute","Kinésithérapeute"];
const POSTES=["Gardien","Défenseur","Milieu","Attaquant"];
const EVT={but:"But",csc:"But contre son camp",cj:"Carton jaune",ex2j:"Exclusion (2e jaune)",rd:"Carton rouge direct"};
const ICONS={
 licences:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16.5c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14 9.5h4M14 12.5h4"/></svg>',
 comps:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5v1a3 3 0 003 3M16 6h3v1a3 3 0 01-3 3M12 13v4M8 21h8M9 17h6"/></svg>',
 league:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5v1a3 3 0 003 3M16 6h3v1a3 3 0 01-3 3M12 13v4M8 21h8M9 17h6"/></svg>',
 partners:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 6l-2-2-6 6 2 2M12 6l2-2 6 6-2 2M8 12l3 3a1.5 1.5 0 002-2M11 15l1 1a1.5 1.5 0 002-2l-3-3M14 14l1 1a1.5 1.5 0 002-2l-3-3-2 2"/></svg>',
 clubs:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"/></svg>',
 draw:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 4l2.5 4.5L12 12l-3.5-2L9 5M12 12l4 1 1.5 4M12 12l-3 3.5-4-.5"/></svg>',
 matches:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14M3 10h3v4H3M21 10h-3v4h3"/></svg>',
 stats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 20V11M12 20V4M19 20v-6"/></svg>',
 admin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>'};

/* ================= helpers ================= */
function askConfirm(msg,ok="Confirmer"){return new Promise(res=>{
  let root=document.getElementById("confirmroot");if(!root){root=document.createElement("div");root.id="confirmroot";document.body.appendChild(root)}
  const prev=document.activeElement;
  root.innerHTML=`<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="cfmsg" style="z-index:70"><div class="sheet" style="max-width:460px"><p id="cfmsg" style="font-size:16px;margin:4px 0 18px">${esc(msg)}</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-cf="0">Annuler</button><button class="btn" data-cf="1">${esc(ok)}</button></div></div></div>`;
  const done=v=>{root.innerHTML="";document.removeEventListener("keydown",key,true);if(prev&&prev.focus)prev.focus();res(v)};
  const key=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();done(false)}};
  document.addEventListener("keydown",key,true);
  root.querySelector(".modal").addEventListener("click",e=>{const b=e.target.closest("[data-cf]");if(b)done(b.dataset.cf==="1");else if(e.target.classList.contains("modal"))done(false)});
  root.querySelector('[data-cf="1"]').focus();
})}

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const initials=s=>(s||"?").split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";
const fmtDate=d=>{if(!d)return"";const [y,m,j]=d.split("-");return `${j}/${m}/${y}`};
const fmtDay=d=>{if(!d)return"";try{return new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}catch(e){return fmtDate(d)}};
const addDays=(d,n)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
function toast(msg){document.querySelectorAll(".toast").forEach(x=>x.remove());const t=document.createElement("div");t.className="toast";t.textContent=msg;t.setAttribute("role","status");document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
const clone=o=>JSON.parse(JSON.stringify(o??null));

/* ================= state ================= */
const CATS=["U11","U13","U15","U17","U19","U20","U21","U23","U25","Seniors","Vétérans","Féminines","Autre"];
const TEAM_MAX=40;
const S={partners:{},current:null,comps:{},clubs:{},matches:{},league:null,lmatches:{},role:"admin",me:"local",loaded:false,names:{}};
const ui={tab:"comps",club:null,team:null,clubTab:"infos",teamTab:"joueurs",ctab:"participants",statsTab:"classement",preview:null,sel:null,animating:false,inComp:false,allCats:false};
let db=null,userCap=null,unsubMatches=null,subscribedEd=null;
const photoCache={};const photoReq={};
const isAdmin=()=>S.role==="admin";
const ED=()=>S.current&&S.current.edition;
const edoc=()=>S.comps[ED()]||null;
const isLeague=()=>!!(edoc()&&edoc().type==="championnat");
const maxPlayers=()=>(edoc()&&+edoc().maxPlayers)||TEAM_MAX;
const nbClubs=()=>(edoc()&&+edoc().nbClubs)||16;
const fmt=()=>FORMATS[nbClubs()]||FORMATS[16];
const approved=()=>(edoc()&&edoc().approved)||[];
const entries=()=>(edoc()&&edoc().entries)||[];
const regLocked=()=>false;
const draw=()=>(edoc()&&edoc().draw)||null;
const drawLocked=()=>!!(edoc()&&edoc().locked);
const settings=()=>({reset:(edoc()&&edoc().reset)||"QF",seuil:2});
function birthBounds(){const e=edoc()||{};return{min:e.birthMin||"",max:e.birthMax||""}}
function eligibility(d){const b=birthBounds();if(!d)return["Date manquante",""];if(!b.min&&!b.max)return["",""];if(b.min&&d<b.min)return["Non éligible (trop âgé)","bad"];if(b.max&&d>b.max)return["Non éligible (trop jeune)","bad"];return["Éligible","ok"]}
function ageOf(d){if(!d)return"";const b=new Date(d+"T12:00:00"),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;return a+" ans"}
const tkey=(cid,tid)=>cid+"~"+tid;
const splitKey=k=>{k=String(k||"");const i=k.indexOf("~");return i<0?[k,null]:[k.slice(0,i),k.slice(i+1)]};
const catLabel=t=>t?(t.cat||"")+(t.label?" · "+t.label:""):"";
function clubData(key){const [cid,tid]=splitKey(key);const c=S.clubs[cid];if(!c)return null;if(!tid)return null;const t=(c.teams||{})[tid];if(!t)return null;
  return{nom:c.nom,sigle:c.sigle,couleur:c.couleur,logo:c.logo,quartier:c.quartier,responsable:c.responsable,tel:c.tel,cat:t.cat,label:t.label,catName:catLabel(t),staff:t.staff||[],players:t.players||[],club:cid,team:tid}}
function allTeams(){const o=[];Object.entries(S.clubs).forEach(([cid,c])=>Object.keys(c.teams||{}).forEach(tid=>{const k=tkey(cid,tid);o.push({id:k,key:k,...clubData(k)})}));
  return o.sort((a,b)=>(a.nom||"").localeCompare(b.nom||"","fr")||CATS.indexOf(a.cat)-CATS.indexOf(b.cat))}
function compTeamsAvailable(used){const c=edoc()||{};return allTeams().filter(t=>!used.includes(t.key)&&(ui.allCats||!c.cat||t.cat===c.cat))}
const clubsOfEdition=()=>[...new Set([...approved(),...entries()])].filter(k=>clubData(k)).map(k=>({id:k,...clubData(k)}));
const approvedClubs=()=>approved().filter(id=>clubData(id)).map(id=>({id,...clubData(id)})).sort((a,b)=>(a.nom||"").localeCompare(b.nom||"","fr"));
const playersOf=key=>((clubData(key)||{}).players||[]).slice().sort((a,b)=>(+a.maillot||99)-(+b.maillot||99));
const allPlayers=()=>{const o={};approved().forEach(k=>((clubData(k)||{}).players||[]).forEach(p=>o[p.id]={...p,club:k}));return o};
const canEditClub=cid=>isAdmin()||(S.role==="dirigeant"&&cid===S.me);
const clubTeams=cid=>Object.entries((S.clubs[cid]||{}).teams||{}).map(([tid,t])=>({tid,...t})).sort((a,b)=>CATS.indexOf(a.cat)-CATS.indexOf(b.cat)||(a.label||"").localeCompare(b.label||""));
function teamUsedIn(key){return Object.entries(S.comps).filter(([id,c])=>(c.approved||[]).includes(key)||(c.entries||[]).includes(key)||(c.participants||[]).some(p=>p.club===key)).map(([id,c])=>c.nom)}


/* ================= persistence ================= */
let DATA={};
function rebuild(){
  S.current=DATA["config/current"]||null;S.comps={};S.clubs={};S.matches={};S.partners={};
  for(const [k,v] of Object.entries(DATA)){const p=k.split("/");
    if(p[0]==="competitions"&&p.length===2)S.comps[p[1]]=v;
    else if(p[0]==="clubreg"&&p.length===2)S.clubs[p[1]]=v;
    else if(p[0]==="partners"&&p.length===2)S.partners[p[1]]=v;
    else if(p[0]==="clubreg"&&p[2]==="photos"&&v)photoCache[p[1]+"/"+p[3]]=v.d}
  const ed=ED();if(ed&&S.comps[ed]){const pre=`competitions/${ed}/matches/`;for(const [k,v] of Object.entries(DATA))if(k.startsWith(pre))S.matches[k.slice(pre.length)]=v}
  S.lmatches=S.matches;S.league=isLeague()?edoc():null;
  const st=DATA["local/settings"]||{};S.role=st.mode==="dirigeant"?"dirigeant":"admin";S.me=st.me||"local";
}
/* Migration des données de la version 2 (éditions) vers la version 3 (compétitions et catégories) */
function migrateV2(){
  const eds=Object.keys(DATA).filter(k=>/^editions\/[^/]+$/.test(k)).map(k=>k.split("/")[1]);
  if(!eds.length)return false;
  const clubs={};const map={};// map[ed][cid]=teamKey
  Object.keys(DATA).filter(k=>/^clubreg\/[^/]+$/.test(k)).forEach(k=>{const cid=k.split("/")[1];const old=DATA[k];if(!old||!old.eds){clubs[cid]=old;return}
    const keys=Object.keys(old.eds).sort();const last=old.eds[keys[keys.length-1]]||{};
    const nc={nom:last.nom,sigle:last.sigle,couleur:last.couleur,quartier:last.quartier,responsable:last.responsable,tel:last.tel,logo:last.logo||null,teams:{},createdAt:new Date().toISOString()};
    keys.forEach(ed=>{const d=old.eds[ed];const tid="u25-"+ed;nc.teams[tid]={cat:"U25",label:keys.length>1?ed:"",staff:d.staff||[],players:d.players||[]};(map[ed]=map[ed]||{})[cid]=tkey(cid,tid)});
    clubs[cid]=nc});
  Object.entries(clubs).forEach(([cid,c])=>{DATA[`clubreg/${cid}`]=c});
  let first=null;
  eds.forEach(ed=>{const e=DATA[`editions/${ed}`]||{};const M=map[ed]||{};const tk=c=>M[c]||c;const y=+(e.annee||ed)||2027;const start=e.start||`${y}-07-17`;const [sy,sm,sd]=start.split("-");
    const tid="t"+ed;first=first||tid;
    const comp={nom:"Compétition "+(e.annee||ed),type:"tournoi",cat:"U25",saison:String(e.annee||ed),start,nbClubs:+e.nbClubs||16,maxPlayers:+e.maxPlayers||25,reset:e.reset||"QF",
      birthMin:`${y-24}-01-01`,birthMax:`${+sy-16}-${sm}-${sd}`,approved:(e.approved||[]).map(tk),entries:Object.keys(M).filter(c=>!(e.approved||[]).includes(c)).map(tk),
      draw:e.draw?Object.fromEntries(Object.entries(e.draw).map(([code,c])=>[code,tk(c)])):null,locked:!!e.locked,createdAt:e.createdAt||new Date().toISOString()};
    DATA[`competitions/${tid}`]=comp;
    const mapEv=doc=>({...doc,events:(doc.events||[]).map(x=>({...x,club:tk(x.club)}))});
    Object.keys(DATA).filter(k=>k.startsWith(`editions/${ed}/matches/`)).forEach(k=>{DATA[`competitions/${tid}/matches/${k.split("/")[3]}`]=mapEv(DATA[k])});
    const L=DATA[`editions/${ed}/league`];
    if(L){const lid="l"+ed;DATA[`competitions/${lid}`]={nom:L.nom||("Championnat "+ed),type:"championnat",cat:"U25",saison:String(e.annee||ed),start:L.start||"",nbClubs:+L.nbClubs||10,maxPlayers:+e.maxPlayers||25,
        birthMin:comp.birthMin,birthMax:comp.birthMax,mode:L.mode||"simple",pts:L.pts||{v:3,n:1,d:0},participants:(L.participants||[]).map(p=>({...p,club:tk(p.club)})),
        fixtures:(L.fixtures||[]).map(f=>({...f,h:tk(f.h),a:tk(f.a)})),createdAt:L.createdAt||new Date().toISOString()};
      Object.keys(DATA).filter(k=>k.startsWith(`editions/${ed}/lmatches/`)).forEach(k=>{DATA[`competitions/${lid}/matches/${k.split("/")[3]}`]=mapEv(DATA[k])})}
  });
  Object.keys(DATA).filter(k=>k.startsWith("editions/")).forEach(k=>delete DATA[k]);
  DATA["config/current"]=first?{edition:first}:null;if(!first)delete DATA["config/current"];
  return true;
}

let saveTimer=null;
let saving=Promise.resolve();
function persist(){const text=JSON.stringify(DATA);saving=saving.then(()=>window.ggStore.save(text)).catch(()=>toast("Échec de l'enregistrement sur le disque."))}
async function write(path,data){DATA[path]=clone(data);rebuild();persist();render();return true}
async function remove(path){delete DATA[path];const p=path.split("/");if(p[2]==="photos")delete photoCache[p[1]+"/"+p[3]];rebuild();persist();render();return true}
async function imageToDataURL(file,max=256){
  const url=URL.createObjectURL(file);
  try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
    const r=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
    const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
    return c.toDataURL("image/jpeg",0.8)}finally{URL.revokeObjectURL(url)}
}
async function savePhoto(cid,file){
  let d;try{d=await imageToDataURL(file)}catch(e){toast("Image illisible. Choisissez un fichier JPG ou PNG.");return null}
  const pid=uid();const ok=await write(`clubreg/${cid}/photos/${pid}`,{d});if(!ok)return null;photoCache[cid+"/"+pid]=d;return cid+"/"+pid;
}
function dropPhoto(ref){if(ref)remove(`clubreg/${ref.split("/")[0]}/photos/${ref.split("/")[1]}`)}
function hydratePhotos(scope=document){
  scope.querySelectorAll("[data-ph]").forEach(el=>{const ref=el.dataset.ph;if(!ref)return;
    const show=()=>{const d=photoCache[ref];if(d&&!el.querySelector("img"))el.innerHTML=`<img src="${d}" alt="">`};
    if(photoCache[ref]){show();return}
    if(!db||photoReq[ref])return;
    photoReq[ref]=db.doc(`clubreg/${ref.split("/")[0]}/photos/${ref.split("/")[1]}`).get().then(s=>{photoCache[ref]=s.exists?s.data().d:null;
      document.querySelectorAll(`[data-ph="${CSS.escape(ref)}"]`).forEach(x=>{if(photoCache[ref]&&!x.querySelector("img"))x.innerHTML=`<img src="${photoCache[ref]}" alt="">`})}).catch(()=>{delete photoReq[ref]});
  });
}

/* ================= format & schedule ================= */
function buildSchedule(){
  const F=fmt(),L="ABCDEFGH".slice(0,F.g).split("");
  const pairs=F.size===4?[[1,2],[3,4],[1,3],[2,4],[1,4],[2,3]]:[[1,2],[1,3],[2,3]];
  const per=F.size===4?2:1;const M=[];let n=0;
  for(let md=0;md<pairs.length/per;md++)for(const p of L)for(const pr of pairs.slice(md*per,md*per+per))M.push({n:++n,stage:"G",poule:p,a:{code:p+pr[0]},b:{code:p+pr[1]}});
  let round=[];for(let i=0;i<L.length;i+=2)round.push([{q:[1,L[i]]},{q:[2,L[i+1]]}]);for(let i=0;i<L.length;i+=2)round.push([{q:[1,L[i+1]]},{q:[2,L[i]]}]);
  while(true){const teams=round.length*2;const stage=teams===16?"R16":teams===8?"QF":"SF";const ids=[];
    round.forEach(([a,b])=>{M.push({n:++n,stage,a,b});ids.push(n)});
    if(stage==="SF"){M.push({n:++n,stage:"3P",a:{l:ids[0]},b:{l:ids[1]}});M.push({n:++n,stage:"F",a:{w:ids[0]},b:{w:ids[1]}});break}
    round=[];for(let i=0;i<ids.length;i+=2)round.push([{w:ids[i]},{w:ids[i+1]}]);}
  // default dates
  const e=edoc()||{};let day=e.start||"2027-07-17";const ok=d=>[0,3,5,6].includes(new Date(d+"T12:00:00").getDay());
  const nextDay=d=>{let x=addDays(d,1);while(!ok(x))x=addDays(x,1);return x};
  let used=0,cap=1,prevStage="G";
  M.forEach(m=>{
    if(m.stage==="F"){m.date=M.find(x=>x.stage==="3P").date;m.heure="15:30";return}
    if(m.stage==="3P"){day=nextDay(nextDay(day));for(let i=0;i<4;i++)day=nextDay(day);m.date=day;m.heure="13:00";return}
    if(m.stage!==prevStage){day=nextDay(day);if(m.stage!=="G"&&prevStage==="G"){day=addDays(day,4);while(!ok(day))day=addDays(day,1)}used=0;cap=2;prevStage=m.stage}
    if(used>=cap){day=nextDay(day);used=0;cap=2}
    m.date=day;m.heure=cap===1?"16:00":(used===0?"14:30":"16:30");used++;
  });
  return M;
}
function score(m,c1,c2){let a=0,b=0;(m.events||[]).forEach(e=>{if(e.type==="but"){if(e.club===c1)a++;else if(e.club===c2)b++}else if(e.type==="csc"){if(e.club===c1)b++;else if(e.club===c2)a++}});return[a,b]}
let R={matches:{},standings:{},pouleDone:{},players:{},sched:[]};
function compute(){
  const res={matches:{},standings:{},pouleDone:{},players:{},sched:[]};
  if(!edoc()){R=res;return res}
  const sched=buildSchedule();res.sched=sched;const d=draw();const L="ABCDEFGH".slice(0,fmt().g).split("");
  const mk=(m,c1,c2,l1,l2)=>{const doc=S.matches["m"+m.n]||{};const [g1,g2]=c1&&c2?score(doc,c1,c2):[0,0];const done=!!(doc.done&&c1&&c2);let winner=null,loser=null;
    if(done&&m.stage!=="G"){if(g1!==g2)winner=g1>g2?c1:c2;else if(doc.t1!=null&&doc.t2!=null&&doc.t1!==doc.t2)winner=doc.t1>doc.t2?c1:c2;if(winner)loser=winner===c1?c2:c1}
    return{...m,c1,c2,l1,l2,g1,g2,done,winner,loser,date:doc.date||m.date,heure:doc.heure||m.heure,t1:doc.t1,t2:doc.t2,events:doc.events||[]}};
  sched.filter(m=>m.stage==="G").forEach(m=>{res.matches[m.n]=mk(m,d&&d[m.a.code]||null,d&&d[m.b.code]||null,m.a.code,m.b.code)});
  L.forEach(p=>{res.standings[p]=standings(p,res);res.pouleDone[p]=sched.filter(m=>m.poule===p).every(m=>res.matches[m.n].done)});
  sched.filter(m=>m.stage!=="G").forEach(m=>{
    const side=s=>{if(s.q){const [pos,p]=s.q;return res.pouleDone[p]&&res.standings[p][pos-1]?[res.standings[p][pos-1].id,null]:[null,(pos===1?"1er ":"2e ")+p]}
      if(s.w){const r=res.matches[s.w];return r&&r.winner?[r.winner,null]:[null,"Vainq. M"+s.w]}
      if(s.l){const r=res.matches[s.l];return r&&r.loser?[r.loser,null]:[null,"Perd. M"+s.l]}};
    const [c1,l1]=side(m.a),[c2,l2]=side(m.b);res.matches[m.n]=mk(m,c1,c2,l1,l2)});
  R=res;res.players=playerStats(res);return res;
}
function standings(p,res){
  const d=draw();if(!d)return[];const size=fmt().size;
  const teams=[];for(let i=1;i<=size;i++)teams.push({id:d[p+i],code:p+i,j:0,g:0,n:0,pe:0,bp:0,bc:0,pts:0,fp:0});
  const by=Object.fromEntries(teams.map(t=>[t.id,t]));const ms=Object.values(res.matches).filter(m=>m.poule===p);
  ms.forEach(m=>{(m.events||[]).forEach(e=>{const t=by[e.club];if(!t)return;if(e.type==="cj")t.fp+=1;if(e.type==="ex2j"||e.type==="rd")t.fp+=3});
    if(!m.done)return;const A=by[m.c1],B=by[m.c2];if(!A||!B)return;A.j++;B.j++;A.bp+=m.g1;A.bc+=m.g2;B.bp+=m.g2;B.bc+=m.g1;
    if(m.g1>m.g2){A.g++;B.pe++;A.pts+=3}else if(m.g2>m.g1){B.g++;A.pe++;B.pts+=3}else{A.n++;B.n++;A.pts++;B.pts++}});
  teams.forEach(t=>t.diff=t.bp-t.bc);
  const mini=ids=>{const st=Object.fromEntries(ids.map(i=>[i,{pts:0,diff:0,bp:0}]));ms.filter(m=>m.done&&ids.includes(m.c1)&&ids.includes(m.c2)).forEach(m=>{const a=st[m.c1],b=st[m.c2];a.bp+=m.g1;b.bp+=m.g2;a.diff+=m.g1-m.g2;b.diff+=m.g2-m.g1;if(m.g1>m.g2)a.pts+=3;else if(m.g2>m.g1)b.pts+=3;else{a.pts++;b.pts++}});return st};
  teams.sort((a,b)=>b.pts-a.pts);const out=[];let i=0;
  while(i<teams.length){let j=i;while(j<teams.length&&teams[j].pts===teams[i].pts)j++;const grp=teams.slice(i,j);
    if(grp.length>1){const st=mini(grp.map(t=>t.id));grp.sort((a,b)=>st[b.id].pts-st[a.id].pts||st[b.id].diff-st[a.id].diff||st[b.id].bp-st[a.id].bp||b.diff-a.diff||b.bp-a.bp||a.fp-b.fp||a.code.localeCompare(b.code))}
    out.push(...grp);i=j}
  return out;
}
function playerStats(res,opt={}){
  const st={};const P=id=>st[id]||(st[id]={id,buts:0,st:{},passes:0,cj:0,ex:0,rd:0});
  const all=Object.values(res.matches).sort((a,b)=>a.n-b.n);const AP=opt.players||allPlayers();
  all.forEach(m=>(m.events||[]).forEach(e=>{const k=m.stage==="3P"?"F":m.stage;
    if(e.type==="but"&&e.player){const s=P(e.player);s.buts++;s.st[k]=(s.st[k]||0)+1}
    if(e.type==="but"&&e.assist)P(e.assist).passes++;
    if(e.type==="cj"&&e.player)P(e.player).cj++;if(e.type==="ex2j"&&e.player)P(e.player).ex++;if(e.type==="rd"&&e.player)P(e.player).rd++}));
  const resetIdx=opt.noReset||settings().reset==="0"?-1:STAGES.indexOf(settings().reset),seuil=settings().seuil;
  Object.entries(AP).forEach(([pid,p])=>{
    const s=P(pid);let pending=0,served=0,y1=0,y2=0,extraUsed=false;const violations=[];
    const teamMs=all.filter(m=>m.c1===p.club||m.c2===p.club);
    teamMs.forEach(m=>{if(!m.done)return;
      const mine=(m.events||[]).filter(e=>e.player===pid||e.assist===pid);
      if(pending>0){pending--;served++;if(mine.length)violations.push(m.n)}
      const evs=(m.events||[]).filter(e=>e.player===pid);const sent=evs.some(e=>e.type==="ex2j"||e.type==="rd");
      if(!evs.some(e=>e.type==="ex2j"))evs.filter(e=>e.type==="cj").forEach(()=>{const idx=STAGES.indexOf(m.stage);if(idx<=resetIdx){y1++;if(y1%seuil===0)pending++}else{y2++;if(y2%seuil===0)pending++}});
      if(sent){pending+=1;if(!extraUsed){pending+=(+p.suspSup||0);extraUsed=true}}});
    const resetDone=resetIdx<0||all.filter(m=>STAGES.indexOf(m.stage)<=resetIdx).every(m=>m.done);
    const cur=resetIdx<0?y2%seuil:(resetDone?y2%seuil:y1%seuil);const next=teamMs.find(m=>!m.done);
    Object.assign(s,{pending,served,cur,violations,next:next?next.n:null,statut:pending>0?"Suspendu":(cur===seuil-1?"Menacé":"Qualifié")});
  });
  return st;
}

/* ================= render ================= */
const crest=(c,cls="")=>c?`<span class="crest ${cls}" style="background:${esc(c.couleur||"#3D7BF7")}" ${c.logo?`data-ph="${esc(c.logo)}"`:""}>${esc((c.sigle||initials(c.nom)).slice(0,4))}</span>`:`<span class="crest ${cls}" style="background:#ffffff22;color:#A9B8E3">?</span>`;
const avatar=(ref,name,cls="")=>`<span class="av ${cls}" ${ref?`data-ph="${esc(ref)}"`:""}>${esc(initials(name))}</span>`;
const cName=cid=>{const c=clubData(cid);return c?(c.sigle||c.nom):""};
function render(){
  if(edoc()&&!isLeague())compute();else R={matches:{},standings:{},pouleDone:{},players:{},sched:[]};
  renderNav();
  const mode=$("#mode");const roleLbl=isAdmin()?"Administration":"Dirigeant de club";
  mode.textContent=DATA["local/settings"]?roleLbl:"";mode.hidden=!DATA["local/settings"];mode.className="mode live";
  $("#edlabel").textContent=ui.tab==="comps"&&ui.inComp&&edoc()?edoc().nom:"Gestion de compétitions de football";
  const m=$("#main");
  if(!S.loaded){m.innerHTML=`<p class="muted">Chargement…</p>`;return}
  if(!DATA["local/settings"]){$("#nav").innerHTML="";m.innerHTML=viewWelcome();return}
  if(isAdmin()&&!ui.unlocked){$("#nav").innerHTML="";m.innerHTML=viewLock();setTimeout(()=>{const i=$("#lockpw");i&&i.focus()},0);return}
  if(S.role==="dirigeant"&&(ui.tab==="admin"||(ui.tab==="comps"&&!Object.keys(S.comps).length)))ui.tab="clubs";
  if(ui.tab==="comps")m.innerHTML=ui.inComp&&edoc()?viewComp():viewComps();
  else if(ui.tab==="clubs")m.innerHTML=ui.club&&S.clubs[ui.club]?(ui.team&&(S.clubs[ui.club].teams||{})[ui.team]?viewTeam():viewClubBase()):(S.role==="dirigeant"?viewDir():viewClubsBase());
  else if(ui.tab==="partners")m.innerHTML=viewPartners();
  else if(ui.tab==="licences")m.innerHTML=isAdmin()?viewLicences():"";
  else m.innerHTML=isAdmin()?viewAdmin():"";
  hydratePhotos();
}
function renderNav(){
  const t=S.role==="dirigeant"?[...(Object.keys(S.comps).length?[["comps","Compétitions"]]:[]),["clubs","Mon club"],["partners","Partenaires"]]:[["comps","Compétitions"],["clubs","Clubs"],["licences","Licences"],["partners","Partenaires"],["admin","Admin"]];if(!DATA["local/settings"]||(isAdmin()&&!ui.unlocked))return;
  const nav=$("#nav");nav.style.gridTemplateColumns=innerWidth>=900?"1fr":`repeat(${t.length},1fr)`;
  nav.innerHTML=t.map(([k,l])=>`<button data-act="tab" data-v="${k}" ${ui.tab===k?'aria-current="page"':""}>${ICONS[k]}<span>${l}</span></button>`).join("");
}
const typeLbl=c=>c.type==="championnat"?"Championnat":"Tournoi";
function compProgress(id,c){
  const ms=Object.keys(DATA).filter(k=>k.startsWith(`competitions/${id}/matches/`)).map(k=>DATA[k]).filter(m=>m&&m.done).length;
  if(c.type==="championnat"){const v=(c.participants||[]).filter(p=>p.status==="valide").length;return{teams:v,state:(c.fixtures||[]).length?`${ms} / ${c.fixtures.length} matchs joués`:"Inscriptions en cours"}}
  return{teams:(c.approved||[]).length,state:c.locked?`Tirage effectué · ${ms} match${ms>1?"s":""} joué${ms>1?"s":""}`:"Inscriptions en cours"};
}
function viewComps(){
  const L=Object.entries(S.comps).sort((a,b)=>(b[1].createdAt||"").localeCompare(a[1].createdAt||""));
  const now=new Date(),hr=now.getHours(),hello=hr>=18||hr<5?"Bonsoir":"Bonjour";const MO=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  const prs=L.map(([id,c])=>compProgress(id,c));const live=prs.filter(p=>p.state!=="Inscriptions en cours").length,open=L.length-live;
  const clubs=Object.values(S.clubs||{}).filter(c=>!c.shared);const teams=clubs.reduce((a,c)=>a+Object.keys(c.teams||{}).length,0);
  const players=clubs.reduce((a,c)=>a+Object.values(c.teams||{}).reduce((b,t)=>b+(t.players||[]).length+(t.staff||[]).length,0),0);
  const pc=Object.values(S.partners||{}).filter(p=>p.statut==="Confirmé").length;const pl=(n,s,p)=>`${n} ${n>1?p:s}`;
  const sub=L.length?`${pl(live,"compétition en cours","compétitions en cours")}${open?` · ${pl(open,"inscription ouverte","inscriptions ouvertes")}`:""}.`:"Créez votre première compétition pour commencer.";
  return `<section class="hello"><p class="eyebrow">NARX Foot Manager · ${now.getDate()} ${MO[now.getMonth()]}</p><h1>${hello}, <span>place au jeu.</span></h1><p class="lead">${esc(sub)}</p>
    ${isAdmin()?`<div class="row" style="margin-top:18px"><button class="btn big-btn" data-act="comp-new"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Nouvelle compétition</button><button class="btn ghost big-btn" data-act="tab" data-v="clubs">Base des clubs</button></div>`:""}</section>
  <div class="kpis"><div class="kpi hot"><span>Compétitions</span><b>${L.length}</b><small>${pl(live,"en cours","en cours")}</small></div><div class="kpi"><span>Clubs</span><b>${clubs.length}</b><small>${pl(teams,"équipe","équipes")}</small></div><div class="kpi"><span>Licences</span><b>${players}</b><small>joueurs et staff</small></div><div class="kpi"><span>Partenaires</span><b>${pc}</b><small>${pl(pc,"confirmé","confirmés")}</small></div></div>
  <div class="phase">Vos compétitions</div>
  ${L.length?`<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))">${L.map(([id,c],i)=>{const pr=prs[i];
    return `<button class="clubcard" data-act="comp-open" data-v="${id}" style="display:block;padding:18px"><div class="row" style="gap:6px;margin-bottom:10px"><span class="chip ${c.type==="championnat"?"gold":"ok"}">${typeLbl(c)}</span>${c.cat?`<span class="chip">${esc(c.cat)}</span>`:""}${c.saison?`<span class="chip">${esc(c.saison)}</span>`:""}${isAdmin()&&c.link?`<span class="chip">Lien d'inscription prêt</span>`:""}</div>
    <div class="nm" style="font-size:20px">${esc(c.nom)}</div><div class="small muted" style="margin-top:4px">${pr.teams} / ${esc(c.nbClubs)} équipes validées · ${esc(pr.state)}</div></button>`}).join("")}</div>`
  :`<div class="empty"><h3>Aucune compétition</h3><p>Créez autant de tournois et de championnats que vous voulez. Les équipes se choisissent dans la base des clubs, sans les recréer.</p>${isAdmin()?`<button class="btn" data-act="comp-new">Créer une compétition</button>`:""}</div>`}`;
}
function viewComp(){
  const c=edoc();const back=`<button class="back" data-act="comp-back">‹ Toutes les compétitions</button>`;
  if(isLeague())return back+viewLeague();
  const tabs=[["participants",`Participants (${approved().length}/${nbClubs()})`],["tirage","Tirage"],["matchs","Matchs"],["stats","Statistiques"]];const t=ui.ctab||"participants";
  const body=t==="tirage"?viewDraw():t==="matchs"?viewMatches():t==="stats"?viewStats():viewTParts();
  return `${back}<div class="head"><div><h1>${esc(c.nom)}</h1><div class="muted">Tournoi · ${nbClubs()} équipes en ${fmt().g} poules de ${fmt().size}${c.cat?" · "+esc(c.cat):""}${c.saison?" · "+esc(c.saison):""}</div></div><div class="row"><button class="btn ghost" data-act="comp-visuals">Visuels de match</button><button class="btn ghost" data-act="comp-export">Exporter PNG / PDF</button>${isAdmin()?`<button class="btn" data-act="comp-link">Lien d'inscription</button><button class="btn ghost" data-act="comp-edit">Paramètres</button>`:""}</div></div>
  <div class="seg" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${t===k}" data-act="ctab" data-v="${k}">${l}</button>`).join("")}</div>${body}`;
}
function teamLine(t,extra=""){const pl=t.players||[];const bad=pl.filter(p=>eligibility(p.naissance)[1]==="bad").length;const over=pl.length>maxPlayers();
  return `<div class="row" style="flex-wrap:nowrap;min-width:0">${crest(t)}<div style="min-width:0"><div class="sigle">${esc(t.sigle||"")}</div><div style="font-weight:600">${esc(t.nom)} <span class="chip">${esc(t.catName||"")}</span></div><div class="small muted">${pl.length} joueur${pl.length>1?"s":""}${bad?` · <span style="color:var(--bad)">${bad} non éligible${bad>1?"s":""}</span>`:""}${over?` · <span style="color:var(--bad)">plus de ${maxPlayers()} joueurs</span>`:""}</div>${extra}</div></div>`}
function viewTParts(){
  const adm=isAdmin();const A=approved(),E=entries().filter(k=>!A.includes(k));const locked=drawLocked();let html="";
  if(adm)html+=linkPanel()+`<div class="panel" style="margin-bottom:16px"><b>${A.length} / ${nbClubs()}</b> équipes validées · ${E.length} en attente<p class="small muted" style="margin:6px 0 0">1. Ajoutez des équipes depuis la base des clubs. 2. Validez-les. 3. Effectuez le tirage quand ${nbClubs()} équipes sont validées.${locked?" Le tirage est validé : la liste des équipes ne peut plus changer.":""}</p></div>`;
  const card=(k,st)=>{const t=clubData(k);if(!t)return"";return `<div class="person" style="justify-content:space-between;flex-wrap:wrap">${teamLine(t,st==="ok"?`<span class="chip ok" style="margin-top:4px">Validée</span>`:`<span class="chip gold" style="margin-top:4px">En attente</span>`)}
    ${adm&&!locked?`<div class="row">${st==="ok"?`<button class="btn ghost sm" data-act="t-unvalidate" data-v="${esc(k)}">Retirer la validation</button>`:`<button class="btn sm" data-act="t-validate" data-v="${esc(k)}">Valider</button><button class="btn ghost sm" data-act="t-unlist" data-v="${esc(k)}">Retirer</button>`}</div>`:""}</div>`};
  const shown=[...A.map(k=>card(k,"ok")),...(adm?E.map(k=>card(k,"wait")):[])].join("");
  html+=shown?`<div class="grid">${shown}</div>`:`<div class="empty">Aucune équipe pour l'instant.</div>`;
  if(adm&&!locked)html+=addTeamsHTML([...A,...E],"t-enlist");
  return html;
}
function addTeamsHTML(used,act){const c=edoc()||{};const avail=compTeamsAvailable(used);
  return `<h3 style="margin:22px 0 6px">Ajouter des équipes depuis la base des clubs</h3><div class="row small muted" style="margin-bottom:10px">${c.cat?`<span>Catégorie de la compétition : <b>${esc(c.cat)}</b>.</span><label class="row" style="gap:6px;cursor:pointer"><input type="checkbox" data-act="allcats" ${ui.allCats?"checked":""} style="width:18px;height:18px">Afficher toutes les catégories</label>`:"Toutes les catégories sont acceptées."}<button class="btn ghost sm" data-act="tab" data-v="clubs">Gérer la base des clubs</button></div>
  ${avail.length?`<div class="grid clubs">${avail.map(t=>`<div class="clubcard" style="cursor:default;justify-content:space-between">${teamLine(t)}<button class="btn sm" data-act="${act}" data-v="${esc(t.key)}">Ajouter</button></div>`).join("")}</div>`:`<p class="muted small">Aucune équipe disponible${c.cat&&!ui.allCats?" dans cette catégorie":""}. Créez le club ou la catégorie dans l'onglet Clubs.</p>`}`}
function viewClubsBase(){
  const L=Object.entries(S.clubs).map(([id,c])=>({id,...c})).sort((a,b)=>(a.nom||"").localeCompare(b.nom||"","fr"));const nt=L.reduce((a,c)=>a+Object.keys(c.teams||{}).length,0);
  return `<div class="head"><div><h1>Base des clubs</h1><div class="muted">${L.length} club${L.length>1?"s":""} · ${nt} équipe${nt>1?"s":""} (catégories). Les compétitions puisent leurs équipes ici.</div></div>${isAdmin()?`<div class="row"><button class="btn" data-act="club-new">Nouveau club</button><button class="btn danger" data-act="club-del-pick" ${L.length?"":"disabled"}>Supprimer un club</button></div>`:""}</div>
  ${L.length?`<div class="grid clubs">${L.map(c=>{const ts=clubTeams(c.id);return `<button class="clubcard" data-act="club-open" data-v="${c.id}">${crest(c)}<div style="min-width:0"><div class="sigle">${esc(c.sigle||"")}</div><div class="nm">${esc(c.nom)}</div><div class="small muted">${ts.length?ts.map(t=>esc(catLabel(t))).join(", "):"Aucune catégorie"}</div></div></button>`}).join("")}</div>`
  :`<div class="empty"><h3>Aucun club enregistré</h3><p>Enregistrez chaque club une seule fois, puis ses catégories d'équipes (U17, U20, Seniors…). Les dossiers envoyés par les dirigeants s'importent depuis l'onglet Admin.</p>${isAdmin()?`<button class="btn" data-act="club-new">Nouveau club</button>`:""}</div>`}`;
}
function viewClubBase(){
  const cid=ui.club,c=S.clubs[cid];const can=canEditClub(cid);const ts=clubTeams(cid);const t=ui.clubTab==="equipes"?"equipes":"infos";let body="";
  if(t==="infos"){const used=ts.flatMap(x=>teamUsedIn(tkey(cid,x.tid)));
    body=`<div class="panel"><div class="row" style="gap:18px;align-items:flex-start">${crest(c,"lg")}<div style="flex:1;min-width:200px"><div class="sigle" style="font-size:20px">${esc(c.sigle||"")}</div><h2>${esc(c.nom)}</h2><div class="muted">${esc(c.quartier||"Quartier non renseigné")}</div>
    <div class="small" style="margin-top:10px">Responsable : ${esc(c.responsable||"—")}<br>Téléphone : ${esc(c.tel||"—")}</div>${used.length?`<div class="small muted" style="margin-top:10px">Engagé dans : ${esc([...new Set(used)].join(", "))}</div>`:""}</div></div>
    ${can?`<div class="row" style="margin-top:16px"><button class="btn" data-act="club-edit">Modifier le club</button>${isAdmin()&&!used.length?`<button class="btn danger" data-act="club-del">Supprimer le club</button>`:""}</div>`:""}</div>`}
  else body=`<div class="row between" style="margin-bottom:12px"><span class="muted">Chaque catégorie est une équipe avec son propre staff et ses propres joueurs.</span>${can?`<button class="btn" data-act="team-new">Ajouter une catégorie</button>`:""}</div>
    ${ts.length?`<div class="grid people">${ts.map(x=>{const used=teamUsedIn(tkey(cid,x.tid));return `<button class="person" data-act="team-open" data-v="${x.tid}" style="cursor:pointer;text-align:left;color:inherit;width:100%;display:block"><div class="row between"><span class="cond" style="font-size:22px;font-weight:700;color:var(--gold)">${esc(x.cat)}</span>${x.label?`<span class="chip">${esc(x.label)}</span>`:""}</div><div class="small">${(x.players||[]).length} joueur${(x.players||[]).length>1?"s":""} · staff ${(x.staff||[]).filter(s=>s&&s.nom).length}/5</div>${used.length?`<div class="small muted">${esc(used.join(", "))}</div>`:""}</button>`}).join("")}</div>`:`<div class="empty">Aucune catégorie. ${can?"Ajoutez les équipes dont dispose le club (U17, U20, Seniors…).":""}</div>`}`;
  return `<button class="back" data-act="club-back">‹ ${S.role==="dirigeant"?"Retour":"Tous les clubs"}</button><div class="head"><div class="row">${crest(c,"sm")}<h1>${esc(c.nom)}</h1></div>${can&&!isAdmin()?`<span class="chip ok">Vous gérez ce club</span>`:""}</div>
  <div class="seg" role="tablist"><button role="tab" aria-selected="${t==="infos"}" data-act="clubtab" data-v="infos">Infos</button><button role="tab" aria-selected="${t==="equipes"}" data-act="clubtab" data-v="equipes">Catégories (${ts.length})</button></div>${body}`;
}
function viewTeam(){
  const cid=ui.club,c=S.clubs[cid],tm=c.teams[ui.team];const can=canEditClub(cid);const key=tkey(cid,ui.team);const t=ui.teamTab==="staff"?"staff":"joueurs";const tag=can?"button":"div";let body="";
  if(t==="staff"){const st=tm.staff||[];
    const card=i=>{const s=st[i]||{};return `<${tag} class="person ${s.nom?"":"emptyp"}" ${can?`data-act="staff-edit" data-v="${i}" style="cursor:pointer;text-align:left;color:inherit;width:100%"`:""}>${avatar(s.photo,(s.prenom||"")+" "+(s.nom||""))}<div style="min-width:0"><div class="role">${esc(s.role||STAFF_ROLES[i])}</div><div style="font-weight:600">${s.nom?esc(s.prenom+" "+s.nom):"À inscrire"}</div>${s.tel&&can?`<div class="small muted">${esc(s.tel)}</div>`:""}${s.qualif?`<div class="small muted">${esc(s.qualif)}</div>`:""}</div></${tag}>`};
    body=`<h3 style="margin-bottom:10px">Staff technique <span class="muted small">(3 personnes)</span></h3><div class="grid people">${[0,1,2].map(card).join("")}</div><h3 style="margin:22px 0 10px">Kinésithérapeutes <span class="muted small">(2 personnes)</span></h3><div class="grid people">${[3,4].map(card).join("")}</div>`}
  else{const P=(tm.players||[]).slice().sort((a,b)=>(+a.maillot||99)-(+b.maillot||99));
    body=`<div class="row between" style="margin-bottom:12px"><span class="muted">${P.length} / ${TEAM_MAX} joueurs</span>${can?`<button class="btn" data-act="player-new" ${P.length>=TEAM_MAX?"disabled":""}>Ajouter un joueur</button>`:""}</div>
    ${P.length?`<div class="grid people">${P.map(p=>`<${tag} class="person" ${can?`data-act="player-edit" data-v="${p.id}" style="cursor:pointer;text-align:left;color:inherit;width:100%"`:""}>${avatar(p.photo,p.prenom+" "+p.nom)}<div style="min-width:0;flex:1"><div class="row between"><span class="role">${esc(p.poste||"")}</span><span class="cond" style="font-size:22px;font-weight:700;color:var(--gold)">${esc(p.maillot||"")}</span></div><div style="font-weight:600">${esc(p.prenom)} ${esc(p.nom)}</div><div class="small muted">${p.naissance?fmtDate(p.naissance)+" · "+ageOf(p.naissance):""}</div><div class="row" style="gap:6px;margin-top:4px"><span class="chip ${p.pieceDoc?"ok":"gold"}">${p.pieceDoc?"PDF fourni":"Pièces manquantes"}</span></div></div></${tag}>`).join("")}</div>`:`<div class="empty">Aucun joueur dans cette catégorie.</div>`}`}
  const used=teamUsedIn(key);
  return `<button class="back" data-act="team-back">‹ ${esc(c.nom)}</button><div class="head"><div class="row">${crest(c,"sm")}<h1>${esc(c.nom)} · ${esc(catLabel(tm))}</h1></div>${can?`<div class="row"><button class="btn ghost sm" data-act="team-edit">Modifier la catégorie</button></div>`:""}</div>
  ${used.length?`<p class="small muted">Engagée dans : ${esc(used.join(", "))}</p>`:""}
  <div class="seg" role="tablist"><button role="tab" aria-selected="${t==="joueurs"}" data-act="teamtab" data-v="joueurs">Joueurs (${(tm.players||[]).length})</button><button role="tab" aria-selected="${t==="staff"}" data-act="teamtab" data-v="staff">Staff</button></div>${body}`;
}
function viewAdmin(){
  return `<div class="head"><div><h1>Administration</h1><div class="muted">Réglages généraux de NARX Foot Manager.</div></div></div>
  ${syncPanelHTML()}
  <div class="panel" style="margin-bottom:16px"><h3>Dossiers des clubs</h3><p class="small">Les dirigeants remplissent la fiche de leur club et de ses catégories dans leur propre application (mode « Dirigeant de club »), puis vous envoient leur dossier. Les dossiers issus du formulaire Google s'importent de la même façon. Un dossier renvoyé plus tard met à jour le club.</p><button class="btn" data-act="imp-club">Importer un dossier club</button></div>
  <div class="panel" style="margin-bottom:16px"><h3>Sauvegarde</h3><p class="small">Les données sont enregistrées automatiquement sur cet ordinateur. Faites régulièrement une sauvegarde complète sur une clé USB.</p><div class="row"><button class="btn ghost" data-act="exp-backup">Exporter une sauvegarde</button><button class="btn ghost" data-act="imp-backup">Restaurer une sauvegarde</button></div></div>
  <div class="panel"><h3>Sécurité</h3><p class="small">L'administration est protégée par mot de passe. Verrouillez l'application si vous laissez l'ordinateur sans surveillance.</p><div class="row"><button class="btn ghost" data-act="lock">Verrouiller l'application</button><button class="btn ghost sm" data-act="mode-reset">Changer de mode</button></div></div>`;
}
function viewDir(){
  const c=S.clubs[S.me];
  if(!c)return `<div class="head"><h1>Mon club</h1></div><div class="empty"><h3>Créez la fiche de votre club</h3><p>Renseignez votre club une seule fois, puis ajoutez ses catégories d'équipes (U17, U20, Seniors…) avec leur staff et leurs joueurs.</p><button class="btn" data-act="club-new">Créer la fiche de mon club</button><p class="small" style="margin-top:14px"><button class="back" data-act="mode-reset">Changer de mode</button></p></div>`;
  const ts=clubTeams(S.me);
  return `<div class="head"><div><h1>Mon club</h1></div></div><button class="clubcard" data-act="club-open" data-v="${S.me}">${crest(c,"lg")}<div><div class="sigle">${esc(c.sigle||"")}</div><div class="nm" style="font-size:22px">${esc(c.nom)}</div><div class="small muted">${ts.length?ts.map(t=>esc(catLabel(t))).join(", "):"Aucune catégorie"} · touchez pour modifier</div></div></button>
  <div class="panel" style="margin-top:16px"><h3>Envoyer mon dossier à l'organisation</h3><p class="small">Exportez votre dossier (club, catégories, staff, joueurs, photos et PDF) et envoyez le fichier à l'organisation. Après chaque modification, renvoyez le dossier à jour.</p><button class="btn" data-act="exp-club">Exporter mon dossier club</button></div>
  ${myCompsHTML()}
  <p class="small muted" style="margin-top:18px"><button class="back" data-act="mode-reset" style="margin:0">Changer de mode</button></p>`;
}

function viewDraw(){
  const A=approvedClubs(),N=nbClubs(),F=fmt(),L="ABCDEFGH".slice(0,F.g).split("");const d=ui.preview||draw();const locked=drawLocked();
  const played=Object.values(S.matches).some(m=>m.done);let actions="";
  if(isAdmin())actions=locked?`<span class="chip ok">Tirage validé</span>${played?"":`<button class="btn ghost sm" data-act="draw-reset">Annuler le tirage</button>`}`:`<button class="btn" data-act="draw-run" ${A.length!==N||ui.animating?"disabled":""}>${ui.preview?"Relancer le tirage":"Lancer le tirage"}</button>${ui.preview&&!ui.animating?`<button class="btn ghost" data-act="draw-save">Valider le tirage</button>`:""}`;
  else if(locked)actions=`<span class="chip ok">Tirage validé</span>`;
  const top=!d&&A.length!==N?`<div class="notice">Le tirage nécessite ${N} clubs validés. ${A.length} sur ${N} pour l'instant.</div>`:(!d&&!isAdmin()?`<div class="notice">Le tirage au sort n'a pas encore eu lieu.</div>`:"");
  const canSwap=isAdmin()&&!locked&&ui.preview&&!ui.animating;
  const pots=L.map(p=>`<div class="panel poule"><h3><span>Poule</span><span class="letter">${p}</span></h3>${Array.from({length:F.size},(_,k)=>{const code=p+(k+1),id=d&&d[code],c=id&&clubData(id);const tg=canSwap?"button":"div";
    return `<${tg} class="slot ${ui.sel===code?"sel":""}" id="slot-${code}" ${canSwap?`data-act="swap" data-v="${code}"`:""}><span class="code">${code}</span>${c?crest(c,"sm"):""}<span style="font-weight:600;${c?"":"color:var(--muted)"}">${c?esc(c.nom):"—"}</span>${c?`<span class="sigle" style="margin-left:auto">${esc(c.sigle||"")}</span>`:""}</${tg}>`}).join("")}</div>`).join("");
  return `<div class="head"><div><h1>Tirage au sort</h1><div class="muted">${N} clubs répartis en ${F.g} poules de ${F.size}. Les 2 premiers de chaque poule se qualifient.</div></div><div class="row">${actions}</div></div>${top}
  <div class="panel drum" id="drum" hidden aria-live="polite"></div>${canSwap?`<div class="notice">Tirage provisoire. Touchez deux clubs pour les échanger si nécessaire, puis validez.</div>`:""}<div class="grid pots" style="margin-top:14px">${pots}</div>`;
}
function teamCell(cid,label,right){const c=cid&&clubData(cid);const nm=c?esc(c.sigle||c.nom):esc(label||"—");return `<div class="tm ${right?"r":""}">${right?`<span>${nm}</span>${crest(c,"sm")}`:`${crest(c,"sm")}<span>${nm}</span>`}</div>`}
function viewMatches(){
  if(!draw())return `<div class="head"><h1>Matchs</h1></div><div class="empty"><h3>Calendrier à venir</h3><p>Le calendrier est généré dès la validation du tirage au sort.</p></div>`;
  const Ms=Object.values(R.matches).sort((a,b)=>a.n-b.n);let html=`<div class="head"><div><h1>Matchs</h1><div class="muted">${Ms.filter(m=>m.done).length} / ${Ms.length} matchs joués${isAdmin()?"":" · saisie réservée à l'administration"}</div></div></div>`;let st="";
  Ms.forEach(m=>{if(m.stage!==st){st=m.stage;html+=`<div class="phase">${STAGE_NAME[st]}</div>`}
    const sc=(m.done||m.events.length)?`${m.g1} – ${m.g2}`:"vs";
    html+=`<button class="mcard" data-act="match-open" data-v="${m.n}" ${m.c1&&m.c2?"":"disabled"} style="margin-bottom:10px">${teamCell(m.c1,m.l1,false)}<span class="score ${!m.done&&m.events.length?"live":""}">${sc}</span>${teamCell(m.c2,m.l2,true)}<div class="meta"><span>M${m.n}${m.poule?" · Poule "+m.poule:""}</span><span>${fmtDay(m.date)} · ${esc(m.heure)}</span><span>${m.done?(m.t1!=null&&m.g1===m.g2&&m.stage!=="G"?`TAB ${m.t1}–${m.t2}`:"Terminé"):(m.events.length?"En cours":"À jouer")}</span></div></button>`});
  return html;
}
function viewStats(){
  const tabs=[["classement","Classements"],["buteurs","Buteurs"],["passeurs","Passeurs"],["cartons","Cartons & suspensions"]];let body="";const AP=allPlayers();
  const pname=p=>esc(p.prenom+" "+p.nom);
  if(!draw())body=`<div class="empty">Les statistiques apparaîtront après le tirage et les premiers matchs.</div>`;
  else if(ui.statsTab==="classement"){const L=Object.keys(R.standings);
    body=`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))">${L.map(p=>{const st=R.standings[p],done=R.pouleDone[p],tot=Object.values(R.matches).filter(m=>m.poule===p);
      return `<div class="panel"><div class="row between" style="margin-bottom:8px"><h3>Poule ${p}</h3><span class="chip ${done?"ok":""}">${done?"Terminée":tot.filter(m=>m.done).length+"/"+tot.length+" matchs"}</span></div><div class="tablewrap"><table><thead><tr><th>#</th><th>Club</th><th class="n">J</th><th class="n hm">G</th><th class="n hm">N</th><th class="n hm">P</th><th class="n">Diff</th><th class="n">FP</th><th class="n">Pts</th></tr></thead><tbody>
      ${st.map((t,i)=>{const c=clubData(t.id);return `<tr class="${i<2?"q":""}"><td>${i+1}</td><td><div class="row" style="gap:8px;flex-wrap:nowrap">${crest(c,"sm")}<span>${c?esc(c.sigle||c.nom):"?"}</span></div></td><td class="n">${t.j}</td><td class="n hm">${t.g}</td><td class="n hm">${t.n}</td><td class="n hm">${t.pe}</td><td class="n">${t.diff>0?"+":""}${t.diff}</td><td class="n muted">${t.fp}</td><td class="n pts">${t.pts}</td></tr>`}).join("")}</tbody></table></div></div>`}).join("")}</div>
      <p class="small muted">Départage : points, confrontation directe, différence de buts, buts marqués, fair-play (FP : 1 point par avertissement, 3 par exclusion), puis tirage au sort. Les deux premiers se qualifient.</p>`}
  else if(ui.statsTab==="buteurs"||ui.statsTab==="passeurs"){
    const key=ui.statsTab==="buteurs"?"buts":"passes",other=key==="buts"?"passes":"buts";
    const stages=[...new Set(R.sched.map(m=>m.stage==="3P"?"F":m.stage))];
    const L=Object.values(R.players).filter(s=>AP[s.id]&&s[key]>0).sort((a,b)=>b[key]-a[key]||b[other]-a[other]);
    const rank=s=>1+L.filter(x=>x[key]>s[key]||(x[key]===s[key]&&x[other]>s[other])).length;
    const pod=L.slice(0,3).map(s=>{const p=AP[s.id];return `<div class="leader">${avatar(p.photo,p.prenom+" "+p.nom)}<div><div style="font-weight:600">${pname(p)}</div><div class="small muted">${esc(cName(p.club))}</div></div><span class="big">${s[key]}</span></div>`}).join("");
    body=L.length?`<div class="podium">${pod}</div><div class="panel tablewrap"><table><thead><tr><th>#</th><th>Joueur</th><th>Club</th>${key==="buts"?stages.map(k=>`<th class="n hm">${STAGE_SHORT[k]}</th>`).join("")+'<th class="n">Buts</th><th class="n">Passes</th>':'<th class="n">Passes</th><th class="n">Buts</th>'}<th class="n">CJ</th><th class="n">CR</th></tr></thead><tbody>
    ${L.map(s=>{const p=AP[s.id];return `<tr><td>${rank(s)}</td><td><div class="row" style="gap:8px;flex-wrap:nowrap">${avatar(p.photo,p.prenom+" "+p.nom)}<span>${pname(p)}</span></div></td><td>${esc(cName(p.club))}</td>${key==="buts"?stages.map(k=>`<td class="n hm">${s.st[k]||0}</td>`).join("")+`<td class="n pts">${s.buts}</td><td class="n">${s.passes}</td>`:`<td class="n pts">${s.passes}</td><td class="n">${s.buts}</td>`}<td class="n">${s.cj}</td><td class="n">${s.ex+s.rd}</td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty">${key==="buts"?"Aucun but enregistré pour l'instant.":"Aucune passe décisive enregistrée pour l'instant."}</div>`}
  else{
    const L=Object.values(R.players).filter(s=>AP[s.id]&&(s.cj||s.ex||s.rd||s.pending||s.served)).sort((a,b)=>(b.pending>0)-(a.pending>0)||(b.statut==="Menacé")-(a.statut==="Menacé")||(b.cj+3*(b.ex+b.rd))-(a.cj+3*(a.ex+a.rd)));
    const tot=Object.values(R.players).reduce((a,s)=>({cj:a.cj+s.cj,ex:a.ex+s.ex,rd:a.rd+s.rd}),{cj:0,ex:0,rd:0});const rs=settings().reset;
    const rsl={"0":"Jamais",G:"Après la phase de poules",QF:"Après les quarts de finale (FIFA)"};
    body=`<div class="podium"><div class="leader"><span class="evico cj">J</span><div>Cartons jaunes</div><span class="big">${tot.cj}</span></div><div class="leader"><span class="evico rd">R</span><div>Exclusions et rouges</div><span class="big">${tot.ex+tot.rd}</span></div><div class="leader"><div>Joueurs suspendus</div><span class="big">${L.filter(s=>s.pending>0).length}</span></div><div class="leader"><div>Menacés de suspension</div><span class="big">${L.filter(s=>s.statut==="Menacé").length}</span></div></div>
    <p class="small muted">Norme FIFA : 2 avertissements dans 2 matchs différents = 1 match de suspension ; exclusion = au moins 1 match. Annulation des avertissements simples : ${rsl[rs]||rs}. Les suspensions sont purgées automatiquement lors des matchs suivants du club.</p>
    ${L.length?`<div class="panel tablewrap"><table><thead><tr><th>Joueur</th><th>Club</th><th class="n">CJ</th><th class="n">2e J</th><th class="n">Rouge</th><th class="n">En cours</th><th class="n">Purgés</th><th class="n">Restant</th><th>Statut</th></tr></thead><tbody>
    ${L.map(s=>{const p=AP[s.id];const stat=s.pending>0?`<span class="chip bad">Suspendu${s.next?" · M"+s.next:""}</span>`:s.statut==="Menacé"?`<span class="chip gold">Menacé</span>`:`<span class="chip ok">Qualifié</span>`;
      return `<tr><td><div class="row" style="gap:8px;flex-wrap:nowrap">${avatar(p.photo,p.prenom+" "+p.nom)}<span>${pname(p)}</span></div></td><td>${esc(cName(p.club))}</td><td class="n">${s.cj}</td><td class="n">${s.ex}</td><td class="n">${s.rd}</td><td class="n">${s.cur}</td><td class="n">${s.served}</td><td class="n pts">${s.pending}</td><td>${stat}${s.violations.length?`<div class="small" style="color:var(--bad)">Sur la feuille alors que suspendu : M${s.violations.join(", M")}</div>`:""}</td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty">Aucun carton enregistré pour l'instant.</div>`}`}
  return `<div class="head"><h1>Statistiques</h1></div><div class="seg" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${ui.statsTab===k}" data-act="statstab" data-v="${k}">${l}</button>`).join("")}</div>${body}`;
}
/* ================= modals ================= */
function openModal(html,onSubmit,after){
  const root=$("#modalroot");root.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><div class="sheet">${html}</div></div>`;
  const prev=document.activeElement;const close=()=>{root.innerHTML="";prev&&prev.focus&&prev.focus()};
  root.querySelector(".modal").addEventListener("click",e=>{if(e.target.classList.contains("modal")||e.target.closest("[data-close]"))close()});
  root.querySelector(".modal").addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  const f=root.querySelector("form");if(f)f.addEventListener("submit",async e=>{e.preventDefault();const b=f.querySelector("[type=submit]");b&&(b.disabled=true,b.textContent="Enregistrement…");const ok=await onSubmit(new FormData(f),f);if(ok!==false)close();else if(b){b.disabled=false;b.textContent=b.dataset.l||"Enregistrer"}});
  after&&after(root,close);hydratePhotos(root);const first=root.querySelector("input:not([type=file]),select");first&&first.focus();return close;
}
const pickHTML=(ref,label,round=true,cap="Photo")=>`<div class="photo-pick"><span class="${round?"av lg":"crest lg"} pv" ${ref?`data-ph="${esc(ref)}"`:""}>${esc(initials(label))}</span><div class="grid" style="gap:8px"><button type="button" class="btn ghost sm" data-pick>${ref?"Changer":"Ajouter"} : ${cap.toLowerCase()}</button>${ref?`<button type="button" class="btn ghost sm" data-rmphoto>Retirer</button>`:""}<span class="small muted">Prenez une photo ou choisissez une image.</span></div><input type="file" accept="image/*"></div>`;
function photoPicker(root,ref,label){let cur=ref,file=null;const box=root.querySelector(".photo-pick");const inp=box.querySelector("input[type=file]"),pv=box.querySelector(".pv");
  box.querySelector("[data-pick]").addEventListener("click",()=>inp.click());
  inp.addEventListener("change",()=>{file=inp.files[0];if(file)pv.innerHTML=`<img src="${URL.createObjectURL(file)}" alt="">`});
  const rm=box.querySelector("[data-rmphoto]");rm&&rm.addEventListener("click",()=>{cur=null;file=null;pv.removeAttribute("data-ph");pv.textContent=initials(label)});
  return{get:()=>({ref:cur,file})}}
async function resolvePhoto(cid,pp,old){const {ref,file}=pp.get();if(file){const n=await savePhoto(cid,file);if(!n)return old||null;if(old&&old!==n)dropPhoto(old);return n}if(!ref&&old)dropPhoto(old);return ref||null}

async function saveClubInfo(cid,info){const doc=clone(S.clubs[cid])||{teams:{},createdAt:new Date().toISOString()};return write(`clubreg/${cid}`,{...doc,...info,teams:doc.teams||{}})}
async function saveTeam(cid,tid,patch){const doc=clone(S.clubs[cid]);if(!doc)return false;doc.teams=doc.teams||{};doc.teams[tid]={...(doc.teams[tid]||{}),...patch};return write(`clubreg/${cid}`,doc)}
function clubForm(cid,isNew){
  const c=(!isNew&&S.clubs[cid])||{};let pp;
  openModal(`<header><h2>${isNew?"Nouveau club":"Modifier le club"}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  ${pickHTML(c.logo,c.sigle||c.nom,false,"Logo")}
  <div class="f"><label for="cn">Nom du club</label><input id="cn" name="nom" type="text" required maxlength="60" value="${esc(c.nom||"")}"></div>
  <div class="two"><div class="f"><label for="cs">Sigle</label><input id="cs" name="sigle" type="text" required maxlength="6" style="text-transform:uppercase" value="${esc(c.sigle||"")}"></div><div class="f"><label for="cc">Couleur principale</label><input id="cc" name="couleur" type="color" value="${esc(c.couleur||"#3D7BF7")}" style="height:44px;width:100%;background:none;border:1px solid var(--line);border-radius:10px"></div></div>
  <div class="f"><label for="cq">Quartier / localité</label><input id="cq" name="quartier" type="text" maxlength="60" value="${esc(c.quartier||"")}"></div>
  <div class="two"><div class="f"><label for="cr">Responsable</label><input id="cr" name="responsable" type="text" maxlength="60" value="${esc(c.responsable||"")}"></div><div class="f"><label for="ct">Téléphone</label><input id="ct" name="tel" type="tel" maxlength="30" value="${esc(c.tel||"")}"></div></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">Enregistrer</button></div></form>`,
  async fd=>{const nom=fd.get("nom").trim(),sigle=fd.get("sigle").trim().toUpperCase();
    if(Object.entries(S.clubs).some(([id,x])=>id!==cid&&((x.nom||"").toLowerCase()===nom.toLowerCase()||x.sigle===sigle))){toast("Ce nom ou ce sigle est déjà utilisé par un autre club.");return false}
    const logo=await resolvePhoto(cid,pp,c.logo);
    const ok=await saveClubInfo(cid,{nom,sigle,couleur:fd.get("couleur"),quartier:fd.get("quartier").trim(),responsable:fd.get("responsable").trim(),tel:fd.get("tel").trim(),logo:logo||null,updatedAt:new Date().toISOString()});
    if(ok&&isNew){ui.club=cid;ui.team=null;ui.clubTab="equipes";ui.tab="clubs";render();toast("Club créé : ajoutez maintenant ses catégories d'équipes")}else ok&&toast("Club enregistré");return ok},
  root=>{pp=photoPicker(root,c.logo,c.sigle||c.nom)});
}
function teamForm(cid,tid){
  const t=tid?(S.clubs[cid].teams||{})[tid]:{cat:"Seniors"};const key=tid?tkey(cid,tid):null;const used=key?teamUsedIn(key):[];
  openModal(`<header><h2>${tid?"Modifier la catégorie":"Ajouter une catégorie"}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <div class="two"><div class="f"><label for="tc">Catégorie</label><select id="tc" name="cat">${CATS.map(x=>`<option ${t.cat===x?"selected":""}>${x}</option>`).join("")}</select></div>
  <div class="f"><label for="tl">Précision (facultatif)</label><input id="tl" name="label" type="text" maxlength="30" placeholder="Ex. : Équipe B, Garçons" value="${esc(t.label||"")}"></div></div>
  <p class="small muted">Chaque catégorie est une équipe distincte avec son staff et ses joueurs. Elle pourra être engagée dans plusieurs compétitions.</p>
  ${used.length?`<p class="small">Engagée dans : ${esc(used.join(", "))}.</p>`:""}
  <div class="row" style="justify-content:space-between">${tid&&!used.length?`<button type="button" class="btn danger" data-delt>Supprimer la catégorie</button>`:"<span></span>"}<div class="row"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">Enregistrer</button></div></div></form>`,
  async fd=>{const cat=fd.get("cat"),label=fd.get("label").trim();
    if(clubTeams(cid).some(x=>x.tid!==tid&&x.cat===cat&&(x.label||"").toLowerCase()===label.toLowerCase())){toast("Cette catégorie existe déjà pour ce club. Ajoutez une précision (ex. : Équipe B).");return false}
    const ntid=tid||uid();const ok=await saveTeam(cid,ntid,{cat,label,staff:t.staff||[],players:t.players||[]});
    if(ok){toast(tid?"Catégorie modifiée":"Catégorie ajoutée");if(!tid){ui.team=ntid;ui.teamTab="joueurs";render()}}return ok},
  (root,close)=>{const d=root.querySelector("[data-delt]");d&&d.addEventListener("click",async()=>{if(!(await askConfirm(`Supprimer la catégorie ${catLabel(t)} et tous ses joueurs ?`,"Supprimer")))return;
    const doc=clone(S.clubs[cid]);const tm=doc.teams[tid];(tm.players||[]).forEach(p=>{dropPhoto(p.photo);if(p.pieceDoc)window.ggStore.deleteDoc(cid,p.pieceDoc.id)});(tm.staff||[]).forEach(s=>s&&dropPhoto(s.photo));
    delete doc.teams[tid];await write(`clubreg/${cid}`,doc);ui.team=null;ui.clubTab="equipes";close();render()})});
}
function compForm(id){
  const c=id?S.comps[id]:{type:"tournoi",nbClubs:16,maxPlayers:25,reset:"QF",mode:"simple",pts:{v:3,n:1,d:0},saison:String(new Date().getFullYear()+1)};const pts=c.pts||{v:3,n:1,d:0};
  const started=id&&(c.type==="championnat"?(c.fixtures||[]).length>0:!!c.locked);
  const opts=n=>Object.keys(FORMATS).map(k=>`<option value="${k}" ${+k===+n?"selected":""}>${k} équipes – ${FORMATS[k].g} poules de ${FORMATS[k].size}</option>`).join("");
  openModal(`<header><h2>${id?"Paramètres de la compétition":"Nouvelle compétition"}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <div class="f"><label for="cpn">Nom de la compétition</label><input id="cpn" name="nom" type="text" required maxlength="70" placeholder="Ex. : Coupe de la jeunesse 2027" value="${esc(c.nom||"")}"></div>
  <div class="two"><div class="f"><label for="cpt">Format</label><select id="cpt" name="type" ${id?"disabled":""}><option value="tournoi" ${c.type!=="championnat"?"selected":""}>Tournoi (poules puis phases finales)</option><option value="championnat" ${c.type==="championnat"?"selected":""}>Championnat (tous contre tous)</option></select></div>
  <div class="f"><label for="cpc">Catégorie</label><select id="cpc" name="cat"><option value="">Toutes catégories</option>${CATS.map(x=>`<option ${c.cat===x?"selected":""}>${x}</option>`).join("")}</select></div></div>
  <div class="f"><label for="cpl">Lieu des matchs (facultatif, affiché sur les visuels)</label><input id="cpl" name="lieu" type="text" maxlength="60" placeholder="Ex. : Terrain municipal de Légbassito" value="${esc(c.lieu||"")}"></div>
  <div class="two"><div class="f"><label for="cps">Saison</label><input id="cps" name="saison" type="text" maxlength="20" value="${esc(c.saison||"")}"></div><div class="f"><label for="cpd">Date du premier match</label><input id="cpd" name="start" type="date" value="${esc(c.start||"")}"></div></div>
  <div data-only="tournoi"><div class="two"><div class="f"><label for="cpnt">Nombre d'équipes</label><select id="cpnt" name="nbT" ${c.locked?"disabled":""}>${opts(c.nbClubs||16)}</select></div>
    <div class="f"><label for="cpr">Annulation des avertissements</label><select id="cpr" name="reset"><option value="QF" ${(c.reset||"QF")==="QF"?"selected":""}>Après les quarts (norme FIFA)</option><option value="G" ${c.reset==="G"?"selected":""}>Après la phase de poules</option><option value="0" ${c.reset==="0"?"selected":""}>Jamais</option></select></div></div></div>
  <div data-only="championnat"><div class="two"><div class="f"><label for="cpnl">Nombre d'équipes</label><input id="cpnl" name="nbL" type="number" min="2" max="40" value="${esc(c.type==="championnat"?c.nbClubs:10)}"></div>
    <div class="f"><label for="cpm">Formule</label><select id="cpm" name="mode" ${started?"disabled":""}><option value="simple" ${c.mode!=="aller-retour"?"selected":""}>Aller simple</option><option value="aller-retour" ${c.mode==="aller-retour"?"selected":""}>Aller et retour</option></select></div></div>
    <div class="two"><div class="f"><label for="cpv">Points victoire / nul</label><div class="row" style="flex-wrap:nowrap"><input id="cpv" name="v" type="number" min="0" max="10" value="${esc(pts.v)}"><input name="n" type="number" min="0" max="10" value="${esc(pts.n)}" aria-label="Points pour un nul"></div></div><div class="f"><label for="cpdf">Points défaite</label><input id="cpdf" name="d" type="number" min="0" max="10" value="${esc(pts.d)}"></div></div></div>
  <div class="two"><div class="f"><label for="cpmx">Joueurs maximum par équipe</label><input id="cpmx" name="maxPlayers" type="number" min="11" max="40" value="${esc(c.maxPlayers||25)}"></div><div></div></div>
  <div class="two"><div class="f"><label for="cpb1">Joueurs nés le ou après</label><input id="cpb1" name="birthMin" type="date" value="${esc(c.birthMin||"")}"></div><div class="f"><label for="cpb2">Joueurs nés le ou avant</label><input id="cpb2" name="birthMax" type="date" value="${esc(c.birthMax||"")}"></div></div>
  <p class="small muted">Laissez les dates vides si la compétition n'a pas de limite d'âge. Exemple U25 pour 2027 : nés le ou après le 01/01/2003.</p>
  <div class="row" style="justify-content:space-between">${id?`<button type="button" class="btn danger" data-delc>Supprimer la compétition</button>`:"<span></span>"}<div class="row"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">${id?"Enregistrer":"Créer la compétition"}</button></div></div></form>`,
  async fd=>{const type=id?c.type:fd.get("type");const base={nom:fd.get("nom").trim(),lieu:String(fd.get("lieu")||"").trim(),cat:fd.get("cat"),saison:fd.get("saison").trim(),start:fd.get("start"),maxPlayers:Math.max(11,+fd.get("maxPlayers")||25),birthMin:fd.get("birthMin"),birthMax:fd.get("birthMax"),updatedAt:new Date().toISOString()};
    if(base.birthMin&&base.birthMax&&base.birthMin>base.birthMax){toast("Les dates de naissance sont inversées.");return false}
    let d;
    if(type==="tournoi"){const nb=c.locked?+c.nbClubs:+fd.get("nbT");if((c.approved||[]).length>nb){toast(`${(c.approved||[]).length} équipes sont déjà validées : retirez-en avant de réduire ce nombre.`);return false}
      d={...(id?c:{approved:[],entries:[],draw:null,locked:false,createdAt:new Date().toISOString()}),...base,type,nbClubs:nb,reset:fd.get("reset")}}
    else{const nb=+fd.get("nbL");const act=(c.participants||[]).filter(p=>p.status==="valide").length;if(nb<2||nb<act){toast(act?`${act} équipes sont déjà validées : ce nombre ne peut pas être inférieur.`:"Au moins 2 équipes.");return false}
      d={...(id?c:{participants:[],fixtures:[],createdAt:new Date().toISOString()}),...base,type,nbClubs:nb,mode:started?c.mode:fd.get("mode"),pts:{v:+fd.get("v"),n:+fd.get("n"),d:+fd.get("d")}}}
    const nid=id||("c"+uid());const ok=await write(`competitions/${nid}`,d);
    if(ok&&!id){await write("config/current",{edition:nid});ui.inComp=true;ui.ctab="participants";ui.lgTab="participants";ui.preview=null;ui.tab="comps";render();toast("Compétition créée : son lien d'inscription est prêt");setTimeout(async()=>{const go=async()=>{await ensureAllLinks();await createCompGoogle(nid);compLinkModal(nid)};if(formUrl())go();else formUrlForm(go)},60)}else if(ok){toast("Paramètres enregistrés");ensureCompLink(nid)}return ok},
  (root,close)=>{const sel=root.querySelector("#cpt");const sync=()=>root.querySelectorAll("[data-only]").forEach(x=>x.hidden=x.dataset.only!==sel.value);sel.addEventListener("change",sync);sync();
    const del=root.querySelector("[data-delc]");del&&del.addEventListener("click",async()=>{if(!(await askConfirm(`Supprimer définitivement « ${c.nom} » avec ses matchs, tirages, classements et statistiques ? Les clubs et leurs équipes sont conservés.`,"Continuer")))return;close();
      pwModal("Confirmer la suppression",`Saisissez le mot de passe administrateur pour supprimer « ${esc(c.nom)} ».`,()=>deleteCompetition(id),"Supprimer")})});
}
async function deleteCompetition(id){Object.keys(DATA).filter(k=>k===`competitions/${id}`||k.startsWith(`competitions/${id}/`)).forEach(k=>delete DATA[k]);
  if(DATA["config/current"]&&DATA["config/current"].edition===id)delete DATA["config/current"];ui.inComp=false;ui.preview=null;rebuild();persist();render();toast("Compétition supprimée")}

function staffForm(i){
  const cid=ui.club,tid=ui.team,c=S.clubs[cid].teams[tid];const st=clone(c.staff||[]);while(st.length<5)st.push({});const s=st[i]||{};const kine=i>=3;let pp;
  openModal(`<header><h2>${kine?"Kinésithérapeute":"Staff technique"}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  ${pickHTML(s.photo,(s.prenom||"")+" "+(s.nom||""))}
  <div class="f"><label for="sr">Fonction</label><input id="sr" name="role" type="text" maxlength="40" value="${esc(kine?"Kinésithérapeute":(s.role||STAFF_ROLES[i]))}" ${kine?"readonly":""}></div>
  <div class="two"><div class="f"><label for="sp">Prénoms</label><input id="sp" name="prenom" type="text" required maxlength="40" value="${esc(s.prenom||"")}"></div><div class="f"><label for="sn">Nom</label><input id="sn" name="nom" type="text" required maxlength="40" value="${esc(s.nom||"")}"></div></div>
  <div class="two"><div class="f"><label for="st">Téléphone</label><input id="st" name="tel" type="tel" maxlength="30" value="${esc(s.tel||"")}"></div><div class="f"><label for="sq">Diplôme / qualification</label><input id="sq" name="qualif" type="text" maxlength="60" value="${esc(s.qualif||"")}"></div></div>
  <div class="row" style="justify-content:space-between">${s.nom?`<button type="button" class="btn danger" data-clear>Retirer</button>`:"<span></span>"}<div class="row"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit">Enregistrer</button></div></div></form>`,
  async fd=>{const ph=await resolvePhoto(cid,pp,s.photo);st[i]={role:kine?"Kinésithérapeute":(fd.get("role").trim()||STAFF_ROLES[i]),prenom:fd.get("prenom").trim(),nom:fd.get("nom").trim().toUpperCase(),tel:fd.get("tel").trim(),qualif:fd.get("qualif").trim(),photo:ph||null};
    const ok=await saveTeam(cid,tid,{staff:st});ok&&toast("Membre du staff enregistré");return ok},
  (root,close)=>{pp=photoPicker(root,s.photo,(s.prenom||"")+" "+(s.nom||""));const b=root.querySelector("[data-clear]");b&&b.addEventListener("click",async()=>{if(!(await askConfirm("Retirer ce membre du staff ?")))return;dropPhoto(s.photo);st[i]={};await saveTeam(cid,tid,{staff:st});close()})});
}
function playerForm(pid){
  const cid=ui.club,tid=ui.team;const list=clone(((S.clubs[cid].teams||{})[tid]||{}).players||[]);const p=list.find(x=>x.id===pid)||{};let pp;
  openModal(`<header><h2>${pid?"Modifier le joueur":"Ajouter un joueur"}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  ${pickHTML(p.photo,(p.prenom||"")+" "+(p.nom||""))}
  <div class="two"><div class="f"><label for="pp">Prénoms</label><input id="pp" name="prenom" type="text" required maxlength="40" value="${esc(p.prenom||"")}"></div><div class="f"><label for="pn">Nom</label><input id="pn" name="nom" type="text" required maxlength="40" value="${esc(p.nom||"")}"></div></div>
  <div class="two"><div class="f"><label for="pd">Date de naissance</label><input id="pd" name="naissance" type="date" required value="${esc(p.naissance||"")}"></div><div class="f"><label for="pm">N° de maillot</label><input id="pm" name="maillot" type="number" min="1" max="99" required value="${esc(p.maillot||"")}"></div></div>
  <div class="two"><div class="f"><label for="po">Poste</label><select id="po" name="poste">${POSTES.map(x=>`<option ${p.poste===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="f"><label for="pi">Pièce d'identité (n°)</label><input id="pi" name="piece" type="text" maxlength="40" value="${esc(p.piece||"")}"></div></div>
  ${isAdmin()?`<div class="f"><label for="ps">Suspension supplémentaire (commission de discipline)</label><input id="ps" name="suspSup" type="number" min="0" max="20" value="${esc(p.suspSup||0)}"></div>`:""}
  <div class="f"><label>Pièces justificatives (PDF)</label><div class="row" id="docbox"><span id="docstat" class="chip ${p.pieceDoc?"ok":"gold"}">${p.pieceDoc?esc(p.pieceDoc.name||"PDF fourni"):"Aucun PDF"}</span><button type="button" class="btn ghost sm" data-pickdoc>${p.pieceDoc?"Remplacer le PDF":"Charger un PDF"}</button>${p.pieceDoc?`<button type="button" class="btn ghost sm" data-viewdoc>Voir</button><button type="button" class="btn ghost sm" data-rmdoc>Retirer</button>`:""}<input type="file" id="docfile" accept="application/pdf,.pdf" hidden></div><span class="small muted">Un seul PDF regroupant les pièces du joueur (acte de naissance, pièce d'identité…), 5 Mo maximum.</span></div>
  <p class="small" id="elig"></p>
  <div class="row" style="justify-content:space-between">${pid?`<button type="button" class="btn danger" data-delp>Supprimer</button>`:"<span></span>"}<div class="row"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer le joueur">Enregistrer le joueur</button></div></div></form>`,
  async fd=>{const maillot=+fd.get("maillot");if(list.some(x=>x.id!==pid&&+x.maillot===maillot)){toast("Ce numéro de maillot est déjà pris dans cette équipe.");return false}
    if(!pid&&list.length>=TEAM_MAX){toast(`${TEAM_MAX} joueurs maximum par équipe.`);return false}
    const ph=await resolvePhoto(cid,pp,p.photo);
    let pieceDoc=p.pieceDoc||null;
    if(docState.file){try{const b64=await fileToB64(docState.file);const id=uid();await window.ggStore.saveDoc(cid,id,b64);if(pieceDoc)await window.ggStore.deleteDoc(cid,pieceDoc.id);pieceDoc={id,name:docState.file.name,size:docState.file.size,at:new Date().toISOString()}}catch(e){toast("Le PDF n'a pas pu être enregistré.");return false}}
    else if(docState.removed&&pieceDoc){await window.ggStore.deleteDoc(cid,pieceDoc.id);pieceDoc=null}
    const np={pieceDoc,id:pid||uid(),prenom:fd.get("prenom").trim(),nom:fd.get("nom").trim().toUpperCase(),naissance:fd.get("naissance"),maillot,poste:fd.get("poste"),piece:fd.get("piece").trim(),suspSup:isAdmin()?(+fd.get("suspSup")||0):(p.suspSup||0),photo:ph||null};
    const nl=pid?list.map(x=>x.id===pid?np:x):[...list,np];const ok=await saveTeam(cid,tid,{players:nl});ok&&toast(pid?"Joueur modifié":"Joueur ajouté");return ok},
  (root,close)=>{pp=photoPicker(root,p.photo,(p.prenom||"")+" "+(p.nom||""));docState={file:null,removed:false};
    const df=root.querySelector("#docfile"),ds=root.querySelector("#docstat");
    root.querySelector("[data-pickdoc]").addEventListener("click",()=>df.click());
    df.addEventListener("change",async()=>{const f=df.files[0];if(!f)return;if(f.size>5*1024*1024){toast("PDF trop lourd : 5 Mo maximum. Réduisez-le avant de le charger.");df.value="";return}
      const head=new Uint8Array(await f.slice(0,5).arrayBuffer());if(String.fromCharCode(...head)!=="%PDF-"){toast("Ce fichier n'est pas un PDF valide.");df.value="";return}
      docState.file=f;docState.removed=false;ds.className="chip ok";ds.textContent=f.name+" (à enregistrer)"});
    const vb=root.querySelector("[data-viewdoc]");vb&&vb.addEventListener("click",async()=>{if(!(await window.ggStore.openDoc(cid,p.pieceDoc.id)))toast("PDF introuvable sur cet ordinateur.")});
    const rb=root.querySelector("[data-rmdoc]");rb&&rb.addEventListener("click",()=>{docState.removed=true;docState.file=null;ds.className="chip gold";ds.textContent="PDF retiré (à enregistrer)"});
    const dd=root.querySelector("#pd"),el=root.querySelector("#elig");const upd=()=>{el.textContent=dd.value?"Âge actuel : "+ageOf(dd.value):"";el.style.color="var(--muted)"};dd.addEventListener("input",upd);upd();
    const b=root.querySelector("[data-delp]");b&&b.addEventListener("click",async()=>{if(Object.keys(DATA).some(k=>k.includes("/matches/")&&((DATA[k]||{}).events||[]).some(e=>e.player===pid||e.assist===pid))){toast("Ce joueur figure sur des feuilles de match : il ne peut pas être supprimé.");return}if(!(await askConfirm("Supprimer ce joueur ?")))return;dropPhoto(p.photo);if(p.pieceDoc)await window.ggStore.deleteDoc(cid,p.pieceDoc.id);await saveTeam(cid,tid,{players:list.filter(x=>x.id!==pid)});close()})});
}

function matchEditor(n,ctx){
  const m=ctx?ctx.m:R.matches[n];if(!m||!m.c1||!m.c2)return;const ro=!isAdmin();
  const doc=clone(ctx?ctx.doc:S.matches["m"+n])||{};doc.events=doc.events||[];const AP=ctx?ctx.players:allPlayers();const STATS=ctx?ctx.stats:R.players;
  const roster=cid=>playersOf(cid);const pn=id=>{const p=AP[id];return p?`${p.maillot} · ${p.prenom} ${p.nom}`:"Non identifié"};
  const susp=cid=>roster(cid).filter(p=>{const s=STATS[p.id];return s&&s.pending>0&&s.next===n}).map(p=>p.prenom+" "+p.nom);
  const root=$("#modalroot");
  const body=()=>{const [g1,g2]=score(doc,m.c1,m.c2);const evs=doc.events.slice().sort((a,b)=>(+a.min||0)-(+b.min||0));const sp=[...susp(m.c1),...susp(m.c2)];const c1=clubData(m.c1),c2=clubData(m.c2);
    return `<header><h2>${ctx?esc(ctx.title):`M${n} · ${STAGE_NAME[m.stage]}${m.poule?" · Poule "+m.poule:""}`}</h2><button class="x" data-close aria-label="Fermer">×</button></header>
    <div class="mcard" style="cursor:default;margin-bottom:14px">${teamCell(m.c1,"",false)}<span class="score">${g1} – ${g2}</span>${teamCell(m.c2,"",true)}</div>
    ${sp.length?`<div class="notice">Suspendu${sp.length>1?"s":""} pour ce match : ${esc(sp.join(", "))}</div>`:""}
    ${ro?`<p class="small muted">${fmtDay(m.date)} · ${esc(m.heure)}</p>`:`<div class="two"><div class="f"><label for="md">Date</label><input id="md" type="date" value="${esc(doc.date||m.date)}"></div><div class="f"><label for="mh">Heure</label><input id="mh" type="time" value="${esc(doc.heure||m.heure)}"></div></div>`}
    <h3 style="margin:8px 0">Feuille de match</h3>
    ${evs.length?evs.map(e=>{const ico=e.type==="but"||e.type==="csc"?'<span class="evico but">⚽</span>':e.type==="cj"?'<span class="evico cj">J</span>':'<span class="evico rd">R</span>';
      return `<div class="ev">${ico}<span class="cond" style="width:34px;font-weight:700">${e.min?esc(e.min)+"'":""}</span><div style="flex:1;min-width:0"><div style="font-weight:600">${esc(pn(e.player))} <span class="small muted">(${esc(cName(e.club))})</span></div><div class="small muted">${EVT[e.type]}${e.assist?" · passe de "+esc(pn(e.assist)):""}</div></div>${ro?"":`<button class="btn ghost sm" data-rmev="${e.id}">Retirer</button>`}</div>`}).join(""):`<p class="muted small">Aucun événement saisi.</p>`}
    ${ro?"":`<form id="evf" style="margin-top:14px" class="panel"><div class="two"><div class="f"><label for="et">Événement</label><select id="et" name="type">${Object.entries(EVT).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></div><div class="f"><label for="ec">Club du joueur</label><select id="ec" name="club"><option value="${m.c1}">${esc(c1.nom)}</option><option value="${m.c2}">${esc(c2.nom)}</option></select></div></div>
      <div class="two"><div class="f"><label for="ep2">Joueur</label><select id="ep2" name="player"></select></div><div class="f"><label for="em">Minute</label><input id="em" name="min" type="number" min="1" max="130"></div></div>
      <div class="f" id="eaw"><label for="ea2">Passeur décisif</label><select id="ea2" name="assist"></select></div><button class="btn" type="submit">Ajouter à la feuille</button></form>
      ${m.stage!=="G"?`<div class="two" style="margin-top:14px"><div class="f"><label for="t1">Tirs au but ${esc(c1.sigle||c1.nom)}</label><input id="t1" type="number" min="0" max="30" value="${doc.t1??""}"></div><div class="f"><label for="t2">Tirs au but ${esc(c2.sigle||c2.nom)}</label><input id="t2" type="number" min="0" max="30" value="${doc.t2??""}"></div></div><p class="small muted">En cas d'égalité à la fin du temps réglementaire.</p>`:""}
      <label class="row" style="margin:14px 0;gap:10px;cursor:pointer"><input type="checkbox" id="mdone" ${doc.done?"checked":""} style="width:20px;height:20px"><span>Match terminé (le score compte au classement)</span></label>
      <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Fermer</button><button class="btn" data-savem>Enregistrer le match</button></div>`}`};
  const keep=()=>{const g=s=>root.querySelector(s);if(!g("#md"))return;doc.date=g("#md").value;doc.heure=g("#mh").value;doc.done=g("#mdone").checked;if(g("#t1")){const a=g("#t1").value,b=g("#t2").value;doc.t1=a===""?null:+a;doc.t2=b===""?null:+b}};
  const paint=()=>{root.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><div class="sheet">${body()}</div></div>`;hydratePhotos(root);
    root.querySelector(".modal").addEventListener("click",e=>{if(e.target.classList.contains("modal")||e.target.closest("[data-close]"))root.innerHTML=""});if(ro)return;
    const f=root.querySelector("#evf"),et=f.querySelector("#et"),ec=f.querySelector("#ec"),ep=f.querySelector("#ep2"),ea=f.querySelector("#ea2"),eaw=f.querySelector("#eaw");
    const fill=()=>{const r=roster(ec.value);const o=r.map(p=>`<option value="${p.id}">${esc(p.maillot+" · "+p.prenom+" "+p.nom)}</option>`).join("");ep.innerHTML=(et.value==="but"||et.value==="csc"?'<option value="">Non identifié</option>':"")+o;ea.innerHTML='<option value="">Aucun</option>'+o;eaw.hidden=et.value!=="but"};
    et.addEventListener("change",fill);ec.addEventListener("change",fill);fill();
    f.addEventListener("submit",async e=>{e.preventDefault();keep();const fd=new FormData(f);const type=fd.get("type"),player=fd.get("player")||null,assist=type==="but"?(fd.get("assist")||null):null,club=fd.get("club"),min=fd.get("min")||"";
      if(type!=="but"&&type!=="csc"&&!player){toast("Choisissez le joueur concerné.");return}if(assist&&assist===player){toast("Le passeur doit être différent du buteur.");return}
      if(type==="ex2j"&&!doc.events.some(x=>x.type==="cj"&&x.player===player))doc.events.push({id:uid(),type:"cj",club,player,min});
      if(type==="cj"&&doc.events.some(x=>x.type==="cj"&&x.player===player)){if(!(await askConfirm("Ce joueur a déjà un avertissement dans ce match. Enregistrer une exclusion sur 2e jaune ?")))return;doc.events.push({id:uid(),type:"ex2j",club,player,min});paint();return}
      doc.events.push({id:uid(),type,club,player,assist,min});paint()});
    root.querySelectorAll("[data-rmev]").forEach(b=>b.addEventListener("click",()=>{keep();doc.events=doc.events.filter(x=>x.id!==b.dataset.rmev);paint()}));
    root.querySelector("[data-savem]").addEventListener("click",async()=>{keep();const ok=await write(ctx?ctx.path:`competitions/${ED()}/matches/m${n}`,doc);if(ok){toast("Match enregistré");root.innerHTML=""}})};
  paint();
}

/* ================= draw ================= */
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
async function runDraw(){
  const F=fmt(),L="ABCDEFGH".slice(0,F.g).split("");const ids=shuffle(approvedClubs().map(c=>c.id));const res={};ui.preview={};ui.animating=true;ui.sel=null;render();
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;const order=[];for(let k=1;k<=F.size;k++)L.forEach(p=>order.push(p+k));
  for(let i=0;i<ids.length;i++){const code=order[i];res[code]=ids[i];const c=clubData(ids[i]);const drum=$("#drum");
    if(drum){drum.hidden=false;drum.innerHTML=`${crest(c,"lg")}<div><div class="muted" style="font-size:16px;font-family:Manrope,sans-serif">Poule ${code[0]} · ${code}</div>${esc(c.nom)}</div>`;hydratePhotos(drum)}
    if(!reduce)await new Promise(r=>setTimeout(r,ids.length>16?380:620));
    ui.preview={...res};const slot=$("#slot-"+code);if(slot){slot.outerHTML=`<div class="slot reveal" id="slot-${code}"><span class="code">${code}</span>${crest(c,"sm")}<span style="font-weight:600">${esc(c.nom)}</span><span class="sigle" style="margin-left:auto">${esc(c.sigle||"")}</span></div>`;hydratePhotos($("#slot-"+code))}}
  ui.animating=false;render();toast("Tirage effectué. Vérifiez puis validez.");
}
/* ================= events ================= */
async function openComp(id){await write("config/current",{edition:id});ensureCompLink(id);ui.inComp=true;ui.ctab="participants";ui.lgTab="participants";ui.preview=null;ui.sel=null;render();window.scrollTo(0,0)}
async function updEdition(patch){return write(`competitions/${ED()}`,{...edoc(),...patch})}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot")||t.tagName==="SELECT"||t.type==="checkbox")return;const a=t.dataset.act,v=t.dataset.v;
  if(a==="tab"){ui.tab=v;ui.club=null;ui.team=null;if(v==="comps")ui.inComp=ui.inComp&&!!edoc();render();window.scrollTo(0,0)}
  else if(a==="comp-new"&&isAdmin())compForm(null);
  else if(a==="comp-open")openComp(v);
  else if(a==="comp-back"){ui.inComp=false;render()}
  else if(a==="comp-edit"||a==="lg-settings"){if(isAdmin())compForm(ED())}
  else if(a==="ctab"){ui.ctab=v;render()}
  else if(a==="lg-newclub"){ui.tab="clubs";ui.club=null;render()}
  else if(a==="club-new"){if(S.role==="dirigeant")clubForm(S.me,true);else if(isAdmin())clubForm("adm-"+uid(),true)}
  else if(a==="club-open"){ui.club=v;ui.team=null;ui.clubTab=S.role==="dirigeant"?"equipes":"infos";render();window.scrollTo(0,0)}
  else if(a==="club-back"){ui.club=null;ui.team=null;render()}
  else if(a==="clubtab"){ui.clubTab=v;render()}
  else if(a==="club-edit"){if(canEditClub(ui.club))clubForm(ui.club,false)}
  else if(a==="club-del"&&isAdmin()){const cid=ui.club,c=S.clubs[cid];if(!(await askConfirm(`Supprimer définitivement le club ${c.nom}, ses catégories et ses joueurs ?`,"Supprimer")))return;
    if(c.logo)dropPhoto(c.logo);Object.values(c.teams||{}).forEach(t=>{(t.players||[]).forEach(p=>{dropPhoto(p.photo);if(p.pieceDoc)window.ggStore.deleteDoc(cid,p.pieceDoc.id)});(t.staff||[]).forEach(s=>s&&dropPhoto(s.photo))});
    ui.club=null;await remove(`clubreg/${cid}`);toast("Club supprimé")}
  else if(a==="team-new"){if(canEditClub(ui.club))teamForm(ui.club,null)}
  else if(a==="team-open"){ui.team=v;ui.teamTab="joueurs";render();window.scrollTo(0,0)}
  else if(a==="team-back"){ui.team=null;ui.clubTab="equipes";render()}
  else if(a==="teamtab"){ui.teamTab=v;render()}
  else if(a==="team-edit"){if(canEditClub(ui.club))teamForm(ui.club,ui.team)}
  else if(a==="staff-edit"){if(canEditClub(ui.club))staffForm(+v)}
  else if(a==="player-new"){if(canEditClub(ui.club))playerForm(null)}
  else if(a==="player-edit"){if(canEditClub(ui.club))playerForm(v)}
  else if(a==="statstab"){ui.statsTab=v;render()}
  else if(!isAdmin())return;
  else if(a==="t-enlist"){await updEdition({entries:[...new Set([...entries(),v])]});toast("Équipe ajoutée : validez-la pour qu'elle participe")}
  else if(a==="t-validate"){if(approved().length>=nbClubs()){toast(`Le nombre prévu (${nbClubs()}) est atteint.`);return}await updEdition({approved:[...approved(),v],entries:entries().filter(x=>x!==v)});toast("Équipe validée")}
  else if(a==="t-unvalidate"){await updEdition({approved:approved().filter(x=>x!==v),entries:[...new Set([...entries(),v])]})}
  else if(a==="t-unlist"){await updEdition({entries:entries().filter(x=>x!==v)})}
  else if(a==="draw-run")runDraw();
  else if(a==="swap"){if(!ui.sel){ui.sel=v}else{if(ui.sel!==v){const p=ui.preview;[p[ui.sel],p[v]]=[p[v],p[ui.sel]]}ui.sel=null}render()}
  else if(a==="draw-save"){if(!(await askConfirm(`Valider définitivement ce tirage ? Le calendrier des ${buildSchedule().length} matchs sera généré.`,"Valider le tirage")))return;if(await updEdition({draw:ui.preview,locked:true,drawnAt:new Date().toISOString()})){ui.preview=null;toast("Tirage validé")}}
  else if(a==="draw-reset"){if(!(await askConfirm("Annuler le tirage validé ?","Annuler le tirage")))return;if(await updEdition({draw:null,locked:false})){ui.preview=null;render()}}
  else if(a==="match-open")matchEditor(+v);
});
document.addEventListener("change",e=>{if(e.target.dataset&&e.target.dataset.act==="allcats"){ui.allCats=e.target.checked;render()}});
addEventListener("resize",()=>renderNav());

function viewWelcome(){
  return `<div class="authwrap" style="max-width:760px"><div class="authbrand"><img src="icon.png" alt="Logo NARX Foot Manager"><div><b>NARX Foot Manager</b><span>Gestion de compétitions de football</span></div></div>
  <p class="eyebrow">Bienvenue</p><h1 class="authh">Du tirage au sort <span>à la finale.</span></h1><p class="lead">Choisissez comment vous utilisez l'application sur cet appareil. Vous pourrez changer plus tard.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));margin-top:22px;text-align:left">
  <button class="clubcard" data-act="mode-admin" style="display:block;padding:22px"><h3>Organisation du tournoi</h3><p class="small muted" style="margin:6px 0 0">Créer l'édition, choisir le nombre de clubs, valider les clubs, faire le tirage, saisir les matchs et suivre les statistiques.</p></button>
  <button class="clubcard" data-act="mode-dir" style="display:block;padding:22px"><h3>Dirigeant de club</h3><p class="small muted" style="margin:6px 0 0">Remplir uniquement la fiche de votre club (logo, staff, kinés, joueurs et photos) et l'envoyer à l'organisation.</p></button>
  </div></div>`;
}
async function importDossier(o,auto){

    let cid=String(o.clubId||"").replace(/[^A-Za-z0-9_\-.:@+]/g,"");if(!cid||!o.club||!o.club.nom){return "Dossier incomplet."}
    let dup=Object.entries(S.clubs).find(([id,x])=>id!==cid&&((x.nom||"").toLowerCase()===(o.club.nom||"").toLowerCase()||x.sigle===o.club.sigle));
    if(dup&&(dup[1].nom||"").toLowerCase()===(o.club.nom||"").toLowerCase()&&dup[1].sigle===o.club.sigle&&(auto||(await askConfirm(`${o.club.nom} existe déjà dans la base des clubs. Ajouter ce dossier au club existant (recommandé) ?`,"Ajouter au club existant")))){
      const from=cid+"/",to=dup[0]+"/";const fix=r=>r&&String(r).startsWith(from)?to+String(r).slice(from.length):r;
      const re=JSON.parse(JSON.stringify(o.club));re.logo=fix(re.logo);(re.staff||[]).forEach(s=>{if(s)s.photo=fix(s.photo)});(re.players||[]).forEach(p=>p.photo=fix(p.photo));Object.values(re.teams||{}).forEach(t=>{(t.staff||[]).forEach(s=>{if(s)s.photo=fix(s.photo)});(t.players||[]).forEach(p=>p.photo=fix(p.photo))});
      o.club=re;o.photos=Object.fromEntries(Object.entries(o.photos||{}).map(([k,v])=>[fix(k),v]));cid=dup[0];dup=null}
    else if(dup&&!auto&&!(await askConfirm(`Un autre club porte déjà ce nom ou ce sigle (${dup[1].nom}). Importer quand même comme un club distinct ?`,"Importer")))return null;
    const existed=!!S.clubs[cid];const doc=clone(S.clubs[cid])||{teams:{},createdAt:new Date().toISOString()};doc.teams=doc.teams||{};
    const info=["nom","sigle","couleur","quartier","responsable","tel","logo"];
    if((o.v||1)>=3){info.forEach(k=>doc[k]=o.club[k]??null);Object.entries(o.club.teams||{}).forEach(([tid,tm])=>{if(!/^[A-Za-z0-9_-]+$/.test(tid))return;doc.teams[tid]={cat:tm.cat||"Seniors",label:tm.label||"",staff:tm.staff||[],players:keepSusp(doc.teams[tid],tm.players)}})}
    else{info.forEach(k=>{if(o.club[k]!==undefined&&!(k==="logo"&&!o.club[k]&&doc.logo))doc[k]=o.club[k]});const cat=CATS.includes(o.cat)?o.cat:"U25";
      let tid=o.cat?Object.keys(doc.teams).find(k=>doc.teams[k].cat===cat&&!doc.teams[k].label):null;if(!tid)tid=o.cat?("f-"+cat.normalize("NFD").replace(/[^A-Za-z0-9]/g,"").toLowerCase()):("u25-"+String(o.edition||"imp").replace(/[^A-Za-z0-9_-]/g,""));
      doc.teams[tid]={cat:(doc.teams[tid]||{}).cat||cat,label:(doc.teams[tid]||{}).label||"",staff:o.club.staff||[],players:keepSusp(doc.teams[tid],o.club.players)};o.__tid=tid}
    for(const [ref,d] of Object.entries(o.photos||{})){const [c2,p2]=ref.split("/");if(c2===cid&&p2&&typeof d==="string"&&d.startsWith("data:image/"))DATA[`clubreg/${cid}/photos/${p2}`]={d}}
    for(const [id,b] of Object.entries(o.docs||{}))if(/^[A-Za-z0-9_-]+$/.test(id)&&typeof b==="string")await window.ggStore.saveDoc(cid,id,b);
    await write(`clubreg/${cid}`,doc);let extra="";
    if(o.competitionId&&o.__tid&&S.comps[o.competitionId]){const comp=clone(S.comps[o.competitionId]);const key=tkey(cid,o.__tid);
      if(comp.type==="championnat"){if(!(comp.participants||[]).some(p=>p.club===key)){comp.participants=[...(comp.participants||[]),{club:key,status:"inscrit",addedAt:new Date().toISOString()}];await write(`competitions/${o.competitionId}`,comp)}}
      else if(!(comp.approved||[]).includes(key)&&!(comp.entries||[]).includes(key)){comp.entries=[...(comp.entries||[]),key];await write(`competitions/${o.competitionId}`,comp)}
      extra=` · inscrit à ${comp.nom}, en attente de validation`}
    else if(o.competitionId)extra=" · compétition d'origine introuvable : ajoutez l'équipe à la main";
    return (existed?`Dossier de ${o.club.nom} mis à jour`:`${o.club.nom} ajouté à la base des clubs`)+extra;
}
function fullClubPhotoRefs(c){const r=[];if(!c)return r;if(c.logo)r.push(c.logo);Object.values(c.teams||{}).forEach(t=>{(t.staff||[]).forEach(s=>s&&s.photo&&r.push(s.photo));(t.players||[]).forEach(p=>p.photo&&r.push(p.photo))});return r}
const safeName=s=>String(s||"club").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"")||"club";
async function readJSON(exts,type){const t=await window.ggStore.importFile(exts);if(!t)return null;let o;try{o=JSON.parse(t)}catch(e){toast("Ce fichier est illisible.");return null}if(!o||o.type!==type){toast("Ce fichier n'est pas du bon type.");return null}return o}
function keepSusp(oldTeam,players){return(players||[]).map(p=>{const old=((oldTeam||{}).players||[]).find(x=>x.id===p.id);return{...p,suspSup:old?old.suspSup||0:0}})}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;const a=t.dataset.act;
  if(a==="mode-admin"){pwModal("Accès administrateur","L'accès à l'administration est protégé par un mot de passe.",async()=>{ui.unlocked=true;ui.tab="comps";ui.club=null;ui.team=null;await write("local/settings",{mode:"admin",me:(DATA["local/settings"]||DATA["local/me"]||{}).me||("dir-"+uid())})},"Ouvrir l'administration");return}
  if(a==="lock"){ui.unlocked=false;ui.tab="comps";ui.club=null;ui.team=null;render();return}
  if(a==="mode-dir"){ui.tab="clubs";ui.club=null;ui.team=null;await write("local/settings",{mode:"dirigeant",me:(DATA["local/settings"]||DATA["local/me"]||{}).me||("dir-"+uid())});return}
  if(a==="mode-reset"){if(!(await askConfirm("Revenir à l'écran de choix du mode ? Les données restent conservées sur cet ordinateur.","Changer de mode")))return;const st=DATA["local/settings"]||{};delete DATA["local/settings"];DATA["local/me"]={me:st.me};rebuild();persist();ui.tab="comps";ui.club=null;ui.team=null;render();return}
  if(a==="exp-club"){const c=S.clubs[S.me];if(!c)return;const photos={};fullClubPhotoRefs(c).forEach(r=>{if(photoCache[r])photos[r]=photoCache[r]});const docs={};
    for(const tm of Object.values(c.teams||{}))for(const p of tm.players||[])if(p.pieceDoc){const b=await window.ggStore.readDoc(S.me,p.pieceDoc.id);if(b)docs[p.pieceDoc.id]=b}
    const out={type:"ggc-club",v:3,clubId:S.me,club:c,photos,docs,exportedAt:new Date().toISOString()};
    if(await window.ggStore.exportFile(`Dossier-${safeName(c.sigle||c.nom)}.ggc-club`,JSON.stringify(out),"ggc-club"))toast("Dossier club exporté : envoyez-le à l'organisation");return}
  if(!isAdmin())return;
  if(a==="imp-club"){const o=await readJSON(["ggc-club"],"ggc-club");if(!o)return;const m=await importDossier(o,false);if(m)toast(m);return}
  if(a==="exp-backup"){const d={...DATA};delete d["local/settings"];delete d["local/me"];const today=new Date().toISOString().slice(0,10);
    if(await window.ggStore.exportFile(`Sauvegarde-NARX-Foot-Manager-${today}.ggc-backup`,JSON.stringify({type:"ggc-backup",v:3,data:d,docs:await collectDocs(Object.keys(S.clubs))}),"ggc-backup"))toast("Sauvegarde exportée");return}
  if(a==="imp-backup"){const o=await readJSON(["ggc-backup"],"ggc-backup");if(!o)return;if(!(await askConfirm("Remplacer toutes les données de cet ordinateur par cette sauvegarde ?","Restaurer")))return;
    await restoreDocs(o.docs);const st=DATA["local/settings"];DATA={...o.data};if(st)DATA["local/settings"]=st;migrateV2();rebuild();persist();ui.club=null;ui.team=null;ui.inComp=false;render();toast("Sauvegarde restaurée")}
});
async function collectDocs(cids){const out={};for(const cid of cids){const c=S.clubs[cid];if(!c)continue;for(const tm of Object.values(c.teams||{}))for(const p of tm.players||[])if(p.pieceDoc&&!out[cid+"/"+p.pieceDoc.id]){const b=await window.ggStore.readDoc(cid,p.pieceDoc.id);if(b)out[cid+"/"+p.pieceDoc.id]=b}}return out}

const ADMIN_HASH="78d89b2b31d874d962dc5fec3131d99f0d885dee6fbb19b218e0948294e9c498";
let docState={file:null,removed:false};let pwFails=0,pwBlockedUntil=0;
async function sha256(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function checkPw(pw){if(Date.now()<pwBlockedUntil){toast("Trop d'essais. Réessayez dans quelques secondes.");return false}
  if(await sha256(pw)===ADMIN_HASH){pwFails=0;return true}pwFails++;if(pwFails>=5){pwBlockedUntil=Date.now()+30000;pwFails=0;toast("Mot de passe incorrect. Accès bloqué 30 secondes.")}else toast("Mot de passe incorrect.");return false}
function fileToB64(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(",")[1]);r.onerror=rej;r.readAsDataURL(f)})}
function viewLock(){return `<div class="authwrap"><div class="authbrand"><img src="icon.png" alt="Logo NARX Foot Manager"><div><b>NARX Foot Manager</b><span>Gestion de compétitions de football</span></div></div>
  <p class="eyebrow">Connexion</p><h1 class="authh">Votre compétition, <span>partout.</span></h1>
  <form id="lockform" class="panel authcard"><div class="f"><label for="lockpw">Mot de passe administrateur</label><input id="lockpw" name="pw" type="password" autocomplete="current-password" required style="width:100%"></div><button class="btn" type="submit" style="width:100%;justify-content:center">Déverrouiller</button></form>

  <p class="small muted" style="margin-top:18px">Dirigeant de club ? <button class="back" data-act="mode-reset" style="margin:0;display:inline;padding:0;text-decoration:underline">Ouvrir l'espace dirigeant</button></p></div>`}
function pwModal(title,msg,onOk,btn="Valider"){
  openModal(`<header><h2>${title}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form><p class="small">${msg}</p><div class="f"><label for="pwm">Mot de passe administrateur</label><input id="pwm" name="pw" type="password" required style="background:#0B1430;border:1px solid var(--line);border-radius:10px;padding:10px 12px;width:100%;color:#fff"></div><div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="${btn}">${btn}</button></div></form>`,
  async fd=>{if(!(await checkPw(fd.get("pw"))))return false;await onOk();return true});
}
async function restoreDocs(docs){for(const [k,b] of Object.entries(docs||{})){const [cid,id]=k.split("/");if(cid&&id&&typeof b==="string")await window.ggStore.saveDoc(cid,id,b)}}
document.addEventListener("submit",async e=>{if(e.target.id!=="lockform")return;e.preventDefault();const pw=new FormData(e.target).get("pw");if(await checkPw(pw)){ui.unlocked=true;render();toast("Administration déverrouillée")}else{const i=$("#lockpw");i.value="";i.focus()}});

/* ================= partenaires ================= */
const PLEVELS=["Partenaire Titre","Or","Argent","Bronze","Ami du tournoi","Technique","Média","Institutionnel"];
const PSTATUS=["Confirmé","En discussion","Sollicité"];
const PCOLORS={"Partenaire Titre":["#F2B400","#021A62"],"Or":["#FBE25B","#021A62"],"Argent":["#D9E1F2","#021A62"],"Bronze":["#D8A47F","#021A62"],"Ami du tournoi":["#0A3FA8","#fff"],"Technique":["#123E9C","#fff"],"Média":["#123E9C","#fff"],"Institutionnel":["#123E9C","#fff"]};
const fmtMoney=n=>(Math.round(+n||0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,"\u202f")+" FCFA";
const safeUrl=u=>{u=String(u||"").trim();if(!u)return"";if(!/^https?:\/\//i.test(u))u="https://"+u;try{const x=new URL(u);return x.protocol==="https:"||x.protocol==="http:"?x.href:""}catch(e){return""}};
function partnersList(){return Object.entries(S.partners||{}).map(([id,p])=>({id,...p})).sort((a,b)=>PLEVELS.indexOf(a.niveau)-PLEVELS.indexOf(b.niveau)||(a.nom||"").localeCompare(b.nom||"","fr"))}
function plogo(p,size=72){return `<span class="plogo" style="width:${size}px;height:${size}px">${p.logo?`<img src="${esc(p.logo)}" alt="">`:`<b>${esc(initials(p.nom))}</b>`}</span>`}
function viewPartners(){
  const adm=isAdmin();const all=partnersList();const L=adm?all:all.filter(p=>p.statut==="Confirmé");
  let head=`<div class="head"><div><h1>Partenaires</h1><div class="muted">Merci à celles et ceux qui rendent la compétition possible.</div></div>${adm?`<button class="btn" data-act="partner-new">Ajouter un partenaire</button>`:""}</div>`;
  if(adm){const conf=all.filter(p=>p.statut==="Confirmé");const tot=conf.reduce((a,p)=>a+(+p.montant||0),0);
    head+=`<div class="podium"><div class="leader"><div>Partenaires confirmés</div><span class="big">${conf.length}</span></div><div class="leader"><div>En discussion</div><span class="big">${all.filter(p=>p.statut==="En discussion").length}</span></div><div class="leader"><div>Sollicités</div><span class="big">${all.filter(p=>p.statut==="Sollicité").length}</span></div><div class="leader" style="flex-wrap:wrap"><div>Apports financiers confirmés</div><span class="big" style="font-size:26px">${fmtMoney(tot)}</span></div></div><p class="small muted">Vue administrateur : les montants, contacts et partenaires non confirmés ne sont visibles que par l'administration.</p>`}
  if(!L.length)return head+`<div class="empty"><h3>${adm?"Aucun partenaire enregistré":"Les partenaires seront bientôt annoncés"}</h3><p>${adm?"Ajoutez les entreprises, institutions et médias qui soutiennent le tournoi.":"Revenez prochainement pour découvrir celles et ceux qui soutiennent le tournoi."}</p></div>`;
  let body="";
  PLEVELS.forEach(lv=>{const g=L.filter(p=>p.niveau===lv);if(!g.length)return;const [bg,fg]=PCOLORS[lv];const big=lv==="Partenaire Titre";
    body+=`<div class="phase">${esc(lv)}</div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,${big?"420px":"260px"}),1fr))">${g.map(p=>{const url=safeUrl(p.site);const tag=adm?"button":"div";
      return `<${tag} class="pcard" ${adm?`data-act="partner-edit" data-v="${p.id}"`:""} style="border-color:${bg}55">${plogo(p,big?96:64)}<div style="min-width:0;flex:1"><div class="row" style="gap:6px"><span class="chip" style="background:${bg};color:${fg}">${esc(lv)}</span>${adm?`<span class="chip ${p.statut==="Confirmé"?"ok":p.statut==="En discussion"?"gold":""}">${esc(p.statut||"")}</span>`:""}</div>
      <div class="nm" style="font-size:${big?22:17}px;margin-top:6px">${esc(p.nom)}</div>${p.secteur?`<div class="small muted">${esc(p.secteur)}</div>`:""}${p.description?`<div class="small" style="margin-top:6px">${esc(p.description)}</div>`:""}
      ${url&&!adm?`<a class="small" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Site web</a>`:""}
      ${adm?`<div class="small muted" style="margin-top:6px">${p.montant?fmtMoney(p.montant):""}${p.montant&&p.nature?" · ":""}${esc(p.nature||"")}${(p.contact||p.tel)?`<br>Contact : ${esc([p.contact,p.tel,p.email].filter(Boolean).join(" · "))}`:""}</div>`:""}</div></${tag}>`}).join("")}</div>`});
  return head+body;
}
function partnerForm(id){
  const p=id?(S.partners||{})[id]:{statut:"Sollicité",niveau:"Bronze"};let logo=p.logo||null;
  openModal(`<header><h2>${id?"Modifier le partenaire":"Ajouter un partenaire"}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <div class="photo-pick"><span class="plogo pv" style="width:96px;height:96px">${logo?`<img src="${esc(logo)}" alt="">`:`<b>${esc(initials(p.nom))}</b>`}</span><div class="grid" style="gap:8px"><button type="button" class="btn ghost sm" data-plogo>${logo?"Changer le logo":"Ajouter le logo"}</button>${logo?`<button type="button" class="btn ghost sm" data-prmlogo>Retirer</button>`:""}</div><input type="file" id="plfile" accept="image/*" hidden></div>
  <div class="f"><label for="pnm">Nom du partenaire</label><input id="pnm" name="nom" type="text" required maxlength="80" value="${esc(p.nom||"")}"></div>
  <div class="two"><div class="f"><label for="plv">Niveau</label><select id="plv" name="niveau">${PLEVELS.map(x=>`<option ${p.niveau===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="f"><label for="pst">Statut</label><select id="pst" name="statut">${PSTATUS.map(x=>`<option ${p.statut===x?"selected":""}>${x}</option>`).join("")}</select></div></div>
  <div class="f"><label for="psc">Secteur d'activité</label><input id="psc" name="secteur" type="text" maxlength="60" value="${esc(p.secteur||"")}"></div>
  <div class="f"><label for="pds">Présentation publique (affichée à tous)</label><input id="pds" name="description" type="text" maxlength="160" placeholder="Ex. : Fournisseur officiel de l'eau" value="${esc(p.description||"")}"></div>
  <div class="f"><label for="pws">Site web</label><input id="pws" name="site" type="text" maxlength="120" value="${esc(p.site||"")}"></div>
  <p class="small muted" style="margin:4px 0 8px">Réservé à l'administration :</p>
  <div class="two"><div class="f"><label for="pmt">Apport financier (FCFA)</label><input id="pmt" name="montant" type="number" min="0" step="1000" value="${esc(p.montant||"")}"></div><div class="f"><label for="pna">Apport en nature</label><input id="pna" name="nature" type="text" maxlength="80" value="${esc(p.nature||"")}"></div></div>
  <div class="two"><div class="f"><label for="pct">Personne de contact</label><input id="pct" name="contact" type="text" maxlength="60" value="${esc(p.contact||"")}"></div><div class="f"><label for="ptl">Téléphone</label><input id="ptl" name="tel" type="tel" maxlength="30" value="${esc(p.tel||"")}"></div></div>
  <div class="f"><label for="pem">E-mail</label><input id="pem" name="email" type="text" maxlength="80" value="${esc(p.email||"")}"></div>
  <div class="row" style="justify-content:space-between">${id?`<button type="button" class="btn danger" data-pdel>Supprimer</button>`:"<span></span>"}<div class="row"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">Enregistrer</button></div></div></form>`,
  async fd=>{const d={nom:fd.get("nom").trim(),niveau:fd.get("niveau"),statut:fd.get("statut"),secteur:fd.get("secteur").trim(),description:fd.get("description").trim(),site:fd.get("site").trim(),montant:+fd.get("montant")||0,nature:fd.get("nature").trim(),contact:fd.get("contact").trim(),tel:fd.get("tel").trim(),email:fd.get("email").trim(),logo:logo||null,updatedAt:new Date().toISOString()};
    const ok=await write(`partners/${id||uid()}`,d);ok&&toast(id?"Partenaire modifié":"Partenaire ajouté");return ok},
  (root,close)=>{const inp=root.querySelector("#plfile"),pv=root.querySelector(".pv");root.querySelector("[data-plogo]").addEventListener("click",()=>inp.click());
    inp.addEventListener("change",async()=>{const f=inp.files[0];if(!f)return;try{logo=await imageToDataURL(f,240);pv.innerHTML=`<img src="${logo}" alt="">`}catch(e){toast("Image illisible.")}});
    const rm=root.querySelector("[data-prmlogo]");rm&&rm.addEventListener("click",()=>{logo=null;pv.innerHTML=`<b>${esc(initials(p.nom))}</b>`});
    const del=root.querySelector("[data-pdel]");del&&del.addEventListener("click",async()=>{if(!(await askConfirm("Supprimer ce partenaire ?")))return;await remove(`partners/${id}`);close()})});
}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;
  if(t.dataset.act==="partner-new"&&isAdmin())partnerForm(null);else if(t.dataset.act==="partner-edit"&&isAdmin())partnerForm(t.dataset.v)});

/* ================= CHAMPIONNAT ================= */
const LG=()=>S.league||null;
const lgPath=()=>`competitions/${ED()}`;
const lgParts=()=>(LG()&&LG().participants)||[];
const lgActive=()=>lgParts().filter(p=>p.status==="valide").map(p=>p.club);
async function saveLeague(patch){return write(lgPath(),{...(LG()||{}),...patch,updatedAt:new Date().toISOString()})}
function lgDays(){const L=LG()||{};return L.days||[6,0]}
function lgDate(j){const L=LG()||{};if(!L.start)return"";let d=addDays(L.start,(j-1)*7);return d}
function lgFixtureSlot(j,i){const d=lgDate(j);return{date:d?addDays(d,Math.floor(i/2)):"",heure:i%2?"16:30":"14:30"}}
function roundRobin(ids){const t=ids.slice();if(t.length%2)t.push(null);const n=t.length,rounds=[];
  for(let r=0;r<n-1;r++){const pairs=[];for(let i=0;i<n/2;i++){const a=t[i],b=t[n-1-i];if(a&&b)pairs.push(r%2&&i===0?[b,a]:[a,b])}rounds.push(pairs);t.splice(1,0,t.pop())}
  return rounds}
function buildFixtures(ids,mode){const rounds=roundRobin(shuffle(ids.slice()));const all=mode==="aller-retour"?[...rounds,...rounds.map(r=>r.map(([a,b])=>[b,a]))]:rounds;
  const fx=[];let n=0;all.forEach((r,ji)=>r.forEach(([h,a],i)=>{const s=lgFixtureSlot(ji+1,i);fx.push({id:uid(),n:++n,j:ji+1,h,a,date:s.date,heure:s.heure})}));return fx}
function lgCompute(){
  const L=LG();const out={matches:{},list:[],rows:[],players:{},status:{}};if(!L)return out;
  const st={};lgParts().forEach(p=>st[p.club]=p);out.status=st;
  const annul=c=>st[c]&&st[c].status==="retire"&&st[c].retireMode==="annuler";
  const forf=c=>st[c]&&st[c].status==="retire"&&st[c].retireMode==="forfait";
  (L.fixtures||[]).forEach(f=>{const doc=S.lmatches[f.id]||{};const [g1,g2]=score(doc,f.h,f.a);
    let kind="normal";if(annul(f.h)||annul(f.a))kind="annule";else if(!doc.done&&(forf(f.h)||forf(f.a)))kind="forfait";
    let m={n:f.n,id:f.id,j:f.j,stage:"G",c1:f.h,c2:f.a,date:doc.date||f.date,heure:doc.heure||f.heure,done:!!doc.done,g1,g2,events:doc.events||[],kind};
    if(kind==="forfait"){const hl=forf(f.h),al=forf(f.a);m={...m,done:true,g1:hl&&!al?0:(!hl&&al?3:0),g2:al&&!hl?0:(hl&&!al?3:0),events:[]}}
    out.list.push(m);if(kind!=="annule")out.matches[m.n]=m});
  // classement
  const ids=lgParts().filter(p=>p.status==="valide"||(p.status==="retire"&&p.retireMode==="forfait")).map(p=>p.club);
  const pts=L.pts||{v:3,n:1,d:0};const T={};ids.forEach(c=>T[c]={id:c,j:0,g:0,n:0,pe:0,bp:0,bc:0,pts:0,fp:0,retired:st[c].status==="retire"});
  Object.values(out.matches).forEach(m=>{(m.events||[]).forEach(e=>{const t=T[e.club];if(!t)return;if(e.type==="cj")t.fp+=1;if(e.type==="ex2j"||e.type==="rd")t.fp+=3});
    if(!m.done)return;const A=T[m.c1],B=T[m.c2];if(!A||!B)return;A.j++;B.j++;A.bp+=m.g1;A.bc+=m.g2;B.bp+=m.g2;B.bc+=m.g1;
    if(m.g1>m.g2){A.g++;B.pe++;A.pts+=+pts.v;B.pts+=+pts.d}else if(m.g2>m.g1){B.g++;A.pe++;B.pts+=+pts.v;A.pts+=+pts.d}else{A.n++;B.n++;A.pts+=+pts.n;B.pts+=+pts.n}});
  out.rows=Object.values(T).map(t=>({...t,diff:t.bp-t.bc})).sort((a,b)=>(a.retired-b.retired)||b.pts-a.pts||b.diff-a.diff||b.bp-a.bp||a.fp-b.fp||(cName(a.id)||"").localeCompare(cName(b.id)||"","fr"));
  const AP={};lgParts().forEach(p=>((clubData(p.club)||{}).players||[]).forEach(pl=>AP[pl.id]={...pl,club:p.club}));out.AP=AP;
  out.players=playerStats({matches:out.matches},{players:AP,noReset:true});
  return out;
}
let LR=null;
function viewLeague(){
  const L=LG();const adm=isAdmin();
  if(!L)return `<div class="head"><div><h1>Championnat</h1><div class="muted">Un format où tous les clubs se rencontrent, avec un classement unique.</div></div></div>`+(adm?`<div class="panel"><h3>Créer le championnat de l'édition</h3><p class="small muted">Le championnat est indépendant du tournoi : il a ses propres participants, son calendrier, son classement et ses statistiques.</p><button class="btn" data-act="lg-settings">Créer le championnat</button></div>`:`<div class="empty"><h3>Aucun championnat pour cette édition</h3></div>`);
  LR=lgCompute();
  const tabs=[["participants",`Participants (${lgActive().length}/${L.nbClubs})`],["calendrier","Calendrier"],["classement","Classement"],["buteurs","Buteurs"],["passeurs","Passeurs"],["cartons","Cartons"]];
  const t=ui.lgTab||"participants";let body="";
  if(t==="participants")body=lgViewParts();else if(t==="calendrier")body=lgViewCal();else if(t==="classement")body=lgViewTable();else body=lgViewStats(t);
  return `<div class="head"><div><h1>${esc(L.nom||"Championnat")}</h1><div class="muted">${L.mode==="aller-retour"?"Matchs aller et retour":"Matchs aller simple"} · victoire ${L.pts.v} pts, nul ${L.pts.n}, défaite ${L.pts.d}</div></div><div class="row"><button class="btn ghost" data-act="comp-visuals">Visuels de match</button><button class="btn ghost" data-act="comp-export">Exporter PNG / PDF</button>${adm?`<button class="btn" data-act="comp-link">Lien d'inscription</button><button class="btn ghost" data-act="lg-settings">Paramètres</button>`:""}</div></div>
  <div class="seg" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${t===k}" data-act="lgtab" data-v="${k}">${l}</button>`).join("")}</div>${body}`;
}
function lgStatusChip(p){if(p.status==="valide")return`<span class="chip ok">Validé</span>`;if(p.status==="retire")return`<span class="chip bad">Retiré${p.retireMode==="annuler"?" · résultats annulés":p.retireMode==="forfait"?" · forfait":""}</span>`;return`<span class="chip gold">Inscrit · à valider</span>`}
function lgViewParts(){
  const L=LG(),adm=isAdmin();const parts=lgParts();const gen=(L.fixtures||[]).length>0;const played=LR.list.some(m=>m.done&&m.kind==="normal");
  const act=lgActive().length;let html="";
  if(adm){html+=linkPanel()+`<div class="panel" style="margin-bottom:16px"><div class="row between"><div><b>${act} / ${L.nbClubs}</b> clubs validés · ${parts.filter(p=>p.status==="inscrit").length} en attente</div>
    <div class="row">${gen?`<span class="chip ok">Calendrier généré · ${L.fixtures.length} matchs</span>${played?"":`<button class="btn ghost sm" data-act="lg-gen">Régénérer le calendrier</button>`}`:`<button class="btn" data-act="lg-gen" ${act<2?"disabled":""}>Générer le calendrier</button>`}</div></div>
    <p class="small muted" style="margin:8px 0 0">1. Inscrivez les clubs. 2. Validez-les un par un. 3. Générez le calendrier. Vous pouvez ensuite retirer ou ajouter des clubs : le calendrier s'adapte.</p></div>`}
  const list=parts.slice().sort((a,b)=>({valide:0,inscrit:1,retire:2}[a.status]-{valide:0,inscrit:1,retire:2}[b.status])||(cName(a.club)||"").localeCompare(cName(b.club)||"","fr"));
  const shown=adm?list:list.filter(p=>p.status!=="inscrit");
  html+=shown.length?`<div class="grid">${shown.map(p=>{const c=clubData(p.club);return `<div class="person" style="justify-content:space-between;flex-wrap:wrap"><div class="row" style="flex-wrap:nowrap">${crest(c)}<div><div class="sigle">${esc(c?c.sigle:"")}</div><div style="font-weight:600">${esc(c?c.nom:"Club supprimé")}</div>${lgStatusChip(p)}</div></div>
    ${adm?`<div class="row">${p.status==="inscrit"?`<button class="btn sm" data-act="lg-validate" data-v="${p.club}">Valider</button><button class="btn ghost sm" data-act="lg-unlist" data-v="${p.club}">Retirer de la liste</button>`:p.status==="valide"?`<button class="btn danger sm" data-act="lg-retire" data-v="${p.club}">Retirer du championnat</button>`:""}</div>`:""}</div>`}).join("")}</div>`:`<div class="empty">Aucun club ${adm?"inscrit":"validé"} pour l'instant.</div>`;
  if(adm){const avail=compTeamsAvailable(parts.map(p=>p.club));
    html+=`<h3 style="margin:22px 0 10px">Inscrire des clubs</h3><p class="small muted">Clubs enregistrés dans l'édition (validés ou non pour le tournoi). Vous pouvez aussi créer un club uniquement pour le championnat.</p>
    <div class="row" style="margin-bottom:10px"><button class="btn ghost" data-act="lg-newclub">Créer un nouveau club</button></div>
    ${avail.length?`<div class="grid clubs">${avail.map(c=>`<div class="clubcard" style="cursor:default">${crest(c)}<div style="flex:1;min-width:0"><div class="sigle">${esc(c.sigle||"")}</div><div class="nm">${esc(c.nom)}</div></div><button class="btn sm" data-act="lg-enlist" data-v="${c.id}">Inscrire</button></div>`).join("")}</div>`:`<p class="muted small">Tous les clubs de l'édition sont déjà inscrits.</p>`}`}
  return html;
}
function lgViewCal(){
  if(!(LG().fixtures||[]).length)return`<div class="empty"><h3>Calendrier à venir</h3><p>Il sera généré après la validation des clubs.</p></div>`;
  const byJ={};LR.list.forEach(m=>(byJ[m.j]=byJ[m.j]||[]).push(m));let html="";
  Object.keys(byJ).map(Number).sort((a,b)=>a-b).forEach(j=>{const ms=byJ[j];html+=`<div class="phase">Journée ${j}${ms[0].date?` · ${fmtDay(ms[0].date)}`:""}</div>`;
    ms.forEach(m=>{const lab=m.kind==="annule"?"Annulé":m.kind==="forfait"?"Forfait":m.done?"Terminé":(m.events.length?"En cours":"À jouer");
      const sc=m.kind==="annule"?"—":(m.done||m.events.length?`${m.g1} – ${m.g2}`:"vs");
      html+=`<button class="mcard" data-act="lg-match" data-v="${m.n}" ${m.kind==="normal"?"":"disabled"} style="margin-bottom:10px;${m.kind==="annule"?"opacity:.5":""}">${teamCell(m.c1,"",false)}<span class="score">${sc}</span>${teamCell(m.c2,"",true)}<div class="meta"><span>Match ${m.n}</span><span>${m.date?fmtDay(m.date)+" · ":""}${esc(m.heure||"")}</span><span>${lab}</span></div></button>`})});
  return html;
}
function lgViewTable(){
  const rows=LR.rows;if(!rows.length)return`<div class="empty">Le classement apparaîtra après la validation des clubs.</div>`;
  const played=LR.list.filter(m=>m.done&&m.kind!=="annule").length,total=LR.list.filter(m=>m.kind!=="annule").length;
  return `<div class="panel tablewrap"><div class="row between" style="margin-bottom:8px"><h3>Classement général</h3><span class="chip">${played} / ${total} matchs joués</span></div><table><thead><tr><th>#</th><th>Club</th><th class="n">J</th><th class="n hm">G</th><th class="n hm">N</th><th class="n hm">P</th><th class="n hm">BP</th><th class="n hm">BC</th><th class="n">Diff</th><th class="n">FP</th><th class="n">Pts</th></tr></thead><tbody>
  ${rows.map((t,i)=>{const c=clubData(t.id);return `<tr class="${i===0&&!t.retired?"q":""}" style="${t.retired?"opacity:.6":""}"><td>${t.retired?"–":i+1}</td><td><div class="row" style="gap:8px;flex-wrap:nowrap">${crest(c,"sm")}<span>${esc(c?c.sigle||c.nom:"?")}${t.retired?' <span class="chip bad">Retiré</span>':""}</span></div></td><td class="n">${t.j}</td><td class="n hm">${t.g}</td><td class="n hm">${t.n}</td><td class="n hm">${t.pe}</td><td class="n hm">${t.bp}</td><td class="n hm">${t.bc}</td><td class="n">${t.diff>0?"+":""}${t.diff}</td><td class="n muted">${t.fp}</td><td class="n pts">${t.pts}</td></tr>`}).join("")}</tbody></table></div>
  <p class="small muted">Départage : points, différence de buts, buts marqués, fair-play (FP). Un club retiré avec « forfait » garde ses résultats joués ; ses matchs restants sont perdus 0-3. Un club retiré avec « résultats annulés » disparaît du classement et ses matchs ne comptent plus.</p>`;
}
function lgViewStats(t){
  const AP=LR.AP||{};const P=Object.values(LR.players).filter(s=>AP[s.id]);const pn=p=>esc(p.prenom+" "+p.nom);
  if(t==="cartons"){const L=P.filter(s=>s.cj||s.ex||s.rd||s.pending||s.served).sort((a,b)=>(b.pending>0)-(a.pending>0)||(b.cj+3*(b.ex+b.rd))-(a.cj+3*(a.ex+a.rd)));
    return L.length?`<div class="panel tablewrap"><table><thead><tr><th>Joueur</th><th>Club</th><th class="n">CJ</th><th class="n">2e J</th><th class="n">Rouge</th><th class="n">Purgés</th><th class="n">Restant</th><th>Statut</th></tr></thead><tbody>${L.map(s=>{const p=AP[s.id];const stt=s.pending>0?`<span class="chip bad">Suspendu${s.next?" · match "+s.next:""}</span>`:s.statut==="Menacé"?`<span class="chip gold">Menacé</span>`:`<span class="chip ok">Qualifié</span>`;
      return `<tr><td><div class="row" style="gap:8px;flex-wrap:nowrap">${avatar(p.photo,p.prenom+" "+p.nom)}<span>${pn(p)}</span></div></td><td>${esc(cName(p.club))}</td><td class="n">${s.cj}</td><td class="n">${s.ex}</td><td class="n">${s.rd}</td><td class="n">${s.served}</td><td class="n pts">${s.pending}</td><td>${stt}</td></tr>`}).join("")}</tbody></table></div><p class="small muted">Norme FIFA : 2 avertissements dans 2 matchs différents = 1 match de suspension ; exclusion = au moins 1 match. Pas de remise à zéro en championnat.</p>`:`<div class="empty">Aucun carton enregistré.</div>`}
  const key=t==="buteurs"?"buts":"passes",other=key==="buts"?"passes":"buts";const L=P.filter(s=>s[key]>0).sort((a,b)=>b[key]-a[key]||b[other]-a[other]);
  const rank=s=>1+L.filter(x=>x[key]>s[key]||(x[key]===s[key]&&x[other]>s[other])).length;
  return L.length?`<div class="podium">${L.slice(0,3).map(s=>{const p=AP[s.id];return `<div class="leader">${avatar(p.photo,p.prenom+" "+p.nom)}<div><div style="font-weight:600">${pn(p)}</div><div class="small muted">${esc(cName(p.club))}</div></div><span class="big">${s[key]}</span></div>`}).join("")}</div><div class="panel tablewrap"><table><thead><tr><th>#</th><th>Joueur</th><th>Club</th><th class="n">${key==="buts"?"Buts":"Passes"}</th><th class="n">${key==="buts"?"Passes":"Buts"}</th><th class="n">CJ</th><th class="n">CR</th></tr></thead><tbody>${L.map(s=>{const p=AP[s.id];return `<tr><td>${rank(s)}</td><td><div class="row" style="gap:8px;flex-wrap:nowrap">${avatar(p.photo,p.prenom+" "+p.nom)}<span>${pn(p)}</span></div></td><td>${esc(cName(p.club))}</td><td class="n pts">${s[key]}</td><td class="n">${s[other]}</td><td class="n">${s.cj}</td><td class="n">${s.ex+s.rd}</td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty">Aucune donnée pour l'instant.</div>`;
}
function lgSettingsForm(){
  const L=LG()||{};const e=edoc()||{};const pts=L.pts||{v:3,n:1,d:0};const gen=(L.fixtures||[]).length>0;
  openModal(`<header><h2>${LG()?"Paramètres du championnat":"Créer le championnat"}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <div class="f"><label for="lgn">Nom du championnat</label><input id="lgn" name="nom" type="text" required maxlength="60" value="${esc(L.nom||("Championnat "+(e.annee||"")).trim())}"></div>
  <div class="two"><div class="f"><label for="lgc">Nombre de clubs participants</label><input id="lgc" name="nbClubs" type="number" min="2" max="40" required value="${esc(L.nbClubs||10)}"><span class="small muted">Modifiable à tout moment.</span></div>
  <div class="f"><label for="lgm">Formule</label><select id="lgm" name="mode" ${gen?"disabled":""}><option value="simple" ${L.mode!=="aller-retour"?"selected":""}>Aller simple</option><option value="aller-retour" ${L.mode==="aller-retour"?"selected":""}>Aller et retour</option></select>${gen?`<span class="small muted">Fixée une fois le calendrier généré.</span>`:""}</div></div>
  <div class="two"><div class="f"><label for="lgv">Points pour une victoire</label><input id="lgv" name="v" type="number" min="0" max="10" value="${esc(pts.v)}"></div><div class="f"><label for="lgnu">Points pour un nul</label><input id="lgnu" name="n" type="number" min="0" max="10" value="${esc(pts.n)}"></div></div>
  <div class="two"><div class="f"><label for="lgd">Points pour une défaite</label><input id="lgd" name="d" type="number" min="0" max="10" value="${esc(pts.d)}"></div><div class="f"><label for="lgs">Date de la 1re journée</label><input id="lgs" name="start" type="date" value="${esc(L.start||e.start||"")}"></div></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">Enregistrer</button></div></form>`,
  async fd=>{const nb=+fd.get("nbClubs");if(nb<lgActive().length){toast(`${lgActive().length} clubs sont déjà validés : retirez-en avant de réduire ce nombre.`);return false}
    const patch={nom:fd.get("nom").trim(),nbClubs:nb,pts:{v:+fd.get("v"),n:+fd.get("n"),d:+fd.get("d")},start:fd.get("start")};if(!gen)patch.mode=fd.get("mode");
    if(!LG())Object.assign(patch,{participants:[],fixtures:[],createdAt:new Date().toISOString()});
    const ok=await saveLeague(patch);ok&&toast("Championnat enregistré");return ok});
}
function lgAppendFor(club){
  const L=LG();const fx=(L.fixtures||[]).slice();const opps=lgActive().filter(c=>c!==club);let maxJ=fx.reduce((a,f)=>Math.max(a,f.j),0),n=fx.reduce((a,f)=>Math.max(a,f.n),0);
  const legs=L.mode==="aller-retour"?2:1;
  for(let leg=0;leg<legs;leg++)opps.forEach((o,k)=>{const j=++maxJ;const home=(k+leg)%2===0;const s=lgFixtureSlot(j,0);fx.push({id:uid(),n:++n,j,h:home?club:o,a:home?o:club,date:s.date,heure:s.heure,added:true})});
  return fx;
}
function lgRetireModal(club){
  const c=clubData(club);const played=(LG().fixtures||[]).some(f=>(f.h===club||f.a===club)&&(S.lmatches[f.id]||{}).done);
  if(!played){askConfirm(`Retirer ${c?c.nom:"ce club"} du championnat ? Il n'a encore joué aucun match : ses matchs seront supprimés du calendrier.`,"Retirer").then(async ok=>{if(!ok)return;
    const L=LG();const gone=(L.fixtures||[]).filter(f=>f.h===club||f.a===club);gone.forEach(f=>{delete DATA[`competitions/${ED()}/matches/${f.id}`]});
    await saveLeague({participants:lgParts().filter(p=>p.club!==club),fixtures:(L.fixtures||[]).filter(f=>!(f.h===club||f.a===club))});toast("Club retiré du championnat")});return}
  openModal(`<header><h2>Retirer ${esc(c?c.nom:"le club")}</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <p>Ce club a déjà joué des matchs. Que faire de ses résultats ?</p>
  <label class="person" style="cursor:pointer;margin-bottom:10px"><input type="radio" name="mode" value="forfait" checked style="width:20px;height:20px"><span><b>Garder ses résultats joués</b><br><span class="small muted">Ses matchs restants sont déclarés perdus par forfait (0-3).</span></span></label>
  <label class="person" style="cursor:pointer;margin-bottom:14px"><input type="radio" name="mode" value="annuler" style="width:20px;height:20px"><span><b>Annuler tous ses résultats</b><br><span class="small muted">Tous ses matchs sont retirés du classement, comme s'il n'avait jamais participé.</span></span></label>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Retirer le club">Retirer le club</button></div></form>`,
  async fd=>{const ok=await saveLeague({participants:lgParts().map(p=>p.club===club?{...p,status:"retire",retireMode:fd.get("mode"),retiredAt:new Date().toISOString()}:p)});ok&&toast("Club retiré du championnat");return ok});
}
document.addEventListener("click",async e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;const a=t.dataset.act,v=t.dataset.v;
  if(a==="lgtab"){ui.lgTab=v;render();return}
  if(a==="lg-match"){const m=LR&&LR.list.find(x=>x.n===+v);if(!m)return;matchEditor(m.n,{m,doc:S.lmatches[m.id],path:`competitions/${ED()}/matches/${m.id}`,stats:LR.players,players:LR.AP,title:`Match ${m.n} · Journée ${m.j}`});return}
  if(!isAdmin())return;
  if(a==="lg-enlist"){await saveLeague({participants:[...lgParts(),{club:v,status:"inscrit",addedAt:new Date().toISOString()}]});toast("Club inscrit : validez-le pour qu'il participe")}
  else if(a==="lg-unlist"){await saveLeague({participants:lgParts().filter(p=>p.club!==v)})}
  else if(a==="lg-validate"){const L=LG();if(lgActive().length>=+L.nbClubs){toast(`Le nombre prévu (${L.nbClubs}) est atteint. Augmentez-le dans les paramètres pour ajouter ce club.`);return}
    const gen=(L.fixtures||[]).length>0;
    if(gen&&!(await askConfirm(`Le calendrier est déjà généré. Valider ${cName(v)} ajoutera ses matchs contre chaque club validé dans des journées complémentaires. Continuer ?`,"Valider et ajouter les matchs")))return;
    const parts=lgParts().map(p=>p.club===v?{...p,status:"valide",validatedAt:new Date().toISOString()}:p);
    if(gen){S.league={...L,participants:parts};const fx=lgAppendFor(v);await saveLeague({participants:parts,fixtures:fx})}else await saveLeague({participants:parts});toast("Club validé")}
  else if(a==="lg-retire")lgRetireModal(v);
  else if(a==="lg-gen"){const ids=lgActive();if(ids.length<2){toast("Validez au moins deux clubs.");return}
    if((LG().fixtures||[]).length&&!(await askConfirm("Régénérer le calendrier ? L'ordre des matchs sera tiré à nouveau.","Régénérer")))return;
    Object.keys(DATA).filter(k=>k.startsWith(`competitions/${ED()}/matches/`)).forEach(k=>delete DATA[k]);
    await saveLeague({fixtures:buildFixtures(ids,LG().mode),generatedAt:new Date().toISOString()});ui.lgTab="calendrier";render();toast("Calendrier généré")}
});

/* ================= suppression de clubs ================= */
function clubEngagements(cid){return[...new Set(clubTeams(cid).flatMap(t=>teamUsedIn(tkey(cid,t.tid))))]}
function clubDeleteForm(){
  const L=Object.entries(S.clubs).map(([id,c])=>({id,...c})).sort((a,b)=>(a.nom||"").localeCompare(b.nom||"","fr"));
  openModal(`<header><h2>Supprimer des clubs</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <p class="small">Cochez les clubs devenus inutiles. Leur fiche, leurs catégories, leur staff, leurs joueurs, leurs photos et les PDF des pièces seront supprimés définitivement. Un club engagé dans une compétition ne peut pas être supprimé : retirez d'abord ses équipes de la compétition, ou supprimez la compétition.</p>
  <div class="f" style="margin:10px 0"><input type="text" id="cdq" placeholder="Rechercher un club…" aria-label="Rechercher un club"></div>
  <div id="cdlist" style="max-height:46vh;overflow:auto;display:grid;gap:8px">${L.map(c=>{const eng=clubEngagements(c.id);const ts=clubTeams(c.id);
    return `<label class="person" data-name="${esc((c.nom+" "+(c.sigle||"")).toLowerCase())}" style="cursor:${eng.length?"not-allowed":"pointer"};${eng.length?"opacity:.6":""}"><input type="checkbox" name="c" value="${esc(c.id)}" ${eng.length?"disabled":""} style="width:20px;height:20px;flex:none">${crest(c,"sm")}<span style="min-width:0"><b>${esc(c.nom)}</b> <span class="sigle">${esc(c.sigle||"")}</span><br><span class="small muted">${ts.length?ts.map(t=>esc(catLabel(t))).join(", "):"Aucune catégorie"}</span>${eng.length?`<br><span class="small" style="color:var(--gold2)">Engagé dans : ${esc(eng.join(", "))}</span>`:""}</span></label>`}).join("")}</div>
  <p class="small muted" id="cdcount" style="margin:10px 0">Aucun club sélectionné.</p>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn danger" type="submit" data-l="Supprimer la sélection" disabled>Supprimer la sélection</button></div></form>`,
  async fd=>{const ids=fd.getAll("c");if(!ids.length)return false;const names=ids.map(id=>S.clubs[id]&&S.clubs[id].nom).filter(Boolean);
    setTimeout(()=>pwModal("Confirmer la suppression",`Saisissez le mot de passe administrateur pour supprimer définitivement ${ids.length>1?`ces ${ids.length} clubs`:"ce club"} : ${esc(names.join(", "))}.`,()=>deleteClubs(ids),"Supprimer"),0);return true},
  root=>{hydratePhotos(root);const q=root.querySelector("#cdq"),cnt=root.querySelector("#cdcount"),sub=root.querySelector("[type=submit]");
    const upd=()=>{const n=root.querySelectorAll("input[name=c]:checked").length;cnt.textContent=n?`${n} club${n>1?"s":""} sélectionné${n>1?"s":""}.`:"Aucun club sélectionné.";sub.disabled=!n};
    root.querySelector("#cdlist").addEventListener("change",upd);
    q.addEventListener("input",()=>{const v=q.value.trim().toLowerCase();root.querySelectorAll("#cdlist label").forEach(l=>l.hidden=!!v&&!l.dataset.name.includes(v))})});
}
async function deleteClubs(ids){let n=0;
  for(const cid of ids){const c=S.clubs[cid];if(!c||clubEngagements(cid).length)continue;
    const refs=[];if(c.logo)refs.push(c.logo);Object.values(c.teams||{}).forEach(t=>{(t.staff||[]).forEach(s=>s&&s.photo&&refs.push(s.photo));(t.players||[]).forEach(p=>p.photo&&refs.push(p.photo))});
    refs.forEach(r=>{const [c2,p2]=String(r).split("/");const k=`clubreg/${c2}/photos/${p2}`;delete DATA[k];delete photoCache[r];if(db)db.doc(k).delete().catch(()=>{})});
    Object.keys(DATA).filter(k=>k.startsWith(`clubreg/${cid}/`)).forEach(k=>delete DATA[k]);
    for(const t of Object.values(c.teams||{}))for(const p of t.players||[])if(p.pieceDoc)await window.ggStore.deleteDoc(cid,p.pieceDoc.id);
    delete DATA[`clubreg/${cid}`];n++;
    if(ui.club===cid){ui.club=null;ui.team=null}}
  rebuild();const ok=await persist();render();if(ok!==false)toast(n?`${n} club${n>1?"s":""} supprimé${n>1?"s":""}`:"Aucun club supprimé");
}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;if(t.dataset.act==="club-del-pick"&&isAdmin())clubDeleteForm()});

/* ================= lien d'inscription d'une compétition ================= */
const formUrl=()=>((DATA["settings/form"]||{}).url)||"";
function compLink(id){const c=S.comps[id]||{};const u=new URL(formUrl());u.searchParams.set("comp",id);u.searchParams.set("nom",c.nom||"");if(c.cat)u.searchParams.set("cat",c.cat);if(c.birthMin)u.searchParams.set("min",c.birthMin);if(c.birthMax)u.searchParams.set("max",c.birthMax);if(c.gsheet&&c.gsheet.id)u.searchParams.set("sid",c.gsheet.id);return u.toString()}
function compLinkMessage(id){const c=S.comps[id]||{};return `Bonjour,\n\nLes inscriptions pour la compétition « ${c.nom} »${c.cat?` (catégorie ${c.cat})`:""} sont ouvertes.\nInscrivez votre club, votre staff et vos joueurs (photos et pièces en PDF) avec ce lien, depuis un téléphone ou un ordinateur, sans créer de compte :\n${compLink(id)}\n\nÀ la fin, notez bien votre code club : il permet de compléter ou corriger l'inscription.\n\nL'organisation`}
async function copyText(t,el){try{await navigator.clipboard.writeText(t);toast("Copié");return}catch(e){}try{if(el){el.focus();el.select()}if(document.execCommand("copy")){toast("Copié");return}}catch(e){}toast("Sélectionnez le texte puis copiez-le (Ctrl+C ou appui long).")}
function formUrlForm(after){
  openModal(`<header><h2>Adresse du formulaire d'inscription</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <p class="small">À faire une seule fois : collez l'adresse de l'application Web du formulaire Google (Apps Script). Ensuite, chaque nouvelle compétition recevra automatiquement son lien d'inscription. Elle commence par <b>https://script.google.com/</b> et se termine par <b>/exec</b>. Vous la trouvez dans l'éditeur de script : Déployer → Gérer les déploiements.</p>
  <div class="f"><label for="fu">Adresse du formulaire</label><input id="fu" name="url" type="text" required placeholder="https://script.google.com/macros/s/…/exec" value="${esc(formUrl())}"></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">Enregistrer</button></div></form>`,
  async fd=>{const u=String(fd.get("url")).trim();let ok=false;try{const x=new URL(u);ok=x.protocol==="https:"&&/(^|\.)google\.com$/.test(x.hostname)&&/\/exec$/.test(x.pathname)}catch(e){}
    if(!ok){toast("Adresse non reconnue : elle doit commencer par https://script.google.com/ et se terminer par /exec.");return false}
    const r=await write("settings/form",{url:u,updatedAt:new Date().toISOString()});if(r!==false){setTimeout(async()=>{await ensureAllLinks();if(after)after()},0)}return r});
}
function compLinkModal(id){
  if(!S.comps[id])return;if(!formUrl()){formUrlForm(()=>compLinkModal(id));return}
  const c=S.comps[id];const link=compLink(id),msg=compLinkMessage(id);
  openModal(`<header><h2>Lien d'inscription</h2><button class="x" data-close aria-label="Fermer">×</button></header>
  <p class="small">Ce lien a été créé automatiquement pour cette compétition. Envoyez-le aux clubs pour qu'ils s'inscrivent à <b>${esc(c.nom)}</b>${c.cat?` (catégorie <b>${esc(c.cat)}</b>)`:""}. Aucun compte n'est nécessaire. Le formulaire affiche le nom de la compétition${c.cat?", fixe la catégorie":""}${c.birthMin||c.birthMax?" et vérifie les âges":""}.</p>
  <div class="f"><label for="lk">Lien à envoyer</label><input id="lk" type="text" readonly value="${esc(link)}"></div>
  <div class="row" style="margin:6px 0 16px"><button type="button" class="btn" data-copy="lk">Copier le lien</button><a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener noreferrer">Envoyer par WhatsApp</a><a class="btn ghost" href="mailto:?subject=${encodeURIComponent("Inscriptions – "+c.nom)}&body=${encodeURIComponent(msg)}" target="_blank" rel="noopener noreferrer">Envoyer par e-mail</a></div>
  <div class="f"><label for="lm">Message prêt à envoyer</label><textarea id="lm" rows="8" readonly style="background:#0B1430;border:1px solid var(--line);border-radius:10px;padding:10px 12px;width:100%;color:#fff;font:inherit">${esc(msg)}</textarea></div>
  <div class="row" style="justify-content:space-between;margin-top:8px"><button type="button" class="btn ghost sm" data-chgurl>Modifier l'adresse du formulaire</button><div class="row"><button type="button" class="btn ghost" data-copy="lm">Copier le message</button><button type="button" class="btn" data-close>Fermer</button></div></div>
  ${compGoogleHTML()}<p class="small muted" style="margin-top:12px">Les inscriptions reçues arrivent dans la feuille Google de la compétition. Générez puis importez les dossiers (Admin → Importer un dossier club) : chaque équipe est ajoutée automatiquement à cette compétition, en attente de validation.</p>`,null,
  (root,close)=>{root.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",()=>{const el=root.querySelector("#"+b.dataset.copy);copyText(el.value,el)}));
    root.querySelector("[data-chgurl]").addEventListener("click",()=>{close();formUrlForm(()=>compLinkModal(id))})});
}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;if(t.dataset.act==="comp-link"&&isAdmin()&&ED())compLinkModal(ED())});

/* ================= lien automatique par compétition ================= */
async function ensureCompLink(id){if(!isAdmin()||!formUrl())return;const c=S.comps[id];if(!c)return;let l;try{l=compLink(id)}catch(e){return}if(c.link!==l)await write(`competitions/${id}`,{...c,link:l})}
async function ensureAllLinks(){for(const id of Object.keys(S.comps))await ensureCompLink(id)}
function linkPanel(){
  if(!isAdmin()||!ED())return"";const c=edoc();const link=c.link||(formUrl()?compLink(ED()):"");
  if(!link)return `<div class="panel" style="margin-bottom:16px;border-color:rgba(61,123,247,.45)"><b>Lien d'inscription des clubs</b><p class="small" style="margin:6px 0 10px">Indiquez une fois l'adresse de votre formulaire Google : chaque compétition aura alors automatiquement son propre lien d'inscription.</p><button class="btn" data-act="lk-setup">Configurer l'adresse du formulaire</button></div>`;
  return `<div class="panel" style="margin-bottom:16px;border-color:rgba(61,123,247,.45)"><div class="row between" style="margin-bottom:8px"><b>Lien d'inscription des clubs</b><span class="small muted">Propre à cette compétition, créé automatiquement</span></div>
  <div class="row" style="flex-wrap:nowrap"><input id="lkp" type="text" readonly value="${esc(link)}" aria-label="Lien d'inscription" style="flex:1;min-width:0"><button class="btn sm" data-act="lk-copy">Copier</button></div>
  <div class="row" style="margin-top:8px"><a class="btn ghost sm" href="https://wa.me/?text=${encodeURIComponent(compLinkMessage(ED()))}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="btn ghost sm" href="mailto:?subject=${encodeURIComponent("Inscriptions – "+c.nom)}&body=${encodeURIComponent(compLinkMessage(ED()))}" target="_blank" rel="noopener noreferrer">E-mail</a><button class="btn ghost sm" data-act="comp-link">Message complet</button><button class="btn ghost sm" data-act="lk-setup">Modifier l'adresse du formulaire</button><button class="btn sm" data-act="form-sync" style="margin-left:auto">Récupérer les inscriptions</button></div>${compGoogleHTML()}</div>`;
}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot")||!isAdmin())return;
  if(t.dataset.act==="lk-copy"){const el=$("#lkp");if(el)copyText(el.value,el)}
  else if(t.dataset.act==="lk-setup")formUrlForm(async()=>{await ensureAllLinks();render()})});

/* ================= EXPORTS PNG / PDF ================= */
const XC={bg:"#0A1330",bg2:"#0E1A42",card:"#111D42",line:"#22336B",blue:"#3D7BF7",blue2:"#5A8FFA",lblue:"#9CC0FF",ink:"#FFFFFF",muted:"#9AA9D1",green:"#8BC34A",red:"#D43B3B",bad:"#FF6464",warn:"#F2B400",white:"#FFFFFF",
  navy:"#0A1330",royal:"#3D7BF7",gold:"#3D7BF7",lgold:"rgba(61,123,247,.16)",lblue2:"rgba(255,255,255,.03)"};
const XF='"Manrope", "Segoe UI", Arial, sans-serif',XFC='"Bricolage Grotesque", "Manrope", Arial, sans-serif';
async function xFonts(){try{await Promise.all(['800 40px "Bricolage Grotesque"','700 40px "Bricolage Grotesque"','500 16px "Manrope"','600 16px "Manrope"','700 16px "Manrope"','800 16px "Manrope"'].map(f=>document.fonts.load(f)));await document.fonts.ready}catch(e){}}
/* fond « nuit bleue » : dégradé marine + halo bleu en bas à droite */
function xBg(c,W,H){c.fillStyle=XC.bg;c.fillRect(0,0,W,H);const l=c.createLinearGradient(0,0,0,H);l.addColorStop(0,"#0B1533");l.addColorStop(1,"#0E1A42");c.fillStyle=l;c.fillRect(0,0,W,H);
  const R=Math.max(W,H);const g=c.createRadialGradient(W*.92,H*.9,10,W*.92,H*.9,R*.75);g.addColorStop(0,"rgba(45,90,200,.55)");g.addColorStop(1,"rgba(45,90,200,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
  const g2=c.createRadialGradient(0,0,10,0,0,R*.6);g2.addColorStop(0,"rgba(20,34,82,.85)");g2.addColorStop(1,"rgba(20,34,82,0)");c.fillStyle=g2;c.fillRect(0,0,W,H)}
/* texte en capitales espacées (sur-titres) */
function xSpaced(c,t,x,y,sp,align="left"){t=String(t||"");const ws=[...t].map(ch=>c.measureText(ch).width);const tot=ws.reduce((a,b)=>a+b,0)+sp*Math.max(0,t.length-1);
  let cx=align==="center"?x-tot/2:align==="right"?x-tot:x;const sa=c.textAlign;c.textAlign="left";[...t].forEach((ch,i)=>{c.fillText(ch,cx,y);cx+=ws[i]+sp});c.textAlign=sa;return tot}
function xSpacedW(c,t,sp){t=String(t||"");return [...t].reduce((a,ch)=>a+c.measureText(ch).width,0)+sp*Math.max(0,t.length-1)}
/* sur-titre : trait rouge + capitales espacées bleu clair */
function xEyebrow(c,t,x,y,size=14,align="left",color=XC.lblue){c.font=`700 ${size}px ${XF}`;const sp=size*.2,dw=size*2.4,gap=size*.9;let txt=String(t||"").toUpperCase();
  const tw=xSpacedW(c,txt,sp);const tot=dw+gap+tw;let x0=align==="center"?x-tot/2:align==="right"?x-tot:x;
  c.fillStyle=XC.red;rr(c,x0,y-size*.42,dw,Math.max(3,size*.2),2);c.fill();c.fillStyle=color;xSpaced(c,txt,x0+dw+gap,y,sp);return tot}
function xPill(c,t,x,y,h,{bg="rgba(61,123,247,.18)",fg=XC.lblue,dot=null,size=16,weight=700,border=null,align="left"}={}){c.font=`${weight} ${size}px ${XF}`;const dw=dot?h*.26:0,padX=h*.45;const w=c.measureText(t).width+padX*2+(dot?dw+h*.25:0);
  const x0=align==="center"?x-w/2:align==="right"?x-w:x;rr(c,x0,y,w,h,h/2);c.fillStyle=bg;c.fill();if(border){c.lineWidth=2;c.strokeStyle=border;c.stroke()}
  let tx=x0+padX;if(dot){c.beginPath();c.arc(tx+dw/2,y+h/2,dw/2,0,Math.PI*2);c.fillStyle=dot;c.fill();tx+=dw+h*.25}c.fillStyle=fg;c.textAlign="left";c.fillText(t,tx,y+h/2+size*.36);return w}
const XLOGO="data:image/jpeg;base64,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";
function xLogo(){return new Promise(res=>{const src=XLOGO;const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})}
function xDark(h){const m=/^#?([0-9a-f]{6})$/i.exec(String(h||""));if(!m)return false;const n=parseInt(m[1],16),r=n>>16,g=(n>>8)&255,b=n&255;return(0.299*r+0.587*g+0.114*b)<140}
function xFit(ctx,t,w){t=String(t??"");if(ctx.measureText(t).width<=w)return t;while(t.length>1&&ctx.measureText(t+"…").width>w)t=t.slice(0,-1);return t+"…"}
/* spec = {title, sub, blocks:[{heading, cols:[{l,w,a}], rows:[[...]], hl:[index], note}], grid:1|2} */
async function drawSheet(spec){
  await xFonts();
  const S2=2,W=1200,pad=44,grid=spec.grid||1,gap=24,bw=(W-pad*2-gap*(grid-1))/grid,rowH=40,headH=38,ip=20;
  const blockH=b=>ip*2+(b.heading?50:0)+headH+Math.max(1,b.rows.length)*rowH+(b.note?34:0)+gap;
  const cols=[];for(let i=0;i<grid;i++)cols.push(0);const pos=[];
  spec.blocks.forEach(b=>{let k=cols.indexOf(Math.min(...cols));pos.push({x:pad+k*(bw+gap),y:cols[k]});cols[k]+=blockH(b)});
  const top=196,H=top+Math.max(...cols)+70;
  const cv=document.createElement("canvas");cv.width=W*S2;cv.height=H*S2;const c=cv.getContext("2d");c.scale(S2,S2);
  xBg(c,W,H);
  // en-tête
  const logo=await xLogo();const LS=78;if(logo){c.save();c.beginPath();c.arc(pad+LS/2,34+LS/2,LS/2,0,Math.PI*2);c.clip();c.drawImage(logo,pad,34,LS,LS);c.restore()}
  const tx=logo?pad+LS+22:pad;xEyebrow(c,spec.kicker||"NARX Foot Manager",tx,52,14);
  c.fillStyle=XC.white;c.font=`800 40px ${XFC}`;c.textAlign="left";c.fillText(xFit(c,spec.title,W-tx-pad),tx,98);
  c.fillStyle=XC.muted;c.font=`500 17px ${XF}`;c.fillText(xFit(c,spec.sub||"",W-tx-pad),tx,130);
  c.fillStyle=XC.line;c.fillRect(pad,164,W-pad*2,1.5);
  // blocs
  spec.blocks.forEach((b,bi)=>{let {x,y}=pos[bi];y+=top;const ch=blockH(b)-gap;
    c.save();rr(c,x,y,bw,ch,24);const cg=c.createLinearGradient(0,y,0,y+ch);cg.addColorStop(0,"rgba(20,33,74,.96)");cg.addColorStop(1,"rgba(13,22,52,.96)");c.fillStyle=cg;c.fill();c.lineWidth=1.5;c.strokeStyle=XC.line;c.stroke();c.restore();
    const ix=x+ip,iw=bw-ip*2;y+=ip;
    if(b.heading){c.textAlign="left";c.fillStyle=XC.white;c.font=`800 26px ${XFC}`;c.fillText(xFit(c,b.heading,iw),ix,y+28);y+=50}
    const tot=b.cols.reduce((a,k)=>a+k.w,0);const ws=b.cols.map(k=>k.w/tot*iw);
    c.font=`700 11.5px ${XF}`;c.fillStyle=XC.lblue;
    let cx=ix;b.cols.forEach((k,i)=>{const al=k.a||"l";const lab=String(k.l||"").toUpperCase();const lw=xSpacedW(c,lab,1.6);const px=al==="c"?cx+ws[i]/2:al==="r"?cx+ws[i]-10:cx+10;
      if(lw<=ws[i]-8)xSpaced(c,lab,px,y+24,1.6,al==="c"?"center":al==="r"?"right":"left");else{c.textAlign=al==="c"?"center":al==="r"?"right":"left";c.fillText(xFit(c,lab,ws[i]-8),px,y+24)}cx+=ws[i]});
    c.fillStyle=XC.line;c.fillRect(ix,y+headH-1.5,iw,1.5);y+=headH;
    if(!b.rows.length){c.textAlign="left";c.fillStyle=XC.muted;c.font=`500 15px ${XF}`;c.fillText(b.empty||"Aucune donnée pour l'instant.",ix+10,y+26);y+=rowH}
    b.rows.forEach((r,ri)=>{const hl=(b.hl||[]).includes(ri);
      if(hl){c.fillStyle="rgba(61,123,247,.15)";rr(c,ix,y+3,iw,rowH-6,10);c.fill();c.fillStyle=XC.blue;rr(c,ix,y+8,3.5,rowH-16,2);c.fill()}
      else if(ri<b.rows.length-1){c.fillStyle="rgba(34,51,107,.7)";c.fillRect(ix+8,y+rowH-1,iw-16,1)}
      let cx=ix;r.forEach((v,i)=>{const k=b.cols[i]||{};const al=k.a||"l";c.textAlign=al==="c"?"center":al==="r"?"right":"left";const px=al==="c"?cx+ws[i]/2:al==="r"?cx+ws[i]-10:cx+10;
        const isObj=v&&typeof v==="object";const txt=isObj?v.t:v;c.fillStyle=isObj&&v.color?v.color:XC.ink;c.font=k.big?`800 20px ${XFC}`:`${(isObj&&v.b)||k.b?700:500} 15px ${XF}`;
        if(isObj&&v.chip){const sw=34;const sx=cx+8;c.fillStyle=v.chip;rr(c,sx,y+8,sw,rowH-16,7);c.fill();c.fillStyle=xDark(v.chip)?XC.white:"#0A1330";c.font=`800 10.5px ${XF}`;c.textAlign="center";c.fillText(xFit(c,v.sig||"",sw-4),sx+sw/2,y+rowH/2+4);c.textAlign="left";c.fillStyle=XC.ink;c.font=`700 15px ${XF}`;c.fillText(xFit(c,txt,ws[i]-sw-24),sx+sw+10,y+26)}
        else c.fillText(xFit(c,txt,ws[i]-14),px,y+26);cx+=ws[i]});y+=rowH});
    c.textAlign="left";if(b.note){c.fillStyle=XC.muted;c.font=`500 13px ${XF}`;c.fillText(xFit(c,b.note,iw),ix,y+24)}});
  c.textAlign="left";c.fillStyle=XC.line;c.fillRect(pad,H-48,W-pad*2,1.5);c.fillStyle=XC.muted;c.font=`600 13px ${XF}`;
  c.fillText(`NARX Foot Manager · ${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`,pad,H-22);
  c.textAlign="right";c.fillText(spec.foot||"Normes FIFA / IFAB",W-pad,H-22);c.textAlign="left";
  return cv;
}
function b64ToBytes(b){const s=atob(b);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}
function canvasPNG(cv){return b64ToBytes(cv.toDataURL("image/png").split(",")[1])}
/* PDF minimal : une image JPEG par page A4, découpée si le contenu est long */
function canvasPDF(cv){
  const PW=595.28,PH=841.89,M=24,iw=PW-2*M,scale=iw/cv.width,sliceH=Math.floor((PH-2*M)/scale);
  const pages=[];for(let y=0;y<cv.height;y+=sliceH){const h=Math.min(sliceH,cv.height-y);const p=document.createElement("canvas");p.width=cv.width;p.height=h;const x=p.getContext("2d");x.fillStyle="#0A1330";x.fillRect(0,0,p.width,h);x.drawImage(cv,0,y,cv.width,h,0,0,cv.width,h);pages.push({jpg:b64ToBytes(p.toDataURL("image/jpeg",0.92).split(",")[1]),w:p.width,h})}
  const enc=new TextEncoder();const parts=[];let len=0;const offs=[];const add=d=>{const u=typeof d==="string"?enc.encode(d):d;parts.push(u);len+=u.length};
  const obj=(n,body)=>{offs[n]=len;add(`${n} 0 obj\n`);body();add("\nendobj\n")};
  add("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");const N=pages.length;const kids=pages.map((_,i)=>`${3+i*3} 0 R`).join(" ");
  obj(1,()=>add("<< /Type /Catalog /Pages 2 0 R >>"));obj(2,()=>add(`<< /Type /Pages /Kids [${kids}] /Count ${N} >>`));
  pages.forEach((pg,i)=>{const po=3+i*3,io=po+1,co=po+2;const dw=iw,dh=pg.h*scale;const cs=`0.039 0.075 0.188 rg 0 0 ${PW} ${PH} re f q ${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${M} ${(PH-M-dh).toFixed(2)} cm /Im0 Do Q`;
    obj(po,()=>add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${io} 0 R >> >> /Contents ${co} 0 R >>`));
    obj(io,()=>{add(`<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpg.length} >>\nstream\n`);add(pg.jpg);add("\nendstream")});
    obj(co,()=>add(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`))});
  const xref=len;const n=2+N*3+1;let x=`xref\n0 ${n}\n0000000000 65535 f \n`;for(let i=1;i<n;i++)x+=String(offs[i]).padStart(10,"0")+" 00000 n \n";add(x);add(`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const out=new Uint8Array(len);let o=0;parts.forEach(p=>{out.set(p,o);o+=p.length});return out;
}
function bytesToB64(u){let s="";for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
async function saveBinary(name,bytes,ext){
  if(window.ggStore&&window.ggStore.exportBinary)return window.ggStore.exportBinary(name,bytesToB64(bytes),ext);
  if(typeof dl!=="undefined"&&dl){try{await dl.save({filename:name,data:bytes});return true}catch(e){if(!(e&&e.code==="declined"))toast("Téléchargement impossible pour le moment.");return false}}
  toast("Le téléchargement n'est pas disponible dans cette vue.");return false;
}
/* ---- contenus exportables ---- */
const xTeam=k=>{const t=clubData(k);return t?{t:t.nom+(t.catName&&!edoc().cat?" · "+t.catName:""),chip:t.couleur||XC.gold,sig:t.sigle||""}:{t:"—"}};
function xStandRows(rows){return rows.map((t,i)=>[t.retired?"–":String(i+1),xTeam(t.id),t.j,t.g,t.n,t.pe,t.bp,t.bc,(t.diff>0?"+":"")+t.diff,t.fp,{t:String(t.pts),b:true}])}
const xStandCols=[{l:"#",w:5,a:"c"},{l:"Équipe",w:34},{l:"J",w:5,a:"c"},{l:"G",w:5,a:"c"},{l:"N",w:5,a:"c"},{l:"P",w:5,a:"c"},{l:"BP",w:6,a:"c"},{l:"BC",w:6,a:"c"},{l:"Diff",w:7,a:"c"},{l:"FP",w:6,a:"c"},{l:"Pts",w:7,a:"c",big:true}];
function xPlayerRows(stats,AP,key){
  const other=key==="buts"?"passes":"buts";const L=Object.values(stats).filter(s=>AP[s.id]&&s[key]>0).sort((a,b)=>b[key]-a[key]||b[other]-a[other]);
  const rank=s=>1+L.filter(x=>x[key]>s[key]||(x[key]===s[key]&&x[other]>s[other])).length;
  return L.map(s=>{const p=AP[s.id];const t=clubData(p.club)||{};return[String(rank(s)),{t:`${p.prenom} ${p.nom}`,b:true},{t:t.nom||"",chip:t.couleur||XC.gold,sig:t.sigle||""},{t:String(s[key]),b:true},s[other],s.cj,s.ex+s.rd]})}
function xCardRows(stats,AP){const L=Object.values(stats).filter(s=>AP[s.id]&&(s.cj||s.ex||s.rd||s.pending||s.served)).sort((a,b)=>(b.pending>0)-(a.pending>0)||(b.cj+3*(b.ex+b.rd))-(a.cj+3*(a.ex+a.rd)));
  return L.map(s=>{const p=AP[s.id];const t=clubData(p.club)||{};return[{t:`${p.prenom} ${p.nom}`,b:true},{t:t.nom||"",chip:t.couleur||XC.gold,sig:t.sigle||""},s.cj,s.ex,s.rd,s.served,{t:String(s.pending),b:true},s.pending>0?{t:"Suspendu"+(s.next?" · match "+s.next:""),color:XC.bad,b:true}:s.statut==="Menacé"?{t:"Menacé",color:"#F2B400",b:true}:"Qualifié"]})}
function exportItems(){
  const c=edoc();if(!c)return[];const kicker=`${c.type==="championnat"?"Championnat":"Tournoi"}${c.cat?" · "+c.cat:""}${c.saison?" · "+c.saison:""}`;const base={kicker,title:c.nom};const items=[];
  const pCols=k=>[{l:"#",w:6,a:"c"},{l:"Joueur",w:30},{l:"Équipe",w:30},{l:k==="buts"?"Buts":"Passes",w:9,a:"c",big:true},{l:k==="buts"?"Passes":"Buts",w:9,a:"c"},{l:"CJ",w:7,a:"c"},{l:"CR",w:7,a:"c"}];
  const cCols=[{l:"Joueur",w:24},{l:"Équipe",w:24},{l:"CJ",w:6,a:"c"},{l:"2e J",w:6,a:"c"},{l:"Rouge",w:7,a:"c"},{l:"Purgés",w:8,a:"c"},{l:"Restant",w:8,a:"c"},{l:"Statut",w:17}];
  if(c.type==="championnat"){const LRx=lgCompute();
    items.push({id:"classement",label:"Classement général",spec:()=>({...base,sub:"Classement général",blocks:[{cols:xStandCols,rows:xStandRows(LRx.rows),hl:[0],note:"Départage : points, différence de buts, buts marqués, fair-play (FP)."}]})});
    const js=[...new Set(LRx.list.map(m=>m.j))].sort((a,b)=>a-b);
    const jBlock=j=>({heading:`Journée ${j}`,cols:[{l:"N°",w:7,a:"c"},{l:"Date",w:16},{l:"Domicile",w:32},{l:"Score",w:12,a:"c",big:true},{l:"Extérieur",w:32}],rows:LRx.list.filter(m=>m.j===j).map(m=>[m.n,(m.date?fmtDate(m.date):"")+(m.heure?" "+m.heure:""),xTeam(m.c1),{t:m.kind==="annule"?"Annulé":(m.done?`${m.g1} - ${m.g2}`:"-"),b:true},xTeam(m.c2)])});
    if(js.length){items.push({id:"calendrier",label:"Calendrier et résultats (complet)",spec:()=>({...base,sub:"Calendrier et résultats",blocks:js.map(jBlock)})});js.forEach(j=>items.push({id:"j"+j,label:`Journée ${j}`,group:"Journées",spec:()=>({...base,sub:`Journée ${j}`,blocks:[jBlock(j)]})}))}
    items.push({id:"buteurs",label:"Classement des buteurs",spec:()=>({...base,sub:"Classement des buteurs",blocks:[{cols:pCols("buts"),rows:xPlayerRows(LRx.players,LRx.AP,"buts"),hl:[0]}]})});
    items.push({id:"passeurs",label:"Classement des passeurs",spec:()=>({...base,sub:"Classement des passeurs décisifs",blocks:[{cols:pCols("passes"),rows:xPlayerRows(LRx.players,LRx.AP,"passes"),hl:[0]}]})});
    items.push({id:"cartons",label:"Cartons et suspensions",spec:()=>({...base,sub:"Cartons et suspensions",blocks:[{cols:cCols,rows:xCardRows(LRx.players,LRx.AP),note:"Norme FIFA : 2 avertissements dans 2 matchs différents = 1 match de suspension ; exclusion = au moins 1 match."}]})});
    return items}
  compute();const d=draw()||ui.preview;const L="ABCDEFGH".slice(0,fmt().g).split("");const AP=allPlayers();
  const drawBlock=p=>({heading:`Poule ${p}`,cols:[{l:"Code",w:14,a:"c"},{l:"Équipe",w:62},{l:"Sigle",w:24,a:"c"}],rows:d?Array.from({length:fmt().size},(_,k)=>{const code=p+(k+1),id=d[code],t=id&&clubData(id);return[code,id?xTeam(id):"—",t?t.sigle||"":""]}):[],empty:"Tirage pas encore effectué."});
  items.push({id:"tirage",label:"Tirage – toutes les poules",spec:()=>({...base,sub:"Tirage au sort des poules",grid:2,blocks:L.map(drawBlock)})});
  L.forEach(p=>items.push({id:"tir"+p,label:`Tirage – poule ${p}`,group:"Tirage par poule",spec:()=>({...base,sub:`Tirage au sort · Poule ${p}`,blocks:[drawBlock(p)]})}));
  const stBlock=p=>({heading:`Poule ${p}${R.pouleDone[p]?" · terminée":""}`,cols:xStandCols,rows:xStandRows(R.standings[p]||[]),hl:[0,1]});
  items.push({id:"classements",label:"Classements – toutes les poules",spec:()=>({...base,sub:"Classements des poules",blocks:L.map(stBlock).map(b=>({...b,note:""})),foot:"Les deux premiers se qualifient · Normes FIFA / IFAB"})});
  L.forEach(p=>items.push({id:"cl"+p,label:`Classement – poule ${p}`,group:"Classement par poule",spec:()=>({...base,sub:`Classement · Poule ${p}`,blocks:[{...stBlock(p),note:"Départage : points, confrontation directe, différence de buts, buts marqués, fair-play (FP)."}]})}));
  const Ms=Object.values(R.matches).sort((a,b)=>a.n-b.n);const stages=[...new Set(Ms.map(m=>m.stage))];
  items.push({id:"resultats",label:"Calendrier et résultats",spec:()=>({...base,sub:"Calendrier et résultats",blocks:stages.map(st=>({heading:STAGE_NAME[st],cols:[{l:"M",w:6,a:"c"},{l:"Date",w:16},{l:"Équipe 1",w:32},{l:"Score",w:14,a:"c",big:true},{l:"Équipe 2",w:32}],
    rows:Ms.filter(m=>m.stage===st).map(m=>[m.n,(m.date?fmtDate(m.date):"")+(m.heure?" "+m.heure:""),m.c1?xTeam(m.c1):(m.l1||"—"),{t:m.done?`${m.g1} - ${m.g2}${m.t1!=null&&m.g1===m.g2&&st!=="G"?` (tab ${m.t1}-${m.t2})`:""}`:"-",b:true},m.c2?xTeam(m.c2):(m.l2||"—")])}))})});
  items.push({id:"buteurs",label:"Classement des buteurs",spec:()=>({...base,sub:"Classement des buteurs",blocks:[{cols:pCols("buts"),rows:xPlayerRows(R.players,AP,"buts"),hl:[0]}]})});
  items.push({id:"passeurs",label:"Classement des passeurs",spec:()=>({...base,sub:"Classement des passeurs décisifs",blocks:[{cols:pCols("passes"),rows:xPlayerRows(R.players,AP,"passes"),hl:[0]}]})});
  items.push({id:"cartons",label:"Cartons et suspensions",spec:()=>({...base,sub:"Cartons et suspensions",blocks:[{cols:cCols,rows:xCardRows(R.players,AP),note:"Norme FIFA : 2 avertissements dans 2 matchs différents = 1 match de suspension ; exclusion = au moins 1 match."}]})});
  return items;
}
const xSafe=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"");
async function runExport(item,kind){toast("Préparation du fichier…");try{const cv=await drawSheet(item.spec());const bytes=kind==="pdf"?canvasPDF(cv):canvasPNG(cv);
  const name=`${xSafe(edoc().nom)}-${xSafe(item.label)}.${kind}`;if(await saveBinary(name,bytes,kind))toast("Fichier exporté : "+name)}catch(e){console.error(e);toast("Export impossible pour le moment.")}}
function exportModal(){
  const items=exportItems();const main=items.filter(i=>!i.group);const groups={};items.filter(i=>i.group).forEach(i=>(groups[i.group]=groups[i.group]||[]).push(i));
  const line=i=>`<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line);flex-wrap:nowrap"><span style="min-width:0">${esc(i.label)}</span><div class="row" style="flex-wrap:nowrap"><button class="btn ghost sm" data-x="${i.id}" data-k="png">PNG</button><button class="btn sm" data-x="${i.id}" data-k="pdf">PDF</button></div></div>`;
  openModal(`<header><h2>Exporter</h2><button class="x" data-close aria-label="Fermer">×</button></header>
  <p class="small muted">Chaque document s'exporte séparément, en image PNG (pour WhatsApp et les réseaux sociaux) ou en PDF (pour imprimer ou envoyer).</p>
  <div>${main.map(line).join("")}</div>${Object.entries(groups).map(([g,l])=>`<h3 style="margin:16px 0 4px">${esc(g)}</h3>${l.map(line).join("")}`).join("")}
  ${isAdmin()&&window.ggStore&&window.ggStore.exportBinary?`<div class="panel" style="margin-top:16px"><b>Partager la compétition avec les clubs (application Windows)</b><p class="small" style="margin:6px 0 10px">Créez un fichier à envoyer aux clubs : ils l'importent dans leur espace « Mon club » pour consulter et exporter eux-mêmes le tirage, les classements et les statistiques. Il ne contient ni téléphones, ni dates de naissance, ni pièces.</p><button class="btn ghost sm" data-xcomp>Exporter le fichier pour les clubs (.ggc-comp)</button></div>`:""}
  <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-close>Fermer</button></div>`,null,
  root=>{root.querySelectorAll("[data-x]").forEach(b=>b.addEventListener("click",async()=>{const it=items.find(i=>i.id===b.dataset.x);if(!it)return;b.disabled=true;await runExport(it,b.dataset.k);b.disabled=false}));
    const xc=root.querySelector("[data-xcomp]");xc&&xc.addEventListener("click",exportCompFile)});
}
/* ---- fichier compétition pour les clubs (version Windows) ---- */
function compTeamKeys(c){return[...new Set([...(c.approved||[]),...(c.entries||[]),...(c.participants||[]).map(p=>p.club)])]}
async function exportCompFile(){
  const id=ED(),c=edoc();const keys=compTeamKeys(c);const clubs={};
  keys.forEach(k=>{const [cid,tid]=splitKey(k);const cl=S.clubs[cid];if(!cl)return;const t=(cl.teams||{})[tid];if(!t)return;
    clubs[cid]=clubs[cid]||{nom:cl.nom,sigle:cl.sigle,couleur:cl.couleur,teams:{}};clubs[cid].teams[tid]={cat:t.cat,label:t.label||"",staff:[],players:(t.players||[]).map(p=>({id:p.id,prenom:p.prenom,nom:p.nom,maillot:p.maillot,poste:p.poste}))}});
  const matches={};Object.keys(DATA).filter(k=>k.startsWith(`competitions/${id}/matches/`)).forEach(k=>matches[k.split("/")[3]]=DATA[k]);
  const out={type:"ggc-comp",v:1,id,comp:c,matches,clubs,exportedAt:new Date().toISOString()};
  if(await window.ggStore.exportFile(`Competition-${xSafe(c.nom)}.ggc-comp`,JSON.stringify(out),"ggc-comp"))toast("Fichier exporté : envoyez-le aux clubs participants");
}
async function importCompFile(){
  const o=await readJSON(["ggc-comp"],"ggc-comp");if(!o)return;const id=String(o.id||"").replace(/[^A-Za-z0-9_-]/g,"");if(!id||!o.comp){toast("Fichier incomplet.");return}
  Object.keys(DATA).filter(k=>k.startsWith(`competitions/${id}/`)).forEach(k=>delete DATA[k]);
  DATA[`competitions/${id}`]={...o.comp,imported:true,importedAt:new Date().toISOString()};
  Object.entries(o.matches||{}).forEach(([m,v])=>{if(/^[A-Za-z0-9_-]+$/.test(m))DATA[`competitions/${id}/matches/${m}`]=v});
  Object.entries(o.clubs||{}).forEach(([cid,cl])=>{if(cid===S.me||!/^[A-Za-z0-9_\-.:@+]+$/.test(cid))return;DATA[`clubreg/${cid}`]={...cl,shared:true}});
  rebuild();persist();ui.tab="comps";await openComp(id);toast(`Compétition « ${o.comp.nom} » importée`);
}
/* ---- espace club ---- */
function myComps(){const me=S.me;return Object.entries(S.comps).filter(([id,c])=>compTeamKeys(c).some(k=>splitKey(k)[0]===me))}
function myCompsHTML(){
  const L=myComps();const desk=!!(window.ggStore&&window.ggStore.exportBinary);
  return `<div class="panel" style="margin-top:16px"><div class="row between"><h3>Mes compétitions</h3>${desk?`<button class="btn ghost sm" data-act="imp-comp">Importer une compétition reçue</button>`:""}</div>
  <p class="small muted" style="margin:6px 0 10px">Consultez et exportez en PNG ou PDF le tirage, les classements et les statistiques des compétitions de votre club.${desk?" Importez le fichier .ggc-comp envoyé par l'organisation ; importez-le de nouveau pour mettre à jour les résultats.":""}</p>
  ${L.length?L.map(([id,c])=>{const mine=compTeamKeys(c).filter(k=>splitKey(k)[0]===S.me).map(k=>(clubData(k)||{}).catName).filter(Boolean);
    return `<div class="row between" style="padding:10px 0;border-top:1px solid var(--line)"><div style="min-width:0"><b>${esc(c.nom)}</b> <span class="chip">${c.type==="championnat"?"Championnat":"Tournoi"}</span><div class="small muted">${esc(mine.join(", "))}${c.importedAt?" · mis à jour le "+fmtDate(c.importedAt.slice(0,10)):""}</div></div><div class="row"><button class="btn ghost sm" data-act="comp-open" data-v="${id}">Voir</button><button class="btn sm" data-act="my-export" data-v="${id}">Exporter</button></div></div>`}).join(""):`<p class="small">Aucune compétition pour l'instant.</p>`}</div>`;
}
document.addEventListener("click",async e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;const a=t.dataset.act;
  if(a==="comp-export"){if(ED())exportModal()}
  else if(a==="imp-comp")importCompFile();
  else if(a==="my-export"){await write("config/current",{edition:t.dataset.v});exportModal()}});

/* ================= LICENCES ================= */
const LIC_W=708,LIC_H=472; // 6 cm x 4 cm à 300 dpi
const licSaison=()=>((DATA["settings/licence"]||{}).saison)||String(new Date().getFullYear());
function licHash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(36).toUpperCase().padStart(6,"0").slice(-6)}
function licNumber(L){return `NFM-${String(licSaison()).replace(/[^0-9A-Za-z]/g,"").slice(-4)}-${(L.club.sigle||"CLB").toUpperCase().slice(0,5)}-${licHash(L.id)}`}
function licPeople(){
  const out=[];Object.entries(S.clubs).forEach(([cid,c])=>{if(c.shared)return;Object.entries(c.teams||{}).forEach(([tid,t])=>{
    (t.staff||[]).forEach((s,i)=>{if(s&&s.nom)out.push({id:`${cid}~${tid}~s${i}`,cid,tid,kind:i>=3?"kine":"staff",role:i>=3?"Kinésithérapeute":(s.role||STAFF_ROLES[i]),p:s,club:c,team:t})});
    (t.players||[]).forEach(p=>out.push({id:`${cid}~${tid}~${p.id}`,cid,tid,kind:"joueur",role:"Joueur",p,club:c,team:t}))})});
  return out.sort((a,b)=>(a.club.nom||"").localeCompare(b.club.nom||"","fr")||CATS.indexOf(a.team.cat)-CATS.indexOf(b.team.cat)||({staff:0,kine:1,joueur:2}[a.kind]-{staff:0,kine:1,joueur:2}[b.kind])||(+a.p.maillot||0)-(+b.p.maillot||0));
}
function licFiltered(){return licPeople().filter(L=>(!ui.licClub||L.cid===ui.licClub)&&(!ui.licCat||L.team.cat===ui.licCat)&&(!ui.licType||(ui.licType==="joueur"?L.kind==="joueur":L.kind!=="joueur")))}
async function photoData(ref){if(!ref)return null;if(photoCache[ref])return photoCache[ref];if(typeof db!=="undefined"&&db){try{const [a,b]=String(ref).split("/");const s=await db.doc(`clubreg/${a}/photos/${b}`).get();const d=s.exists?s.data().d:null;photoCache[ref]=d;return d}catch(e){return null}}return null}
const loadImg=src=>new Promise(res=>{if(!src)return res(null);const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src});
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function drawCover(c,img,x,y,w,h){const s=Math.max(w/img.width,h/img.height);const sw=w/s,sh=h/s;c.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h)}
async function drawLicence(L){
  await xFonts();
  const W=LIC_W,H=LIC_H,WH="#FFFFFF",B=XC.blue,LB=XC.lblue;
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");
  xBg(c,W,H);
  // en-tête : sur-titre + écusson du club
  const PADX=22,TOP=64;xEyebrow(c,`Licence · Saison ${licSaison()} · ${L.team.cat||""}${L.team.label?" "+L.team.label:""}`,PADX,40,13);
  const cl=await loadImg(await photoData(L.club.logo));const cr=24,lx=W-PADX-cr,ly=34;c.save();c.beginPath();c.arc(lx,ly,cr,0,Math.PI*2);c.fillStyle=cl?"#fff":(L.club.couleur||B);c.fill();c.clip();
  if(cl){const s=Math.min(40/cl.width,40/cl.height);c.drawImage(cl,lx-cl.width*s/2,ly-cl.height*s/2,cl.width*s,cl.height*s)}else{c.fillStyle=xDark(L.club.couleur||B)?WH:"#0A1330";c.font=`800 15px ${XF}`;c.textAlign="center";c.fillText(xFit(c,L.club.sigle||"",42),lx,ly+5);c.textAlign="left"}c.restore();
  c.fillStyle=XC.line;c.fillRect(PADX,TOP,W-PADX*2,1.5);
  // pied : numéro + validité
  const BOT=62;c.fillStyle=XC.line;c.fillRect(PADX,H-BOT,W-PADX*2,1.5);
  c.font=`700 11px ${XF}`;c.fillStyle=LB;xSpaced(c,"N° DE LICENCE",PADX,H-BOT+22,2.2);c.fillStyle=WH;c.font=`800 24px ${XFC}`;c.fillText(licNumber(L),PADX,H-14);
  xPill(c,`Valable ${licSaison()}`,W-PADX,H-BOT+16,32,{bg:"rgba(139,195,74,.16)",fg:XC.green,dot:XC.green,size:14,align:"right"});c.textAlign="left";
  // photo carrée, coins arrondis, liseré bleu lumineux
  const bodyT=TOP+2,bodyB=H-BOT,PS=Math.min(280,bodyB-bodyT-26),px=PADX,py=bodyT+(bodyB-bodyT-PS)/2;
  c.save();c.shadowColor="rgba(61,123,247,.55)";c.shadowBlur=26;rr(c,px,py,PS,PS,20);c.fillStyle="#16234F";c.fill();c.restore();
  c.save();rr(c,px,py,PS,PS,20);c.clip();const im=await loadImg(await photoData(L.p.photo));
  if(im){const s=Math.max(PS/im.width,PS/im.height),sw=PS/s,sh=PS/s;const sx=(im.width-sw)/2,sy=(im.height-sh)*(im.height>im.width?0.25:0.5);c.drawImage(im,sx,sy,sw,sh,px,py,PS,PS)}
  else{c.fillStyle=XC.red;c.beginPath();c.arc(px+PS/2,py+PS/2-14,PS*.24,0,Math.PI*2);c.fill();c.fillStyle=WH;c.font=`800 ${Math.round(PS*.2)}px ${XF}`;c.textAlign="center";c.fillText(initials((L.p.prenom||"")+" "+(L.p.nom||"")),px+PS/2,py+PS/2-14+PS*.07);c.fillStyle=XC.muted;c.font=`600 14px ${XF}`;c.fillText("Photo à fournir",px+PS/2,py+PS-20);c.textAlign="left"}
  c.restore();c.lineWidth=3;c.strokeStyle=B;rr(c,px,py,PS,PS,20);c.stroke();
  // identité : nom blanc, prénom bleu (comme « Narcisse / Etsinyo »), retour à la ligne automatique
  const tx=px+PS+22,tw=W-tx-PADX;
  const wrap=(t,font,max,maxLines)=>{c.font=font;const words=String(t||"").split(/\s+/).filter(Boolean);const lines=[];let cur="";
    for(const w of words){const test=cur?cur+" "+w:w;if(c.measureText(test).width<=max)cur=test;else{if(cur)lines.push(cur);cur=w;while(c.measureText(cur).width>max&&cur.length>1){let k=cur.length;while(k>1&&c.measureText(cur.slice(0,k)+"-").width>max)k--;lines.push(cur.slice(0,k)+"-");cur=cur.slice(k)}}}
    if(cur)lines.push(cur);if(lines.length>maxLines){const keep=lines.slice(0,maxLines);keep[maxLines-1]=xFit(c,lines.slice(maxLines-1).join(" "),max);return keep}return lines};
  const fitWrap=(t,weight,fam,sizes,max,maxLines)=>{for(const sz of sizes){const f=`${weight} ${sz}px ${fam}`;const ls=wrap(t,f,max,99);if(ls.length<=maxLines)return{f,ls,sz}}const sz=sizes[sizes.length-1],f=`${weight} ${sz}px ${fam}`;return{f,ls:wrap(t,f,max,maxLines),sz}};
  const nom=fitWrap((L.p.nom||"").toUpperCase(),800,XFC,[42,38,34,30,27],tw,2);
  const pre=fitWrap(L.p.prenom||"",800,XFC,[32,28,25,22],tw,2);
  const roleTxt=L.kind==="joueur"?`Joueur${L.p.maillot?" · N° "+L.p.maillot:""}${L.p.poste?" · "+L.p.poste:""}`:L.role;
  const det=[["Club",L.club.nom],["Catégorie",`${L.team.cat||""}${L.team.label?" · "+L.team.label:""}`]];if(L.p.naissance)det.push(["Né(e) le",fmtDate(L.p.naissance)]);if(L.kind!=="joueur"&&L.p.qualif)det.push(["Diplôme",L.p.qualif]);
  const labW=98;const detL=det.map(([l,v])=>({l,ls:wrap(v,`700 17px ${XF}`,tw-labW,2)}));
  const blocks=[];nom.ls.forEach(t=>blocks.push({h:nom.sz*1.0,draw:y=>{c.font=nom.f;c.fillStyle=WH;c.fillText(t,tx,y)}}));
  pre.ls.forEach(t=>blocks.push({h:pre.sz*1.08,draw:y=>{c.font=pre.f;c.fillStyle=B;c.fillText(t,tx,y)}}));
  blocks.push({h:12,draw:()=>{}});
  c.font=`700 15px ${XF}`;const rmax=tw;const rtxt=xFit(c,roleTxt,rmax-46);
  blocks.push({h:34,draw:y=>{xPill(c,rtxt,tx,y-24,30,{bg:"rgba(61,123,247,.18)",fg:LB,dot:B,size:15})}});
  blocks.push({h:8,draw:()=>{}});
  detL.forEach(d=>d.ls.forEach((t,i)=>blocks.push({h:24,draw:y=>{if(i===0){c.font=`700 11px ${XF}`;c.fillStyle=LB;xSpaced(c,d.l.toUpperCase(),tx,y-2,1.6)}c.font=`700 17px ${XF}`;c.fillStyle=WH;c.fillText(t,tx+labW,y)}})));
  let total=blocks.reduce((a,b)=>a+b.h,0);const avail=bodyB-bodyT-16;const k=total>avail?avail/total:1;
  let y=bodyT+8+(avail-total*k)/2;
  c.save();if(k<1){c.translate(0,y);c.scale(1,k);c.translate(0,-y)}
  let yy=y;blocks.forEach(b=>{yy+=b.h;b.draw(yy-(b.h*0.22))});c.restore();
  return cv;
}
/* PDF : une image par page, taille de page libre (points) */
function pdfFromCanvases(list){
  const enc=new TextEncoder();const parts=[];let len=0;const offs=[];const add=d=>{const u=typeof d==="string"?enc.encode(d):d;parts.push(u);len+=u.length};
  const obj=(n,body)=>{offs[n]=len;add(`${n} 0 obj\n`);body();add("\nendobj\n")};
  add("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");const N=list.length;const kids=list.map((_,i)=>`${3+i*3} 0 R`).join(" ");
  obj(1,()=>add("<< /Type /Catalog /Pages 2 0 R >>"));obj(2,()=>add(`<< /Type /Pages /Kids [${kids}] /Count ${N} >>`));
  list.forEach((it,i)=>{const jpg=b64ToBytes(it.cv.toDataURL("image/jpeg",0.95).split(",")[1]);const po=3+i*3,io=po+1,co=po+2;const pw=it.pw.toFixed(2),ph=it.ph.toFixed(2);const cs=`q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
    obj(po,()=>add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${io} 0 R >> >> /Contents ${co} 0 R >>`));
    obj(io,()=>{add(`<< /Type /XObject /Subtype /Image /Width ${it.cv.width} /Height ${it.cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(jpg);add("\nendstream")});
    obj(co,()=>add(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`))});
  const xref=len;const n=2+N*3+1;let x=`xref\n0 ${n}\n0000000000 65535 f \n`;for(let i=1;i<n;i++)x+=String(offs[i]).padStart(10,"0")+" 00000 n \n";add(x);add(`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const out=new Uint8Array(len);let o=0;parts.forEach(p=>{out.set(p,o);o+=p.length});return out;
}
const CM=72/2.54;
async function licSheetCanvases(cards){ // planche A4 300 dpi : 3 x 7 licences avec traits de coupe
  await xFonts();
  const A4W=2480,A4H=3508,cols=3,rows=7,gx=(A4W-cols*LIC_W)/(cols+1),gy=(A4H-rows*LIC_H)/(rows+1);const pages=[];
  for(let i=0;i<cards.length;i+=cols*rows){const cv=document.createElement("canvas");cv.width=A4W;cv.height=A4H;const c=cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,A4W,A4H);
    cards.slice(i,i+cols*rows).forEach((card,k)=>{const x=gx+(k%cols)*(LIC_W+gx),y=gy+Math.floor(k/cols)*(LIC_H+gy);c.drawImage(card,x,y);c.strokeStyle="#9AA9D1";c.lineWidth=2;c.setLineDash([12,10]);c.strokeRect(x-1,y-1,LIC_W+2,LIC_H+2);c.setLineDash([])});
    c.fillStyle="#22336B";c.font=`600 34px ${XF}`;c.fillText(`NARX Foot Manager · Licences saison ${licSaison()} · format 6 × 4 cm · découper selon les pointillés`,gx,A4H-40);pages.push(cv)}
  return pages;
}
const licFileName=L=>xSafe(`Licence-${L.club.sigle||L.club.nom}-${L.team.cat}-${L.p.nom}-${L.p.prenom}`);
async function licExportOne(id,kind){const L=licPeople().find(x=>x.id===id);if(!L)return;toast("Préparation de la licence…");
  try{const cv=await drawLicence(L);const bytes=kind==="pdf"?pdfFromCanvases([{cv,pw:6*CM,ph:4*CM}]):canvasPNG(cv);if(await saveBinary(`${licFileName(L)}.${kind}`,bytes,kind))toast("Licence exportée")}catch(e){console.error(e);toast("Export impossible pour le moment.")}}
async function licExportBatch(mode){const list=licFiltered();if(!list.length){toast("Aucune licence dans la sélection.");return}
  if(list.length>300&&!(await askConfirm(`${list.length} licences à générer : cela peut prendre un moment. Continuer ?`,"Continuer")))return;
  toast(`Génération de ${list.length} licence${list.length>1?"s":""}…`);
  try{const cards=[];for(const L of list)cards.push(await drawLicence(L));
    const name=xSafe(`Licences-${ui.licClub&&S.clubs[ui.licClub]?S.clubs[ui.licClub].sigle||S.clubs[ui.licClub].nom:"tous-les-clubs"}-${ui.licCat||"toutes-categories"}-${licSaison()}`);
    let bytes;if(mode==="sheet"){const pages=await licSheetCanvases(cards);bytes=pdfFromCanvases(pages.map(cv=>({cv,pw:21*CM,ph:29.7*CM})))}else bytes=pdfFromCanvases(cards.map(cv=>({cv,pw:6*CM,ph:4*CM})));
    if(await saveBinary(`${name}${mode==="sheet"?"-planche-A4":""}.pdf`,bytes,"pdf"))toast(`${list.length} licence${list.length>1?"s":""} exportée${list.length>1?"s":""}`)}catch(e){console.error(e);toast("Export impossible pour le moment.")}}
function licCardHTML(L){const role=L.kind==="joueur"?`Joueur${L.p.maillot?" · N° "+L.p.maillot:""}${L.p.poste?" · "+L.p.poste:""}`:L.role;
  return `<div class="licwrap" data-name="${esc(((L.p.nom||"")+" "+(L.p.prenom||"")+" "+(L.club.nom||"")+" "+(L.club.sigle||"")).toLowerCase())}"><div class="lic">
    <div class="lic-top"><span class="lic-s">Licence · Saison ${esc(licSaison())} · ${esc(L.team.cat||"")}${L.team.label?" "+esc(L.team.label):""}</span><span class="lic-club" style="background:${esc(L.club.couleur||"#3D7BF7")}" ${L.club.logo?`data-ph="${esc(L.club.logo)}"`:""}>${esc((L.club.sigle||"").slice(0,4))}</span></div>
    <div class="lic-body"><span class="lic-ph" ${L.p.photo?`data-ph="${esc(L.p.photo)}"`:""}><i>${esc(initials((L.p.prenom||"")+" "+(L.p.nom||"")))}</i></span>
      <div class="lic-id"><div class="lic-n">${esc((L.p.nom||"").toUpperCase())}</div><div class="lic-p">${esc(L.p.prenom||"")}</div><span class="lic-r">${esc(role)}</span><div class="lic-d"><b>Club</b> ${esc(L.club.nom||"")}${L.p.naissance?`<br><b>Né(e) le</b> ${fmtDate(L.p.naissance)}`:""}</div></div></div>
    <div class="lic-bot"><span><small>N° de licence</small><b>${esc(licNumber(L))}</b></span><span class="lic-v">Valable ${esc(licSaison())}</span></div></div>
    <div class="row" style="justify-content:space-between;margin-top:8px">${L.p.photo?"<span></span>":`<span class="chip gold">Photo manquante</span>`}<div class="row"><button class="btn ghost sm" data-licx="${esc(L.id)}" data-k="png">PNG</button><button class="btn sm" data-licx="${esc(L.id)}" data-k="pdf">PDF</button></div></div></div>`}

function viewLicences(){
  const all=licPeople(),L=licFiltered();const clubs=Object.entries(S.clubs).filter(([id,c])=>!c.shared).sort((a,b)=>(a[1].nom||"").localeCompare(b[1].nom||"","fr"));
  const cats=[...new Set(all.map(x=>x.team.cat))].sort((a,b)=>CATS.indexOf(a)-CATS.indexOf(b));const miss=L.filter(x=>!x.p.photo).length;
  const sel=(id,opts,val,lab)=>`<div class="f" style="margin:0"><label for="${id}">${lab}</label><select id="${id}" data-licf="${id}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${v===val?"selected":""}>${esc(t)}</option>`).join("")}</select></div>`;
  return `<div class="head"><div><h1>Licences</h1><div class="muted">${all.length} licence${all.length>1?"s":""} générée${all.length>1?"s":""} automatiquement à partir des listes de joueurs, du staff et des kinés de chaque club · format 6 × 4 cm paysage</div></div><button class="btn ghost" data-act="lic-saison">Saison ${esc(licSaison())}</button></div>
  <div class="panel" style="margin-bottom:14px"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));align-items:end">
    ${sel("licClub",[["","Tous les clubs"],...clubs.map(([id,c])=>[id,c.nom])],ui.licClub||"","Club")}
    ${sel("licCat",[["","Toutes les catégories"],...cats.map(c=>[c,c])],ui.licCat||"","Catégorie")}
    ${sel("licType",[["","Tout le monde"],["joueur","Joueurs"],["staff","Staff et kinés"]],ui.licType||"","Personnes")}
    <div class="f" style="margin:0"><label for="licq">Rechercher</label><input id="licq" type="text" placeholder="Nom, club…"></div></div>
    <div class="row between" style="margin-top:12px"><span class="small muted">${L.length} licence${L.length>1?"s":""} dans la sélection${miss?` · <span style="color:var(--gold2)">${miss} sans photo</span>`:""}</span><div class="row"><button class="btn ghost" data-act="lic-batch" data-v="cards" ${L.length?"":"disabled"}>Exporter la sélection (PDF, 1 licence par page)</button><button class="btn" data-act="lic-batch" data-v="sheet" ${L.length?"":"disabled"}>Planche A4 à imprimer (PDF)</button></div></div></div>
  ${L.length?`<div class="licgrid">${L.map(licCardHTML).join("")}</div>`:`<div class="empty"><h3>Aucune licence</h3><p>Les licences apparaissent automatiquement dès qu'un club a des joueurs, un staff ou des kinés enregistrés dans ses catégories.</p></div>`}`;
}
function licSaisonForm(){openModal(`<header><h2>Saison des licences</h2><button class="x" data-close aria-label="Fermer">×</button></header><form><div class="f"><label for="ls">Saison inscrite sur les licences</label><input id="ls" name="s" type="text" required maxlength="9" value="${esc(licSaison())}" placeholder="Ex. : 2027 ou 2026-2027"></div><p class="small muted">Le numéro de licence de chaque personne dépend de la saison : il change quand vous passez à une nouvelle saison.</p><div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">Enregistrer</button></div></form>`,
  async fd=>write("settings/licence",{saison:String(fd.get("s")).trim(),updatedAt:new Date().toISOString()}))}
document.addEventListener("click",async e=>{const t=e.target.closest("[data-licx],[data-act]");if(!t||t.closest("#modalroot")||!isAdmin())return;
  if(t.dataset.licx){t.disabled=true;await licExportOne(t.dataset.licx,t.dataset.k);t.disabled=false}
  else if(t.dataset.act==="lic-batch"){t.disabled=true;await licExportBatch(t.dataset.v);t.disabled=false}
  else if(t.dataset.act==="lic-saison")licSaisonForm()});
document.addEventListener("change",e=>{const f=e.target.dataset&&e.target.dataset.licf;if(!f)return;ui[f]=e.target.value;render()});
document.addEventListener("input",e=>{if(e.target.id!=="licq")return;const v=e.target.value.trim().toLowerCase();document.querySelectorAll(".licwrap").forEach(w=>w.hidden=!!v&&!w.dataset.name.includes(v))});

/* ================= RÉCUPÉRATION AUTOMATIQUE DES INSCRIPTIONS DU FORMULAIRE ================= */
const DEFAULT_SHEET="11NhgoTe4VMaILza5s_0euaQCQP0KPwAzkTmj_nsFRtQ";
const syncCfg=()=>DATA["settings/form"]||{};
const syncDone=()=>((DATA["settings/formsync"]||{}).done)||{};
function hashId(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(36)}
function sheetIdFrom(v){v=String(v||"").trim();const m=/\/d\/([A-Za-z0-9_-]{20,})/.exec(v);return m?m[1]:(/^[A-Za-z0-9_-]{20,}$/.test(v)?v:"")}
async function mcpCall(server,tool,input){const mcp=await claude.use("mcp");if(!mcp)throw{code:"no_mcp"};const r=await mcp.callTool(server,tool,input);return r.payload}
async function driveFile(id){if(!id)return null;try{const p=await mcpCall("Google Drive","download_file_content",{fileId:id});return p&&p.content?{b64:p.content,mime:p.mimeType||"application/octet-stream",name:p.title||""}:null}catch(e){if(e&&["needs_reauth","server_not_connected","not_in_manifest","blocked_by_policy","selection_required"].includes(e.code))throw e;return null}}
const safeFid=id=>String(id||"").replace(/[^A-Za-z0-9_-]/g,"").slice(0,40);
/* Version en ligne : lecture directe de la feuille et du Drive avec vos connecteurs Google */
async function dossiersViaMcp(onStep){
  const done=syncDone();const sheets=[...new Set([sheetIdFrom(syncCfg().sheet)||DEFAULT_SHEET,...Object.values(S.comps).map(c=>c.gsheet&&c.gsheet.id).filter(Boolean)])];let rows=[];const out=[];
  for(const sid of sheets){try{const p=await mcpCall("Google Sheets","get_values",{spreadsheetId:sid,range:"'Clubs'!A2:R"});rows=rows.concat((p&&p.values)||[])}catch(e){if(e&&["needs_reauth","server_not_connected","not_in_manifest","blocked_by_policy","selection_required"].includes(e.code))throw e}}
  for(const r of rows){const code=r[1],statut=r[13]||"";if(!code||statut==="Refusé")continue;let d;try{d=JSON.parse(r[15]||"")}catch(e){continue}
    const cid="gf-"+String(code).toLowerCase();const already=done[code]&&done[code]===d.updatedAt&&Object.keys(S.clubs).some(k=>k===cid||(S.clubs[k].formCodes||[]).includes(code));if(already)continue;
    onStep&&onStep(`Récupération de ${d.club&&d.club.nom||code}…`);
    const photos={},docs={};const img=async id=>{const f=await driveFile(id);if(!f||!/^image\//.test(f.mime))return null;const ref=cid+"/"+safeFid(id);photos[ref]=`data:${f.mime};base64,${f.b64}`;return ref};
    const club={nom:d.club.nom,sigle:d.club.sigle,couleur:d.club.couleur,quartier:d.club.quartier,responsable:d.club.responsable,tel:d.club.tel,logo:await img(d.club.logo),staff:[],players:[]};
    for(const s of d.staff||[])club.staff.push(s&&s.nom?{role:s.role,prenom:s.prenom,nom:s.nom,tel:s.tel,qualif:s.qualif,photo:await img(s.photo)}:{});
    for(const pl of d.players||[]){let pieceDoc=null;if(pl.pdf){const f=await driveFile(pl.pdf);if(f){const id=safeFid(pl.pdf);docs[id]=f.b64;pieceDoc={id,name:pl.pdfName||f.name||"pieces.pdf",size:Math.round(f.b64.length*3/4)}}}
      club.players.push({id:pl.id||("p"+hashId(code+"|"+pl.maillot+"|"+pl.nom+"|"+pl.prenom)),prenom:pl.prenom,nom:pl.nom,naissance:pl.naissance,maillot:pl.maillot,poste:pl.poste,piece:pl.piece,suspSup:0,photo:await img(pl.photo),pieceDoc})}
    out.push({o:{type:"ggc-club",v:2,clubId:cid,club,cat:d.cat||"U25",competitionId:d.comp?d.comp.id:null,photos,docs},code,updatedAt:d.updatedAt})}
  return out;
}
/* Application Windows : récupération par l'adresse sécurisée du formulaire (clé de synchronisation) */
async function dossiersViaEndpoint(onStep){
  const c=syncCfg();if(!c.url||!c.key)throw{code:"no_key"};
  const call=async params=>{const u=new URL(c.url);Object.entries({...params,key:c.key}).forEach(([k,v])=>u.searchParams.set(k,v));let t;try{t=await window.ggStore.fetchText(u.toString())}catch(e){throw{code:"net"}}let j;try{j=JSON.parse(t)}catch(e){throw{code:"bad_response"}}if(!j.ok)throw{code:j.error==="key"?"bad_key":"server",message:j.message};return j};
  const done=syncDone();const L=(await call({action:"list"})).list||[];
  const todo=L.filter(x=>!(done[x.code]&&done[x.code]===x.updatedAt&&Object.keys(S.clubs).some(k=>k==="gf-"+String(x.code).toLowerCase()||(S.clubs[k].formCodes||[]).includes(x.code))));
  const out=[];for(const x of todo){onStep&&onStep(`Récupération ${out.length+1} / ${todo.length}…`);const j=await call({action:"get",code:x.code});out.push({o:j.dossier,code:j.code,updatedAt:j.updatedAt})}
  return out;
}
let syncing=false;
async function syncInscriptions(){
  if(syncing)return;syncing=true;const btns=document.querySelectorAll('[data-act="form-sync"]');btns.forEach(b=>{b.disabled=true;b.dataset.l=b.textContent;b.textContent="Récupération…"});
  try{toast("Recherche des nouvelles inscriptions…");
    const desk=!!(window.ggStore&&window.ggStore.fetchText);let list;
    if(desk)list=await dossiersViaEndpoint(m=>toast(m));else list=await dossiersViaMcp(m=>toast(m));
    if(!list.length){toast("Aucune nouvelle inscription : tout est déjà à jour.");return}
    const done={...syncDone()};const msgs=[];
    for(const it of list){const m=await importDossier(it.o,true);if(m&&!/incomplet/.test(m)){done[it.code]=it.updatedAt||"x";const cid=Object.keys(S.clubs).find(k=>k===it.o.clubId)||Object.keys(S.clubs).find(k=>(S.clubs[k].nom||"").toLowerCase()===(it.o.club.nom||"").toLowerCase());
      if(cid){const doc=clone(S.clubs[cid]);doc.formCodes=[...new Set([...(doc.formCodes||[]),it.code])];await write(`clubreg/${cid}`,doc)}msgs.push(m)}}
    await write("settings/formsync",{done,lastSync:new Date().toISOString()});
    openModal(`<header><h2>Inscriptions récupérées</h2><button class="x" data-close aria-label="Fermer">×</button></header><p>${msgs.length} inscription${msgs.length>1?"s":""} ajoutée${msgs.length>1?"s":""} ou mise${msgs.length>1?"s":""} à jour :</p><ul class="small">${msgs.map(m=>`<li>${esc(m)}</li>`).join("")}</ul><p class="small muted">Les équipes inscrites par un lien de compétition sont en attente de validation dans cette compétition.</p><div class="row" style="justify-content:flex-end"><button class="btn" data-close>Fermer</button></div>`,null);
  }catch(e){const c=e&&e.code;
    if(c==="no_key")syncSettingsForm(true);
    else if(c==="bad_key")toast("Clé de synchronisation refusée : vérifiez-la dans Admin → Récupération des inscriptions.");
    else if(c==="needs_reauth")toast(`Reconnectez ${e.server||"Google"} dans les réglages de Claude (Connecteurs), puis réessayez.`);
    else if(c==="server_not_connected")toast(`Ajoutez le connecteur ${e.server||"Google"} dans les réglages de Claude (Connecteurs), puis réessayez.`);
    else if(c==="not_in_manifest")toast("L'accès à Google a été refusé pour cette page. Rechargez la page et acceptez l'accès.");
    else if(c==="no_mcp")toast("La récupération automatique n'est pas disponible dans cette vue.");
    else if(c==="tool_error")toast("Google n'a pas pu lire la feuille. Vérifiez l'adresse de la feuille d'organisation.");
    else if(c==="net")toast("Connexion impossible au formulaire. Vérifiez internet et l'adresse du formulaire.");
    else if(c==="bad_response")syncErrorModal("Le formulaire Google n'a pas répondu comme prévu.","L'adresse enregistrée affiche le formulaire mais pas encore la fonction de récupération : la nouvelle version de Code.gs n'est pas en ligne à cette adresse. Dans script.google.com : remplacez Code.gs et Index par la dernière version, enregistrez, puis Déployer → Gérer les déploiements → crayon sur le déploiement de cette adresse → Version : Nouvelle version → Déployer.");
    else if(c==="server")syncErrorModal("Le formulaire Google a signalé une erreur.",String(e.message||"Erreur inconnue côté Google Apps Script."));
    else{console.error(e);syncErrorModal("Récupération impossible pour le moment.","Détail technique : "+String((e&&(e.message||e.code))||e))}}
  finally{syncing=false;document.querySelectorAll('[data-act="form-sync"]').forEach(b=>{b.disabled=false;if(b.dataset.l)b.textContent=b.dataset.l})}
}
function syncErrorModal(title,detail){const desk=!!(window.ggStore&&window.ggStore.fetchText);openModal(`<header><h2>${esc(title)}</h2><button class="x" data-close aria-label="Fermer">×</button></header><p class="small">${esc(detail)}</p><p class="small muted">Adresse du formulaire enregistrée : ${esc(syncCfg().url||"aucune")}${desk?"":" · Feuilles lues : feuille générale et feuilles des compétitions"}</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Fermer</button><button class="btn" data-sfix>Vérifier les réglages</button></div>`,null,(root,close)=>{root.querySelector("[data-sfix]").onclick=()=>{close();syncSettingsForm(false)}})}
function syncSettingsForm(fromSync){
  const c=syncCfg();const desk=!!(window.ggStore&&window.ggStore.fetchText);
  openModal(`<header><h2>Récupération des inscriptions</h2><button class="x" data-close aria-label="Fermer">×</button></header><form>
  <p class="small">${desk?"Pour que l'application Windows récupère elle-même les inscriptions du formulaire, collez la <b>clé de synchronisation</b> : dans script.google.com, exécutez la fonction <b>cleSynchronisation</b> et copiez la clé affichée dans le journal.":"La version en ligne lit directement la feuille Google d'organisation et les photos du Drive avec vos connecteurs Google Sheets et Google Drive."}</p>
  <div class="f"><label for="sfu">Adresse du formulaire (…/exec)</label><input id="sfu" name="url" type="text" value="${esc(c.url||"")}" placeholder="https://script.google.com/macros/s/…/exec"></div>
  ${desk?`<div class="f"><label for="sfk">Clé de synchronisation</label><input id="sfk" name="key" type="text" value="${esc(c.key||"")}" placeholder="Ex. : 7F3K9Q…"></div>`:`<div class="f"><label for="sfs">Feuille Google d'organisation (lien ou identifiant)</label><input id="sfs" name="sheet" type="text" value="${esc(c.sheet||DEFAULT_SHEET)}"></div>`}
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn" type="submit" data-l="Enregistrer">Enregistrer</button></div></form>`,
  async fd=>{const url=String(fd.get("url")||"").trim();const patch={...c,url,updatedAt:new Date().toISOString()};if(desk)patch.key=String(fd.get("key")||"").trim();else{const sid=sheetIdFrom(fd.get("sheet"));if(!sid){toast("Lien ou identifiant de feuille non reconnu.");return false}patch.sheet=sid}
    const r=await write("settings/form",patch);if(r!==false){ensureAllLinks();if(fromSync)setTimeout(syncInscriptions,0)}return r});
}
function syncPanelHTML(){const s=DATA["settings/formsync"]||{};return `<div class="panel" style="margin-bottom:16px;border-color:rgba(61,123,247,.45)"><h3>Inscriptions reçues par le formulaire</h3><p class="small">Les clubs qui s'inscrivent avec le lien d'une compétition arrivent d'abord dans la feuille Google d'organisation. Cliquez sur <b>Récupérer les inscriptions</b> pour les faire entrer ici d'un coup : club, catégorie, staff, joueurs, photos et PDF. Chaque équipe est ajoutée à sa compétition, en attente de validation. Les dossiers déjà récupérés et inchangés sont ignorés.${s.lastSync?` <span class="muted">Dernière récupération : ${new Date(s.lastSync).toLocaleString("fr-FR")}.</span>`:""}</p><div class="row"><button class="btn" data-act="form-sync">Récupérer les inscriptions</button><button class="btn ghost sm" data-act="form-sync-cfg">Réglages</button></div></div>`}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot")||!isAdmin())return;if(t.dataset.act==="form-sync")syncInscriptions();else if(t.dataset.act==="form-sync-cfg")syncSettingsForm(false)});

/* ================= GOOGLE SHEETS + GOOGLE DOCS PROPRES À CHAQUE COMPÉTITION ================= */
const G_HEAD_CLUBS=["Date d'envoi","Code club","Nom du club","Sigle","Quartier","Responsable","Téléphone","E-mail","Couleur","Logo","Joueurs","Staff complet","PDF manquants","Statut (organisation)","Dossier Drive","Données du formulaire (ne pas modifier)","Compétition","Catégorie"];
const G_HEAD_STAFF=["Code club","Club","Fonction","Prénoms","Nom","Téléphone","Diplôme / qualification","Photo"];
const G_HEAD_JOUEURS=["Code club","Club","Maillot","Prénoms","Nom","Date de naissance","Éligibilité","Poste","N° pièce d'identité","Photo","PDF des pièces"];
function compDocText(c,link){const L=[`${c.nom}`,`${c.type==="championnat"?"Championnat":"Tournoi"}${c.cat?" · Catégorie "+c.cat:""}${c.saison?" · Saison "+c.saison:""}`,"","INFORMATIONS",
  `Format : ${c.type==="championnat"?"Championnat (tous contre tous)":"Tournoi (poules puis phases finales)"}`,`Catégorie : ${c.cat||"Toutes catégories"}`];
  if(c.saison)L.push(`Saison : ${c.saison}`);L.push(`Nombre d'équipes : ${c.nbClubs}`);if(c.birthMin)L.push(`Joueurs nés le ou après le ${fmtDate(c.birthMin)}`);if(c.birthMax)L.push(`Joueurs nés le ou avant le ${fmtDate(c.birthMax)}`);
  L.push("","INSCRIPTION DES CLUBS",link||"(lien à venir)","Chaque club s'inscrit avec ce lien, depuis un téléphone ou un ordinateur, sans créer de compte. À la fin, il reçoit un code club qui permet de compléter ou corriger l'inscription.","",
    "À PRÉPARER PAR CHAQUE CLUB","- Le nom, le sigle et le logo du club","- Le staff technique (3 personnes) et les kinésithérapeutes (2 personnes), avec leur photo","- La liste des joueurs : nom, prénoms, date de naissance, numéro de maillot, poste, photo","- Pour chaque joueur, un PDF regroupant ses pièces (acte de naissance, pièce d'identité), 5 Mo maximum","",
    "SUIVI DES INSCRIPTIONS","Les inscriptions arrivent dans la feuille Google de la compétition (onglets Clubs, Staff, Joueurs). L'organisation les récupère dans NARX Foot Manager avec le bouton « Récupérer les inscriptions ».");return L.join("\n")}
const gUrl=(kind,id)=>kind==="sheet"?`https://docs.google.com/spreadsheets/d/${id}/edit`:kind==="doc"?`https://docs.google.com/document/d/${id}/edit`:`https://drive.google.com/drive/folders/${id}`;
async function createCompGoogleMcp(id){
  const c=S.comps[id];const label=`${c.nom}${c.cat?" – "+c.cat:""}`;
  const folder=await mcpCall("Google Drive","create_file",{title:label,contentMimeType:"application/vnd.google-apps.folder"});
  const sh=await mcpCall("Google Drive","create_file",{title:`${label} – Inscriptions`,contentMimeType:"application/vnd.google-apps.spreadsheet",parentId:folder.id});const sid=sh.id;
  const rgb={red:0.239,green:0.482,blue:0.969},white={red:1,green:1,blue:1};
  const head=(sheetId,n)=>({repeatCell:{range:{sheetId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:n},cell:{userEnteredFormat:{backgroundColor:rgb,textFormat:{bold:true,foregroundColor:white},wrapStrategy:"WRAP",verticalAlignment:"MIDDLE"}},fields:"userEnteredFormat.backgroundColor,userEnteredFormat.textFormat,userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment"}});
  await mcpCall("Google Sheets","update_spreadsheet",{spreadsheetId:sid,requests:[
    {updateSheetProperties:{properties:{sheetId:0,title:"Clubs",gridProperties:{frozenRowCount:1}},fields:"title,gridProperties.frozenRowCount"}},
    {addSheet:{properties:{sheetId:1,title:"Staff",gridProperties:{frozenRowCount:1}}}},{addSheet:{properties:{sheetId:2,title:"Joueurs",gridProperties:{frozenRowCount:1}}}},{addSheet:{properties:{sheetId:3,title:"Paramètres"}}},
    head(0,18),head(1,8),head(2,11),
    {updateDimensionProperties:{range:{sheetId:0,dimension:"COLUMNS",startIndex:15,endIndex:16},properties:{hiddenByUser:true},fields:"hiddenByUser"}},
    {setDataValidation:{range:{sheetId:0,startRowIndex:1,endRowIndex:1000,startColumnIndex:13,endColumnIndex:14},rule:{condition:{type:"ONE_OF_LIST",values:[{userEnteredValue:"En attente"},{userEnteredValue:"Validé"},{userEnteredValue:"Refusé"}]},strict:true,showCustomUi:true}}},
    {setDataValidation:{range:{sheetId:3,startRowIndex:5,endRowIndex:6,startColumnIndex:1,endColumnIndex:2},rule:{condition:{type:"ONE_OF_LIST",values:[{userEnteredValue:"Ouvertes"},{userEnteredValue:"Fermées"}]},strict:true,showCustomUi:true}}}]});
  await mcpCall("Google Sheets","update_values",{spreadsheetId:sid,range:"'Clubs'!A1:R1",values:[G_HEAD_CLUBS]});
  await mcpCall("Google Sheets","update_values",{spreadsheetId:sid,range:"'Staff'!A1:H1",values:[G_HEAD_STAFF]});
  await mcpCall("Google Sheets","update_values",{spreadsheetId:sid,range:"'Joueurs'!A1:K1",values:[G_HEAD_JOUEURS]});
  await mcpCall("Google Sheets","update_values",{spreadsheetId:sid,range:"'Paramètres'!A1:B8",values:[["Identifiant (ne pas modifier)","NARX:"+id],["Compétition",c.nom],["Catégorie",c.cat||"Toutes catégories"],["Saison",c.saison||""],["Format",c.type==="championnat"?"Championnat":"Tournoi"],["Inscriptions","Ouvertes"],["Nés le ou après",c.birthMin||""],["Nés le ou avant",c.birthMax||""]]});
  const tmp={...c,gsheet:{id:sid,url:sh.viewUrl||gUrl("sheet",sid)}};S.comps[id]=tmp;let link="";try{link=formUrl()?compLink(id):""}catch(e){}
  const doc=await mcpCall("Google Drive","create_file",{title:`${label} – Fiche de la compétition`,textContent:compDocText(c,link),contentMimeType:"text/plain",parentId:folder.id});
  return{gsheet:{id:sid,url:sh.viewUrl||gUrl("sheet",sid)},gdoc:{id:doc.id,url:doc.viewUrl||gUrl("doc",doc.id)},gfolder:{id:folder.id,url:folder.viewUrl||gUrl("folder",folder.id)}};
}
async function createCompGoogleEndpoint(id){
  const c=S.comps[id],cfg=syncCfg();if(!cfg.url||!cfg.key)throw{code:"no_key"};const u=new URL(cfg.url);
  const params={action:"create",key:cfg.key,comp:id,nom:c.nom||"",cat:c.cat||"",saison:c.saison||"",type:c.type||"tournoi",nb:String(c.nbClubs||""),min:c.birthMin||"",max:c.birthMax||"",link:formUrl()?compLink(id):""};
  Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));let t;try{t=await window.ggStore.fetchText(u.toString())}catch(e){throw{code:"net"}}
  let j;try{j=JSON.parse(t)}catch(e){throw{code:"bad_response"}}if(!j.ok)throw{code:j.error==="key"?"bad_key":"server",message:j.message};
  return{gsheet:{id:j.sheetId,url:j.sheetUrl},gdoc:{id:j.docId,url:j.docUrl},gfolder:{url:j.folderUrl}};
}
let gCreating=false;
async function createCompGoogle(id,quiet){
  if(gCreating||!isAdmin())return false;const c=S.comps[id];if(!c)return false;if(c.gsheet&&c.gsheet.id)return true;gCreating=true;
  try{if(!quiet)toast("Création du Google Sheets et du Google Docs de la compétition…");const desk=!!(window.ggStore&&window.ggStore.fetchText);
    const r=desk?await createCompGoogleEndpoint(id):await createCompGoogleMcp(id);
    await write(`competitions/${id}`,{...S.comps[id],...r});await ensureCompLink(id);toast("Google Sheets et Google Docs créés pour cette compétition");return true}
  catch(e){const k=e&&e.code;
    if(k==="no_key"){toast("Pour créer les fichiers Google depuis l'application Windows, renseignez d'abord l'adresse du formulaire et la clé de synchronisation.");syncSettingsForm(false)}
    else if(k==="bad_key")toast("Clé de synchronisation refusée : vérifiez-la dans Admin → Récupération des inscriptions → Réglages.");
    else if(k==="needs_reauth")toast(`Reconnectez ${e.server||"Google"} dans les réglages de Claude (Connecteurs), puis cliquez sur « Créer le Google Sheets et le Docs ».`);
    else if(k==="server_not_connected")toast(`Ajoutez le connecteur ${e.server||"Google"} dans les réglages de Claude, puis réessayez.`);
    else if(k==="not_in_manifest")toast("L'accès à Google a été refusé pour cette page. Rechargez la page et acceptez l'accès.");
    else if(k==="net")toast("Connexion impossible au formulaire Google. Vérifiez internet et l'adresse du formulaire.");
    else{console.error(e);toast("Création des fichiers Google impossible pour le moment. Réessayez avec le bouton « Créer le Google Sheets et le Docs ».")}
    return false}
  finally{gCreating=false}
}
function compGoogleHTML(){const c=edoc();if(!c||!isAdmin())return"";
  if(c.gsheet&&c.gsheet.url)return `<div class="row" style="margin-top:8px"><a class="btn ghost sm" href="${esc(c.gsheet.url)}" target="_blank" rel="noopener noreferrer">Google Sheets de la compétition</a>${c.gdoc&&c.gdoc.url?`<a class="btn ghost sm" href="${esc(c.gdoc.url)}" target="_blank" rel="noopener noreferrer">Google Docs de la compétition</a>`:""}${c.gfolder&&c.gfolder.url?`<a class="btn ghost sm" href="${esc(c.gfolder.url)}" target="_blank" rel="noopener noreferrer">Dossier Drive</a>`:""}</div>`;
  return `<div class="row" style="margin-top:8px"><span class="small muted">Cette compétition n'a pas encore son Google Sheets et son Google Docs.</span><button class="btn sm" data-act="comp-gcreate">Créer le Google Sheets et le Docs</button></div>`}
document.addEventListener("click",async e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot")||!isAdmin())return;if(t.dataset.act==="comp-gcreate"&&ED()){t.disabled=true;await createCompGoogle(ED());t.disabled=false}});

/* ================= VISUELS DE MATCH (communication) ================= */
const VIS_SIZES={carre:{w:1080,h:1080,l:"Carré 1080 × 1080 (publication)"},portrait:{w:1080,h:1350,l:"Portrait 1080 × 1350 (Instagram)"},story:{w:1080,h:1920,l:"Story 1080 × 1920 (statut WhatsApp, story)"}};
const JOURS=["DIMANCHE","LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI"],MOIS=["JANVIER","FÉVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOÛT","SEPTEMBRE","OCTOBRE","NOVEMBRE","DÉCEMBRE"];
function visDate(d,h){if(!d)return h?h.replace(":","H"):"DATE À CONFIRMER";const x=new Date(d+"T12:00:00");return `${JOURS[x.getDay()]} ${x.getDate()} ${MOIS[x.getMonth()]}${h?" · "+h.replace(":","H"):""}`}
function compMatches(){const c=edoc();if(!c)return[];
  if(c.type==="championnat"){const L=lgCompute();return L.list.filter(m=>m.kind!=="annule").map(m=>({...m,phase:`Journée ${m.j}`}))}
  compute();return Object.values(R.matches).sort((a,b)=>a.n-b.n).map(m=>({...m,phase:m.stage==="G"?`Phase de poules · Poule ${m.poule}`:STAGE_NAME[m.stage]}))}
function scorersOf(m,cid){const AP=edoc().type==="championnat"?lgCompute().AP:allPlayers();return(m.events||[]).filter(e=>(e.type==="but"&&e.club===cid)||(e.type==="csc"&&e.club!==cid&&(e.club===m.c1||e.club===m.c2))).map(e=>{const p=AP[e.player];const nm=p?`${(p.prenom||"").charAt(0)}. ${p.nom}`:"But";return `${nm}${e.type==="csc"?" (csc)":""}${e.min?" "+e.min+"'":""}`})}
async function visCrest(c,key,x,y,r){const t=clubData(key)||{};
  c.save();c.shadowColor="rgba(61,123,247,.6)";c.shadowBlur=r*.45;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle="#16234F";c.fill();c.restore();
  c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();
  const im=await loadImg(await photoData(t.logo));if(im){c.fillStyle="#fff";c.fillRect(x-r,y-r,r*2,r*2);const s=Math.min(r*1.5/im.width,r*1.5/im.height);c.drawImage(im,x-im.width*s/2,y-im.height*s/2,im.width*s,im.height*s)}
  else{const col=t.couleur||"#3D7BF7";c.fillStyle=col;c.fillRect(x-r,y-r,r*2,r*2);c.fillStyle=xDark(col)?"#fff":"#0A1330";c.font=`800 ${Math.round(r*0.5)}px ${XF}`;c.textAlign="center";c.fillText((t.sigle||"?").slice(0,4),x,y+r*0.18)}c.restore();
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.lineWidth=Math.max(3,r*0.05);c.strokeStyle="#3D7BF7";c.stroke()}
function visWrap(c,text,x,y,maxW,lh,maxLines,align="center"){const words=String(text||"").split(/\s+/);const lines=[];let cur="";words.forEach(w=>{const t=cur?cur+" "+w:w;if(c.measureText(t).width<=maxW)cur=t;else{if(cur)lines.push(cur);cur=w}});if(cur)lines.push(cur);
  const L=lines.slice(0,maxLines);if(lines.length>maxLines)L[maxLines-1]=xFit(c,lines.slice(maxLines-1).join(" "),maxW);c.textAlign=align;L.forEach((l,i)=>c.fillText(l,x,y+i*lh));return L.length}
async function visBackground(c,W,H){xBg(c,W,H);
  const g=c.createRadialGradient(W*.5,H*.42,10,W*.5,H*.42,W*.55);g.addColorStop(0,"rgba(61,123,247,.18)");g.addColorStop(1,"rgba(61,123,247,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle="#22336B";c.fillRect(60,H-58,W-120,1.5);c.fillStyle="#9AA9D1";c.font=`700 18px ${XF}`;c.textAlign="center";xSpaced(c,"NARX FOOT MANAGER",W/2,H-24,4,"center");c.textAlign="left"}
async function visPartners(c,W,y){const P=Object.values(S.partners||{}).filter(p=>p.statut==="Confirmé"&&p.logo).slice(0,6);if(!P.length)return;const sz=86,gap=22,tot=P.length*sz+(P.length-1)*gap;let x=(W-tot)/2;
  c.fillStyle="#9CC0FF";c.font=`700 17px ${XF}`;xSpaced(c,"AVEC LE SOUTIEN DE",W/2,y-18,3.4,"center");
  for(const p of P){const im=await loadImg(p.logo);c.save();rr(c,x,y,sz,sz,22);c.fillStyle="#fff";c.fill();c.clip();if(im){const s=Math.min((sz-14)/im.width,(sz-14)/im.height);c.drawImage(im,x+sz/2-im.width*s/2,y+sz/2-im.height*s/2,im.width*s,im.height*s)}c.restore();x+=sz+gap}}
function visDateLow(d,h){if(!d)return h?h.replace(":","h"):"Date à confirmer";const x=new Date(d+"T12:00:00");const J=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],M=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return `${J[x.getDay()]} ${x.getDate()} ${M[x.getMonth()]}${h?" · "+h.replace(":","h"):""}`}
async function drawMatchVisual(m,mode,sizeKey){
  await xFonts();
  const {w:W,h:H}=VIS_SIZES[sizeKey]||VIS_SIZES.carre;const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");const comp=edoc();
  await visBackground(c,W,H);const tall=H>1100,sc=tall?1.12:1;const hasP=Object.values(S.partners||{}).some(p=>p.statut==="Confirmé"&&p.logo);
  const done=m.done&&mode==="resultat";
  // en-tête : sur-titre, nom de la compétition, phase
  let y=tall?170:104;xEyebrow(c,`${comp.cat?comp.cat+" · ":""}${m.phase||""}`,W/2,y,Math.round(20*sc),"center");
  y+=Math.round(58*sc);c.fillStyle="#fff";c.font=`800 ${Math.round(44*sc)}px ${XFC}`;const nl=visWrap(c,comp.nom||"",W/2,y,W-140,48*sc,2);
  // titre : deux tons, blanc puis bleu
  y+=(nl-1)*48*sc+Math.round((tall?150:112));c.font=`800 ${Math.round((done?112:104)*sc)}px ${XFC}`;c.textAlign="center";
  const [w1,w2]=done?["Résultat","."]:["Jour de ","match."];
  {const a=c.measureText(w1).width,b=c.measureText(w2).width,x0=W/2-(a+b)/2;c.textAlign="left";c.fillStyle="#fff";c.fillText(w1,x0,y);c.fillStyle="#3D7BF7";c.fillText(w2,x0+a,y);c.textAlign="center"}
  // affiche : écussons, score ou VS
  const cy=y+(tall?300:222),r=Math.round((tall?150:124)),dx=W*0.27;
  await visCrest(c,m.c1,W/2-dx,cy,r);await visCrest(c,m.c2,W/2+dx,cy,r);
  c.textAlign="center";if(done){c.fillStyle="#fff";c.font=`800 ${Math.round(140*sc)}px ${XFC}`;c.fillText(`${m.g1}-${m.g2}`,W/2,cy+48*sc);
    if(m.t1!=null&&m.g1===m.g2&&m.t1!==""){xPill(c,`tirs au but ${m.t1}-${m.t2}`,W/2,cy+82*sc,Math.round(44*sc),{size:Math.round(22*sc),align:"center"});c.textAlign="center"}}
  else{c.fillStyle="#3D7BF7";c.font=`800 ${Math.round(96*sc)}px ${XFC}`;c.fillText("VS",W/2,cy+34*sc)}
  const t1=clubData(m.c1)||{},t2=clubData(m.c2)||{};let ny=cy+r+70*sc;c.fillStyle="#fff";c.font=`800 ${Math.round(36*sc)}px ${XFC}`;
  const l1=visWrap(c,t1.nom||m.l1||"",W/2-dx,ny,W*0.42,40*sc,2),l2=visWrap(c,t2.nom||m.l2||"",W/2+dx,ny,W*0.42,40*sc,2);ny+=Math.max(l1,l2)*40*sc;
  if(done){c.font=`600 ${Math.round(22*sc)}px ${XF}`;c.fillStyle="#9CC0FF";const s1=scorersOf(m,m.c1),s2=scorersOf(m,m.c2);const n=Math.min(Math.max(s1.length,s2.length),tall?6:3);
    for(let i=0;i<n;i++){if(s1[i])c.fillText(xFit(c,"⚽ "+s1[i],W*0.42),W/2-dx,ny+10+i*32*sc);if(s2[i])c.fillText(xFit(c,"⚽ "+s2[i],W*0.42),W/2+dx,ny+10+i*32*sc)}ny+=n*32*sc}
  // bandeau date : bouton bleu lumineux
  const bh=tall?132:108;const by=tall?Math.max(ny+60,Math.min(H-(hasP?450:280),ny+190)):Math.max(ny+40,H-(hasP?320:196));
  c.save();c.shadowColor="rgba(61,123,247,.65)";c.shadowBlur=40;c.shadowOffsetY=12;rr(c,80,by,W-160,bh,30);c.fillStyle="#3D7BF7";c.fill();c.restore();
  c.fillStyle="#fff";c.font=`800 ${Math.round(42*sc)}px ${XFC}`;c.textAlign="center";c.fillText(xFit(c,done?`Match ${m.n} · ${visDateLow(m.date,"")}`:visDateLow(m.date,m.heure),W-220),W/2,by+(tall?64:54));
  c.font=`600 ${Math.round(22*sc)}px ${XF}`;c.fillStyle="rgba(255,255,255,.85)";c.fillText(xFit(c,comp.lieu?comp.lieu:(done?"Merci aux supporters !":"Venez nombreux !"),W-220),W/2,by+(tall?106:88));
  await visPartners(c,W,by+bh+(tall?80:56));
  c.textAlign="left";return cv;
}
async function drawDayVisual(list,label,sizeKey){
  await xFonts();
  const {w:W,h:H}=VIS_SIZES[sizeKey]||VIS_SIZES.carre;const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");const comp=edoc();await visBackground(c,W,H);
  const hasP=Object.values(S.partners||{}).some(p=>p.statut==="Confirmé"&&p.logo);
  xEyebrow(c,comp.nom||"",W/2,92,20,"center");
  c.textAlign="center";c.font=`800 96px ${XFC}`;const a=c.measureText("Le ").width,b=c.measureText("programme.").width,x0=W/2-(a+b)/2;c.textAlign="left";c.fillStyle="#fff";c.fillText("Le ",x0,206);c.fillStyle="#3D7BF7";c.fillText("programme.",x0+a,206);
  c.textAlign="center";c.font=`600 28px ${XF}`;c.fillStyle="#9AA9D1";c.fillText(label,W/2,256);
  const avail=H-310-(hasP?220:90);const shown=Math.min(list.length,Math.floor(avail/90));const rowH=Math.min(170,avail/Math.max(1,shown));let y=300+Math.max(0,(avail-rowH*shown)/2);
  for(const m of list.slice(0,Math.floor(avail/90))){const hh=rowH-18;c.save();rr(c,60,y,W-120,hh,28);const g=c.createLinearGradient(0,y,0,y+hh);g.addColorStop(0,"rgba(20,33,74,.96)");g.addColorStop(1,"rgba(13,22,52,.96)");c.fillStyle=g;c.fill();c.strokeStyle="#22336B";c.lineWidth=2;c.stroke();c.restore();
    const cy=y+hh/2,r=Math.min(44,(rowH-44)/2);await visCrest(c,m.c1,128,cy,r);await visCrest(c,m.c2,W-128,cy,r);
    const t1=clubData(m.c1)||{},t2=clubData(m.c2)||{};c.fillStyle="#fff";c.font=`800 30px ${XFC}`;c.textAlign="left";c.fillText(xFit(c,t1.sigle||t1.nom||m.l1||"",250),190,cy+11);c.textAlign="right";c.fillText(xFit(c,t2.sigle||t2.nom||m.l2||"",250),W-190,cy+11);
    const tag=m.done?`${m.g1}-${m.g2}`:(m.heure||"VS").replace(":","h");c.font=`800 ${m.done?40:32}px ${XFC}`;const tw=c.measureText(tag).width+44;
    c.save();rr(c,W/2-tw/2,cy-30,tw,60,30);c.fillStyle=m.done?"#3D7BF7":"rgba(61,123,247,.16)";c.fill();c.restore();c.textAlign="center";c.fillStyle=m.done?"#fff":"#9CC0FF";c.fillText(tag,W/2,cy+(m.done?14:11));y+=rowH}
  await visPartners(c,W,H-196);c.textAlign="left";return cv;
}
let visState={size:"carre"};
function visualsModal(focusN){
  const ms=compMatches().filter(m=>m.c1&&m.c2);const today=new Date().toISOString().slice(0,10);const up=ms.filter(m=>!m.done).sort((a,b)=>(a.date||"9").localeCompare(b.date||"9")||a.n-b.n);const played=ms.filter(m=>m.done).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.n-a.n);
  const days=[...new Set(ms.map(m=>m.date).filter(Boolean))].sort();
  const line=(m,kind)=>`<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line);flex-wrap:nowrap"><span style="min-width:0"><b>${esc(cName(m.c1))} – ${esc(cName(m.c2))}</b> <span class="small muted">· ${m.n?("M"+m.n):""} · ${esc(m.phase)} · ${m.date?fmtDate(m.date):"date à fixer"}${m.done?` · ${m.g1}-${m.g2}`:""}</span></span><button class="btn sm" data-vis="${m.n}" data-k="${kind}">${kind==="resultat"?"Visuel résultat":"Affiche"}</button></div>`;
  openModal(`<header><h2>Visuels de match</h2><button class="x" data-close aria-label="Fermer">×</button></header>
  <div class="f"><label for="vsz">Format</label><select id="vsz">${Object.entries(VIS_SIZES).map(([k,v])=>`<option value="${k}" ${visState.size===k?"selected":""}>${v.l}</option>`).join("")}</select></div>
  <div id="vprev"></div>
  ${up.length?`<h3 style="margin:12px 0 4px">Matchs à venir (affiches)</h3>${up.slice(0,30).map(m=>line(m,"affiche")).join("")}`:""}
  ${played.length?`<h3 style="margin:16px 0 4px">Matchs joués (résultats)</h3>${played.slice(0,30).map(m=>line(m,"resultat")).join("")}`:""}
  ${days.length?`<h3 style="margin:16px 0 4px">Programme d'une journée</h3><div class="row"><select id="vday" style="max-width:260px">${days.map(d=>`<option value="${d}" ${d>=today&&!days.some(x=>x>=today&&x<d)?"selected":""}>${fmtDate(d)}</option>`).join("")}</select><button class="btn sm" data-vday>Créer le visuel du programme</button></div>`:""}
  ${!ms.length?`<div class="empty">Aucun match avec deux équipes connues pour l'instant. Faites le tirage ou générez le calendrier.</div>`:""}
  <p class="small muted" style="margin-top:12px">Les visuels reprennent le nom de la compétition, la catégorie, les logos des clubs, la date, le score et les buteurs, ainsi que les logos des partenaires confirmés.</p>`,null,
  (root)=>{const prev=root.querySelector("#vprev");const sel=root.querySelector("#vsz");sel.addEventListener("change",()=>visState.size=sel.value);
    const show=async(cv,name)=>{prev.innerHTML=`<div class="panel" style="text-align:center"><img src="${cv.toDataURL("image/png")}" alt="Aperçu du visuel" style="max-width:100%;max-height:52vh;border-radius:10px"><div class="row" style="justify-content:center;margin-top:10px"><button class="btn" data-vpng>Télécharger PNG</button><button class="btn ghost" data-vpdf>Télécharger PDF</button></div></div>`;
      prev.querySelector("[data-vpng]").onclick=()=>saveBinary(name+".png",canvasPNG(cv),"png").then(ok=>ok&&toast("Visuel exporté"));
      prev.querySelector("[data-vpdf]").onclick=()=>saveBinary(name+".pdf",pdfFromCanvases([{cv,pw:cv.width*0.75,ph:cv.height*0.75}]),"pdf").then(ok=>ok&&toast("Visuel exporté"));prev.scrollIntoView({behavior:"smooth",block:"start"})};
    root.querySelectorAll("[data-vis]").forEach(b=>b.addEventListener("click",async()=>{b.disabled=true;const m=ms.find(x=>x.n===+b.dataset.vis);const cv=await drawMatchVisual(m,b.dataset.k,visState.size);
      await show(cv,xSafe(`${edoc().nom}-${b.dataset.k==="resultat"?"Resultat":"Affiche"}-${cName(m.c1)}-${cName(m.c2)}-${visState.size}`));b.disabled=false}));
    const vd=root.querySelector("[data-vday]");vd&&vd.addEventListener("click",async()=>{const d=root.querySelector("#vday").value;const L=ms.filter(m=>m.date===d).sort((a,b)=>(a.heure||"").localeCompare(b.heure||""));const cv=await drawDayVisual(L,visDate(d,""),visState.size);await show(cv,xSafe(`${edoc().nom}-Programme-${d}-${visState.size}`))});
    if(focusN){const b=root.querySelector(`[data-vis="${focusN}"]`);b&&b.click()}});
}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.closest("#modalroot"))return;if(t.dataset.act==="comp-visuals"&&ED())visualsModal()});

/* ================= ASSISTANT INTÉGRÉ ================= */
const MOIS_FR={janvier:1,fevrier:2,février:2,mars:3,avril:4,mai:5,juin:6,juillet:7,aout:8,août:8,septembre:9,octobre:10,novembre:11,decembre:12,décembre:12};
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function parseDateFr(txt){if(!txt)return"";const t=norm(txt);let m=/(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/.exec(t);let d,mo,y;
  if(m){d=+m[1];mo=+m[2];y=m[3]?(+m[3]<100?2000+ +m[3]:+m[3]):0}else{m=/(\d{1,2})(?:er)?\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)(?:\s+(\d{4}))?/.exec(t);if(!m)return"";d=+m[1];mo=MOIS_FR[m[2]];y=m[3]?+m[3]:0}
  if(!y){const now=new Date();y=now.getFullYear();const cand=new Date(y,mo-1,d);if(cand<new Date(now.getFullYear(),now.getMonth(),now.getDate()))y++}
  return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
const DATE_RX="(\\d{1,2}[\\/.-]\\d{1,2}(?:[\\/.-]\\d{2,4})?|\\d{1,2}(?:er)?\\s+(?:janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)(?:\\s+\\d{4})?)";
function findComp(text){const t=norm(text);let best=null,score=0;Object.entries(S.comps).forEach(([id,c])=>{const n=norm(c.nom);if(n&&t.includes(n)){if(n.length>score){best=id;score=n.length}}else{const toks=n.split(/\s+/).filter(w=>w.length>2);const hit=toks.filter(w=>t.includes(w)).length;if(toks.length&&hit/toks.length>=0.6&&hit*3>score){best=id;score=hit*3}}});return best}
function findClubs(text){const t=" "+norm(text).replace(/[,;]/g," , ")+" ";const out=[];Object.entries(S.clubs).forEach(([id,c])=>{if(c.shared)return;const n=norm(c.nom),sg=norm(c.sigle);if((n&&t.includes(n))||(sg&&new RegExp("[\\s,]"+sg.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"[\\s,]").test(t)))out.push(id)});return out}
function catOf(text){const t=norm(text);const m=/\bu\s?-?(\d{2})\b/.exec(t);if(m)return "U"+m[1];if(/senior/.test(t))return"Seniors";if(/veteran/.test(t))return"Vétérans";if(/feminin|dames|filles/.test(t))return"Féminines";return""}
function ruleParse(text){
  const t=norm(text),acts=[];
  if(/(ajoute|inscris|inscrit|engage|integre)/.test(t)&&findClubs(text).length)return[{type:"add_teams",competition:findComp(text),clubs:findClubs(text),categorie:catOf(text),valider:/valid/.test(t)}];
  if(/(cree|creer|nouvelle|nouveau|organise|lance|prepare)\b.*\b(competition|tournoi|championnat|coupe|ligue)/.test(t)){
    const type=/championnat|ligue|tous contre tous|aller.?retour/.test(t)?"championnat":"tournoi";
    const nb=(/(\d+)\s*(equipes|equipe|clubs|club)/.exec(t)||[])[1];const g=(/(\d+)\s*(groupes|groupe|poules|poule)/.exec(t)||[])[1];
    const fin=(new RegExp("finale\\s+(?:le\\s+|prevue\\s+le\\s+|du\\s+)?"+DATE_RX).exec(t)||[])[1];const deb=(new RegExp("(?:debut|debute|commence|demarre|a partir du|premier match|coup d.envoi)\\s+(?:le\\s+|du\\s+)?"+DATE_RX).exec(t)||[])[1];
    const nm=(/[«"“]([^»"”]{3,70})[»"”]/.exec(text)||/(?:appelee|appele|nommee|nomme|intitulee|intitule|baptisee)\s+([^,.;]{3,70})/i.exec(text)||[])[1];
    const bmin=(new RegExp("nes?\\s+(?:a partir du|apres le|le ou apres le)\\s+"+DATE_RX).exec(t)||[])[1];const bmax=(new RegExp("nes?\\s+(?:avant le|le ou avant le)\\s+"+DATE_RX).exec(t)||[])[1];
    acts.push({type:"create_competition",nom:nm?nm.trim():"",format:type,categorie:catOf(text),equipes:nb?+nb:null,groupes:g?+g:null,aller_retour:/aller.?retour/.test(t),date_debut:deb?parseDateFr(deb):"",date_finale:fin?parseDateFr(fin):"",lieu:((/(?:au|a|sur le)\s+(stade|terrain)\s+([^,.;]{2,50})/i.exec(text)||[])[0]||"").replace(/^(au|a|sur le)\s+/i,""),nes_apres:bmin?parseDateFr(bmin):"",nes_avant:bmax?parseDateFr(bmax):""});
    return acts}
  const comp=findComp(text);
  if(/(ajoute|inscris|inscrit|engage|integre)/.test(t)&&findClubs(text).length)acts.push({type:"add_teams",competition:comp,clubs:findClubs(text),categorie:catOf(text),valider:/valid/.test(t)});
  else if(/tirage/.test(t))acts.push({type:"draw",competition:comp});
  else if(/calendrier/.test(t)&&/(genere|cree|fais|lance)/.test(t))acts.push({type:"generate_calendar",competition:comp});
  else if(/(visuel|affiche|annonce|flyer)/.test(t)){const n=(/match\s*(?:n°|no|numero)?\s*(\d+)/.exec(t)||[])[1];acts.push({type:"match_visual",competition:comp,match:n?+n:"prochain",modele:/resultat|score/.test(t)?"resultat":"affiche"})}
  else if(/licence/.test(t)){const cl=findClubs(text);acts.push({type:"licences",club:cl[0]||null,categorie:catOf(text),format:/planche|a4|imprim/.test(t)?"planche":"pdf"})}
  else if(/(export|telecharge|pdf|png|image)/.test(t)){const doc=/buteur/.test(t)?"buteurs":/passeur/.test(t)?"passeurs":/carton|suspen/.test(t)?"cartons":/tirage/.test(t)?"tirage":/resultat|calendrier/.test(t)?"resultats":"classement";acts.push({type:"export",competition:comp,document:doc,format:/png|image/.test(t)?"png":"pdf"})}
  else if(/(ouvre|affiche|montre|voir|va sur|aller)/.test(t)&&comp){const tab=/classement/.test(t)?"classement":/tirage/.test(t)?"tirage":/match|resultat|calendrier/.test(t)?"matchs":/buteur/.test(t)?"buteurs":/stat/.test(t)?"stats":"participants";acts.push({type:"open_competition",competition:comp,onglet:tab})}
  return acts;
}
async function aiParse(text){
  let sample=null;try{sample=window.claude&&claude.use?await claude.use("sample"):null}catch(e){}if(!sample)return null;
  const ctx={aujourdhui:new Date().toISOString().slice(0,10),competitions:Object.entries(S.comps).map(([id,c])=>({id,nom:c.nom,format:c.type,categorie:c.cat||""})),clubs:Object.entries(S.clubs).filter(([i,c])=>!c.shared).map(([id,c])=>({id,nom:c.nom,sigle:c.sigle,categories:Object.values(c.teams||{}).map(t=>t.cat)})).slice(0,300),formats_tournoi:"8 équipes=2 poules de 4 ; 12=4 poules de 3 ; 16=4 poules de 4 ; 24=8 poules de 3 ; 32=8 poules de 4"};
  const prompt=`Tu es l'assistant de NARX Foot Manager (gestion de compétitions de football). Transforme la demande de l'administrateur en actions JSON.
Contexte (JSON) : ${JSON.stringify(ctx)}
Demande : ${JSON.stringify(text)}
Réponds UNIQUEMENT avec un objet JSON : {"actions":[...],"reponse":"une phrase en français"}.
Types d'action possibles (utilise les identifiants du contexte pour competition et clubs) :
- {"type":"create_competition","nom":"","format":"tournoi"|"championnat","categorie":"U17"|...,"equipes":16,"groupes":4,"aller_retour":false,"date_debut":"AAAA-MM-JJ"|"","date_finale":"AAAA-MM-JJ"|"","lieu":"","nes_apres":"AAAA-MM-JJ"|"","nes_avant":"AAAA-MM-JJ"|""}
- {"type":"open_competition","competition":"id","onglet":"participants"|"tirage"|"matchs"|"stats"|"classement"|"buteurs"}
- {"type":"add_teams","competition":"id","clubs":["id club"],"categorie":"U17","valider":true|false}
- {"type":"draw","competition":"id"} (tirage au sort d'un tournoi)
- {"type":"generate_calendar","competition":"id"} (calendrier d'un championnat)
- {"type":"match_visual","competition":"id","match":numéro|"prochain","modele":"affiche"|"resultat"}
- {"type":"export","competition":"id","document":"classement"|"buteurs"|"passeurs"|"cartons"|"tirage"|"resultats","format":"pdf"|"png"}
- {"type":"licences","club":"id"|null,"categorie":"","format":"pdf"|"planche"}
Si une date n'a pas d'année, prends la prochaine occurrence après aujourd'hui. Si la demande est impossible ou floue, renvoie "actions":[] et explique dans "reponse".`;
  try{const r=await sample.json(prompt,{modelTier:"quick"});if(r&&Array.isArray(r.actions))return r;return null}catch(e){if(e&&e.code==="not_granted")return null;return null}
}
function describeAction(a){const cn=id=>id&&S.comps[id]?`« ${S.comps[id].nom} »`:"la compétition ouverte";const cl=id=>S.clubs[id]?S.clubs[id].nom:id;
  switch(a.type){
    case"create_competition":{const nb=a.equipes||(a.format==="championnat"?10:16);return `Créer ${a.format==="championnat"?"le championnat":"le tournoi"} « ${a.nom||defaultCompName(a)} »${a.categorie?" en "+a.categorie:""} avec ${nb} équipes${a.format!=="championnat"&&FORMATS[nb]?` (${FORMATS[nb].g} poules de ${FORMATS[nb].size})`:""}${a.aller_retour?", aller et retour":""}${a.date_debut?", début le "+fmtDate(a.date_debut):""}${a.date_finale?", finale le "+fmtDate(a.date_finale):""}${a.lieu?", à "+a.lieu:""}${a.nes_apres?", joueurs nés le ou après le "+fmtDate(a.nes_apres):""}.`}
    case"open_competition":return `Ouvrir ${cn(a.competition)}${a.onglet?" (partie "+a.onglet+")":""}.`;
    case"add_teams":return `Ajouter ${(a.clubs||[]).map(cl).join(", ")} à ${cn(a.competition)}${a.categorie?" en "+a.categorie:""}${a.valider?" et les valider":""}.`;
    case"draw":return `Faire le tirage au sort de ${cn(a.competition)} et le valider.`;
    case"generate_calendar":return `Générer le calendrier de ${cn(a.competition)}.`;
    case"match_visual":return `Créer ${a.modele==="resultat"?"le visuel du résultat":"l'affiche"} du ${a.match==="prochain"||!a.match?"prochain match":"match "+a.match} de ${cn(a.competition)}.`;
    case"export":return `Exporter ${a.document||"le classement"} de ${cn(a.competition)} en ${(a.format||"pdf").toUpperCase()}.`;
    case"licences":return `Exporter les licences${a.club?" de "+cl(a.club):""}${a.categorie?" ("+a.categorie+")":""} en ${a.format==="planche"?"planche A4":"PDF"}.`;
    default:return "Action non reconnue."}}
function defaultCompName(a){return `${a.format==="championnat"?"Championnat":"Tournoi"}${a.categorie?" "+a.categorie:""} ${(a.date_finale||a.date_debut||String(new Date().getFullYear())).slice(0,4)}`}
async function selectComp(id){if(id&&S.comps[id]&&ED()!==id)await write("config/current",{edition:id});if(!edoc())throw new Error("Précisez la compétition (son nom), ou ouvrez-la d'abord.");ui.tab="comps";ui.inComp=true}
async function execAction(a){
  switch(a.type){
    case"create_competition":{const type=a.format==="championnat"?"championnat":"tournoi";let nb=+a.equipes||(type==="championnat"?10:16);let note="";
      if(type==="tournoi"){if(!FORMATS[nb]){const ok=Object.keys(FORMATS).map(Number);const near=ok.reduce((p,x)=>Math.abs(x-nb)<Math.abs(p-nb)?x:p,16);note=` (${nb} équipes n'existe pas en tournoi : ${near} retenues)`;nb=near}
        if(a.groupes&&FORMATS[nb].g!==+a.groupes)note+=` (avec ${nb} équipes, le format est de ${FORMATS[nb].g} poules de ${FORMATS[nb].size})`}
      const id="c"+uid();const now=new Date().toISOString();const base={nom:a.nom||defaultCompName(a),type,cat:a.categorie||"",saison:String((a.date_finale||a.date_debut||now).slice(0,4)),start:a.date_debut||"",lieu:a.lieu||"",maxPlayers:25,birthMin:a.nes_apres||"",birthMax:a.nes_avant||"",createdAt:now,createdBy:"assistant"};
      const doc=type==="tournoi"?{...base,nbClubs:nb,reset:"QF",approved:[],entries:[],draw:null,locked:false}:{...base,nbClubs:Math.max(2,Math.min(40,nb)),mode:a.aller_retour?"aller-retour":"simple",pts:{v:3,n:1,d:0},participants:[],fixtures:[]};
      await write(`competitions/${id}`,doc);await write("config/current",{edition:id});
      if(type==="tournoi"&&a.date_finale){let sch=buildSchedule();const fin=sch.find(m=>m.stage==="F");if(!doc.start&&fin&&fin.date){const t0=new Date((sch[0].date||now.slice(0,10))+"T12:00:00"),t1=new Date(fin.date+"T12:00:00");const dur=Math.round((t1-t0)/864e5);doc.start=addDays(a.date_finale,-dur);await write(`competitions/${id}`,doc);sch=buildSchedule()}
        const f=sch.find(m=>m.stage==="F"),p3=sch.find(m=>m.stage==="3P");if(f)await write(`competitions/${id}/matches/m${f.n}`,{date:a.date_finale,heure:"16:00"});if(p3)await write(`competitions/${id}/matches/m${p3.n}`,{date:a.date_finale,heure:"13:30"})}
      ui.tab="comps";ui.inComp=true;ui.ctab="participants";ui.lgTab="participants";await ensureAllLinks();render();
      if(formUrl()&&(!(window.ggStore&&window.ggStore.fetchText)||syncCfg().key)){try{await createCompGoogle(id,true)}catch(e){}}
      return `Compétition « ${doc.nom} » créée${note}.${a.date_finale?" Finale fixée le "+fmtDate(a.date_finale)+".":""} Son lien d'inscription est prêt.`}
    case"open_competition":{await selectComp(a.competition);const tb=a.onglet||"participants";if(isLeague())ui.lgTab={classement:"classement",matchs:"calendrier",tirage:"calendrier",buteurs:"buteurs",stats:"classement"}[tb]||"participants";else{ui.ctab={classement:"stats",buteurs:"stats",matchs:"matchs",tirage:"tirage",stats:"stats"}[tb]||"participants";if(tb==="buteurs")ui.statsTab="buteurs"}render();return "Compétition ouverte."}
    case"add_teams":{await selectComp(a.competition);const c=clone(edoc());const cat=a.categorie||c.cat;const added=[],miss=[];
      for(const cid of a.clubs||[]){const cl=S.clubs[cid];if(!cl){miss.push(cid);continue}const tid=Object.keys(cl.teams||{}).find(k=>!cat||cl.teams[k].cat===cat);if(!tid){miss.push(`${cl.nom} (pas d'équipe ${cat})`);continue}const key=tkey(cid,tid);
        if(c.type==="championnat"){if(!(c.participants||[]).some(p=>p.club===key)){const act=(c.participants||[]).filter(p=>p.status==="valide").length;c.participants=[...(c.participants||[]),{club:key,status:a.valider&&act<c.nbClubs?"valide":"inscrit",addedAt:new Date().toISOString()}]}}
        else{if(a.valider&&(c.approved||[]).length<c.nbClubs){c.approved=[...new Set([...(c.approved||[]),key])];c.entries=(c.entries||[]).filter(x=>x!==key)}else if(!(c.approved||[]).includes(key))c.entries=[...new Set([...(c.entries||[]),key])]}added.push(cl.nom)}
      await write(`competitions/${ED()}`,c);render();return `${added.length} équipe(s) ajoutée(s)${a.valider?" et validée(s)":""}${added.length?" : "+added.join(", "):""}.${miss.length?" Introuvables : "+miss.join(", ")+".":""}`}
    case"draw":{await selectComp(a.competition);if(isLeague())return execAction({type:"generate_calendar",competition:ED()});const A=approvedClubs();if(A.length!==nbClubs())throw new Error(`Le tirage nécessite ${nbClubs()} équipes validées (${A.length} actuellement).`);if(drawLocked())return "Le tirage est déjà validé.";
      const F=fmt(),L="ABCDEFGH".slice(0,F.g).split("");const ids=shuffle(A.map(x=>x.id));const order=[];for(let k=1;k<=F.size;k++)L.forEach(p=>order.push(p+k));const d={};ids.forEach((id,i)=>d[order[i]]=id);
      await updEdition({draw:d,locked:true,drawnAt:new Date().toISOString()});ui.ctab="tirage";render();return "Tirage effectué et validé. Le calendrier des matchs est généré."}
    case"generate_calendar":{await selectComp(a.competition);if(!isLeague())return execAction({type:"draw",competition:ED()});const ids=lgActive();if(ids.length<2)throw new Error("Validez au moins deux équipes avant de générer le calendrier.");if((LG().fixtures||[]).some(f=>(S.lmatches[f.id]||{}).done))throw new Error("Des matchs sont déjà joués : le calendrier ne peut plus être régénéré.");
      await saveLeague({fixtures:buildFixtures(ids,LG().mode),generatedAt:new Date().toISOString()});ui.lgTab="calendrier";render();return `Calendrier généré : ${LG().fixtures.length} matchs.`}
    case"match_visual":{await selectComp(a.competition);const ms=compMatches().filter(m=>m.c1&&m.c2);let m=null;if(a.match&&a.match!=="prochain")m=ms.find(x=>x.n===+a.match);
      if(!m)m=a.modele==="resultat"?ms.filter(x=>x.done).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||y.n-x.n)[0]:ms.filter(x=>!x.done).sort((x,y)=>(x.date||"9").localeCompare(y.date||"9")||x.n-y.n)[0];
      if(!m)throw new Error("Aucun match correspondant avec deux équipes connues.");render();setTimeout(()=>visualsModal(m.n),50);return `Visuel du match ${cName(m.c1)} – ${cName(m.c2)} en préparation.`}
    case"export":{await selectComp(a.competition);const map={classement:["classement","classements"],buteurs:["buteurs"],passeurs:["passeurs"],cartons:["cartons"],tirage:["tirage"],resultats:["resultats","calendrier"]};const items=exportItems();const it=items.find(i=>(map[a.document]||["classement"]).includes(i.id));if(!it)throw new Error("Document indisponible pour cette compétition.");await runExport(it,a.format==="png"?"png":"pdf");return `Export « ${it.label} » lancé.`}
    case"licences":{ui.licClub=a.club&&S.clubs[a.club]?a.club:"";ui.licCat=a.categorie||"";ui.licType="";ui.tab="licences";render();await licExportBatch(a.format==="planche"?"sheet":"cards");return "Export des licences lancé."}
    default:throw new Error("Je n'ai pas compris cette action.")}
}
let asstPlan=null;
function assistantModal(){
  const ex=["Crée une compétition U17 avec 16 équipes, 4 groupes et une finale le 20 décembre","Crée un championnat Seniors aller-retour de 10 équipes qui commence le 10 janvier","Ajoute les clubs ESL, EAG et RSO à la compétition U17 et valide-les","Fais le tirage de la compétition U17","Crée l'affiche du prochain match","Exporte le classement en PNG"];
  openModal(`<header><h2>Assistant NARX</h2><button class="x" data-close aria-label="Fermer">×</button></header>
  <p class="small muted">Écrivez ce que vous voulez faire, comme vous le diriez à un collaborateur. L'assistant vous montre ce qu'il a compris avant d'agir.</p>
  <form id="asf"><div class="f"><label for="asq">Votre demande</label><textarea id="asq" rows="3" required style="background:#0B1430;border:1px solid var(--line);border-radius:10px;padding:10px 12px;width:100%;color:#fff;font:inherit" placeholder="Ex. : Crée une compétition U17 avec 16 équipes, 4 groupes et une finale le 20 décembre"></textarea></div>
  <div class="row" style="justify-content:space-between"><div class="row small">${ex.map(x=>`<button type="button" class="chip" data-ex="${esc(x)}" style="border:0;cursor:pointer">${esc(x.length>46?x.slice(0,44)+"…":x)}</button>`).join("")}</div><button class="btn" type="submit">Comprendre</button></div></form>
  <div id="asout" style="margin-top:14px" aria-live="polite"></div>`,async()=>false,
  root=>{const q=root.querySelector("#asq"),out=root.querySelector("#asout");q.focus();
    root.querySelectorAll("[data-ex]").forEach(b=>b.addEventListener("click",()=>{q.value=b.dataset.ex;q.focus()}));
    q.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();root.querySelector("#asf").requestSubmit()}});
    root.querySelector("#asf").addEventListener("submit",async e=>{e.preventDefault();const text=q.value.trim();if(!text)return;out.innerHTML=`<p class="muted">Analyse de la demande…</p>`;
      let plan=null,via="règles";const ai=await aiParse(text);if(ai&&ai.actions&&ai.actions.length){plan=ai;via="Claude"}else{const acts=ruleParse(text);plan={actions:acts,reponse:ai&&ai.reponse||""}}
      plan.actions=(plan.actions||[]).filter(a=>a&&a.type);asstPlan=plan;
      if(!plan.actions.length){out.innerHTML=`<div class="notice">${esc(plan.reponse||"Je n'ai pas compris. Essayez par exemple : « Crée une compétition U17 avec 16 équipes et une finale le 20 décembre ».")}</div>`;return}
      out.innerHTML=`<div class="panel"><b>Voici ce que j'ai compris :</b><ol style="margin:8px 0 12px 18px;padding:0">${plan.actions.map(a=>`<li style="margin-bottom:4px">${esc(describeAction(a))}</li>`).join("")}</ol>${plan.reponse&&via==="Claude"?`<p class="small muted">${esc(plan.reponse)}</p>`:""}<div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-asno>Corriger la demande</button><button type="button" class="btn" data-asgo>Exécuter</button></div></div>`;
      out.querySelector("[data-asno]").onclick=()=>{out.innerHTML="";q.focus()};
      out.querySelector("[data-asgo]").onclick=async ev=>{ev.target.disabled=true;const res=[];for(const a of asstPlan.actions){try{res.push("✓ "+await execAction(a))}catch(err){res.push("✗ "+(err&&err.message||"Action impossible."))}}
        out.innerHTML=`<div class="panel">${res.map(r=>`<p style="margin:4px 0">${esc(r)}</p>`).join("")}<div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-asnew>Nouvelle demande</button><button type="button" class="btn" data-close>Fermer</button></div></div>`;
        out.querySelector("[data-asnew]").onclick=()=>{out.innerHTML="";q.value="";q.focus()};out.querySelector("[data-close]").onclick=()=>{document.getElementById("modalroot").innerHTML=""}}})});
}
function assistantFab(){let b=document.getElementById("asfab");if(isAdmin()&&ui.unlocked===true&&DATA["local/settings"]){if(!b){b=document.createElement("button");b.id="asfab";b.className="btn";b.setAttribute("aria-label","Ouvrir l'assistant");b.innerHTML="✦ Assistant";b.onclick=assistantModal;document.body.appendChild(b)}}else if(b)b.remove()}
setInterval(assistantFab,800);

/* ================= boot ================= */
function subscribeMatches(){
  if(!db)return;const ed=ED();if(ed===subscribedEd)return;if(unsubMatches)unsubMatches();subscribedEd=ed;S.matches={};if(!ed)return;
  unsubMatches=db.collection(`editions/${ed}/matches`).onSnapshot(s=>{const o={};s.docs.forEach(d=>o[d.id]=d.data());S.matches=o;render()},()=>{});
}
async function loadNames(){if(!userCap||!isAdmin())return;const ids=Object.keys(S.clubs).filter(id=>!id.startsWith("adm-")&&!S.names[id]);if(!ids.length)return;
  try{const ps=await userCap.profiles(ids);let ch=false;ids.forEach(id=>{const n=ps[id]&&ps[id].name;if(n){S.names[id]="Dirigeant : "+n;ch=true}});if(ch)render()}catch(e){}}
render();
(async()=>{try{const t=await window.ggStore.load();if(t)DATA=JSON.parse(t)}catch(e){toast("Fichier de données illisible. Une copie de secours (.bak) se trouve dans le dossier des données.")}if(migrateV2()){persist();setTimeout(()=>toast("Données de la version précédente reprises : vos éditions sont devenues des compétitions"),600)}rebuild();S.loaded=true;render()})();
