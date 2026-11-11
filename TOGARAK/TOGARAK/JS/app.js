'use strict';
/* ===== config: yillar shu yerda boshqariladi (yangi yil: MAX_YEAR ni oshiring) ===== */
const CFG={START_YEAR:2026,MAX_YEAR:2027};
const years=()=>{const c=new Date().getFullYear(),l=Math.max(CFG.MAX_YEAR,c),a=[];for(let y=CFG.START_YEAR;y<=l;y++)a.push(y);return a};
const MN=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const WD=['Du','Se','Ch','Pa','Ju','Sh','Ya'];
const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const key=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
const dim=(y,m)=>new Date(y,m+1,0).getDate();
const todayKey=()=>{const t=new Date();return key(t.getFullYear(),t.getMonth(),t.getDate())};
const LBL={p:'Qatnashdim',a:'Bormadim'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ===== storage ===== */
const SK='togarak.v2';let S,view='dash';
function load(){try{S=JSON.parse(localStorage.getItem(SK))}catch(e){S=null}
 S=S&&S.attendance?S:{schemaVersion:2,settings:{},attendance:{}};
 S.settings={name:'Foydalanuvchi',theme:'dark',year:new Date().getFullYear(),notif:false,time:'19:00',text:'Bugungi davomatni belgilashni unutmang! Bugun to‘garakka borgan bo‘lsangiz, kalendaringizga qayd kiriting.',lastSeen:0,lastNotified:'',...S.settings}}
function save(){try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){toast('Saqlashda xatolik!')}}
function toast(t){const e=$('#toast');e.textContent=t;e.className='on';setTimeout(()=>e.className='',2000)}
/* ===== year manager: yangi yil boshlansa avtomatik yangi kalendar ===== */
function syncYear(){const c=new Date().getFullYear();
 if(S.settings.lastSeen!==c){S.settings.lastSeen=c;if(years().includes(c))S.settings.year=c}
 if(!years().includes(S.settings.year))S.settings.year=c;save()}
/* ===== statistika: har yil alohida ===== */
function stats(y){const t=todayKey();let months=[],P=0,A=0,E=0;
 for(let m=0;m<12;m++){let p=0,a=0,e=0;
  for(let d=1;d<=dim(y,m);d++){const k=key(y,m,d);if(k>t)break;e++;const v=S.attendance[k];if(v==='p')p++;else if(v==='a')a++}
  months.push({p,a,e});P+=p;A+=a;E+=e}
 return{months,P,A,E,U:E-P-A,pct:E?Math.round(P/E*1000)/10:null}}
const pc=v=>v===null?'—':v+'%';
function mark(k,v){if(k>todayKey())return;if(v==='n')delete S.attendance[k];else S.attendance[k]=v;save();render()}
/* ===== sahifalar ===== */
function vDash(){const y=S.settings.year,s=stats(y),t=todayKey(),v=S.attendance[t],now=new Date();
 const rec=Object.keys(S.attendance).filter(k=>k.startsWith(y+'-')).sort().reverse().slice(0,6);
 const ms=stats(now.getFullYear()).months[now.getMonth()];
 return `<div class="card"><h2>Bugun — ${now.getDate()} ${MN[now.getMonth()]} ${now.getFullYear()}</h2>
 <p class="mut" style="margin-bottom:12px">Holat: <b class="${v==='p'?'g':v==='a'?'r':''}">${v?LBL[v]:'Belgilanmagan'}</b></p>
 <div class="btns"><button class="btn p" data-mk="${t}|p">Qatnashdim</button><button class="btn a" data-mk="${t}|a">Bormadim</button><button class="btn o" data-mk="${t}|n">Tozalash</button></div></div>
 <div class="card row"><div class="ring" style="background:conic-gradient(var(--g) ${(s.pct||0)*3.6}deg,var(--n) 0)"><div>${pc(s.pct)}</div></div>
 <div><h2>${y}-yil davomati</h2><span class="mut">Yillik davomat foizi</span></div></div>
 <div class="grid"><div class="card stat"><b class="g">${s.P}</b><span>Jami qatnashilgan</span></div><div class="card stat"><b class="r">${s.A}</b><span>Jami qatnashilmagan</span></div>
 <div class="card stat"><b>${s.U}</b><span>Belgilanmagan</span></div><div class="card stat"><b>${ms.p}/${ms.e}</b><span>Joriy oy (${MN[now.getMonth()]})</span></div></div>
 <div class="card"><h2>Oxirgi qaydlar</h2>${rec.map(k=>`<div class="rec"><span>${k}</span><b class="${S.attendance[k]==='p'?'g':'r'}">${LBL[S.attendance[k]]||''}</b></div>`).join('')||'<p class="mut">Hozircha qayd yo‘q</p>'}</div>
 <button class="btn p" data-go="cal">Kalendarga o‘tish</button>`}
