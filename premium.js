(() => {
  const $ = (id) => document.getElementById(id);
  const get = (k, fallback = 0) => Number(localStorage.getItem(k) || fallback);
  const set = (k, v) => localStorage.setItem(k, String(v));

  function refreshDashboard() {
    const xp = get('sqXp');
    const coins = get('sqCoins');
    const completed = ['math','science','english','hindi','ss'].reduce((n, s) => n + Math.max(0, Math.min(20, get('sqProgress_' + s, 1) - 1)), 0);
    const streak = Math.max(1, get('sqStreak', 1));
    const target = 100;
    const current = xp % target;
    if ($('dashXp')) $('dashXp').textContent = xp;
    if ($('dashCoins')) $('dashCoins').textContent = coins;
    if ($('dashCompleted')) $('dashCompleted').textContent = completed;
    if ($('dashStreak')) $('dashStreak').textContent = streak;
    if ($('xpProgress')) $('xpProgress').style.width = (current / target * 100) + '%';
    if ($('dashXpText')) $('dashXpText').textContent = current + ' / ' + target + ' XP to next level';

    const badges = [
      ['🚀','First Launch', completed >= 1],
      ['🧠','Quiz Master', completed >= 5],
      ['🌍','World Explorer', completed >= 10],
      ['🏆','Quest Champion', completed >= 25]
    ];
    const box = $('achievementList');
    if (box) box.innerHTML = badges.map(b => `<div class="achievement ${b[2] ? 'earned' : ''}"><span>${b[0]}</span><div><b>${b[1]}</b><small>${b[2] ? 'Unlocked' : 'Keep playing to unlock'}</small></div></div>`).join('');
  }

  window.addEventListener('storage', refreshDashboard);
  document.addEventListener('click', (e) => {
    if (e.target.closest('.dashboard-refresh')) refreshDashboard();
  });
  setTimeout(refreshDashboard, 80);
  window.StudyQuestDashboard = { refresh: refreshDashboard };
})();
