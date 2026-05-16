import Header from "@/components/navigation/Header";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProgressionLoading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 900, margin: "0 auto", width: "100%", padding: "32px 20px" }}>
        {/* Titre */}
        <Skeleton style={{ height: 30, width: "40%", marginBottom: 24 }} />

        {/* Onglets niveau */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} style={{ height: 34, width: 110, borderRadius: "var(--r-pill)" }} />
          ))}
        </div>

        {/* Stats globales */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px" }}>
              <Skeleton style={{ height: 12, width: "55%", marginBottom: 12 }} />
              <Skeleton style={{ height: 32, width: "45%", marginBottom: 6 }} />
              <Skeleton style={{ height: 10, width: "70%" }} />
            </div>
          ))}
        </div>

        {/* Graphique */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px", marginBottom: 20 }}>
          <Skeleton style={{ height: 14, width: "30%", marginBottom: 20 }} />
          <Skeleton style={{ height: 180, borderRadius: "var(--r-md)" }} />
        </div>

        {/* Liste chapitres */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px" }}>
          <Skeleton style={{ height: 14, width: "25%", marginBottom: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Skeleton style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skeleton style={{ height: 12, width: "60%", marginBottom: 6 }} />
                  <Skeleton style={{ height: 8, width: "100%", borderRadius: 999 }} />
                </div>
                <Skeleton style={{ height: 18, width: 36, borderRadius: "var(--r-pill)" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
