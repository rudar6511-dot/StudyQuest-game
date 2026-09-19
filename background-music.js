/* StudyQuest Background Music — automatic, original Web Audio themes */
(function(){
  "use strict";
  const path=(location.pathname.split("/").pop()||"home.html").toLowerCase();
  const themes={
    "home.html":{bpm:92,wave:"sine",notes:[261.63,329.63,392,523.25,392,329.63,293.66,349.23]},
    "welcome.html":{bpm:78,wave:"triangle",notes:[220,261.63,329.63,392,329.63,293.66,261.63,246.94]},
    "post-login-welcome.html":{bpm:104,wave:"sine",notes:[293.66,349.23,440,523.25,440,392,349.23,392]},
    "multiplayer.html":{bpm:116,wave:"square",notes:[196,246.94,293.66,369.99,293.66,246.94,220,329.63]},
    "typing.html":{bpm:88,wave:"sine",notes:[261.63,293.66,329.63,392,329.63,293.66,261.63,220]},
    "leaderboard.html":{bpm:100,wave:"triangle",notes:[392,493.88,587.33,659.25,587.33,493.88,523.25,392]},
    "certificate.html":{bpm:108,wave:"triangle",notes:[261.63,329.63,392,523.25,659.25,523.25,392,329.63]}
  };
  const theme=themes[path]||themes["home.html"];
  let ctx=null,master=null,timer=null,step=0,playing=false;
  function start(){
    try{
      if(!ctx){
        ctx=new(window.AudioContext||window.webkitAudioContext)();
        master=ctx.createGain(); master.gain.value=0.045; master.connect(ctx.destination);
      }
      if(ctx.state==="suspended") ctx.resume();
      if(playing)return;
      playing=true; step=0; schedule();
    }catch(e){console.warn("StudyQuest music unavailable",e)}
  }
  function schedule(){
    if(!playing||!ctx)return;
    const now=ctx.currentTime,freq=theme.notes[step%theme.notes.length];
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=theme.wave;osc.frequency.value=freq;
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.16,now+.025);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.46);
    osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+.5);
    step++;timer=setTimeout(schedule,60000/theme.bpm);
  }
  window.StudyQuestMusic={start,theme};
  function init(){
    document.addEventListener("pointerdown",function once(){
      document.removeEventListener("pointerdown",once);start();
    },{once:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();