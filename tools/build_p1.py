#!/usr/bin/env python3
"""Build the P1 experience (docs/p1/index.html) from the section specs + data layer.

Regenerate after editing p1-ai-economics/data/section-specs.json:
    python3 tools/build_p1.py
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
specs = json.loads((ROOT / "p1-ai-economics/data/section-specs.json").read_text())
claims = {c["id"]: c for c in json.loads((ROOT / "p1-ai-economics/data/claims.json").read_text())["claims"]}

# Grade-A figures keep their interval ONLY where the source itself gave a range or the figure is
# forward-looking (a plan/guidance), i.e. where the uncertainty is real rather than an artifact.
KEEP_CI_GRADE_A = {"fx-04","fx-10","px-04","px-06","px-08","cx-01","cx-04","cx-06","cx-08","cd-12"}

audit = {"sourced": 0, "derived": 0, "ci_dropped": 0, "value_mismatch": [], "log_tagged": 0}
for _s in specs:
    for _v in _s["visuals"]:
        if _v.get("log") and "log" not in (_v.get("unit") or "").lower():
            _v["unit"] = (_v.get("unit") or "").rstrip() + " · log scale"
            audit["log_tagged"] += 1
for _s in specs:
    for _v in _s["visuals"]:
        if _v["type"] == "particles":
            continue
        for d in _v["series"]:
            cid = d.get("claim_id"); c = claims.get(cid)
            if c is not None:
                # intervals come from the claim record, never re-authored per chart —
                # but only when the series quotes the claim rather than deriving from it
                if abs(float(d.get("value", 0)) - float(c["value"])) < 1e-6:
                    d["low"], d["high"] = c["ci80_low"], c["ci80_high"]
                    d["grade"] = c["grade"]; audit["sourced"] += 1
                else:
                    d["derived_from_claim"] = True; audit["derived"] += 1
            elif cid:
                audit["value_mismatch"].append((_s["chapter"], cid, d.get("label")))
            if d.get("grade") == "A" and cid not in KEEP_CI_GRADE_A:
                if d.pop("low", None) is not None:
                    d.pop("high", None); audit["ci_dropped"] += 1
print(f"  log charts signposted: {audit['log_tagged']}")
print(f"  intervals sourced from claims: {audit['sourced']} · derived series left as authored: {audit['derived']} · "
      f"grade-A intervals dropped: {audit['ci_dropped']} · unknown claim ids: {len(audit['value_mismatch'])}")
for m in audit["value_mismatch"][:8]:
    print(f"    unknown claim id ch{m[0]} {m[1]} ({m[2]})")

TEMPLATE = r"""<meta charset="utf-8">
<title>The Economics of Intelligence</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{
  --bone:#F2EEE4; --paper:#efe9db; --card:#f7f4ec; --graphite:#15181D; --ink2:#3a4149; --ink3:#5b626b;
  --amber:#E0972A; --amber-d:#9a6612; --cyan:#3AA6BD; --cyan-d:#1d7288; --zinc:#838A93; --rule:#ddd5c4;
  --redline:#C6432B; --good:#2E7D5B;
  --serif:"Iowan Old Style",Georgia,"Times New Roman",serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bone);color:var(--graphite);font-family:var(--serif);line-height:1.62;
  background-image:linear-gradient(#83839314 1px,transparent 1px),linear-gradient(90deg,#83839314 1px,transparent 1px);
  background-size:22px 22px;-webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:0 22px}
.col{max-width:680px}
.mono{font-family:var(--mono)}
a{color:#0a6a6a}
h1,h2,h3,h4{text-wrap:balance;margin:0}

/* masthead */
.mast{padding:64px 0 26px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.17em;text-transform:uppercase;color:var(--zinc)}
h1{font-size:clamp(32px,6.2vw,62px);font-weight:600;letter-spacing:-.022em;line-height:1.03;margin:.3em 0 .25em}
.dek{font-size:clamp(17px,2.3vw,21px);color:var(--ink2);max-width:40ch}
.teaser{font-family:var(--mono);font-size:12.5px;color:#7a5c14;background:#E0972A18;border:1px solid #E0972A55;
  border-radius:5px;padding:8px 12px;display:inline-block;margin-top:24px}
.mastmeta{display:flex;gap:26px;flex-wrap:wrap;margin-top:28px;padding-top:18px;border-top:1px solid var(--rule);
  font-family:var(--mono);font-size:11.5px;color:var(--ink3)}
.mastmeta b{display:block;font-size:19px;color:var(--graphite);font-weight:700;margin-bottom:2px}

/* contents */
.toc{margin:34px 0 10px;padding:18px 20px;background:var(--card);border:1px solid var(--rule);border-radius:9px}
.toc h4{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--zinc);margin-bottom:10px}
.toc ol{margin:0;padding-left:20px;columns:2;column-gap:32px}
.toc li{font-size:14.5px;margin:3px 0}
@media(max-width:620px){.toc ol{columns:1}}

