// Existing TypeScript, React Native Web and Playwright only. No install or app debug route.
// Render the actual native-compatible component through RN Web for the palette review sheet.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),Module=require('node:module');
const {chromium}=require('playwright'),ts=require('typescript'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.FORMULA_ARTIFACT_DIR||path.join(root,'docs/screenshots/driver-portraits'));
fs.mkdirSync(out,{recursive:true});
const oldLoad=Module._load,oldTs=require.extensions['.ts'],oldTsx=require.extensions['.tsx'];
const compile=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2020}
}).outputText,file);
let DriverPortrait,StyleSheet;
try{
 require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
 Module._load=function(name,...args){return oldLoad.call(this,name==='react-native'?'react-native-web':name,...args);};
 ({DriverPortrait}=require('../src/ui/art/DriverPortrait.tsx'));
 ({StyleSheet}=require('react-native-web'));
}finally{
 Module._load=oldLoad;
 if(oldTs)require.extensions['.ts']=oldTs;else delete require.extensions['.ts'];
 if(oldTsx)require.extensions['.tsx']=oldTsx;else delete require.extensions['.tsx'];
}
const palettes=[
 {name:'ORANGE',primary:'#FF8700',secondary:'#1E1E1E',accent:'#FFFFFF'},
 {name:'RED',primary:'#D83A4C',secondary:'#1E1E1E',accent:'#FFFFFF'},
 {name:'SILVER / TEAL',primary:'#BEC8CD',secondary:'#247E83',accent:'#000000'}
];
const markup=palettes.map((palette,i)=>`<section><h2>${palette.name}</h2><div class="sizes">${[80,100,120].map(size=>`<div data-palette="${i}" data-size="${size}" class="sample">${renderToStaticMarkup(React.createElement(DriverPortrait,{...palette,size}))}<p>${size}px</p></div>`).join('')}</div></section>`).join('');
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Formula Tycoon — one portrait, three palettes</title><style>${StyleSheet.getSheet().textContent}
body{margin:0;padding:32px;background:#0D1925;color:#EDF1EC;font:16px system-ui}h1{margin:0 0 8px;font-size:28px}header p{color:#A7BDCA;margin:0 0 24px}section{border-top:1px solid #334B60;padding:14px 0}h2{font-size:13px;letter-spacing:2px;color:#A7BDCA;margin:0 0 12px}.sizes{display:flex;gap:64px;align-items:end}.sample{min-width:144px;display:flex;align-items:center;flex-direction:column}p{font-size:12px;color:#A7BDCA;margin:10px 0 0}footer{margin-top:16px;color:#A7BDCA;font-size:13px}</style><header><h1>ONE DRIVER. THREE PALETTES.</h1><p>Same component and geometry · helmet + shoulders · 80 / 100 / 120 px</p></header>${markup}<footer>Original anonymous template · fixed charcoal visor · no baked driver images</footer></html>`;
fs.writeFileSync(path.join(out,'palette-gallery.html'),html);
(async()=>{
 const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const gallery=await browser.newPage({viewport:{width:680,height:880}}),errors=[];
  gallery.on('pageerror',e=>errors.push(e.message));
  await gallery.goto(`http://127.0.0.1:${server.address().port}`);
  for(const [i,palette] of palettes.entries())for(const size of [80,100,120]){
   const sample=gallery.locator(`[data-palette="${i}"][data-size="${size}"]`);
   const geometry=await sample.getByTestId('driver-portrait').boundingBox();
   if(Math.abs(geometry.width-size)>.1)throw new Error('Wrong card width');
   for(const region of ['helmet','suit'])for(const token of ['primary','secondary','accent']){
    const expected=palette[token].match(/[0-9a-f]{2}/gi).map(c=>parseInt(c,16)).join(', ');
    if(await sample.getByTestId(`${region}-${token}`).evaluate(n=>getComputedStyle(n).backgroundColor)!==`rgb(${expected})`)throw new Error(`${palette.name} ${region} ${token}`);
   }
   if(await sample.getByTestId('portrait-visor').evaluate(n=>getComputedStyle(n).backgroundColor)!=='rgb(32, 34, 42)')throw new Error('Visor changed');
  }
  await gallery.screenshot({path:path.join(out,'three-palette-card-scales.png'),fullPage:true});
  const app=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  app.on('pageerror',e=>errors.push(e.message));
  await app.goto(process.env.FORMULA_PREVIEW_URL||'http://127.0.0.1:8783');
  await app.getByRole('tab',{name:'DRIVERS',exact:true}).click();
  const own=app.getByTestId('your-drivers').getByTestId('driver-portrait');
  if(await own.count()!==2)throw new Error('Own portrait pair');
  for(const portrait of await own.all()){
   const box=await portrait.boundingBox();if(box.width!==80)throw new Error('Featured portrait must be 80px');
   if(await portrait.getByTestId('helmet-primary').evaluate(n=>getComputedStyle(n).backgroundColor)!=='rgb(90, 157, 219)')throw new Error('Current Wellington palette');
  }
  const shot=async name=>{
   if(await app.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Phone overflow');
   await app.screenshot({path:path.join(out,name+'.png'),scale:'css'});
  };
  await shot('drivers-roster-390x844');
  await app.getByRole('button',{name:'View Carlos Sainor',exact:true}).click();
  if((await app.getByTestId('driver-portrait').boundingBox()).width!==140)throw new Error('Dossier template scale');
  await shot('driver-dossier-390x844');
  await app.getByRole('button',{name:'Back to drivers',exact:true}).click();
  await app.getByRole('button',{name:'Starting grid',exact:true}).click();
  await app.getByRole('button',{name:'View Lewis Harlton',exact:true}).click();
  if(await app.getByTestId('helmet-primary').evaluate(n=>getComputedStyle(n).backgroundColor)!=='rgb(218, 70, 86)')throw new Error('Rival palette');
  await shot('rival-dossier-390x844');
  await app.setViewportSize({width:1440,height:1000});await shot('driver-dossier-desktop');
  if(errors.length)throw new Error(JSON.stringify(errors));
  console.log(JSON.stringify({threePalettes:true,cardWidths:[80,100,120],sixRegions:true,fixedVisor:true,ownRosterPortraits:2,dossierSize:140,rivalPalette:true,phone:'390x844',desktop:'1440x1000',errors,horizontalOverflow:false}));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
