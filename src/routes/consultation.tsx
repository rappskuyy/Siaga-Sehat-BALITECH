import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertCircle,
  Bot,
  Brain,
  CheckCircle2,
  Flame,
  Loader2,
  MessageSquare,
  RotateCcw,
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

export const Route = createFileRoute("/consultation")({
  validateSearch: (search: Record<string, unknown>): { anatomy?: string } => ({
    anatomy: typeof search.anatomy === "string" ? search.anatomy : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Konsultasi Dokter AI — Siaga Sehat" },
      {
        name: "description",
        content:
          "Konsultasi interaktif dengan asisten kesehatan AI SiagaSehat. Jelaskan keluhan atau gejala Anda dan dapatkan analisis kesehatan terpercaya.",
      },
    ],
  }),
  component: ConsultationPage,
});

type ChatMessage = { role: "user" | "assistant"; text: string; time?: string };

const QUICK_PROMPTS = [
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
  {
    icon: Wind,
    title: "Batuk & Tenggorokan",
    desc: "Batuk berdahak dan tenggorokan terasa sakit",
  },
];

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`mb-4 flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-xs">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
        <div
          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
            isUser
              ? "rounded-br-xs bg-[color:var(--color-clinic-blue)] text-white font-normal"
              : "rounded-bl-xs bg-white text-[color:var(--color-clinic-ink)] border border-black/5"
          }`}
        >
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>

        {message.time && (
          <span className="mt-1 px-1 text-[10px] text-[color:var(--color-clinic-muted)]">
            {message.time}
          </span>
        )}
      </div>

      {isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-200 text-slate-700 shadow-2xs">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function ConsultationPage() {
  const chat = useServerFn(chatWithAI);
  const { user } = useAuth();
  const { anatomy } = useSearch({ from: "/consultation" });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedAnatomyContext, setParsedAnatomyContext] = useState<{
    regionName?: string;
    symptomsCount?: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const initialContextSent = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

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
      try {
        const prompt = `Kamu adalah Asisten Dokter AI SiagaSehat yang ramah, empati, dan profesional dalam Bahasa Indonesia. Berikut riwayat percakapan sejauh ini:\n${buildContext(
          next,
        )}\n\nLanjutkan percakapan secara natural: jika informasi (usia, lama gejala, tingkat keparahan, riwayat penyakit) belum lengkap, tanyakan satu per satu secara sopan. Jika sudah cukup informasi, berikan Analisis Awal Kemungkinan Kondisi, Tingkat Risiko, dan Rekomendasi Tindakan / Perawatan yang aman dan terstruktur.`;
        const res = await chat({ data: { prompt } });
        const reply = res?.reply?.trim() || "Maaf, saya tidak mendapatkan respons. Silakan coba lagi.";
        const assistantMsg: ChatMessage = { role: "assistant", text: reply, time: formatTime() };
        setMessages((m) => m.concat(assistantMsg));
      } catch {
        setMessages((m) =>
          m.concat({
            role: "assistant",
            text: "Terjadi gangguan saat menghubungi layanan AI. Silakan coba kirim kembali.",
            time: formatTime(),
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
      context.primaryCondition ? `Hasil awal AI: ${context.primaryCondition}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    void sendMessage(
      `Saya baru selesai memilih keluhan pada organ ${context.regionName || ""} di halaman Anatomi. Berikut rangkuman data saya:\n${details}\n\nTolong bantu periksa keluhan ini, tanyakan hal yang perlu diketahui, dan berikan rekomendasi medis awal yang aman.`,
    );
  }, [anatomy, sendMessage]);

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
        <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6">
          {/* Chat Container Card */}
          <div className="flex flex-col h-[calc(100vh-140px)] min-h-[420px] md:h-[76vh] md:min-h-[560px] md:max-h-[780px] rounded-[28px] bg-white shadow-[var(--shadow-clinic-lg)] border border-black/5 overflow-hidden">
            {/* Consultation Card Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5 bg-[#fafbfd] shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[color:var(--color-clinic-blue)] text-white shadow-sm">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-sm sm:text-base font-bold text-[color:var(--color-clinic-ink)]">
                      Konsultasi Dokter AI
                    </h1>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                      Aktif 24 Jam
                    </span>
                  </div>
                  <p className="text-[11px] text-[color:var(--color-clinic-muted)]">
                    Analisis gejala interaktif & panduan kesehatan terpercaya
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    onClick={handleResetChat}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-full border-black/10 text-xs font-semibold text-[color:var(--color-clinic-muted)] hover:bg-[#f1f5f9] px-3"
                    title="Mulai sesi percakapan baru"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mulai Ulang</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Context Notice from Anatomy (if any) */}
            {parsedAnatomyContext && (
              <div className="px-5 py-2 bg-[color:var(--color-clinic-blue-soft)]/50 border-b border-[color:var(--color-clinic-blue)]/20 flex items-center justify-between gap-2 text-xs text-[color:var(--color-clinic-blue-dark)]">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[color:var(--color-clinic-blue)]" />
                  <span>
                    Terhubung dari Anatomi: <strong>{parsedAnatomyContext.regionName}</strong> ({parsedAnatomyContext.symptomsCount} gejala terpilih)
                  </span>
                </div>
              </div>
            )}

            {/* Chat Messages Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fcfdfd] scrollbar-thin scrollbar-thumb-slate-200"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto py-8">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] mb-3.5 shadow-xs">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[color:var(--color-clinic-ink)]">
                    Bagaimana kondisi kesehatan Anda hari ini?
                  </h3>
                  <p className="mt-1.5 text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
                    Ceritakan keluhan, rasa nyeri, atau pertanyaan kesehatan yang sedang Anda rasakan untuk mendapatkan analisis awal dari dokter AI.
                  </p>

                  {/* Quick Prompts */}
                  <div className="mt-6 w-full space-y-2">
                    <p className="text-[11px] font-semibold text-[color:var(--color-clinic-muted)] uppercase tracking-wider text-left">
                      Pilih Contoh Keluhan Cepat:
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {QUICK_PROMPTS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => sendMessage(item.desc)}
                            className="group flex items-start gap-2.5 rounded-2xl border border-black/5 bg-white p-3 text-left hover:border-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-soft)]/30 hover:shadow-xs transition cursor-pointer"
                          >
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white transition">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[color:var(--color-clinic-ink)] group-hover:text-[color:var(--color-clinic-blue-dark)] transition">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-[color:var(--color-clinic-muted)] leading-snug line-clamp-2 mt-0.5">
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
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-xs">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs bg-white border border-black/5 px-4 py-2.5 text-xs text-[color:var(--color-clinic-muted)] shadow-xs">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[color:var(--color-clinic-blue)]" />
                        <span>Dokter AI sedang menganalisis respons...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Footer Area */}
            <div className="p-3 sm:p-4 border-t border-black/5 bg-white shrink-0">
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-black/10 rounded-2xl p-1.5 focus-within:border-[color:var(--color-clinic-blue)] focus-within:ring-2 focus-within:ring-[color:var(--color-clinic-blue)]/15 transition">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ketik keluhan, gejala, atau pertanyaan Anda di sini... (Enter untuk kirim)"
                  className="flex-1 max-h-24 min-h-[42px] resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-[color:var(--color-clinic-ink)] placeholder:text-[color:var(--color-clinic-muted)] focus:outline-none"
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
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-[color:var(--color-clinic-muted)] px-1">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
                  Asisten bersifat edukatif awal. Jika darurat, segera hubungi IGD terdekat.
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Tekan <strong>Enter</strong> untuk mengirim
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
