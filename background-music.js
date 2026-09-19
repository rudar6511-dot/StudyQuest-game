/* StudyQuest Background Music — lightweight, original Web Audio themes */
(function(){
  "use strict";
  const path = (location.pathname.split("/").pop() || "home.html").toLowerCase();
  const themes = {
    "home.html": {name:"Home • Space Quest", bpm:92, wave:"sine", notes:[261.63,329.63,392,523.25,392,329.63,293.66,349.23]},
    "welcome.html": {name:"Login • Welcome", bpm:78, wave:"triangle", notes:[220,261.63,329.63,392,329.63,293.66,261.63,246.94]},
    "post-login-welcome.html": {name:"Launch • New Adventure", bpm:104, wave:"sine", notes:[293.66,349.23,440,523.25,440,392,349.23,392]},
    "multiplayer.html": {name:"Arena • Multiplayer", bpm:116, wave:"square", notes:[196,246.94,293.66,369.99,293.66,246.94,220,329.63]},
    "typing.html": {name:"Skill Lab • Focus", bpm:88, wave:"sine", notes:[261.63,293.66,329.63,392,329.63,293.66,261.63,220]},
    "leaderboard.html": {name:"Leaderboard • Victory", bpm:100, wave:"triangle", notes:[392,493.88,587.33,659.25,587.33,493.88,523.25,392]},
    "focus-lab.html": {name:"Focus Lab • Calm", bpm:68, wave:"sine", notes:[196,246.94,293.66,329.63,293.66,246.94,220,174.61]},
    "certificate.html": {name:"Certificate • Celebration", bpm:108, wave:"triangle", notes:[261.63,329.63,392,523.25,659.25,523.25,392,329.63]}
  };
  const theme = themes[path] || themes["home.html"];
  let ctx=null, master=null, timer=null, step=0, playing=false;

  function makeButton(){
    if(document.getElementById("sqMusicButton")) return;
    const b=document.createElement("button");
    b.id="sqMusicButton";
    b.className="sq-music-button";
    b.type="button";
    b.innerHTML='<span class="sq-music-icon">♫</span><span class="sq-music-label">Music: Off</span>';
    b.title="Turn StudyQuest background music on/off";
    b.addEventListener("click",()=> playing ? stop() : start());
    document.body.appendChild(b);
  }

  function init(){
    makeButton();
    document.addEventListener("pointerdown", function once(){
      document.removeEventListener("pointerdown", once);
      if(localStorage.getItem("sqMusicOn")==="1") start();
    }, {once:true});
  }

  function start(){
    try{
      if(!ctx){
        ctx=new (window.AudioContext||window.webkitAudioContext)();
        master=ctx.createGain();
        master.gain.value=0.045;
        master.connect(ctx.destination);
      }
      if(ctx.state==="suspended") ctx.resume();
      if(playing) return;
      playing=true; localStorage.setItem("sqMusicOn","1");
      const btn=document.getElementById("sqMusicButton");
      if(btn) btn.innerHTML='<span class="sq-music-icon">♫</span><span class="sq-music-label">Music: On</span>';
      step=0; schedule();
    }catch(e){ console.warn("StudyQuest music unavailable",e); }
  }

  function stop(){
    playing=false; localStorage.setItem("sqMusicOn","0");
    if(timer){clearTimeout(timer);timer=null;}
    const btn=document.getElementById("sqMusicButton");
    if(btn) btn.innerHTML='<span class="sq-music-icon">♫</span><span class="sq-music-label">Music: Off</span>';
  }

  function schedule(){
    if(!playing || !ctx) return;
    const freq=theme.notes[step % theme.notes.length];
    const now=ctx.currentTime;
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.type=theme.wave; osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.0001,now);
    gain.gain.exponentialRampToValueAtTime(0.16,now+0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+0.46);
    osc.connect(gain); gain.connect(master); osc.start(now); osc.stop(now+0.5);
    const beat=60000/theme.bpm;
    step++;
    timer=setTimeout(schedule,beat);
  }

  window.StudyQuestMusic={start,stop,theme};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();