/* StudyQuest Supabase Auth bridge
   Quest ID: any non-empty ID ending with @quest.local.
   Password accounts use a generated internal email from the username.
*/
(function(){
  const URL='https://cfoyqyplnmxsxyxyfdbb.supabase.co';
  const KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  let sb=null;
  const $=id=>document.getElementById(id);
  const clean=v=>String(v??'').trim();
  /* Use the real Supabase project domain for the hidden Auth email.
     Students still log in with Username or Quest ID; this email is never shown. */
  const emailFor=u=>clean(u).toLowerCase()+'@cfoyqyplnmxsxyxyfdbb.supabase.co';
  const validQuestId=v=>/^.+@quest\.local$/i.test(clean(v));
  const normalQuestId=v=>clean(v).replace(/@quest\.local$/i,'@quest.local');
  const saveSession=p=>{localStorage.setItem('sqStudentProfile',JSON.stringify(p));localStorage.setItem('sqSession','1');localStorage.setItem('sqAuthV2','1')};
  function msg(t){if($('message'))$('message').textContent=t}
  function setBusy(v){if(!$('submitBtn'))return;$('submitBtn').disabled=v;$('submitBtn').textContent=v?'PLEASE WAIT…':(window.sqAuthMode==='signup'?'CREATE ACCOUNT 🚀':'LOGIN & ENTER 🚀')}
  function getForm(){return{username:clean($('username')?.value),questId:clean($('questIdSign')?.value),name:clean($('studentName')?.value),school:clean($('schoolName')?.value),schoolBoard:clean($('schoolBoard')?.value),state:clean($('state')?.value),village:clean($('village')?.value),district:clean($('district')?.value),address:clean($('address')?.value),password:$('password')?.value||''}}
  function explainError(e,mode){
    const s=String(e?.message||e||'').toLowerCase();
    if(s.includes('failed to fetch')||s.includes('networkerror')||s.includes('network request failed'))return 'Supabase server could not be reached. Check your internet connection and make sure the Supabase project is active, then refresh this page.';
    if(s.includes('user already registered')||s.includes('already registered')||s.includes('already exists'))return 'This Username already exists. Please use Login.';
    if(s.includes('email')&&s.includes('invalid'))return 'Supabase rejected the hidden account email. Please check the Supabase Auth email settings.';
    if(s.includes('password'))return 'Password must be at least 6 characters.';
    return (mode==='login'?'Login failed: ':'Account creation failed: ')+String(e?.message||e||'Unknown error');
  }
  async function checkConnection(){
    try{const r=await fetch(URL+'/auth/v1/health',{method:'GET',cache:'no-store'});return r.ok||r.status===401}catch(e){return false}
  }
  async function signup(a){
    if(!/^[A-Za-z0-9_]{3,30}$/.test(a.username))return msg('Username: use 3–30 letters, numbers or _.');
    if(!validQuestId(a.questId))return msg('Quest ID must end with @quest.local. Any length before it is allowed.');
    a.questId=normalQuestId(a.questId);
    if(!a.name||!a.school||!a.schoolBoard||!a.state||!a.village||!a.district)return msg('Please fill all required student, school and location fields.');
    if(a.password.length<6)return msg('Password must be at least 6 characters.');
    setBusy(true);
    try{
      if(!(await checkConnection())){setBusy(false);return msg('Supabase server is not reachable. Check internet/Supabase project status and try again.')}
      const {data,error}=await sb.auth.signUp({email:emailFor(a.username),password:a.password,options:{data:{username:a.username,quest_id:a.questId,student_name:a.name,school_name:a.school,school_board:a.schoolBoard,state:a.state,village:a.village,district:a.district,address:a.address}}});
      if(error){setBusy(false);return msg(explainError(error,'signup'))}
      if(!data?.user){setBusy(false);return msg('Account creation did not return a user. Please try again.')}
      if(!data.session){setBusy(false);return msg('Account created, but Supabase email confirmation is ON. Turn off Confirm email in Supabase Auth, because this StudyQuest login uses Username + Quest ID instead of a real email.')}
      const {data:p,error:pe}=await sb.from('sq_student_profiles').select('*').eq('user_id',data.user.id).maybeSingle();
      if(pe||!p){setBusy(false);return msg('Account created, but the student profile was not created. Run the latest supabase-auth-schema.sql once in Supabase.')}
      saveSession({id:data.user.id,name:p.student_name,username:p.username,questId:p.quest_id,school:p.school_name,schoolBoard:p.school_board,state:p.state,village:p.village,district:p.district,address:p.address});
      location.href='./post-login-welcome.html';
    }catch(e){setBusy(false);msg(explainError(e,'signup'))}
  }
  async function login(){
    const id=clean($('loginId')?.value),pw=$('password')?.value||'';
    if(!id||!pw)return msg('Enter your Username or Quest ID and password.');
    setBusy(true);
    try{
      let username=id;
      if(validQuestId(id)){
        const {data,error}=await sb.rpc('sq_get_username_by_quest_id',{p_quest_id:normalQuestId(id)});
        if(error||!data){setBusy(false);return msg('Quest ID lookup is not ready. Run the latest supabase-auth-schema.sql in Supabase.')}
        username=typeof data==='string'?data:data.username;
      }else if(!/^[A-Za-z0-9_]{3,30}$/.test(username)){setBusy(false);return msg('Enter a valid Username or a Quest ID ending with @quest.local.')}
      const {data,error}=await sb.auth.signInWithPassword({email:emailFor(username),password:pw});
      if(error||!data?.user){setBusy(false);return msg('Incorrect Username/Quest ID or password.')}
      const {data:p,error:pe}=await sb.from('sq_student_profiles').select('*').eq('user_id',data.user.id).maybeSingle();
      if(pe||!p){setBusy(false);return msg('Login worked, but your student profile could not be loaded. Run the latest Supabase schema.')}
      saveSession({id:data.user.id,name:p.student_name,username:p.username,questId:p.quest_id,school:p.school_name,schoolBoard:p.school_board,state:p.state,village:p.village,district:p.district,address:p.address});
      location.href='./post-login-welcome.html';
    }catch(e){setBusy(false);msg(explainError(e,'login'))}
  }
  async function init(){
    if(!window.supabase){msg('Supabase library did not load. Refresh the page or check your internet connection.');return}
    sb=window.supabase.createClient(URL,KEY);
    const form=$('authForm');if(!form)return;
    form.addEventListener('submit',e=>{e.preventDefault();msg('');window.sqAuthMode=window.sqAuthMode||'login';window.sqAuthMode==='signup'?signup(getForm()):login()});
    window.SQAuth={client:sb,logout:async()=>{try{await sb.auth.signOut()}catch(e){}localStorage.removeItem('sqAuthV2');localStorage.removeItem('sqSession');location.href='./welcome.html'}};
  }
  window.addEventListener('load',init);
})();
