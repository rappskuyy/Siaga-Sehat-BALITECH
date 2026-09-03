import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SCAN_RESULT_JSON_SCHEMA, type ScanResult, type ScanMedicine, type ScanHerbal } from "./types";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const scanInputSchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(ALLOWED_MEDIA_TYPES),
});

const SYSTEM_PROMPT = `Kamu adalah asisten skrining kesehatan berbasis AI bernama "SiagaSehat Scanner". Tugasmu menganalisis foto kondisi kulit/tubuh yang diunggah pengguna dan memberikan hasil analisis edukatif awal berdasarkan DATASET INFORMASI PENYAKIT & KESEHATAN INDONESIA.

DATASET INFORMASI PENYAKIT ACUAN:
1. Dermatitis Kontak & Eksim (Atopik / Iritan / Alergi):
   - Gejala: Kulit kemerahan, gatal, bersisik, kering, atau melepuh kecil.
   - Obat OTC: Krim Hydrocortisone 1%, Pelembap Hypoallergenic, Lotion Kalamin.
   - Obat Herbal: Gel Lidah Buaya (Aloe Vera), Kompres Minyak Zaitun.
2. Tinea & Infeksi Jamur Kulit (Panu, Kadas, Kurap, Tinea Pedis):
   - Gejala: Bercak berbatas tegas, bersisik halus, gatal terutama saat berkeringat.
   - Obat OTC: Krim Mikonazol 2%, Ketokonazol 2%, Salep 2-4.
   - Obat Herbal: Ekstrak Daun Sirih, Minyak Kelapa Murni (VCO).
3. Acne Vulgaris & Peradangan Kelenjar (Jerawat Papul, Pustul, Komedo):
   - Gejala: Bintil merah, nanah, komedo hitam/putih, atau benjolan di wajah.
   - Obat OTC: Asam Salisilat topikal, Benzoil Peroksida 2.5%, Gel Sulfur.
   - Obat Herbal: Tea Tree Oil, Masker Kunyit & Madu.
4. Urtikaria & Reaksi Alergi Kulit (Biduran / Kaligata):
   - Gejala: Bentol kemerahan menimbul (wheal), gatal hilang timbul cepat.
   - Obat OTC: Antihistamin Oral (Cetirizine 10mg / Loratadine 10mg), Lotion Kalamin.
   - Obat Herbal: Air Kelapa Hijau, Kompres Air Dingin.
5. Scabies & Infeksi Parasit Kulit (Kudis):
   - Gejala: Bintil gatal hebat di sela jari, pergelangan, lipatan.
   - Obat OTC / Tindakan: Cuci pakaian/sprei dengan air panas. Butuh salep dokter (Permethrin 5%).
   - Obat Herbal: Minyak Mimba (Neem Oil), Minyak Cengkeh terencerkan.
6. Impetigo & Infeksi Bakteri Kulit (Bisul / Folikulitis):
   - Gejala: Bintil berisi cairan atau nanah, pecah dan jadi kerak kuning.
   - Obat OTC: Salep Povidone Iodine, Chlorhexidine.
   - Obat Herbal: Ekstrak Bawang Putih terencerkan, Air Daun Sirih.
7. Herpes Zoster & Virus Kulit (Cacar Ular / Cacar Air):
   - Gejala: Gelembung berkelompok sesuai saraf, nyeri terbakar.
   - Obat OTC: Parasetamol 500mg, Bedak Salisil.
   - Obat Herbal: Kompres Dingin Antiseptik.
8. Psoriasis & Gangguan Inflamasi Kronis:
   - Gejala: Plak merah bersisik tebal berwarna perak.
   - Obat OTC: Petroleum Jelly, Salep Asam Salisilat.
   - Obat Herbal: Lidah Buaya, Mandi Garam Epsom.
9. Gigitan Serangga & Dermatitis Venenata:
   - Gejala: Ruam memanjang, melepuh atau perih setelah gigitan/terkena racun.
   - Obat OTC: Hydrocortisone, Kompres Dingin NaCl.
   - Obat Herbal: Gel Aloe Vera.
10. Eksim Dishidrotik / Miliaria:
   - Gejala: Bintil kecil berisi cairan, gatal di tangan atau badan.
   - Obat OTC: Krim Klorokuinon, Pelembap ringan.
   - Obat Herbal: Kompres Daun Sirih.
11. Dermatitis Seboroik & Kulit Kepala:
   - Gejala: Sisik kuning/putih, kulit berminyak, gatal di area rambut.
   - Obat OTC: Sampo Selenium Sulfida, Krim Ketokonazol.
   - Obat Herbal: Minyak Pohon Teh encer.
12. Ruam Alergi / Eksim Kontak Ringan:
   - Gejala: Kulit merah, bengkak, panas, terkadang berisi cairan.
   - Obat OTC: Krim Hidrokortison, Gel Aloe Vera.
   - Obat Herbal: Kompres Daun Lidah Buaya.

ATURAN ANALISIS INFORMASI PENYAKIT:
- Selalu jawab dalam Bahasa Indonesia yang jelas dan mudah dipahami.
- Jika gambar tidak menunjukkan kondisi kesehatan/kulit (buram, foto benda, tangan yang tidak nuduhake kondisi kulit, dsb), set "gambar_dapat_dianalisis" ke false dan berikan petunjuk di "ringkasan".
- Jika kondisi tidak tercakup dalam contoh di atas, tetap analisis berdasarkan ciri visual dan sebutkan "kemungkinan" atau "mungkin".
- Jika kamu tidak yakin, gunakan istilah umum seperti "Ruam kulit tidak spesifik" atau "Iritasi kulit kemungkinan akibat..." di "nama_penyakit" dan tetap beri rekomendasi aman.
- "penyebab": WAJIB diisi 2-4 poin kemungkinan penyebab/pemicu kondisi tersebut (mis. kontak iritan, infeksi bakteri/jamur, reaksi alergi, gesekan, kelembapan berlebih, dsb) berdasarkan ciri visual yang terlihat. Field ini TIDAK BOLEH berupa array kosong; bahkan jika gambar tidak jelas, isi dengan kemungkinan umum seperti "Belum dapat dipastikan tanpa pemeriksaan langsung; kemungkinan terkait iritasi, infeksi, atau alergi kulit".
- Klasifikasikan "tingkat_bahaya" ("rendah", "sedang", "tinggi") secara akurat. Jika "tinggi", set "harus_ke_dokter" ke true.
- "obat_rekomendasi": Hanya cantumkan obat bebas/OTC umum di Indonesia beserta dosis aman; kalau tidak yakin dengan penyakit spesifik, gunakan rekomendasi untuk gejala yang muncul (misalnya gatal, merah, kering).
- "obat_herbal": Cantumkan tanaman obat atau cara alami tradisional yang relatif aman dan sesuai gejala.
- Jangan pernah membuat diagnosis pasti 100%, gunakan bahasa "kemungkinan", "berdasarkan gambar terlihat seperti", "mirip dengan".
- Jika kamu tidak bisa yakin karena kualitas gambar buruk, set "gambar_dapat_dianalisis" ke false.
- Keluarkan HANYA data terstruktur sesuai skema JSON tanpa teks tambahan di luar skema.`;

