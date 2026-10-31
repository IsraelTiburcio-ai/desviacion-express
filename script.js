import { createRound, answerFor, explanation, format } from './data.js';
const resultsBridge = window.OptiLabResults ? window.OptiLabResults.create('desviacion-express') : { start() {}, complete() {}, cancel() {} };
const $ = id => document.getElementById(id);
const bins = [...document.querySelectorAll('.bin')];
let round = [], index = 0, hits = 0, streak = 0, best = 0, phase = 'intro', paused = false, elapsed = 0, cardTime = 0, last = 0, feedbackTime = 0, history = [], motion, muted = true, audio;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const LIMIT = 10500, FEEDBACK = 2200;
function sound(correct) {
 if (muted) return;
 try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); const o = audio.createOscillator(), g = audio.createGain(); o.connect(g); g.connect(audio.destination); o.frequency.setValueAtTime(correct ? 660 : 210,audio.currentTime); o.frequency.exponentialRampToValueAtTime(correct ? 990 : 150,audio.currentTime+.1); g.gain.setValueAtTime(.045,audio.currentTime); g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14); o.start(); o.stop(audio.currentTime+.15); } catch { /* Le jeu reste utilisable sans Web Audio. */ }
}
function start() {
 resultsBridge.start();
 motion?.cancel(); round = createRound(); index=hits=streak=best=elapsed=cardTime=0; history=[]; paused=false;
 $('intro').hidden=true; $('result').hidden=true; $('game').hidden=false; $('pause').textContent='Pausar'; document.body.classList.remove('paused');
 $('steps').replaceChildren(...round.map(() => document.createElement('i'))); update(); showCard(); bins[0].focus({preventScroll:true});
}
function update() { $('progress').textContent=`${index} / 8`; $('streak').textContent=streak; $('clock').textContent=`${(elapsed/1000).toFixed(1)} s`; }
function showCard() {
 if(index===8) return finish();
 motion?.cancel(); phase='active'; cardTime=0; const c=round[index], penalty=c.kind==='penalty';
 $('mode').textContent=penalty?'ELIGE QUÉ PENALIZAR':'CLASIFICA EL RESULTADO';
 $('category').textContent=c.category; $('serial').textContent=`META / ${String(index+1).padStart(2,'0')}`;
 $('situation').textContent=penalty?`Meta: ${c.rule==='min'?'al menos':c.rule==='max'?'a lo más':'exactamente'} ${c.unit==='pesos'?'$':''}${format(c.target)} ${c.unit==='pesos'?'':c.unit}.`:`${c.category}: compara y clasifica.`;
 $('numbers').replaceChildren();
 for(const [label,value] of (penalty ? (c.actual===undefined?[]:[['Resultado real',c.actual]]) : [['Meta',c.target],['Resultado real',c.actual]])) {
  const d=document.createElement('div'), s=document.createElement('small'), b=document.createElement('b'), u=document.createElement('span'); s.textContent=label;b.textContent=(c.unit==='pesos'?'$':'')+format(value);u.textContent=` ${c.unit==='pesos'?'MXN':c.unit}`;d.append(s,b,u);$('numbers').append(d);
 }
 $('numbers').hidden=penalty&&c.actual===undefined;
 $('prompt').textContent=penalty?'¿Qué desviación interesa penalizar en la función objetivo?':'¿Faltó, sobró o se cumplió exactamente?';
 $('label-minus').textContent=penalty?'PENALIZAR':'FALTÓ';$('label-plus').textContent=penalty?'PENALIZAR':'SOBRÓ';$('label-exact').textContent=penalty?'AMBAS':'META EXACTA';$('symbol-exact').textContent=penalty?'d⁻ y d⁺':'=';$('hint-exact').textContent=penalty?'Buscar exactitud':'Ambas cero';
 bins.forEach((b,i)=>{b.disabled=false;b.classList.remove('hit','miss');b.setAttribute('aria-label',penalty?['Penalizar d menos','Penalizar d más','Penalizar ambas desviaciones'][i]:['Faltó, d menos','Sobró, d más','Meta exacta, ambas cero'][i]);});
 $('feedback').className='feedback';$('feedback-text').textContent=penalty?'Atención: penalizar no es lo mismo que observar un resultado.':'Un toque en el contenedor correcto.';$('next').hidden=true;
}
function classify(choice) {
 if(phase!=='active'||paused) return;
 const c=round[index], correct=choice===answerFor(c); phase='feedback';feedbackTime=0;
 if(correct){hits++;streak++;best=Math.max(best,streak);}else streak=0;
 history.push({item:c,choice,correct});$('steps').children[index].className=correct?'correct':'wrong';
 bins.forEach(b=>{b.disabled=true; if(b.dataset.choice===answerFor(c))b.classList.add('hit');else if(b.dataset.choice===choice)b.classList.add('miss');});
 $('feedback').className=`feedback ${correct?'good':'bad'}`;$('feedback-text').textContent=`${correct?'Correcto.':choice===null?'Terminó el recorrido.':'Revisa el destino.'} ${explanation(c)}`;$('next').hidden=false;
 if(choice!==null&&!reduced.matches){const target=bins.find(b=>b.dataset.choice===choice).getBoundingClientRect(), source=$('card').getBoundingClientRect();motion=$('card').animate([{transform:$('card').style.transform},{transform:`translate(${target.x+target.width/2-source.x-source.width/2}px,${target.y-source.y}px) scale(.2)`,opacity:0}],{duration:280,fill:'forwards',easing:'ease-in'});}
 sound(correct);update();$('next').focus({preventScroll:true});
}
function next(){if(phase!=='feedback'||paused)return;index++;update();showCard();if(phase==='active')bins[0].focus({preventScroll:true});}
function finish(){resultsBridge.complete({reason:'completed',correct:hits,total:8,durationMs:Math.round(elapsed)});phase='result';$('game').hidden=true;$('result').hidden=false;$('stats').innerHTML=`<div><strong>${hits}/8</strong><small>ACIERTOS</small></div><div><strong>${Math.round(hits/8*100)}%</strong><small>PRECISIÓN</small></div><div><strong>${(elapsed/1000).toFixed(1)} s</strong><small>TIEMPO ACTIVO</small></div>`;$('review').replaceChildren(...history.map(h=>{const li=document.createElement('li');li.textContent=`${h.correct?'Correcta':h.choice===null?'Sin respuesta':'Por repasar'} · ${h.item.category}, meta ${format(h.item.target)}${h.item.actual===undefined?'':`, resultado ${format(h.item.actual)}`}. ${explanation(h.item)}`;return li;}));$('result').focus({preventScroll:true});}
function pause(force){if(!['active','feedback'].includes(phase))return;paused=force??!paused;$('pause').textContent=paused?'Reanudar':'Pausar';document.body.classList.toggle('paused',paused);bins.forEach(b=>b.disabled=paused||phase!=='active');$('next').disabled=paused;$('instruction').textContent=paused?'LÍNEA EN PAUSA · REANUDA CUANDO QUIERAS':'TOCA EL DESTINO DE LA TARJETA ↓';}
function tick(now){const dt=last?now-last:0;last=now;if(!paused&&['active','feedback'].includes(phase)){elapsed+=dt;if(phase==='active'){cardTime+=dt;const p=Math.min(cardTime/LIMIT,1);$('remaining').textContent=`${Math.max(0,(LIMIT-cardTime)/1000).toFixed(1)} s`;$('timer-fill').style.transform=`scaleX(${1-p})`;const travel=Math.min(50,($('track').clientWidth-$('card').offsetWidth)/2-8);$('card').style.transform=`translateX(${reduced.matches?0:(p*2-1)*travel}px)`;if(cardTime>=LIMIT)classify(null);}else{feedbackTime+=dt;if(feedbackTime>=FEEDBACK)next();}update();}requestAnimationFrame(tick);}
bins.forEach(b=>b.addEventListener('click',()=>classify(b.dataset.choice)));
$('start').onclick=start;$('replay').onclick=start;$('next').onclick=next;$('pause').onclick=()=>pause();$('sound').onclick=()=>{muted=!muted;$('sound').textContent=`Sonido: ${muted?'no':'sí'}`;$('sound').setAttribute('aria-pressed',String(!muted));$('sound').setAttribute('aria-label',muted?'Activar sonido':'Silenciar sonido');sound(true);};
document.addEventListener('keydown',e=>{if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;if(['1','2','3'].includes(e.key)&&phase==='active'){e.preventDefault();classify(['minus','plus','exact'][Number(e.key)-1]);}if(e.key.toLowerCase()==='p')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);});reduced.addEventListener('change',()=>motion?.cancel());requestAnimationFrame(tick);
