/* StudyQuest Cloud Progress Sync
   Uses Supabase with the publishable browser key. No service-role/secret key is used.
   Requires the sq_student_progress table from supabase-progress-schema.sql.
*/
(function(){
  const URL='https://cfoyqyplnmxsxyxyfdbb.supabase.co';
  const KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  let client=null, last='';
  function profile(){try{return JSON.parse(localStorage.getItem('sqStudentProfile')||'{}')}catch(e){return {}}}
  function snapshot(){const p=profile(); if(!p.id)return null; const progress={}; ['math','science','english','hindi','ss'].forEach(s=>progress[s]=Number(localStorage.getItem('sqProgress_'+s)||1)); return {player_id:String(p.id),player_name:String(p.name||'Student').slice(0,60),xp:Number(localStorage.getItem('sqXp')||0),coins:Number(localStorage.getItem('sqCoins')||0),progress:progress,updated_at:new Date().toISOString()}}
  async function load(){
    if(!window.supabase)return;
    client=window.supabase.createClient(URL,KEY);
    const p=profile(); if(!p.id)return;
    const {data,error}=await client.from('sq_student_progress').select('*').eq('player_id',String(p.id)).maybeSingle();
    if(error||!data)return;
    const localXp=Number(localStorage.getItem('sqXp')||0), cloudXp=Number(data.xp||0);
    if(cloudXp>localXp){localStorage.setItem('sqXp',cloudXp)}
    localStorage.setItem('sqCoins',Math.max(Number(localStorage.getItem('sqCoins')||0),Number(data.coins||0)));
    const pr=data.progress||{}; Object.keys(pr).forEach(s=>{const v=Math.max(1,Math.min(20,Number(pr[s]||1))); if(v>Number(localStorage.getItem('sqProgress_'+s)||1))localStorage.setItem('sqProgress_'+s,v)});
    if(typeof window.updateProgress==='function')window.updateProgress();
  }
  async function push(){
    if(!client)return; const row=snapshot(); if(!row)return;
    const sig=JSON.stringify(row); if(sig===last)return; last=sig;
    const {error}=await client.from('sq_student_progress').upsert(row,{onConflict:'player_id'});
    if(error) console.warn('StudyQuest cloud sync:',error.message);
  }
  window.SQCloud={load:load,push:push};
  window.addEventListener('load',async function(){await load(); await push(); setInterval(push,4000)});
})();