(()=>{
"use strict";
const KEY="sqPremiumDemoV1";
const plans={monthly:{label:"Monthly Demo",days:30,title:"Premium Explorer"},quarterly:{label:"Quarterly Demo",days:90,title:"Premium Adventurer"},annual:{label:"Annual Demo",days:365,title:"Premium Legend"}};
const $=id=>document.getElementById(id);
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){return null}};
const active=()=>{const p=read();return !!(p&&Number(p.expiresAt)>Date.now())};
const fmt=ms=>new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(ms));
function render(){
 const p=read(),isActive=active();
 $("memberBadge").textContent=isActive?(p.title||"PREMIUM MEMBER").toUpperCase():"FREE EXPLORER";
 $("memberBadge").classList.toggle("active",isActive);
 document.querySelectorAll("[data-world-lock]").forEach(el=>{el.textContent=isActive?"✓ Demo unlocked":"🔒 Premium access";el.classList.toggle("unlocked",isActive)});
 $("worldNotice").textContent=isActive?"✨ Demo Premium is active in this browser. Explore the Premium World preview! No payment was taken.":"🔐 These are preview worlds. Activate a demo plan below to try the Premium experience.";
 $("memberPanel").hidden=!isActive;
 if(isActive){$("memberTitle").textContent=(p.title||"Premium Explorer")+" — active";$("memberExpiry").textContent="Demo access ends: "+fmt(p.expiresAt)+". This browser-only demo does not represent a paid subscription."}
 document.querySelectorAll("[data-plan]").forEach(btn=>{btn.textContent=isActive?"✓ Demo active":({monthly:"Activate 30-day demo",quarterly:"Activate 90-day demo",annual:"Activate 365-day demo"}[btn.dataset.plan]);btn.disabled=isActive});
}
function activate(id){
 if(!plans[id])return;
 if(active()){alert("Your demo membership is already active.");return}
 const plan=plans[id],now=Date.now(),record={version:1,plan:id,label:plan.label,title:plan.title,activatedAt:now,expiresAt:now+plan.days*24*60*60*1000,demoOnly:true,realPayment:false};
 try{localStorage.setItem(KEY,JSON.stringify(record))}catch(e){alert("This browser could not save the demo membership. Please allow local storage and try again.");return}
 render();$("memberPanel").scrollIntoView({behavior:"smooth",block:"center"});alert("Demo Premium activated for "+plan.days+" days. No real payment was taken.");
}
document.querySelectorAll("[data-plan]").forEach(btn=>btn.addEventListener("click",()=>activate(btn.dataset.plan)));
$("endDemo").addEventListener("click",()=>{if(!confirm("End your demo membership in this browser?"))return;localStorage.removeItem(KEY);render()});
render();
})();