"use client";

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatWithAI } from "@/lib/ai/chat.server";

export function AiConsultation({ initialContext }: { initialContext: string }) {
  const chat = useServerFn(chatWithAI);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const startConversation = () => {
    setMessages([{ role: "user", text: `Hasil scan: ${initialContext}` }]);
    setOpen(true);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => m.concat({ role: "user", text: userText }));
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { prompt: `${initialContext}\n\nPertanyaan pengguna: ${userText}` } });
      const reply = res?.reply ?? "";
      setMessages((m) => m.concat({ role: "assistant", text: reply }));
    } catch (err) {
      setMessages((m) => m.concat({ role: "assistant", text: "Terjadi kesalahan saat menghubungi layanan AI." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={startConversation} className="gap-2 rounded-full bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]">
          Konsultasi AI
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konsultasi dengan SiagaSehat AI</DialogTitle>
          <DialogDescription>Gunakan fitur ini untuk menanyakan lebih lanjut tentang hasil scan Anda. Bukan pengganti dokter.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex h-64 flex-col gap-2 overflow-hidden">
          <div className="flex-1 overflow-auto rounded-md border bg-white p-3 text-sm">
            {messages.length === 0 && <p className="text-muted-foreground">Mulai percakapan...</p>}
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
            <Button onClick={handleSend} disabled={loading} className="whitespace-nowrap">{loading ? "Mengirim..." : "Kirim"}</Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
