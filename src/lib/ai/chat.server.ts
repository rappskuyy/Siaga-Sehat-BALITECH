import { createServerFn } from "@tanstack/react-start";

export const chatWithAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    const d = data as { prompt?: unknown };
    if (!d.prompt || typeof d.prompt !== "string") throw new Error("prompt is required");
    return d;
  })
  .handler(async ({ data }) => {
    const { prompt } = data as { prompt: string };

    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    if (openaiKey) {
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Kamu adalah asisten kesehatan bernama SiagaSehat. Jawab singkat, jelas, dan aman dalam Bahasa Indonesia." },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`OpenAI error ${res.status}: ${txt.slice(0, 300)}`);
      }
      const payload = await res.json();
      const content = payload.choices?.[0]?.message?.content;
      return { reply: content ?? "" };
    }

    if (geminiKey) {
      const models = ["gemini-2.5-flash", "gemini-1.5"];
      for (const model of models) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: "Kamu adalah asisten kesehatan bernama SiagaSehat. Jawab singkat, jelas, dan aman dalam Bahasa Indonesia." }] },
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 800 },
            }),
          },
        );

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          // try next model
          continue;
        }

        const payload = await res.json();
        const text = payload.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") || "";
        return { reply: text };
      }
      throw new Error("Gemini API tidak dapat dihubungi");
    }

    throw new Error("Tidak ada API key AI yang dikonfigurasi. Tambahkan OPENAI_API_KEY atau GEMINI_API_KEY di .env");
  });
