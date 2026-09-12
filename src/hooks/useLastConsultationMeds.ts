import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { REMINDERS_UPDATED_EVENT } from "@/hooks/useMedicineReminders";

export interface RecommendedMed {
  nama: string;
  dosis: string;
  catatan: string;
  penyakit: string;
  sourceType: "scan" | "consultation";
  sourceId: string;
}

export function useLastConsultationMeds() {
  const { user } = useAuth();
  const [meds, setMeds] = useState<RecommendedMed[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeds = useCallback(async () => {
    if (!user) { setMeds([]); return; }
    setLoading(true);

    // Fetch several recent scan histories so the user can choose the condition.
    const { data: scanData } = await supabase
      .from("scan_history")
      .select("id, nama_penyakit, obat_rekomendasi, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const scanMeds: RecommendedMed[] = [];
    if (scanData) {
      for (const row of scanData) {
        const obats = Array.isArray(row.obat_rekomendasi)
          ? (row.obat_rekomendasi as Array<{ nama?: string; dosis?: string; catatan?: string }>)
          : [];
        for (const o of obats) {
          const namaTrimmed = o.nama?.trim();
          const penyakitTrimmed = row.nama_penyakit?.trim();
          if (!namaTrimmed || !penyakitTrimmed) continue;
          scanMeds.push({
            nama: namaTrimmed,
            dosis: o.dosis?.trim() ?? "",
            catatan: o.catatan?.trim() ?? "",
            penyakit: penyakitTrimmed,
            sourceType: "scan",
            sourceId: row.id,
          });
        }
      }
    }

    // Deduplicate by disease and medicine name (case-insensitive)
    const seen = new Set<string>();
    const unique = scanMeds.filter((m) => {
      const key = `${m.penyakit.toLowerCase().trim()}::${m.nama.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setMeds(unique);
    setLoading(false);
  }, [user]);

  const fetchMedsRef = useRef(fetchMeds);
  useEffect(() => {
    fetchMedsRef.current = fetchMeds;
  }, [fetchMeds]);

  useEffect(() => {
    fetchMeds();
  }, [fetchMeds]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchMedsRef.current();
    };
    if (typeof window !== "undefined") {
      window.addEventListener(REMINDERS_UPDATED_EVENT, handleUpdate);
      return () => {
        window.removeEventListener(REMINDERS_UPDATED_EVENT, handleUpdate);
      };
    }
  }, []);

  return { meds, loading, refetch: fetchMeds };
}

