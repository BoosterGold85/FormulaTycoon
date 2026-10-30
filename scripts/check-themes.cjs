// Existing Playwright/Chromium; checks the exported app, never a duplicate theme demo screen.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.FORMULA_ARTIFACT_DIR||'docs/screenshots/default-light-theme');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const summary=[];
 try{
 for(const mode of ['light','dark']){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  if(mode==='dark')await context.addInitScript(()=>{if(!localStorage.getItem('formula-tycoon.theme'))localStorage.setItem('formula-tycoon.theme','dark');});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const button=name=>p.getByRole('button',{name,exact:true}),tab=async name=>p.getByRole('tab',{name,exact:true}).click();
  const switchTo=async next=>button(`Switch to ${next} theme`).click();
  const assertMode=async expected=>button(`Switch to ${expected==='light'?'dark':'light'} theme`).waitFor();
  const check=async()=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Horizontal overflow');if(errors.length)throw new Error(errors.join('\n'));};
  const shot=async name=>{await check();await p.screenshot({path:path.join(out,`${mode}-${name}.png`),scale:'css'});};
  await p.goto(process.env.FORMULA_PREVIEW_URL||'http://127.0.0.1:8783');await assertMode(mode);
  // Starting without a preference really defaults to light. Contexts have separate local storage.
  if(mode==='light'&&await p.evaluate(()=>localStorage.getItem('formula-tycoon.theme'))!==null)throw new Error('Light default requires no saved preference');
  await p.getByText('8/8 AT WORK',{exact:true}).waitFor({timeout:30000});
  await button('James Walker, Race Engineer, working').click();await shot('hq-worker-phone');
  await p.getByLabel('Dismiss card',{exact:true}).click({position:{x:200,y:400}});
  await tab('DRIVERS');
  const heading=p.getByRole('heading',{name:'Drivers',exact:true});
  const ink=await heading.evaluate(n=>getComputedStyle(n).color);
  if(ink!==(mode==='light'?'rgb(21, 35, 52)':'rgb(245, 239, 227)'))throw new Error('Heading does not follow theme');
  await shot('drivers-phone');
  const own=p.getByTestId('your-drivers').getByTestId('helmet-primary').first();
  const teamColor=await own.evaluate(n=>getComputedStyle(n).backgroundColor);
  await switchTo(mode==='light'?'dark':'light');
  if(await own.evaluate(n=>getComputedStyle(n).backgroundColor)!==teamColor)throw new Error('Theme changed canonical team art');
  await switchTo(mode);
  await button('View Carlos Sainor').click();await shot('dossier-phone');
  await button('Contract details').click();await p.getByText(/\$30M \/ year/).waitFor();
  await button('Back to drivers').click();await button('Prospects').click();await button('View Rafael Cordeiro').click();await button('Scouting report').click();
  await button('Improve scouting report').click();await p.getByText(/Reports: 1\./).waitFor();
  await switchTo(mode==='light'?'dark':'light');await p.getByText(/Reports: 1\./).waitFor();
  await switchTo(mode);await p.getByText(/Reports: 1\./).waitFor();
  await tab('RACE');await shot('calendar-phone');await button('View weekend').click();await shot('event-phone');
  await button('More details').click();await p.getByText('TRACK CHARACTER',{exact:true}).waitFor();
  await tab('TEAM');await shot('team-phone');await button('View car').click();await shot('car-phone');await button('Back to team').click();
  await button('View development').click();await p.getByText('No active projects',{exact:true}).waitFor();await check();await button('Back to team').click();
  await button('View organization').click();await p.getByText('People make the difference.',{exact:true}).waitFor();await check();
  await tab('HISTORY');await p.getByText('A legacy worth building.',{exact:true}).waitFor();await check();
  await tab('HQ');await p.getByText('8/8 AT WORK',{exact:true}).waitFor();
  await switchTo(mode==='light'?'dark':'light');await p.getByText('8/8 AT WORK',{exact:true}).waitFor();await switchTo(mode);
  await p.getByText('Mar 2, 2026',{exact:true}).waitFor();
  await p.setViewportSize({width:1440,height:1000});
  for(const name of ['DRIVERS','RACE','TEAM']){await tab(name);await shot(name.toLowerCase()+'-desktop');}
  await p.reload();await assertMode(mode); // Reload proves local preference, NOT saved career persistence.
  if(await p.evaluate(()=>localStorage.getItem('formula-tycoon.theme'))!==mode)throw new Error('Preference not retained');
  await check();summary.push({mode,phone:'390x844',desktop:'1440x1000',defaultOrPreference:true,teamColorsStable:true,reportSurvivesToggle:true,hqSurvivesToggle:true,reloadPreference:true,errors,horizontalOverflow:false});
  await context.close();
 }
 // Denied local storage still allows light and a session-local dark selection.
 const blocked=await browser.newPage({viewport:{width:390,height:844}});
 await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage denied');}}));
 await blocked.goto(process.env.FORMULA_PREVIEW_URL||'http://127.0.0.1:8783');
 await blocked.getByRole('button',{name:'Switch to dark theme',exact:true}).click();
 await blocked.getByRole('button',{name:'Switch to light theme',exact:true}).waitFor();
 console.log(JSON.stringify({themes:summary,deniedStorageFallback:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
