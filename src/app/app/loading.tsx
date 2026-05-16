import Header from "@/components/navigation/Header";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 700, margin: "0 auto", width: "100%", padding: "32px 20px" }}>
        {/* Salutation */}
        <Skeleton style={{ height: 28, width: "55%", marginBottom: 8 }} />
        <Skeleton style={{ height: 16, width: "35%", marginBottom: 32 }} />

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "14px 16px" }}>
              <Skeleton style={{ height: 11, width: "50%", marginBottom: 10 }} />
              <Skeleton style={{ height: 26, width: "65%" }} />
            </div>
          ))}
        </div>

        {/* Matières grid */}
        <Skeleton style={{ height: 16, width: "30%", marginBottom: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
              <Skeleton style={{ height: 64, borderRadius: 0 }} />
              <div style={{ padding: "8px 10px" }}>
                <Skeleton style={{ height: 12, width: "80%", marginBottom: 5 }} />
                <Skeleton style={{ height: 10, width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
