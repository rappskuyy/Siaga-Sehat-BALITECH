import test from "node:test";
import assert from "node:assert/strict";
import { normalizeScanResultPayload, parseStructuredJson } from "./scan.server";

test("normalizes alternative AI output keys for medicine and herbal fields", () => {
  const raw = {
    gambar_dapat_dianalisis: true,
    nama_penyakit: "Ruam alergi ringan",
    ringkasan: "Kondisi terlihat seperti iritasi kulit ringan.",
    tingkat_bahaya: "rendah",
    kemungkinan_penyebab: ["Kontak dengan bahan iritan", "Alergi terhadap sabun"],
    pencegahan: ["Hindari pemicu", "Gunakan pelembap"],
    harus_ke_dokter: false,
    alasan_ke_dokter: "",
    rekomendasi_obat: [
      { nama: "Cetirizine", dosis: "10 mg", catatan: "Satu kali sehari bila gatal" },
    ],
    obat_herbal_alami: [
      { nama: "Aloe Vera", cara_penggunaan: "Oleskan gel tipis-tipis ke area yang gatal" },
    ],
    catatan_tambahan: "Pantau perbaikan dalam 2-3 hari.",
    tingkat_keyakinan: "sedang",
  };

  const result = normalizeScanResultPayload(raw);

  assert.deepEqual(result.penyebab, ["Kontak dengan bahan iritan", "Alergi terhadap sabun"]);
  assert.deepEqual(result.pencegahan_mandiri, ["Hindari pemicu", "Gunakan pelembap"]);
  assert.equal(result.obat_rekomendasi[0].nama, "Cetirizine");
  assert.equal(result.obat_herbal[0].nama, "Aloe Vera");
  assert.equal(result.obat_herbal[0].cara_pakai, "Oleskan gel tipis-tipis ke area yang gatal");
});

test("handles capitalized keys and comma-delimited strings from AI dashboards", () => {
  const raw = {
    "Gambar Dapat Dianalisis": true,
    "Nama Penyakit": "Iritasi Kulit Ringan",
    "Ringkasan": "Gatal dan kemerahan tampak pada area yang terpapar iritan.",
    "Tingkat Bahaya": "rendah",
    "Kemungkinan Penyebab": "Kontak dengan sabun, bahan kimia, atau panas",
    "Pencegahan Mandiri": "Hindari pemicu, gunakan pelembap, dan jaga area tetap kering",
    "Harus Ke Dokter": false,
    "Alasan Ke Dokter": "",
    "Rekomendasi Obat & Medis": [
      { name: "Hydrocortisone 1%", dose: "Oles tipis 2 kali sehari", note: "Gunakan sesuai kebutuhan" },
    ],
    "Obat Herbal Alami": "Aloe Vera; Kompres air dingin",
    "Catatan Tambahan": "Pantau bila makin memburuk.",
    "Tingkat Keyakinan": "sedang",
  };

  const result = normalizeScanResultPayload(raw);

  assert.deepEqual(result.penyebab, ["Kontak dengan sabun", "bahan kimia", "atau panas"]);
  assert.equal(result.pencegahan_mandiri[0], "Hindari pemicu");
  assert.equal(result.obat_rekomendasi[0].nama, "Hydrocortisone 1%");
  assert.equal(result.obat_herbal[0].nama, "Aloe Vera");
});

test("extracts valid JSON from model text that wraps the response with markdown or commentary", () => {
  const responseText = [
    "Berikut hasil analisis saya:",
    "",
    "```json",
    "{",
    '  "gambar_dapat_dianalisis": true,',
    '  "nama_penyakit": "Eksim kontak ringan",',
    '  "ringkasan": "Area kulit tampak kemerahan dan gatal karena iritasi.",',
    '  "tingkat_bahaya": "rendah",',
    '  "penyebab": ["Kontak dengan sabun"],',
    '  "pencegahan_mandiri": ["Hindari pemicu", "Gunakan pelembap"],',
    '  "harus_ke_dokter": false,',
    '  "alasan_ke_dokter": "",',
    '  "obat_rekomendasi": [{ "nama": "Hydrocortisone 1%", "dosis": "Oles tipis 2 kali sehari", "catatan": "Gunakan sesuai kebutuhan" }],',
    '  "obat_herbal": [{ "nama": "Aloe Vera", "cara_pakai": "Oleskan gel tipis-tipis" }],',
    '  "catatan_tambahan": "Pantau dalam 2-3 hari.",',
    '  "tingkat_keyakinan": "sedang"',
    "}",
    "```",
    "",
    "Semoga membantu.",
  ].join("\n");

  const parsed = parseStructuredJson(responseText);

  assert.equal(parsed.nama_penyakit, "Eksim kontak ringan");
  assert.equal(parsed.gambar_dapat_dianalisis, true);
  assert.equal((parsed.obat_rekomendasi as Array<{ nama: string }>)[0].nama, "Hydrocortisone 1%");
});

