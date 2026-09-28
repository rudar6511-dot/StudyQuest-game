Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok");
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const key = Deno.env.get("GEMINI_API_KEY");

  if (!key) {
    return new Response(
      JSON.stringify({
        error: "AI is not configured. Add GEMINI_API_KEY in Supabase secrets.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await req.json();
    const q = String(body.question || "").trim();
    const mode = ["hint", "explain", "solve"].includes(body.mode)
      ? body.mode
      : "hint";

    if (!q) {
      return new Response(JSON.stringify({ error: "Question required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const instruction =
      mode === "hint"
        ? "Give a useful hint and the next step without revealing the final answer unless necessary."
        : mode === "explain"
        ? "Explain the concept simply and clearly."
        : "Give a step-by-step solution and final answer.";

    const prompt =
      "You are StudyQuest AI Study Coach for school students. " +
      "Use simple, age-appropriate language. " +
      "If the student uses Hindi or Hinglish, respond in Hindi/Hinglish. " +
      "Teach reasoning rather than encouraging copying. " +
      instruction +
      "\n\nStudent question:\n" +
      q;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        encodeURIComponent(key),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "AI provider error" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("") || "No answer returned.";

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ error: "AI service unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
