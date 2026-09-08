import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Flame,
  Loader2,
  MapPin,
  MessageSquare,
  RotateCcw,
  ScanLine,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Thermometer,
  User as UserIcon,
  Wind,
} from "lucide-react";

import { chatWithAI } from "@/lib/ai/chat.server";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/clinic/Footer";

export const Route = createFileRoute("/consultation")({
  validateSearch: (search: Record<string, unknown>): { anatomy?: string; scan?: string } => ({
    anatomy: typeof search.anatomy === "string" ? search.anatomy : undefined,
    scan: typeof search.scan === "string" ? search.scan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Konsultasi | Siaga Sehat" },
      {
        name: "description",
        content:
          "Konsultasi interaktif dengan asisten kesehatan SiagaSehat. Jelaskan keluhan atau gejala Anda dan dapatkan analisis kesehatan terpercaya.",
      },
    ],
  }),
  component: ConsultationPage,
});

type ActionCardType = {
  type: "maps" | "scanner" | "anatomy";
  title: string;
  description: string;
  buttonText: string;
  href: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  time?: string;
  actionCard?: ActionCardType;
};

const QUICK_PROMPTS = [
  {
    icon: MapPin,
    title: "Cari Apotek Terdekat",
    desc: "Bisa bantu carikan lokasi apotek terdekat dari posisi saya?",
  },
  {
    icon: ScanLine,
    title: "Scan Foto / Resep",
    desc: "Saya ingin melakukan scan foto kondisi fisik atau kemasan obat.",
  },
  {
    icon: UserIcon,
    title: "Pilih Bagian Tubuh",
    desc: "Saya ingin memilih lokasi keluhan atau organ tubuh yang sakit.",
  },
  {
    icon: Thermometer,
    title: "Demam & Lemas",
    desc: "Demam 2 hari disertai pusing dan badan lemas",
  },
  {
    icon: Activity,
    title: "Mual & Lambung",
    desc: "Mual dan nyeri pada ulu hati setelah makan",
  },
  {
    icon: Brain,
    title: "Sakit Kepala",
    desc: "Sakit kepala berdenyut di salah satu sisi",
  },
];

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function detectIntentAction(text: string): ActionCardType | undefined {
  const lower = text.toLowerCase();
  if (
    lower.includes("apotek") ||
    lower.includes("farmasi") ||
    lower.includes("peta") ||
    lower.includes("maps") ||
    lower.includes("lokasi apotek")
  ) {
    return {
      type: "maps",
      title: "Peta Apotek Terdekat",
      description: "Temukan lokasi apotek dan faskes terdekat di sekitar Anda lengkap dengan rute navigasi.",
      buttonText: "Buka Peta Apotek Terdekat",
      href: "/maps",
    };
  }
  if (
    lower.includes("scan") ||
    lower.includes("pindai") ||
    lower.includes("foto") ||
    lower.includes("kamera") ||
    lower.includes("gambar")
  ) {
    return {
      type: "scanner",
      title: "Pemindai AI (Scanner)",
      description: "Unggah atau foto resep, kemasan obat, atau kondisi kulit untuk analisis instan.",
      buttonText: "Buka Fitur Scanner",
      href: "/scanner",
    };
  }
  if (
    lower.includes("tubuh") ||
    lower.includes("anatomi") ||
    lower.includes("organ") ||
    lower.includes("bagian tubuh")
  ) {
    return {
      type: "anatomy",
      title: "Eksplorasi Anatomi Interaktif",
      description: "Pilih organ atau lokasi keluhan pada model anatomi tubuh interaktif.",
      buttonText: "Buka Model Anatomi",
      href: "/anatomy",
    };
  }
  return undefined;
}

