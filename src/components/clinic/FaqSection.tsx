import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircleHeart, ScanLine, ShieldCheck } from "lucide-react";
import { Reveal } from "./Reveal";

type CategoryKey = "umum" | "scan" | "konsultasi" | "akun";

interface Category {
  key: CategoryKey;
  label: string;
  icon: typeof HelpCircle;
  color: string;
}

const CATEGORIES: Category[] = [
  { key: "umum", label: "Umum", icon: HelpCircle, color: "var(--color-clinic-blue-dark)" },
  { key: "scan", label: "Scan AI", icon: ScanLine, color: "var(--color-siaga-scan-dim)" },
  {
    key: "konsultasi",
    label: "Konsultasi AI",
    icon: MessageCircleHeart,
    color: "var(--color-siaga-consult-dim)",
  },
  { key: "akun", label: "Akun & Data", icon: ShieldCheck, color: "#059669" },
];

const FAQS: Record<CategoryKey, Array<{ q: string; a: string }>> = {
  umum: [
    {
      q: "Apakah SiagaSehat menggantikan dokter?",
      a: "Tidak. SiagaSehat membantu triase awal — mengenali kemungkinan kondisi dan tingkat urgensinya — agar kamu bisa memutuskan langkah selanjutnya dengan lebih cepat. Untuk diagnosis dan pengobatan resmi, tetap perlu konsultasi dengan dokter berlisensi.",
    },
    {
      q: "Apakah layanan ini berbayar?",
      a: "Scan AI dan Konsultasi AI dasar dapat dicoba secara gratis. Beberapa fitur lanjutan seperti riwayat tak terbatas dan konsultasi dokter langsung tersedia melalui paket berbayar.",
    },
    {
      q: "Seberapa cepat saya mendapat hasil?",
      a: "Rata-rata di bawah 30 detik untuk Scan AI, dan hampir instan untuk setiap balasan di Konsultasi AI — tergantung kecepatan koneksi internet kamu.",
    },
  ],
  scan: [
    {
      q: "Jenis foto apa yang bisa dianalisis Scan AI?",
      a: "Foto kondisi kulit, luka luar, ruam, atau bagian tubuh yang tampak bermasalah. Pastikan foto diambil dengan pencahayaan cukup dan fokus jelas pada area yang dikeluhkan.",
    },
    {
      q: "Seberapa akurat hasil Scan AI?",
      a: "Model kami mencapai skor akurasi triase awal sekitar 98% berdasarkan evaluasi berkala tim medis, namun hasil tetap berupa estimasi awal — bukan diagnosis final.",
    },
    {
      q: "Apakah foto saya disimpan dengan aman?",
      a: "Ya. Foto hanya diproses untuk analisis dan hasil ringkasannya disimpan di riwayat akunmu dengan proteksi Row Level Security — hanya kamu yang bisa mengaksesnya.",
    },
  ],
  konsultasi: [
    {
      q: "Bagaimana cara kerja peta tubuh interaktif?",
      a: "Ketuk bagian tubuh yang terasa sakit pada diagram, dan pilihanmu langsung terkirim ke chat. AI akan menindaklanjuti dengan pertanyaan seputar tingkat keparahan dan gejala penyerta.",
    },
    {
      q: "Bisakah saya melampirkan riwayat penyakit?",
      a: "Bisa. Ceritakan riwayat penyakit, alergi, atau obat yang sedang dikonsumsi langsung di chat — AI akan mempertimbangkannya dalam rekomendasi.",
    },
    {
      q: "Apa yang terjadi jika gejala saya termasuk darurat?",
      a: "AI akan langsung menyarankan kamu ke IGD terdekat tanpa menunggu informasi tambahan, jika terdeteksi tanda-tanda bahaya seperti nyeri dada hebat atau sesak napas berat.",
    },
  ],
  akun: [
    {
      q: "Apakah saya wajib membuat akun?",
      a: "Tidak wajib untuk mencoba sekali, tapi disarankan — dengan akun, riwayat scan dan konsultasimu tersimpan rapi dan bisa dipantau perkembangannya dari waktu ke waktu.",
    },
    {
      q: "Bagaimana data kesehatan saya dilindungi?",
      a: "Semua data disimpan di Supabase dengan Row Level Security aktif di setiap tabel — artinya secara teknis hanya akunmu sendiri yang bisa membaca atau mengubah datamu.",
    },
    {
      q: "Bisakah saya menghapus riwayat saya?",
      a: "Bisa. Kamu dapat menghapus entri riwayat scan maupun konsultasi kapan pun langsung dari halaman profil.",
    },
  ],
};

function AccordionItem({ q, a, accent }: { q: string; a: string; accent: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white transition-shadow hover:shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[color:var(--color-clinic-ink)]">{q}</span>
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-transform duration-300"
          style={{
            backgroundColor: open ? accent : "rgba(0,0,0,0.04)",
            color: open ? "white" : "var(--color-clinic-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      <div className={`accordion-grid ${open ? "accordion-grid-open" : ""}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [category, setCategory] = useState<CategoryKey>("umum");
  const active = CATEGORIES.find((c) => c.key === category)!;

  return (
    <section
      id="faq"
      className="relative w-full overflow-hidden bg-[color:var(--color-clinic-blue-soft)]/40 px-6 py-16 md:px-10 md:py-24"
    >
      <span className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[color:var(--color-siaga-scan)]/[0.06] blur-3xl" />
      <span className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-[color:var(--color-siaga-consult)]/[0.07] blur-3xl" />

      <Reveal className="relative mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)] shadow-sm">
          <HelpCircle className="h-3 w-3" />
          Pertanyaan Umum
        </span>
        <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-[color:var(--color-clinic-ink)] md:text-5xl">
          Masih ragu? Ini yang paling sering ditanyakan
        </h2>
      </Reveal>

      {/* Category pills */}
      <Reveal
        delay="0.05s"
        className="relative mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-center gap-2"
      >
        {CATEGORIES.map((c) => {
          const isActive = c.key === category;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300"
              style={{
                backgroundColor: isActive ? c.color : "white",
                color: isActive ? "white" : "var(--color-clinic-muted)",
                borderColor: isActive ? c.color : "rgba(0,0,0,0.08)",
              }}
            >
              <c.icon className="h-3.5 w-3.5" />
              {c.label}
            </button>
          );
        })}
      </Reveal>

      {/* Accordion list — crossfades when switching category */}
      <div
        key={category}
        className="animate-fade-up relative mx-auto mt-8 flex max-w-2xl flex-col gap-3"
        style={{ animationDuration: "0.4s" }}
      >
        {FAQS[category].map((item) => (
          <AccordionItem key={item.q} q={item.q} a={item.a} accent={active.color} />
        ))}
      </div>
    </section>
  );
}
