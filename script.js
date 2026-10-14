let K=7.6;const $=s=>document.querySelector(s),KEY="smartroute-v4";
const TY=["Accident","Roadwork","Event crowd","Signal failure"],LB=["Free flow","Slow traffic","Heavy congestion","Road closed"],COL=["var(--g)","var(--a)","var(--r)","var(--x)"],MU=[1,1.5,2.8,Infinity],RC=["var(--r1)","var(--r2)","var(--r3)"];
const AN={astar:"A*",dijkstra:"Dijkstra",bf:"Bellman-Ford"},CX={astar:"O(E log V) with heuristic",dijkstra:"O(V²) array / O(E log V) heap",bf:"O(V·E)"};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const MAXD=60,capD=v=>Math.min(v,MAXD),MAXMSG="A road can be at most 60 km. Choose closer places or enter a shorter distance.";
const fmt=m=>{m=Math.round(m);if(m<1)return"<1 min";return m<60?m+" min":Math.floor(m/60)+" h "+(m%60)+" min"};
const clock=m=>{const d=new Date(2000,0,1,0,0);d.setMinutes(Math.round(m));return d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})};

/* ---------- data ---------- */
const EX="# place,Name,latitude,longitude\n# road,From,To,distance_km,speed_kmh (distance up to 60 km)\nplace,Anand,22.5645,72.9289\nplace,Vallabh Vidyanagar,22.5499,72.9248\nplace,Karamsad,22.5436,72.8985\nplace,Nadiad,22.6916,72.8634\nroad,Anand,Vallabh Vidyanagar,4,40\nroad,Anand,Karamsad,6,40\nroad,Anand,Nadiad,20,70\nroad,Vallabh Vidyanagar,Karamsad,4,40";
function build(C,R){
 const la=C.map(c=>c[1]),lo=C.map(c=>c[2]),la0=Math.min(...la),la1=Math.max(...la),lo0=Math.min(...lo),cs=Math.cos((la0+la1)/2*Math.PI/180);
 const wk=Math.max((Math.max(...lo)-lo0)*111*cs,1),hk=Math.max((la1-la0)*111,1),sc=Math.min(360/wk,260/hk),ox=200-wk*sc/2,oy=150-hk*sc/2;K=1/sc;
 const nodes=C.map((c,i)=>({id:i+1,name:c[0],x:Math.round(ox+(c[2]-lo0)*111*cs*sc),y:Math.round(oy+(la1-c[1])*111*sc)}));
 const id=n=>{const k=nodes.find(x=>x.name.toLowerCase()===String(n).toLowerCase());return k&&k.id},edges=[];
 R.forEach((r,k)=>{const a=id(r[0]),b=id(r[1]);if(a&&b&&a!==b&&r[2]>0)edges.push({id:edges.length+1,a,b,d:r[2],s:r[3]>0?clamp(r[3],5,150):60,lvl:0,t:TY[k%4],auto:false})});
 return{nodes,edges,nid:nodes.length+1,eid:edges.length+1};
}
function importData(t){
 const C=[],R=[],bad=[],seen=new Set();
 t.split("\n").forEach((l,i)=>{const p=l.split(",").map(x=>x.trim());if(!p[0]||p[0][0]==="#")return;const k=(p[1]||"").toLowerCase();
  if(/^place$/i.test(p[0])&&k&&!seen.has(k)&&p[2]!==""&&p[3]!==""&&isFinite(p[2])&&isFinite(p[3])){seen.add(k);C.push([p[1],+p[2],+p[3]])}
  else if(/^road$/i.test(p[0])&&p[1]&&p[2]&&+p[3]>0&&+p[3]<=MAXD)R.push([p[1],p[2],+p[3],+p[4]||60,i+1]);
  else bad.push(i+1)});
 R.forEach(r=>{if(!seen.has(r[0].toLowerCase())||!seen.has(r[1].toLowerCase()))bad.push(r[4])});
 if(C.length<2)return"Add at least two places, for example: place,Anand,22.5645,72.9289";
 if(bad.length)return"Check line"+(bad.length>1?"s ":" ")+bad.join(", ")+". Each place needs a unique name, latitude and longitude. Each road needs two known places and a distance above 0 and up to 60 km.";
 G=build(C,R);S.from=S.to=null;S.roadSel=null;S.sel=0;S.move=false;$("#from").value="";$("#to").value="";if(S.auto)autoTraffic();return"";
}
function autoTraffic(){
 const[h,m]=S.dep.split(":").map(Number),t=h+m/60,rush=Math.max(Math.exp(-Math.pow(t-9,2)/3),Math.exp(-Math.pow(t-18,2)/3.5)),nt=t<5||t>22?.5:1;
 G.edges.forEach(e=>{if(e.lvl===3)return;const x=Math.sin(e.id*12.9898)*43758.5453,r=x-Math.floor(x),b=(r*.7+rush*.6)*nt;e.lvl=b<.5?0:b<.85?1:2});
}
function sample(){
 const C=[["Anand",22.5645,72.9289],["Vallabh Vidyanagar",22.5499,72.9248],["Karamsad",22.5436,72.8985],["Nadiad",22.6916,72.8634],["Petlad",22.475,72.8],["Sojitra",22.5476,72.7679],["Borsad",22.4097,72.8975],["Anklav",22.379,72.995],["Umreth",22.7061,73.1009],["Dakor",22.751,73.1517],["Vasad",22.467,73.065],["Vadodara",22.3072,73.1812],["Khambhat",22.3172,72.62],["Kheda",22.75,72.6833],["Mehmedabad",22.827,72.764]];
 const R=[["Anand","Vallabh Vidyanagar",4,40],["Anand","Karamsad",6,40],["Vallabh Vidyanagar","Karamsad",4,40],["Karamsad","Petlad",15,55],["Anand","Nadiad",20,70],["Anand","Petlad",21,60],["Anand","Borsad",24,60],["Anand","Umreth",28,60],["Anand","Sojitra",22,55],["Anand","Vasad",22,70],["Anand","Anklav",26,60],["Anand","Vadodara",45,80],["Vasad","Vadodara",25,80],["Anklav","Vadodara",25,70],["Vasad","Anklav",15,60],["Anklav","Borsad",14,55],["Vasad","Umreth",32,60],["Umreth","Dakor",12,55],["Umreth","Nadiad",30,60],["Nadiad","Dakor",35,60],["Nadiad","Kheda",21,60],["Nadiad","Mehmedabad",22,60],["Kheda","Mehmedabad",15,55],["Nadiad","Sojitra",22,60],["Petlad","Sojitra",12,55],["Petlad","Borsad",16,55],["Petlad","Khambhat",32,60],["Borsad","Khambhat",38,55]];
 return build(C,R);
}
function autoD(e,nodes){nodes=nodes||G.nodes;const A=nodes.find(n=>n.id===e.a),B=nodes.find(n=>n.id===e.b);return Math.hypot(A.x-B.x,A.y-B.y)*K*(1.05+((e.a*7+e.b*3)%10)/100)}
function load(){try{const j=JSON.parse(localStorage.getItem(KEY));if(!j||!j.g||!Array.isArray(j.g.nodes)||!Array.isArray(j.g.edges))return null;
 const ids=new Set(j.g.nodes.map(n=>n.id));j.g.edges=j.g.edges.filter(e=>ids.has(e.a)&&ids.has(e.b)&&e.d>0&&e.d<=MAXD&&e.s>0);
 j.g.nid=Math.max(0,...j.g.nodes.map(n=>n.id))+1;j.g.eid=Math.max(0,...j.g.edges.map(e=>e.id))+1;return j}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify({k:K,g:G,s:{from:S.from,to:S.to,algo:S.algo,mode:S.mode}}))}catch(e){}}

