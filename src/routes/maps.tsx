import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DedicatedMapsView } from "@/components/maps/DedicatedMapsView";
import { MobileMapView } from "@/components/maps/MobileMapView";

export const Route = createFileRoute("/maps")({
  head: () => ({
    meta: [
      { title: "Peta Fasilitas Kesehatan | Siaga Sehat" },
      {
        name: "description",
        content:
          "Cari Rumah Sakit, Klinik, dan Apotek terdekat secara interaktif di Indonesia. Lengkap dengan info UGD 24 jam, BPJS Kesehatan, dan rute navigasi presisi dari Siaga Sehat.",
      },
      { property: "og:title", content: "Peta Fasilitas Kesehatan | Siaga Sehat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapsPage,
});

function MapsPage() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 1024);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-[#F7F9FB] flex flex-col">
        <div className="max-w-[1700px] mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-4">
          <div className="rounded-3xl bg-white p-4 border border-[#E5E7EB] shadow-sm">
            <h1 className="font-display text-base sm:text-lg font-bold text-[#111111]">
              Peta Fasilitas Kesehatan & Apotek Terdekat
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Menghubungkan ke jaringan rumah sakit, klinik, dan apotek terdekat...
            </p>
          </div>
          <div className="flex-1 w-full min-h-[400px] bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-[#4a6fa5] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return isMobile ? <MobileMapView /> : <DedicatedMapsView />;
}