test("normalizes KoboiLLM's multi-candidate 'kemungkinan_penyakit' wrapper", () => {
  const raw = {
    gambar_dapat_dianalisis: true,
    ringkasan:
      "Berdasarkan gambar, terlihat adanya banyak bintil kemerahan yang berisi nanah (pustula) keputihan/kekuningan.",
    kemungkinan_penyakit: [
      {
        nama_penyakit: "Folikulitis",
        tingkat_bahaya: "sedang",
        harus_ke_dokter: true,
        alasan_analisis: "Terdapat pustula multipel yang berpusat pada folikel rambut.",
        obat_rekomendasi: ["Povidone Iodine (oleskan tipis 2x sehari)"],
        obat_herbal: ["Tea Tree Oil (dioleskan tipis setelah bersih)"],
        saran_perawatan: [
          "JANGAN memencet atau memecahkan bintil.",
          "Jaga area tetap bersih dan kering.",
        ],
      },
      {
        nama_penyakit: "Jerawat Pustul (Acne Vulgaris)",
        tingkat_bahaya: "rendah",
        harus_ke_dokter: false,
        alasan_analisis: "Meski mirip, jerawat pustul biasanya tidak sebanyak ini.",
        obat_rekomendasi: ["Gel Benzoil Peroksida 2.5%"],
        obat_herbal: ["Tea Tree Oil"],
        saran_perawatan: ["Jangan dipencet."],
      },
    ],
  };

  const result = normalizeScanResultPayload(raw);

  // Should pick the higher-danger candidate (Folikulitis, "sedang") as primary.
  assert.equal(result.nama_penyakit, "Folikulitis");
  assert.equal(result.tingkat_bahaya, "sedang");
  assert.equal(result.harus_ke_dokter, true);
  assert.equal(result.obat_rekomendasi[0].nama, "Povidone Iodine");
  assert.ok(result.obat_herbal[0].nama.includes("Tea Tree Oil"));
  assert.ok(result.pencegahan_mandiri.length > 0);
  assert.ok(result.penyebab.length > 0);
  // Top-level ringkasan must win over anything inside the candidate array.
  assert.equal(
    result.ringkasan,
    "Berdasarkan gambar, terlihat adanya banyak bintil kemerahan yang berisi nanah (pustula) keputihan/kekuningan.",
  );
});

test("falls back past an empty 'penyebab' array to alternative keys, then to a generic message", () => {
  // Case 1: model returns penyebab: [] but a usable alternative key exists.
  // A plain `??` chain would incorrectly stop at the empty array.
  const withAlternative = normalizeScanResultPayload({
    gambar_dapat_dianalisis: true,
    nama_penyakit: "Folikulitis",
    ringkasan: "Bintil kemerahan berisi nanah di sekitar folikel rambut.",
    tingkat_bahaya: "sedang",
    penyebab: [],
    alasan_analisis: "Terdapat pustula multipel yang berpusat pada folikel rambut.",
    pencegahan_mandiri: ["Jaga area tetap bersih dan kering."],
    harus_ke_dokter: true,
    alasan_ke_dokter: "",
    obat_rekomendasi: [],
    obat_herbal: [],
    catatan_tambahan: "",
    tingkat_keyakinan: "sedang",
  });
  assert.deepEqual(withAlternative.penyebab, [
    "Terdapat pustula multipel yang berpusat pada folikel rambut",
  ]);

  // Case 2: every possible cause-related key is empty/missing, and the text
  // doesn't match anything in the reference knowledge base either — must
  // still never render as a truly empty list.
  const noAlternative = normalizeScanResultPayload({
    gambar_dapat_dianalisis: true,
    nama_penyakit: "Kondisi tidak dikenal",
    ringkasan: "Tidak terlihat ciri spesifik pada gambar yang diunggah.",
    tingkat_bahaya: "rendah",
    penyebab: [],
    pencegahan_mandiri: [],
    harus_ke_dokter: false,
    alasan_ke_dokter: "",
    obat_rekomendasi: [],
    obat_herbal: [],
    catatan_tambahan: "",
    tingkat_keyakinan: "rendah",
  });
  assert.ok(noAlternative.penyebab.length > 0);
  assert.match(noAlternative.penyebab[0], /kondisi tidak dikenal/i);
});

