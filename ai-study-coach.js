/* StudyQuest AI Study Coach
   Frontend bridge for the Supabase Edge Function.
   The OpenAI secret NEVER belongs in this file.
*/
(function(){
  'use strict';
  const SUPABASE_URL='https://cfoyqyplnmxsxyxyfdbb.supabase.co';
  const SUPABASE_KEY='sb_publishable_WcW00SpDEMZKGBas8dNRPA_dDjjVJ1s';
  const ENDPOINT=SUPABASE_URL+'/functions/v1/ai-study-coach';
  const $=id=>document.getElementById(id);
  let client=null;

  function getClient(){
    if(client)return client;
    if(window.supabase) client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
    return client;
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function markdownLite(v){
    return escapeHtml(v)
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\n/g,'<br>');
  }
  function currentQuestion(){
    return {
      subject: $('quizSubject')?.textContent || 'General',
      level: $('levelChip')?.textContent || '',
      question: $('question')?.textContent || '',
      options: [...document.querySelectorAll('#answers button')].map(x=>x.textContent.trim()).filter(Boolean)
    };
  }
  function openCoach(prefill='',mode='hint'){
    let modal=$('sqAiModal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='sqAiModal';
      modal.className='sq-ai-modal';
      modal.innerHTML='<div class="sq-ai-card">'+
        '<button class="sq-ai-close" onclick="sqAiClose()">✕</button>'+
        '<div class="sq-ai-title"><span class="sq-ai-bot">🤖</span><div><div class="eyebrow">STUDYQUEST AI</div><h2>AI Study Coach</h2><p>Understand the question — don’t just copy an answer.</p></div></div>'+
        '<div class="sq-ai-modes"><button data-mode="hint" onclick="sqAiMode(\'hint\')">💡 Hint</button><button data-mode="explain" onclick="sqAiMode(\'explain\')">🧠 Explain</button><button data-mode="solve" onclick="sqAiMode(\'solve\')">✅ Solve</button></div>'+
        '<textarea id="sqAiInput" rows="4" placeholder="Type or paste your question here..."></textarea>'+ 
        '<div class="sq-ai-speech-row"><button type="button" id="sqAiMic" class="sq-ai-mic" onclick="sqAiToggleSpeech()">🎙️ Speak your question</button><span id="sqAiSpeechStatus" aria-live="polite">Hindi and English voice input (browser support required)</span></div>'+ 
        '<div class="sq-ai-actions"><button class="ghost" onclick="sqAiUseCurrent()">Use current quiz question</button><button class="primary" onclick="sqAiAsk()">Ask AI →</button></div>'+
        '<div id="sqAiStatus" class="sq-ai-status"></div><div id="sqAiAnswer" class="sq-ai-answer"></div>'+
        '</div>';
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
    $('sqAiInput').value=prefill||'';
    window._sqAiMode=mode;
    sqAiMode(mode);
  }
  let sqSpeechRecognition=null;
  let sqSpeechActive=false;
  window.sqAiToggleSpeech=()=>{
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    const status=$('sqAiSpeechStatus');
    const button=$('sqAiMic');
    if(!SpeechRecognition){if(status)status.textContent='Voice typing is not supported in this browser. Try Chrome or Edge.';return;}
    if(sqSpeechActive&&sqSpeechRecognition){sqSpeechRecognition.stop();return;}
    sqSpeechRecognition=new SpeechRecognition();
    sqSpeechRecognition.lang='hi-IN';
    sqSpeechRecognition.continuous=false;
    sqSpeechRecognition.interimResults=true;
    sqSpeechRecognition.onstart=()=>{sqSpeechActive=true;if(button){button.textContent='⏹️ Stop listening';button.classList.add('listening');}if(status)status.textContent='Listening… speak now. For English, you can switch browser language settings if needed.';};
    sqSpeechRecognition.onresult=(event)=>{
      let finalText='';let interimText='';
      for(let i=event.resultIndex;i<event.results.length;i++){const spoken=event.results[i][0].transcript;if(event.results[i].isFinal)finalText+=spoken;else interimText+=spoken;}
      const input=$('sqAiInput');if(input){const base=input.dataset.speechBase||'';input.value=(base+(base&&finalText?' ':'')+finalText+interimText).trim();}
      if(status)status.textContent=finalText?'Voice captured. You can edit it or tap Ask AI.':'Listening…';
    };
    sqSpeechRecognition.onerror=(event)=>{if(status)status.textContent=event.error==='not-allowed'?'Microphone permission denied. Allow microphone access in your browser.':'Voice input error: '+event.error;};
    sqSpeechRecognition.onend=()=>{sqSpeechActive=false;if(button){button.textContent='🎙️ Speak your question';button.classList.remove('listening');}const input=$('sqAiInput');if(input)delete input.dataset.speechBase;if(status&&status.textContent==='Listening…')status.textContent='Stopped listening. You can edit your question now.';};
    const input=$('sqAiInput');if(input)input.dataset.speechBase=input.value.trim();
    try{sqSpeechRecognition.start();}catch(e){if(status)status.textContent='Could not start microphone. Please try again.';}
  };
  window.sqAiClose=()=>{const m=$('sqAiModal');if(m)m.classList.remove('open')};
  window.sqAiMode=mode=>{
    window._sqAiMode=mode;
    document.querySelectorAll('.sq-ai-modes button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  };
  window.sqAiUseCurrent=()=>{const q=currentQuestion();$('sqAiInput').value=q.question;window._sqAiCurrent=q;};
  window.sqAiAsk=async()=>{
    const text=($('sqAiInput')?.value||'').trim();
    if(!text){$('sqAiStatus').textContent='Please enter a question first.';return}
    const q=window._sqAiCurrent||currentQuestion();
    const status=$('sqAiStatus'),answer=$('sqAiAnswer');
    status.textContent='🤖 AI is thinking…';answer.innerHTML='';
    try{
      const sb=getClient();
      if(!sb)throw new Error('Supabase library is not loaded.');
      const {data:{session}}=await sb.auth.getSession();
      if(!session?.access_token)throw new Error('Please log in again to use AI Study Coach.');
      const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':SUPABASE_KEY},body:JSON.stringify({
        question:text,mode:window._sqAiMode||'hint',subject:q.subject,level:q.level,options:q.options||[]
      })});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||'AI service could not respond.');
      answer.innerHTML='<div class="sq-ai-response">'+markdownLite(data.answer||'No answer returned.')+'</div>';
      status.textContent='✨ Study Coach';
    }catch(e){status.textContent='';answer.innerHTML='<div class="sq-ai-error">⚠️ '+escapeHtml(e.message||'Something went wrong.')+'</div>';}
  };
  window.openAIStudyCoach=()=>openCoach('', 'hint');
  window.openAIForCurrentQuestion=()=>{const q=currentQuestion();openCoach(q.question,'hint');window._sqAiCurrent=q;};

  document.addEventListener('DOMContentLoaded',()=>{
    const hub=document.getElementById('sqFeatureHub');
    if(hub&&!document.getElementById('sqAiHubButton')){
      const b=document.createElement('button');
      b.id='sqAiHubButton';b.className='sq-tool sq-ai-tool';b.onclick=window.openAIStudyCoach;
      b.innerHTML='<span class="sq-icon">🤖</span><b>AI Study Coach</b><small>Get hints, explanations and step-by-step help for questions.</small>';
      hub.querySelector('.sq-feature-grid')?.appendChild(b);
    }
    const quizCard=document.querySelector('#quiz .quiz-card');
    if(quizCard&&!document.getElementById('sqAiQuizButton')){
      const b=document.createElement('button');
      b.id='sqAiQuizButton';b.className='sq-ai-quiz-button';b.textContent='🤖 Ask AI for a Hint';
      b.onclick=window.openAIForCurrentQuestion;
      const answers=document.getElementById('answers');
      if(answers)answers.parentNode.insertBefore(b,answers);
    }
  });
})();