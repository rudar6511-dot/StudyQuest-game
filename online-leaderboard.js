/* StudyQuest Online Leaderboard
   Uses the Supabase publishable browser key only.
   Displays public game stats only: name, XP, missions and rank.
*/
(function(){
  const SUPABASE_URL='https://cfoyqyplnmxsxyxyfdbb.supabase.co';
  const SUPABASE_KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  const SUBJECTS=['math','science','english','hindi','ss'];
  let client=null;

  const $=id=>document.getElementById(id);
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  function profile(){try{return JSON.parse(localStorage.getItem('sqStudentProfile')||'{}')}catch(e){return {}}}
  function missions(progress){return SUBJECTS.reduce((sum,s)=>sum+Math.max(0,Math.min(20,num(progress&&progress[s])-1)),0)}
  function rank(done){return done>=50?'LEGEND':done>=30?'MASTER':done>=20?'CHAMPION':done>=10?'EXPLORER':done>=5?'RANGER':'ROOKIE'}
  function esc(v){return String(v??'Student').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function localStats(){
    const progress={}; SUBJECTS.forEach(s=>progress[s]=num(localStorage.getItem('sqProgress_'+s)||1));
    return {player_id:String(profile().id||''),player_name:String(profile().name||'You'),xp:num(localStorage.getItem('sqXp')||0),coins:num(localStorage.getItem('sqCoins')||0),progress};
  }
  function setStatus(text,ok){const el=$('onlineStatus');if(el){el.textContent=text;el.classList.toggle('ok',!!ok)}}
  function render(rows){
    const me=profile();
    const mine=rows.find(r=>String(r.player_id)===String(me.id));
    const fallback=localStats();
    const current=mine||fallback;
    const done=missions(current.progress);
    if($('myRank'))$('myRank').textContent=rank(done);
    if($('myDone'))$('myDone').textContent=done;
    if($('myXp'))$('myXp').textContent=num(current.xp);
    const list=$('leaderList'); if(!list)return;
    if(!rows.length){list.innerHTML='<div class="leader-row"><div><b>No online players yet</b><small>Complete a mission to appear here.</small></div></div>';return}
    const sorted=[...rows].sort((a,b)=>num(b.xp)-num(a.xp));
    list.innerHTML=sorted.slice(0,50).map((r,i)=>{
      const d=missions(r.progress||{}), isMe=me.id&&String(r.player_id)===String(me.id);
      const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'🚀';
      const safeId=esc(r.player_id||'unknown');
      return `<div class="leader-row ${isMe?'me':''}"><strong>${i+1}</strong><span>${medal}</span><div><b>${esc(r.player_name||'Student')}</b><small>${d} missions · ${rank(d)}</small><button class="leader-player-id" type="button" data-player-id="${safeId}">ID: ${safeId}</button></div><em>${num(r.xp)} XP</em></div>`;
    }).join('');
  }
  async function loadOnline(){
    if(!window.supabase){setStatus('Online service is loading…',false);return}
    if(!client)client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    setStatus('Connecting to online leaderboard…',false);
    const {data,error}=await client.from('sq_student_progress').select('player_id,player_name,xp,coins,progress,updated_at').order('xp',{ascending:false}).limit(50);
    if(error){
      window.__SQ_LEADER_ROWS=[];
      console.warn('StudyQuest online leaderboard:',error.message);
      setStatus('Online leaderboard unavailable — showing this browser\'s progress.',false);
      render([]); return;
    }
    setStatus(`Online leaderboard • ${data.length} player${data.length===1?'':'s'}`,true);
    window.__SQ_LEADER_ROWS=data||[];
    render(data||[]);
  }
  function openPlayer(r){
    const d=missions(r.progress||{});
    const box=document.getElementById('playerProfileModal');
    if(!box)return;
    box.innerHTML=`<div class="player-profile-card"><button class="player-profile-close" type="button" aria-label="Close">×</button><div class="eyebrow">👤 PLAYER LEADERBOARD</div><h2>${esc(r.player_name||'Student')}</h2><div class="player-profile-id">Player ID: <b>${esc(r.player_id||'')}</b></div><div class="player-profile-stats"><div><small>RANK</small><strong>${rank(d)}</strong></div><div><small>MISSIONS</small><strong>${d}</strong></div><div><small>XP</small><strong>${num(r.xp)}</strong></div><div><small>COINS</small><strong>${num(r.coins)}</strong></div></div><p>Only public game progress is shown. School, state, address and contact details are hidden.</p></div>`;
    box.classList.add('show');
    box.querySelector('.player-profile-close').onclick=()=>box.classList.remove('show');
  }
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.leader-player-id');
    if(!btn)return;
    const id=btn.dataset.playerId;
    const rows=window.__SQ_LEADER_ROWS||[];
    const player=rows.find(x=>String(x.player_id)===String(id));
    if(player)openPlayer(player);
  });
  window.SQOnlineLeaderboard={refresh:loadOnline};
  document.addEventListener('DOMContentLoaded',()=>{
    render([]);
    const btn=$('refreshLeaderboard'); if(btn)btn.addEventListener('click',loadOnline);
    loadOnline();
  });
})();