test("recovers a disease name and reference recommendations from free-text 'ringkasan' when structured fields are left empty", () => {
  // Reproduces a real observed case: the model clearly names "folikulitis"
  // inside the prose summary but leaves nama_penyakit/penyebab/pencegahan/
  // obat_rekomendasi/obat_herbal empty despite the strict JSON schema
  // (empty string/array still satisfies "required" + type constraints).
  const result = normalizeScanResultPayload({
    gambar_dapat_dianalisis: true,
    nama_penyakit: "",
    ringkasan:
      "Berdasarkan gambar, terlihat adanya bintil-bintil berisi nanah (pustula) yang terpusat pada folikel rambut, dengan area kemerahan di sekitarnya. Kondisi ini sangat mirip dengan folikulitis, yaitu peradangan atau infeksi pada folikel rambut.",
    tingkat_bahaya: "sedang",
    penyebab: [],
    pencegahan_mandiri: [],
    harus_ke_dokter: false,
    alasan_ke_dokter: "",
    obat_rekomendasi: [],
    obat_herbal: [],
    catatan_tambahan: "",
    tingkat_keyakinan: "sedang",
  });

  assert.equal(result.nama_penyakit, "Impetigo & Infeksi Bakteri Kulit (Bisul/Folikulitis)");
  assert.ok(result.penyebab.length > 0);
  assert.ok(result.pencegahan_mandiri.length > 0);
  assert.ok(result.obat_rekomendasi.length > 0);
  assert.ok(result.obat_herbal.length > 0);
  assert.equal(result.obat_rekomendasi[0].nama, "Salep Povidone Iodine");
});

test("guarantees non-empty 'pencegahan_mandiri' even when only obat fields have real data and nothing matches the knowledge base", () => {
  const result = normalizeScanResultPayload({
    gambar_dapat_dianalisis: true,
    nama_penyakit: "",
    ringkasan: "Terlihat area kemerahan dan sedikit bengkak pada kulit.",
    tingkat_bahaya: "rendah",
    penyebab: [],
    pencegahan_mandiri: [],
    harus_ke_dokter: false,
    alasan_ke_dokter: "",
    obat_rekomendasi: [
      "Parasetamol 500mg untuk meredakan nyeri jika ada",
      "Cetirizine 10mg atau Loratadine 10mg jika dicurigai akibat reaksi alergi atau gigitan serangga",
    ],
    obat_herbal: ["Kompres Dingin membantu mengurangi pembengkakan sementara"],
    catatan_tambahan: "",
    tingkat_keyakinan: "rendah",
  });

  // Should recover "Gigitan Serangga" from the herbal/medicine text even
  // though ringkasan itself doesn't mention it directly.
  assert.equal(result.nama_penyakit, "Gigitan Serangga & Dermatitis Venenata");
  assert.ok(result.penyebab.length > 0);
  assert.ok(result.pencegahan_mandiri.length > 0);
});

test("doesn't split a comma-joined list at a comma inside parentheses", () => {
  // Reproduces the observed bug: a single sentence containing "(handuk,
  // pakaian)" was being cut into two broken cards — "...(handuk" and
  // "pakaian)" — because the old splitter didn't know about parentheses.
  const result = normalizeScanResultPayload({
    gambar_dapat_dianalisis: true,
    nama_penyakit: "Tinea (Kurap)",
    ringkasan: "Bercak bersisik dengan batas tegas.",
    tingkat_bahaya: "rendah",
    penyebab: ["Infeksi jamur"],
    pencegahan_mandiri:
      "Jaga kebersihan kulit dengan mandi teratur, Keringkan area kulit dengan benar setelah mandi atau berkeringat, Hindari meminjamkan atau menggunakan barang pribadi bersama (handuk, pakaian), Gunakan pakaian longgar dan menyerap keringat",
    harus_ke_dokter: false,
    alasan_ke_dokter: "",
    obat_rekomendasi: [],
    obat_herbal: [],
    catatan_tambahan: "",
    tingkat_keyakinan: "sedang",
  });

  assert.deepEqual(result.pencegahan_mandiri, [
    "Jaga kebersihan kulit dengan mandi teratur",
    "Keringkan area kulit dengan benar setelah mandi atau berkeringat",
    "Hindari meminjamkan atau menggunakan barang pribadi bersama (handuk, pakaian)",
    "Gunakan pakaian longgar dan menyerap keringat",
  ]);
});

test("doesn't split a decimal dosage like '2.5%' at the decimal point", () => {
  const result = normalizeScanResultPayload({
    gambar_dapat_dianalisis: true,
    nama_penyakit: "Jerawat",
    ringkasan: "Bintil merah dengan komedo.",
    tingkat_bahaya: "rendah",
    penyebab:
      "Pemakaian produk dengan konsentrasi 2.5% berlebihan dapat memicu iritasi, Reaksi alergi terhadap bahan kimia tertentu",
    pencegahan_mandiri: ["Bersihkan wajah rutin"],
    harus_ke_dokter: false,
    alasan_ke_dokter: "",
    obat_rekomendasi: [],
    obat_herbal: [],
    catatan_tambahan: "",
    tingkat_keyakinan: "sedang",
  });

  assert.equal(result.penyebab.length, 2);
  assert.match(result.penyebab[0], /2\.5%/);
});
