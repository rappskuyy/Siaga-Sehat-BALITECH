import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

export interface RecommendedMed {
  nama: string;
  dosis: string;
  catatan: string;
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

    // Fetch from last scan_history (structured obat_rekomendasi)
    const { data: scanData } = await supabase
      .from("scan_history")
      .select("id, obat_rekomendasi")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const scanMeds: RecommendedMed[] = [];
    if (scanData) {
      for (const row of scanData) {
        const obats = (row.obat_rekomendasi as Array<{ nama: string; dosis: string; catatan: string }>) ?? [];
        for (const o of obats) {
          scanMeds.push({ nama: o.nama, dosis: o.dosis, catatan: o.catatan, sourceType: "scan", sourceId: row.id });
        }
      }
    }

    // Deduplicate by name (case-insensitive)
    const seen = new Set<string>();
    const unique = scanMeds.filter((m) => {
      const key = m.nama.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setMeds(unique);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMeds();
  }, [fetchMeds]);

  return { meds, loading, refetch: fetchMeds };
}
