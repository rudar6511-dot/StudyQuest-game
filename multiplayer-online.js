/* StudyQuest Live Multiplayer - Supabase Realtime */
const SUPABASE_URL='https://cfoyqyplnmxsxyxyfdbb.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
let sqLive=null,sqChannel=null,sqRoom=null,sqQuestionIndex=0,sqLocalScore=0,sqMatchWasLive=false;
const SQ_LIVE_QUESTIONS=[
 {q:'What is 12 × 5?',o:['50','60','70','80'],a:1},
 {q:'Which gas do plants mainly use for photosynthesis?',o:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'],a:2},
 {q:'Choose the correct word: She ___ to school every day.',o:['go','goes','going','gone'],a:1},
 {q:'भारत की राजधानी क्या है?',o:['मुंबई','जयपुर','नई दिल्ली','लखनऊ'],a:2},
 {q:'Which is the largest continent?',o:['Europe','Asia','Africa','Australia'],a:1},
 {q:'What is 3/4 as a decimal?',o:['0.25','0.5','0.75','1.25'],a:2},
 {q:'Which part of a plant absorbs most water from soil?',o:['Flower','Roots','Fruit','Leaf'],a:1},
 {q:'A person who writes books is called a...',o:['Author','Pilot','Farmer','Painter'],a:0},
 {q:'लोकतंत्र में अंतिम शक्ति किसके पास होती है?',o:['जनता','सेना','न्यायालय','मीडिया'],a:0},
 {q:'Which planet is known as the Red Planet?',o:['Venus','Mars','Jupiter','Mercury'],a:1}
];
function sqProfile(){try{return JSON.parse(localStorage.getItem('sqStudentProfile')||'{}')}catch{return{}}}
function sqId(){let p=sqProfile();let id=p.id||localStorage.getItem('sqLivePlayerId');if(!id){id='guest_'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'_'+Math.random().toString(36).slice(2));localStorage.setItem('sqLivePlayerId',id)}return id}
function sqReady(){if(typeof supabase==='undefined'){alert('Supabase library did not load. Refresh the page.');return false}return true}
async function sqConnect(){if(!sqReady())return false;if(!sqLive)sqLive=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);return true}
function sqName(){return sqProfile().name||'Student'}
async function createLiveRoom(){if(!await sqConnect())return;const code=Math.random().toString(36).slice(2,8).toUpperCase();const {data,error}=await sqLive.from('sq_rooms').insert({code,host_id:sqId(),name:document.getElementById('newName')?.value.trim()||'StudyQuest Live Room',status:'lobby'}).select().single();if(error){alert('Could not create room: '+error.message);return}sqRoom=data;await joinLiveRoom(code)}
async function joinLiveRoom(code){if(!await sqConnect())return;code=String(code||'').trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(code))return alert('Enter a valid 6-character room code.');const {data:room,error}=await sqLive.from('sq_rooms').select('*').eq('code',code).single();if(error||!room){alert('Room not found. Check the room code.');return}sqRoom=room;const {error:e}=await sqLive.from('sq_room_players').upsert({room_id:room.id,player_id:sqId(),player_name:sqName(),ready:false,score:0},{onConflict:'room_id,player_id'});if(e){alert('Could not join room: '+e.message);return}document.getElementById('setup')?.setAttribute('hidden',true);document.getElementById('liveLobby')?.removeAttribute('hidden');sqSubscribe();sqRenderRoom();sqRenderPlayers()}
function sqSubscribe(){if(sqChannel)sqLive.removeChannel(sqChannel);sqChannel=sqLive.channel('sq-room-'+sqRoom.id).on('postgres_changes',{event:'*',schema:'public',table:'sq_room_players',filter:'room_id=eq.'+sqRoom.id},()=>{sqRenderPlayers()}).on('postgres_changes',{event:'*',schema:'public',table:'sq_rooms',filter:'id=eq.'+sqRoom.id},p=>{const oldStatus=sqRoom?.status;sqRoom=p.new;sqRenderRoom(oldStatus)}).subscribe()}
async function sqRenderPlayers(){if(!sqRoom||!sqLive)return;const {data,error}=await sqLive.from('sq_room_players').select('*').eq('room_id',sqRoom.id).order('score',{ascending:false}).order('joined_at');if(error)return;const box=document.getElementById('livePlayerList');if(box)box.innerHTML=(data||[]).map((p,i)=>`<div class="mp-player">${i?'🎮':'👑'} ${escapeHtml(p.player_name)} <b>${Number(p.score||0)} pts</b> ${p.ready?'✓ Ready':''}</div>`).join('')}
function sqRenderRoom(previousStatus=''){const c=document.getElementById('liveRoomCode');if(c)c.textContent=sqRoom?.code||'—';const playing=sqRoom?.status==='playing';const s=document.getElementById('liveRoomStatus');if(s)s.textContent=playing?'MATCH LIVE':'WAITING FOR PLAYERS';const start=document.getElementById('startMatchBtn');if(start)start.disabled=playing||sqRoom?.host_id!==sqId();const match=document.getElementById('liveMatch');if(match){if(playing){match.removeAttribute('hidden');if(!sqMatchWasLive||previousStatus!=='playing'){sqQuestionIndex=0;sqLocalScore=0;sqRenderQuestion()}}else{match.setAttribute('hidden',true)}}sqMatchWasLive=playing}
function sqRenderQuestion(){const q=SQ_LIVE_QUESTIONS[sqQuestionIndex];const qn=document.getElementById('liveQuestionNumber');const qt=document.getElementById('liveQuestion');const opts=document.getElementById('liveOptions');const score=document.getElementById('liveMyScore');if(!q){if(qn)qn.textContent='MATCH COMPLETE';if(qt)qt.textContent='🎉 Great job! You completed the live quiz.';if(opts)opts.innerHTML='<button class="live-btn" onclick="StudyQuestLive.leave()">Return to Lobby</button>';return}if(qn)qn.textContent=`Question ${sqQuestionIndex+1} / ${SQ_LIVE_QUESTIONS.length}`;if(qt)qt.textContent=q.q;if(score)score.textContent=`Your score: ${sqLocalScore}`;if(opts)opts.innerHTML=q.o.map((x,i)=>`<button class="live-answer" onclick="StudyQuestLive.answer(${i})">${escapeHtml(x)}</button>`).join('')}
async function answerLiveQuestion(choice){const q=SQ_LIVE_QUESTIONS[sqQuestionIndex];if(!q)return;const buttons=[...document.querySelectorAll('.live-answer')];buttons.forEach(b=>b.disabled=true);if(choice===q.a){sqLocalScore+=10;await sqLive.from('sq_room_players').update({score:sqLocalScore}).eq('room_id',sqRoom.id).eq('player_id',sqId())}setTimeout(()=>{sqQuestionIndex++;sqRenderQuestion();sqRenderPlayers()},450)}
async function toggleLiveReady(){if(!sqRoom||!sqLive)return;const {data}=await sqLive.from('sq_room_players').select('ready').eq('room_id',sqRoom.id).eq('player_id',sqId()).single();const {error}=await sqLive.from('sq_room_players').update({ready:!data?.ready}).eq('room_id',sqRoom.id).eq('player_id',sqId());if(error)alert(error.message);sqRenderPlayers()}
async function startLiveMatch(){if(!sqRoom||sqRoom.host_id!==sqId())return alert('Only the room host can start the match.');const {error}=await sqLive.from('sq_rooms').update({status:'playing',started_at:new Date().toISOString()}).eq('id',sqRoom.id);if(error)alert('Could not start match: '+error.message)}
async function leaveLiveRoom(){if(sqRoom&&sqLive)await sqLive.from('sq_room_players').delete().eq('room_id',sqRoom.id).eq('player_id',sqId());if(sqChannel)sqLive.removeChannel(sqChannel);sqRoom=null;sqChannel=null;sqMatchWasLive=false;document.getElementById('liveMatch')?.setAttribute('hidden',true);document.getElementById('liveLobby')?.setAttribute('hidden',true);document.getElementById('setup')?.removeAttribute('hidden')}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
window.StudyQuestLive={create:createLiveRoom,join:joinLiveRoom,ready:toggleLiveReady,start:startLiveMatch,leave:leaveLiveRoom,answer:answerLiveQuestion};


