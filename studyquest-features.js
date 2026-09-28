/* StudyQuest Feature Hub — local-first utilities */
(function(){
'use strict';
const K={daily:'sqFeatureDaily',goals:'sqFeatureGoals',flash:'sqFeatureFlashcards',theme:'sqTheme',sound:'sqSound'};
const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
function get(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}}
function set(k,v){localStorage.setItem(k,JSON.stringify(v))}
function toast(msg){const old=document.querySelector('.sq-toast');if(old)old.remove();const x=document.createElement('div');x.className='sq-toast';x.textContent=msg;document.body.appendChild(x);setTimeout(()=>x.remove(),2200)}
function modal(title,body){
 let m=$('sqModal');if(!m){m=document.createElement('div');m.id='sqModal';m.className='sq-modal';document.body.appendChild(m)}
 m.innerHTML='<div class="sq-modal-card"><button class="sq-close" onclick="sqClose()">✕</button><h2>'+title+'</h2>'+body+'</div>';m.classList.add('open');
}
window.sqClose=()=>{const m=$('sqModal');if(m)m.classList.remove('open')};

function daily(){
 let d=get(K.daily,{date:today(),done:0,streak:0});if(d.date!==today()){d={date:today(),done:0,streak:d.streak||0};set(K.daily,d)}
 return d;
}
function ensurePanel(){
 const home=$('home');if(!home||$('sqFeatureHub'))return;
 const panel=document.createElement('section');panel.id='sqFeatureHub';panel.className='sq-feature-hub';
 panel.innerHTML='<div class="sq-feature-head"><div><div class="eyebrow">🚀 STUDYQUEST POWER HUB</div><h2>More ways to <span>learn & play</span></h2><p>Daily challenges, focus tools, flashcards, goals and your player stats.</p></div><button class="ghost" onclick="sqSettings()">⚙️ Settings</button></div>'+
 '<div class="sq-feature-grid">'+
 '<button class="sq-tool" onclick="sqDaily()"><span class="sq-icon">🔥</span><b>Daily Quest</b><small>Complete today\'s mini challenge and build your streak.</small></button>'+
 '<button class="sq-tool" onclick="sqTimer()"><span class="sq-icon">⏱️</span><b>Focus Timer</b><small>25-minute study sprint with break reminders.</small></button>'+
 '<button class="sq-tool" onclick="sqFlashcards()"><span class="sq-icon">🃏</span><b>Flashcards</b><small>Quick recall practice for key facts and formulas.</small></button>'+
 '<button class="sq-tool" onclick="sqAchievements()"><span class="sq-icon">🏅</span><b>Badge Room</b><small>See milestones unlocked across your quest.</small></button>'+
 '<button class="sq-tool" onclick="sqGoals()"><span class="sq-icon">🎯</span><b>Study Goals</b><small>Set a daily target and track your progress.</small></button>'+
 '<button class="sq-tool" onclick="sqQuickPractice()"><span class="sq-icon">⚡</span><b>Quick Practice</b><small>Jump into a random subject without opening the map.</small></button>'+
 '<button class="sq-tool" onclick="sqFocus()"><span class="sq-icon">🧘</span><b>Focus Mode</b><small>Hide distractions while you study.</small></button>'+
 '<button class="sq-tool" onclick="location.href=\'leaderboard.html\'"><span class="sq-icon">🌍</span><b>Global Leaderboard</b><small>Open the competitive rankings already in StudyQuest.</small></button>'+
 '</div><div class="sq-stat-strip"><div class="sq-stat"><b id="sqfhXp">0</b><small>XP</small></div><div class="sq-stat"><b id="sqfhCoins">0</b><small>COINS</small></div><div class="sq-stat"><b id="sqfhStreak">0</b><small>DAY STREAK</small></div><div class="sq-stat"><b id="sqfhCompleted">0</b><small>LEVELS DONE</small></div><div class="sq-stat"><b id="sqfhGoal">0%</b><small>DAILY GOAL</small></div></div>';
 const anchor=home.querySelector('.typing-home');home.insertBefore(panel,anchor||home.lastElementChild);refreshStats();
}
function refreshStats(){
 const xp=+(localStorage.getItem('sqXp')||0),coins=+(localStorage.getItem('sqCoins')||0);
 let done=0;['math','science','english','hindi','ss'].forEach(s=>done+=Math.max(0,Math.min(20,(+(localStorage.getItem('sqProgress_'+s)||1))-1)));
 const d=daily(),g=get(K.goals,{target:2,progress:0,date:today()});if(g.date!==today()){g.date=today();g.progress=0;set(K.goals,g)}
 $('sqfhXp').textContent=xp;$('sqfhCoins').textContent=coins;$('sqfhStreak').textContent=d.streak||+(localStorage.getItem('sqStreak')||0);$('sqfhCompleted').textContent=done;$('sqfhGoal').textContent=Math.min(100,Math.round((g.progress/g.target)*100))+'%';
}
window.sqDaily=()=>{const d=daily();modal('🔥 Daily Quest','<p class="sq-muted">Today\'s mission: complete one level or do 10 minutes of focused study.</p><div class="sq-goal"><progress max="1" value="'+Math.min(1,d.done)+'"></progress><b>'+Math.min(1,d.done)+'/1</b></div><button class="primary" onclick="sqDailyDone()">Mark Daily Quest Complete</button>');};
window.sqDailyDone=()=>{const d=daily();if(!d.done){d.done=1;d.streak=(d.streak||0)+1;set(K.daily,d);localStorage.setItem('sqStreak',d.streak);let g=get(K.goals,{target:2,progress:0,date:today()});g.progress=Math.min(g.target,(g.progress||0)+1);set(K.goals,g);if(window.xp!==undefined){window.xp+=25;localStorage.setItem('sqXp',window.xp)}toast('🔥 Daily Quest complete! +25 XP');}else toast('Daily Quest already complete today.');sqClose();refreshStats();if(window.save)window.save();};
window.sqTimer=()=>{modal('⏱️ Focus Timer','<p class="sq-muted">Study for 25 minutes, then take a short break. You can stop anytime.</p><div id="sqTimerValue" class="sq-timer">25:00</div><div class="sq-timer-controls"><button class="primary" id="sqTimerStart" onclick="sqTimerStart()">Start</button><button class="ghost" onclick="sqTimerReset()">Reset</button></div>');window._sqTimerSec=1500;};
window.sqTimerStart=()=>{if(window._sqTimerRun)return;window._sqTimerRun=setInterval(()=>{window._sqTimerSec--;const e=$('sqTimerValue');if(e)e.textContent=Math.floor(window._sqTimerSec/60).toString().padStart(2,'0')+':'+(window._sqTimerSec%60).toString().padStart(2,'0');if(window._sqTimerSec<=0){clearInterval(window._sqTimerRun);window._sqTimerRun=null;toast('🎉 Focus session complete!');let g=get(K.goals,{target:2,progress:0,date:today()});g.progress=Math.min(g.target,(g.progress||0)+1);set(K.goals,g);refreshStats();}} ,1000);};
window.sqTimerReset=()=>{if(window._sqTimerRun){clearInterval(window._sqTimerRun);window._sqTimerRun=null}window._sqTimerSec=1500;const e=$('sqTimerValue');if(e)e.textContent='25:00';};
const cards=[['Photosynthesis','Plants use light energy to make food.'],['Gravity','Gravity attracts objects toward Earth.'],['Democracy','A system in which people participate in governing.'],['Fraction','A number representing part of a whole.'],['Satyagraha','A method of non-violent resistance associated with Gandhi.'],['Adjective','A word that describes a noun.'],['परोपकार','दूसरों की भलाई करना।'],['त्रिभुज','तीन भुजाओं वाली बंद आकृति।']];
window.sqFlashcards=()=>{let i=+(localStorage.getItem(K.flash)||0)%cards.length;modal('🃏 Flashcard Lab','<p class="sq-muted">Tap the card to reveal the answer.</p><div id="sqFlashCard" class="sq-flash" onclick="sqFlip()"><div><strong>'+cards[i][0]+'</strong><small>Tap to reveal</small></div></div><div class="sq-timer-controls"><button class="ghost" onclick="sqNextCard()">Next Card →</button></div>');window._sqCard=i};
window.sqFlip=()=>{const e=$('sqFlashCard');if(e)e.innerHTML='<div><strong>'+cards[window._sqCard][1]+'</strong><small>Answer</small></div>';};
window.sqNextCard=()=>{window._sqCard=(window._sqCard+1)%cards.length;localStorage.setItem(K.flash,window._sqCard);sqFlashcards();};
function achievementData(){const completed=['math','science','english','hindi','ss'].reduce((n,s)=>n+Math.max(0,Math.min(20,(+(localStorage.getItem('sqProgress_'+s)||1))-1)),0);const xp=+(localStorage.getItem('sqXp')||0);return [['🚀','First Mission',completed>=1],['🔥','3 Day Streak',(+(localStorage.getItem('sqStreak')||0))>=3],['🧠','Quiz Master',completed>=5],['🌎','World Explorer',completed>=10],['💎','XP Collector',xp>=1000],['🏆','Quest Champion',completed>=25]]}
window.sqAchievements=()=>modal('🏅 Badge Room','<div class="sq-ach">'+achievementData().map(a=>'<div class="sq-ach-item '+(a[2]?'':'locked')+'"><span>'+a[0]+'</span><b>'+a[1]+'</b><small>'+(a[2]?'Unlocked ✓':'Keep playing')+'</small></div>').join('')+'</div>');
window.sqGoals=()=>{let g=get(K.goals,{target:2,progress:0,date:today()});modal('🎯 Study Goals','<p class="sq-muted">Choose how many completed levels/focus sessions you want today.</p><div class="sq-goal"><input id="sqGoalInput" type="number" min="1" max="20" value="'+g.target+'" style="width:90px;padding:10px;border-radius:10px;border:1px solid #ffffff18;background:#ffffff08;color:#fff"><span>tasks today</span></div><button class="primary" onclick="sqSaveGoal()">Save Goal</button>');};
window.sqSaveGoal=()=>{let n=Math.max(1,Math.min(20,+(($('sqGoalInput')||{}).value)||2));let g=get(K.goals,{target:n,progress:0,date:today()});g.target=n;set(K.goals,g);sqClose();refreshStats();toast('🎯 Daily goal saved!');};
window.sqQuickPractice=()=>{const ss=['math','science','english','hindi','ss'];const s=ss[Math.floor(Math.random()*ss.length)];if(typeof openLevels==='function')openLevels(s);};
window.sqFocus=()=>{document.body.classList.toggle('sq-focus-mode');toast(document.body.classList.contains('sq-focus-mode')?'🧘 Focus Mode ON':'Focus Mode OFF');};
window.sqSettings=()=>{modal('⚙️ Study Settings','<div class="sq-toggle"><span>Theme: <b id="sqThemeLabel">Dark</b></span><button onclick="sqTheme()">Toggle</button></div><div class="sq-toggle"><span>Sound effects</span><button onclick="sqSound()">Toggle</button></div><div class="sq-toggle"><span>Focus Mode</span><button onclick="sqFocus();sqClose()">Toggle</button></div><p class="sq-muted" style="margin-top:14px">Your feature-hub data is stored locally in this browser.</p>');};
window.sqTheme=()=>{const light=document.body.classList.toggle('sq-light');localStorage.setItem(K.theme,light?'light':'dark');toast(light?'☀️ Light mode':'🌙 Dark mode');};
window.sqSound=()=>{const on=localStorage.getItem(K.sound)!=='off';localStorage.setItem(K.sound,on?'off':'on');toast(on?'🔇 Sound effects off':'🔊 Sound effects on');};
document.addEventListener('DOMContentLoaded',()=>{if(localStorage.getItem(K.theme)==='light')document.body.classList.add('sq-light');ensurePanel();setTimeout(ensurePanel,300);});
window.addEventListener('load',ensurePanel);
})();
