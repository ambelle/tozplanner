const CLASSES = {
  "Bishop": {short:"BSP", provides:["Dispel","FMA"], needs:["SE/TH"], fma:true},
  "Bowmaster": {short:"BM", provides:["SE"], needs:[], self:true},
  "Marksman": {short:"MM", provides:["SE"], needs:["SI"]},
  "Wind Archer": {short:"WA", provides:["SE"], needs:["SI"]},
  "Buccaneer": {short:"Bucc", provides:["SI","TL"], needs:["SE/TH"]},
  "Thunder Breaker": {short:"TB", provides:["SI"], needs:["SE/TH"]},
  "Dual Blade": {short:"DB", provides:["TH"], needs:[], self:true},
  "Fire/Poison Mage": {short:"FP", provides:["FMA"], needs:["SE/TH"], fma:true},
  "Ice/Lightning Mage": {short:"IL", provides:["FMA"], needs:["SE/TH"], fma:true},
  "Blaze Wizard": {short:"BW", provides:["FMA"], needs:["SE/TH"], fma:true},
  "Evan": {short:"Evan", provides:["FMA"], needs:["SE only"], fma:true, seOnly:true},
  "Dawn Warrior": {short:"DW", provides:["EC","Stance"], needs:["SE/TH","SI"]},
  "Paladin": {short:"Pala", provides:["Threaten"], needs:["SE/TH","SI"]},
  "Dark Knight": {short:"DK", provides:["Dispel","HB"], needs:["SE/TH","SI"]},
  "Aran": {short:"Aran", provides:["CB"], needs:["SE/TH","SI"]},
  "Hero": {short:"Hero", provides:[], needs:["SE/TH","SI"]},
  "Shadower": {short:"Shad", provides:["Smoke"], needs:["SE/TH"]},
  "Night Lord": {short:"NL", provides:[], needs:["SE only"], seOnly:true},
  "Night Walker": {short:"NW", provides:[], needs:["SE only"], seOnly:true},
  "Corsair": {short:"Sair", provides:[], needs:["SE/TH","SI"]},
};

let players = [];
let plan = Array.from({length:7},()=>Array(6).fill(null));
let lockedSlots = Array.from({length:7},()=>Array(6).fill(false));
let dragId = null;

const defaultPlayers = [
  ["Thocky","Aran",250,"Belle"],["Tock","Night Walker",250,"Belle"],["Tocki","Bowmaster",250,"Belle"],["Tork","Blaze Wizard",250,"Belle"],["Tokk","Buccaneer",250,"Belle"],["Hell","Fire/Poison Mage",250,"Belle"],["Tocky","Bishop",250,"Belle"],
  ["Gillian","Dual Blade",250,"Gillian"],["ggil","Bowmaster",250,"Gillian"],["ggill","Buccaneer",250,"Gillian"],["Leaw","Aran",250,"Gillian"],["Gill","Fire/Poison Mage",250,"Gillian"],["Kaiko","Bishop",250,"Gillian"],["Arun","Dawn Warrior",250,"Gillian"]
];
const samplePublics = [["PublicMM","Marksman",240,"Public",1,7],["PublicNL","Night Lord",245,"Public",1,3],["PublicDK","Dark Knight",230,"Public",3,7],["PublicBW","Blaze Wizard",235,"Public",4,7],["PublicSair","Corsair",240,"Public",1,7],["PublicShad","Shadower",240,"Public",2,5]];

