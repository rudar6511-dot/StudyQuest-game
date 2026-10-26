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

const subjectsSafe=['Maths','Science','English','Reasoning'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let sb=null,currentUser=null,cloudGuilds=[],testGuild=null;
function notice(msg,kind=''){const n=$('notice');n.className='notice '+kind;n.textContent=msg}
function cfg(){return window.SQ_GUILD_SUPABASE_URL&&window.SQ_GUILD_SUPABASE_ANON_KEY&&!window.SQ_GUILD_SUPABASE_ANON_KEY.includes('PASTE_')}
function init(){
 if(!cfg()){notice('Setup needed: add your Supabase publishable/anon key in guild-config.js.','error');return}
 sb=window.supabase.createClient(window.SQ_GUILD_SUPABASE_URL,window.SQ_GUILD_SUPABASE_ANON_KEY);
 sb.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;renderAuth();if(currentUser)loadGuilds();});
 sb.auth.getSession().then(({data})=>{currentUser=data.session?.user||null;renderAuth();if(currentUser)loadGuilds();else notice('Sign in with your Gmail to create guilds or take an entrance test.')});
}
function renderAuth(){
 const box=$('guildAuthStatus'); if(!box)return;
 box.innerHTML=currentUser?'<b>Signed in:</b> '+esc(currentUser.email)+' <button id="guildSignOut">Sign out</button>':'<label>Gmail for StudyQuest Guilds<input id="guildLoginEmail" type="email" autocomplete="email" placeholder="you@gmail.com"></label><button class="primary" id="guildSendLink">Send sign-in link</button><small>We send a secure sign-in link; no password needed.</small>';
 if(currentUser){$('guildSignOut').onclick=async()=>{await sb.auth.signOut();notice('Signed out.')}}else{
 $('guildSendLink').onclick=async()=>{const email=$('guildLoginEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notice('Enter a valid email address.','error');return}
 const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});notice(error?error.message:'Sign-in link sent. Open your email on this device to finish signing in.',error?'error':'success')}
 }
}
async function api(action,payload={}){
 if(!sb||!currentUser)throw new Error('Please sign in with the Gmail link first.');
 const {data:{session}}=await sb.auth.getSession();if(!session?.access_token)throw new Error('Your session expired. Sign in again.');
 const {data,error}=await sb.functions.invoke('guild-email',{body:{action,...payload}});
 if(error)throw new Error(error.message||'Guild server request failed.');
 if(data?.error)throw new Error(data.error);
 return data;
}
function questionRows(seed){return makeQuestions(seed).map((q,i)=>({subject:q.subject,question:q.q,options:q.opts,correctOption:q.answer,question_no:i+1}))}
async function loadGuilds(){
 try{const data=await api('listGuilds');cloudGuilds=data.guilds||[];renderGuilds();await loadApplications()}
 catch(e){notice(e.message,'error')}
}
function renderGuilds(){
 const term=$('searchGuild').value.trim().toLowerCase(),items=cloudGuilds.filter(g=>g.name.toLowerCase().includes(term));
 $('guildList').innerHTML=items.length?items.map(g=>'<article class="guild-card"><h3>'+esc(g.name)+'</h3><p>'+esc(g.description||'A StudyQuest learning guild')+'</p><p>Admin: '+esc(g.admin_email||'Guild admin')+'</p><button data-apply="'+esc(g.id)+'">Take entrance test</button></article>').join(''):'<p>No guilds found. Create the first one!</p>';
 $('adminGuild').innerHTML='<option value="">Choose your guild</option>'+cloudGuilds.filter(g=>g.admin_id===currentUser?.id).map(g=>'<option value="'+esc(g.id)+'">'+esc(g.name)+'</option>').join('');
 $('guildList').querySelectorAll('[data-apply]').forEach(b=>b.onclick=()=>startTest(b.dataset.apply));
}
async function loadApplications(){
 try{const d=await api('myApplications');const apps=d.applications||[];$('myApplications').innerHTML=apps.length?apps.map(a=>'<p><b>'+esc(a.sq_guilds?.name||'Guild')+'</b> — '+esc(a.applicant_name||a.applicant_email||'Applicant')+' — '+a.score+'/20 — <b>'+esc(a.status)+'</b></p>').join(''):'No applications yet.'}catch(e){$('myApplications').textContent=e.message}
}
async function create(){
 try{
 if(!currentUser)throw new Error('Sign in with Gmail first.');
 const name=$('newGuildName').value.trim(),description=$('newGuildDesc').value.trim(),creator=$('creatorName').value.trim(),email=(currentUser.email||'').trim().toLowerCase();
 if(name.length<3||!creator)throw new Error('Enter a guild name (at least 3 characters) and your display name.');
 if($('creatorEmail').value.trim()&&$('creatorEmail').value.trim().toLowerCase()!==email)throw new Error('Guild admin Gmail must match the signed-in Gmail.');
 const questions=questionRows(name+'|'+Date.now());
 const data=await api('createGuild',{name,description,adminEmail:email,questions});
 $('newGuildName').value='';$('newGuildDesc').value='';$('creatorName').value='';$('creatorEmail').value=email;
 notice('Guild created! Its 20-question test is saved securely.','success');await loadGuilds();
 }catch(e){notice(e.message,'error')}
}
async function startTest(id){
 if(!currentUser){notice('Sign in with Gmail before applying.','error');return}
 try{
 const data=await api('getEntranceTest',{guildId:id});testGuild=cloudGuilds.find(g=>g.id===id);
 const qs=data.questions||[];if(qs.length!==20)throw new Error('This guild test is not ready.');
 const form=document.createElement('form');form.className='panel';form.id='testPanel';
 form.innerHTML='<h2>Entrance test: '+esc(testGuild?.name||'Guild')+'</h2><p>20 questions. Your score will be emailed to the guild admin for review.</p><label>Your display name<input id="applicantName" maxlength="60" required></label><label>Your Gmail<input id="applicantEmail" type="email" required value="'+esc(currentUser.email||'')+'"></label>'+qs.map((q,i)=>'<div class="question-row"><strong>Q'+(i+1)+' · '+esc(q.subject)+': '+esc(q.question)+'</strong>'+q.options.map((o,n)=>'<label><input type="radio" name="q'+i+'" value="'+n+'" required style="display:inline;width:auto;margin-right:8px"> '+String.fromCharCode(65+n)+'. '+esc(o)+'</label>').join('')+'</div>').join('')+'<button class="primary" type="submit">Submit entrance test</button><button type="button" id="cancelTest">Cancel</button>';
 $('testPanel')?.remove();$('guildList').after(form);form.scrollIntoView({behavior:'smooth',block:'start'});$('cancelTest').onclick=()=>form.remove();
 form.onsubmit=async e=>{e.preventDefault();const answers=qs.map((q,i)=>Number(new FormData(form).get('q'+i)));const applicantName=$('applicantName').value.trim(),applicantEmail=$('applicantEmail').value.trim().toLowerCase();
 try{const result=await api('apply',{guildId:id,applicantName,applicantEmail,answers});form.remove();notice(result.message+' Score: '+result.application.score+'/20.','success');await loadApplications()}catch(err){notice(err.message,'error')}
 };
 }catch(e){notice(e.message,'error')}
}
function renderEditor(){const id=$('adminGuild').value,g=cloudGuilds.find(x=>x.id===id);$('questionEditor').innerHTML=g?'<p>This guild uses its automatically generated 20-question test (5 each from Maths, Science, English and Reasoning). Questions are stored securely on the server.</p>':'<p>Select a guild you administer.</p>'}
async function saveQuestions(){notice('Custom question editing is not enabled in this connected version. Guilds receive a generated 20-question entrance test.','error')}
$('createGuild').onclick=create;$('saveQuestions').onclick=saveQuestions;$('adminGuild').onchange=renderEditor;$('searchGuild').oninput=renderGuilds;
init();
})();