const USER_PROMPT =
  "Analisis foto ini dan berikan hasil skrining kesehatan awal sesuai skema yang telah ditentukan.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function splitTextList(value: string): string[] {
  // A plain regex split on "," "." ";" etc. doesn't know about parentheses,
  // so a single sentence like "Hindari meminjamkan barang pribadi bersama
  // (handuk, pakaian)" gets cut at the comma *inside* the parentheses,
  // producing two broken fragments: "...(handuk" and "pakaian)". Walk the
  // string manually and only treat these characters as separators while
  // we're not inside a "(...)"/"[...]" group. While at it, don't split a
  // "." that's part of a decimal number like "2.5%".
  const tokens: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < value.length; i++) {
    const ch = value[i];

    if (ch === "(" || ch === "[") {
      depth++;
      current += ch;
      continue;
    }
    if (ch === ")" || ch === "]") {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }

    if (depth === 0) {
      if (ch === ";" || ch === "\n" || ch === "|" || ch === ",") {
        tokens.push(current);
        current = "";
        continue;
      }
      if (ch === ".") {
        const prev = value[i - 1];
        const next = value[i + 1];
        const isDecimalNumber = prev !== undefined && next !== undefined && /\d/.test(prev) && /\d/.test(next);
        if (!isDecimalNumber) {
          tokens.push(current);
          current = "";
          continue;
        }
      }
    }

    current += ch;
  }
  tokens.push(current);

  return tokens
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length > 1);
}

function toStringArray(value: unknown): string[] {
  if (typeof value === "string") {
    return splitTextList(value);
  }

  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      if (typeof item === "string") return splitTextList(item);
      if (item && typeof item === "object") {
        const candidate = item as Record<string, unknown>;
        const text =
          typeof candidate.text === "string"
            ? candidate.text
            : typeof candidate.nama === "string"
              ? candidate.nama
              : typeof candidate.name === "string"
                ? candidate.name
                : "";
        return text ? splitTextList(text) : [];
      }
      return [];
    })
    .filter(Boolean);
}

function normalizeMedicineList(value: unknown): ScanResult["obat_rekomendasi"] {
  if (typeof value === "string") {
    const items = value
      .split(/[;\n|]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (items.length === 0) return [];

    return items.map((item) => ({
      nama: item.includes(":") ? item.split(":", 2)[0].trim() : item,
      dosis: item.includes(":") ? item.split(":", 2)[1].trim() : "Ikuti petunjuk penggunaan",
      catatan: "Konsultasikan dengan dokter/apoteker bila perlu.",
    }));
  }

  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    // Handle string items in array (e.g. KoboiLLM output)
    if (typeof item === "string") {
      const text = item.trim();
      if (!text) return [];
      // Try to extract name and dosage from patterns like "Nama (dosis info)"
      const parenStart = text.indexOf("(");
      const colonIdx = text.indexOf(":");
      let nama = text;
      let dosis = "Ikuti petunjuk penggunaan";
      if (parenStart > 2) {
        nama = text.slice(0, parenStart).trim().replace(/[.,]$/, "");
        dosis = text.slice(parenStart).replace(/^\(|\)$/g, "").trim() || dosis;
      } else if (colonIdx > 2) {
        nama = text.slice(0, colonIdx).trim();
        dosis = text.slice(colonIdx + 1).trim() || dosis;
      }
      return [{ nama, dosis, catatan: "Konsultasikan dengan dokter/apoteker bila perlu." }];
    }

    if (!isRecord(item)) return [];

    const nama =
      typeof item.nama === "string"
        ? item.nama
        : typeof item.name === "string"
          ? item.name
          : "";

    if (!nama) return [];

    return [{
      nama,
      dosis:
        typeof item.dosis === "string"
          ? item.dosis
          : typeof item.dose === "string"
            ? item.dose
            : typeof item.dosis_obat === "string"
              ? item.dosis_obat
              : "Ikuti petunjuk penggunaan",
      catatan:
        typeof item.catatan === "string"
          ? item.catatan
          : typeof item.keterangan === "string"
            ? item.keterangan
            : typeof item.note === "string"
              ? item.note
              : typeof item.deskripsi === "string"
                ? item.deskripsi
                : "Konsultasikan dengan dokter/apoteker bila perlu.",
    }];
  });
}

