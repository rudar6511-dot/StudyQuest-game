/* StudyQuest Supabase Auth bridge
   Quest ID format: any non-empty ID followed by @quest.local.
   The browser uses a generated internal email from the student's username.
   Do not put service-role keys in this file.
*/
(function(){
  const URL='https://cfoyqyplnmxsxyxyfdb.supabase.co';
  const KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  let sb=null;
  const $=id=>document.getElementById(id);
  const clean=v=>String(v||'').trim();
  const emailFor=u=>clean(u).toLowerCase()+'@studyquest.local';
  const validQuestId=v=>/^.+@quest\.local$/i.test(clean(v));
  const saveSession=(profile)=>{
    localStorage.setItem('sqStudentProfile',JSON.stringify(profile));
    localStorage.setItem('sqSession','1');
    localStorage.setItem('sqAuthV2','1');
  };
  function msg(t){if($('message'))$('message').textContent=t}
  function setBusy(v){if($('submitBtn')){$('submitBtn').disabled=v;$('submitBtn').textContent=v?'PLEASE WAIT…':(window.sqAuthMode==='signup'?'CREATE ACCOUNT 🚀':'LOGIN & ENTER 🚀')}}
  function getForm(){
    return {username:clean($('username')?.value),questId:clean($('questIdSign')?.value),name:clean($('studentName')?.value),school:clean($('schoolName')?.value),schoolBoard:clean($('schoolBoard')?.value),state:clean($('state')?.value),village:clean($('village')?.value),district:clean($('district')?.value),address:clean($('address')?.value),password:$('password')?.value||''};
  }
  async function signup(a){
    if(!/^[A-Za-z0-9_]{3,30}$/.test(a.username))return msg('Username: use 3–30 letters, numbers or _.');
    if(!validQuestId(a.questId))return msg('Quest ID must end with @quest.local. You can use any length before @quest.local.');
    a.questId=clean(a.questId).replace(/@quest\.local$/i,'@quest.local');
    if(!a.name||!a.school||!a.schoolBoard||!a.state||!a.village||!a.district)return msg('Please fill all required student, school and location fields.');
    if(a.password.length<6)return msg('Password must be at least 6 characters.');
    setBusy(true);
    const {data,error}=await sb.auth.signUp({email:emailFor(a.username),password:a.password,options:{data:{username:a.username,quest_id:a.questId,student_name:a.name}}});
    if(error){setBusy(false);return msg(error.message.includes('already')?'This Username already exists. Please use Login.':'Account creation failed: '+error.message)}
    if(!data.user){setBusy(false);return msg('Account creation did not return a user. Please try again.')}
    const {error:pe}=await sb.from('sq_student_profiles').insert({user_id:data.user.id,username:a.username,quest_id:a.questId,student_name:a.name,school_name:a.school,school_board:a.schoolBoard,state:a.state,village:a.village,district:a.district,address:a.address});
    if(pe){setBusy(false);return msg('Account created, but the profile table needs setup. Run supabase-auth-schema.sql, then try again.')}
    saveSession({id:data.user.id,name:a.name,username:a.username,questId:a.questId,school:a.school,schoolBoard:a.schoolBoard,state:a.state,village:a.village,district:a.district,address:a.address});
    location.href='./post-login-welcome.html';
  }
  async function login(){
    const id=clean($('loginId')?.value),pw=$('password')?.value||'';
    if(!id||!pw)return msg('Enter your Username or Quest ID and password.');
    setBusy(true);
    let username=id;
    if(validQuestId(id)){
      const questId=id.replace(/@quest\.local$/i,'@quest.local');
      const {data,error}=await sb.from('sq_student_profiles').select('username').eq('quest_id',questId).maybeSingle();
      if(error||!data){setBusy(false);return msg('Account not found. Check your Quest ID.')}
      username=data.username;
    }else if(!/^[A-Za-z0-9_]{3,30}$/.test(username)){
      setBusy(false);return msg('Enter a valid Username or a Quest ID ending with @quest.local.');
    }
    const {data,error}=await sb.auth.signInWithPassword({email:emailFor(username),password:pw});
    if(error||!data.user){setBusy(false);return msg('Incorrect Username/Quest ID or password.')}
    const {data:p,error:pe}=await sb.from('sq_student_profiles').select('*').eq('user_id',data.user.id).maybeSingle();
    if(pe||!p){setBusy(false);return msg('Login worked, but your student profile could not be loaded.')}
    saveSession({id:data.user.id,name:p.student_name,username:p.username,questId:p.quest_id,school:p.school_name,schoolBoard:p.school_board,state:p.state,village:p.village,district:p.district,address:p.address});
    location.href='./post-login-welcome.html';
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