/* sections */
section.ch{padding:56px 0 10px;border-top:1px solid var(--rule);margin-top:44px}
.chead{font-family:var(--mono);font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--amber-d)}
section.ch h2{font-size:clamp(23px,3.6vw,34px);font-weight:600;letter-spacing:-.014em;margin:.3em 0 .35em}
.standfirst{font-size:18px;color:var(--ink2);max-width:56ch}
.points{margin:26px 0 6px}
.points p{margin:0 0 15px;font-size:16.5px;max-width:66ch;position:relative}
.cids{font-family:var(--mono);font-size:10px;letter-spacing:.03em;color:var(--zinc);margin-left:7px;white-space:nowrap}
.cids b{background:#8389931f;border-radius:3px;padding:1px 4px;margin-right:3px;font-weight:600;color:var(--ink3)}
.readmore{display:inline-block;margin-top:6px;font-family:var(--mono);font-size:12px;text-decoration:none;
  border-bottom:1px solid #0a6a6a55;padding-bottom:1px}

/* viz */
figure.viz{margin:30px 0 34px;background:var(--card);border:1px solid var(--rule);border-radius:10px;overflow:hidden}
.viz-h{padding:15px 18px 0;display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap}
.viz-h h4{font-size:16.5px;font-weight:600;letter-spacing:-.005em}
.viz-unit{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--zinc);white-space:nowrap}
.viz-body{padding:14px 18px 4px;overflow-x:auto}
.viz-note{margin:0;padding:2px 18px 14px;font-size:14px;color:var(--ink2);max-width:70ch}
.viz-foot{border-top:1px solid var(--rule);background:#f2ede1;padding:9px 18px}
details.src summary{font-family:var(--mono);font-size:11px;letter-spacing:.05em;color:var(--ink3);cursor:pointer;list-style:none}
details.src summary::-webkit-details-marker{display:none}
details.src summary:before{content:"▸ ";color:var(--zinc)}
details.src[open] summary:before{content:"▾ "}
details.src ul{margin:10px 0 4px;padding-left:16px}
details.src li{font-family:var(--mono);font-size:11px;color:var(--ink3);margin:5px 0;line-height:1.55}
details.src li b{color:var(--graphite)}
.rationale{font-family:var(--mono);font-size:10.5px;color:var(--zinc);margin:8px 0 0;line-height:1.5}

/* svg chart bits */
svg{display:block;max-width:100%}
.lbl{font-family:var(--mono);font-size:11px;fill:var(--ink2)}
.sub{font-family:var(--mono);font-size:9.5px;fill:var(--zinc)}
.val{font-family:var(--mono);font-size:11.5px;font-weight:700;fill:var(--graphite)}
.axis{stroke:var(--zinc);stroke-width:1;opacity:.45}
.grid{stroke:var(--zinc);stroke-width:1;opacity:.16}
.gr{font-family:var(--mono);font-size:8.5px;font-weight:700}
.gA{fill:var(--good)}.gB{fill:var(--cyan-d)}.gC{fill:var(--amber-d)}

/* canvas scenes */
.scene{position:relative;background:#efe9db;border-radius:8px;margin:2px 0 8px}
.scene canvas{display:block;width:100%;height:380px}
.dialrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:10px 0 2px}
.dialrow label{font-family:var(--mono);font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--zinc)}
input[type=range]{flex:1 1 220px;accent-color:var(--amber);min-width:180px}
button.btn{font-family:var(--mono);font-size:12px;border:1px solid var(--zinc);background:var(--bone);color:var(--graphite);
  padding:7px 12px;border-radius:5px;cursor:pointer}
button.btn:hover{border-color:var(--graphite)}
button.btn.on{background:var(--graphite);color:var(--bone);border-color:var(--graphite)}
.readout{font-family:var(--mono);font-size:12.5px;color:var(--graphite);padding:6px 0 2px}

/* verdict + provenance */
.verdict{padding:60px 0 10px;border-top:1px solid var(--rule);margin-top:44px}
.vgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:22px}
.vc{background:var(--card);border:1px solid var(--rule);border-left:3px solid var(--zinc);border-radius:7px;padding:13px 15px}
.vc.sup{border-left-color:var(--good)}.vc.part{border-left-color:var(--amber)}.vc.un{border-left-color:var(--redline)}
.vc .t{font-family:var(--mono);font-size:12px;font-weight:700;color:#0a6a6a}
.vc .v{font-family:var(--mono);font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--zinc)}
.vc p{margin:.4em 0 0;font-size:13.5px;color:var(--ink2)}
footer{padding:44px 0 80px;font-family:var(--mono);font-size:11px;color:var(--ink3);line-height:1.8}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>

<div class="wrap">
<header class="mast col">
  <div class="eyebrow">Project 1 · Chip &amp; Ad Market Research</div>
  <h1>The Economics of Intelligence</h1>
  <p class="dek">US labs charge about seven times what a token costs them to serve. This is the story of that gap — how it opened, who pays for it, and whether the trillion dollars behind it ever comes home.</p>
  <span class="teaser">the bet: ~$1,000,000,000,000 riding on whether the gap holds</span>
  <div class="mastmeta">
    <div><b>161</b>calibrated claims</div>
    <div><b>295</b>distinct sources</div>
    <div><b>71</b>adversarially verified</div>
    <div><b>52%</b>odds the buildout pays off</div>
  </div>
</header>

<nav class="toc col" id="toc"><h4>The argument, in nine parts</h4><ol id="toclist"></ol></nav>

<main id="main"></main>

