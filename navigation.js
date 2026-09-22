/* StudyQuest universal previous-page button */
(function(){
  function addBack(){
    if(document.getElementById('sqRefreshButton')) return addRefresh();
    if(document.getElementById('sqBackButton')) return;
    const b=document.createElement('button');
    b.id='sqBackButton'; b.className='sq-back-btn'; b.type='button';
    b.innerHTML='← <span>Back</span>';
    b.title='Go to previous page';
    b.addEventListener('click',function(){
      if(window.history.length>1) window.history.back();
      else window.location.href=document.body.dataset.backFallback||'home.html';
    });
    document.body.appendChild(b);
    addRefresh();
  }
  function addRefresh(){
    if(document.getElementById('sqRefreshButton')) return;
    const b=document.createElement('button'); b.id='sqRefreshButton'; b.className='sq-refresh-btn'; b.type='button'; b.title='Refresh this page';
    b.innerHTML='↻ <span>Refresh</span>';
    b.addEventListener('click',function(){b.classList.add('spinning');setTimeout(()=>location.reload(),180)});
    document.body.appendChild(b);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addBack); else addBack();
})();