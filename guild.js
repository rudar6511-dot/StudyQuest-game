(()=>{'use strict';
const $=id=>document.getElementById(id),KEY='sqGuildDemoV1';
const subjects=['Maths','Science','English','Reasoning'];
const questionBank={
Maths:[
['What is 15% of 200?',['20','25','30','35'],2],
['Solve: 3x + 5 = 20.',['3','5','7','10'],1],
['What is the square of 17?',['279','289','299','2890'],1],
['A triangle has angles 45° and 65°. Find the third angle.',['60°','70°','80°','90°'],1],
['What is the HCF of 24 and 36?',['6','8','12','18'],2],
['What is 7² − 5²?',['12','24','25','49'],1],
['If 5 notebooks cost ₹125, what do 8 cost?',['₹180','₹190','₹200','₹225'],2],
['Simplify: 3/4 + 1/8.',['4/12','5/8','7/8','1'],2],
['What is the perimeter of a square with side 9 cm?',['18 cm','27 cm','36 cm','81 cm'],2],
['Solve: 2(x − 4) = 12.',['6','8','10','14'],2],
['What is the next prime number after 29?',['30','31','33','37'],1],
['A car travels 150 km in 3 hours. Average speed?',['30 km/h','45 km/h','50 km/h','60 km/h'],2],
['What is √196?',['12','13','14','16'],2],
['Convert 0.375 to a fraction.',['3/4','3/8','5/8','7/8'],1],
['If x=4, evaluate x³ − 2x.',['48','54','56','64'],2],
['What is the sum of the first 10 natural numbers?',['45','50','55','60'],2],
['A ₹800 item is discounted by 10%. Sale price?',['₹700','₹720','₹740','₹780'],1],
['What is the area of a triangle with base 12 cm and height 5 cm?',['17 cm²','30 cm²','60 cm²','34 cm²'],1],
['Find the LCM of 6 and 15.',['15','20','30','45'],2],
['If 3 pens cost ₹27, what is the cost of 7 pens?',['₹54','₹63','₹72','₹81'],1],
['Solve: 4x = 3x + 11.',['7','9','11','14'],2],
['What is 2.5 × 0.4?',['0.1','1','10','0.01'],1],
['The angles of a quadrilateral total?',['180°','270°','360°','540°'],2],
['What is 25% of 84?',['18','20','21','24'],2],
['A number divided by 6 gives 9. What is the number?',['45','54','56','63'],1],
['Find 9 × 12.',['98','108','118','128'],1],
['What is the cube of 4?',['12','16','48','64'],3],
['Simplify the ratio 18:24.',['2:3','3:4','4:5','6:8'],1],
['What is 1/3 of  ninety?',['20','25','30','35'],2],
['If a=5 and b=2, find 2a+3b.',['12','14','16','18'],2]
],
Science:[
['Which gas do plants absorb during photosynthesis?',['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'],2],
['What is the SI unit of force?',['Joule','Newton','Watt','Pascal'],1],
['Which organ pumps blood around the human body?',['Lungs','Brain','Heart','Kidney'],2],
['Water boils at sea level at approximately:',['0°C','50°C','100°C','150°C'],2],
['Which part of a plant absorbs most water?',['Flower','Root hairs','Stem','Fruit'],1],
['Which planet is known as the Red Planet?',['Venus','Mars','Jupiter','Mercury'],1],
['What is the chemical symbol for sodium?',['So','S','Na','N'],2],
['Which material is a good electrical conductor?',['Rubber','Copper','Wood','Glass'],1],
['What is the basic unit of life?',['Tissue','Organ','Cell','Atom'],2],
['Which vitamin is produced in skin in sunlight?',['Vitamin A','Vitamin B12','Vitamin C','Vitamin D'],3],
['Which force pulls objects toward Earth?',['Friction','Gravity','Magnetism','Tension'],1],
['Which blood cells help fight infection?',['Red cells','White cells','Platelets','Plasma only'],1],
['What is the pH of a neutral solution at room temperature?',['0','5','7','14'],2],
['Which change is usually reversible?',['Burning paper','Rusting iron','Melting ice','Cooking an egg'],2],
['Which gas is most abundant in Earth’s atmosphere?',['Oxygen','Carbon dioxide','Nitrogen','Argon'],2],
['Which instrument measures temperature?',['Barometer','Thermometer','Ammeter','Compass'],1],
['Which part of the eye controls the amount of light entering?',['Retina','Iris','Cornea','Optic nerve'],1],
['Sound travels fastest through:',['Vacuum','Air','Water','Solids'],3],
['Which is a renewable energy source?',['Coal','Petrol','Solar energy','Natural gas'],2],
['Which metal is liquid near room temperature?',['Iron','Mercury','Aluminium','Copper'],1],
['What is the main function of roots?',['Make seeds','Absorb water and minerals','Pollinate flowers','Make fruit'],1],
['Which particle has a negative electric charge?',['Proton','Neutron','Electron','Nucleus'],2],
['Which disease is caused by a virus?',['Influenza','Scurvy','Rickets','Anaemia'],0],
['Which simple machine is a ramp?',['Pulley','Lever','Inclined plane','Wheel and axle'],2],
['What is the freezing point of pure water?',['0°C','10°C','32°C','100°C'],0],
['Which gas is needed for ordinary combustion?',['Helium','Oxygen','Neon','Nitrogen'],1],
['Which organ helps humans breathe?',['Liver','Lungs','Stomach','Pancreas'],1],
['Which is the closest star to Earth?',['Sirius','Sun','Polaris','Alpha Centauri'],1],
['What carries hereditary information?',['DNA','Starch','Water','Chlorophyll'],0],
['Which process changes water vapour into liquid?',['Evaporation','Condensation','Sublimation','Melting'],1]
],
English:[
['Choose the synonym of “rapid”.',['Slow','Quick','Quiet','Weak'],1],
['Choose the antonym of “ancient”.',['Old','Historic','Modern','Early'],2],
['Which sentence is grammatically correct?',['She go to school.','She goes to school.','She going school.','She gone school.'],1],
['What is the plural of “child”?',['Childs','Childes','Children','Childrens'],2],
['Identify the noun: “The bird sings sweetly.”',['The','Bird','Sings','Sweetly'],1],
['Choose the correct article: “___ honest person”.',['A','An','Thee','No article'],1],
['Past tense of “teach” is:',['Teached','Taught','Teaching','Teaches'],1],
['Choose the correctly spelled word.',['Enviroment','Environment','Envirnoment','Environmant'],1],
['In “They are playing”, the verb phrase is:',['They','Are playing','Playing only','Are'],1],
['Choose the correct pronoun: “Riya and ___ went home.”',['me','I','mine','my'],1],
['What is the antonym of “generous”?',['Kind','Giving','Selfish','Helpful'],2],
['Which punctuation ends a direct question?',[',','.','?',';'],2],
['Choose the adjective: “A bright star shone.”',['A','Bright','Star','Shone'],1],
['Complete: “If I ___ time, I will help.”',['have','had yesterday','has','having'],0],
['What is the comparative form of “good”?',['Gooder','Best','Better','More good'],2],
['Choose the synonym of “silent”.',['Noisy','Quiet','Angry','Busy'],1],
['Which word is a conjunction?',['Because','Beautiful','Quickly','Garden'],0],
['Choose the correct spelling.',['Necessary','Neccessary','Necesary','Necessery'],0],
['Identify the adverb: “He spoke softly.”',['He','Spoke','Softly','None'],2],
['What is the plural of “mouse”?',['Mouses','Mice','Mousees','Meese'],1],
['Complete: “Neither of the answers ___ correct.”',['are','were','is','be'],2],
['What is the opposite of “expand”?',['Increase','Stretch','Contract','Enlarge'],2],
['Choose the correct sentence.',['Their going home.','They’re going home.','There going home.','They going home.'],1],
['What is a person who writes poems called?',['Painter','Poet','Pilot','Editor'],1],
['Choose the correct preposition: “The book is ___ the table.”',['on','at to','into of','by from'],0],
['Past participle of “write” is:',['Wrote','Written','Writing','Writes'],1],
['Which is a proper noun?',['city','river','Delhi','country'],2],
['Choose the antonym of “scarce”.',['Rare','Limited','Abundant','Few'],2],
['What does “reluctant” mean?',['Unwilling','Excited','Certain','Careless'],0],
['Choose the correct tag: “You are ready, ___?”',['are you','aren’t you','don’t you','isn’t it'],1]
],
Reasoning:[
['Complete the sequence: 2, 4, 8, 16, __.',['18','24','30','32'],3],
['Find the odd one out.',['Triangle','Square','Circle','Carrot'],3],
['If CAT is coded as DBU, DOG is coded as:',['EPH','CNG','EOG','FQI'],0],
['Which number is smallest?',['0.7','0.07','0.77','0.707'],1],
['A is taller than B; B is taller than C. Who is shortest?',['A','B','C','Cannot tell'],2],
['Complete: 1, 4, 9, 16, __.',['20','24','25','36'],2],
['If today is Tuesday, what day is 10 days later?',['Thursday','Friday','Saturday','Sunday'],1],
['Which does not belong?',['January','March','Monday','June'],2],
['Book is to read as fork is to:',['Write','Eat','Sleep','Draw'],1],
['Find the missing letter: A, C, E, G, __.',['H','I','J','K'],1],
['If 5 machines make 5 toys in 5 minutes, how long do 10 machines take to make 10 toys?',['2.5 min','5 min','10 min','20 min'],1],
['Arrange from smallest to largest: 0.5, 0.05, 0.55, 0.505. Which is smallest?',['0.5','0.05','0.55','0.505'],1],
['A clock shows 3:00. The angle between hands is:',['45°','60°','90°','180°'],2],
['Complete: Z, X, V, T, __.',['S','R','Q','P'],1],
['If all Bloops are Razzies and all Razzies are Lazzies, all Bloops are:',['Lazzies','Not Lazzies','Only Razzies','Unknown'],0],
['Which number is the odd one out?',['8','27','64','100'],3],
['You face north, turn right, then right again. Which way face?',['North','South','East','West'],1],
['Complete: 3, 6, 11, 18, 27, __.',['36','38','40','42'],1],
['Which word can be made from “LISTEN”?',['SILENT','TINSELX','LITTLE','LENTILX'],0],
['If yesterday was Sunday, what is tomorrow?',['Monday','Tuesday','Wednesday','Saturday'],1],
['Find the odd pair.',['2–4','3–9','4–16','5–20'],3],
['Complete: 100, 90, 81, 73, __.',['66','65','64','63'],0],
['A is the brother of B; B is the sister of C. A is C’s:',['Brother','Sister','Father','Mother'],0],
['Which is different?',['Eagle','Sparrow','Bat','Pigeon'],2],
['If 12 is coded as 144, then 9 is coded as:',['18','72','81','99'],2],
['Complete: 5, 10, 20, 40, __.',['45','60','80','100'],2],
['Which comes next: Monday, Wednesday, Friday, __?',['Saturday','Sunday','Tuesday','Thursday'],1],
['If EAST is written as FBTU, WEST is written as:',['XFTU','VDTS','XEST','WFTU'],0],
['How many sides do three triangles have altogether?',['6','9','12','15'],1],
['Complete: 7, 14, 28, 56, __.',['84','98','112','120'],2]
]};
function makeQuestions(seed){
 const out=[];
 subjects.forEach(subject=>{
  const pool=questionBank[subject].map((item,index)=>({subject,q:item[0],opts:item[1].slice(),answer:item[2],_key:subject+'-'+index}));
  let hash=0;for(const ch of seed)hash=(hash*31+ch.charCodeAt(0))>>>0;
  // Seeded shuffle makes every guild get its own stable question order and mix.
  for(let i=pool.length-1;i>0;i--){hash=(Math.imul(hash,1664525)+1013904223)>>>0;const j=hash%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
  out.push(...pool.slice(0,5));
 });
 return out;
}

const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{guilds:[],applications:[]}}catch{return{guilds:[],applications:[]}}};
const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(msg,kind=''){ $('notice').className='notice '+kind;$('notice').textContent=msg }
function render(){const d=read(),term=$('searchGuild').value.trim().toLowerCase();const guilds=d.guilds.filter(g=>g.name.toLowerCase().includes(term));$('guildList').innerHTML=guilds.length?guilds.map(g=>{const apps=d.applications.filter(a=>a.guildId===g.id&&a.status==='accepted');const avg=apps.length?Math.round(apps.reduce((s,a)=>s+a.score,0)/apps.length):0;const accuracy=apps.length?Math.round(apps.reduce((s,a)=>s+a.score,0)/(apps.length*20)*100):0;return '<article class="guild-card"><h3>'+esc(g.name)+'</h3><p>'+esc(g.description||'A StudyQuest learning guild')+'</p><div class="stats"><span class="pill">👥 '+(apps.length+1)+' members</span><span class="pill">⭐ Avg score '+avg+'/20</span><span class="pill">🎯 Avg accuracy '+accuracy+'%</span></div><p>Admin: '+esc(g.creator)+'</p><button data-apply="'+g.id+'">Take entrance test</button></article>'}).join(''):'<p>No guilds found yet. Create the first one!</p>';
$('adminGuild').innerHTML='<option value="">Choose your guild</option>'+d.guilds.map(g=>'<option value="'+g.id+'">'+esc(g.name)+'</option>').join('');
$('myApplications').innerHTML=d.applications.length?d.applications.slice().reverse().map(a=>'<p><b>'+esc((d.guilds.find(g=>g.id===a.guildId)||{}).name||'Deleted guild')+'</b> — '+esc(a.applicant)+' — score '+a.score+'/20 — <b>'+esc(a.status)+'</b>'+(a.status==='pending'?' <button data-review="'+a.id+'" data-decision="accepted">Accept</button> <button data-review="'+a.id+'" data-decision="rejected">Reject</button>':'')+'</p>').join(''):'No applications yet.';
$('guildList').querySelectorAll('[data-apply]').forEach(b=>b.onclick=()=>apply(b.dataset.apply));$('myApplications').querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>review(b.dataset.review,b.dataset.decision));
}
function renderEditor(){const id=$('adminGuild').value,g=read().guilds.find(x=>x.id===id);$('questionEditor').innerHTML='';if(!g)return;for(let i=0;i<20;i++){const subject=subjects[Math.floor(i/5)];const box=document.createElement('div');box.className='question-row';const saved=(g.questions||[])[i]||{};box.innerHTML='<strong>Q'+(i+1)+' · '+subject+'</strong><input data-q="'+i+'" placeholder="Write question '+(i+1)+'" maxlength="240" value="'+esc(saved.q||'')+'"><div class="options">'+[0,1,2,3].map((n)=>'<input data-opt="'+i+'-'+n+'" placeholder="Option '+String.fromCharCode(65+n)+'" maxlength="120" value="'+esc((saved.opts||[])[n]||'')+'">').join('')+'</div><label>Correct option<select data-answer="'+i+'">'+[0,1,2,3].map(n=>'<option value="'+n+'" '+(Number(saved.answer||0)===n?'selected':'')+'>'+String.fromCharCode(65+n)+'</option>').join('')+'</select></label>'; $('questionEditor').appendChild(box)}}
function create(){const name=$('newGuildName').value.trim(),creator=$('creatorName').value.trim(),creatorEmail=$('creatorEmail').value.trim(),pin=$('adminPin').value;if(!name||!creator||!creatorEmail||!$('creatorEmail').checkValidity()||pin.length<4){notice('Enter a guild name, your display name and an admin PIN of at least 4 characters.','error');return}const d=read();if(d.guilds.some(g=>g.name.toLowerCase()===name.toLowerCase())){notice('A guild with this name already exists in this browser.','error');return}d.guilds.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,description:$('newGuildDesc').value.trim(),creator,creatorEmail,pin,questions:makeQuestions(name+'|'+Date.now()+'|'+Math.random()),createdAt:new Date().toISOString()});save(d);$('newGuildName').value='';$('newGuildDesc').value='';$('creatorName').value='';$('creatorEmail').value='';$('adminPin').value='';notice('Guild created! Its unique 20-question entrance test is ready automatically: 5 Maths, 5 Science, 5 English and 5 Reasoning. Admin editing is optional.','success');render()}
function saveQuestions(){const id=$('adminGuild').value,d=read(),g=d.guilds.find(x=>x.id===id);if(!g){notice('Select a guild first.','error');return}if($('verifyPin').value!==g.pin){notice('Admin PIN does not match.','error');return}const qs=[];for(let i=0;i<20;i++){const q=$('questionEditor').querySelector('[data-q="'+i+'"]').value.trim(),opts=[0,1,2,3].map(n=>$('questionEditor').querySelector('[data-opt="'+i+'-'+n+'"]').value.trim()),answer=Number($('questionEditor').querySelector('[data-answer="'+i+'"]').value);if(!q||opts.some(o=>!o)){notice('Please fill the question and all four options for Q'+(i+1)+'.','error');return}qs.push({subject:subjects[Math.floor(i/5)],q,opts,answer})}g.questions=qs;save(d);$('verifyPin').value='';notice('Saved the edited 20-question entrance test: 5 each for Maths, Science, English and Reasoning.','success')}
function apply(id){const d=read(),g=d.guilds.find(x=>x.id===id);if(!g)return;if(!g.questions||g.questions.length!==20){g.questions=makeQuestions(g.name+'|'+g.id);save(d)}const applicant=prompt('Enter your player/display name:');if(!applicant||!applicant.trim())return;const applicantEmail=prompt('Enter your Gmail/email so the guild admin can identify your application:');if(!applicantEmail||!/^\S+@\S+\.\S+$/.test(applicantEmail.trim())){notice('Please enter a valid email address to submit the entrance test.','error');return}const existing=d.applications.find(a=>a.guildId===id&&a.applicant.toLowerCase()===applicant.trim().toLowerCase());if(existing&&existing.status==='accepted'){notice('You are already a member in this demo.');return}let score=0;const form=document.createElement('form');form.className='panel';form.innerHTML='<h2>Entrance test: '+esc(g.name)+'</h2><p>20 questions · 5 each from Maths, Science, English and Reasoning. Your answers will be submitted to the guild admin for review.</p>'+g.questions.map((q,i)=>'<div class="question-row"><strong>Q'+(i+1)+' · '+esc(q.subject)+': '+esc(q.q)+'</strong>'+q.opts.map((o,n)=>'<label><input type="radio" name="q'+i+'" value="'+n+'" required style="display:inline;width:auto;margin-right:8px">'+String.fromCharCode(65+n)+'. '+esc(o)+'</label>').join('')+'</div>').join('')+'<button class="primary" type="submit">Submit test to admin</button><button type="button" id="cancelTest">Cancel</button>';const old=$('testPanel');if(old)old.remove();form.id='testPanel';$('guildList').after(form);form.scrollIntoView({behavior:'smooth',block:'start'});$('cancelTest').onclick=()=>form.remove();form.onsubmit=e=>{e.preventDefault();const answers=g.questions.map((q,i)=>Number(new FormData(form).get('q'+i)));score=answers.reduce((s,a,i)=>s+(a===g.questions[i].answer?1:0),0);const app={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),guildId:id,applicant:applicant.trim(),applicantEmail:applicantEmail.trim(),score,answers,submittedAt:new Date().toISOString(),status:'pending'};const fresh=read();fresh.applications.push(app);save(fresh);form.remove();notice('Test saved in demo mode. Score: '+score+'/20. The admin Gmail is recorded, but automatic email delivery and Accept/Reject buttons inside Gmail require the server setup in guild-email-setup.md.','success');render()}}
function review(id,status){const d=read(),app=d.applications.find(a=>a.id===id);if(!app)return;const g=d.guilds.find(x=>x.id===app.guildId);if(!g)return;const pin=prompt('Enter the admin PIN for '+g.name+':');if(pin!==g.pin){notice('Admin PIN does not match.','error');return}if(status==='accepted'&&app.score<12){notice('This applicant scored below the demo pass mark (12/20). Reject or ask them to try again.','error');return}app.status=status;save(d);notice(status==='accepted'?'Application accepted.':'Application rejected.','success');render()}
$('createGuild').onclick=create;$('saveQuestions').onclick=saveQuestions;$('adminGuild').onchange=renderEditor;$('searchGuild').oninput=render;render();
})();