const saved=load();if(saved&&saved.k>0)K=saved.k;
let G=saved?saved.g:sample();
const now=new Date(),hhmm=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};
const S={from:saved?saved.s.from:null,to:saved?saved.s.to:null,algo:saved&&AN[saved.s.algo]?saved.s.algo:"astar",mode:saved&&saved.s.mode==="short"?"short":"fast",sel:0,roadSel:null,move:false,traffic:true,act:"from",tab:"places",err:"",auto:true,dep:hhmm()};
let NM,EM,ADJ,CUR={st:"empty"},lastSig="",lastPair="",lastF="",NOTR=false;
function rebuild(){NM=new Map(G.nodes.map(n=>[n.id,n]));EM=new Map(G.edges.map(e=>[e.id,e]));ADJ=new Map(G.nodes.map(n=>[n.id,[]]));G.edges.forEach(e=>{ADJ.get(e.a).push([e.b,e]);ADJ.get(e.b).push([e.a,e])})}
const nm=id=>NM.has(id)?NM.get(id).name:"?";

/* ---------- routing ---------- */
function w(e,mode){if(!NOTR&&e.lvl===3)return Infinity;if(mode==="short")return e.d;return e.d/e.s*60*(NOTR?1:MU[e.lvl])}
function hFn(algo,t,mode){
 if(algo!=="astar")return()=>0;
 const T=NM.get(t);let ratio=1,maxS=1;
 G.edges.forEach(e=>{const A=NM.get(e.a),B=NM.get(e.b),eu=Math.hypot(A.x-B.x,A.y-B.y)*K;if(eu>0)ratio=Math.min(ratio,e.d/eu);maxS=Math.max(maxS,e.s)});
 return id=>{const n=NM.get(id),h=Math.hypot(n.x-T.x,n.y-T.y)*K*ratio;return mode==="fast"?h/maxS*60:h};
}
function sp(algo,s,t,mode,bE=new Set(),bN=new Set()){
 const t0=performance.now(),ids=G.nodes.map(n=>n.id),dist=new Map(ids.map(i=>[i,Infinity])),prev=new Map();let ex=0,passes=0;const order=algo==="bf"?[s]:[],seen=new Set([s]);dist.set(s,0);
 if(algo==="bf"){
  for(let i=0;i<ids.length-1;i++){let ch=false;passes++;
   for(const e of G.edges){if(bE.has(e.id))continue;const c=w(e,mode);
    for(const[u,v]of[[e.a,e.b],[e.b,e.a]]){ex++;if(c===Infinity||bN.has(u)||bN.has(v))continue;if(dist.get(u)+c<dist.get(v)){dist.set(v,dist.get(u)+c);prev.set(v,[u,e]);ch=true;if(!seen.has(v)){seen.add(v);order.push(v)}}}}
   if(!ch)break}
 }else{
  const H=hFn(algo,t,mode),done=new Set(),F=new Map(ids.map(i=>[i,Infinity]));F.set(s,H(s));
  for(;;){let u=null;for(const i of ids)if(!done.has(i)&&F.get(i)<Infinity&&(u===null||F.get(i)<F.get(u)))u=i;
   if(u===null)break;done.add(u);ex++;order.push(u);if(u===t)break;
   for(const[v,e]of ADJ.get(u)){if(bE.has(e.id)||bN.has(v))continue;const c=w(e,mode);if(c===Infinity)continue;
    if(dist.get(u)+c<dist.get(v)){dist.set(v,dist.get(u)+c);prev.set(v,[u,e]);F.set(v,dist.get(v)+H(v))}}}
 }
 const ms=performance.now()-t0;if(dist.get(t)===Infinity)return null;
 const path=[t],edges=[];for(let v=t;v!==s;){const[u,e]=prev.get(v);path.unshift(u);edges.unshift(e);v=u}
 return{path,edges,cost:dist.get(t),ex,ms,order,passes};
}
const cst=(edges,mode)=>edges.reduce((a,e)=>a+w(e,mode),0);
function kRoutes(algo,s,t,mode,K3){
 const first=sp(algo,s,t,mode);if(!first)return[];
 const A=[first],B=[];
 for(let k=1;k<K3;k++){
  const last=A[k-1];
  for(let i=0;i<last.path.length-1;i++){
   const spur=last.path[i],root=last.path.slice(0,i+1),bE=new Set(),bN=new Set(root.slice(0,-1));
   for(const p of A)if(p.path.length>i+1&&root.every((n,j)=>p.path[j]===n))bE.add(p.edges[i].id);
   const r=sp(algo,spur,t,mode,bE,bN);if(!r)continue;
   const path=root.slice(0,-1).concat(r.path),edges=last.edges.slice(0,i).concat(r.edges),key=path.join();
   if(!B.some(b=>b.path.join()===key)&&!A.some(a=>a.path.join()===key))B.push({path,edges,cost:cst(edges,mode)});
  }
  if(!B.length)break;B.sort((a,b)=>a.cost-b.cost);A.push(B.shift());
 }
 return A;
}
function stat(r){let dist=0,eta=0,free=0;const km=[0,0,0];r.edges.forEach(e=>{dist+=e.d;const f=e.d/e.s*60;free+=f;eta+=f*MU[e.lvl];km[e.lvl]+=e.d});return{...r,dist,eta,free,delay:eta-free,km}}
function compute(){
 if(S.from==null||S.to==null)return{st:"empty"};if(S.from===S.to)return{st:"same"};
 const rs=kRoutes(S.algo,S.from,S.to,S.mode,3).map(stat);if(!rs.length)return{st:"none"};
 rs.forEach((r,i)=>{r.i=i;r.tags=[]});
 if(rs.length>1){const best=f=>rs.reduce((a,b)=>f(b)<f(a)-1e-9?b:a);best(r=>r.eta).tags.push("Fastest");best(r=>r.dist).tags.push("Shortest");best(r=>r.delay).tags.push("Least traffic")}
 S.sel=clamp(S.sel,0,rs.length-1);
 NOTR=true;const base=sp("dijkstra",S.from,S.to,S.mode);NOTR=false;
 return{st:"ok",routes:rs,minEta:Math.min(...rs.map(r=>r.eta)),rerouted:!!base&&base.path.join()!==rs[0].path.join()};
}
const depM=()=>{const m=/^(\d+):(\d+)$/.exec(S.dep||"");return m?+m[1]*60+ +m[2]:0};
const via=r=>r.path.length<3?"Direct":r.path.slice(1,-1).map(nm).join(", ");

