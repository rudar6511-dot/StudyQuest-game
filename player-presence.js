/* StudyQuest global online/offline player roster for the homepage */
(function(){
  const SUPABASE_URL='https://cfoyqyplnmxsxyxyfdbb.supabase.co';
  const SUPABASE_ANON_KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  const ONLINE_WINDOW=45000;
  let client=null, timer=null, channel=null;

  function profile(){
    try{return JSON.parse(localStorage.getItem('sqStudentProfile')||'{}')}
    catch(e){return{}}
  }
  function playerId(){
    const p=profile();
    let id=p.id||localStorage.getItem('sqLivePlayerId');
    if(!id){
      id='guest_'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'_'+Math.random().toString(36).slice(2));
      localStorage.setItem('sqLivePlayerId',id);
    }
    return id;
  }
  function playerName(){return profile().name||'Student'}
  function safe(s){
    return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }
  function isOnline(lastSeen){
    return Date.now()-new Date(lastSeen).getTime()<ONLINE_WINDOW;
  }
  async function connect(){
    if(typeof supabase==='undefined')return false;
    if(!client)client=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
    return true;
  }
  async function touch(){
    if(!client)return;
    await client.from('sq_presence').upsert(
      {player_id:playerId(),player_name:playerName(),last_seen:new Date().toISOString()},
      {onConflict:'player_id'}
    );
  }
  async function render(){
    if(!client)return;
    const {data,error}=await client.from('sq_presence')
      .select('player_id,player_name,last_seen')
      .order('last_seen',{ascending:false});
    if(error)return;
    const onlineBox=document.getElementById('homeOnlinePlayers');
    const offlineBox=document.getElementById('homeOfflinePlayers');
    if(!onlineBox||!offlineBox)return;
    const rows=(data||[]).slice().sort((a,b)=>{
      const ao=isOnline(a.last_seen),bo=isOnline(b.last_seen);
      if(ao!==bo)return bo-ao;
      return String(a.player_name||'Student').localeCompare(String(b.player_name||'Student'));
    });
    const online=rows.filter(p=>isOnline(p.last_seen));
    const offline=rows.filter(p=>!isOnline(p.last_seen));
    document.getElementById('homeOnlineCount').textContent=online.length;
    document.getElementById('homeOfflineCount').textContent=offline.length;
    const me=playerId();
    const card=(p,on)=>`<div class="home-global-player ${on?'is-online':'is-offline'} ${p.player_id===me?'is-me':''}">
      <span class="home-player-dot"></span>
      <span class="home-player-info"><b>${safe(p.player_name||'Student')}${p.player_id===me?' <small>(You)</small>':''}</b><em>${safe(p.player_id||'')}</em></span>
    </div>`;
    onlineBox.innerHTML=online.length?online.map(p=>card(p,true)).join(''):'<div class="home-empty-roster">No players online</div>';
    offlineBox.innerHTML=offline.length?offline.map(p=>card(p,false)).join(''):'<div class="home-empty-roster">No offline players</div>';
  }
  async function start(){
    if(!await connect())return;
    await touch();
    await render();
    clearInterval(timer);
    timer=setInterval(async()=>{await touch();await render()},20000);
    if(channel)client.removeChannel(channel);
    channel=client.channel('sq-home-global-roster')
      .on('postgres_changes',{event:'*',schema:'public',table:'sq_presence'},render)
      .subscribe();
  }
  window.addEventListener('DOMContentLoaded',start);
  window.addEventListener('beforeunload',()=>clearInterval(timer));
})();