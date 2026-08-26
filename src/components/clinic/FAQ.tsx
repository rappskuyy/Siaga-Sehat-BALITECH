import { ChevronDown, CircleHelp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

const QUESTIONS = [
  {
    question: "Apakah hasil skrining AI menggantikan diagnosis dokter?",
    answer: "Tidak. Hasil SiagaSehat adalah skrining awal untuk membantu memahami keluhan dan menentukan langkah berikutnya. Diagnosis dan pengobatan tetap perlu dikonfirmasi oleh tenaga medis.",
  },
  {
    question: "Kondisi apa saja yang bisa dianalisis?",
    answer: "Kamu dapat memulai dari ruam kulit, luka, mata merah, jerawat, kuku, lidah, dan tenggorokan. Untuk keluhan lain, gunakan Konsultasi AI atau pilih area nyeri di peta tubuh.",
  },
  {
    question: "Apakah foto dan data kesehatan saya aman?",
    answer: "Data digunakan untuk menjalankan fitur yang kamu pilih. Simpan riwayat hanya tersedia untuk akun yang masuk, dan kamu tetap dapat menghapus riwayat dari profil.",
  },
  {
    question: "Kapan saya harus segera ke dokter?",
    answer: "Segera cari bantuan medis jika keluhan terasa berat, memburuk cepat, disertai sesak, nyeri dada, penurunan kesadaran, atau tanda bahaya lain. Jangan menunggu hasil skrining AI untuk kondisi darurat.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative overflow-hidden bg-[color:var(--color-clinic-blue-soft)] px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)]"><CircleHelp className="h-4 w-4" /> FAQ</span>
          <h2 className="mt-4 max-w-sm font-display text-4xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)] md:text-5xl">Yang sering ingin kamu tahu.</h2>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">Jawaban singkat sebelum kamu mulai mengenal kondisi tubuhmu dengan lebih tenang.</p>
        </Reveal>

        <Reveal delay="0.1s">
          <Accordion type="single" collapsible className="border-t border-[color:var(--color-clinic-blue)]/20">
            {QUESTIONS.map((item, index) => (
              <AccordionItem key={item.question} value={`question-${index}`} className="border-b border-[color:var(--color-clinic-blue)]/20">
                <AccordionTrigger className="group gap-4 py-5 text-left font-display text-base font-bold text-[color:var(--color-clinic-ink)] hover:no-underline [&>svg]:hidden">
                  <span className="flex items-start gap-4"><span className="pt-0.5 text-xs font-bold text-[color:var(--color-clinic-blue)]">0{index + 1}</span>{item.question}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[color:var(--color-clinic-blue)] transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-10 pr-8 text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}