function vCal(){const y=S.settings.year,t=todayKey(),st=stats(y);
 return `<h2>${y}-yil kalendari</h2><div class="months">`+MN.map((n,m)=>{const off=(new Date(y,m,1).getDay()+6)%7,s=st.months[m];
  let h=WD.map(w=>`<div class="wd">${w}</div>`).join('')+'<div></div>'.repeat(off);
  for(let d=1;d<=dim(y,m);d++){const k=key(y,m,d),v=S.attendance[k];
   h+=`<button class="d ${v||''} ${k>t?'f':''} ${k===t?'td':''}" ${k>t?'disabled':''} data-k="${k}">${d}</button>`}
  return `<div class="card"><div class="mh"><span>${n}</span><span class="mut">${s.p}/${s.e}</span></div><div class="days">${h}</div></div>`}).join('')+'</div>'}
function vStats(){const y=S.settings.year,s=stats(y);
 const mx=Math.max(...s.months.map(m=>m.p)),best=mx?MN[s.months.findIndex(m=>m.p===mx)]:'—';
 return `<div class="grid"><div class="card stat"><b>${pc(s.pct)}</b><span>${y} yillik davomat</span></div><div class="card stat"><b class="g">${s.P}</b><span>Qatnashilgan</span></div>
 <div class="card stat"><b class="r">${s.A}</b><span>Qatnashilmagan</span></div><div class="card stat"><b>${s.U}</b><span>Belgilanmagan</span></div></div>
 <div class="card"><h2>Oylar bo‘yicha (${y})</h2><div class="bars">${s.months.map((m,i)=>`<div class="bar"><span>${m.p}</span><i style="height:${m.e?m.p/m.e*100:0}%"></i><span>${MN[i].slice(0,3)}</span></div>`).join('')}</div>
 <p class="mut" style="margin-top:10px">Eng ko‘p qatnashilgan oy: <b>${best}</b></p></div>
 <div class="card"><h2>Yillarni taqqoslash</h2>${years().map(Y=>{const x=stats(Y);return `<div class="rec"><span>${Y}</span><span><b>${pc(x.pct)}</b> <span class="mut">(${x.P} kun)</span></span></div>`}).join('')}</div>`}
function vSet(){const st=S.settings,ys=years(),i=ys.indexOf(st.year);
 return `<div class="card"><h2>Profil va yil</h2>
 <div class="set"><span>Profil nomi</span><input type="text" id="nm" value="${esc(st.name)}"></div>
 <div class="set"><span>Faol yil</span><select id="ys">${ys.map(y=>`<option ${y===st.year?'selected':''}>${y}</option>`).join('')}</select></div>
 <div class="set"><span class="mut">Yangi yilga o‘tish (ma’lumot o‘chmaydi)</span><button class="btn o" data-act="next" ${i>=ys.length-1?'disabled':''}>${ys[i+1]||'—'} ga o‘tish</button></div>
 <div class="set"><span>Qorong‘i rejim</span><button class="sw ${st.theme==='dark'?'on':''}" data-act="theme"></button></div></div>
 <div class="card"><h2>Bildirishnomalar</h2>
 <div class="set"><span>Kunlik eslatma</span><button class="sw ${st.notif?'on':''}" data-act="notif"></button></div>
 <div class="set"><span>Eslatma vaqti</span><input type="time" id="tm" value="${st.time}"></div>
 <div class="set"><span>Xabar matni</span><input type="text" id="tx" style="width:100%" value="${esc(st.text)}"></div>
 <p class="mut">Ilova yopiq bo‘lganda eslatma uchun Push Server kerak (BACKEND).</p></div>
 <div class="card"><h2>Ma’lumotlar</h2><div class="btns"><button class="btn o" data-act="exp">Eksport (zaxira)</button><button class="btn o" data-act="imp">Tiklash (import)</button></div>
 <input type="file" id="file" accept=".json" hidden></div>`}
