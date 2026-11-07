// Section 8 art approval sheet: new parametric helmet + car beside the current in-game art.
// Usage: serve dist/ on 8783 (npm run build:web first), then: node scripts/art-review/build-review.cjs
// Writes docs/art-review/section-8/{review.html, current-*.png, review-*.png}. Existing Playwright only.
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const repo=path.resolve(__dirname,'../..');
const out=path.join(repo,'docs/art-review/section-8');
const url=process.env.FORMULA_PREVIEW_URL||'http://127.0.0.1:8783';
fs.mkdirSync(out,{recursive:true});

// Compile the platform-agnostic templates with the project's TypeScript; no new tooling.
const build=fs.mkdtempSync(path.join(os.tmpdir(),'ft-art-'));
const src=['shapes','color','helmet','car'].map(f=>path.join(repo,'src/ui/art/vector',f+'.ts'));
execFileSync(path.join(repo,'node_modules/.bin/tsc'),[...src,'--ignoreConfig','--outDir',build,'--module','commonjs','--target','es2020','--skipLibCheck','--strict'],{stdio:'inherit'});
const {toSvg}=require(path.join(build,'shapes.js')),{helmetArt,HELMET_PATTERN_NAMES}=require(path.join(build,'helmet.js')),{carArt}=require(path.join(build,'car.js'));
const pack=JSON.parse(fs.readFileSync(path.join(repo,'src/game/roster/defaultRoster.json'),'utf8'));

let uid=0;const id=()=>`a${uid++}`;
const helmet=(team,pattern,size,detail='full',backdrop='blue')=>toSvg(helmetArt({colors:team.colors,pattern,detail,backdrop}),size,id());
const car=(team,size,detail='full')=>toSvg(carArt({colors:team.colors,detail}),size,id());
const player=pack.teams[5],[lead,mate]=pack.drivers.filter(d=>d.slot===11||d.slot===12);

