import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { SCAN_RESULT_JSON_SCHEMA, type ScanResult } from "./types";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const scanInputSchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(ALLOWED_MEDIA_TYPES),
});

const SYSTEM_PROMPT = `Kamu adalah asisten skrining kesehatan berbasis AI bernama "SiagaSehat Scanner". Tugasmu menganalisis foto kondisi kulit/tubuh yang diunggah pengguna dan memberikan informasi edukatif awal — BUKAN diagnosis medis resmi.

Aturan penting:
- Selalu jawab dalam Bahasa Indonesia yang jelas dan mudah dipahami orang awam.
- Jika gambar tidak menunjukkan kondisi kesehatan/kulit yang bisa dianalisis (misalnya foto tidak relevan, buram, atau bukan bagian tubuh), set "gambar_dapat_dianalisis" ke false dan jelaskan di "ringkasan" apa yang perlu difoto ulang. Isi field array dengan array kosong dan field lain dengan nilai netral.
- "tingkat_bahaya": "tinggi" untuk kondisi yang berpotensi serius/butuh penanganan cepat, "sedang" untuk kondisi yang perlu diperhatikan tapi tidak darurat, "rendah" untuk kondisi ringan/umum.
- Jika "tingkat_bahaya" adalah "tinggi", WAJIB set "harus_ke_dokter" ke true dan jelaskan alasannya dengan tegas namun tidak menakut-nakuti.
- "obat_rekomendasi" HANYA boleh berisi obat bebas/bebas terbatas (OTC) yang umum dijual di apotek Indonesia (contoh: parasetamol, salep antiseptik, antihistamin topikal, dsb) dengan dosis dewasa umum. JANGAN merekomendasikan obat keras/resep. Selalu tambahkan di "catatan" bahwa dosis perlu disesuaikan dan sebaiknya dikonfirmasi ke apoteker/dokter, terutama untuk anak-anak, ibu hamil/menyusui, dan penderita penyakit kronis.
- "obat_herbal" berisi bahan alami umum (misalnya jahe, kunyit, lidah buaya) beserta cara pakainya secara singkat dan aman.
- Jangan pernah membuat diagnosis pasti 100% — gunakan bahasa "kemungkinan", "berdasarkan gambar terlihat seperti", dsb.
- Keluarkan HANYA data terstruktur sesuai skema yang diberikan, tanpa teks tambahan di luar skema.`;

export const analyzeHealthImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => scanInputSchema.parse(data))
  .handler(async ({ data }): Promise<ScanResult> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY belum dikonfigurasi di server. Tambahkan API key Anthropic ke file .env untuk mengaktifkan fitur scan AI.",
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: {
          type: "json_schema",
          schema: SCAN_RESULT_JSON_SCHEMA,
        },
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: data.mediaType,
                data: data.imageBase64,
              },
            },
            {
              type: "text",
              text: "Analisis foto ini dan berikan hasil skrining kesehatan awal sesuai skema yang telah ditentukan.",
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      throw new Error(
        "AI menolak menganalisis gambar ini. Coba unggah foto yang lebih jelas dan relevan dengan kondisi kesehatan.",
      );
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI tidak mengembalikan hasil analisis yang valid.");
    }

    try {
      return JSON.parse(textBlock.text) as ScanResult;
    } catch {
      throw new Error("Gagal membaca hasil analisis dari AI. Silakan coba lagi.");
    }
  });
