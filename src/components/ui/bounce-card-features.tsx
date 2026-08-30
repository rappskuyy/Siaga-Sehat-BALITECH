import React from "react";
import { motion } from "framer-motion";
import { Activity, MapPin, Pill, Bot } from "lucide-react";

export const BouncyCardsFeatures = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 text-slate-800">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:px-8">
        <h2 className="max-w-lg text-4xl font-bold md:text-5xl">
          Solusi Kesehatan Cerdas dengan
          <span className="text-teal-600"> SiagaSehat AI</span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="whitespace-nowrap rounded-lg bg-teal-600 px-5 py-2.5 font-medium text-white shadow-xl transition-colors hover:bg-teal-700"
        >
          Coba Skrining Sekarang
        </motion.button>
      </div>
      <div className="mb-4 grid grid-cols-12 gap-4">
        <BounceCard className="col-span-12 md:col-span-4">
          <CardTitle>AI Skrining Kulit</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-28 translate-y-8 rounded-t-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] text-white flex flex-col items-center justify-center gap-2">
            <Activity className="w-10 h-10" />
            <span className="block text-center font-semibold">
              Analisis foto kondisi kulit secara presisi & cepat
            </span>
          </div>
        </BounceCard>
        <BounceCard className="col-span-12 md:col-span-8">
          <CardTitle>Peta Faskes & Apotek Terdekat</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-28 translate-y-8 rounded-t-2xl bg-gradient-to-br from-blue-400 to-indigo-500 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] text-white flex flex-col items-center justify-center gap-2">
            <MapPin className="w-10 h-10" />
            <span className="block text-center font-semibold">
              Temukan lokasi klinik, rumah sakit, dan apotek dengan GPS presisi
            </span>
          </div>
        </BounceCard>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <BounceCard className="col-span-12 md:col-span-8">
          <CardTitle>Rekomendasi Obat & Herbal</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-28 translate-y-8 rounded-t-2xl bg-gradient-to-br from-emerald-400 to-green-600 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] text-white flex flex-col items-center justify-center gap-2">
            <Pill className="w-10 h-10" />
            <span className="block text-center font-semibold">
              Saran pengobatan medis topikal serta alternatif herbal alami
            </span>
          </div>
        </BounceCard>
        <BounceCard className="col-span-12 md:col-span-4">
          <CardTitle>Konsultasi AI</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-28 translate-y-8 rounded-t-2xl bg-gradient-to-br from-[color:var(--color-clinic-blue)] to-[color:var(--color-siaga-scan)] p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] text-white flex flex-col items-center justify-center gap-2">
            <Bot className="w-10 h-10" />
            <span className="block text-center font-semibold">
              Tanya jawab seputar gejala 24/7
            </span>
          </div>
        </BounceCard>
      </div>
    </section>
  );
};

const BounceCard = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <motion.div
      whileHover={{ scale: 0.98, rotate: "-0.5deg" }}
      className={`group relative min-h-[300px] cursor-pointer overflow-hidden rounded-2xl bg-slate-50 p-8 border border-slate-100 shadow-sm hover:shadow-md ${className}`}
    >
      {children}
    </motion.div>
  );
};

const CardTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h3 className="mx-auto text-center text-2xl font-semibold text-slate-800">{children}</h3>
  );
};
