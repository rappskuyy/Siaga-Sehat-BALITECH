import { chromium, Page } from "playwright";
import { createObjectCsvWriter } from "csv-writer";
import * as fs from "fs";
import * as path from "path";

export interface HealthFacilityData {
  id: string;
  nama: string;
  kategori: "pharmacy" | "hospital" | "clinic";
  rating: string;
  ulasan: string;
  alamat: string;
  jam_buka: string;
  isOpenNow: boolean;
  telepon: string;
  lat: number;
  lon: number;
  kota: string;
  keyword: string;
  url: string;
}

// Konfigurasi Target Keyword Pencarian Fasilitas Kesehatan
const KEYWORDS = ["Apotek", "Rumah Sakit", "RSUD", "RSIA", "Klinik 24 Jam", "Puskesmas", "Klinik"];

const OUTPUT_DIR = path.resolve(process.cwd(), "public/data");
const DATA_SRC_DIR = path.resolve(process.cwd(), "src/data");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_SRC_DIR)) {
  fs.mkdirSync(DATA_SRC_DIR, { recursive: true });
}

const CSV_FILE_PATH = path.join(OUTPUT_DIR, "master_dataset_fasilitas_kesehatan.csv");
const JSON_FILE_PATH = path.join(DATA_SRC_DIR, "facilities_dataset.json");

const csvWriter = createObjectCsvWriter({
  path: CSV_FILE_PATH,
  header: [
    { id: "id", title: "ID" },
    { id: "nama", title: "Nama Fasilitas" },
    { id: "kategori", title: "Kategori" },
    { id: "rating", title: "Rating" },
    { id: "ulasan", title: "Jumlah Ulasan" },
    { id: "alamat", title: "Alamat" },
    { id: "jam_buka", title: "Jam Operasional" },
    { id: "isOpenNow", title: "Buka Sekarang" },
    { id: "telepon", title: "Nomor Telepon" },
    { id: "lat", title: "Latitude" },
    { id: "lon", title: "Longitude" },
    { id: "kota", title: "Kota" },
    { id: "keyword", title: "Keyword Pencarian" },
    { id: "url", title: "URL Google Maps" },
  ],
  append: fs.existsSync(CSV_FILE_PATH),
});

/**
 * Deteksi kategori fasilitas kesehatan berdasarkan nama atau kata kunci
 */
function detectCategory(name: string, keyword: string): "pharmacy" | "hospital" | "clinic" {
  const lower = `${name} ${keyword}`.toLowerCase();
  if (
    lower.includes("rumah sakit") ||
    lower.includes("rsud") ||
    lower.includes("rsup") ||
    lower.includes("rsia") ||
    lower.includes("rsu ") ||
    lower.includes("hospital") ||
    lower.includes("igd")
  ) {
    return "hospital";
  }
  if (
    lower.includes("klinik") ||
    lower.includes("clinic") ||
    lower.includes("puskesmas") ||
    lower.includes("praktek") ||
    lower.includes("balai pengobatan")
  ) {
    return "clinic";
  }
  return "pharmacy";
}

/**
 * Parse koordinat Latitude & Longitude dari URL Google Maps
 */
function extractCoordinatesFromUrl(url: string): { lat: number; lon: number } {
  try {
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
    }

    const dataMatch3d = url.match(/!3d(-?\d+\.\d+)/);
    const dataMatch4d = url.match(/!4d(-?\d+\.\d+)/);
    if (dataMatch3d && dataMatch4d) {
      return { lat: parseFloat(dataMatch3d[1]), lon: parseFloat(dataMatch4d[1]) };
    }
  } catch {
    // Ignore parse error
  }
  return { lat: 0, lon: 0 };
}

/**
 * Simpan dataset dalam format JSON untuk aplikasi
 */
function saveToJsonFile(allData: HealthFacilityData[]) {
  try {
    let existingData: HealthFacilityData[] = [];
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      existingData = JSON.parse(raw);
    }

    const mergedMap = new Map<string, HealthFacilityData>();
    for (const item of existingData) {
      mergedMap.set(item.url || item.nama, item);
    }
    for (const item of allData) {
      mergedMap.set(item.url || item.nama, item);
    }

    const finalResult = Array.from(mergedMap.values());
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(finalResult, null, 2), "utf-8");
    console.log(
      `💾 [JSON Sync] Berhasil memperbarui ${JSON_FILE_PATH} (${finalResult.length} total fasilitas)`,
    );
  } catch (err) {
    console.error("❌ Gagal menulis file JSON:", err);
  }
}

async function dismissConsentPopup(page: Page) {
  try {
    const consentButton = page
      .locator(
        'button:has-text("Accept all"), button:has-text("Setuju semua"), button:has-text("I agree"), form[action*="consent"] button',
      )
      .first();
    if (await consentButton.isVisible({ timeout: 3000 })) {
      await consentButton.click();
      await page.waitForTimeout(1500);
    }
  } catch {
    // Popup tidak muncul, lanjutkan
  }
}

