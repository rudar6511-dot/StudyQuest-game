/* StudyQuest friend-request messages */
(function(){
  const URL='https://cfoyqyplnmxsxyxyfdbb.supabase.co';
  const KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  let db=null,channel=null,timer=null;
  function profile(){try{return JSON.parse(localStorage.getItem('sqStudentProfile')||'{}')}catch(e){return{}}}
  function username(){return String(profile().username||'').trim()}
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  async function connect(){if(typeof supabase==='undefined'||!username())return false;if(!db)db=supabase.createClient(URL,KEY);return true}
  function box(){return document.getElementById('sqFriendMessages')}
  function show(){const b=box();if(!b)return;b.classList.add('show');clearTimeout(b.__sqHideTimer);b.__sqHideTimer=setTimeout(()=>b.classList.remove('show'),10000)}
  async function load(){
    if(!await connect())return;
    const {data,error}=await db.from('sq_friend_requests').select('id,sender_username,sender_name,created_at').eq('receiver_username',username()).eq('status','pending').order('created_at',{ascending:false});
    if(error||!box())return;
    const rows=data||[];
    box().innerHTML=rows.length?'<div class="sq-msg-head">📨 Friend Requests <b>'+rows.length+'</b></div>'+rows.map(r=>'<div class="sq-msg-request"><div><strong>'+esc(r.sender_name||'Student')+'</strong><span>@'+esc(r.sender_username||'')+'</span><small>wants to be your StudyQuest friend</small></div><div class="sq-msg-actions"><button data-friend-action="accepted" data-friend-id="'+esc(r.id)+'">Accept</button><button data-friend-action="declined" data-friend-id="'+esc(r.id)+'">Decline</button></div></div>').join(''):'<div class="sq-msg-head">📨 Messages</div><div class="sq-msg-empty">No new friend requests.</div>';
    show();
    box().querySelectorAll('[data-friend-action]').forEach(btn=>btn.addEventListener('click',async()=>respond(btn.dataset.friendId,btn.dataset.friendAction)));
  }
  async function respond(id,status){
    if(!await connect())return;
    const {error}=await db.from('sq_friend_requests').update({status}).eq('id',id).eq('receiver_username',username()).eq('status','pending');
    if(error)alert('Could not update request: '+error.message);else {load();}
  }
  async function start(){
    const b=box();if(!b)return;
    await load();
    if(!db)return;
    if(channel)db.removeChannel(channel);
    channel=db.channel('sq-friend-messages-'+username())
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'sq_friend_requests',filter:'receiver_username=eq.'+username()},payload=>{
        load();
        if(document.hidden||payload.new) { try{ if('Notification' in window && Notification.permission==='granted') new Notification('StudyQuest Friend Request',{body:(payload.new.sender_name||'Student')+' sent you a friend request.'}); }catch(e){} }
      })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'sq_friend_requests',filter:'receiver_username=eq.'+username()},load)
      .subscribe();
    clearInterval(timer);timer=setInterval(load,10000);
  }
  window.addEventListener('DOMContentLoaded',start);
  window.addEventListener('beforeunload',()=>{clearInterval(timer);if(channel&&db)db.removeChannel(channel)});
})();