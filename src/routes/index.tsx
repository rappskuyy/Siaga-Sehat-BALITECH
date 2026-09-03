import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/clinic/Hero";
import { FocusSection } from "@/components/clinic/FocusSection";
import { Statement } from "@/components/clinic/Statement";
import { Services } from "@/components/clinic/Services";
import { WhyChooseUs } from "@/components/clinic/WhyChooseUs";
import { FaqSection } from "@/components/clinic/FaqSection";
import { Footer } from "@/components/clinic/Footer";
import { Reveal } from "@/components/clinic/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Siaga Sehat" },
      {
        name: "description",
        content:
          "Siaga Sehat: diagnostik kecerdasan buatan dengan pendekatan manusiawi. Layanan kesehatan terpadu dengan dokter berlisensi dan skrining AI.",
      },
      { property: "og:title", content: "Siaga Sehat" },
      {
        property: "og:description",
        content:
          "Diagnostik kecerdasan buatan dengan sentuhan manusiawi. Konsultasikan dengan spesialis berlisensi di SiagaSehat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] font-sans">
      <div className="flex w-full flex-col">
        <Hero />
        <FocusSection />
        <Reveal>
          <Statement />
        </Reveal>
        <Services />
        <Reveal>
          <WhyChooseUs />
        </Reveal>
        <FaqSection />
        <Footer />
      </div>
    </main>
  );
}