function ActionCard({ card }: { card: ActionCardType }) {
  const navigate = useNavigate();
  const Icon = card.type === "maps" ? MapPin : card.type === "scanner" ? ScanLine : UserIcon;

  return (
    <div className="mt-3 rounded-2xl border border-black/10 bg-slate-50 p-3.5 shadow-2xs text-left">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-xs">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)]">{card.title}</h4>
          <p className="text-[11px] text-[color:var(--color-clinic-muted)] leading-snug">{card.description}</p>
        </div>
      </div>
      <Button
        type="button"
        onClick={() => navigate({ to: card.href as any })}
        className="w-full h-8.5 mt-1 gap-1.5 rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-semibold hover:bg-[color:var(--color-clinic-blue-dark)] cursor-pointer shadow-xs"
      >
        <span>{card.buttonText}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`mb-3 sm:mb-4 flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-xs mb-0.5">
          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[88%] sm:max-w-[78%]`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
            isUser
              ? "rounded-br-xs bg-[color:var(--color-clinic-blue)] text-white font-normal"
              : "rounded-bl-xs bg-white text-[color:var(--color-clinic-ink)] border border-black/5"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{message.text}</div>
          {message.actionCard && <ActionCard card={message.actionCard} />}
        </div>

        {message.time && (
          <span className="mt-1 px-1 text-[9px] sm:text-[10px] text-[color:var(--color-clinic-muted)]">
            {message.time}
          </span>
        )}
      </div>

      {isUser && (
        <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-slate-200 text-slate-700 shadow-2xs mb-0.5">
          <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      )}
    </div>
  );
}