<section class="verdict col">
  <div class="chead">the ruling</div>
  <h2 style="font-size:clamp(23px,3.6vw,34px);font-weight:600;margin:.3em 0 .4em">Four supported, one partly, one unresolved — and the open one holds all the money.</h2>
  <div class="vgrid">
    <div class="vc sup"><div class="t">T1</div><div class="v">supported</div><p>Training is a fixed cost paid up front; serving is a real cost that grows with every answer.</p></div>
    <div class="vc sup"><div class="t">T2</div><div class="v">supported</div><p>US prices sit far above serving cost — an 80% cut on an unchanged model proves it.</p></div>
    <div class="vc part"><div class="t">T3</div><div class="v">partly</div><p>China prices near cost because weights are open and hosts compete, not because inference is cheaper.</p></div>
    <div class="vc sup"><div class="t">T4</div><div class="v">supported</div><p>Chinese labs push the fixed cost onto clouds, hedge funds and the state.</p></div>
    <div class="vc un"><div class="t">T5</div><div class="v">unresolved</div><p>Convergence hasn't started; the flagship price rose. This is the claim carrying the capital risk.</p></div>
    <div class="vc sup"><div class="t">T6</div><div class="v">supported</div><p>The token is the wrong ruler; cost per finished job is what matters.</p></div>
  </div>
</section>

<footer class="col">
  Every number on this page carries its claim id and primary source — open “sources” under any chart.
  Grades: <b>A</b> filed/official · <b>B</b> credible reporting · <b>C</b> our own triangulation.
  Shaded bands are 80% confidence intervals. Marks that shimmer are estimates we are unsure of; filed numbers sit still.
  Research corpus: nine chapters, all passing Flesch-Kincaid ≤10. Data as of 22 July 2026.
</footer>
</div>

<script>
const SPECS = __SPECS__;