function id(){return Math.random().toString(36).slice(2,9)}
function avail(from=1,to=7){return Array.from({length:7},(_,i)=>i+1>=from&&i+1<=to)}
function addPlayer(ign, cls, level=250, owner="Public", from=1, to=7){players.push({id:id(),ign,cls,level:+level||0,owner,avail:avail(+from,+to)});save();render();}
function getP(pid){return players.find(p=>p.id===pid)}
function info(p){return CLASSES[p.cls]||{short:p.cls,provides:[],needs:[]}}
function provides(p,role){return info(p).provides.includes(role)}
function needs(p,need){return info(p).needs.includes(need)}
function isAvailable(p,r){return p.avail[r]}
function roundPlayers(r){return plan[r].map(getP).filter(Boolean)}
function inAnyPlan(pid){return plan.some(row=>row.includes(pid))}
function usedInRound(pid,r){return plan[r].includes(pid)}
function roundHas(r,role){return roundPlayers(r).some(p=>provides(p,role))}
function fmaCount(r){return roundPlayers(r).filter(p=>info(p).fma).length}
function evaluate(r){
  const ps=roundPlayers(r), hasSE=roundHas(r,"SE"), hasTH=roundHas(r,"TH"), hasSI=roundHas(r,"SI"), hasDispel=roundHas(r,"Dispel"), fma=fmaCount(r);
  const checks=[]; let score=100;
  if(!hasDispel){checks.push(["Missing Dispel","bad"]);score-=35}else checks.push(["Dispel OK",""]);
  if(fma===0){checks.push(["No FMA","bad"]);score-=25}else if(fma===1){checks.push(["Only 1 FMA","warn"]);score-=8}else checks.push(["2+ FMA",""]);
  const seOnly=ps.filter(p=>info(p).seOnly);
  if(seOnly.length && !hasSE){checks.push(["SE-only class without SE","bad"]);score-=35}else if(seOnly.length) checks.push(["SE-only covered",""]);
  const critNeed=ps.filter(p=>needs(p,"SE/TH"));
  if(critNeed.length && !(hasSE||hasTH)){checks.push(["Missing SE/TH","bad"]);score-=20}else if(critNeed.length) checks.push(["SE/TH covered",""]);
  const siNeed=ps.filter(p=>needs(p,"SI"));
  if(siNeed.length && !hasSI){checks.push(["SI recommended","warn"]);score-=12}else if(siNeed.length) checks.push(["SI covered",""]);
  if(ps.length<6){checks.push([`${6-ps.length} empty slot(s)`,"warn"]);score-=Math.max(0,6-ps.length)*4}
  return {score:Math.max(0,score),checks,ps};
}
function candidateScore(p,r,current){
  if(!isAvailable(p,r)||usedInRound(p.id,r)) return -9999;
  const before = evalWith(current).score;
  const after = evalWith([...current,p]).score;
  let s = after-before;
  if(provides(p,"Dispel") && !current.some(x=>provides(x,"Dispel"))) s+=40;
  if(info(p).fma && current.filter(x=>info(x).fma).length<2) s+=25;
  if(provides(p,"SE") && current.some(x=>info(x).seOnly)) s+=38;
  if(provides(p,"SI") && current.some(x=>needs(x,"SI"))) s+=26;
  if(provides(p,"TH") && current.some(x=>needs(x,"SE/TH")) && !current.some(x=>provides(x,"SE"))) s+=14;
  s += (p.level||0)/100;
  if(p.owner==="Belle" || p.owner==="Gillian") s+=2;
  return s;
}
function evalWith(ps){
  const hasSE=ps.some(p=>provides(p,"SE")), hasTH=ps.some(p=>provides(p,"TH")), hasSI=ps.some(p=>provides(p,"SI")), hasDispel=ps.some(p=>provides(p,"Dispel")), fma=ps.filter(p=>info(p).fma).length;
  let score=100;
  if(!hasDispel) score-=35; if(fma===0) score-=25; else if(fma===1) score-=8;
  if(ps.some(p=>info(p).seOnly)&&!hasSE) score-=35;
  if(ps.some(p=>needs(p,"SE/TH"))&&!(hasSE||hasTH)) score-=20;
  if(ps.some(p=>needs(p,"SI"))&&!hasSI) score-=12;
  score-=Math.max(0,6-ps.length)*4;
  return {score:Math.max(0,score)};
}
function autoPlan(onlyEmpty=false){
  if(!onlyEmpty){ plan = Array.from({length:7},()=>Array(6).fill(null)); lockedSlots = Array.from({length:7},()=>Array(6).fill(false)); }
  for(let r=0;r<7;r++){
    let current = roundPlayers(r);
    for(let s=0;s<6;s++){
      if(lockedSlots[r][s] || plan[r][s]) continue;
      const usedGlobal = new Set(current.map(p=>p.id));
      const candidates = players.filter(p=>!usedGlobal.has(p.id) && isAvailable(p,r));
      if(!candidates.length) break;
      candidates.sort((a,b)=>candidateScore(b,r,current)-candidateScore(a,r,current));
      const pick = candidates[0];
      if(candidateScore(pick,r,current)<-100) continue;
      plan[r][s]=pick.id; current.push(pick);
    }
  }
  // second pass: try simple swaps to fix SE-only, dispel, FMA holes
  for(let r=0;r<7;r++) improveRound(r);
  save();render();
}
function improveRound(r){
  for(let tries=0;tries<20;tries++){
    const ev=evaluate(r); if(ev.score>=88) return;
    let best=null;
    for(let slot=0;slot<6;slot++){
      if(lockedSlots[r][slot]) continue;
      const currentId=plan[r][slot];
      for(const cand of players){
        if(!isAvailable(cand,r) || plan[r].includes(cand.id)) continue;
        const old=plan[r][slot]; plan[r][slot]=cand.id; const newScore=evaluate(r).score; plan[r][slot]=old;
        if(newScore>ev.score && (!best || newScore>best.score)) best={slot,cand,score:newScore};
      }
    }
    if(best) plan[r][best.slot]=best.cand.id; else return;
  }
}
function suggestions(r){
  const ev=evaluate(r), ps=ev.ps, sugg=[];
  if(!roundHas(r,"Dispel")) sugg.push("Add Bishop or Dark Knight for Dispel.");
  if(fmaCount(r)<2) sugg.push(`Add ${fmaCount(r)===0?"1–2":"1 more"} FMA if possible.`);
  if(ps.some(p=>info(p).seOnly)&&!roundHas(r,"SE")) sugg.push("Add BM / MM / WA because NL/NW/Evan need SE only.");
  if(ps.some(p=>needs(p,"SI"))&&!roundHas(r,"SI")) sugg.push("Add Bucc or TB for SI.");
  if(!sugg.length) sugg.push("Looks stable. Only adjust for player preference or stronger DPS.");
  const best = players.filter(p=>isAvailable(p,r)&&!usedInRound(p.id,r)).sort((a,b)=>candidateScore(b,r,ps)-candidateScore(a,r,ps)).slice(0,3).map(p=>`${p.ign} (${info(p).short})`).join(", ");
  return `<b>Suggestion:</b> ${sugg.join(" ")}<br><b>Best available:</b> ${best||"None"}`;
}
function render(){renderClasses();renderPool();renderRounds();renderSummary();}
function renderClasses(){const sel=document.getElementById('classInput'); if(sel.children.length) return; Object.keys(CLASSES).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);});}
function card(p){
  const div=document.getElementById('playerTemplate').content.firstElementChild.cloneNode(true); div.dataset.id=p.id;
  div.querySelector('.p-ign').textContent=p.ign; div.querySelector('.p-class').textContent=`${info(p).short} · Lv ${p.level}`;
  div.querySelector('.p-tags').innerHTML=[...info(p).provides.map(t=>`<span class="tag key">${t}</span>`),...info(p).needs.map(t=>`<span class="tag need">Needs ${t}</span>`)].join('');
  div.querySelector('.p-avail').textContent=p.avail.map((v,i)=>v?`R${i+1}`:'·').join(' ')+` · ${p.owner||'Public'}`;
  div.addEventListener('dragstart',()=>dragId=p.id);return div;
}
function renderPool(){const q=document.getElementById('searchInput').value.toLowerCase(); const root=document.getElementById('playerPool'); root.innerHTML=''; players.filter(p=>(p.ign+p.cls+p.owner).toLowerCase().includes(q)).forEach(p=>{const c=card(p); if(inAnyPlan(p.id)) c.classList.add('used'); root.appendChild(c);});}
function renderRounds(){const root=document.getElementById('rounds'); root.innerHTML=''; for(let r=0;r<7;r++){const ev=evaluate(r); const el=document.createElement('div'); el.className='round'; el.innerHTML=`<div class="round-head"><h3>Round ${r+1}</h3><span class="score">${ev.score}/100</span></div><div class="slots"></div><div class="checks">${ev.checks.map(([t,k])=>`<span class="check ${k}">${t}</span>`).join('')}</div><div class="round-actions"><button class="small" data-opt="${r}">Optimize Round</button><button class="small" data-clear="${r}">Clear Round</button></div><div class="suggest">${suggestions(r)}</div>`; const slots=el.querySelector('.slots'); for(let s=0;s<6;s++){const sl=document.createElement('div');sl.className='slot'+(lockedSlots[r][s]?' locked':'');sl.dataset.r=r;sl.dataset.s=s; const p=getP(plan[r][s]); sl.innerHTML=p?'':'<div class="slot-empty">Drop player here</div>'; if(p){const c=card(p); c.draggable=true; c.addEventListener('dblclick',()=>{plan[r][s]=null;save();render();}); sl.appendChild(c);} sl.addEventListener('dragover',e=>e.preventDefault()); sl.addEventListener('drop',()=>{if(!dragId)return; place(dragId,r,s);}); sl.addEventListener('contextmenu',e=>{e.preventDefault();lockedSlots[r][s]=!lockedSlots[r][s];save();render();}); slots.appendChild(sl);} root.appendChild(el);} document.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{improveRound(+b.dataset.opt);save();render();}); document.querySelectorAll('[data-clear]').forEach(b=>{b.onclick=()=>{plan[+b.dataset.clear]=Array(6).fill(null);save();render();}});}
function place(pid,r,s){ if(!isAvailable(getP(pid),r)){alert('This player is not available for this round.');return;} for(let rr=0;rr<7;rr++)for(let ss=0;ss<6;ss++)if(plan[rr][ss]===pid)plan[rr][ss]=null; plan[r][s]=pid;save();render();}
function renderSummary(){const scores=[0,1,2,3,4,5,6].map(r=>evaluate(r).score); const critical=[0,1,2,3,4,5,6].filter(r=>evaluate(r).checks.some(c=>c[1]==='bad')).length; document.getElementById('summary').innerHTML=`<div class="metric"><b>${players.length}</b><span>Total players</span></div><div class="metric"><b>${plan.flat().filter(Boolean).length}</b><span>Filled slots</span></div><div class="metric"><b>${Math.round(scores.reduce((a,b)=>a+b,0)/7)}</b><span>Average score</span></div><div class="metric"><b>${critical}</b><span>Critical rounds</span></div>`;}
function save(){localStorage.setItem('tozAutoPlanner',JSON.stringify({players,plan,lockedSlots}));}
function load(){const raw=localStorage.getItem('tozAutoPlanner'); if(raw){try{const d=JSON.parse(raw); players=d.players||[]; plan=d.plan||plan; lockedSlots=d.lockedSlots||lockedSlots;}catch{}} if(!players.length) defaultPlayers.forEach(x=>addPlayer(...x));}

