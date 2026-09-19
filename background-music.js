/* StudyQuest Background Music — louder, game-style original Web Audio themes */
(function(){
  "use strict";
  const path=(location.pathname.split("/").pop()||"home.html").toLowerCase();
  const themes={
    "home.html":{bpm:104,wave:"sawtooth",bass:"sine",notes:[261.63,329.63,392,523.25,392,329.63,293.66,392]},
    "welcome.html":{bpm:88,wave:"triangle",bass:"sine",notes:[220,261.63,329.63,392,329.63,293.66,261.63,246.94]},
    "post-login-welcome.html":{bpm:112,wave:"sawtooth",bass:"triangle",notes:[293.66,349.23,440,523.25,440,392,349.23,392]},
    "multiplayer.html":{bpm:128,wave:"square",bass:"sawtooth",notes:[196,246.94,293.66,369.99,293.66,246.94,220,329.63]},
    "typing.html":{bpm:96,wave:"triangle",bass:"sine",notes:[261.63,293.66,329.63,392,329.63,293.66,261.63,220]},
    "leaderboard.html":{bpm:112,wave:"triangle",bass:"sine",notes:[392,493.88,587.33,659.25,587.33,493.88,523.25,392]},
    "certificate.html":{bpm:116,wave:"triangle",bass:"sine",notes:[261.63,329.63,392,523.25,659.25,523.25,392,329.63]}
  };
  const theme=themes[path]||themes["home.html"];
  let ctx=null,master=null,comp=null,timer=null,step=0,playing=false;

  function start(){
    try{
      if(!ctx){
        ctx=new(window.AudioContext||window.webkitAudioContext)();
        comp=ctx.createDynamicsCompressor();
        comp.threshold.value=-18; comp.knee.value=18; comp.ratio.value=5;
        comp.attack.value=.003; comp.release.value=.18;
        master=ctx.createGain();
        master.gain.value=.12;
        master.connect(comp); comp.connect(ctx.destination);
      }
      if(ctx.state==="suspended") ctx.resume();
      if(playing)return;
      playing=true; step=0; schedule();
    }catch(e){console.warn("StudyQuest music unavailable",e)}
  }

  function tone(freq,when,duration,type,volume){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,when);
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(volume,when+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(gain);gain.connect(master);
    osc.start(when);osc.stop(when+duration+.03);
  }

  function schedule(){
    if(!playing||!ctx)return;
    const now=ctx.currentTime;
    const beat=60/theme.bpm;
    const freq=theme.notes[step%theme.notes.length];

    // Main game melody + warm lower layer + short accent.
    tone(freq,now,.42,theme.wave,.24);
    tone(freq/2,now,.34,theme.bass,.105);
    tone(freq*2,now,.10,"triangle",.035);

    // Subtle off-beat pulse for a more energetic game feel.
    if(step%2===1) tone(freq/2,now+beat*.5,.12,"square",.025);

    step++;
    timer=setTimeout(schedule,beat*1000);
  }

  window.StudyQuestMusic={start,theme};

  function init(){
    document.addEventListener("pointerdown",function once(){
      document.removeEventListener("pointerdown",once);
      start();
    },{once:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();