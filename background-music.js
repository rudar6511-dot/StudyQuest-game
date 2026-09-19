/* StudyQuest — original arcade soundtrack + clean glass click SFX */
(function(){
  "use strict";
  const path=(location.pathname.split("/").pop()||"home.html").toLowerCase();
  const themes={
    "home.html":{bpm:116,lead:"square",pad:"triangle",bass:"triangle",root:220,melody:[0,3,7,10,7,3,5,2]},
    "welcome.html":{bpm:98,lead:"triangle",pad:"sine",bass:"triangle",root:196,melody:[0,3,7,5,8,7,3,2]},
    "post-login-welcome.html":{bpm:120,lead:"square",pad:"triangle",bass:"triangle",root:220,melody:[0,4,7,11,7,4,9,5]},
    "multiplayer.html":{bpm:132,lead:"square",pad:"triangle",bass:"square",root:196,melody:[0,3,7,10,12,10,7,3]},
    "typing.html":{bpm:106,lead:"triangle",pad:"sine",bass:"triangle",root:220,melody:[0,2,4,7,4,2,5,9]},
    "leaderboard.html":{bpm:122,lead:"square",pad:"triangle",bass:"triangle",root:196,melody:[7,10,12,14,12,10,7,5]},
    "certificate.html":{bpm:112,lead:"triangle",pad:"sine",bass:"triangle",root:220,melody:[0,4,7,12,14,12,7,4]}
  };
  const theme=themes[path]||themes["home.html"];
  let ctx=null,master=null,comp=null,timer=null,step=0,playing=false;
  const midiFreq=m=>440*Math.pow(2,(m-69)/12);

  function setup(){
    if(ctx)return;
    ctx=new(window.AudioContext||window.webkitAudioContext)();

    // Softer master level + gentle compression: fun game audio without the
    // harsh/boomy sound that can feel like it is ringing in the ears.
    comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-16;
    comp.knee.value=18;
    comp.ratio.value=3;
    comp.attack.value=.008;
    comp.release.value=.22;

    master=ctx.createGain();
    master.gain.value=.055;
    master.connect(comp);
    comp.connect(ctx.destination);
  }

  function note(freq,when,duration,type,volume,detune=0){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,when);
    osc.detune.value=detune;
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(volume,when+.015);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.12),when+duration*.55);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(gain);gain.connect(master);
    osc.start(when);osc.stop(when+duration+.02);
  }

  // Clean, very short glass/crystal-like UI click with no long tail.
  function glassClick(){
    try{
      setup();
      if(ctx.state==="suspended")ctx.resume();
      const now=ctx.currentTime;
      const out=ctx.createGain();
      out.gain.setValueAtTime(.0001,now);
      out.gain.exponentialRampToValueAtTime(.032,now+.002);
      out.gain.exponentialRampToValueAtTime(.0001,now+.065);
      out.connect(master);

      const osc=ctx.createOscillator();
      osc.type="triangle";
      osc.frequency.setValueAtTime(2850,now);
      osc.frequency.exponentialRampToValueAtTime(1700,now+.055);
      osc.connect(out);
      osc.start(now);osc.stop(now+.07);
    }catch(e){}
  }

  function kick(when){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type="sine";
    osc.frequency.setValueAtTime(82,when);
    osc.frequency.exponentialRampToValueAtTime(52,when+.085);
    gain.gain.setValueAtTime(.065,when);
    gain.gain.exponentialRampToValueAtTime(.0001,when+.095);
    osc.connect(gain);gain.connect(master);
    osc.start(when);osc.stop(when+.10);
  }

  function hat(when){
    const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.025),ctx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
    const src=ctx.createBufferSource(),gain=ctx.createGain();
    src.buffer=buffer;
    gain.gain.value=.007;
    src.connect(gain);gain.connect(master);
    src.start(when);
  }

  function schedule(){
    if(!playing||!ctx)return;
    const now=ctx.currentTime,beat=60/theme.bpm;
    const pos=step%theme.melody.length;
    const semitone=theme.melody[pos];

    kick(now);
    if(step%2===0)kick(now+beat*.5);
    if(step%2===0)hat(now+beat*.5);

    const lead=midiFreq(57+semitone);
    note(lead,now,beat*.34,theme.lead,.040);
    const bassRoots=[theme.root,theme.root,theme.root*1.122,theme.root*.841];
    note(bassRoots[pos%4],now,beat*.55,theme.bass,.050);

    if(step%4===0){
      note(lead/2,now,beat*.38,theme.pad,.012);
      note(lead*.75,now,beat*.38,theme.pad,.009);
    }
    if(step%8===7)note(lead*1.5,now+beat*.12,beat*.14,"triangle",.014);

    step++;
    timer=setTimeout(schedule,beat*1000);
  }

  function start(){
    try{
      setup();
      if(ctx.state==="suspended")ctx.resume();
      if(playing)return;
      playing=true;step=0;schedule();
    }catch(e){console.warn("StudyQuest music unavailable",e);}
  }

  window.StudyQuestMusic={start,theme,click:glassClick};

  function init(){
    document.addEventListener("click",function(e){
      const target=e.target.closest("button,a,[role='button'],input[type='button'],input[type='submit'],summary,.clickable");
      if(target)glassClick();
    },true);
    document.addEventListener("pointerdown",function once(){
      document.removeEventListener("pointerdown",once);
      start();
    },{once:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();