import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAI } from "@/lib/ai/chat.server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [{ title: "Konsultasi AI — SiagaSehat" }],
  }),
  component: ConsultationPage,
});

function ConsultationPage() {
  const chat = useServerFn(chatWithAI);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => m.concat({ role: "user", text }));
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { prompt: text } });
      setMessages((m) => m.concat({ role: "assistant", text: res?.reply ?? "" }));
    } catch (err) {
      setMessages((m) => m.concat({ role: "assistant", text: "Terjadi kesalahan saat menghubungi layanan AI." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] pb-16 font-sans">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="font-display text-2xl font-extrabold">Konsultasi AI</h1>
        <p className="mt-2 text-sm text-[color:var(--color-clinic-muted)]">
          Tanyakan langsung ke asisten SiagaSehat tanpa perlu melakukan scan. Informasi bersifat edukatif.
        </p>

        <div className="mt-6 flex h-[60vh] flex-col gap-3">
          <div className="flex-1 overflow-auto rounded-md border bg-white p-3 text-sm">
            {messages.length === 0 && <p className="text-muted-foreground">Mulai percakapan dengan menanyakan gejala atau kondisi.</p>}
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
                <div className={`inline-block max-w-[90%] rounded-md p-2 ${m.role === "user" ? "bg-[color:var(--color-clinic-blue)] text-white" : "bg-gray-100 text-[color:var(--color-clinic-ink)]"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pertanyaan..." />
            <Button onClick={handleSend} disabled={loading}>{loading ? "Mengirim..." : "Kirim"}</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
