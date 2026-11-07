// Team screen check + screenshots against the exported web app (existing Playwright only).
// Usage: serve dist/ on 8783, then: node scripts/check-team-screen.cjs [label]
// The label names the screenshot set (e.g. "placeholders" or "assets"). Missing art files are expected:
// each slot must then show its labelled dashed placeholder.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const label=process.argv[2]||'placeholders';
const root=path.resolve(process.env.FORMULA_ARTIFACT_DIR||'docs/screenshots/team-screen');
const url=process.env.FORMULA_PREVIEW_URL||'http://127.0.0.1:8783';
fs.mkdirSync(root,{recursive:true});
const sizes=[['phone',{width:390,height:844},2],['desktop',{width:1440,height:1000},1]];
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const theme of ['light','dark'])for(const [size,viewport,scale] of sizes){
   const page=await browser.newPage({viewport,deviceScaleFactor:scale,...(size==='phone'?{isMobile:true,hasTouch:true}:{})});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(m.text());});
   await page.addInitScript(t=>{localStorage.clear();localStorage.setItem('formula-tycoon.theme',t);},theme);
   const tag=`${label}-${size}-${theme}`,must=t=>page.getByText(t,{exact:true}).first().waitFor({timeout:8000});
   await page.goto(url);await must('Mar 2, 2026');
   await page.getByRole('tab',{name:'TEAM',exact:true}).first().click();await page.getByTestId('team-band').waitFor();
   for(const t of ['YOUR TEAM','Ardent Dynamics','Championship','P7','Pre-season prediction','Board expectation','$45M','Unspent','4 days',
    'VS GRID AVERAGE','YOUR DRIVERS','TEAMMATE BATTLE','First qualifying in Melbourne','FACTORY','Factory idle','ORGANISATION','SEASON',
    'No results yet','SEASON PROGRESS','0 / 23'])await must(t);
   const body=await page.locator('body').innerText();
   if(/\bOVR\b|No staff yet|\bHire\b|\/100/.test(body))throw new Error(`${tag}: forbidden text`);
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${tag}: horizontal overflow`);
   if(!await page.getByTestId('battle-empty').count())throw new Error(`${tag}: teammate bar must be the empty dashed bar before any session`);
   await page.waitForTimeout(500);
   const missing=await page.locator('[data-testid$="-placeholder"]').count();
   console.log(tag,'placeholders showing:',missing);
   const scroller=page.getByTestId('team-overview');
   const shot=async(name,y)=>{await scroller.evaluate((n,y)=>{n.scrollTop=y;},y);await page.waitForTimeout(250);await page.screenshot({path:path.join(root,`${name}-${tag}.png`)});};
   const h=await scroller.evaluate(n=>n.scrollHeight-n.clientHeight);
   if(size==='desktop'){await shot('01-top',0);await shot('02-bottom',h);}
   else for(const [i,y] of [0,.3,.55,.8,1].entries())await shot(`0${i+1}-scroll`,Math.round(h*y));
   // Navigation still reaches the drill-ins.
   await page.getByRole('button',{name:'View car',exact:true}).click();await must('Back to team');
   await page.getByRole('button',{name:'Back to team',exact:true}).click();await page.getByTestId('team-band').waitFor();
   if(errors.length)throw new Error(`${tag}: page errors: ${errors.join(' | ')}`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
