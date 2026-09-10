import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Inisialisasi Supabase client di server
 */
function getSupabaseServerClient() {
  const url =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

interface SendEmailJSParams {
  toEmail: string;
  toName?: string;
  subject?: string;
  message?: string;
  customParams?: Record<string, unknown>;
}

/**
 * Mengirim email menggunakan EmailJS REST API
 * (Menggunakan API Key, Service ID, Template ID dari .env)
 */
async function sendEmailWithEmailJS(params: SendEmailJSParams): Promise<{ sent: boolean; error?: string }> {
  const serviceId = (process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID || "").trim();
  const templateId = (process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID || "").trim();
  const publicKey = (process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY || "").trim();
  const privateKey = (process.env.EMAILJS_PRIVATE_KEY || process.env.VITE_EMAILJS_PRIVATE_KEY || "").trim();

  if (!serviceId || !templateId || !publicKey) {
    console.warn("[EmailJS] Konfigurasi EmailJS belum lengkap di .env (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY).");
    return { sent: false, error: "Konfigurasi EmailJS belum lengkap di server." };
  }

  const templateParams: Record<string, unknown> = {
    to_email: params.toEmail,
    email: params.toEmail,
    user_email: params.toEmail,
    recipient_email: params.toEmail,
    to_name: params.toName || "Sahabat Sehat",
    name: params.toName || "Sahabat Sehat",
    user_name: params.toName || "Sahabat Sehat",
    subject: params.subject || "Pembaruan Kesehatan SiagaSehat",
    title: params.subject || "Pembaruan Kesehatan SiagaSehat",
    message: params.message || "Terima kasih telah berlangganan newsletter SiagaSehat! Anda akan menerima update tips kesehatan & inovasi AI medis secara berkala.",
    message_content: params.message || "",
    time: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    year: new Date().getFullYear(),
    ...params.customParams,
  };

  const payload: Record<string, unknown> = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };

  // Jika private key tersedia di .env, sertakan sebagai accessToken untuk otentikasi server
  if (privateKey) {
    payload.accessToken = privateKey;
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[EmailJS Error]:", res.status, errText);
      return { sent: false, error: errText };
    }

    return { sent: true };
  } catch (err: any) {
    console.error("[EmailJS Exception]:", err);
    return { sent: false, error: err?.message || "Gagal mengirim email via EmailJS" };
  }
}

// -------------------------------------------------------------
// 1. Server Function: Berlangganan Newsletter (Subscribe)
// -------------------------------------------------------------
const subscribeInputSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  nama: z.string().optional(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = subscribeInputSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.errors.map((e) => e.message).join(", ") || "Format email tidak valid.");
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    const { email, nama } = data;
    const cleanEmail = email.trim().toLowerCase();
    const cleanNama = nama?.trim() || "Sahabat Sehat";

    const supabase = getSupabaseServerClient();
    let savedToDb = false;

    if (supabase) {
      // Coba tabel yang mungkin dipakai: subscripsion, subscriptions, subscribers, subscription
      const tableCandidates = ["subscripsion", "subscriptions", "subscribers", "subscription"];

      for (const table of tableCandidates) {
        try {
          // Cek apakah email sudah terdaftar
          const { data: existing } = await supabase
            .from(table)
            .select("email")
            .eq("email", cleanEmail)
            .maybeSingle();

          if (existing) {
            savedToDb = true;
            break; // Email sudah pernah tersimpan
          }

          // Insert data baru (dengan kolom nama & created_at)
          const { error: insertErr } = await supabase
            .from(table)
            .insert([{ email: cleanEmail, nama: cleanNama, created_at: new Date().toISOString() }]);

          if (!insertErr) {
            savedToDb = true;
            break;
          } else {
            // Fallback jika tabel hanya memiliki kolom email
            const { error: simpleErr } = await supabase
              .from(table)
              .insert([{ email: cleanEmail }]);

            if (!simpleErr) {
              savedToDb = true;
              break;
            }
          }
        } catch {
          // Lanjutkan ke kandidat tabel berikutnya
          continue;
        }
      }
    }

    // Kirim pesan otomatis EmailJS ke Gmail/Email pendaftar
    const emailResult = await sendEmailWithEmailJS({
      toEmail: cleanEmail,
      toName: cleanNama,
      subject: "Selamat Datang di Newsletter SiagaSehat!",
      message:
        "Terima kasih telah bergabung dengan komunitas SiagaSehat! Anda sekarang akan menerima informasi kesehatan terpercaya, tips pencegahan penyakit, dan update inovasi AI medis langsung di kotak masuk Anda.",
    });

    return {
      success: true,
      savedToDb,
      emailSent: emailResult.sent,
      message: emailResult.sent
        ? "Terima kasih telah berlangganan! Pesan konfirmasi telah dikirim ke email Anda."
        : "Terima kasih telah berlangganan newsletter SiagaSehat!",
    };
  });

// -------------------------------------------------------------
// 2. Server Function: Broadcast Pesan ke Seluruh Subscriber
// -------------------------------------------------------------
const broadcastInputSchema = z.object({
  subject: z.string().min(1, "Subjek broadcast tidak boleh kosong"),
  messageContent: z.string().min(1, "Konten pesan broadcast tidak boleh kosong"),
});

export const broadcastNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = broadcastInputSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.errors.map((e) => e.message).join(", ") || "Data broadcast tidak valid.");
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    const { subject, messageContent } = data;
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      throw new Error("Supabase URL / Key belum dikonfigurasi di server.");
    }

    // Ambil data subscriber
    let subscribers: { email: string; nama?: string }[] = [];
    const tableCandidates = ["subscripsion", "subscriptions", "subscribers", "subscription"];

    for (const table of tableCandidates) {
      const { data: rows, error } = await supabase.from(table).select("email, nama");
      if (!error && rows && rows.length > 0) {
        subscribers = rows
          .filter((r) => r.email && r.email.includes("@"))
          .map((r) => ({ email: r.email.trim().toLowerCase(), nama: r.nama }));
        if (subscribers.length > 0) break;
      }
    }

    if (subscribers.length === 0) {
      return {
        success: false,
        totalSubscribers: 0,
        totalSent: 0,
        totalFailed: 0,
        message: "Belum ada subscriber terdaftar di database Supabase.",
      };
    }

    // Filter email yang unik
    const uniqueSubscribersMap = new Map<string, string | undefined>();
    subscribers.forEach((sub) => uniqueSubscribersMap.set(sub.email, sub.nama));

    let totalSent = 0;
    let totalFailed = 0;

    // Kirim email broadcast satu per satu via EmailJS
    for (const [email, nama] of uniqueSubscribersMap.entries()) {
      const res = await sendEmailWithEmailJS({
        toEmail: email,
        toName: nama,
        subject,
        message: messageContent,
      });

      if (res.sent) {
        totalSent++;
      } else {
        totalFailed++;
      }
    }

    return {
      success: totalSent > 0,
      totalSubscribers: uniqueSubscribersMap.size,
      totalSent,
      totalFailed,
      message: `Broadcast selesai. Terkirim: ${totalSent} dari ${uniqueSubscribersMap.size} subscriber.`,
    };
  });