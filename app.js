const ROUNDS = [1,2,3,4,5,6,7];

const CLASS_RULES = {
  'Bishop': { short:'BSP', provides:['Dispel','FMA'], needs:['SE/TH'], notes:'Dispel + FMA' },
  'Dark Knight': { short:'DK', provides:['Dispel','HB'], needs:['SE/TH','SI'], notes:'Dispel + HB' },
  'Bowmaster': { short:'BM', provides:['SE'], needs:[], notes:'Self-reliant SE' },
  'Marksman': { short:'MM', provides:['SE'], needs:['SI'], notes:'SE provider, wants SI' },
  'Wind Archer': { short:'WA', provides:['SE'], needs:['SI'], notes:'SE provider, wants SI' },
  'Dual Blade': { short:'DB', provides:['TH'], needs:[], notes:'Self-reliant TH' },
  'Buccaneer': { short:'Bucc', provides:['SI','TL'], needs:['SE/TH'], notes:'SI + TL' },
  'Thunder Breaker': { short:'TB', provides:['SI'], needs:['SE/TH'], notes:'SI provider' },
  'Fire/Poison Mage': { short:'FP', provides:['FMA'], needs:['SE/TH'], notes:'FMA' },
  'Ice/Lightning Mage': { short:'IL', provides:['FMA'], needs:['SE/TH'], notes:'FMA' },
  'Blaze Wizard': { short:'BW', provides:['FMA'], needs:['SE/TH'], notes:'FMA' },
  'Evan': { short:'Evan', provides:['FMA'], needs:['SE Only'], notes:'FMA, SE only' },
  'Dawn Warrior': { short:'DW', provides:['Equinox','Stance'], needs:['SE/TH','SI'], notes:'Half-SI + stance' },
  'Paladin': { short:'Pala', provides:['Threaten'], needs:['SE/TH','SI'], notes:'Threaten' },
  'Aran': { short:'Aran', provides:['CB'], needs:['SE/TH','SI'], notes:'Combo Barrier' },
  'Hero': { short:'Hero', provides:[], needs:['SE/TH','SI'], notes:'DPS' },
  'Shadower': { short:'Shad', provides:['Smoke'], needs:['SE/TH'], notes:'Smoke' },
  'Night Lord': { short:'NL', provides:[], needs:['SE Only'], notes:'SE only' },
  'Night Walker': { short:'NW', provides:[], needs:['SE Only'], notes:'SE only' },
  'Corsair': { short:'Sair', provides:[], needs:['SE/TH','SI'], notes:'DPS' }
};

const initialPlayers = [
  {id:'b-thocky', owner:'Belle', ign:'Thocky', class:'Aran', level:'', availability:ROUNDS},
  {id:'b-tock', owner:'Belle', ign:'Tock', class:'Night Walker', level:'', availability:ROUNDS},
  {id:'b-tocki', owner:'Belle', ign:'Tocki', class:'Bowmaster', level:'', availability:ROUNDS},
  {id:'b-tork', owner:'Belle', ign:'Tork', class:'Blaze Wizard', level:'', availability:ROUNDS},
  {id:'b-tokk', owner:'Belle', ign:'Tokk', class:'Buccaneer', level:'', availability:ROUNDS},
  {id:'b-hell', owner:'Belle', ign:'Hell', class:'Fire/Poison Mage', level:'', availability:ROUNDS},
  {id:'b-tocky', owner:'Belle', ign:'Tocky', class:'Bishop', level:'', availability:ROUNDS},
  {id:'g-gillian', owner:'Gillian', ign:'Gillian', class:'Dual Blade', level:'', availability:ROUNDS},
  {id:'g-ggil', owner:'Gillian', ign:'ggil', class:'Bowmaster', level:'', availability:ROUNDS},
  {id:'g-ggill', owner:'Gillian', ign:'ggill', class:'Buccaneer', level:'', availability:ROUNDS},
  {id:'g-leaw', owner:'Gillian', ign:'Leaw', class:'Aran', level:'', availability:ROUNDS},
  {id:'g-gill', owner:'Gillian', ign:'Gill', class:'Fire/Poison Mage', level:'', availability:ROUNDS},
  {id:'g-kaiko', owner:'Gillian', ign:'Kaiko', class:'Bishop', level:'', availability:ROUNDS},
  {id:'g-arun', owner:'Gillian', ign:'Arun', class:'Dawn Warrior', level:'', availability:ROUNDS}
];

