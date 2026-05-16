import Header from "@/components/navigation/Header";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ChapitreLoading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 700, margin: "0 auto", width: "100%", padding: "32px 20px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Skeleton style={{ height: 12, width: 60, borderRadius: "var(--r-pill)" }} />
          <Skeleton style={{ height: 8, width: 8, borderRadius: "50%" }} />
          <Skeleton style={{ height: 12, width: 80, borderRadius: "var(--r-pill)" }} />
          <Skeleton style={{ height: 8, width: 8, borderRadius: "50%" }} />
          <Skeleton style={{ height: 12, width: 120, borderRadius: "var(--r-pill)" }} />
        </div>

        {/* Titre du chapitre */}
        <Skeleton style={{ height: 32, width: "75%", marginBottom: 8 }} />
        <Skeleton style={{ height: 15, width: "45%", marginBottom: 24 }} />

        {/* Card info chapitre */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px", marginBottom: 20 }}>
          <Skeleton style={{ height: 12, width: "30%", marginBottom: 14 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ height: 26, width: [90, 110, 75, 95][i], borderRadius: "var(--r-pill)" }} />
            ))}
          </div>
        </div>

        {/* Progression */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <Skeleton style={{ height: 12, width: "35%" }} />
            <Skeleton style={{ height: 12, width: "15%" }} />
          </div>
          <Skeleton style={{ height: 8, width: "100%", borderRadius: 999 }} />
        </div>

        {/* Bouton démarrer */}
        <Skeleton style={{ height: 52, width: "100%", borderRadius: "var(--r-pill)" }} />
      </main>
    </div>
  );
}