/* ---------- drawing ---------- */
function drawMap(c){
 const ok=c.st==="ok";let s="";
 const sig=ok?S.from+">"+S.to+":"+c.routes[S.sel].path.join(","):"",anim=sig&&sig!==lastSig;lastSig=sig;
 const L=(e,cls,extra="")=>{const A=NM.get(e.a),B=NM.get(e.b);return`<line class="${cls}" ${extra} x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>`};
 const poly=(r,main)=>`<polyline class="rt ${main?"main"+(anim?" anim":""):"alt"}" stroke="${RC[r.i]}" points="${r.path.map(i=>NM.get(i).x+","+NM.get(i).y).join(" ")}"/>`;
 const pair=S.from+">"+S.to;if(pair!==lastPair){S.focus=false;lastPair=pair}
  const pr=ok&&S.focus?c.routes[S.sel]:null,fsig=pr?sig:"";$("#fc").hidden=!pr;
  if(fsig!==lastF){lastF=fsig;if(pr){const xs=pr.path.map(i=>NM.get(i).x),ys=pr.path.map(i=>NM.get(i).y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),w=clamp(Math.max(x1-x0+70,(y1-y0+60)*4/3),100,400),h=w*.75;VB=[clamp((x0+x1)/2-w/2,0,400-w),clamp((y0+y1)/2-h/2,0,300-h),w,h]}else VB=[0,0,400,300];setVB()}
  if(pr){
   const P=pr.path.map(i=>NM.get(i));
   pr.edges.forEach(e=>{s+=L(e,"road")});s+=poly(pr,true);
   if(S.traffic)pr.edges.forEach(e=>{s+=L(e,"tl",`stroke="${COL[e.lvl]}"`)});
   pr.edges.forEach((e,i)=>{const A=P[i],B=P[i+1];s+=`<text class="lb" x="${(A.x+B.x)/2}" y="${(A.y+B.y)/2-6}" text-anchor="middle" style="font-weight:700">${Math.round(e.d)} km</text>`});
   P.forEach(n=>{s+=`<circle class="nd" ${S.move?`data-n="${n.id}"`:""} cx="${n.x}" cy="${n.y}" r="${S.move?7:5}"/><text class="lb" x="${n.x}" y="${n.y+(n.y>260?-9:15)}" text-anchor="middle">${esc(n.name)}</text>`});
   [[P[0],"A","var(--acc)"],[P[P.length-1],"B","var(--r)"]].forEach(([n,l,fl])=>{s+=`<g pointer-events="none"><circle cx="${n.x}" cy="${n.y}" r="9" fill="${fl}" stroke="#fff" stroke-width="2"/><text x="${n.x}" y="${n.y+3.5}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${l}</text></g>`});
   $("#map").innerHTML=s;return}
  G.edges.forEach(e=>{s+=L(e,"road");if(S.traffic)s+=L(e,"tl",`stroke="${COL[e.lvl]}" ${e.lvl===3?'stroke-dasharray="5 4"':""}`)});
 if(S.roadSel!=null&&EM.has(S.roadSel))s+=L(EM.get(S.roadSel),"selrd");
 if(ok){c.routes.forEach(r=>{if(r.i!==S.sel)s+=poly(r,false)});s+=poly(c.routes[S.sel],true)}
 G.edges.forEach(e=>{s+=L(e,"hit",`data-e="${e.id}"`)});
 if(S.traffic)G.edges.filter(e=>e.lvl>1).forEach(e=>{const A=NM.get(e.a),B=NM.get(e.b),x=(A.x+B.x)/2,y=(A.y+B.y)/2;s+=`<g pointer-events="none"><circle cx="${x}" cy="${y}" r="7" fill="${COL[e.lvl]}" stroke="#fff" stroke-width="1.5"/><text x="${x}" y="${y+3.5}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${e.lvl===3?"×":"!"}</text></g>`});
 G.nodes.forEach(n=>{s+=`<circle class="nd" data-n="${n.id}" cx="${n.x}" cy="${n.y}" r="${S.move?7:5}"/><circle data-n="${n.id}" cx="${n.x}" cy="${n.y}" r="14" fill="transparent" style="cursor:${S.move?"grab":"pointer"}"/>`});
 G.nodes.forEach(n=>{s+=`<text class="lb" x="${n.x}" y="${n.y+(n.y>260?-9:15)}" text-anchor="middle">${esc(n.name)}</text>`});
 [[S.from,"A","var(--acc)"],[S.to,"B","var(--r)"]].forEach(([i,l,f])=>{if(i!=null&&NM.has(i)){const n=NM.get(i);s+=`<g pointer-events="none"><circle cx="${n.x}" cy="${n.y}" r="9" fill="${f}" stroke="#fff" stroke-width="2"/><text x="${n.x}" y="${n.y+3.5}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${l}</text></g>`}});
 $("#map").innerHTML=s;
}
function drawOpts(c){
 let h="<h2>Route options</h2>";
 if(c.st==="empty")h+='<div class="msg">Pick a start and a destination to compare the routes between them.</div>';
 else if(c.st==="same")h+='<div class="msg">Start and destination are the same place. Pick a different destination.</div>';
 else if(c.st==="none")h+='<div class="msg err">No route available. Closed roads cut off this destination. Reopen a road, add a new road in Your data, or refresh traffic.</div>';
 else{
  if(c.rerouted)h+='<div class="note">The usual route is blocked or slowed by traffic, so route 1 avoids it.</div>';
  h+=c.routes.length<2?'<div class="note">Only one route exists between these places. Add a road in Your data to create an alternative.</div>':'<p class="hint" style="margin:0">Tap a route to show it on the map and read its directions.</p>';
  const d0=depM();
  h+=c.routes.map(r=>{const pc=k=>r.km[k]/(r.dist||1)*100,diff=r.eta-c.minEta,probs=r.edges.filter(e=>e.lvl>0).length;
   return`<button class="ro" data-r="${r.i}" aria-pressed="${r.i===S.sel}" style="--c:${RC[r.i]}">
    <span class="rh"><i style="background:${RC[r.i]}"></i><b>Route ${r.i+1}</b>${r.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</span>
    <span class="eta">${fmt(r.eta)}</span>
    <span class="sub">${r.dist.toFixed(1)} km · arrive ${clock(d0+r.eta)}${c.routes.length>1?" · "+(diff<0.5?"quickest":"+"+fmt(diff)+" vs quickest"):""}</span>
    <span class="bar" aria-hidden="true"><span style="width:${pc(0)}%;background:var(--g)"></span><span style="width:${pc(1)}%;background:var(--a)"></span><span style="width:${pc(2)}%;background:var(--r)"></span></span>
    <span class="sub">${r.delay<0.5?"No traffic delay":"+"+fmt(r.delay)+" from traffic"} · ${probs?probs+" slow or congested road"+(probs>1?"s":""):"clear roads"}</span>
    <span class="sub">Via ${esc(via(r))}</span></button>`}).join("");
 }
 $("#opts").innerHTML=h;
}
function drawSteps(c){
 const el=$("#steps");
 if(c.st!=="ok"){el.hidden=true;return}el.hidden=false;
 const r=c.routes[S.sel];let t=depM();
 let h=`<h2>Route ${r.i+1} step by step</h2><div class="eta">${fmt(r.eta)}</div>
 <div class="stats"><span><b>${r.dist.toFixed(1)} km</b> distance</span><span><b>${r.delay<0.5?"No":fmt(r.delay)}</b> traffic delay</span><span><b>${fmt(r.free)}</b> without traffic</span></div>
 <div class="sum"><span><i style="background:var(--g)"></i>Free ${r.km[0].toFixed(1)} km</span><span><i style="background:var(--a)"></i>Slow ${r.km[1].toFixed(1)} km</span><span><i style="background:var(--r)"></i>Heavy ${r.km[2].toFixed(1)} km</span></div>
 <p class="hint" style="margin:0"><b style="color:var(--ink)">Start</b> at ${esc(nm(S.from))} at ${clock(t)}</p><ol class="sl" style="--c:${RC[r.i]}">`;
 r.edges.forEach((e,i)=>{const tm=e.d/e.s*60*MU[e.lvl],fr=e.d/e.s*60;
  h+=`<li><div class="st"><b>${esc(nm(r.path[i]))} to ${esc(nm(r.path[i+1]))}</b><span>${clock(t)}</span></div><small>${e.d.toFixed(1)} km at up to ${e.s} km/h · ${fmt(tm)}</small><div class="tg"><i style="background:${COL[e.lvl]}"></i>${LB[e.lvl]}${e.lvl>0?` (+${fmt(tm-fr)}) · ${esc(e.t)}`:""}</div></li>`;t+=tm});
 h+=`</ol><p class="hint" style="margin:0"><b style="color:var(--ink)">Arrive</b> at ${esc(nm(S.to))} at ${clock(t)}</p>`;
 el.innerHTML=h;
}
function drawReach(c){
 const el=$("#reach");let h=`<h2>Travel time from ${S.from!=null&&NM.has(S.from)?esc(nm(S.from)):"your start"} to every place</h2>`;
 if(S.from==null||!NM.has(S.from)){el.innerHTML=h+'<div class="msg">Choose a start location to see how long every place takes to reach.</div>';return}
 const rows=G.nodes.filter(n=>n.id!==S.from).map(n=>{const r=sp(S.algo,S.from,n.id,S.mode);if(!r)return`<tr><td>${esc(n.name)}</td><td colspan="3" style="color:var(--r)">Not reachable (closed roads)</td></tr>`;
  const s=stat(r);return`<tr class="${n.id===S.to?"cur":""}"><td><button class="lnk" data-go="${n.id}">${esc(n.name)}</button></td><td><b>${fmt(s.eta)}</b></td><td>${s.dist.toFixed(1)} km</td><td>${s.delay<0.5?"None":"+"+fmt(s.delay)}</td><td>${esc(via(s))}</td></tr>`}).join("");
 el.innerHTML=h+`<table><tr><th>Destination</th><th>Time</th><th>Distance</th><th>Traffic delay</th><th>Route taken (via)</th></tr>${rows||'<tr><td colspan="5">Add more places to compare.</td></tr>'}</table><p class="hint">Each row uses the ${S.mode==="fast"?"fastest":"shortest"} route. Tap a destination to set it as B.</p>`;
}
function drawCmp(c){
 const el=$("#cmp");if(c.st!=="ok"){el.hidden=true;return}el.hidden=false;
 const rows=["astar","dijkstra","bf"].map(a=>{const r=sp(a,S.from,S.to,S.mode);return`<tr><td><b>${AN[a]}</b></td><td>${r.ex}</td><td>${r.ms.toFixed(2)} ms</td><td>${S.mode==="fast"?fmt(r.cost):r.cost.toFixed(1)+" km"}</td><td><small>${CX[a]}</small></td></tr>`}).join("");
 el.innerHTML=`<h2>Algorithm comparison</h2><table><tr><th>Algorithm</th><th>Steps</th><th>Time</th><th>Cost</th><th>Complexity</th></tr>${rows}</table><p class="hint">All three find the same best cost. A* usually checks fewer places because its estimate points it toward the destination.</p>`;
}
function drawLab(c){
 const el=$("#lab");
 if(c.st!=="ok"){el.innerHTML='<h2>Algorithm lab</h2><div class="msg">Pick a start and a destination to see how A*, Dijkstra and Bellman-Ford search differently, and how your selected algorithm compares.</div>';return}
 const A=["astar","dijkstra","bf"],R={};A.forEach(a=>R[a]=sp(a,S.from,S.to,S.mode));
 const sel=R[S.algo],n=G.nodes.length,cs=r=>S.mode==="fast"?fmt(r.cost):r.cost.toFixed(1)+" km";
 const DESC={astar:"Adds a straight-line estimate toward B, so it tries promising places first and usually visits fewer places.",dijkstra:"Always expands the nearest unvisited place, spreading out in every direction until it reaches B.",bf:"Re-checks every road in repeated passes until nothing improves. Slowest, but it also copes with negative costs."};
 const mini=a=>{const r=R[a],rank=new Map(r.order.map((id,i)=>[id,i+1])),pset=new Set(r.path);let s="";
  G.edges.forEach(e=>{const P=NM.get(e.a),Q=NM.get(e.b);s+=`<line class="road" style="stroke-width:3" x1="${P.x}" y1="${P.y}" x2="${Q.x}" y2="${Q.y}"/>`});
  s+=`<polyline class="rt main" stroke="${RC[0]}" points="${r.path.map(i=>NM.get(i).x+","+NM.get(i).y).join(" ")}"/>`;
  G.nodes.forEach(nd=>{const k=rank.get(nd.id),onp=pset.has(nd.id);
   s+=k?`<circle cx="${nd.x}" cy="${nd.y}" r="8" fill="var(--acc)" stroke="${onp?"var(--route)":"var(--pan)"}" stroke-width="${onp?2.5:1}"/><text x="${nd.x}" y="${nd.y+3}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fff" pointer-events="none">${k}</text>`
    :`<circle cx="${nd.x}" cy="${nd.y}" r="4" fill="var(--pan)" stroke="var(--mut)" stroke-width="1"/>`;
   if(nd.id===S.from||nd.id===S.to)s+=`<text class="lb" x="${nd.x}" y="${nd.y+(nd.y>260?-12:20)}" text-anchor="middle" style="font-weight:700">${esc(nd.name)}</text>`});
  return`<svg viewBox="0 0 400 300" role="img" aria-label="${AN[a]} search order">${s}</svg>`};
 const cards=A.map(a=>{const r=R[a],isel=a===S.algo;
  return`<div class="ac${isel?" sel":""}"><div class="rh"><b>${AN[a]}</b>${isel?'<span class="tag" style="background:var(--acc);color:#fff;border-color:var(--acc)">Selected</span>':""}</div>${mini(a)}
  <p><b style="color:var(--ink)">${r.order.length} of ${n}</b> places ${a==="bf"?"reached":"visited"}${a==="bf"?" in "+r.passes+" pass"+(r.passes===1?"":"es"):""} · cost ${cs(r)}</p><p>${DESC[a]}</p>
  ${isel?"":`<button class="btn" data-act="algo" data-v="${a}">Switch to ${AN[a]}</button>`}</div>`}).join("");
 const pct=(v,b)=>Math.abs(v-b)<1e-9?"same":b<=0?"":(v>b?"+":"")+Math.round((v-b)/b*100)+"%";
 const M=[["Places visited","order.length",r=>r.order.length,v=>v],["Operations (steps)","ex",r=>r.ex,v=>v],["Run time","ms",r=>r.ms,v=>v.toFixed(2)+" ms"]];
 const bars=M.map(([t,,f,fm])=>{const mx=Math.max(...A.map(a=>f(R[a])),1e-9),b=f(sel);
  return`<div class="mc">${t}</div>`+A.map(a=>{const v=f(R[a]),isel=a===S.algo;return`<div class="bw${isel?" sel":""}"><b>${AN[a]}</b><div><div class="tr"><span style="width:${Math.max(v/mx*100,2)}%"></span></div><small>${fm(v)}${isel?" (selected)":" · "+pct(v,b)+" vs "+AN[S.algo]}</small></div></div>`}).join("")}).join("");
 const best=A.reduce((x,y)=>R[y].order.length<R[x].order.length?y:x),costSame=A.every(a=>Math.abs(R[a].cost-sel.cost)<1e-6),pathSame=A.every(a=>R[a].path.join()===sel.path.join());
 const vd=`<b>${AN[S.algo]}</b> visited ${sel.order.length} of ${n} places using ${sel.ex} steps. `+(R[best].order.length<sel.order.length?`${AN[best]} visited the fewest places (${R[best].order.length}). `:`It visited the fewest places of the three (ties possible). `)+(costSame?`All three found the same best cost (${cs(sel)})`+(pathSame?" and the same route.":", but some chose a different route of equal cost."):"Costs differ, which should not happen. Check your data.");
 el.innerHTML=`<h2>Algorithm lab: ${AN[S.algo]} vs the others</h2><p class="hint" style="margin:0">Numbers show the order in which each algorithm looked at places. The blue line is the route it found. Time varies slightly between runs.</p><div class="lab3">${cards}</div>${bars}<div class="verdict">${vd}</div>`;
}
function drawAlerts(c){
 const on=new Map();if(c.st==="ok")c.routes.forEach(r=>r.edges.forEach(e=>{if(!on.has(e.id))on.set(e.id,[]);on.get(e.id).push(r.i+1)}));
 const list=G.edges.filter(e=>e.lvl>0).sort((a,b)=>b.lvl-a.lvl);
 $("#alerts").innerHTML=`<div class="row between" style="margin:0 0 6px"><h2 style="margin:0">Traffic problems (${list.length})</h2><span class="row" style="margin:0"><button class="btn" data-act="rf">Random traffic</button><button class="btn" data-act="clr">Clear all</button></span></div>`+
 (list.length?list.map(e=>`<div class="al"><i style="background:${COL[e.lvl]}"></i><span><b>${esc(nm(e.a))} – ${esc(nm(e.b))}</b><br><small>${LB[e.lvl]} · ${esc(e.t)}</small><br><button class="lnk" data-edit="${e.id}">Edit road</button></span>${on.has(e.id)?`<em>On route ${on.get(e.id).join(", ")}</em>`:""}</div>`).join(""):'<div class="msg">No traffic problems. All roads are clear.</div>')+
 '<p class="hint">With Auto traffic on, levels follow your departure time (rush hours are busier). You can still override any road by tapping it on the map or editing it in Your data.</p>';
}
function roadEd(e){
 return`<div class="re"><div class="rn"><b>${esc(nm(e.a))} – ${esc(nm(e.b))}</b><small>${e.auto?"map distance":"your distance"}</small></div>
 <div class="rf">
  <label>Distance (km)<input type="number" inputmode="decimal" min="0.1" max="60" step="0.1" data-f="d" data-e="${e.id}" value="${+e.d.toFixed(2)}"></label>
  <label>Speed limit (km/h)<input type="number" inputmode="numeric" min="5" max="150" step="5" data-f="s" data-e="${e.id}" value="${e.s}"></label>
  <label>Traffic<select data-f="lvl" data-e="${e.id}">${LB.map((l,i)=>`<option value="${i}" ${i===e.lvl?"selected":""}>${l}</option>`).join("")}</select></label>
  <label>Cause<select data-f="t" data-e="${e.id}">${TY.map(t=>`<option ${t===e.t?"selected":""}>${t}</option>`).join("")}</select></label>
 </div>
 <div class="row"><button class="btn" data-act="auto" data-e="${e.id}">Use map distance</button><button class="btn" data-act="delr" data-e="${e.id}">Delete road</button></div></div>`;
}
function drawInsp(){
 const e=S.roadSel!=null?EM.get(S.roadSel):null;
 $("#insp").innerHTML=e?`<div class="row between"><h2 style="margin:8px 0 0">Selected road</h2><button class="btn" data-act="closeinsp">Close</button></div><div style="margin-top:8px">${roadEd(e)}</div>`:"";
 $("#maphint").textContent=S.move?"Move mode is on: drag a place to reposition it. Roads that use the map distance update; roads with your own distance keep it.":S.focus&&CUR.st==="ok"?"Showing only the selected route with its stops, distances and traffic. Tap Show full map to see every place.":"Tap two places to set A and B. Tap a road to edit its distance, speed or traffic.";
}
function drawData(){
 const old=$("#dl"),sc=old?old.scrollTop:0;
 const opts=G.nodes.map(n=>`<option value="${n.id}">${esc(n.name)}</option>`).join("");
 let h=`<div class="row between" style="margin:0 0 8px"><h2 style="margin:0">Your data</h2><button class="btn" data-act="reset">Reset to sample data</button></div>
 <div class="tabs"><div class="seg"><button data-tab="places" aria-pressed="${S.tab==="places"}">Places (${G.nodes.length})</button><button data-tab="roads" aria-pressed="${S.tab==="roads"}">Roads (${G.edges.length})</button><button data-tab="import" aria-pressed="${S.tab==="import"}">Import</button></div></div>`;
 if(S.err)h+=`<div class="msg err" role="alert" style="margin-bottom:8px">${esc(S.err)}</div>`;
 if(S.tab==="places"){
  h+=`<div class="row" style="margin:0"><input type="text" id="np" placeholder="New place name" aria-label="New place name" style="flex:1"><button class="btn" data-act="addp">Add place</button></div>
  <p class="hint">A new place appears on the map in move mode. Drag it into position, then connect it with a road.</p>
  <div class="lst" id="dl">${G.nodes.map(n=>{const deg=(ADJ.get(n.id)||[]).length;return`<div class="pr"><input type="text" data-f="name" data-n="${n.id}" value="${esc(n.name)}" aria-label="Place name"><small>${deg} road${deg===1?"":"s"}</small><button class="btn" data-act="delp" data-n="${n.id}" aria-label="Delete ${esc(n.name)}">Delete</button></div>`}).join("")}</div>`;
 }else if(S.tab==="import"){
  h+=`<p class="hint" style="margin:0 0 8px">Paste your own real-world data, one line per item: <b>place,Name,latitude,longitude</b> or <b>road,From,To,distance_km,speed_kmh</b>. Loading replaces the current data.</p><textarea id="imp" rows="9" aria-label="Places and roads data" style="width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);font:12px/1.4 ui-monospace,monospace">${esc(S.imp||EX)}</textarea><div class="row"><button class="btn" data-act="imp">Load this data</button></div>`;
 }else{
  h+=`<div class="af"><label>From<select id="ra">${opts}</select></label><label>To<select id="rb">${G.nodes.length>1?opts.replace(`value="${G.nodes[1].id}"`,`value="${G.nodes[1].id}" selected`):opts}</select></label>
  <label>Distance (km)<input type="number" id="rd" inputmode="decimal" min="0.1" max="60" step="0.1" placeholder="from map (max 60)"></label><label>Speed (km/h)<input type="number" id="rs" inputmode="numeric" min="5" max="150" step="5" value="50"></label><button class="btn" data-act="addr">Add road</button></div>
  <p class="hint">Leave distance empty to measure it from the map.</p>
  <div class="lst" id="dl">${G.edges.map(roadEd).join("")||'<div class="msg">No roads yet. Add one above.</div>'}</div>`;
 }
 $("#pl").innerHTML=G.nodes.map(n=>`<option value="${esc(n.name)}">`).join("");
 $("#data").innerHTML=h;const nl=$("#dl");if(nl)nl.scrollTop=sc;
}