/* ---------- helpers ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>{const a=Math.abs(n);
  if(a>=1e4)return n.toLocaleString('en-US',{maximumFractionDigits:0});
  if(a>=100)return (+n.toFixed(0)).toLocaleString('en-US');
  if(a>=1)return String(+n.toFixed(1));
  return String(+n.toPrecision(2));};
const GC={A:'gA',B:'gB',C:'gC'};
const W=820;

/* ---------- chart renderers (SVG) ---------- */
function barChart(v){
  const s=v.series, log=!!v.log, n=s.length;
  // label gutter sized to the longest label so nothing clips on the left
  const padL=Math.min(400,Math.max(130,Math.max(
    ...s.map(d=>String(d.label||'').length*6.4),
    ...s.map(d=>String(d.sublabel||'').length*5.5))+16));
  const rowH=s.some(d=>d.sublabel)?46:36, padR=76, top=8;
  const h=top+n*rowH+22, innerW=W-padL-padR;
  const vals=s.flatMap(d=>[d.value, d.low??d.value, d.high??d.value]).filter(x=>isFinite(x));
  const minPos=Math.min(...vals.filter(x=>x>0));
  // decade-aligned floor: anchoring on the smallest value rendered it as a zero-length bar
  const lo=log?Math.max(1e-6,Math.pow(10,Math.floor(Math.log10(minPos)))):0;
  let hi=Math.max(...vals)||1;
  if(log) hi=Math.pow(10,Math.ceil(Math.log10(hi)));   // decade-aligned ceiling
  if(/%|percent/i.test(v.unit||'') && !log && hi<=100) hi=100;
  const sc=x=>{if(!log)return innerW*(Math.max(0,x)/hi);
    const l=Math.log10(Math.max(lo,x)), a=Math.log10(lo), b=Math.log10(hi);
    return innerW*Math.max(0,(l-a)/(b-a||1));};
  const isPct=/%|percent/i.test(v.unit||'') && !log && hi<=100;
  const h2=h+(isPct?20:0)+(log?34:0);
  let out=`<svg viewBox="0 0 ${W} ${h2}" role="img">`;
  if(log){   // make the compression visible: a gridline every power of ten
    const e0=Math.floor(Math.log10(lo)), e1=Math.ceil(Math.log10(hi));
    for(let e=e0;e<=e1;e++){ const gv=Math.pow(10,e);
      if(gv<lo*0.999||gv>hi*1.001) continue;
      const gx=padL+sc(gv);
      out+=`<line class="grid" x1="${gx}" y1="${top}" x2="${gx}" y2="${top+n*rowH}"/>`
         +`<text class="sub" x="${gx}" y="${top+n*rowH+15}" text-anchor="middle">${fmt(gv)}</text>`; }
    out+=`<text class="sub" x="${padL}" y="${top+n*rowH+30}">each gridline is 10× the one before — bar length shows order of magnitude, not amount</text>`;
  }
  if(isPct){ [0,25,50,75,100].forEach(t=>{const gx=padL+innerW*(t/100);
    out+=`<line class="grid" x1="${gx}" y1="${top}" x2="${gx}" y2="${top+n*rowH}"/>`
       +`<text class="sub" x="${gx}" y="${top+n*rowH+16}" text-anchor="middle">${t}%</text>`;});
    if(v.axis_caption) out+=`<text class="sub" x="${padL+innerW}" y="${top+n*rowH+30}" text-anchor="end">${esc(v.axis_caption)}</text>`; }
  out+=`<line class="axis" x1="${padL}" y1="${top}" x2="${padL}" y2="${top+n*rowH}"/>`;
  s.forEach((d,i)=>{
    const y=top+i*rowH+rowH/2, bw=sc(d.value);
    const alt=(v.type==='comparison');   // only true two-state comparisons alternate colour
    const col=d.color||(alt?(i%2?'var(--cyan)':'var(--amber)'):'var(--amber)');
    out+=`<text class="lbl" x="${padL-10}" y="${y+(d.sublabel?-2:4)}" text-anchor="end">${esc(d.label)}</text>`;
    if(d.sublabel)out+=`<text class="sub" x="${padL-10}" y="${y+11}" text-anchor="end">${esc(d.sublabel)}</text>`;
    out+=`<rect x="${padL}" y="${y-8}" width="${Math.max(1.5,bw)}" height="16" fill="${col}" opacity=".85" rx="1.5"/>`;
    if(isFinite(d.low)&&isFinite(d.high)&&(d.low!==d.high)){
      const a=padL+sc(d.low), b=padL+sc(d.high);
      out+=`<line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="var(--graphite)" stroke-width="1.2" opacity=".55"/>`
        +`<line x1="${a}" y1="${y-5}" x2="${a}" y2="${y+5}" stroke="var(--graphite)" stroke-width="1.2" opacity=".55"/>`
        +`<line x1="${b}" y1="${y-5}" x2="${b}" y2="${y+5}" stroke="var(--graphite)" stroke-width="1.2" opacity=".55"/>`;
    }
    const endX=Math.max(bw, (isFinite(d.high)?sc(d.high):0));   // clear the whisker
    out+=`<text class="val" x="${padL+Math.max(1.5,endX)+10}" y="${y+4}">${fmt(d.value)}</text>`;
    if(d.grade)out+=`<text class="gr ${GC[d.grade]}" x="${W-14}" y="${y+4}">${d.grade}</text>`;
  });
  return out+'</svg>';
}
function stackChart(v){
  const s=v.series, total=s.reduce((a,d)=>a+d.value,0), h=170, padL=8, innerW=W-16;
  const cols=['var(--amber)','var(--cyan)','#9a6612','#1d7288','#b98a3f','#6f7f86','#a8b0b6'];
  let x=padL, out=`<svg viewBox="0 0 ${W} ${h}" role="img">`;
  out+=`<text class="val" x="${padL}" y="18">${fmt(total)} total</text>`;
  s.forEach((d,i)=>{const w=innerW*(d.value/(total||1));
    out+=`<rect x="${x}" y="30" width="${Math.max(1,w-2)}" height="42" fill="${cols[i%cols.length]}" opacity=".88" rx="2"/>`;
    if(w>54)out+=`<text class="val" x="${x+7}" y="56" style="fill:#fff">${fmt(d.value)}</text>`;
    x+=w;});
  // legend
  let ly=94; s.forEach((d,i)=>{const cx=padL+(i%3)*270, yy=ly+Math.floor(i/3)*20;
    out+=`<rect x="${cx}" y="${yy-8}" width="10" height="10" fill="${cols[i%cols.length]}" rx="2"/>`
      +`<text class="lbl" x="${cx+16}" y="${yy+1}">${esc(d.label)} · ${fmt(d.value)}</text>`;});
  return out+'</svg>';
}
function divergingChart(v){
  // label + assumptions sit ABOVE each bar at the left margin so nothing can overflow either edge;
  // the value sits inside the bar next to the zero axis.
  const s=v.series, n=s.length, rowH=64, top=12, h=top+n*rowH+26, mid=W*0.5, half=W*0.40;
  const max=Math.max(...s.map(d=>Math.abs(d.value)))||1;
  let out=`<svg viewBox="0 0 ${W} ${h}" role="img">`;
  out+=`<line class="axis" x1="${mid}" y1="${top}" x2="${mid}" y2="${top+n*rowH}"/>`;
  out+=`<text class="sub" x="${mid}" y="${h-8}" text-anchor="middle">0 — breaks even</text>`;
  s.forEach((d,i)=>{
    const rowTop=top+i*rowH, y=rowTop+44, w=half*(Math.abs(d.value)/max), neg=d.value<0;
    out+=`<text class="lbl" x="6" y="${rowTop+14}" style="font-weight:700">${esc(d.label)}</text>`;
    if(d.sublabel)out+=`<text class="sub" x="6" y="${rowTop+27}">${esc(d.sublabel)}</text>`;
    out+=`<rect x="${neg?mid-w:mid}" y="${y-11}" width="${Math.max(1.5,w)}" height="22" rx="2"
      fill="${neg?'var(--redline)':'var(--good)'}" opacity=".82"/>`;
    out+=`<text class="val" x="${neg?mid-9:mid+9}" y="${y+4}" text-anchor="${neg?'end':'start'}" style="fill:#fff">${fmt(d.value)}</text>`;
  });
  return out+'</svg>';
}
function rangeChart(v){
  const s=v.series, n=s.length, rowH=52, top=14, h=top+n*rowH+10, padL=190, innerW=W-padL-70;
  const all=s.flatMap(d=>[d.low??d.value,d.high??d.value,d.value]).filter(isFinite);
  const lo=Math.min(...all), hi=Math.max(...all), span=(hi-lo)||1;
  const sc=x=>innerW*((x-lo)/span);
  let out=`<svg viewBox="0 0 ${W} ${h}" role="img">`;
  s.forEach((d,i)=>{const y=top+i*rowH+rowH/2;
    const a=padL+sc(d.low??d.value), b=padL+sc(d.high??d.value), m=padL+sc(d.value);
    out+=`<text class="lbl" x="${padL-10}" y="${y-1}" text-anchor="end">${esc(d.label)}</text>`;
    if(d.sublabel)out+=`<text class="sub" x="${padL-10}" y="${y+12}" text-anchor="end">${esc(d.sublabel)}</text>`;
    out+=`<rect x="${a}" y="${y-9}" width="${Math.max(2,b-a)}" height="18" rx="3" fill="var(--amber)" opacity=".26"/>`;
    out+=`<line x1="${m}" y1="${y-13}" x2="${m}" y2="${y+13}" stroke="var(--graphite)" stroke-width="2"/>`;
    out+=`<text class="val" x="${m}" y="${y-18}" text-anchor="middle">${fmt(d.value)}</text>`;
    out+=`<text class="sub" x="${a}" y="${y+24}">${fmt(d.low??d.value)}</text>`;
    out+=`<text class="sub" x="${b}" y="${y+24}" text-anchor="end">${fmt(d.high??d.value)}</text>`;
    if(d.grade)out+=`<text class="gr ${GC[d.grade]}" x="${W-14}" y="${y+4}" text-anchor="end">${d.grade}</text>`;
  });
  return out+'</svg>';
}
function slopeChart(v){
  const s=v.series; if(s.length!==2)return barChart(v);   // slope is a two-point form; anything else would drop data
  const h=250, xL=W*0.30, xR=W*0.70, top=34, bot=h-42;
  const vals=s.map(d=>d.value), lo=Math.min(...vals), hi=Math.max(...vals), span=(hi-lo)||1;
  const y=x=>bot-(bot-top)*((x-lo)/span);
  let out=`<svg viewBox="0 0 ${W} ${h}" role="img">`;
  out+=`<line class="grid" x1="${xL}" y1="${top-12}" x2="${xL}" y2="${bot+12}"/>`;
  out+=`<line class="grid" x1="${xR}" y1="${top-12}" x2="${xR}" y2="${bot+12}"/>`;
  out+=`<text class="sub" x="${xL}" y="${bot+30}" text-anchor="middle">${esc(s[0].label)}</text>`;
  out+=`<text class="sub" x="${xR}" y="${bot+30}" text-anchor="middle">${esc(s[s.length-1].label)}</text>`;
  const a=s[0], b=s[s.length-1];
  out+=`<line x1="${xL}" y1="${y(a.value)}" x2="${xR}" y2="${y(b.value)}" stroke="var(--amber)" stroke-width="2.5" opacity=".85"/>`;
  [[xL,a],[xR,b]].forEach(([x,d])=>{
    out+=`<circle cx="${x}" cy="${y(d.value)}" r="5.5" fill="var(--graphite)"/>`;
    out+=`<text class="val" x="${x}" y="${y(d.value)-13}" text-anchor="middle">${fmt(d.value)}</text>`;
    if(d.sublabel)out+=`<text class="sub" x="${x}" y="${y(d.value)+20}" text-anchor="middle">${esc(d.sublabel)}</text>`;});
  return out+'</svg>';
}
function lineChart(v){
  const s=v.series.slice().sort((a,b)=>(a.x??0)-(b.x??0));
  const h=280, padL=64, padB=42, top=16, innerW=W-padL-30, innerH=h-top-padB;
  const xs=s.map((d,i)=>d.x??i), ys=s.map(d=>d.value);
  const x0=Math.min(...xs), x1=Math.max(...xs), log=!!v.log;
  const y0=log?Math.min(...ys.filter(y=>y>0)):0, y1=Math.max(...ys);
  const X=x=>padL+innerW*((x-x0)/((x1-x0)||1));
  const Y=y=>{if(!log)return top+innerH-innerH*(y/(y1||1));
    const a=Math.log10(Math.max(y0,y)),b=Math.log10(y0),c=Math.log10(y1);
    return top+innerH-innerH*((a-b)/((c-b)||1));};
  let out=`<svg viewBox="0 0 ${W} ${h}" role="img">`;
  out+=`<line class="axis" x1="${padL}" y1="${top+innerH}" x2="${W-24}" y2="${top+innerH}"/>`;
  out+=`<line class="axis" x1="${padL}" y1="${top}" x2="${padL}" y2="${top+innerH}"/>`;
  out+=`<polyline fill="none" stroke="var(--amber)" stroke-width="2.4" points="${s.map((d,i)=>X(xs[i])+','+Y(d.value)).join(' ')}"/>`;
  s.forEach((d,i)=>{out+=`<circle cx="${X(xs[i])}" cy="${Y(d.value)}" r="4" fill="var(--graphite)"/>`;
    out+=`<text class="sub" x="${X(xs[i])}" y="${top+innerH+16}" text-anchor="middle">${esc(d.label)}</text>`;
    if(d.sublabel)out+=`<text class="sub" x="${X(xs[i])}" y="${top+innerH+28}" text-anchor="middle">${esc(d.sublabel)}</text>`;
    out+=`<text class="val" x="${X(xs[i])}" y="${Y(d.value)-10}" text-anchor="middle">${fmt(d.value)}</text>`;});
  return out+'</svg>';
}
function dotChart(v){
  const s=v.series, h=220, padL=44, innerW=W-padL-54, top=132;
  // panel probabilities may be stored as fractions (0.52) or percents (52) — normalise to percent
  const raw=s.map(d=>d.value), asFrac=Math.max(...raw)<=1.5;
  const vals=raw.map(x=>asFrac?x*100:x);
  const X=x=>padL+innerW*(Math.max(0,Math.min(100,x))/100);
  const sorted=[...vals].sort((a,b)=>a-b);
  const med=sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2;
  let out=`<svg viewBox="0 0 ${W} ${h}" role="img">`;
  [0,25,50,75,100].forEach(t=>{out+=`<line class="grid" x1="${X(t)}" y1="${top-14}" x2="${X(t)}" y2="${top+12}"/>`
    +`<text class="sub" x="${X(t)}" y="${top+28}" text-anchor="middle">${t}%</text>`;});
  out+=`<line class="axis" x1="${padL}" y1="${top}" x2="${padL+innerW}" y2="${top}"/>`;
  out+=`<line x1="${X(Math.min(...vals))}" y1="${top}" x2="${X(Math.max(...vals))}" y2="${top}" stroke="var(--amber)" stroke-width="6" opacity=".35"/>`;
  // stagger each panelist on its own tier with a leader line, so tight clusters stay legible
  s.forEach((d,i)=>{const x=X(vals[i]), tier=top-30-i*26;
    out+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${tier+6}" class="grid"/>`;
    out+=`<circle cx="${x}" cy="${top}" r="7" fill="var(--bone)" stroke="var(--graphite)" stroke-width="2"/>`;
    out+=`<text class="val" x="${x+10}" y="${tier+4}">${fmt(vals[i])}%</text>`;
    out+=`<text class="sub" x="${x+10}" y="${tier+15}">${esc(d.label)}</text>`;});
  out+=`<line x1="${X(med)}" y1="${top-8}" x2="${X(med)}" y2="${top+20}" stroke="var(--redline)" stroke-width="2.5"/>`;
  out+=`<text class="val" x="${X(med)}" y="${h-10}" text-anchor="middle" style="fill:var(--redline)">median ${fmt(med)}% — a coin flip</text>`;
  return out+'</svg>';
}
const RENDER={bars:barChart,bars_ci:barChart,comparison:barChart,stack:stackChart,
  diverging:divergingChart,range:rangeChart,slope:slopeChart,line:lineChart,dot_spread:dotChart};

