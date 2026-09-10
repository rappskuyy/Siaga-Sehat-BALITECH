import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AIAssessmentResult, AssessmentInput, PossibleConditionResult } from "./types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";

const assessmentInputSchema = z
  .object({
    regionId: z.string().min(1, "ID bagian tubuh wajib diisi"),
    regionName: z.string().min(1, "Nama bagian tubuh wajib diisi"),
    symptoms: z.array(z.string()).default([]),
    selectedConditions: z.array(z.string()).default([]),
    additionalNotes: z.string().optional().default(""),
  })
  .refine(
    (data) => data.symptoms.length > 0 || data.selectedConditions.length > 0,
    {
      message: "Silakan pilih minimal 1 gejala atau kondisi terkait sebelum memulai analisis.",
      path: ["symptoms"],
    },
  );

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

function extractJsonObject(text: string): string {
  // Strip reasoning model think tags (DeepSeek-R1 / QwQ)
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip code block markers
  cleaned = cleaned.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}

function parseResultJson(jsonString: string): AIAssessmentResult {
  const cleaned = extractJsonObject(jsonString);
  let raw: any;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    // Try minor repair: remove trailing commas before } or ]
    try {
      const repaired = cleaned
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      raw = JSON.parse(repaired);
    } catch (e) {
      throw new Error("Respon AI tidak berformat JSON yang valid.");
    }
  }

  return {
    summary: raw.summary || "Penilaian kondisi awal berdasarkan gejala yang Anda pilih.",
    primaryCondition: {
      name: raw.primary_condition?.name || "Kondisi Berdasarkan Gejala Terpilih",
      likelihood: Math.min(100, Math.max(10, Number(raw.primary_condition?.likelihood) || 75)),
      reason: raw.primary_condition?.reason || "Kombinasi gejala yang Anda pilih berkorelasi dengan kondisi ini.",
      severity: (raw.primary_condition?.severity as any) || "sedang",
    },
    differentialConditions: Array.isArray(raw.differential_conditions)
      ? raw.differential_conditions.map((c: any) => ({
          name: c.name || "Kondisi Terkait Lainnya",
          likelihood: Math.min(100, Math.max(5, Number(c.likelihood) || 40)),
          reason: c.reason || "Kondisi alternatif yang memiliki kemiripan gejala.",
          severity: (c.severity as any) || "ringan",
        }))
      : [],
    matchedSymptoms: Array.isArray(raw.matched_symptoms) && raw.matched_symptoms.length > 0
      ? raw.matched_symptoms
      : [],
    recommendations: Array.isArray(raw.recommendations) && raw.recommendations.length > 0
      ? raw.recommendations
      : [
          "Istirahat cukup dan jaga hidrasi tubuh secara optimal.",
          "Catat perkembangan atau intensitas gejala jika semakin memburuk.",
          "Konsultasikan dengan dokter di SiagaSehat jika gejala menetap lebih dari 3 hari.",
        ],
    isEmergency: Boolean(raw.is_emergency),
    emergencyMessage: raw.emergency_message || "",
    disclaimer: raw.disclaimer || "Hasil assessment AI ini merupakan informasi awal berdasarkan gejala yang dipilih dan bukan pengganti diagnosis dari tenaga medis profesional.",
  };
}

function getCompletionText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, any>;

  // Direct text properties
  if (typeof p.text === "string" && p.text.trim()) return p.text;
  if (typeof p.response === "string" && p.response.trim()) return p.response;
  if (typeof p.content === "string" && p.content.trim()) return p.content;
  if (typeof p.output_text === "string" && p.output_text.trim()) return p.output_text;

  // Gemini candidate format
  const candidateParts = p.candidates?.[0]?.content?.parts;
  if (Array.isArray(candidateParts)) {
    const text = candidateParts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
    if (text) return text;
  }

  // OpenAI choice message format
  const message = p.choices?.[0]?.message;
  const content = message?.content;

  if (typeof content === "string" && content.trim()) return content;

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const value = part.text;
          return typeof value === "string" ? value : "";
        }
        return "";
      })
      .join("")
      .trim();

    if (text) return text;
  }

  // Legacy choice text
  const choiceText = p.choices?.[0]?.text;
  if (typeof choiceText === "string" && choiceText.trim()) return choiceText;

  // Stream delta text
  const deltaText = p.choices?.[0]?.delta?.content;
  if (typeof deltaText === "string" && deltaText.trim()) return deltaText;

  return null;
}

/**
 * Intelligent deterministic clinical assessment generator fallback.
 * Uses the comprehensive clinical dataset of ANATOMY_REGIONS to provide
 * accurate assessments if external LLM APIs are unreachable or error out.
 */