(async()=>{
 const browser=await chromium.launch();
 try{
  // 1. Current in-game art, captured from the real exported app.
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.goto(url);await page.getByText('Mar 2, 2026',{exact:true}).waitFor();
  await page.getByRole('tab',{name:'DRIVERS',exact:true}).click();
  await page.getByRole('button',{name:`View ${lead.name}`,exact:true}).first().click();
  await page.getByRole('heading',{name:lead.name,exact:true}).waitFor();
  await page.getByTestId('driver-portrait').first().screenshot({path:path.join(out,'current-helmet.png')});
  await page.getByRole('tab',{name:'TEAM',exact:true}).click();
  await page.getByRole('button',{name:'View car',exact:true}).click();
  await page.waitForTimeout(400);
  await page.locator('[aria-label="Original racing car illustration"]').first().screenshot({path:path.join(out,'current-car.png')});
  await page.screenshot({path:path.join(out,'current-car-card-phone.png')});
  await page.close();

  // 2. The review sheet.
  const ref=(what)=>`<div class="ref"><b>Reference: ${what}</b><span>The reference image was not received with the brief. Re-upload it and it goes here.</span></div>`;
  const tile=(label,body,note='')=>`<figure>${body}<figcaption><b>${label}</b>${note?`<span>${note}</span>`:''}</figcaption></figure>`;
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Helmet and Car Style</title><style>
:root{--bg:#F2EBDD;--card:#FAF6EE;--ink:#152334;--muted:#4E5D6C;--line:#D5CBBA;--nav:#111D2A;--accent:#B51E30}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
header{background:var(--nav);color:#F6F2E9;padding:18px 16px}header h1{margin:0;font-size:22px}header p{margin:4px 0 0;color:#B4C0CD}
main{max-width:1180px;margin:0 auto;padding:16px;display:grid;gap:18px}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px}
h2{margin:0 0 4px;font-size:18px}h3{margin:14px 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:var(--muted)}
.lede{margin:0 0 10px;color:var(--muted)}
.compare{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:stretch}
figure{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:10px;border:1px solid var(--line);border-radius:8px;background:#fff8;min-width:0}
figure svg,figure img{max-width:100%;height:auto}figcaption{text-align:center;font-size:12px;color:var(--muted)}figcaption b{display:block;color:var(--ink);font-size:13px}
.ref{display:flex;flex-direction:column;gap:6px;justify-content:center;align-items:center;text-align:center;border:2px dashed var(--line);border-radius:8px;padding:14px;color:var(--muted);min-height:180px}.ref b{color:var(--ink)}
.row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end}
.strip{display:flex;flex-wrap:wrap;gap:8px}.strip figure{padding:6px;flex:0 0 auto}
.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.mock{border-radius:8px;padding:12px;border:1px solid var(--line);background:var(--card)}.mock.dark{background:#142131;border-color:#3D5267;color:#F5EFE3}.mock.dark .m{color:#A8B8C9}
.mrow{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #0001}.mrow:last-child{border:0}.m{color:var(--muted);font-size:12px}
.name{font-weight:800}.carcard svg,.mrow svg{display:block;flex:0 0 auto}.carcard svg{width:100%;height:auto}.carcard{border-top:3px solid ${player.colors.primary};border-radius:8px;overflow:hidden}.carcard .cap{padding:10px 12px}
ul{margin:6px 0 0;padding-left:18px}li{margin:3px 0}
@media (max-width:720px){.compare,.cards{grid-template-columns:minmax(0,1fr)}header h1{font-size:19px}}
</style></head><body>
<header><h1>Section 8 art approval: helmet and car</h1><p>Style candidates for your OK. Nothing in the game has changed yet. Team shown: ${player.name} (your team), drivers ${lead.name} and ${mate.name}.</p></header>
<main>
<section><h2>1. Helmet portrait</h2><p class="lede">Three-quarter view, rounded shell, large dark visor with two pale highlights, chin bar, suit collar and shoulders in livery, soft blue radial background.</p>
<div class="compare">${ref('helmet portrait')}
${tile('Current helmet',`<img src="current-helmet.png" alt="Current front-on helmet" width="160">`,'Front-on, identical for teammates')}
${tile(`New: ${lead.name}`,helmet(player,lead.helmetPattern,200),`Full version, pattern ${HELMET_PATTERN_NAMES[lead.helmetPattern]}`)}</div>
<h3>Small version (lists, tower rows, cards)</h3>
<div class="row">${[80,64,48].map(s=>tile(`${s}px`,helmet(player,lead.helmetPattern,s,'small'))).join('')}
${tile('Teammates differ',`<div class="row">${helmet(player,lead.helmetPattern,96)}${helmet(player,mate.helmetPattern,96)}</div>`,`${lead.name} · ${mate.name}`)}
${tile('Team-tinted background',helmet(player,lead.helmetPattern,96,'full','team'),'Optional variant')}</div>
<h3>The 8 pattern variants (same template, ${player.name} colours)</h3>
<div class="strip">${HELMET_PATTERN_NAMES.map((n,i)=>tile(n,helmet(player,i,84))).join('')}</div>
<h3>Every team, race drivers' own patterns</h3>
<div class="strip">${pack.teams.map(t=>{const ds=pack.drivers.filter(d=>Math.ceil(d.slot/2)===t.slot);return tile(t.name,`<div class="row">${ds.map(d=>helmet(t,d.helmetPattern,64)).join('')}</div>`);}).join('')}</div>
</section>
<section><h2>2. Car</h2><p class="lede">Isometric three-quarter top view with front and rear wings, sidepods, halo and driver helmet. Cream background, soft flat shadow, rims in team primary, bold diagonal livery sweep.</p>
<div class="compare">${ref('isometric car')}
${tile('Current car',`<img src="current-car.png" alt="Current flat car" width="260">`,'Flat top-down block, small on its card')}
${tile(`New: ${player.name}`,car(player,360),'Full version')}</div>
<h3>Small version</h3>
<div class="row">${[120,80,56].map(s=>tile(`${s}px`,car(player,s,'small'))).join('')}</div>
<h3>Same template, every team</h3>
<div class="strip">${pack.teams.map(t=>tile(t.name,car(t,200))).join('')}</div>
</section>
<section><h2>3. In context</h2><p class="lede">How they would sit in the game. Mock-ups using the game's light and dark surfaces; the real swap comes after approval.</p>
<div class="cards">
${['','dark'].map(mode=>`<div class="mock ${mode}"><div class="m">${mode?'DARK':'LIGHT'} · Your drivers</div>
${[lead,mate].map(d=>`<div class="mrow">${helmet(player,d.helmetPattern,56,'small')}<div><div class="name">#${d.number} ${d.name}</div><div class="m">${player.name} · ${d.archetype}</div></div></div>`).join('')}</div>`).join('')}
${['','dark'].map(mode=>`<div class="mock ${mode} carcard" style="padding:0">${car(player,640)}<div class="cap"><div class="name">Current car</div><div class="m">${player.name} · the car gets the full card width instead of a small strip</div></div></div>`).join('')}
</div></section>
<section><h2>What to approve</h2><ul>
<li><b>Overall style:</b> flat colour blocks, one darker shade per colour, no outlines, no gradients on the subject, chunky rounded helmet, bold diagonal sweeps.</li>
<li><b>Palette:</b> team primary, off-white #F5EFE6, charcoal #24232B, plus the team's secondary/accent. Very dark teams get a pale visor seal, and rims in their stripe colour, so nothing disappears.</li>
<li><b>Helmet angle and framing</b>, and blue versus team-tinted background.</li>
<li><b>Car angle, proportions and the cream card treatment.</b></li>
</ul></section>
</main></body></html>`;
  fs.writeFileSync(path.join(out,'review.html'),html);
  for(const [name,viewport,scale] of [['phone',{width:390,height:844},2],['desktop',{width:1440,height:1000},1]]){
   const p=await browser.newPage({viewport,deviceScaleFactor:scale});
   await p.goto('file://'+path.join(out,'review.html'));
   if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(name+': horizontal overflow');
   await p.screenshot({path:path.join(out,`review-${name}.png`),fullPage:true});
   const sections=await p.locator('section').all();
   for(const [i,s] of sections.slice(0,3).entries())await s.screenshot({path:path.join(out,`review-${name}-${i+1}.png`)});
   await p.close();
  }
  console.log('wrote',path.relative(repo,out));
 }finally{await browser.close();fs.rmSync(build,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1);});
