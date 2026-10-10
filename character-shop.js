(()=>{const KEY='sqSelectedCharacter',OWN='sqOwnedCharacters';
const chars=[
{id:'scholar',name:'Scholar',title:'Smart Starter',price:0,emoji:'🧑‍🎓',className:'c-scholar',desc:'Focused learner'},
{id:'scientist',name:'Scientist',title:'Science Genius',price:100,emoji:'🧑‍🔬',className:'c-scientist',desc:'Curious problem solver'},
{id:'engineer',name:'Engineer',title:'Logic Master',price:200,emoji:'🧑‍💻',className:'c-engineer',desc:'Builds and solves'},
{id:'explorer',name:'Explorer',title:'Knowledge Adventurer',price:350,emoji:'🧭',className:'c-explorer',desc:'Discovers new worlds'},
{id:'professor',name:'Professor',title:'Brain Boss',price:500,emoji:'🧑‍🏫',className:'c-professor',desc:'Master of subjects'},
{id:'inventor',name:'Inventor',title:'Idea Genius',price:750,emoji:'💡',className:'c-inventor',desc:'Creates clever ideas'},
{id:'champion',name:'Champion',title:'Quest Master',price:1000,emoji:'🦸‍♂️',className:'c-champion',desc:'Elite quest character'},
{id:'legend',name:'Legend',title:'Ultimate Genius',price:1500,emoji:'🧠',className:'c-legend',desc:'Legendary learning avatar'},
{id:'astronaut',name:'Astronaut',title:'Space Voyager',price:180,emoji:'👨‍🚀',className:'c-astronaut',desc:'Explore the learning universe'},
{id:'robot',name:'Robo Buddy',title:'Tech Companion',price:220,emoji:'🤖',className:'c-robot',desc:'A friendly futuristic helper'},
{id:'ninja',name:'Ninja',title:'Focus Ninja',price:260,emoji:'🥷',className:'c-ninja',desc:'Quick thinking and sharp focus'},
{id:'wizard',name:'Wizard',title:'Magic of Knowledge',price:320,emoji:'🧙',className:'c-wizard',desc:'Turns tough questions into quests'},
{id:'detective',name:'Detective',title:'Mystery Solver',price:280,emoji:'🕵️',className:'c-detective',desc:'Find clues in every question'},
{id:'artist',name:'Artist',title:'Creative Spark',price:240,emoji:'👩‍🎨',className:'c-artist',desc:'Imagination meets learning'},
{id:'doctor',name:'Doctor',title:'Health Hero',price:380,emoji:'🧑‍⚕️',className:'c-doctor',desc:'Curious about the human body'},
{id:'pilot',name:'Pilot',title:'Sky Captain',price:420,emoji:'🧑‍✈️',className:'c-pilot',desc:'Fly toward your next achievement'},
{id:'chef',name:'Chef',title:'Recipe Scientist',price:200,emoji:'🧑‍🍳',className:'c-chef',desc:'Mix ideas and discover answers'},
{id:'athlete',name:'Athlete',title:'Energy Champion',price:300,emoji:'🏃',className:'c-athlete',desc:'Keep moving toward your goals'},
{id:'musicstar',name:'Music Star',title:'Rhythm Master',price:340,emoji:'🎤',className:'c-musicstar',desc:'Keep your learning rhythm'},
{id:'dragon',name:'Dragon Guardian',title:'Fantasy Protector',price:650,emoji:'🐉',className:'c-dragon',desc:'Guard your streak and XP'},
{id:'fox',name:'Clever Fox',title:'Quick Thinker',price:390,emoji:'🦊',className:'c-fox',desc:'Smart strategies for every level'},
{id:'panda',name:'Panda Pal',title:'Calm Learner',price:250,emoji:'🐼',className:'c-panda',desc:'Stay calm and solve step by step'},
{id:'cat',name:'Cosmic Cat',title:'Star Pouncer',price:360,emoji:'🐱',className:'c-cat',desc:'Leap into a new learning world'},
{id:'penguin',name:'Penguin Explorer',title:'Cool Discoverer',price:330,emoji:'🐧',className:'c-penguin',desc:'Cool head, clever answers'},
{id:'alien',name:'Alien Scholar',title:'Galaxy Genius',price:700,emoji:'👽',className:'c-alien',desc:'Knowledge from another world'},
{id:'knight',name:'Quest Knight',title:'Brave Learner',price:550,emoji:'🛡️',className:'c-knight',desc:'Face each mission with courage'},
{id:'phoenix',name:'Phoenix',title:'Rise Again',price:850,emoji:'🔥',className:'c-phoenix',desc:'Learn from mistakes and try again'},
{id:'rainbow',name:'Rainbow Hero',title:'Color Burst',price:500,emoji:'🌈',className:'c-rainbow',desc:'Bring color to every quest'},
{id:'dino',name:'Dino Buddy',title:'Prehistoric Brain',price:410,emoji:'🦖',className:'c-dino',desc:'A mighty friend for big questions'},
{id:'bee',name:'Bee Genius',title:'Busy Learner',price:290,emoji:'🐝',className:'c-bee',desc:'Small steps make big progress'}
];
function owned(){try{return JSON.parse(localStorage.getItem(OWN)||'["scholar"]')}catch(e){return['scholar']}}
function selected(){return localStorage.getItem(KEY)||'scholar'}
function get(id){return chars.find(c=>c.id===id)||chars[0]}
function saveOwned(a){localStorage.setItem(OWN,JSON.stringify([...new Set(a)]))}
function setCharacter(id){const c=get(id);localStorage.setItem(KEY,id);document.querySelectorAll('.sq-avatar-target').forEach(e=>{e.textContent=c.emoji;e.className='sq-avatar-target '+c.className});const hero=document.getElementById('sqHomeCharacter');if(hero){hero.querySelector('.sq-hero-avatar').textContent=c.emoji;hero.classList.remove(...chars.map(x=>x.className));hero.classList.add(c.className)}const q=document.getElementById('quizAvatar');if(q)q.textContent=c.emoji;document.querySelectorAll('.victory-character').forEach(e=>e.textContent=c.emoji);return c}
function openCharacterShop(){let m=document.getElementById('characterShopModal');if(!m){m=document.createElement('div');m.id='characterShopModal';m.className='character-shop-modal';m.innerHTML='<div class="character-shop-backdrop" onclick="closeCharacterShop()"></div><div class="character-shop-card"><div class="character-shop-head"><div><div class="eyebrow">🪙 CHARACTER VAULT</div><h2>Choose Your <span>Genius</span></h2><p>Buy, unlock and select your StudyQuest character.</p></div><button class="character-close" onclick="closeCharacterShop()">×</button></div><div class="character-coins">🪙 <b id="shopCoins">0</b> coins available</div><div id="characterGrid" class="character-grid"></div></div>';document.body.appendChild(m)}m.classList.add('open');renderShop()}
function closeCharacterShop(){const m=document.getElementById('characterShopModal');if(m)m.classList.remove('open')}
function renderShop(){const box=document.getElementById('characterGrid');if(!box)return;const own=owned(),coins=+(localStorage.getItem('sqCoins')||0),sel=selected();document.getElementById('shopCoins').textContent=coins;box.innerHTML=chars.map(c=>{const has=own.includes(c.id),is=sel===c.id;return '<article class="character-card '+c.className+(is?' selected':'')+'"><div class="character-art"><div class="art-glow"></div><span>'+c.emoji+'</span></div><div class="character-info"><h3>'+c.name+'</h3><b>'+c.title+'</b><p>'+c.desc+'</p><div class="character-price">'+(c.price===0?'FREE':'🪙 '+c.price+' coins')+'</div></div><button class="'+(is?'character-use selected-btn':has?'character-use':'character-buy')+'" onclick="characterAction(\''+c.id+'\')">'+(is?'✓ SELECTED':has?'SELECT':'BUY')</button></article>'}).join('')}
function characterAction(id){const c=get(id),own=owned();if(own.includes(id)){setCharacter(id);renderShop();return}const coins=+(localStorage.getItem('sqCoins')||0);if(coins<c.price){const b=document.querySelector('.character-shop-card');if(b){b.classList.remove('shop-shake');void b.offsetWidth;b.classList.add('shop-shake')}alert('Not enough coins yet! Complete more missions to earn coins.');return}localStorage.setItem('sqCoins',coins-c.price);own.push(id);saveOwned(own);if(typeof save==='function')save();setCharacter(id);renderShop()}
window.openCharacterShop=openCharacterShop;
window.addEventListener('DOMContentLoaded',()=>{const btn=document.querySelector('.character-shop-open');if(btn){btn.addEventListener('click',openCharacterShop);}});window.closeCharacterShop=closeCharacterShop;window.characterAction=characterAction;window.studyQuestCharacters=chars;window.studyQuestSetCharacter=setCharacter;
document.addEventListener('DOMContentLoaded',()=>{setCharacter(selected());});
})();