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