document.getElementById('addPlayerBtn').onclick=()=>addPlayer(ignInput.value.trim()||`Player${players.length+1}`,classInput.value,levelInput.value,ownerInput.value||'Public',fromRound.value,toRound.value);
document.getElementById('loadDefaultBtn').onclick=()=>{defaultPlayers.forEach(x=>{if(!players.some(p=>p.ign===x[0]))addPlayer(...x)});};
document.getElementById('samplePublicBtn').onclick=()=>samplePublics.forEach(x=>addPlayer(...x));
document.getElementById('autoPlanBtn').onclick=()=>autoPlan(false);
document.getElementById('optimizeBtn').onclick=()=>autoPlan(true);
document.getElementById('clearPlanBtn').onclick=()=>{plan=Array.from({length:7},()=>Array(6).fill(null));save();render();};
document.getElementById('exportBtn').onclick=()=>{importBox.value=JSON.stringify({players,plan,lockedSlots},null,2);};
document.getElementById('importBtn').onclick=()=>{try{const d=JSON.parse(importBox.value);players=d.players||players;plan=d.plan||plan;lockedSlots=d.lockedSlots||lockedSlots;save();render();}catch(e){alert('Invalid JSON')}};
document.getElementById('searchInput').oninput=renderPool;
load(); render();
