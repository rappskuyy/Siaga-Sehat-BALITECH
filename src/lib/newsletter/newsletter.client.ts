import emailjs from "@emailjs/browser";
import { supabase } from "@/lib/supabase/client";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_gw761os";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_7i0lde5";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "VDTICPvoQZHrl4vBY";

export interface SubscribeParams {
  email: string;
  nama?: string;
}

/**
 * Menyimpan subscriber ke tabel Supabase (subscripsion)
 * dan langsung mengirim template email konfirmasi via EmailJS (Browser Client).
 */
export async function subscribeNewsletterClient({ email, nama }: SubscribeParams) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanNama = nama?.trim() || "Sahabat Sehat";

  // 1. Simpan ke Supabase
  let savedToDb = false;
  const tableCandidates = ["subscripsion", "subscriptions", "subscribers", "subscription"];

  for (const table of tableCandidates) {
    try {
      // Cek apakah sudah pernah terdaftar
      const { data: existing } = await supabase
        .from(table)
        .select("email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existing) {
        savedToDb = true;
        break;
      }

      // Coba insert dengan nama dan created_at
      const { error: insertErr } = await supabase
        .from(table)
        .insert([{ email: cleanEmail, nama: cleanNama, created_at: new Date().toISOString() }]);

      if (!insertErr) {
        savedToDb = true;
        break;
      } else {
        // Fallback jika tabel hanya memiliki kolom email
        const { error: simpleErr } = await supabase.from(table).insert([{ email: cleanEmail }]);
        if (!simpleErr) {
          savedToDb = true;
          break;
        }
      }
    } catch {
      // Lanjutkan ke kandidat nama tabel berikutnya
    }
  }

  // 2. Kirim email via EmailJS langsung dari Browser
  let emailSent = false;
  let emailError = "";

  try {
    const templateParams: Record<string, unknown> = {
      to_email: cleanEmail,
      email: cleanEmail,
      user_email: cleanEmail,
      recipient_email: cleanEmail,
      to_name: cleanNama,
      name: cleanNama,
      user_name: cleanNama,
      subject: "Selamat Datang di Newsletter SiagaSehat!",
      title: "Selamat Datang di Newsletter SiagaSehat!",
      message:
        "Terima kasih telah bergabung dengan komunitas SiagaSehat! Anda sekarang akan menerima informasi kesehatan terpercaya, tips pencegahan penyakit, dan update inovasi AI medis langsung di kotak masuk Anda.",
      message_content:
        "Terima kasih telah bergabung dengan komunitas SiagaSehat! Anda sekarang akan menerima informasi kesehatan terpercaya, tips pencegahan penyakit, dan update inovasi AI medis langsung di kotak masuk Anda.",
      time: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      year: new Date().getFullYear(),
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY,
    );

    if (response.status === 200 || response.text === "OK") {
      emailSent = true;
    }
  } catch (err: any) {
    console.error("[EmailJS Client Send Error]:", err);
    emailError = err?.text || err?.message || "Gagal mengirim email via EmailJS";
  }

  return {
    success: true,
    savedToDb,
    emailSent,
    emailError,
    message: emailSent
      ? "Terima kasih telah berlangganan! Pesan konfirmasi telah dikirim ke email Anda."
      : "Terima kasih telah berlangganan newsletter SiagaSehat!",
  };
}
