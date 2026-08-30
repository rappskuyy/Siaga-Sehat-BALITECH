import { createFileRoute } from "@tanstack/react-router";
import { AnatomyExplorer } from "@/components/anatomy/AnatomyExplorer";
import { Footer } from "@/components/clinic/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const Route = createFileRoute("/anatomy")({
  head: () => ({
    meta: [
      { title: "Eksplorasi Anatomi AI — SiagaSehat" },
      {
        name: "description",
        content:
          "Eksplorasi bagian tubuh secara interaktif, pilih gejala Anda, dan dapatkan AI Health Assessment awal dari SiagaSehat.",
      },
      { property: "og:title", content: "Eksplorasi Anatomi AI — SiagaSehat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnatomyPage,
});

function AnatomyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] font-sans flex flex-col justify-between">
      <div>
        <SiteHeader />

        {/* Content Container */}
        <div className="px-3 py-4 md:px-6 md:py-6">
          <AnatomyExplorer />
        </div>
      </div>

      <Footer />
    </main>
  );
}
