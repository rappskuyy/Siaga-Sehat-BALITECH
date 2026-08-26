import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AIAssessmentResult, AssessmentInput } from "./types";

const assessmentInputSchema = z.object({
  regionId: z.string().min(1),
  regionName: z.string().min(1),
  symptoms: z.array(z.string()).min(1),
  selectedConditions: z.array(z.string()).default([]),
  additionalNotes: z.string().optional().default(""),
});

const SYSTEM_PROMPT = `Kamu adalah AI Health Assessment Assistant untuk platform "SiagaSehat".
Tugasmu adalah menganalisis kombinasi bagian tubuh, gejala yang dialami pengguna, kondisi terkait yang dipilih, dan informasi tambahan.

ATURAN UTAMA MEDICAL SAFETY:
1. JANGAN PERNAH memberikan diagnosis medis pasti 100%. Gunakan frasa "Kemungkinan kondisi", "Indikasi berdasarkan gejala", "Hasil assessment awal".
2. Selalu gunakan Bahasa Indonesia yang ramah, medis profesional, dan empatik.
3. Evaluasi apakah ada tanda bahaya darurat (red flags seperti nyeri dada hebat, sesak napas berat, perdarahan hebat, kaku kuduk, lemas separuh badan mendadak, kehilangan penglihatan mendadak, dll). Jika ada, tandai "is_emergency": true dan sertakan pesan peringatan darurat ke IGD.
4. Sertakan disclaimer wajib di akhir bahwa informasi ini bukan pengganti konsultasi medis dokter.

FORMAT KELUARAN JSON MANDATORI:
Keluarkan HANYA satu objek JSON valid tanpa markdown fence atau teks tambahan di luar JSON:
{
  "summary": "Ringkasan analisis dalam 2-3 kalimat...",
  "primary_condition": {
    "name": "Nama Kondisi Utama",
    "likelihood": 80,
    "reason": "Alasan singkat mengapa gejala ini mengarah ke kondisi tersebut...",
    "severity": "ringan" | "sedang" | "tinggi"
  },
  "differential_conditions": [
    {
      "name": "Nama Kondisi Alternatif 1",
      "likelihood": 45,
      "reason": "Penjelasan singkat...",
      "severity": "ringan" | "sedang" | "tinggi"
    }
  ],
  "matched_symptoms": ["Daftar gejala utama yang cocok"],
  "recommendations": [
    "Saran perawatan mandiri 1",
    "Saran perawatan mandiri 2",
    "Kapan harus berkonsultasi ke dokter"
  ],
  "is_emergency": false,
  "emergency_message": "",
  "disclaimer": "Hasil assessment AI ini merupakan informasi awal berdasarkan gejala yang dipilih dan bukan pengganti diagnosis profesional dari tenaga medis/dokter."
}`;

async function assessWithGemini(input: AssessmentInput): Promise<AIAssessmentResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi di server.");

  const userPrompt = `
Bagian Tubuh: ${input.regionName} (ID: ${input.regionId})
Gejala Terpilih: ${input.symptoms.join(", ")}
Kondisi Terkait Terpilih: ${input.selectedConditions.length > 0 ? input.selectedConditions.join(", ") : "Tidak ada"}
Catatan Tambahan Pengguna: ${input.additionalNotes || "Tidak ada"}

Tolong lakukan AI Health Assessment dan kembalikan JSON sesuai skema yang ditentukan.`;

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"];
  let lastErr = "";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 1000,
            },
          }),
        },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        lastErr = `Model ${model} status ${res.status}: ${txt.slice(0, 150)}`;
        continue;
      }

      const payload = await res.json();
      const text = payload.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
      if (!text) continue;

      return parseResultJson(text);
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Gagal menghubungi Gemini API (${lastErr})`);
}

async function assessWithOpenAI(input: AssessmentInput): Promise<AIAssessmentResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY belum dikonfigurasi di server.");

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const userPrompt = `
Bagian Tubuh: ${input.regionName} (ID: ${input.regionId})
Gejala Terpilih: ${input.symptoms.join(", ")}
Kondisi Terkait Terpilih: ${input.selectedConditions.length > 0 ? input.selectedConditions.join(", ") : "Tidak ada"}
Catatan Tambahan Pengguna: ${input.additionalNotes || "Tidak ada"}

