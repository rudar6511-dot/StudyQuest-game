const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function askGemini(
  key: string,
  model: string,
  prompt: string,
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
    };
  }

  const answer =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("") || "";

  if (!answer) {
    return {
      ok: false,
      status: 502,
      data: { error: { message: "No answer returned by Gemini." } },
    };
  }

  return {
    ok: true,
    answer,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json({ error: "POST required" }, 405);
  }

  try {
    const key = Deno.env.get("GEMINI_API_KEY");

    if (!key) {
      return json(
        {
          error:
            "GEMINI_API_KEY is missing. Add it in Supabase Secrets.",
        },
        503,
      );
    }

    const body = await req.json();
    const question = String(body.question || "").trim();

    const mode = ["hint", "explain", "solve"].includes(body.mode)
      ? body.mode
      : "hint";

    if (!question) {
      return json({ error: "Question required" }, 400);
    }

    let instruction = "";

    if (mode === "hint") {
      instruction =
        "Give a helpful hint and the next step. Do not immediately reveal the final answer.";
    } else if (mode === "explain") {
      instruction =
        "Explain the concept simply with a clear example when useful.";
    } else {
      instruction =
        "Give a step-by-step solution and clearly state the final answer.";
    }

    const prompt = `
You are StudyQuest AI Study Coach for school students.

Use simple, age-appropriate language.

If the student writes in Hindi or Hinglish, answer in Hindi/Hinglish.

Help the student understand the problem instead of encouraging blind copying.

${instruction}

Student's question:
${question}
`;

    // Try the latest model first, then automatically fall back
    // if Google reports temporary overload/rate-limit/server errors.
    const models = [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
    ];

    let lastError = "Gemini AI is temporarily unavailable.";

    for (const model of models) {
      // Give the primary model one quick retry.
      const attempts = model === "gemini-3.8-flash" ? 2 : 1;

      for (let attempt = 0; attempt < attempts; attempt++) {
        const result = await askGemini(key, model, prompt);

        if (result.ok) {
          return json({
            answer: result.answer,
            model,
          });
        }

        const providerMessage =
          result.data?.error?.message ||
          result.data?.error?.status ||
          `HTTP ${result.status}`;

        lastError = providerMessage;
        console.error(
          `Gemini ${model} attempt ${attempt + 1} failed:`,
          result.data,
        );

        // Retry only temporary overload/rate-limit/server failures.
        const temporary =
          result.status === 429 ||
          result.status === 500 ||
          result.status === 502 ||
          result.status === 503 ||
          result.status === 504 ||
          /high demand|overload|temporar|rate.?limit/i.test(
            providerMessage,
          );

        if (!temporary) {
          break;
        }

        if (attempt < attempts - 1) {
          await sleep(1200);
        }
      }
    }

    return json(
      {
        error:
          "Gemini AI is temporarily busy. Please try again in a moment.",
        detail: lastError,
      },
      503,
    );
  } catch (error) {
    console.error("AI service error:", error);

    return json(
      {
        error: "AI service unavailable. Please try again.",
      },
      500,
    );
  }
});