/* ---------- particle scenes ---------- */
const SCENE_FOR={1:'gap',3:'gap',7:'dial',8:'payback'};
function makeScene(el,kind){
  const cv=el.querySelector('canvas'), ctx=cv.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const AMBER=[224,151,42], CYAN=[58,166,189], GOLD=[224,151,42], GREY=[139,144,153];
  // jitter amplitude comes from SOURCE GRADE: A = filed, dead still; C = our estimate, shimmers
  const AMP={A:0, B:0.9, C:2.2};
  const N_COST=15, N_PRICE=100, COLS=5, CELL=13, SIZE=8;   // price is ~7x cost, both from the baseline
  let P=[], w=0,h=0,dpr=1, supply=0, run=0, open=false, first=true;
  function build(){
    P=[];
    if(kind==='payback'){ for(let i=0;i<288;i++)P.push(mk(i,GREY,AMP.C)); }
    else { for(let i=0;i<N_COST;i++)P.push(mk(i,CYAN,AMP.C));      // serving cost = grade C estimate -> shimmers
           for(let i=0;i<N_PRICE;i++)P.push(mk(1e3+i,AMBER,AMP.A)); } // list price = grade A filed -> still
  }
  function mk(i,c,amp){const r=Math.abs(Math.sin(i*12.9898)*43758.5)%1;
    return {x:0,y:0,tx:0,ty:0,c:c.slice(),tc:c.slice(),amp,tamp:amp,ph:r*6.28,ph2:(r*7.7)%6.28,i,r,kind:0};}
  function dims(){const cw=cv.clientWidth,ch=cv.clientHeight;dpr=Math.min(2,devicePixelRatio||1);
    if(cw!==w||ch!==h){cv.width=cw*dpr;cv.height=ch*dpr;w=cw;h=ch;} ctx.setTransform(dpr,0,0,dpr,0,0);}
  function lay(){
    const base=h-56, costX=w*0.30, priceX=w*0.66;
    if(kind==='payback'){
      const cx=w*0.5, apex=base-30, topY=base-230;
      P.forEach((p,i)=>{const earned=(Math.abs(Math.sin((i+1)*(run+1)*7.13))%1)<0.52;
        if(earned){const u=p.r,v=(p.r*3.1)%1, y=apex-u*(apex-topY), hw=(apex-y)*0.55+10;
          p.tx=cx+(v-0.5)*2*hw; p.ty=y; p.tc=GOLD; p.tamp=0.7; p.kind=1;}
        else {const u=(p.r*5.7)%1; p.tx=cx-200+u*400; p.ty=base+18+((p.r*9.1)%1)*18; p.tc=GREY; p.tamp=1.2; p.kind=2;}});
      return;
    }
    const frac = kind==='dial' ? (open?0.08:1-supply/100) : 1;
    const cost=P.slice(0,N_COST), price=P.slice(N_COST);
    // BOTH stacks grow from the same baseline
    cost.forEach((p,k)=>{const row=Math.floor(k/COLS),col=k%COLS;
      p.tx=costX-(COLS*CELL)/2+col*CELL+CELL/2; p.ty=base-row*CELL-CELL/2; p.tc=CYAN; p.tamp=AMP.C;});
    const nPrem=Math.round(price.length*frac);
    price.slice(0,nPrem).forEach((p,k)=>{const row=Math.floor(k/COLS),col=k%COLS;
      p.tx=priceX-(COLS*CELL)/2+col*CELL+CELL/2; p.ty=base-row*CELL-CELL/2; p.tc=AMBER; p.tamp=AMP.A;});
    price.slice(nPrem).forEach(p=>{const a=p.r,b=(p.r*4.3)%1;   // sunk premium flows into the cost band
      p.tx=costX-44+a*88; p.ty=base-6-b*72; p.tc=[141,186,166]; p.tamp=AMP.C;});
  }
  function snapIfFirst(){ if(!first)return;                      // appear settled immediately, don't fly in from 0,0
    P.forEach(p=>{p.x=p.tx;p.y=p.ty;p.c=p.tc.slice();p.amp=p.tamp;}); first=false; }
  function label(x,y,t,col,sz,wt){ctx.textAlign='center';ctx.fillStyle=col;
    ctx.font=(wt||'400')+' '+(sz||11)+'px ui-monospace,Menlo,monospace';ctx.fillText(t,x,y);}
  function draw(t){
    const base=h-56, costX=w*0.30, priceX=w*0.66;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='rgba(131,138,147,.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(14,base+.5);ctx.lineTo(w-14,base+.5);ctx.stroke();
    for(const p of P){
      p.x+=(p.tx-p.x)*(reduce?1:.12); p.y+=(p.ty-p.y)*(reduce?1:.12);
      for(let k=0;k<3;k++)p.c[k]+=(p.tc[k]-p.c[k])*.1;
      p.amp+=(p.tamp-p.amp)*.08;
      let jx=0,jy=0; if(!reduce&&p.amp>0.02){jx=p.amp*Math.sin(t*2.2+p.ph);jy=p.amp*Math.cos(t*2.6+p.ph2);}
      ctx.fillStyle='rgb('+(p.c[0]|0)+','+(p.c[1]|0)+','+(p.c[2]|0)+')';
      ctx.fillRect(p.x-SIZE/2+jx,p.y-SIZE/2+jy,SIZE,SIZE);
    }
    if(kind==='payback'){
      const cx=w*0.5; ctx.strokeStyle='rgba(131,138,147,.5)';ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(cx,base-30);ctx.lineTo(cx-150,base-240);ctx.moveTo(cx,base-30);ctx.lineTo(cx+150,base-240);
      ctx.stroke();ctx.setLineDash([]);
      label(cx,base-256,'52 in 100 earn back  ·  48 do not','#15181D',12,'700');
      label(cx,base+50,'write-down reservoir','#C6432B',10.5,'700');
    } else {
      const frac = kind==='dial' ? (open?0.08:1-supply/100) : 1;
      const costRows=Math.ceil(N_COST/COLS), premRows=Math.ceil(Math.round(N_PRICE*frac)/COLS);
      label(costX, base-costRows*CELL-22,'15','#15181D',14,'700');
      label(costX, base-costRows*CELL-8,'cost to serve','#838A93',10);
      label(priceX, Math.max(20,base-premRows*CELL-22), frac>0.98?'100':fmt(Math.round(100*frac)),'#15181D',14,'700');
      label(priceX, Math.max(34,base-premRows*CELL-8),'US list price','#838A93',10);
      if(kind!=='dial')label((costX+priceX)/2,(base-costRows*CELL-22+base-premRows*CELL-22)/2,'≈ 7×','#15181D',13,'700');
    }
  }
  let raf=null;
  function loop(now){dims();lay();snapIfFirst();draw(now/1000);raf=requestAnimationFrame(loop);}
  build();
  new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting&&!raf)raf=requestAnimationFrame(loop);
    else if(!e.isIntersecting&&raf){cancelAnimationFrame(raf);raf=null;}
  }),{rootMargin:'120px'}).observe(cv);
  return {setSupply:v=>{supply=v;},setOpen:v=>{open=v;},rerun:()=>{run++;}};
}

