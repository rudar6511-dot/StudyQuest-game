const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "POST required" }, 405);
  }

  const key = Deno.env.get("GEMINI_API_KEY");

  if (!key) {
    return json(
      {
        error:
          "AI is not configured. Add GEMINI_API_KEY in Supabase Secrets.",
      },
      503,
    );
  }

  try {
    const body = await req.json();
    const question = String(body.question || "").trim();
    const mode = ["hint", "explain", "solve"].includes(body.mode)
      ? body.mode
      : "hint";

    if (!question) {
      return json({ error: "Question required" }, 400);
    }

    const instruction =
      mode === "hint"
        ? "Give a helpful hint and the next step. Do not immediately reveal the final answer."
        : mode === "explain"
        ? "Explain the concept simply with a clear example when useful."
        : "Give a step-by-step solution and clearly state the final answer.";

    const prompt = `You are StudyQuest AI Study Coach for school students.

Use simple, age-appropriate language.
If the student writes in Hindi or Hinglish, answer in Hindi/Hinglish.
Help the student understand the problem instead of encouraging blind copying.

${instruction}

Student's question:
${question}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        encodeURIComponent(key),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return json({ error: "Gemini AI provider error" }, 502);
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("") || "No answer returned.";

    return json({ answer });
  } catch (error) {
    console.error("AI service error:", error);
    return json({ error: "AI service unavailable" }, 500);
  }
});
