import { createFileRoute } from "@tanstack/react-router";
import { DedicatedMapsView } from "@/components/maps/DedicatedMapsView";

export const Route = createFileRoute("/maps")({
  head: () => ({
    meta: [
      { title: "Peta Fasilitas Kesehatan — SiagaSehat" },
      {
        name: "description",
        content:
          "Cari Rumah Sakit, Klinik, dan Apotek terdekat secara interaktif di Indonesia. Lengkap dengan info UGD 24 jam, BPJS Kesehatan, dan rute navigasi presisi dari SiagaSehat.",
      },
      { property: "og:title", content: "Peta Fasilitas Kesehatan — SiagaSehat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapsPage,
});

function MapsPage() {
  return <DedicatedMapsView />;
}
