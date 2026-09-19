/* StudyQuest — original arcade-style game soundtrack */
(function(){
  "use strict";
  const path=(location.pathname.split("/").pop()||"home.html").toLowerCase();

  const themes={
    "home.html":{bpm:118,lead:"square",pad:"sawtooth",bass:"triangle",root:220,melody:[0,3,7,10,7,3,5,2]},
    "welcome.html":{bpm:100,lead:"triangle",pad:"sine",bass:"triangle",root:196,melody:[0,3,7,5,8,7,3,2]},
    "post-login-welcome.html":{bpm:122,lead:"square",pad:"sawtooth",bass:"triangle",root:220,melody:[0,4,7,11,7,4,9,5]},
    "multiplayer.html":{bpm:136,lead:"square",pad:"sawtooth",bass:"square",root:196,melody:[0,3,7,10,12,10,7,3]},
    "typing.html":{bpm:108,lead:"triangle",pad:"sine",bass:"triangle",root:220,melody:[0,2,4,7,4,2,5,9]},
    "leaderboard.html":{bpm:126,lead:"square",pad:"triangle",bass:"triangle",root:196,melody:[7,10,12,14,12,10,7,5]},
    "certificate.html":{bpm:116,lead:"triangle",pad:"sine",bass:"triangle",root:220,melody:[0,4,7,12,14,12,7,4]}
  };

  const theme=themes[path]||themes["home.html"];
  let ctx=null,master=null,comp=null,timer=null,step=0,playing=false;

  const midiFreq=m=>440*Math.pow(2,(m-69)/12);

  function setup(){
    if(ctx)return;
    ctx=new(window.AudioContext||window.webkitAudioContext)();

    comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-22;
    comp.knee.value=12;
    comp.ratio.value=7;
    comp.attack.value=.002;
    comp.release.value=.16;

    master=ctx.createGain();
    master.gain.value=.105;
    master.connect(comp);
    comp.connect(ctx.destination);
  }

  function note(freq,when,duration,type,volume,detune=0){
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,when);
    osc.detune.value=detune;
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(volume,when+.012);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.18),when+duration*.65);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(gain); gain.connect(master);
    osc.start(when); osc.stop(when+duration+.025);
  }

  function kick(when){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type="sine";
    osc.frequency.setValueAtTime(105,when);
    osc.frequency.exponentialRampToValueAtTime(48,when+.12);
    gain.gain.setValueAtTime(.16,when);
    gain.gain.exponentialRampToValueAtTime(.0001,when+.13);
    osc.connect(gain);gain.connect(master);
    osc.start(when);osc.stop(when+.14);
  }

  function hat(when){
    const buffer=ctx.createBuffer(1,ctx.sampleRate*.045,ctx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
    const src=ctx.createBufferSource(),gain=ctx.createGain();
    src.buffer=buffer;
    gain.gain.value=.022;
    src.connect(gain);gain.connect(master);
    src.start(when);
  }

  function schedule(){
    if(!playing||!ctx)return;

    const now=ctx.currentTime;
    const beat=60/theme.bpm;
    const pos=step%theme.melody.length;
    const semitone=theme.melody[pos];

    // Driving four-on-the-floor game beat.
    kick(now);
    if(step%2===0) kick(now+beat*.5);
    hat(now+beat*.25);
    hat(now+beat*.75);

    // Punchy lead melody.
    const lead=midiFreq(57+semitone);
    note(lead,now,beat*.42,theme.lead,.075);
    note(lead*2,now,beat*.16,"triangle",.018);

    // Low bass movement.
    const bassRoots=[theme.root,theme.root,theme.root*1.122,theme.root*.841];
    const bass=bassRoots[pos%4];
    note(bass,now,beat*.72,theme.bass,.10);

    // Chord stab every second beat.
    if(step%2===0){
      note(lead/2,now,beat*.58,theme.pad,.028);
      note(lead*.75,now,beat*.58,theme.pad,.020);
    }

    // Small arcade-style pickup accent.
    if(step%8===7){
      note(lead*1.5,now+beat*.18,beat*.20,"square",.032);
      note(lead*1.78,now+beat*.32,beat*.18,"square",.024);
    }

    step++;
    timer=setTimeout(schedule,beat*1000);
  }

  function start(){
    try{
      setup();
      if(ctx.state==="suspended")ctx.resume();
      if(playing)return;
      playing=true;
      step=0;
      schedule();
    }catch(e){console.warn("StudyQuest music unavailable",e);}
  }

  window.StudyQuestMusic={start,theme};

  function init(){
    document.addEventListener("pointerdown",function once(){
      document.removeEventListener("pointerdown",once);
      start();
    },{once:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();