let state = JSON.parse(localStorage.getItem('tozTrainManager') || 'null') || {
  players: initialPlayers,
  placements: Object.fromEntries(ROUNDS.map(r => [r, Array(6).fill(null)])),
  selectedRound: 1
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rules = cls => CLASS_RULES[cls] || {short:cls, provides:[], needs:[], notes:''};
const playerById = id => state.players.find(p => p.id === id);

function init(){
  $('#classInput').innerHTML = Object.keys(CLASS_RULES).map(c=>`<option>${c}</option>`).join('');
  $('#roundPicker').innerHTML = ROUNDS.map(r=>`<label><input type="checkbox" value="${r}" checked>R${r}</label>`).join('');
  $('#roundFocus').innerHTML = ROUNDS.map(r=>`<option value="${r}">Round ${r}</option>`).join('');
  $('#roundFocus').value = state.selectedRound;
  bind(); render();
}

function bind(){
  $('#searchInput').addEventListener('input', renderLobby);
  $('#filterSelect').addEventListener('change', renderLobby);
  $('#roundFocus').addEventListener('change', e=>{ state.selectedRound = +e.target.value; save(false); renderInsights(); });
  $('#saveBtn').addEventListener('click',()=>save(true));
  $('#exportBtn').addEventListener('click', exportPlan);
  $('#resetBtn').addEventListener('click',()=>{ if(confirm('Reset planner to default?')){ localStorage.removeItem('tozTrainManager'); location.reload(); }});
  $('#importInput').addEventListener('change', importPlan);
  $('#addPlayerForm').addEventListener('submit', addPlayer);
  document.addEventListener('dragstart', e=>{ const card=e.target.closest('.playerCard'); if(card){ e.dataTransfer.setData('text/plain', card.dataset.id); card.classList.add('dragging'); }});
  document.addEventListener('dragend', e=>e.target.closest('.playerCard')?.classList.remove('dragging'));
}

function render(){ renderLobby(); renderTracker(); renderRounds(); renderInsights(); }

function renderLobby(){
  const used = new Set(Object.values(state.placements).flat().filter(Boolean));
  const q = $('#searchInput').value.toLowerCase();
  const f = $('#filterSelect').value;
  const players = state.players.filter(p => !used.has(p.id)).filter(p => {
    const r = rules(p.class); const hay = `${p.ign} ${p.class} ${r.short}`.toLowerCase();
    const roleMatch = f==='all' || [...r.provides,...r.needs].join(' ').toLowerCase().includes(f);
    return hay.includes(q) && roleMatch;
  });
  $('#lobby').innerHTML = players.map(cardHTML).join('') || `<p class="small">No available lobby players.</p>`;
  makeDrop($('#lobby'), id => removeFromRounds(id));
}

function renderRounds(){
  $('#rounds').innerHTML = ROUNDS.map(r => {
    const a = analyzeRound(r);
    return `<article class="roundCard">
      <div class="roundHead"><div><h2>Round ${r}</h2><p>${filledCount(r)}/6 filled · ${a.fma} FMA</p></div><span class="score ${a.score<70?'low':a.score<88?'mid':''}">${a.score}</span></div>
      <div class="slots">${state.placements[r].map((pid,i)=>slotHTML(r,i,pid)).join('')}</div>
      <div class="statusList">${a.pills.map(p=>`<span class="pill ${p.type}">${p.text}</span>`).join('')}</div>
    </article>`;
  }).join('');
  $$('.slot').forEach(slot => makeDrop(slot, id => placePlayer(id, +slot.dataset.round, +slot.dataset.slot)));
}

function slotHTML(round, slot, pid){
  return `<div class="slot ${pid?'':'empty'}" data-round="${round}" data-slot="${slot}"><div class="slotLabel">Slot ${slot+1}</div>${pid ? cardHTML(playerById(pid), true) : ''}</div>`;
}

function cardHTML(p){
  if(!p) return '';
  const r = rules(p.class);
  const tags = [...r.provides, ...r.needs].slice(0,5);
  return `<article class="playerCard" draggable="true" data-id="${p.id}">
    <div class="cardTop"><strong class="ign">${p.ign}</strong><span class="level">${p.level?`Lv ${p.level}`:''}</span></div>
    <div class="classLine">${r.short} · ${p.class}${p.owner?` · ${p.owner}`:''}</div>
    <div class="badges">${tags.map(t=>`<span class="badge ${tagClass(t)}">${t}</span>`).join('')}</div>
    <div class="availability">${ROUNDS.map(x=>`<span class="${p.availability.includes(x)?'yes':'no'}">${p.availability.includes(x)?'●':'○'}</span>`).join('')}</div>
  </article>`;
}

function tagClass(t){ return t.toLowerCase().replace(/[^a-z]+/g,''); }
function filledCount(r){ return state.placements[r].filter(Boolean).length; }
function party(r){ return state.placements[r].filter(Boolean).map(playerById).filter(Boolean); }
function provides(ps, tag){ return ps.some(p => rules(p.class).provides.includes(tag)); }
function needs(ps, need){ return ps.some(p => rules(p.class).needs.includes(need)); }

function analyzeRound(r){
  const ps = party(r), issues=[], pills=[];
  const hasDispel = provides(ps,'Dispel');
  const hasSE = provides(ps,'SE');
  const hasTH = provides(ps,'TH');
  const hasSI = provides(ps,'SI');
  const fma = ps.filter(p=>rules(p.class).provides.includes('FMA')).length;
  const seOnly = ps.filter(p=>rules(p.class).needs.includes('SE Only'));
  const siNeed = ps.filter(p=>rules(p.class).needs.includes('SI'));
  if(!hasDispel) issues.push({type:'bad', text:'Missing Dispel: add Bishop or Dark Knight.'});
  if(fma===0) issues.push({type:'bad', text:'No FMA: add Bishop / FP / IL / BW / Evan.'});
  else if(fma===1) issues.push({type:'warn', text:'Only 1 FMA. 2 FMA is ideal.'});
  if(seOnly.length && !hasSE) issues.push({type:'bad', text:`${seOnly.map(p=>p.ign).join(', ')} needs SE. TH does not help.`});
  if(needs(ps,'SE/TH') && !hasSE && !hasTH) issues.push({type:'warn', text:'Some classes want SE/TH, but there is no SE or TH provider.'});
  if(siNeed.length && !hasSI) issues.push({type:'warn', text:`SI recommended for ${siNeed.map(p=>p.ign).join(', ')}.`});
  if(ps.length<6) issues.push({type:'warn', text:`${6-ps.length} empty slot(s).`});
  pills.push({type:hasDispel?'ok':'bad', text:hasDispel?'Dispel OK':'No Dispel'});
  pills.push({type:fma>=2?'ok':fma===1?'warn':'bad', text:`${fma} FMA`});
  pills.push({type:(hasSE||hasTH)?'ok':'warn', text:`${hasSE?'SE ':''}${hasTH?'TH ':''}`.trim() || 'No SE/TH'});
  pills.push({type:hasSI?'ok':'warn', text:hasSI?'SI OK':'No SI'});
  let score = 100;
  issues.forEach(i=> score -= i.type==='bad'?22:9);
  if(ps.length<6) score -= (6-ps.length)*3;
  score = Math.max(0, Math.min(100, score));
  return {issues,pills,score,fma,hasSE,hasTH,hasSI,hasDispel};
}

function renderInsights(){
  const r = state.selectedRound; $('#roundFocus').value = r;
  const a = analyzeRound(r); const ps = party(r);
  const suggestions = suggestForRound(r);
  $('#roundInsight').innerHTML = `<div class="insightBox"><h3>Round ${r} Issues</h3>${a.issues.map(i=>`<div class="issue ${i.type}">${i.text}</div>`).join('') || '<div class="issue">Looks balanced.</div>'}</div>
  <div class="insightBox"><h3>Suggested Fills</h3>${suggestions.map(s=>`<div class="suggestion"><div><b>${s.p.ign}</b><div class="small">${s.p.class} · ${s.reason}</div></div><button onclick="quickPlace('${s.p.id}',${r})">Add</button></div>`).join('') || '<div class="small">No obvious suggestions from lobby.</div>'}</div>
  <div class="insightBox"><h3>Current Party</h3>${ps.map(p=>`<div class="issue"><b>${p.ign}</b> · ${p.class}</div>`).join('') || '<div class="small">No players yet.</div>'}</div>`;
  renderGlobalIssues();
}

function renderGlobalIssues(){
  const out=[];
  ROUNDS.forEach(r=> analyzeRound(r).issues.filter(i=>i.type==='bad').forEach(i=>out.push(`<div class="pill bad">R${r}: ${i.text}</div>`)));
  $('#globalIssues').innerHTML = out.join('') || '<div class="pill ok">No critical missing roles.</div>';
}

function suggestForRound(r){
  const used = new Set(Object.values(state.placements).flat().filter(Boolean));
  const a = analyzeRound(r), ps = party(r);
  return state.players.filter(p=>!used.has(p.id) && p.availability.includes(r)).map(p=>{
    const rr = rules(p.class); let score=0, reason=[];
    if(!a.hasDispel && rr.provides.includes('Dispel')){score+=50;reason.push('fixes Dispel')}
    if(a.fma<2 && rr.provides.includes('FMA')){score+=25;reason.push('adds FMA')}
    if(ps.some(x=>rules(x.class).needs.includes('SE Only')) && rr.provides.includes('SE')){score+=45;reason.push('covers SE-only')}
    if(ps.some(x=>rules(x.class).needs.includes('SI')) && rr.provides.includes('SI')){score+=25;reason.push('adds SI')}
    if(needs(ps,'SE/TH') && (rr.provides.includes('SE')||rr.provides.includes('TH'))){score+=18;reason.push('adds crit buff')}
    return {p,score,reason:reason.join(', ') || rr.notes};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
}

function renderTracker(){
  const used = new Set(Object.values(state.placements).flat().filter(Boolean));
  const owners = ['Belle','Gillian'];
  $('#trackerGrid').innerHTML = owners.map(o=>{
    const ps = state.players.filter(p=>p.owner===o);
    return `<div class="ownerBox"><h3>${o} · ${ps.filter(p=>used.has(p.id)).length}/${ps.length}</h3><div class="miniList">${ps.map(p=>`<span class="mini ${used.has(p.id)?'used':''}">${p.ign}</span>`).join('')}</div></div>`;
  }).join('');
}

function makeDrop(el, cb){
  el.addEventListener('dragover', e=>{e.preventDefault(); el.classList.add('dropHover')});
  el.addEventListener('dragleave', ()=>el.classList.remove('dropHover'));
  el.addEventListener('drop', e=>{ e.preventDefault(); el.classList.remove('dropHover'); const id=e.dataTransfer.getData('text/plain'); cb(id); save(false); render(); });
}

function removeFromRounds(id){ Object.keys(state.placements).forEach(r=> state.placements[r]=state.placements[r].map(x=>x===id?null:x)); }
function placePlayer(id,r,slot){
  const p = playerById(id); if(!p || !p.availability.includes(r)){ alert('This player is not available for this round.'); return; }
  removeFromRounds(id); state.placements[r][slot]=id; state.selectedRound=r;
}
window.quickPlace = (id,r)=>{ const idx = state.placements[r].findIndex(x=>!x); if(idx<0) return alert('Round is full.'); placePlayer(id,r,idx); save(false); render(); };

function addPlayer(e){
  e.preventDefault();
  const av = $$('#roundPicker input:checked').map(x=>+x.value);
  const ign = $('#ignInput').value.trim(); if(!ign || !av.length) return;
  state.players.push({id:'p-'+Date.now(), owner:'Public', ign, class:$('#classInput').value, level:$('#levelInput').value, availability:av});
  e.target.reset(); $$('#roundPicker input').forEach(x=>x.checked=true); save(false); render();
}
function save(show){ localStorage.setItem('tozTrainManager', JSON.stringify(state)); if(show) alert('Saved in this browser.'); }
function exportPlan(){ const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='toz-plan.json'; a.click(); }
function importPlan(e){ const f=e.target.files[0]; if(!f)return; const reader=new FileReader(); reader.onload=()=>{ state=JSON.parse(reader.result); save(false); render(); }; reader.readAsText(f); }

init();
