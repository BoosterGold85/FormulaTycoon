// Existing Playwright + Chromium only; serves the actual exported app. No package install.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.env.FORMULA_ARTIFACT_DIR||'/workspace/artifacts/ui-visual-v1/browser');
fs.mkdirSync(root,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const must=async(text)=>page.getByText(text,{exact:true}).waitFor();
 const body=()=>page.locator('body').innerText();
 const button=name=>page.getByRole('button',{name,exact:true});
 const tab=async name=>page.getByRole('tab',{name,exact:true}).click();
 const check=async()=>{
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Horizontal overflow');
  if(/P2P|overallReference|Overall reference|\bOVR\b|\/100|\bfitBonus\b/.test(await body()))throw new Error('Hidden numeric disclosure');
 };
 const shot=async name=>{await check();await page.screenshot({path:path.join(root,name+'.png')});};
 const driver=async name=>{await button('View '+name).first().click();await page.getByRole('heading',{name,exact:true}).waitFor();};
 const contract=async name=>{await driver(name);await button('Contract details').click();};
 const back=async()=>button('Back to drivers').click();
 await page.goto(process.env.FORMULA_PREVIEW_URL||'http://127.0.0.1:8781');
 await must('Monday');await must('Mar 2, 2026');await must('Melbourne');await must('Mar 6–8 · 4 days');
 await shot('00-hq-arrivals');
 await tab('DRIVERS');await must('Your drivers');
 if(await page.getByTestId('your-drivers').getByRole('button').count()!==2)throw new Error('Own roster');
 let text=await body();if(/Racecraft|Technical Feedback|guaranteed|\$30M/.test(text))throw new Error('Roster too dense');
 const ownBox=await button('View Carlos Sainor').boundingBox();if(!ownBox||ownBox.y>300)throw new Error('Own drivers not first');
 const marketTarget=await button('Prospects').boundingBox();if(!marketTarget||marketTarget.width<44||marketTarget.height<44)throw new Error('Small market touch target');
 await shot('01-drivers-roster');
 await driver('Carlos Sainor');
 for(const label of ['Talent','Racecraft','Adaptability','Composure','Technical Feedback','Marketability','NORMAL'])await must(label);
 if(!/Car · (Comfortable|Adapting|Challenging)/.test(await body()))throw new Error('Missing driver comfort');
 if((await body()).includes('$30M'))throw new Error('Contract not progressively disclosed');
 await shot('02-driver-profile');await button('Contract details').click();
 if(!(await body()).includes('$30M / year'))throw new Error('Own contract not reachable');
 await back();await button('Starting grid').click();
 if(await page.getByTestId('driver-market-list').getByRole('button').count()!==22)throw new Error('Grid22');
 await contract('Max Verhoeven');text=await body();
 if(!text.includes('$107M / year')||!text.includes('2030')||!text.includes('4 future guaranteed years')||text.includes('team option'))throw new Error('Max contract');
 await button('Background & commercial').click();await must('COMMERCIAL REACH');await check();await back();
 for(const [name,salary,year,deadline] of [['Lewis Harlton','$60M',2028,'2027-12-07'],['Esteban Ortez','$7M',2027,'2026-12-07'],['Oliver Bearford',null,2027,'2026-12-07'],['Valtteri Botten',null,2028,'2027-12-07']]){
  await contract(name);text=await body();
  if(!text.includes(year+' team option · pending')||!text.includes(deadline)||(salary&&!text.includes(salary)))throw new Error('Option '+name);
  if(await page.getByRole('button',{name:/Exercise .* team option/}).count())throw new Error('Foreign option control');
  await back();
 }
 await contract('Charles Leclair');text=await body();if(!text.includes('$53M / year')||!text.includes('Reported')||text.includes('team option'))throw new Error('Reported contract');await back();
 await button('Prospects').click();if(await page.getByTestId('driver-market-list').getByRole('button').count()!==10)throw new Error('Prospects10');
 await driver('Rafael Cordeiro');if(!(await body()).includes(' to '))throw new Error('Lost scouting uncertainty');
 await button('Scouting report').click();await must('SCOUTING · LOW CONFIDENCE');await button('Improve scouting report').click();
 await page.getByText(/Reports: 1\./).waitFor();await shot('03-scouting-detail');await back();
 await button('Reserves').click();if(await page.getByTestId('driver-market-list').getByRole('button').count()!==11)throw new Error('Reserves11');
 await contract('Yuto Takase');text=await body();if(!text.includes('Reserve · 2026–2026 guaranteed · $5M / year')||!text.includes('Reported')||!text.includes('Vortex Racing / Veloce Racing')||text.includes('team option'))throw new Error('Reserve');
 await tab('TEAM');await page.getByRole('heading',{name:'Your team',exact:true}).waitFor();
 const suitability=await page.getByTestId('team-car-suitability').boundingBox();if(!suitability||suitability.height>26)throw new Error('Team suitability wraps at mobile width');
 await shot('06-team-dashboard');
 await button('View car').click();await button('Fitted components').click();await page.getByText('Spec 1',{exact:true}).first().waitFor();await check();await button('Back to team').click();
 await button('View development').click();await must('No active projects');if((await body()).includes('62%'))throw new Error('Invented project');await button('Back to team').click();
 await button('View organization').click();await must('Your headquarters');await must('Independent dynasty rebuilding');await check();await button('Back to team').click();
 await driver('Carlos Sainor');await button('Contract details').click();if(!(await body()).includes('$30M / year'))throw new Error('Team profile');await button('Back to team').click();
 await button('Manage drivers').click();await button('Prospects').click();await driver('Rafael Cordeiro');await button('Scouting report').click();await page.getByText(/Reports: 1\./).waitFor();
 await tab('RACE');await must('March 2026');await must('4 DAYS');await shot('04-race-calendar');
 const dateButton=page.getByRole('button',{name:'2026-03-06, Melbourne, UPCOMING',exact:true});
 if(await dateButton.count()!==1)throw new Error('Actual March date');
 const dateTarget=await dateButton.boundingBox();if(!dateTarget||dateTarget.width<44||dateTarget.height<44)throw new Error('Small date touch target');
 const all=new Map(),sprints=new Set(),wanted=new Set(['Melbourne','Suzuka','Monaco','Monza','Madrid','Sepang','Singapore','Mexico City','Las Vegas']);
 const names=['January','February','March','April','May','June','July','August','September','October','November','December'];
 let month=3;
 for(;month>=2;month--)await button('Previous month').click();
 for(month=1;month<=12;month++){
  await must(names[month-1]+' 2026');await check();
  const rows=page.getByRole('button',{name:/^Open .* event$/}),labels=await rows.evaluateAll(nodes=>nodes.map(n=>({name:n.getAttribute('aria-label'),text:n.innerText})));
  for(const row of labels){const venue=row.name.slice(5,-6);all.set(venue,true);if(row.text.includes('SPRINT'))sprints.add(venue);
   if(wanted.has(venue)){
    await button(row.name).click();await page.getByRole('heading',{name:venue,exact:true}).waitFor();
    await page.getByRole('heading',{name:/^CAR FIT — /}).waitFor();
    if(await page.getByTestId('event-defining-demands').getByText(/^(HIGH|VERY HIGH)$/,{exact:true}).count()>3)throw new Error('Too many initial circuit demands');
    if((await body()).includes('TRACK CHARACTER'))throw new Error('Deep briefing visible before disclosure');
    if(venue==='Melbourne')await shot('05-event-detail');
    await button('More details').click();await must('TRACK CHARACTER');
    const demand=async(label,level)=>{const row=page.getByText(label,{exact:true}).last().locator('..');await row.getByText(level,{exact:true}).waitFor();};
    if(venue==='Madrid'){if((await body()).includes('Provisional profile'))throw new Error('Stale Madrid');await page.getByText(/Confirmed hybrid 22-corner layout/).waitFor();await demand('Tyre preservation','VERY HIGH');await demand('Braking stability','VERY HIGH');}
    if(venue==='Melbourne')await demand('Tyre preservation','LOW');
    if(venue==='Singapore'){await demand('Cooling','VERY HIGH');await demand('Reliability','MEDIUM');await demand('Tyre preservation','MEDIUM');}
    if(venue==='Mexico City'){await demand('Cooling','VERY HIGH');await page.getByText(/Approximately 2250 m altitude/).waitFor();}
    if(/\b(score|ranking|finishing position)\b/i.test(await body()))throw new Error('Technical leakage');
    await check();await button('Back to calendar').click();wanted.delete(venue);
   }
  }
  if(month<12)await button('Next month').click();
 }
 if(all.size!==23||sprints.size!==6||wanted.size)throw new Error('Season coverage '+JSON.stringify({all:[...all.keys()],sprints:[...sprints],wanted:[...wanted]}));
 await tab('HISTORY');await must('A legacy worth building.');await shot('07-history');
 await tab('HQ');await page.getByText('8/8 AT WORK',{exact:true}).waitFor({timeout:30000});await shot('08-hq');
 await button('James Walker, Race Engineer, working').click();await must('JAMES WALKER');await shot('09-hq-worker');
 await page.getByLabel('Dismiss card',{exact:true}).click({position:{x:200,y:400}});await button('Main Workshop department').click();await must('MAIN WORKSHOP');
 await page.getByLabel('Dismiss card',{exact:true}).click({position:{x:200,y:400}});await button('Restart the workday').click();await must('0/8 AT WORK');await must('Mar 2, 2026');await must('Mar 6–8 · 4 days');
 await page.getByText('8/8 AT WORK',{exact:true}).waitFor({timeout:30000});await check();
 if(errors.length)throw new Error(JSON.stringify(errors));
 // The same build on desktop: primary views and navigation remain usable with bounded content.
 await page.setViewportSize({width:1440,height:1000});
 for(const name of ['DRIVERS','TEAM','RACE','HISTORY']){await tab(name);await check();}
 await tab('RACE');await shot('10-desktop-calendar');
 console.log(JSON.stringify({viewport:'390x844',desktop:'1440x1000',ownDrivers:2,grid:22,prospects:10,reserves:11,contracts:true,disclosures:true,scoutingPersists:true,calendarRounds:all.size,sprints:sprints.size,nineCircuitDetails:true,calendarVersion:'calendar.2026.v2',hqCards:true,newDayPreservesDate:true,repeated8of8:true,errors,horizontalOverflow:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