/* Global Free-Fire-style player roster */
let sqPresenceTimer=null,sqPresenceChannel=null;
const SQ_ONLINE_WINDOW=45000;

async function sqTouchPresence(){
  if(!sqLive||!sqReady())return;
  const id=sqId(), name=sqName();
  await sqLive.from('sq_presence').upsert(
    {player_id:id,player_name:name,last_seen:new Date().toISOString()},
    {onConflict:'player_id'}
  );
}

function sqPresenceStatus(lastSeen){
  return Date.now()-new Date(lastSeen).getTime() < SQ_ONLINE_WINDOW;
}

function sqRenderGlobalPlayers(rows){
  const onlineBox=document.getElementById('globalOnlinePlayers');
  const offlineBox=document.getElementById('globalOfflinePlayers');
  const onlineCount=document.getElementById('globalOnlineCount');
  const offlineCount=document.getElementById('globalOfflineCount');
  if(!onlineBox||!offlineBox)return;
  const now=Date.now();
  const sorted=(rows||[]).slice().sort((a,b)=>{
    const ao=sqPresenceStatus(a.last_seen), bo=sqPresenceStatus(b.last_seen);
    if(ao!==bo)return bo-ao;
    return String(a.player_name||'Student').localeCompare(String(b.player_name||'Student'));
  });
  const online=sorted.filter(p=>sqPresenceStatus(p.last_seen));
  const offline=sorted.filter(p=>!sqPresenceStatus(p.last_seen));
  if(onlineCount)onlineCount.textContent=online.length;
  if(offlineCount)offlineCount.textContent=offline.length;
  const me=sqId();
  const card=(p,isOnline)=>`<div class="global-player ${isOnline?'is-online':'is-offline'} ${p.player_id===me?'is-me':''}">
    <span class="player-dot"></span>
    <span class="global-player-name">${escapeHtml(p.player_name||'Student')}${p.player_id===me?' <small>(You)</small>':''}</span>
    <span class="global-player-id">${escapeHtml(p.player_id||'')}</span>
  </div>`;
  onlineBox.innerHTML=online.length?online.map(p=>card(p,true)).join(''):'<div class="empty-roster">No players online</div>';
  offlineBox.innerHTML=offline.length?offline.map(p=>card(p,false)).join(''):'<div class="empty-roster">No offline players</div>';
}

async function sqRenderGlobalPlayers(){
  if(!sqLive||!sqReady())return;
  const {data,error}=await sqLive.from('sq_presence').select('player_id,player_name,last_seen').order('last_seen',{ascending:false});
  if(!error)sqRenderGlobalPlayers(data||[]);
}

async function startGlobalPresence(){
  if(!await sqConnect())return;
  await sqTouchPresence();
  await sqRenderGlobalPlayers();
  if(sqPresenceTimer)clearInterval(sqPresenceTimer);
  sqPresenceTimer=setInterval(async()=>{
    await sqTouchPresence();
    await sqRenderGlobalPlayers();
  },20000);
  if(sqPresenceChannel)sqLive.removeChannel(sqPresenceChannel);
  sqPresenceChannel=sqLive.channel('sq-global-player-roster')
    .on('postgres_changes',{event:'*',schema:'public',table:'sq_presence'},()=>sqRenderGlobalPlayers())
    .subscribe();
}

window.addEventListener('DOMContentLoaded',()=>startGlobalPresence());
window.addEventListener('beforeunload',()=>{if(sqPresenceTimer)clearInterval(sqPresenceTimer)});
