// Roster pack import flow against the exported web app. Existing Playwright + Chromium only.
// Usage: serve dist/ (e.g. on 8783), then: node scripts/check-roster-packs.cjs
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.env.FORMULA_ARTIFACT_DIR||'docs/screenshots/roster-packs');
const url=process.env.FORMULA_PREVIEW_URL||'http://127.0.0.1:8783';
const fixtures=path.resolve(__dirname,'../src/game/roster/__tests__/fixtures');
fs.mkdirSync(root,{recursive:true});
const sizes=[['phone',{width:390,height:844},2],['desktop',{width:1440,height:1000},1]];
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const theme of ['light','dark'])for(const [size,viewport,scale] of sizes){
   const page=await browser.newPage({viewport,deviceScaleFactor:scale,...(size==='phone'?{isMobile:true,hasTouch:true}:{})});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.addInitScript(t=>{if(!sessionStorage.getItem('roster-check')){localStorage.clear();sessionStorage.setItem('roster-check','1');}localStorage.setItem('formula-tycoon.theme',t);},theme);
   const tag=`${size}-${theme}`;
   const body=()=>page.locator('body').innerText();
   const button=name=>page.getByRole('button',{name,exact:true});
   const must=async text=>page.getByText(text,{exact:true}).first().waitFor({timeout:8000});
   const check=async()=>{if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${tag}: horizontal overflow`);};
   const shot=async name=>{await check();await page.screenshot({path:path.join(root,`${name}-${tag}.png`)});};
   const load=async file=>{await page.setInputFiles('[data-testid=roster-pack-file]',path.join(fixtures,file));};
   // The app scrolls inside its own view: align a section to the top of it before each shot.
   const scrollTo=async text=>{await page.getByText(text,{exact:true}).first().evaluate(n=>n.scrollIntoView({block:'start'}));await page.waitForTimeout(150);};
   const openSettings=async()=>{await button('Settings').click();await must('Roster packs');};
   const driverNames=async()=>{await page.getByRole('tab',{name:'DRIVERS',exact:true}).click();await page.getByTestId('your-drivers').waitFor();return page.getByTestId('your-drivers').innerText();};

   await page.goto(url);await must('Mar 2, 2026');
   if(!(await driverNames()).includes('Dakota Reyes'))throw new Error(`${tag}: default roster names missing`);
   await page.getByRole('tab',{name:'HQ',exact:true}).click();
   await openSettings();await must('Formula Tycoon fictional roster');
   if(await page.getByRole('button',{name:/CONTINUE/i}).count())throw new Error(`${tag}: turn controls live under settings`);
   await shot('01-settings');

   await load('sample-invalid.json');await must("This pack can't be used yet");
   for(const text of ['Team slot 3','Slot must be a whole number from 1 to 11.','Unknown field "helmetPatern". Check the spelling against the format guide.'])await must(text);
   await scrollTo("This pack can't be used yet");await shot('02-errors');

   await load('sample-cosmetic.json');await must('Sample: Coastal League');await must('COSMETIC PACK');
   for(const text of ['Brightwater Racing','Ironpine Motorsport','#71  Orla Penhallow','#64  Imke Sandvoort'])await must(text);
   await scrollTo('Sample: Coastal League');await shot('03-preview-cosmetic');
   await scrollTo('Teams and race drivers');await shot('03-preview-cosmetic-teams');
   await button('Apply to this career').click();await must('Now showing "Sample: Coastal League". Your career, results and stats are unchanged.');
   await button('Back to game').click();
   let names=await driverNames();if(!names.includes('Imke Sandvoort')||!names.includes('Ironpine Motorsport'))throw new Error(`${tag}: cosmetic pack not shown: ${names}`);
   await shot('04-drivers-cosmetic');

   await openSettings();await load('sample-full.json');await must('FULL PACK');await must('Changes the stats of 3 drivers. Stats only apply to a new career.');
   await scrollTo('Underdog Works');await shot('05-preview-full');
   await button('Start a new career with this pack').click();await scrollTo('Apply');await must('End career and start new');
   await shot('06-full-confirm');
   await button('End career and start new').click();await must('New career started with "Sample: Upside-down grid".');
   await button('Back to game').click();
   names=await driverNames();if(!names.includes('Juno Ashgrove')||!names.includes('Underdog Works'))throw new Error(`${tag}: full pack career missing: ${names}`);
   // A remembered full pack seeds the next launch's new career.
   await page.reload();names=await driverNames();if(!names.includes('Juno Ashgrove'))throw new Error(`${tag}: full pack not remembered`);

   await openSettings();await must('FULL PACK');await button('Reset to default roster').click();
   await must('Default names and colours restored. This career keeps the stats it started with; start a new career to use the default stats too.');
   await shot('07-reset');
   await button('Back to game').click();names=await driverNames();if(!names.includes('Dakota Reyes'))throw new Error(`${tag}: reset did not restore names`);
   if(errors.length)throw new Error(`${tag}: page errors: ${errors.join(' | ')}`);
   await page.close();
   console.log('ok',tag);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
