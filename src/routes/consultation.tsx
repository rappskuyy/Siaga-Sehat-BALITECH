import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Bone,
  Loader2,
  Phone,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";

import { chatWithAI } from "@/lib/ai/chat.server";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { BodyPainSelector } from "@/components/scanner/BodyPainSelector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/consultation")({
  validateSearch: (search: Record<string, unknown>) => ({
    anatomy: typeof search.anatomy === "string" ? search.anatomy : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Konsultasi AI — SiagaSehat" },
      {
        name: "description",
        content:
          "Konsultasi interaktif dengan asisten kesehatan AI SiagaSehat. Pilih bagian tubuh yang sakit langsung dari peta tubuh, lalu jelaskan gejalamu.",
      },
    ],
  }),
  component: ConsultationPage,
});

type ChatMessage = { role: "user" | "assistant"; text: string };

const SEVERITY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Ringan", value: "ringan" },
  { label: "Sedang", value: "sedang" },
  { label: "Berat", value: "berat" },
];

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-[color:var(--color-clinic-blue)] text-white"
            : "rounded-bl-md bg-white text-[color:var(--color-clinic-ink)]"
        }`}
      >
        {message.text}
      </div>
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
  const [bodySheetOpen, setBodySheetOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
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
      const next = messages.concat({ role: "user", text });
      setMessages(next);
      setLoading(true);
      try {
        const prompt = `Kamu sedang melakukan sesi konsultasi kesehatan interaktif. Berikut riwayat percakapan sejauh ini:\n${buildContext(
          next,
        )}\n\nLanjutkan percakapan secara natural: jika informasi (usia, lama gejala, tingkat keparahan, riwayat penyakit) belum lengkap, tanyakan satu per satu. Jika sudah cukup informasi, berikan Preliminary Analysis, Risk Assessment, dan Health Recommendation secara ringkas.`;
        const res = await chat({ data: { prompt } });
        const reply = res?.reply?.trim() || "Maaf, saya tidak mendapatkan respons. Coba lagi.";
        setMessages((m) => m.concat({ role: "assistant", text: reply }));
      } catch {
        setMessages((m) =>
          m.concat({
            role: "assistant",
            text: "Terjadi kesalahan saat menghubungi layanan AI. Coba lagi sebentar lagi.",
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
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  const handleSelectBodyPart = async (label: string) => {
    setSelectedPart(label);
    setBodySheetOpen(false);
    await sendMessage(`Saya merasa sakit di bagian: ${label}.`);
  };

  const handleSeverity = async (severityLabel: string) => {
    await sendMessage(`Tingkat rasa sakitnya: ${severityLabel}.`);
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
    const details = [
      `Bagian tubuh: ${context.regionName || "tidak disebutkan"}`,
      `Gejala: ${context.selectedSymptoms?.join(", ") || "tidak ada"}`,
      `Kondisi yang dipilih: ${context.selectedConditions?.join(", ") || "tidak ada"}`,
      context.additionalNotes ? `Catatan tambahan: ${context.additionalNotes}` : "",
      context.primaryCondition ? `Hasil awal AI: ${context.primaryCondition}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    void sendMessage(
      `Saya baru selesai memilih keluhan di halaman Anatomi. Berikut data saya:\n${details}\n\nTolong analisis keluhan ini, tanyakan informasi penting yang masih kurang, lalu sarankan langkah perawatan atau obat yang aman bila sesuai.`,
    );
  }, [anatomy, sendMessage]);

  useEffect(() => {
    // Simpan ringkasan sesi konsultasi ke Supabase saat percakapan berkembang (opsional, hanya jika login).
    if (!user || messages.length < 2) return;
    const timeout = setTimeout(() => {
      supabase
        .from("consultation_history")
        .insert({
          body_part: selectedPart,
          pain_level: null,
          detail: null,
          messages,
        })
        .then(({ error }) => {
          if (error) console.error("Gagal menyimpan riwayat konsultasi:", error.message);
        });
    }, 1500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <main className="flex min-h-screen flex-col bg-[#e9ecf1] font-sans">
      {/* Chat header, styled like a live-support widget */}
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-3 shadow-sm md:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--color-clinic-blue)] text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-clinic-ink)]">
              SiagaSehat AI
            </p>
            <p className="flex items-center gap-1 text-xs text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online — siap membantu
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)] p-1 text-xs font-semibold text-[color:var(--color-clinic-blue-dark)] md:flex">
          <Link to="/anatomy" className="rounded-full px-3 py-1.5 transition hover:bg-white">
            Anatomi
          </Link>
          <Link to="/consultation" search={{ anatomy: undefined }} className="rounded-full bg-[#FFFFFF] px-3 py-1.5 shadow-xs font-bold text-[#379FD2]">
            Konsultasi AI
          </Link>
          <Link to="/scanner" className="rounded-full px-3 py-1.5 transition hover:bg-white">
            Scan AI
          </Link>
        </nav>
        <div className="flex items-center gap-1 text-[color:var(--color-clinic-muted)]">
          <button
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            aria-label="Telepon"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            aria-label="Video"
          >
            <Video className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 pb-4 pt-3 md:px-6">
        {/* Disclaimer */}
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Asisten ini bersifat edukatif dan bukan pengganti diagnosis dokter. Untuk kondisi
            darurat, segera ke IGD terdekat.
          </p>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-2xl bg-[repeating-linear-gradient(45deg,#f3f5f9_0,#f3f5f9_2px,transparent_2px,transparent_16px)] p-3 md:p-4"
          style={{ minHeight: "50vh", maxHeight: "58vh" }}
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[color:var(--color-clinic-muted)]">
              <Sparkles className="h-6 w-6 text-[color:var(--color-clinic-blue)]" />
              <p>Mulai dengan menuliskan gejalamu, atau pilih bagian tubuh yang sakit di bawah.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i}>
              <ChatBubble message={m} />
            </div>
          ))}
          {loading && (
            <div className="mb-2 flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-[color:var(--color-clinic-muted)] shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sedang mengetik...
              </div>
            </div>
          )}
        </div>

        {/* Quick severity chips shown after a body part is selected */}
        {selectedPart && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[color:var(--color-clinic-muted)]">
              Seberapa sakit di {selectedPart}?
            </span>
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSeverity(opt.label)}
                disabled={loading}
                className="rounded-full border border-[color:var(--color-clinic-blue)]/30 bg-white px-3 py-1 text-xs font-medium text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue-soft)] disabled:opacity-50"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="mt-3 flex items-end gap-2">
          <Sheet open={bodySheetOpen} onOpenChange={setBodySheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0 gap-2 rounded-full border-[color:var(--color-clinic-blue)]/30 text-[color:var(--color-clinic-blue)]"
              >
                <Bone className="h-4 w-4" />
                <span className="hidden sm:inline">Bagian Tubuh</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Pilih Bagian Tubuh yang Sakit</SheetTitle>
                <SheetDescription>
                  Ketuk area yang terasa sakit pada gambar tubuh. Pilihanmu akan langsung dikirim ke
                  chat AI.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 flex justify-center pb-4">
                <BodyPainSelector onSelectPart={handleSelectBodyPart} selectedPartId={null} />
              </div>
            </SheetContent>
          </Sheet>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tulis gejala atau pertanyaanmu..."
            className="min-h-11 flex-1 resize-none rounded-2xl bg-white"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-full bg-[color:var(--color-clinic-blue)] p-0 hover:bg-[color:var(--color-clinic-blue-dark)]"
            aria-label="Kirim"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