function normalizeHerbalList(value: unknown): ScanResult["obat_herbal"] {
  if (typeof value === "string") {
    const items = value
      .split(/[;\n|]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (items.length === 0) return [];

    return items.map((item) => {
      const [nama, ...rest] = item.split(/\s*:\s*|\s*-\s*/);
      return {
        nama: nama || item,
        cara_pakai: rest.join(": ").trim() || "Gunakan sesuai kebutuhan dan konsultasikan ke ahli bila perlu.",
      };
    });
  }

  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    // Handle string items in array (e.g. KoboiLLM output)
    if (typeof item === "string") {
      const text = item.trim();
      if (!text) return [];
      // Split on common separators: "Nama - cara pakai" or "Nama: cara pakai"
      const sepMatch = text.match(/^(.+?)\s+(?:dioleskan|digunakan|dikonsumsi|diminum|ditempelkan|dibalurkan|sebagai|untuk)\s+(.+)$/i);
      if (sepMatch) {
        return [{ nama: sepMatch[1].trim(), cara_pakai: sepMatch[2].trim() }];
      }
      const colonIdx = text.indexOf(":");
      const dashIdx = text.indexOf(" - ");
      if (colonIdx > 2) {
        return [{ nama: text.slice(0, colonIdx).trim(), cara_pakai: text.slice(colonIdx + 1).trim() }];
      }
      if (dashIdx > 2) {
        return [{ nama: text.slice(0, dashIdx).trim(), cara_pakai: text.slice(dashIdx + 3).trim() }];
      }
      return [{ nama: text, cara_pakai: "Gunakan sesuai kebutuhan dan konsultasikan ke ahli bila perlu." }];
    }

    if (!isRecord(item)) return [];

    const nama =
      typeof item.nama === "string"
        ? item.nama
        : typeof item.name === "string"
          ? item.name
          : "";

    if (!nama) return [];

    return [{
      nama,
      cara_pakai:
        typeof item.cara_pakai === "string"
          ? item.cara_pakai
          : typeof item.cara_penggunaan === "string"
            ? item.cara_penggunaan
            : typeof item.cara === "string"
              ? item.cara
              : typeof item.penggunaan === "string"
                ? item.penggunaan
                : "Gunakan sesuai kebutuhan dan konsultasikan ke ahli bila perlu.",
    }];
  });
}

/**
 * Some providers (observed with KoboiLLM's Gemini passthrough when no strict
 * response schema is enforced) ignore the flat schema and instead wrap the
 * result in a multi-candidate array such as "kemungkinan_penyakit",
 * "diagnosis", or "differential_diagnosis". Each entry in that array carries
 * its own nama_penyakit/tingkat_bahaya/obat_rekomendasi/etc. This picks the
 * most relevant single candidate (preferring the most dangerous one) so the
 * rest of the normalizer can treat it like a flat payload.
 */
function pickPrimaryCandidate(list: unknown[]): Record<string, unknown> | null {
  const candidates = list.filter(isRecord);
  if (candidates.length === 0) return null;

  const dangerRank: Record<string, number> = { tinggi: 3, sedang: 2, rendah: 1 };
  return candidates.reduce((best, current) => {
    const bestRank = dangerRank[String(best.tingkat_bahaya ?? "").toLowerCase()] ?? 0;
    const currentRank = dangerRank[String(current.tingkat_bahaya ?? "").toLowerCase()] ?? 0;
    return currentRank > bestRank ? current : best;
  }, candidates[0]);
}

/**
 * Unlike `??`, this treats an empty string or empty array as "no value" and
 * keeps checking later candidates. This matters because providers sometimes
 * return a syntactically valid but empty array (e.g. "penyebab": []) for a
 * required field instead of omitting it — a plain `??` chain would stop at
 * that empty array and never fall through to a field that actually has data.
 */
function firstNonEmptySource(...candidates: unknown[]): unknown {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
  }
  return undefined;
}

/**
 * Mirrors the DATASET INFORMASI PENYAKIT ACUAN baked into SYSTEM_PROMPT.
 * Used as a last-resort, offline fallback: if the model correctly identifies
 * a condition in its free-text "ringkasan" (or leaves "nama_penyakit" too
 * generic/empty) but fails to populate the structured fields — which keeps
 * happening even under a strict JSON schema, since the model can satisfy
 * "required" with an empty string/array — we look the condition up here
 * instead of showing "Tidak ada data ... yang tersedia." for something we
 * actually have a reference answer for.
 */
interface DiseaseKnowledge {
  nama: string;
  keywords: RegExp;
  penyebab: string[];
  pencegahan: string[];
  obat_rekomendasi: ScanMedicine[];
  obat_herbal: ScanHerbal[];
}