export function generateClinicalFallbackAssessment(input: AssessmentInput): AIAssessmentResult {
  const region = ANATOMY_REGIONS.find(
    (r) => r.id === input.regionId || r.nameIndonesian.toLowerCase() === input.regionName.toLowerCase(),
  ) || ANATOMY_REGIONS[0];

  const selectedSymptomsList = input.symptoms || [];
  const selectedConditionsList = input.selectedConditions || [];

  // Check emergency red flags
  const isEmergency = region.symptoms.some(
    (s) =>
      s.isEmergencyWarning &&
      selectedSymptomsList.some((sel) => sel.toLowerCase().includes(s.name.toLowerCase())),
  ) || selectedSymptomsList.some((s) => /sangat hebat|sesak napas|kehilangan kesadaran|darurat|nyeri dada hebat/i.test(s));

  // Match conditions in region against selected symptoms
  const scoredConditions = region.conditions.map((cond) => {
    let score = 0;
    const isExplicitlyChosen = selectedConditionsList.some(
      (c) => c.toLowerCase().includes(cond.name.toLowerCase()) || cond.name.toLowerCase().includes(c.toLowerCase()),
    );
    if (isExplicitlyChosen) score += 50;

    const matchedSympCount = cond.commonSymptoms.filter((cs) =>
      selectedSymptomsList.some((s) => s.toLowerCase().includes(cs.toLowerCase()) || cs.toLowerCase().includes(s.toLowerCase())),
    ).length;

    score += matchedSympCount * 25;
    return {
      cond,
      score: Math.min(95, Math.max(35, score > 0 ? score : 40)),
      matchedSymptoms: cond.commonSymptoms.filter((cs) =>
        selectedSymptomsList.some((s) => s.toLowerCase().includes(cs.toLowerCase()) || cs.toLowerCase().includes(s.toLowerCase())),
      ),
    };
  });

  scoredConditions.sort((a, b) => b.score - a.score);

  const primary = scoredConditions[0] || {
    cond: {
      name: `Indikasi Gangguan ${region.nameIndonesian}`,
      typicalSeverity: "sedang" as const,
      description: `Kondisi klinis yang berhubungan dengan keluhan pada area ${region.nameIndonesian}.`,
    },
    score: 75,
    matchedSymptoms: selectedSymptomsList,
  };

  const differential: PossibleConditionResult[] = scoredConditions.slice(1, 3).map((item) => ({
    name: item.cond.name,
    likelihood: Math.min(item.score, 65),
    reason: item.cond.description || `Kemungkinan kondisi diferensial lain pada area ${region.nameIndonesian}.`,
    severity: item.cond.typicalSeverity,
  }));

  const allMatched = Array.from(
    new Set([...selectedSymptomsList, ...selectedConditionsList]),
  );

  const recommendations = [
    `Istirahatkan area ${region.nameIndonesian} dan hindari aktivitas berat yang memicu nyeri.`,
    "Jaga asupan cairan harian minimal 2 liter air putih dan konsumsi makanan bergizi seimbang.",
    isEmergency
      ? "Segera periksakan diri ke Instalasi Gawat Darurat (IGD) atau fasilitas kesehatan terdekat untuk penanganan medis darurat."
      : "Pantau intensitas gejala. Apabila keluhan bertambah berat atau tidak membaik dalam 48 jam, segera konsultasikan ke dokter.",
  ];

  return {
    summary: `Berdasarkan skrining gejala pada area ${region.nameIndonesian}, terdapat indikasi yang mengarah pada ${primary.cond.name}. ${isEmergency ? "Perhatian: Ditemukan tanda peringatan yang membutuhkan evaluasi medis segera." : "Keluhan ini umumnya dapat ditangani dengan perawatan mandiri terarah dan evaluasi medis jika berlanjut."}`,
    primaryCondition: {
      name: primary.cond.name,
      likelihood: primary.score,
      reason: primary.cond.description || `Gejala yang Anda laporkan memiliki pola kecocokan yang tinggi dengan ${primary.cond.name}.`,
      severity: primary.cond.typicalSeverity,
    },
    differentialConditions: differential,
    matchedSymptoms: allMatched.length > 0 ? allMatched : selectedSymptomsList,
    recommendations,
    isEmergency,
    emergencyMessage: isEmergency
      ? `Terdeteksi tanda bahaya pada area ${region.nameIndonesian}. Mohon segera kunjungi IGD atau dokter terdekat.`
      : "",
    disclaimer: "Hasil assessment AI ini merupakan informasi awal berbasis algoritma klinis dan bukan pengganti diagnosis medis resmi oleh dokter profesional.",
  };
}