/* ---------- build the page ---------- */
const main=document.getElementById('main'), toclist=document.getElementById('toclist');
SPECS.forEach(sp=>{
  toclist.insertAdjacentHTML('beforeend',`<li><a href="#ch${sp.chapter}">${esc(sp.title)}</a></li>`);
  const pts=sp.points.map(p=>`<p>${esc(p.text)}<span class="cids">${(p.claim_ids||[]).map(c=>'<b>'+esc(c)+'</b>').join('')}</span></p>`).join('');
  const viz=sp.visuals.map((v,vi)=>{
    const id=`v${sp.chapter}_${vi}`;
    let body;
    if(v.type==='particles'){
      const kind=SCENE_FOR[sp.chapter]||'gap';
      body=`<div class="scene" data-scene="${kind}" data-id="${id}"><canvas></canvas></div>`
        + (kind==='dial'
            ? `<div class="dialrow"><label>scarce</label><input type="range" min="0" max="100" value="0" data-dial="${id}"><label>abundant</label>
               <button class="btn on" data-k="${id}" data-open="0">closed weights</button><button class="btn" data-k="${id}" data-open="1">open weights</button></div>
               <div class="readout" data-out="${id}">margin over cost: <b>high</b> — our panel gives near-cost US pricing by 2028 just <b>13%</b></div>`
            : kind==='payback'
            ? `<div class="dialrow"><button class="btn" data-rerun="${id}">▶ run it again</button>
               <span class="readout">odds it clears its cost of capital: <b>52%</b> — a coin flip</span></div>` : '');
    } else {
      const fn=RENDER[v.type]||barChart; body=fn(v);
    }
    const srcs=(v.series||[]).filter(d=>d.claim_id||d.source_url).map(d=>
      `<li><b>${esc(d.label)}</b> ${fmt(d.value)} ${esc(v.unit||'')}${d.claim_id?' · <b>'+esc(d.claim_id)+'</b>':''}${d.grade?' · grade '+d.grade:''}`
      +(d.source_url?` · <a href="${esc(d.source_url)}" target="_blank" rel="noopener">${esc(d.source_title||'source')}</a>`:'')+`</li>`).join('');
    return `<figure class="viz">
      <div class="viz-h"><h4>${esc(v.title)}</h4><span class="viz-unit">${esc(v.unit||'')}</span></div>
      <div class="viz-body">${body}</div>
      <p class="viz-note">${esc(v.note||'')}</p>
      <div class="viz-foot"><details class="src"><summary>sources · ${(v.series||[]).length} figures</summary><ul>${srcs}</ul>
        <p class="rationale">why this chart: ${esc(v.viz_rationale||'')}</p></details></div>
    </figure>`;
  }).join('');
  main.insertAdjacentHTML('beforeend',`<section class="ch" id="ch${sp.chapter}">
    <div class="col"><div class="chead">${esc(sp.eyebrow)}</div><h2>${esc(sp.title)}</h2>
      <p class="standfirst">${esc(sp.standfirst)}</p><div class="points">${pts}</div>
      <a class="readmore" href="${esc(sp.chapter_link)}">read the full chapter →</a></div>
    ${viz}</section>`);
});