const V={dash:vDash,cal:vCal,stats:vStats,set:vSet};
function render(){document.documentElement.dataset.theme=S.settings.theme;
 $('#hello').textContent=S.settings.name;
 $('#yearSel').innerHTML=years().map(y=>`<option ${y===S.settings.year?'selected':''}>${y}</option>`).join('');
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===view));
 $('#view').innerHTML=V[view]()}
/* ===== hodisalar ===== */
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.v){view=t.dataset.v;render();scrollTo(0,0)}
 else if(t.dataset.go){view=t.dataset.go;render()}
 else if(t.dataset.mk){const[k,v]=t.dataset.mk.split('|');if($('#dlg').open)$('#dlg').close();mark(k,v)}
 else if(t.dataset.k){const k=t.dataset.k;$('#dlg').innerHTML=`<h2>${k}</h2><div class="btns" style="flex-direction:column">
  <button class="btn p" data-mk="${k}|p">Qatnashdim</button><button class="btn a" data-mk="${k}|a">Bormadim</button><button class="btn o" data-mk="${k}|n">Belgilanmagan</button></div>`;$('#dlg').showModal()}
 else if(t.dataset.act){const a=t.dataset.act;
  if(a==='next'){const ys=years();S.settings.year=ys[ys.indexOf(S.settings.year)+1];save();render()}
  if(a==='theme'){S.settings.theme=S.settings.theme==='dark'?'light':'dark';save();render()}
  if(a==='notif'){if(!S.settings.notif){if(!('Notification'in window)||(await Notification.requestPermission())!=='granted')return toast('Ruxsat berilmadi')}
   S.settings.notif=!S.settings.notif;save();render()}
  if(a==='exp'){const b=new Blob([JSON.stringify(S,null,1)],{type:'application/json'}),l=document.createElement('a');l.href=URL.createObjectURL(b);l.download=`togarak-zaxira-${todayKey()}.json`;l.click()}
  if(a==='imp')$('#file').click()}});
document.addEventListener('change',e=>{const i=e.target;
 if(i.id==='yearSel'||i.id==='ys'){S.settings.year=+i.value;save();render()}
 if(i.id==='nm'){S.settings.name=i.value.trim()||'Foydalanuvchi';save();$('#hello').textContent=S.settings.name}
 if(i.id==='tm'){S.settings.time=i.value;save()}
 if(i.id==='tx'){S.settings.text=i.value;save()}
 if(i.id==='file'&&i.files[0]){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.attendance)throw 0;
  if(!confirm('Zaxiradagi belgilar mavjud ma’lumotlarga qo‘shiladi. Davom etasizmi?'))return;
  Object.assign(S.attendance,d.attendance);save();render();toast('Tiklandi')}catch(x){toast('Fayl yaroqsiz')}};r.readAsText(i.files[0])}});
/* ===== eslatma (ilova ochiq paytda; yopiq holat uchun Push Server) ===== */
function remind(){const s=S.settings,n=new Date(),t=todayKey();
 if(!s.notif||!('Notification'in window)||Notification.permission!=='granted'||s.lastNotified===t||S.attendance[t])return;
 if(`${pad(n.getHours())}:${pad(n.getMinutes())}`<s.time)return;
 s.lastNotified=t;save();navigator.serviceWorker.ready.then(r=>r.showNotification('TO‘GARAK',{body:s.text,icon:'ASSETS/icons/icon-192.png'}))}
/* ===== ishga tushirish ===== */
load();syncYear();render();
setInterval(remind,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){syncYear();render();remind()}});
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