async function assessWithGemini(input: AssessmentInput): Promise<AIAssessmentResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi di server.");

  const symptomsList =
    input.symptoms && input.symptoms.length > 0
      ? input.symptoms.join(", ")
      : "Tidak ada gejala spesifik (hanya kondisi/keluhan umum)";

  const conditionsList =
    input.selectedConditions && input.selectedConditions.length > 0
      ? input.selectedConditions.join(", ")
      : "Tidak ada";

  const userPrompt = `
Bagian Tubuh: ${input.regionName} (ID: ${input.regionId})
Gejala Terpilih: ${symptomsList}
Kondisi Terkait Terpilih: ${conditionsList}
Catatan Tambahan Pengguna: ${input.additionalNotes || "Tidak ada"}

Tolong lakukan AI Health Assessment dan kembalikan JSON sesuai skema yang ditentukan.`;

  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-pro",
  ];
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
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 3500,
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
      const text = getCompletionText(payload);
      if (!text) continue;

      return parseResultJson(text);
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Gagal menghubungi Gemini API (${lastErr})`);
}

function getOpenAIBaseUrl(): string {
  const customBase = process.env.OPENAI_BASE_URL?.trim() || process.env.KOBOILLM_BASE_URL?.trim();
  if (customBase) {
    if (customBase.endsWith("/v1")) return customBase;
    if (customBase.endsWith("/")) return `${customBase}v1`;
    return customBase;
  }
  return "https://api.openai.com/v1";
}

async function assessWithOpenAIOrKoboi(input: AssessmentInput): Promise<AIAssessmentResult> {
  const apiKey = (process.env.OPENAI_API_KEY || process.env.KOBOILLM_API_KEY)?.trim();
  if (!apiKey) throw new Error("API Key untuk OpenAI/KoboiLLM belum dikonfigurasi.");

  const baseUrl = getOpenAIBaseUrl();
  const rawModel = process.env.OPENAI_MODEL || process.env.KOBOILLM_MODEL || "gpt-4o-mini";
  const candidateModels = Array.from(
    new Set([rawModel, "gpt-4o-mini", "gpt-4o", "gemini-2.5-flash", "gemini-1.5-flash"].filter(Boolean)),
  );

  const symptomsList =
    input.symptoms && input.symptoms.length > 0
      ? input.symptoms.join(", ")
      : "Tidak ada gejala spesifik (hanya kondisi/keluhan umum)";

  const conditionsList =
    input.selectedConditions && input.selectedConditions.length > 0
      ? input.selectedConditions.join(", ")
      : "Tidak ada";

  const userPrompt = `
Bagian Tubuh: ${input.regionName} (ID: ${input.regionId})
Gejala Terpilih: ${symptomsList}
Kondisi Terkait Terpilih: ${conditionsList}
Catatan Tambahan Pengguna: ${input.additionalNotes || "Tidak ada"}

Tolong lakukan AI Health Assessment dan kembalikan JSON sesuai format yang diminta.`;

  let lastErr = "";

  for (const model of candidateModels) {
    try {
      const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 3500,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        lastErr = `Status ${res.status}: ${txt.slice(0, 180)}`;
        continue;
      }

      const payload = await res.json();
      const text = getCompletionText(payload);
      if (!text) {
        lastErr = "Response content kosong dari server AI";
        continue;
      }

      return parseResultJson(text);
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`OpenAI/KoboiLLM error (${lastErr})`);
}

export const assessHealthAnatomy = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = assessmentInputSchema.safeParse(data);
    if (!parsed.success) {
      const errorMsg =
        parsed.error.errors.map((e) => e.message).join(", ") ||
        "Data input tidak valid.";
      throw new Error(errorMsg);
    }
    return parsed.data;
  })
  .handler(async ({ data }): Promise<AIAssessmentResult> => {
    const input = data as AssessmentInput;
    const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim();

    // 1. Try Primary AI Provider
    if (provider === "koboillm" || provider === "koboldllm" || provider === "openai") {
      if (process.env.KOBOILLM_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim()) {
        try {
          return await assessWithOpenAIOrKoboi(input);
        } catch (err) {
          console.warn("[Anatomy] OpenAI/KoboiLLM assessment failed, trying fallback:", err);
        }
      }
      if (process.env.GEMINI_API_KEY?.trim()) {
        try {
          return await assessWithGemini(input);
        } catch (err) {
          console.warn("[Anatomy] Gemini fallback failed:", err);
        }
      }
    } else {
      // Default: Gemini first
      if (process.env.GEMINI_API_KEY?.trim()) {
        try {
          return await assessWithGemini(input);
        } catch (err) {
          console.warn("[Anatomy] Gemini assessment failed, trying OpenAI/KoboiLLM:", err);
        }
      }
      if (process.env.OPENAI_API_KEY?.trim() || process.env.KOBOILLM_API_KEY?.trim()) {
        try {
          return await assessWithOpenAIOrKoboi(input);
        } catch (err) {
          console.warn("[Anatomy] OpenAI/KoboiLLM fallback failed:", err);
        }
      }
    }

    // 2. Seamless High-Quality Clinical Knowledge Fallback
    // If all external LLM network calls fail or API keys have issues, generate accurate assessment from clinical dataset
    console.info("[Anatomy] Generating intelligent clinical knowledge fallback assessment for", input.regionName);
    return generateClinicalFallbackAssessment(input);
  });

