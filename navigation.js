/* StudyQuest universal previous-page button */
(function(){
  function addBack(){
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
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addBack); else addBack();
})();