/* auto-fit every chart's viewBox to its real rendered text — guarantees nothing clips,
   regardless of font metrics (character-width estimates are never exact) */
function autofitCharts(){
  document.querySelectorAll('figure.viz svg').forEach(svg=>{
    const vb=svg.viewBox.baseVal; if(!vb||!vb.width) return;
    // grade markers sit in a column past the longest value label, so they can never collide
    const grades=[...svg.querySelectorAll('text.gr')];
    if(grades.length){
      let rightMost=0;
      svg.querySelectorAll('text.val').forEach(t=>{ let b; try{b=t.getBBox();}catch(e){return;}
        rightMost=Math.max(rightMost,b.x+b.width); });
      if(rightMost>0) grades.forEach(g=>g.setAttribute('x', rightMost+14));
    }
    let minX=0,minY=0,maxX=vb.width,maxY=vb.height;
    svg.querySelectorAll('text').forEach(t=>{ let b; try{b=t.getBBox();}catch(e){return;}
      if(!b||(!b.width&&!b.height))return;
      minX=Math.min(minX,b.x); minY=Math.min(minY,b.y);
      maxX=Math.max(maxX,b.x+b.width); maxY=Math.max(maxY,b.y+b.height); });
    const pad=5;
    if(minX<0||minY<0||maxX>vb.width||maxY>vb.height){
      svg.setAttribute('viewBox',
        (minX-pad)+' '+(minY-pad)+' '+((maxX-minX)+pad*2)+' '+((maxY-minY)+pad*2));
    }
  });
}
autofitCharts();
addEventListener('resize',autofitCharts);