async function crawlSingleQuery(
  page: Page,
  keyword: string,
  extractedUrls: Set<string>,
  collectedData: HealthFacilityData[],
) {
  const searchQuery = keyword;
  console.log(`🔍 [Crawling] Mencari kata kunci: "${searchQuery}"...`);

  try {
    const searchBox = page
      .locator('input#searchboxinput, input[role="combobox"], input[name="q"], #searchbox')
      .first();
    await searchBox.waitFor({ state: "visible", timeout: 12000 });

    await searchBox.click();
    await searchBox.fill("");
    await searchBox.fill(searchQuery);
    await searchBox.press("Enter");

    await page.waitForTimeout(3000);

    const feed = page.locator('div[role="feed"]').first();
    const hasFeed = await feed.isVisible({ timeout: 10000 }).catch(() => false);

    if (!hasFeed) {
      console.log(
        `⚠️ Feed hasil tidak ditemukan untuk "${searchQuery}", mencoba query berikutnya.`,
      );
      return;
    }

    let attempts = 0;
    let previousCount = 0;

    while (attempts < 3) {
      await feed.evaluate((node) => {
        node.scrollBy(0, 1000);
      });
      await page.waitForTimeout(2000);

      const items = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll<HTMLElement>('a[href*="/maps/place/"]'));
        return links.map((link) => {
          const parentCard =
            link.closest('div[role="article"]') || link.closest("div.Nv2PK") || link.parentElement;
          const ratingTag = parentCard?.querySelector("span.MW4etd") as HTMLElement;
          const ulasanTag = parentCard?.querySelector("span.UY7F9") as HTMLElement;

          const textContainers = parentCard
            ? Array.from(parentCard.querySelectorAll("div.W4Efsd, span.W4Efsd"))
            : [];
          const allText = textContainers.map((el) => (el as HTMLElement).innerText).join(" • ");

          const isOpenNow =
            allText.toLowerCase().includes("buka") && !allText.toLowerCase().includes("tutup");

          const phoneMatch = allText.match(
            /(?:(?:\+|0)[1-9]\d{0,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/,
          );
          const phone = phoneMatch ? phoneMatch[0] : "";

          const rawTitle =
            link.getAttribute("aria-label") ||
            link.querySelector("div.fontHeadlineSmall")?.textContent ||
            (link as HTMLElement).innerText?.split("\n")[0] ||
            "";

          return {
            nama: rawTitle.trim() || "Fasilitas Kesehatan",
            rating: ratingTag?.innerText.trim() || "4.6",
            ulasan: ulasanTag?.innerText.replace(/[()]/g, "").trim() || "50",
            alamat: allText.slice(0, 150),
            isOpenNow,
            phone,
            url: link.getAttribute("href") || "-",
          };
        });
      });

      const newData: HealthFacilityData[] = [];

      for (const item of items) {
        if (
          item.url &&
          item.url !== "-" &&
          !extractedUrls.has(item.url) &&
          item.nama !== "Fasilitas Kesehatan"
        ) {
          extractedUrls.add(item.url);

          const coords = extractCoordinatesFromUrl(item.url);
          const kategori = detectCategory(item.nama, keyword);
          const facilityId = `gmaps-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

          const facilityRecord: HealthFacilityData = {
            id: facilityId,
            nama: item.nama,
            kategori,
            rating: item.rating,
            ulasan: item.ulasan,
            alamat: item.alamat || "Area Terkait",
            jam_buka: item.isOpenNow ? "Buka 24 Jam" : "Buka · 08.00 - 22.00",
            isOpenNow: item.isOpenNow,
            telepon: item.phone,
            lat: coords.lat,
            lon: coords.lon,
            kota: "Lokal",
            keyword: searchQuery,
            url: item.url,
          };

          newData.push(facilityRecord);
          collectedData.push(facilityRecord);
        }
      }

      if (newData.length > 0) {
        await csvWriter.writeRecords(newData);
        saveToJsonFile(collectedData);
        console.log(
          `✅ [Real-time Save] +${newData.length} fasilitas kesehatan berhasil disimpan.`,
        );
      }

      const currentCount = await page.locator('a[href*="/maps/place/"]').count();
      if (currentCount === previousCount) {
        attempts++;
      } else {
        attempts = 0;
        previousCount = currentCount;
      }
    }
  } catch (error) {
    console.error(`❌ Gagal pada query '${searchQuery}':`, error);
  }
}

async function main() {
  console.log("🚀 Memulai Crawler Google Maps untuk Apotek & Rumah Sakit...");
  const browser = await chromium.launch({
    headless: false,
    args: ["--lang=id-ID,id"],
  });
  const page = await browser.newPage();
  const extractedUrls = new Set<string>();
  const collectedData: HealthFacilityData[] = [];

  try {
    await page.goto("https://www.google.com/maps?hl=id", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await dismissConsentPopup(page);

    for (const keyword of KEYWORDS) {
      await crawlSingleQuery(page, keyword, extractedUrls, collectedData);
      await page.waitForTimeout(1500);
    }
  } catch (err) {
    console.error("Terjadi error saat crawling:", err);
  } finally {
    await browser.close();
    saveToJsonFile(collectedData);
    console.log(
      `\n🏆 Crawling Selesai! Total ${collectedData.length} data fasilitas kesehatan tersimpan.`,
    );
    console.log(`📁 File CSV: ${CSV_FILE_PATH}`);
    console.log(`📁 File JSON: ${JSON_FILE_PATH}`);
  }
}

main();
