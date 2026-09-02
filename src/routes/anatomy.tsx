import { createFileRoute } from "@tanstack/react-router";
import { AnatomyExplorer } from "@/components/anatomy/AnatomyExplorer";
import { Footer } from "@/components/clinic/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const Route = createFileRoute("/anatomy")({
  head: () => ({
    meta: [
      { title: "Eksplorasi Anatomi AI — Siaga Sehat" },
      {
        name: "description",
        content:
          "Eksplorasi bagian tubuh secara interaktif, pilih gejala Anda, dan dapatkan analisis penilaian kesehatan awal berbasis AI dari Siaga Sehat.",
      },
      { property: "og:title", content: "Eksplorasi Anatomi AI — Siaga Sehat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnatomyPage,
});

function AnatomyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] font-sans flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-full overflow-x-hidden">
        <SiteHeader />

        {/* Content Container */}
        <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8 max-w-full overflow-x-hidden">
          <AnatomyExplorer />
        </div>
      </div>

      <Footer />
    </main>
  );
}

