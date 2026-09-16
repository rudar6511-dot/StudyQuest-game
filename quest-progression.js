(function(){
  const SUBJECTS=['math','science','english','hindi','ss'];
  const N=20;
  const $=id=>document.getElementById(id);
  function num(k){return +(localStorage.getItem(k)||0)}
  function completed(){return SUBJECTS.reduce((n,s)=>n+Math.max(0,Math.min(N,num('sqProgress_'+s)-1)),0)}
  function rank(xp){if(xp>=5000)return ['LEGEND','🌌'];if(xp>=3000)return ['MASTER','👑'];if(xp>=1800)return ['CHAMPION','🏆'];if(xp>=1000)return ['EXPLORER','🚀'];if(xp>=500)return ['RANGER','🛡️'];return ['ROOKIE','🌱']}
  function streak(){return Math.max(0,num('sqStreak'))}
  function inject(){
    if(document.getElementById('questProgress2'))return;
    const home=document.getElementById('home'); if(!home)return;
    const box=document.createElement('section'); box.id='questProgress2'; box.className='quest-progress2';
    box.innerHTML='<div class="qp-head"><div><div class="eyebrow">⚡ PROGRESSION SYSTEM</div><h2>Quest <span>Profile</span></h2><p>Track your rank, completed missions and learning streak.</p></div><button class="ghost" id="qpRefresh">↻ Refresh</button></div><div class="qp-grid"><div class="qp-card"><small>RANK</small><b id="qpRank">ROOKIE</b><span id="qpRankIcon">🌱</span></div><div class="qp-card"><small>MISSIONS</small><b id="qpDone">0</b><span>/ 100</span></div><div class="qp-card"><small>STREAK</small><b id="qpStreak">0</b><span>days 🔥</span></div><div class="qp-card"><small>XP</small><b id="qpXp">0</b><span>total</span></div></div><div class="qp-badges"><div class="eyebrow">BADGES</div><div id="qpBadgeList"></div></div></section>';
    const target=home.querySelector('.features'); target?target.after(box):home.appendChild(box);
    $('qpRefresh').onclick=render;
  }
  function render(){
    inject();
    const xp=num('sqXp'),done=completed(),st=streak(),r=rank(xp);
    if($('qpRank'))$('qpRank').textContent=r[0]; if($('qpRankIcon'))$('qpRankIcon').textContent=r[1];
    if($('qpDone'))$('qpDone').textContent=done; if($('qpStreak'))$('qpStreak').textContent=st; if($('qpXp'))$('qpXp').textContent=xp;
    const badges=[
      ['🚀','First Launch',xp>=0],['🎯','Mission Starter',done>=1],['📚','10 Missions',done>=10],['🌍','World Explorer',done>=20],['🔥','3 Day Streak',st>=3],['🏆','Quest Champion',done>=50],['👑','XP Master',xp>=3000]
    ];
    if($('qpBadgeList'))$('qpBadgeList').innerHTML=badges.map(b=>'<span class="qp-badge '+(b[2]?'earned':'locked')+'">'+b[0]+' '+b[1]+(b[2]?' ✓':' 🔒')+'</span>').join('');
  }
  window.addEventListener('storage',render); window.addEventListener('load',()=>{inject();render();setInterval(render,2000)});
})();