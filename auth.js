/* StudyQuest Supabase Auth bridge
   Quest ID: any non-empty ID ending with @quest.local.
   Uses Supabase Auth for passwords and the student profile table for Quest ID lookup.
*/
(function(){
  const URL='https://cfoyqyplnmxsxyxyfdb.supabase.co';
  const KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  let sb=null;
  const $=id=>document.getElementById(id);
  const clean=v=>String(v??'').trim();
  const emailFor=u=>clean(u).toLowerCase()+'@studyquest.local';
  const validQuestId=v=>/^.+@quest\.local$/i.test(clean(v));
  const normalQuestId=v=>clean(v).replace(/@quest\.local$/i,'@quest.local');
  const saveSession=p=>{
    localStorage.setItem('sqStudentProfile',JSON.stringify(p));
    localStorage.setItem('sqSession','1');
    localStorage.setItem('sqAuthV2','1');
  };
  function msg(t){if($('message'))$('message').textContent=t}
  function setBusy(v){
    if(!$('submitBtn'))return;
    $('submitBtn').disabled=v;
    $('submitBtn').textContent=v?'PLEASE WAIT…':(window.sqAuthMode==='signup'?'CREATE ACCOUNT 🚀':'LOGIN & ENTER 🚀');
  }
  function getForm(){return{
    username:clean($('username')?.value),questId:clean($('questIdSign')?.value),
    name:clean($('studentName')?.value),school:clean($('schoolName')?.value),
    schoolBoard:clean($('schoolBoard')?.value),state:clean($('state')?.value),
    village:clean($('village')?.value),district:clean($('district')?.value),
    address:clean($('address')?.value),password:$('password')?.value||''
  }}
  function explainError(e){
    const s=String(e?.message||e||'').toLowerCase();
    if(s.includes('failed to fetch')||s.includes('networkerror'))return 'Supabase connection failed. Please refresh and try again. If it continues, check that the Supabase project is active.';
    if(s.includes('user already registered')||s.includes('already registered')||s.includes('already exists'))return 'This Username already exists. Please use Login.';
    if(s.includes('password'))return 'Password must be at least 6 characters.';
    return 'Account creation failed: '+String(e?.message||e||'Unknown error');
  }
  async function signup(a){
    if(!/^[A-Za-z0-9_]{3,30}$/.test(a.username))return msg('Username: use 3–30 letters, numbers or _.');
    if(!validQuestId(a.questId))return msg('Quest ID must end with @quest.local. Any length before it is allowed.');
    a.questId=normalQuestId(a.questId);
    if(!a.name||!a.school||!a.schoolBoard||!a.state||!a.village||!a.district)return msg('Please fill all required student, school and location fields.');
    if(a.password.length<6)return msg('Password must be at least 6 characters.');
    setBusy(true);
    try{
      const {data,error}=await sb.auth.signUp({
        email:emailFor(a.username),password:a.password,
        options:{data:{username:a.username,quest_id:a.questId,student_name:a.name,school_name:a.school,school_board:a.schoolBoard,state:a.state,village:a.village,district:a.district,address:a.address}}
      });
      if(error){setBusy(false);return msg(explainError(error))}
      if(!data?.user){setBusy(false);return msg('Account creation did not return a user. Please try again.')}

      /* If email confirmation is disabled, create the profile now. If confirmation is
         enabled, the database trigger in supabase-auth-schema.sql creates it safely. */
      if(data.session){
        const {error:pe}=await sb.from('sq_student_profiles').upsert({
          user_id:data.user.id,username:a.username,quest_id:a.questId,student_name:a.name,
          school_name:a.school,school_board:a.schoolBoard,state:a.state,village:a.village,
          district:a.district,address:a.address
        },{onConflict:'user_id'});
        if(pe){setBusy(false);return msg('Account created, but profile setup failed. Run the latest supabase-auth-schema.sql in Supabase.')}
        saveSession({id:data.user.id,name:a.name,username:a.username,questId:a.questId,school:a.school,schoolBoard:a.schoolBoard,state:a.state,village:a.village,district:a.district,address:a.address});
        location.href='./post-login-welcome.html';
      }else{
        setBusy(false);
        msg('Account created! Supabase email confirmation is enabled. Disable email confirmation in Supabase Auth, then create the account again.');
      }
    }catch(e){setBusy(false);msg(explainError(e))}
  }
  async function login(){
    const id=clean($('loginId')?.value),pw=$('password')?.value||'';
    if(!id||!pw)return msg('Enter your Username or Quest ID and password.');
    setBusy(true);
    try{
      let username=id;
      if(validQuestId(id)){
        const questId=normalQuestId(id);
        const {data,error}=await sb.rpc('sq_get_username_by_quest_id',{p_quest_id:questId});
        if(error||!data){setBusy(false);return msg('Quest ID lookup is not ready. Run the latest supabase-auth-schema.sql in Supabase.')}
        username=typeof data==='string'?data:data.username;
      }else if(!/^[A-Za-z0-9_]{3,30}$/.test(username)){
        setBusy(false);return msg('Enter a valid Username or a Quest ID ending with @quest.local.');
      }
      const {data,error}=await sb.auth.signInWithPassword({email:emailFor(username),password:pw});
      if(error||!data?.user){setBusy(false);return msg('Incorrect Username/Quest ID or password.')}
      const {data:p,error:pe}=await sb.from('sq_student_profiles').select('*').eq('user_id',data.user.id).maybeSingle();
      if(pe||!p){setBusy(false);return msg('Login worked, but your student profile could not be loaded. Run the latest Supabase schema.')}
      saveSession({id:data.user.id,name:p.student_name,username:p.username,questId:p.quest_id,school:p.school_name,schoolBoard:p.school_board,state:p.state,village:p.village,district:p.district,address:p.address});
      location.href='./post-login-welcome.html';
    }catch(e){setBusy(false);msg(explainError(e))}
  }
  async function init(){
    if(!window.supabase){msg('Supabase is still loading. Refresh the page.');return}
    sb=window.supabase.createClient(URL,KEY);
    const form=$('authForm');if(!form)return;
    form.addEventListener('submit',e=>{e.preventDefault();msg('');window.sqAuthMode=window.sqAuthMode||'login';window.sqAuthMode==='signup'?signup(getForm()):login()});
    window.SQAuth={client:sb,logout:async()=>{await sb.auth.signOut();localStorage.removeItem('sqAuthV2');localStorage.removeItem('sqSession');location.href='./welcome.html'}};
  }
  window.addEventListener('load',init);
})();