function ConsultationPage() {
  const chat = useServerFn(chatWithAI);
  const { user } = useAuth();
  const { anatomy, scan } = useSearch({ from: "/consultation" });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedAnatomyContext, setParsedAnatomyContext] = useState<{
    regionName?: string;
    symptomsCount?: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const initialContextSent = useRef(false);
  const initialScanContextSent = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Auto scroll on new messages, loading state, or visual viewport resize (mobile keyboard popups)
  useEffect(() => {
    scrollToBottom("smooth");

    const handleViewportResize = () => {
      scrollToBottom("auto");
    };

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
      window.visualViewport.addEventListener("scroll", handleViewportResize);
    }

    return () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
        window.visualViewport.removeEventListener("scroll", handleViewportResize);
      }
    };
  }, [messages, loading, scrollToBottom]);

  // Handle mobile input focus when user opens software keyboard
  const handleInputFocus = () => {
    scrollToBottom("smooth");
    setTimeout(() => scrollToBottom("smooth"), 100);
    setTimeout(() => scrollToBottom("smooth"), 300);
  };

  const buildContext = (allMessages: ChatMessage[]) =>
    allMessages
      .slice(-10)
      .map((m) => `${m.role === "user" ? "Pengguna" : "Asisten"}: ${m.text}`)
      .join("\n");

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = { role: "user", text, time: formatTime() };
      const next = messages.concat(userMsg);
      setMessages(next);
      setLoading(true);

      const intentCard = detectIntentAction(text);

      try {
        const prompt = `Kamu adalah Asisten Kesehatan SiagaSehat yang ramah, empati, dan profesional dalam Bahasa Indonesia. Berikut riwayat percakapan sejauh ini:\n${buildContext(
          next,
        )}\n\nLanjutkan percakapan secara natural. Jika pengguna menanyakan apotek/lokasi, jelaskan bahwa mereka bisa membuka Peta Lokasi. Jika pengguna menanyakan scan obat/kulit, sebutkan fitur Scanner. Jika pengguna ingin memilih area tubuh yang sakit, rekomendasikan fitur Anatomi. Jika informasi gejala belum lengkap, tanyakan secara sopan. Jika sudah cukup, berikan Analisis Awal, Tingkat Risiko, dan Rekomendasi Tindakan yang aman.`;
        const res = await chat({ data: { prompt } });
        const reply = res?.reply?.trim() || "Maaf, saya tidak mendapatkan respons. Silakan coba lagi.";
        const assistantMsg: ChatMessage = {
          role: "assistant",
          text: reply,
          time: formatTime(),
          actionCard: intentCard || detectIntentAction(reply),
        };
        setMessages((m) => m.concat(assistantMsg));
      } catch {
        setMessages((m) =>
          m.concat({
            role: "assistant",
            text: "Terjadi gangguan saat menghubungi sistem. Silakan coba kirim kembali.",
            time: formatTime(),
            actionCard: intentCard,
          }),
        );
      } finally {
        setLoading(false);
      }
    },
    [chat, messages],
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage(text);
  };

  const handleResetChat = () => {
    setMessages([]);
    setInput("");
    setParsedAnatomyContext(null);
  };

  useEffect(() => {
    if (!anatomy || initialContextSent.current) return;

    let context: {
      regionName?: string;
      selectedSymptoms?: string[];
      selectedConditions?: string[];
      additionalNotes?: string;
      primaryCondition?: string;
    };
    try {
      context = JSON.parse(anatomy);
    } catch {
      return;
    }

    initialContextSent.current = true;
    setParsedAnatomyContext({
      regionName: context.regionName,
      symptomsCount: context.selectedSymptoms?.length || 0,
    });

    const details = [
      `Bagian tubuh: ${context.regionName || "tidak disebutkan"}`,
      `Gejala yang dirasakan: ${context.selectedSymptoms?.join(", ") || "tidak ada"}`,
      `Kondisi yang dicurigai: ${context.selectedConditions?.join(", ") || "tidak ada"}`,
      context.additionalNotes ? `Catatan tambahan: ${context.additionalNotes}` : "",
      context.primaryCondition ? `Hasil awal: ${context.primaryCondition}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    void sendMessage(
      `Saya baru selesai memilih keluhan pada organ ${context.regionName || ""} di halaman Anatomi. Berikut rangkuman data saya:\n${details}\n\nTolong bantu periksa keluhan ini, tanyakan hal yang perlu diketahui, dan berikan rekomendasi medis awal yang aman.`,
    );
  }, [anatomy, sendMessage]);

  useEffect(() => {
    if (!scan || initialScanContextSent.current) return;

    let context: {
      namaPenyakit?: string;
      ringkasan?: string;
      tingkatBahaya?: string;
      tingkatKeyakinan?: string;
      penyebab?: string[];
      pencegahan?: string[];
      alasanKeDokter?: string;
      catatan?: string;
    };
    try {
      context = JSON.parse(scan);
    } catch {
      return;
    }

    initialScanContextSent.current = true;
    const details = [
      `Nama kondisi yang terdeteksi: ${context.namaPenyakit || "tidak disebutkan"}`,
      `Ringkasan: ${context.ringkasan || "tidak tersedia"}`,
      `Tingkat risiko: ${context.tingkatBahaya || "tidak tersedia"}`,
      `Tingkat keyakinan: ${context.tingkatKeyakinan || "tidak tersedia"}`,
      context.penyebab?.length ? `Kemungkinan penyebab:\n- ${context.penyebab.join("\n- ")}` : "",
      context.pencegahan?.length ? `Pencegahan mandiri:\n- ${context.pencegahan.join("\n- ")}` : "",
      context.alasanKeDokter ? `Alasan perlu ke dokter: ${context.alasanKeDokter}` : "",
      context.catatan ? `Catatan tambahan: ${context.catatan}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    void sendMessage(
      `Saya baru selesai melakukan scan AI. Berikut hasil skriningnya:\n${details}\n\nTolong jelaskan hasil ini dengan bahasa yang mudah dipahami, validasi hal yang perlu saya waspadai, dan berikan pertanyaan lanjutan atau langkah aman yang sebaiknya saya lakukan.`,
    );
  }, [scan, sendMessage]);

  useEffect(() => {
    if (!user || messages.length < 2) return;
    const timeout = setTimeout(() => {
      supabase
        .from("consultation_history")
        .insert({
          body_part: null,
          pain_level: null,
          detail: null,
          messages,
        })
        .then(({ error }) => {
          if (error) console.error("Gagal menyimpan riwayat konsultasi:", error.message);
        });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [messages.length, messages, user]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] font-sans flex flex-col justify-between">
      <div>
        <SiteHeader />

        {/* Main Content Area */}
        <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-6">
          {/* Chat Container Card */}
          <div className="flex flex-col h-[calc(100dvh-80px)] sm:h-[calc(100vh-140px)] min-h-[480px] md:h-[76vh] md:min-h-[560px] md:max-h-[780px] rounded-[20px] sm:rounded-[28px] bg-white shadow-[var(--shadow-clinic-lg)] border border-black/5 overflow-hidden">
            {/* Consultation Card Header */}
            <div className="flex items-center justify-between gap-2.5 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-black/5 bg-[#fafbfd] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-2xl bg-[color:var(--color-clinic-blue)] text-white shadow-sm">
                    <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className="font-display text-xs sm:text-base font-bold text-[color:var(--color-clinic-ink)] truncate">
                      Konsultasi AI
                    </h1>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 border border-emerald-200/60 shrink-0">
                      Aktif 24 Jam
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[color:var(--color-clinic-muted)] truncate">
                    Analisis gejala interaktif & panduan kesehatan terpercaya
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {messages.length > 0 && (
                  <Button
                    onClick={handleResetChat}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-full border-black/10 text-xs font-semibold text-[color:var(--color-clinic-muted)] hover:bg-[#f1f5f9] px-2.5 sm:px-3 cursor-pointer"
                    title="Mulai sesi percakapan baru"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline sm:inline">Mulai Ulang</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Context Notice from Anatomy (if any) */}
            {parsedAnatomyContext && (
              <div className="px-3.5 sm:px-5 py-2 bg-[color:var(--color-clinic-blue-soft)]/50 border-b border-[color:var(--color-clinic-blue)]/20 flex items-center justify-between gap-2 text-xs text-[color:var(--color-clinic-blue-dark)] shrink-0">
                <div className="flex items-center gap-2 font-medium min-w-0">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[color:var(--color-clinic-blue)]" />
                  <span className="truncate">
                    Terhubung dari Anatomi: <strong>{parsedAnatomyContext.regionName}</strong> ({parsedAnatomyContext.symptomsCount} gejala terpilih)
                  </span>
                </div>
              </div>
            )}

            {/* Chat Messages Body - Lenis Prevent & Overscroll Contain enabled for smooth up/down scrolling */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-3 sm:p-6 bg-[#fcfdfd] scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 min-w-0"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center max-w-lg mx-auto py-3 sm:py-6 my-auto">
                  <div className="grid h-11 w-11 sm:h-14 sm:w-14 place-items-center rounded-2xl sm:rounded-3xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] mb-2.5 sm:mb-3.5 shadow-xs shrink-0">
                    <Sparkles className="h-5 w-5 sm:h-7 sm:w-7" />
                  </div>
                  <h2 className="font-display text-sm sm:text-lg font-bold text-[color:var(--color-clinic-ink)] px-2">
                    Bagaimana kondisi kesehatan Anda hari ini?
                  </h2>
                  <p className="mt-1 text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)] leading-relaxed px-3 max-w-sm">
                    Ceritakan keluhan, rasa nyeri, atau pertanyaan kesehatan yang Anda rasakan untuk analisis awal.
                  </p>

                  {/* Quick Prompts */}
                  <div className="mt-4 sm:mt-6 w-full space-y-2 px-1">
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[color:var(--color-clinic-muted)] uppercase tracking-wider text-left">
                      Pilih Contoh Keluhan / Pertanyaan:
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                      {QUICK_PROMPTS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => sendMessage(item.desc)}
                            className="group flex items-start gap-2 rounded-xl sm:rounded-2xl border border-black/5 bg-white p-2 sm:p-3 text-left hover:border-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-soft)]/30 hover:shadow-xs transition cursor-pointer min-w-0"
                          >
                            <div className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white transition mt-0.5">
                              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] sm:text-xs font-bold text-[color:var(--color-clinic-ink)] group-hover:text-[color:var(--color-clinic-blue-dark)] transition line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[10px] sm:text-[11px] text-[color:var(--color-clinic-muted)] leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((m, i) => (
                    <ChatBubble key={i} message={m} />
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-xs">
                        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs bg-white border border-black/5 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs text-[color:var(--color-clinic-muted)] shadow-xs">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[color:var(--color-clinic-blue)]" />
                        <span>Sedang menganalisis respons...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Footer Area */}
            <div className="p-2.5 sm:p-4 border-t border-black/5 bg-white shrink-0">
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-black/10 rounded-2xl p-1 sm:p-1.5 focus-within:border-[color:var(--color-clinic-blue)] focus-within:ring-2 focus-within:ring-[color:var(--color-clinic-blue)]/15 transition">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ketik keluhan atau pertanyaan kesehatan..."
                  className="flex-1 max-h-24 min-h-[40px] sm:min-h-[42px] resize-none bg-transparent px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-[color:var(--color-clinic-ink)] placeholder:text-[color:var(--color-clinic-muted)] focus:outline-none"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-[color:var(--color-clinic-blue)] text-white p-0 hover:bg-[color:var(--color-clinic-blue-dark)] shadow-sm cursor-pointer disabled:opacity-50 transition"
                  aria-label="Kirim Pesan"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Minimal Safe Disclaimer */}
              <div className="mt-2 flex items-center justify-between text-[9px] sm:text-[10px] text-[color:var(--color-clinic-muted)] px-1">
                <span className="flex items-center gap-1 min-w-0 truncate">
                  <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
                  <span className="truncate">Asisten bersifat edukatif awal. Jika darurat, segera hubungi IGD terdekat.</span>
                </span>
                <span className="hidden sm:inline text-slate-400 shrink-0 ml-2">
                  Tekan <strong>Enter</strong> untuk mengirim
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}