Tolong lakukan AI Health Assessment dan kembalikan JSON.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const payload = await res.json();
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI tidak mengembalikan respon valid.");

  return parseResultJson(text);
}

function parseResultJson(jsonString: string): AIAssessmentResult {
  const cleaned = jsonString.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const raw = JSON.parse(cleaned);

  return {
    summary: raw.summary || "Penilaian kondisi awal berdasarkan gejala yang Anda pilih.",
    primaryCondition: {
      name: raw.primary_condition?.name || "Kondisi Belum Spesifik",
      likelihood: Math.min(100, Math.max(10, raw.primary_condition?.likelihood || 75)),
      reason: raw.primary_condition?.reason || "Kombinasi gejala yang Anda pilih berkorelasi dengan kondisi ini.",
      severity: raw.primary_condition?.severity || "sedang",
    },
    differentialConditions: (raw.differential_conditions || []).map((c: any) => ({
      name: c.name || "Kondisi Alternatif",
      likelihood: Math.min(100, Math.max(5, c.likelihood || 40)),
      reason: c.reason || "",
      severity: c.severity || "ringan",
    })),
    matchedSymptoms: Array.isArray(raw.matched_symptoms) ? raw.matched_symptoms : [],
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [
      "Istirahat cukup dan jaga hidrasi tubuh.",
      "Perhatikan jika ada perubahan gejala.",
      "Konsultasikan dengan dokter di SiagaSehat jika gejala berlanjut.",
    ],
    isEmergency: Boolean(raw.is_emergency),
    emergencyMessage: raw.emergency_message || "",
    disclaimer: raw.disclaimer || "Hasil AI merupakan informasi awal berdasarkan gejala yang dipilih dan bukan pengganti diagnosis dari tenaga medis profesional.",
  };
}

export const assessHealthAnatomy = createServerFn({ method: "POST" })
  .validator((data: unknown) => assessmentInputSchema.parse(data))
  .handler(async ({ data }): Promise<AIAssessmentResult> => {
    const input = data as AssessmentInput;
    if (process.env.GEMINI_API_KEY?.trim()) {
      try {
        return await assessWithGemini(input);
      } catch (err) {
        console.warn("Gemini assessment failed, trying OpenAI:", err);
      }
    }

    if (process.env.OPENAI_API_KEY?.trim()) {
      return await assessWithOpenAI(input);
    }

    // Fallback static mock result if no API keys are set in environment
    return {
      summary: `Analisis awal untuk bagian tubuh ${input.regionName}. Kombinasi gejala yang Anda pilih (${input.symptoms.slice(0, 2).join(", ")}) menunjukkan pola inflamasi atau iritasi lokal.`,
      primaryCondition: {
        name: input.selectedConditions[0] || `${input.regionName} Sensitivity / Inflamasi`,
        likelihood: 80,
        reason: "Gejala yang Anda laporkan mencocokkan profil indikasi umum pada bagian ini.",
        severity: "sedang",
      },
      differentialConditions: [
        {
          name: "Ketegangan Otot / Kelelahan Lokal",
          likelihood: 45,
          reason: "Sering terjadi akibat beban aktivitas atau posisi statis.",
          severity: "ringan",
        },
      ],
      matchedSymptoms: input.symptoms,
      recommendations: [
        "Istirahat di ruangan yang nyaman dan hindari pemicu stres berlebih.",
        "Konsumsi air putih secukupnya (8 gelas sehari).",
        "Gunakan kompres hangat atau dingin sesuai tingkat kenyamanan.",
        "Segera konsultasikan dengan dokter SiagaSehat jika gejala menetap > 48 jam.",
      ],
      isEmergency: input.symptoms.some((s) => s.toLowerCase().includes("hebat") || s.toLowerCase().includes("sesak") || s.toLowerCase().includes("kaku")),
      emergencyMessage: "Beberapa gejala yang Anda pilih memerlukan evaluasi medis segera. Silakan hubungi dokter atau IGD terdekat.",
      disclaimer: "Hasil AI merupakan informasi awal berdasarkan gejala yang dipilih dan bukan pengganti diagnosis dari tenaga medis profesional.",
    };
  });