/* wire scenes */
const scenes={};
document.querySelectorAll('.scene').forEach(el=>{scenes[el.dataset.id]=makeScene(el,el.dataset.scene);});
document.querySelectorAll('[data-dial]').forEach(inp=>inp.addEventListener('input',e=>{
  const id=inp.dataset.dial, v=+e.target.value; scenes[id].setSupply(v);
  const m=v<25?'high':v<60?'thinning':v<88?'slim':'near zero';
  document.querySelector(`[data-out="${id}"]`).innerHTML=
    `margin over cost: <b>${m}</b> — our panel gives near-cost US pricing by 2028 just <b>13%</b>`;}));
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.k, on=b.dataset.open==='1'; scenes[id].setOpen(on);
  document.querySelectorAll(`[data-k="${id}"]`).forEach(x=>x.classList.toggle('on',x===b));}));
document.querySelectorAll('[data-rerun]').forEach(b=>b.addEventListener('click',()=>scenes[b.dataset.rerun].rerun()));
</script>
"""

html = TEMPLATE.replace("__SPECS__", json.dumps(specs, separators=(",", ":")))
out = ROOT / "docs/p1/index.html"
out.write_text(html)
print(f"wrote {out} ({len(html)//1024} KB) · {len(specs)} chapters · "
      f"{sum(len(s['visuals']) for s in specs)} visuals · "
      f"{sum(len(v['series']) for s in specs for v in s['visuals'])} data points")