const DISEASE_KNOWLEDGE_BASE: DiseaseKnowledge[] = [
  {
    nama: "Dermatitis Kontak & Eksim",
    keywords: /dermatitis|eksim(?!\s*dishidrotik)|atopik/i,
    penyebab: ["Kontak dengan bahan iritan atau alergen", "Kulit terlalu kering", "Reaksi alergi terhadap sabun/deterjen"],
    pencegahan: ["Hindari sabun atau bahan yang memicu iritasi", "Gunakan pelembap secara rutin", "Jaga kulit tetap lembap dan bersih"],
    obat_rekomendasi: [
      { nama: "Krim Hydrocortisone 1%", dosis: "Oles tipis 1-2 kali sehari pada area gatal", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Pelembap Hypoallergenic", dosis: "Gunakan rutin setelah mandi", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Lotion Kalamin", dosis: "Oles pada area yang gatal", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Gel Lidah Buaya (Aloe Vera)", cara_pakai: "Oleskan tipis pada area yang teriritasi" },
      { nama: "Kompres Minyak Zaitun", cara_pakai: "Kompres lembut pada kulit kering" },
    ],
  },
  {
    nama: "Tinea & Infeksi Jamur Kulit",
    keywords: /tinea|panu|kadas|kurap|jamur/i,
    penyebab: ["Infeksi jamur dermatofita", "Kelembapan berlebih pada kulit", "Berbagi pakaian/handuk dengan orang lain"],
    pencegahan: ["Jaga area tetap kering", "Hindari berbagi handuk/pakaian", "Ganti pakaian setelah berkeringat"],
    obat_rekomendasi: [
      { nama: "Krim Mikonazol 2%", dosis: "Oles 2 kali sehari selama 2-4 minggu", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Krim Ketokonazol 2%", dosis: "Oles 1-2 kali sehari", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Salep 2-4", dosis: "Oles tipis pada area yang terkena", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Ekstrak Daun Sirih", cara_pakai: "Tempelkan air rebusan daun sirih pada area yang terkena" },
      { nama: "Minyak Kelapa Murni (VCO)", cara_pakai: "Oleskan tipis 1-2 kali sehari" },
    ],
  },
  {
    nama: "Acne Vulgaris (Jerawat)",
    keywords: /acne|jerawat|komedo|pustul/i,
    penyebab: ["Produksi minyak berlebih (sebum)", "Penyumbatan pori oleh sel kulit mati", "Pertumbuhan bakteri penyebab jerawat"],
    pencegahan: ["Bersihkan wajah 2 kali sehari dengan sabun lembut", "Hindari memencet jerawat", "Gunakan produk berlabel non-comedogenic"],
    obat_rekomendasi: [
      { nama: "Asam Salisilat topikal", dosis: "Oles tipis pada area berjerawat", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Benzoil Peroksida 2.5%", dosis: "Oles tipis 1 kali sehari, mulai dari frekuensi rendah", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Gel Sulfur", dosis: "Oles tipis pada bintil jerawat", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Tea Tree Oil", cara_pakai: "Oleskan tipis dengan cotton bud tepat pada bintil" },
      { nama: "Masker Kunyit & Madu", cara_pakai: "Gunakan sebagai masker 2-3 kali seminggu" },
    ],
  },
  {
    nama: "Urtikaria (Biduran)",
    keywords: /urtikaria|biduran|kaligata/i,
    penyebab: ["Reaksi alergi terhadap makanan/obat/lingkungan", "Perubahan suhu mendadak", "Stres atau kelelahan"],
    pencegahan: ["Hindari pemicu alergi yang diketahui", "Kompres dingin pada area yang bentol", "Kenakan pakaian longgar dan sejuk"],
    obat_rekomendasi: [
      { nama: "Cetirizine 10mg", dosis: "1 kali sehari (malam hari)", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Loratadine 10mg", dosis: "1 kali sehari", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Lotion Kalamin", dosis: "Oles pada area yang gatal", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Air Kelapa Hijau", cara_pakai: "Diminum untuk membantu meredakan reaksi alergi" },
      { nama: "Kompres Air Dingin", cara_pakai: "Kompres pada area bentol selama 10-15 menit" },
    ],
  },
  {
    nama: "Scabies (Kudis)",
    keywords: /scabies|kudis|tungau/i,
    penyebab: ["Infeksi tungau Sarcoptes scabiei", "Kontak kulit langsung dengan penderita", "Berbagi pakaian/sprei yang terkontaminasi"],
    pencegahan: ["Cuci pakaian dan sprei dengan air panas", "Hindari kontak kulit langsung dengan penderita", "Rawat seluruh anggota keluarga serumah bersamaan"],
    obat_rekomendasi: [
      { nama: "Salep Permethrin 5%", dosis: "Sesuai resep dokter, dioleskan ke seluruh tubuh", catatan: "Perlu resep dan pemantauan dokter." },
    ],
    obat_herbal: [
      { nama: "Minyak Mimba (Neem Oil)", cara_pakai: "Oleskan tipis pada area yang gatal" },
      { nama: "Minyak Cengkeh terencerkan", cara_pakai: "Oleskan tipis, hindari kontak dengan mata" },
    ],
  },
  {
    nama: "Impetigo & Infeksi Bakteri Kulit (Bisul/Folikulitis)",
    keywords: /impetigo|bisul|folikulitis|folikel/i,
    penyebab: ["Infeksi bakteri (Staphylococcus/Streptococcus) pada folikel rambut", "Kebersihan kulit yang kurang terjaga", "Gesekan atau pencukuran pada kulit yang teriritasi"],
    pencegahan: ["Jaga area tetap bersih dan kering", "Jangan memencet atau memecahkan bintil", "Hindari mencukur area yang terinfeksi sampai sembuh", "Gunakan pakaian longgar untuk menghindari gesekan"],
    obat_rekomendasi: [
      { nama: "Salep Povidone Iodine", dosis: "Oles tipis 2 kali sehari pada area yang terkena", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Chlorhexidine", dosis: "Gunakan sebagai antiseptik pembersih area", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Ekstrak Bawang Putih terencerkan", cara_pakai: "Oleskan tipis pada area yang terkena" },
      { nama: "Air Daun Sirih", cara_pakai: "Gunakan sebagai kompres antiseptik alami" },
    ],
  },
  {
    nama: "Herpes Zoster & Virus Kulit",
    keywords: /herpes|cacar/i,
    penyebab: ["Reaktivasi virus varicella-zoster", "Daya tahan tubuh yang menurun", "Stres atau kelelahan berlebih"],
    pencegahan: ["Istirahat cukup dan jaga daya tahan tubuh", "Hindari menggaruk gelembung", "Segera periksa ke dokter untuk terapi antivirus"],
    obat_rekomendasi: [
      { nama: "Parasetamol 500mg", dosis: "Sesuai kebutuhan untuk nyeri, maksimal 3-4 kali sehari", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Bedak Salisil", dosis: "Tabur tipis pada area yang gatal", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Kompres Dingin Antiseptik", cara_pakai: "Kompres lembut pada area yang nyeri" },
    ],
  },
  {
    nama: "Psoriasis",
    keywords: /psoriasis/i,
    penyebab: ["Gangguan autoimun yang mempercepat regenerasi kulit", "Faktor genetik/keturunan", "Stres atau cuaca dingin dan kering"],
    pencegahan: ["Jaga kulit tetap lembap", "Kelola stres dengan baik", "Hindari menggaruk atau mengelupas plak"],
    obat_rekomendasi: [
      { nama: "Petroleum Jelly", dosis: "Oles tipis untuk menjaga kelembapan kulit", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Salep Asam Salisilat", dosis: "Oles tipis pada plak bersisik", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Lidah Buaya", cara_pakai: "Oleskan gel tipis pada plak" },
      { nama: "Mandi Garam Epsom", cara_pakai: "Rendam area yang terkena 10-15 menit" },
    ],
  },
  {
    nama: "Gigitan Serangga & Dermatitis Venenata",
    keywords: /gigitan|serangga|racun|venenata/i,
    penyebab: ["Gigitan atau sengatan serangga", "Kontak dengan racun/bulu serangga", "Reaksi alergi terhadap air liur serangga"],
    pencegahan: ["Hindari menggaruk area gigitan", "Gunakan losion anti-nyamuk saat beraktivitas di luar", "Kompres dingin segera setelah tergigit"],
    obat_rekomendasi: [
      { nama: "Krim Hydrocortisone", dosis: "Oles tipis pada area gigitan", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Kompres Dingin NaCl", dosis: "Kompres 10-15 menit pada area yang bengkak", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Gel Aloe Vera", cara_pakai: "Oleskan tipis pada area gigitan" },
    ],
  },
  {
    nama: "Eksim Dishidrotik / Miliaria",
    keywords: /dishidrotik|miliaria|biang keringat/i,
    penyebab: ["Penyumbatan kelenjar keringat", "Kelembapan dan panas berlebih", "Reaksi stres atau alergi pada kulit tangan"],
    pencegahan: ["Jaga kulit tetap sejuk dan kering", "Kenakan pakaian yang menyerap keringat", "Hindari paparan panas berlebih"],
    obat_rekomendasi: [
      { nama: "Krim Klorokuinon", dosis: "Sesuai anjuran dokter/apoteker", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Pelembap ringan", dosis: "Gunakan rutin setelah mandi", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Kompres Daun Sirih", cara_pakai: "Gunakan sebagai kompres pada area yang gatal" },
    ],
  },
  {
    nama: "Dermatitis Seboroik",
    keywords: /seboroik|ketombe/i,
    penyebab: ["Produksi minyak berlebih di kulit kepala", "Pertumbuhan jamur Malassezia", "Kulit kepala kurang terjaga kebersihannya"],
    pencegahan: ["Cuci rambut secara teratur", "Hindari produk rambut yang terlalu berat/berminyak", "Kelola stres yang dapat memicu kekambuhan"],
    obat_rekomendasi: [
      { nama: "Sampo Selenium Sulfida", dosis: "Gunakan 2-3 kali seminggu", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Krim Ketokonazol", dosis: "Oles tipis pada area yang gatal", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Minyak Pohon Teh encer", cara_pakai: "Campurkan sedikit ke sampo sebelum digunakan" },
    ],
  },
  {
    nama: "Ruam Alergi / Eksim Kontak Ringan",
    keywords: /ruam|alergi kulit/i,
    penyebab: ["Kontak dengan bahan alergen ringan", "Iritasi akibat gesekan atau keringat", "Reaksi sensitif kulit terhadap produk tertentu"],
    pencegahan: ["Hindari pemicu yang diketahui", "Gunakan pelembap hipoalergenik", "Kompres dingin bila terasa panas/gatal"],
    obat_rekomendasi: [
      { nama: "Krim Hidrokortison", dosis: "Oles tipis 1-2 kali sehari", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
      { nama: "Gel Aloe Vera", dosis: "Oles tipis pada area yang merah", catatan: "Konsultasikan dengan dokter/apoteker bila perlu." },
    ],
    obat_herbal: [
      { nama: "Kompres Daun Lidah Buaya", cara_pakai: "Kompres lembut pada area yang teriritasi" },
    ],
  },
];

function matchDiseaseKnowledge(...texts: Array<string | undefined>): DiseaseKnowledge | null {
  const haystack = texts.filter(Boolean).join(" ");
  if (!haystack) return null;

  let best: { entry: DiseaseKnowledge; score: number } | null = null;
  for (const entry of DISEASE_KNOWLEDGE_BASE) {
    const globalFlags = entry.keywords.flags.includes("g")
      ? entry.keywords.flags
      : `${entry.keywords.flags}g`;
    const matches = haystack.match(new RegExp(entry.keywords.source, globalFlags));
    const score = matches ? matches.length : 0;
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best?.entry ?? null;
}

function normalizeDangerLevel(value: unknown): ScanResult["tingkat_bahaya"] {
  const normalized = typeof value === "string" ? value.toLowerCase() : "rendah";
  return normalized === "sedang" || normalized === "tinggi" ? normalized : "rendah";
}

export function parseStructuredJson(text: string): Record<string, unknown> {
  const rawText = String(text ?? "").trim();
  if (!rawText) {
    throw new Error("AI tidak mengembalikan hasil analisis yang valid.");
  }

  const withoutFence = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const candidates = [withoutFence];

  const objectStart = withoutFence.indexOf("{");
  const objectEnd = withoutFence.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    candidates.push(withoutFence.slice(objectStart, objectEnd + 1));
  }

  const arrayStart = withoutFence.indexOf("[");
  const arrayEnd = withoutFence.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    candidates.push(withoutFence.slice(arrayStart, arrayEnd + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    } catch {
      // continue to next candidate
    }
  }

  throw new Error("AI mengembalikan format JSON yang tidak valid.");
}

export function normalizeScanResultPayload(value: unknown): ScanResult {
  if (!isRecord(value)) {
    return {
      gambar_dapat_dianalisis: true,
      nama_penyakit: "Kondisi tidak spesifik",
      ringkasan: "AI tidak mengembalikan data yang valid untuk hasil scan.",
      tingkat_bahaya: "rendah",
      penyebab: [],
      pencegahan_mandiri: [],
      harus_ke_dokter: false,
      alasan_ke_dokter: "",
      obat_rekomendasi: [],
      obat_herbal: [],
      catatan_tambahan: "",
      tingkat_keyakinan: "rendah",
    };
  }

  const originalRaw = value as Record<string, unknown>;

  // Handle providers that wrap the answer in a multi-candidate array
  // (e.g. "kemungkinan_penyakit") instead of the flat schema. Merge the
  // best candidate underneath the top-level fields so anything already
  // present at the root (like "ringkasan" or "gambar_dapat_dianalisis")
  // still wins.
  const multiCandidateSource =
    Array.isArray(originalRaw.kemungkinan_penyakit)
      ? originalRaw.kemungkinan_penyakit
      : Array.isArray(originalRaw.diagnosis)
        ? originalRaw.diagnosis
        : Array.isArray(originalRaw.differential_diagnosis)
          ? originalRaw.differential_diagnosis
          : Array.isArray(originalRaw.kemungkinan_diagnosis)
            ? originalRaw.kemungkinan_diagnosis
            : null;

  const primaryCandidate = multiCandidateSource ? pickPrimaryCandidate(multiCandidateSource) : null;

  const raw: Record<string, unknown> = primaryCandidate
    ? { ...primaryCandidate, ...originalRaw }
    : originalRaw;

  const getFirstStringValue = (...keys: string[]) => {
    for (const key of keys) {
      const value = raw[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    return "";
  };

  const getFirstBooleanValue = (...keys: string[]) => {
    for (const key of keys) {
      const value = raw[key];
      if (typeof value === "boolean") return value;
    }
    return false;
  };

  const medicineSource =
    firstNonEmptySource(
      raw.obat_rekomendasi,
      raw.rekomendasi_obat,
      raw.rekomendasi,
      raw.obat,
      raw["Rekomendasi Obat & Medis"],
      raw["Rekomendasi Obat"],
      raw["Obat Rekomendasi"],
    ) ?? [];

  const herbalSource =
    firstNonEmptySource(
      raw.obat_herbal,
      raw.obat_herbal_alami,
      raw.herbal,
      raw.herbal_alami,
      raw["Obat Herbal Alami"],
      raw["Obat Herbal"],
    ) ?? [];

  const namaPenyakitRaw = getFirstStringValue("nama_penyakit", "Nama Penyakit");
  const ringkasanValue =
    getFirstStringValue("ringkasan", "Ringkasan") || "AI belum menilai kondisi dengan detail yang cukup.";

  // Flatten any array/object source into plain text so it can be searched
  // for keywords, without assuming a particular shape.
  const flattenToText = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(flattenToText).join(" ");
    if (isRecord(value)) return Object.values(value).map(flattenToText).join(" ");
    return "";
  };

  // The model sometimes leaves "nama_penyakit"/"penyebab" blank (or too
  // generic) even while clearly naming or implying a condition elsewhere —
  // inside "ringkasan", or inside its own obat/herbal suggestions (e.g.
  // "...jika dicurigai akibat gigitan serangga"). Search everything we have
  // before giving up to the generic default, matched against the same
  // knowledge base as SYSTEM_PROMPT.
  const knowledgeMatch = matchDiseaseKnowledge(
    namaPenyakitRaw,
    ringkasanValue,
    getFirstStringValue("alasan_ke_dokter", "Alasan Ke Dokter"),
    flattenToText(medicineSource),
    flattenToText(herbalSource),
  );

  const namaPenyakitValue = namaPenyakitRaw || knowledgeMatch?.nama || "Kondisi tidak spesifik";

  const penyebabList = toStringArray(
    firstNonEmptySource(
      raw.penyebab,
      raw.kemungkinan_penyebab,
      raw.kemungkinan,
      raw.cause,
      // KoboiLLM may return "gejala" instead of "penyebab"
      raw.gejala,
      raw.symptoms,
      // Multi-candidate providers (see pickPrimaryCandidate) explain
      // their reasoning per-candidate in "alasan_analisis"
      raw.alasan_analisis,
      raw["Kemungkinan Penyebab"],
      raw["Kemungkinan Penyebabnya"],
    ),
  );

  const pencegahanList = toStringArray(
    firstNonEmptySource(
      raw.pencegahan_mandiri,
      raw.pencegahan,
      raw.prevention,
      raw.preventive,
      // KoboiLLM may return "saran_perawatan" instead of "pencegahan_mandiri"
      raw.saran_perawatan,
      raw.saran,
      raw.tips,
      raw["Pencegahan Mandiri"],
      raw["Pencegahan"],
    ),
  );

  const modelMedicineList = normalizeMedicineList(medicineSource);
  const modelHerbalList = normalizeHerbalList(herbalSource);

  return {
    gambar_dapat_dianalisis:
      typeof raw.gambar_dapat_dianalisis === "boolean"
        ? raw.gambar_dapat_dianalisis
        : typeof raw["Gambar Dapat Dianalisis"] === "boolean"
          ? raw["Gambar Dapat Dianalisis"]
          : true,
    nama_penyakit: namaPenyakitValue,
    ringkasan: ringkasanValue,
    tingkat_bahaya: normalizeDangerLevel(
      getFirstStringValue("tingkat_bahaya", "Tingkat Bahaya", "level") || "rendah",
    ),
    // Never surface a truly empty cause list to the UI: fall back to the
    // matched reference dataset first, then to a generic message grounded
    // in whatever diagnosis text we do have — rather than "Tidak ada data
    // penyebab yang tersedia."
    penyebab:
      penyebabList.length > 0
        ? penyebabList
        : knowledgeMatch
          ? knowledgeMatch.penyebab
          : [
              `Belum dapat dipastikan tanpa pemeriksaan langsung; kemungkinan terkait iritasi, infeksi, atau reaksi alergi kulit yang berkaitan dengan ${namaPenyakitValue.toLowerCase()}.`,
            ],
    pencegahan_mandiri:
      pencegahanList.length > 0
        ? pencegahanList
        : knowledgeMatch
          ? knowledgeMatch.pencegahan
          : [
              "Jaga kebersihan dan kelembapan area yang terkena, hindari memencet/menggaruk, dan pantau perkembangan gejala selama beberapa hari.",
            ],
    harus_ke_dokter: getFirstBooleanValue("harus_ke_dokter", "Harus Ke Dokter"),
    alasan_ke_dokter:
      getFirstStringValue("alasan_ke_dokter", "Alasan Ke Dokter") || "",
    obat_rekomendasi:
      modelMedicineList.length > 0
        ? modelMedicineList
        : knowledgeMatch
          ? knowledgeMatch.obat_rekomendasi
          : [],
    obat_herbal:
      modelHerbalList.length > 0
        ? modelHerbalList
        : knowledgeMatch
          ? knowledgeMatch.obat_herbal
          : [],
    catatan_tambahan:
      getFirstStringValue("catatan_tambahan", "Catatan Tambahan") || "",
    tingkat_keyakinan: normalizeDangerLevel(
      getFirstStringValue("tingkat_keyakinan", "Tingkat Keyakinan", "keyakinan") || "sedang",
    ),
  };
}

async function analyzeWithKoboiLLM(data: {
  imageBase64: string;
  mediaType: string;
}): Promise<ScanResult> {
  const apiKey = (process.env.KOBOILLM_API_KEY || process.env.OPENAI_API_KEY)?.trim();
  if (!apiKey) throw new Error("KOBOILLM_API_KEY belum dikonfigurasi di server.");

  let baseUrl = (process.env.KOBOILLM_BASE_URL || process.env.OPENAI_BASE_URL)?.trim() || "https://api.koboillm.com/v1";
  let url = baseUrl;
  if (!url.endsWith("/chat/completions")) {
    if (url.endsWith("/v1")) {
      url = `${url}/chat/completions`;
    } else if (url.endsWith("/")) {
      url = `${url}v1/chat/completions`;
    } else {
      url = `${url}/v1/chat/completions`;
    }
  }

  const model = process.env.KOBOILLM_MODEL || "gemini-2.5-flash";

  let lastKoboError: Error | null = null;
  // Force the flat schema so the model can't fall back to a multi-candidate
  // shape like "kemungkinan_penyakit" (which normalizeScanResultPayload only
  // handles as a best-effort fallback, not the primary path). If the
  // endpoint rejects response_format outright, we drop it and retry.
  let useSchema = true;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:${data.mediaType};base64,${data.imageBase64}` },
                },
                { type: "text", text: USER_PROMPT },
              ],
            },
          ],
          max_tokens: 1500,
          ...(useSchema
            ? {
                response_format: {
                  type: "json_schema",
                  json_schema: {
                    name: "scan_result",
                    strict: true,
                    schema: SCAN_RESULT_JSON_SCHEMA,
                  },
                },
              }
            : {}),
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        // Some KoboiLLM/litellm routes don't support strict json_schema
        // response_format for certain models. Drop it and retry once.
        if (
          useSchema &&
          (res.status === 400 || res.status === 422) &&
          /response_format|json_schema/i.test(errText)
        ) {
          useSchema = false;
          lastKoboError = new Error(`KoboiLLM (status ${res.status}). ${errText.slice(0, 250)}`);
          continue;
        }
        throw new Error(`KoboiLLM (status ${res.status}). ${errText.slice(0, 250)}`);
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string | null; refusal?: string | null } }>;
      };

      const message = payload.choices?.[0]?.message;
      if (message?.refusal) {
        throw new Error(
          "AI menolak menganalisis gambar ini. Coba unggah foto yang lebih jelas dan relevan dengan kondisi kesehatan.",
        );
      }

      const text = message?.content;
      if (!text) {
        throw new Error("AI tidak mengembalikan hasil analisis yang valid.");
      }

      return normalizeScanResultPayload(parseStructuredJson(text));
    } catch (err) {
      lastKoboError = err instanceof Error ? err : new Error(String(err));
      if (lastKoboError.message.includes("menolak menganalisis")) throw lastKoboError;
      if (isRetryableNetworkError(lastKoboError) && attempt < 3) {
        console.warn(`[KoboiLLM] Network error on attempt ${attempt}, retrying in ${attempt * 2000}ms:`, lastKoboError.message);
        await delayMs(attempt * 2000);
        continue;
      }
      if (isRetryableNetworkError(lastKoboError)) {
        throw new Error("Koneksi ke KoboiLLM terputus akibat gangguan jaringan. Pastikan koneksi internet stabil lalu coba lagi.");
      }
      throw lastKoboError;
    }
  }
  throw lastKoboError ?? new Error("Gagal menghubungi KoboiLLM API.");
}

function getOpenAIBaseUrl(): string {
  const customBase = process.env.OPENAI_BASE_URL?.trim() || process.env.KOBOILLM_BASE_URL?.trim();
  if (customBase) {
    if (customBase.endsWith("/v1")) return customBase;
    if (customBase.endsWith("/")) return `${customBase}v1`;
    return customBase;
  }
  return "https://api.openai.com/v1";
}

async function analyzeWithOpenAI(data: {
  imageBase64: string;
  mediaType: string;
}): Promise<ScanResult> {
  const apiKey = (process.env.OPENAI_API_KEY || process.env.KOBOILLM_API_KEY)?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY belum dikonfigurasi di server. Tambahkan API key OpenAI ke file .env lalu restart server.",
    );
  }

  const baseUrl = getOpenAIBaseUrl();
  const models = Array.from(
    new Set(
      [process.env.OPENAI_MODEL, process.env.KOBOILLM_MODEL, "gpt-4o", "gpt-4o-mini"].filter(
        (m): m is string => Boolean(m),
      ),
    ),
  );

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const isCustomBase = baseUrl !== "https://api.openai.com/v1";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:${data.mediaType};base64,${data.imageBase64}` },
                },
                { type: "text", text: USER_PROMPT },
              ],
            },
          ],
          response_format: isCustomBase
            ? { type: "json_object" }
            : {
                type: "json_schema",
                json_schema: {
                  name: "scan_result",
                  strict: true,
                  schema: SCAN_RESULT_JSON_SCHEMA,
                },
              },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`OpenAI/KoboiLLM ${model} (status ${res.status}). ${errText.slice(0, 250)}`);
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string | null; refusal?: string | null } }>;
      };

      const message = payload.choices?.[0]?.message;
      if (message?.refusal) {
        throw new Error(
          "AI menolak menganalisis gambar ini. Coba unggah foto yang lebih jelas dan relevan dengan kondisi kesehatan.",
        );
      }

      const text = message?.content;
      if (!text) {
        throw new Error("AI tidak mengembalikan hasil analisis yang valid.");
      }

      return normalizeScanResultPayload(parseStructuredJson(text));
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message.includes("menolak menganalisis")) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Gagal menghubungi OpenAI API.");
}

function toGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map(toGeminiSchema);
  }
  if (schema !== null && typeof schema === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      if (key === "additionalProperties") continue;
      if (key === "type" && typeof value === "string") {
        result[key] = value.toUpperCase();
      } else {
        result[key] = toGeminiSchema(value);
      }
    }
    return result;
  }
  return schema;
}

const SCAN_CACHE = new Map<string, { result: ScanResult; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36) + str.length;
}

const GEMINI_RESULT_SCHEMA = toGeminiSchema(SCAN_RESULT_JSON_SCHEMA);

const delayMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Returns true for transient network errors that are safe to retry:
 * - Windows WSARECV / stream reading error (connection aborted by host)
 * - ECONNABORTED / ECONNRESET (TCP reset)
 * - AbortError from timeout
 * - fetch failed (generic network failure)
 */
function isRetryableNetworkError(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return (
    msg.includes("wsarecv") ||
    msg.includes("stream reading error") ||
    msg.includes("econnaborted") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("fetch failed") ||
    msg.includes("network error") ||
    err.name === "AbortError" ||
    err.name === "TimeoutError"
  );
}

async function analyzeWithGemini(data: {
  imageBase64: string;
  mediaType: string;
}): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di server. Tambahkan API key Gemini ke file .env lalu restart server.",
    );
  }

  const cacheKey = getSimpleHash(data.imageBase64);
  const cached = SCAN_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.5-pro"];

  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            signal: AbortSignal.timeout(45000),
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType: data.mediaType,
                        data: data.imageBase64,
                      },
                    },
                    { text: USER_PROMPT },
                  ],
                },
              ],
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
              },
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: GEMINI_RESULT_SCHEMA,
                maxOutputTokens: 2500,
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          },
        );

        if (res.status === 404) {
          const errText = await res.text().catch(() => "");
          lastError = new Error(`Gemini ${model} (status 404). ${errText.slice(0, 200)}`);
          break; // skip to next model
        }

        if (res.status === 503 || res.status === 500 || res.status === 502 || res.status === 504) {
          lastError = new Error(
            `Gemini API (${model}) sedang mengalami lonjakan beban (status ${res.status}).`,
          );
          break; // skip to next model
        }

        if (res.status === 429) {
          if (attempt < 3) {
            await delayMs(attempt * 2000);
            continue;
          }
          lastError = new Error(
            "Batas kuota gratis (rate limit 429) Gemini API sedang tercapai. Silakan tunggu beberapa detik lalu coba kembali.",
          );
          break;
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          lastError = new Error(`Gemini ${model} (status ${res.status}). ${errText.slice(0, 250)}`);
          break;
        }

        const payload = (await res.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }>};
            finishReason?: string;
          }>;
        };

        if (payload.candidates?.[0]?.finishReason === "SAFETY") {
          throw new Error(
            "AI menolak menganalisis gambar ini. Coba unggah foto yang lebih jelas dan relevan dengan kondisi kesehatan.",
          );
        }

        const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
        if (!text) {
          throw new Error("AI tidak mengembalikan hasil analisis yang valid.");
        }

        const parsedResult = normalizeScanResultPayload(parseStructuredJson(text));
        SCAN_CACHE.set(cacheKey, { result: parsedResult, timestamp: Date.now() });
        return parsedResult;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Always rethrow safety refusals immediately
        if (lastError.message.includes("menolak menganalisis")) {
          throw lastError;
        }

        // Retry transient network errors with exponential backoff
        if (isRetryableNetworkError(lastError) && attempt < 3) {
          const backoffMs = attempt * 2000; // 2s, 4s
          console.warn(`[Gemini ${model}] Network error on attempt ${attempt}, retrying in ${backoffMs}ms:`, lastError.message);
          await delayMs(backoffMs);
          continue;
        }

        // For non-retryable errors or exhausted retries, set friendly message and skip model
        if (isRetryableNetworkError(lastError)) {
          lastError = new Error(
            "Koneksi ke server AI terputus akibat gangguan jaringan. Pastikan koneksi internet stabil lalu coba lagi."
          );
        }
      }
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    try {
      return await analyzeWithOpenAI(data);
    } catch {
      // ignore
    }
  }

  throw (
    lastError ??
    new Error(
      "Gagal terhubung ke Gemini API. Mohon periksa GEMINI_API_KEY Anda di file .env.",
    )
  );
}

export const analyzeHealthImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => scanInputSchema.parse(data))
  .handler(async ({ data }): Promise<ScanResult> => {
    const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim();
    if (provider === "koboillm" || provider === "koboldllm") {
      try {
        return await analyzeWithKoboiLLM(data);
      } catch (err) {
        console.warn("KoboiLLM scan analysis failed, attempting Gemini fallback:", err);
        return await analyzeWithGemini(data);
      }
    }
    if (provider === "openai" && process.env.OPENAI_API_KEY?.trim()) {
      try {
        return await analyzeWithOpenAI(data);
      } catch (err) {
        console.warn("OpenAI scan analysis failed, attempting Gemini fallback:", err);
        return await analyzeWithGemini(data);
      }
    }
    return analyzeWithGemini(data);
  });

