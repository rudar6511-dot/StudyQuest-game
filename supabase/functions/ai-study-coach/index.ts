Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");
  if (req.method !== "POST") return new Response(JSON.stringify({error:"POST required"}),{status:405});
  const key=Deno.env.get("OPENAI_API_KEY");
  if(!key) return new Response(JSON.stringify({error:"AI is not configured. Add OPENAI_API_KEY in Supabase secrets."}),{status:503,headers:{"Content-Type":"application/json"}});
  try{
    const body=await req.json();
    const q=String(body.question||"").trim();
    const mode=["hint","explain","solve"].includes(body.mode)?body.mode:"hint";
    if(!q)return new Response(JSON.stringify({error:"Question required"}),{status:400,headers:{"Content-Type":"application/json"}});
    const instruction=mode==="hint"?"Give a useful hint and next step without revealing the final answer unless necessary.":mode==="explain"?"Explain the concept simply and clearly.":"Give a step-by-step solution and final answer.";
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:"gpt-5.6-luna",instructions:"You are StudyQuest AI Study Coach for school students. Use simple age-appropriate language. If the student uses Hindi/Hinglish, respond in Hindi/Hinglish. Teach reasoning rather than encouraging copying. "+instruction,input:q})});
    const data=await response.json();
    if(!response.ok)return new Response(JSON.stringify({error:"AI provider error"}),{status:502,headers:{"Content-Type":"application/json"}});
    return new Response(JSON.stringify({answer:data.output_text||"No answer returned."}),{headers:{"Content-Type":"application/json"}});
  }catch(e){return new Response(JSON.stringify({error:"AI service unavailable"}),{status:500,headers:{"Content-Type":"application/json"}})}
});