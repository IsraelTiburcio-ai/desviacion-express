// Ejecutar: PLAYWRIGHT_PATH=/ruta/a/playwright/index.mjs node qa.mjs
import assert from 'node:assert/strict';
import { BANK, deviations, answerFor, createRound } from './data.js';
assert.ok(BANK.length>=24);assert.equal(new Set(BANK.map(c=>c.id)).size,BANK.length);
for(const c of BANK){
 const expected=c.kind==='penalty'?({min:'minus',max:'plus',exact:'exact'})[c.rule]:c.actual<c.target?'minus':c.actual>c.target?'plus':'exact';
 assert.equal(answerFor(c),expected);assert.equal(['minus','plus','exact'].filter(a=>a===answerFor(c)).length,1);
 if(c.actual!==undefined){const d=deviations(c.target,c.actual);assert.equal(c.actual+d.minus-d.plus,c.target);assert.ok(d.minus>=0&&d.plus>=0);assert.equal(d.minus*d.plus,0);}
}
const samples=new Set();
for(let i=0;i<1000;i++){const r=createRound();assert.equal(r.length,8);assert.equal(new Set(r.map(c=>c.id)).size,8);for(const [g,n] of [['short',2],['over',2],['equal',1],['minimum',1],['maximum',1],['interpret',1]])assert.equal(r.filter(c=>c.group===g).length,n);samples.add(r.map(c=>c.id).join(','));}
assert.ok(samples.size>950);console.log(`Académico: ${BANK.length} casos; 1,000 partidas con cobertura; ${samples.size} secuencias únicas.`);
const { chromium, webkit }=await import(process.env.PLAYWRIGHT_PATH);
const browser=await chromium.launch();const errors=[];
const context=await browser.newContext();const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
const url=process.env.QA_URL||'http://localhost:8037';
for(const [width,height] of [[390,844],[375,812],[820,1180],[1180,820],[1440,1000]]){
 await page.setViewportSize({width,height});await page.goto(url);await page.locator('#start').click();
 for(const state of ['result','penalty']){
  if(state==='penalty'){for(let j=0;j<5;j++){await page.keyboard.press('1');await page.locator('#next').click();}}
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,card:document.querySelector('#card').getBoundingClientRect().toJSON(),bins:[...document.querySelectorAll('.bin')].map(b=>b.getBoundingClientRect().toJSON())}));
  assert.equal(metrics.overflow,false);assert.ok(metrics.card.y>=0);for(const b of metrics.bins){assert.ok(b.width>=44&&b.height>=44);assert.ok(b.bottom<=height,`${width}: contenedor fuera de pantalla`);}
  await page.screenshot({path:`/var/folders/9m/nytmmft960lbhhc83zbd5v1w0000gn/T/opencode/express-${width}-${state}.png`,fullPage:true});
 }
 console.log(`Responsive ${width}×${height}: sin overflow, tarjeta visible y contenedores táctiles visibles.`);
}
// Cinco partidas completas. Primera con pausas de lectura reales, siguientes sin esperas artificiales.
const durations=[];
for(let run=0;run<5;run++){
 await page.goto(url);await page.locator('#start').click();
 const ids=[];
 for(let j=0;j<8;j++){
  if(run===0)await page.waitForTimeout(7900);
  const snapshot=await page.evaluate(()=>({mode:document.querySelector('#mode').textContent,title:document.querySelector('#situation').textContent,nums:[...document.querySelectorAll('#numbers b')].map(n=>Number(n.textContent.replace(/[^0-9.]/g,'')))}));
  let key;if(snapshot.mode.includes('PENALIZAR'))key=snapshot.title.includes('al menos')?'1':snapshot.title.includes('a lo más')?'2':'3';else key=snapshot.nums[1]<snapshot.nums[0]?'1':snapshot.nums[1]>snapshot.nums[0]?'2':'3';
  ids.push(JSON.stringify(snapshot));await page.keyboard.press(key);assert.match(await page.locator('#feedback-text').textContent(),/^Correcto/);await page.locator('#next').click();
 }
 assert.equal(await page.locator('#result').isVisible(),true);assert.match(await page.locator('#stats').textContent(),/8\/8/);durations.push(await page.locator('#stats').innerText());
 await page.locator('#replay').click();assert.equal(await page.locator('#progress').textContent(),'0 / 8');assert.equal(await page.locator('#streak').textContent(),'0');
 console.log(`Partida ${run+1}: 8/8, replay correcto. ${durations[run].replaceAll('\n',' ')}`);
}
// Error, timeout, pausa, sonido, teclado, movimiento reducido y toque real emulado.
await page.goto(url);await page.locator('#start').click();await page.keyboard.press('p');const before=await page.locator('#clock').textContent();await page.waitForTimeout(400);assert.equal(await page.locator('#clock').textContent(),before);await page.keyboard.press('p');await page.waitForTimeout(10800);assert.match(await page.locator('#feedback-text').textContent(),/Terminó el recorrido/);await page.locator('#next').click();await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');await page.locator('#sound').click();
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.locator('#start').click();await page.waitForTimeout(400);assert.equal(await page.locator('#card').evaluate(c=>c.style.transform),'translateX(0px)');
const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const tp=await touch.newPage();await tp.goto(url);await tp.locator('#start').tap();await tp.locator('.bin').first().tap();assert.equal(await tp.locator('#next').isVisible(),true);await tp.locator('#next').tap();assert.equal(await tp.locator('#progress').textContent(),'1 / 8');
assert.deepEqual(errors,[]);await browser.close();
// WebKit cubre además el motor de Safari con viewport de iPad (emulación, no dispositivo físico).
const safari=await webkit.launch();const sp=await safari.newPage({viewport:{width:820,height:1180},hasTouch:true});await sp.goto(url);await sp.locator('#start').tap();await sp.locator('.bin').first().tap();assert.equal(await sp.locator('#next').isVisible(),true);await safari.close();
console.log('QA funcional: teclado, toque, replay ×5, pausa, timeout, silencio, movimiento reducido, sin errores JS. WebKit iPad: interacción correcta.');
