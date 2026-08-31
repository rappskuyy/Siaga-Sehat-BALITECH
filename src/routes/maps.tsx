import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DedicatedMapsView } from "@/components/maps/DedicatedMapsView";
import { MobileMapView } from "@/components/maps/MobileMapView";

export const Route = createFileRoute("/maps")({
  head: () => ({
    meta: [
      { title: "Peta Fasilitas Kesehatan — Siaga Sehat" },
      {
        name: "description",
        content:
          "Cari Rumah Sakit, Klinik, dan Apotek terdekat secara interaktif di Indonesia. Lengkap dengan info UGD 24 jam, BPJS Kesehatan, dan rute navigasi presisi dari Siaga Sehat.",
      },
      { property: "og:title", content: "Peta Fasilitas Kesehatan — Siaga Sehat" },
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
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#4a6fa5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isMobile ? <MobileMapView /> : <DedicatedMapsView />;
}