/* ---------- update ---------- */
function update(skip){
 rebuild();
 if(S.roadSel!=null&&!EM.has(S.roadSel))S.roadSel=null;
 ["from","to"].forEach(k=>{if(S[k]!=null&&!NM.has(S[k]))S[k]=null});
 document.querySelectorAll("#algo button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===S.algo));
 document.querySelectorAll("#mode button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===S.mode));
 $("#mv").setAttribute("aria-pressed",S.move);$("#map").classList.toggle("mv",S.move);
 $("#dep").value=S.dep;
 CUR=compute();drawMap(CUR);drawOpts(CUR);drawSteps(CUR);drawReach(CUR);drawLab(CUR);drawCmp(CUR);drawAlerts(CUR);
 if(skip!=="insp")drawInsp();if(skip!=="data")drawData();
 save();
}
const syncFields=()=>{["from","to"].forEach(k=>{if(S[k]!=null&&NM.has(S[k]))$("#"+k).value=nm(S[k])})};

/* ---------- search fields ---------- */
const sug=$("#sug");
function showSug(which){
 const inp=$("#"+which),q=inp.value.trim().toLowerCase(),m=G.nodes.filter(n=>n.name.toLowerCase().includes(q)).slice(0,6);
 inp.parentElement.appendChild(sug);sug.hidden=false;
 sug.innerHTML=m.length?m.map(n=>`<button data-id="${n.id}">${esc(n.name)}</button>`).join(""):"<p>No matching place. Try another name.</p>";
}
function place(which,id){S[which]=id;S.sel=0;syncFields();sug.hidden=true;S.act=which==="from"&&S.to==null?"to":"from";if(which==="to"&&S.from==null)S.act="from";update()}
["from","to"].forEach(k=>{const i=$("#"+k);
 i.addEventListener("focus",()=>{S.act=k;showSug(k)});
 i.addEventListener("input",()=>{S[k]=null;S.act=k;S.sel=0;showSug(k);update()});
 i.addEventListener("blur",()=>setTimeout(()=>{if(document.activeElement.tagName!=="INPUT")sug.hidden=true},150))});
sug.addEventListener("pointerdown",e=>{const b=e.target.closest("button");if(b){e.preventDefault();place(sug.parentElement.querySelector("input").id,+b.dataset.id)}});
$("#swap").onclick=()=>{[S.from,S.to]=[S.to,S.from];S.sel=0;$("#from").value=S.from!=null?nm(S.from):"";$("#to").value=S.to!=null?nm(S.to):"";update()};
$("#algo").onclick=e=>{const b=e.target.closest("button");if(b){S.algo=b.dataset.v;S.sel=0;update()}};
$("#mode").onclick=e=>{const b=e.target.closest("button");if(b){S.mode=b.dataset.v;S.sel=0;update()}};
$("#tr").onchange=e=>{S.traffic=e.target.checked;drawMap(CUR)};
$("#dep").onchange=e=>{S.dep=e.target.value||hhmm();if(S.auto)autoTraffic();update()};
$("#now").onclick=()=>{S.dep=hhmm();if(S.auto)autoTraffic();update()};
$("#auto").onchange=e=>{S.auto=e.target.checked;if(S.auto)autoTraffic();update()};
const find=t=>{t=t.trim().toLowerCase();if(!t)return null;const N=G.nodes;return N.find(n=>n.name.toLowerCase()===t)||N.find(n=>n.name.toLowerCase().startsWith(t))||N.find(n=>n.name.toLowerCase().includes(t))};
$("#q").addEventListener("keydown",e=>{if(e.key!=="Enter")return;const p=e.target.value.split(/\s+(?:to|->)\s+/i),a=find(p[0]),b=p[1]?find(p[1]):null,qm=$("#qm");qm.hidden=false;
 if(p.length>1){if(!a||!b){qm.textContent="Could not find "+(!a?p[0]:p[1])+". Check the place name.";return}S.from=a.id;S.to=b.id;S.sel=0;syncFields();update();qm.textContent=a.name+" to "+b.name+": compare the routes on the right."}
 else if(!a)qm.textContent="No place matches that search. Try a name from the list, or type: Anand to Nadiad.";
 else{place(S.from==null?"from":"to",a.id);qm.textContent=a.name+" set as "+(S.from===a.id?"start":"destination")+"."}});
$("#mv").onclick=()=>{S.move=!S.move;update()};

/* ---------- map interaction ---------- */
const svg=$("#map");let drag=null,pan=null,VB=[0,0,400,300];
const pt=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};
svg.addEventListener("pointerdown",e=>{if(!S.move)return;const n=e.target.closest("[data-n]");if(!n)return;drag={id:+n.dataset.n,moved:false};svg.setPointerCapture(e.pointerId);e.preventDefault()});
svg.addEventListener("pointermove",e=>{if(!drag)return;const q=pt(e),nd=NM.get(drag.id);nd.x=clamp(Math.round(q.x),8,392);nd.y=clamp(Math.round(q.y),8,292);drag.moved=true;drawMap(CUR)});
svg.addEventListener("pointerup",()=>{if(!drag)return;const d=drag;drag=null;if(d.moved){G.edges.forEach(x=>{if(x.auto&&(x.a===d.id||x.b===d.id))x.d=capD(autoD(x))});update()}});
svg.addEventListener("click",e=>{if(pan&&pan.m)return;
 const n=e.target.closest("[data-n]");
 if(n){if(S.move)return;const id=+n.dataset.n;place(S.from==null?"from":S.to==null?"to":S.act,id);return}
 const ed=e.target.closest("[data-e]");if(ed){S.roadSel=+ed.dataset.e;update()}});

const setVB=()=>{svg.setAttribute("viewBox",VB.join(" "));svg.style.touchAction=VB[2]<400?"none":""};
function zoom(f,cx=VB[0]+VB[2]/2,cy=VB[1]+VB[3]/2){const w=clamp(VB[2]/f,60,400),h=w*.75;VB=[clamp(cx-(cx-VB[0])*w/VB[2],0,400-w),clamp(cy-(cy-VB[1])*h/VB[3],0,300-h),w,h];setVB()}
$("#fc").onclick=()=>{S.focus=false;update()};$("#zi").onclick=()=>zoom(1.5);$("#zo").onclick=()=>zoom(1/1.5);
svg.addEventListener("wheel",e=>{e.preventDefault();const q=pt(e);zoom(e.deltaY<0?1.2:1/1.2,q.x,q.y)},{passive:false});
svg.addEventListener("pointerdown",e=>{if(S.move||VB[2]>=400)return;pan={x:e.clientX,y:e.clientY,vb:VB.slice(),m:false}});
svg.addEventListener("pointermove",e=>{if(!pan)return;const k=VB[2]/svg.clientWidth,dx=(e.clientX-pan.x)*k,dy=(e.clientY-pan.y)*k;if(Math.abs(dx)+Math.abs(dy)>2)pan.m=true;if(!pan.m)return;VB=[clamp(pan.vb[0]-dx,0,400-VB[2]),clamp(pan.vb[1]-dy,0,300-VB[3]),VB[2],VB[3]];setVB()});
addEventListener("pointerup",()=>setTimeout(()=>{pan=null}));
/* ---------- editing ---------- */
function freeSpot(){for(let i=0;i<40;i++){const x=30+Math.random()*340,y=30+Math.random()*240;if(G.nodes.every(n=>Math.hypot(n.x-x,n.y-y)>32))return[Math.round(x),Math.round(y)]}return[200,150]}
document.addEventListener("change",e=>{
 const t=e.target,f=t.dataset&&t.dataset.f;if(!f)return;
 const src=t.closest("#data")?"data":"insp";S.err="";
 if(f==="name"){const n=NM.get(+t.dataset.n),v=t.value.trim();
  if(!v||G.nodes.some(x=>x.id!==n.id&&x.name.toLowerCase()===v.toLowerCase())){S.err=!v?"A place needs a name.":"Another place already uses that name. Choose a different name.";update();return}
  n.name=v;syncFields();update("data");return}
 const x=EM.get(+t.dataset.e);if(!x)return;
 if(f==="d"){const v=parseFloat(t.value);if(!(v>0)){S.err="Distance must be more than 0 km.";update();return}if(v>MAXD){S.err=MAXMSG;update();return}x.d=v;x.auto=false}
 else if(f==="s"){const v=parseFloat(t.value);if(!(v>0)){S.err="Speed limit must be more than 0 km/h.";update();return}x.s=clamp(v,5,150)}
 else if(f==="lvl")x.lvl=+t.value;
 else if(f==="t")x.t=t.value;
 update(src==="data"&&f!=="d"?"data":undefined);
});
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;const d=b.dataset;
 if(d.r!==undefined){S.sel=+d.r;S.focus=true;update();return}
 if(d.go!==undefined){place("to",+d.go);return}
 if(d.edit!==undefined){S.roadSel=+d.edit;update();$("#mapcard").scrollIntoView();return}
 if(d.tab){S.tab=d.tab;S.err="";drawData();return}
 const a=d.act;if(!a)return;S.err="";
 if(a==="algo"){S.algo=d.v;S.sel=0;update()}
 else if(a==="rf"){G.edges.forEach(x=>{const r=Math.random();x.lvl=r<.55?0:r<.78?1:r<.93?2:3;x.t=TY[Math.floor(Math.random()*4)]});update()}
 else if(a==="clr"){G.edges.forEach(x=>x.lvl=0);update()}
 else if(a==="closeinsp"){S.roadSel=null;update()}
 else if(a==="auto"){const x=EM.get(+d.e);x.auto=true;x.d=capD(autoD(x));update()}
 else if(a==="delr"){G.edges=G.edges.filter(x=>x.id!==+d.e);S.sel=0;update()}
 else if(a==="delp"){const id=+d.n;G.nodes=G.nodes.filter(n=>n.id!==id);G.edges=G.edges.filter(x=>x.a!==id&&x.b!==id);if(S.from===id){S.from=null;$("#from").value=""}if(S.to===id){S.to=null;$("#to").value=""}S.sel=0;update()}
 else if(a==="addp"){const v=$("#np").value.trim();
  if(!v){S.err="Type a name for the new place.";drawData();return}
  if(G.nodes.some(n=>n.name.toLowerCase()===v.toLowerCase())){S.err="Another place already uses that name. Choose a different name.";drawData();return}
  const[x,y]=freeSpot();G.nodes.push({id:G.nid++,name:v,x,y});S.move=true;update()}
 else if(a==="addr"){const A=+$("#ra").value,B=+$("#rb").value,dv=parseFloat($("#rd").value),sv=parseFloat($("#rs").value);
  if(!A||!B||A===B){S.err="Choose two different places to connect.";drawData();return}
  if(G.edges.some(x=>x.a===A&&x.b===B||x.a===B&&x.b===A)){S.err="These two places already have a road. Edit it in the list below.";drawData();return}
  if($("#rd").value&&!(dv>0)){S.err="Distance must be more than 0 km.";drawData();return}
  const ne={id:G.eid++,a:A,b:B,s:sv>0?clamp(sv,5,150):50,lvl:0,t:TY[0],auto:!(dv>0)};ne.d=dv>0?dv:autoD(ne);if(ne.d>MAXD){S.err=MAXMSG;drawData();return}G.edges.push(ne);S.roadSel=ne.id;update()}
 else if(a==="imp"){S.imp=$("#imp").value;const m=importData(S.imp);if(m){S.err=m;drawData();return}S.tab="places";update()}
 else if(a==="reset"){G=sample();if(S.auto)autoTraffic();S.from=S.to=null;S.roadSel=null;S.sel=0;S.move=false;$("#from").value="";$("#to").value="";update()}
});
if(S.auto&&!saved)autoTraffic();syncFields();update();
