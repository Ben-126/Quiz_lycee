interface IndicateurMaitriseProps {
  scoreMoyen: number | null;
  nombreQuiz: number;
}

export default function IndicateurMaitrise({ scoreMoyen, nombreQuiz }: IndicateurMaitriseProps) {
  if (nombreQuiz === 0 || scoreMoyen === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text3)", display: "inline-block" }} />
        <span style={{ fontFamily: "var(--f-body)", fontSize: "0.75rem", color: "var(--text3)" }}>Pas encore fait</span>
      </div>
    );
  }

  const couleurBarre =
    scoreMoyen >= 80 ? "var(--teal)" :
    scoreMoyen < 40 ? "var(--coral)" : "var(--amber)";

  const couleurTexte =
    scoreMoyen >= 80 ? "var(--teal)" :
    scoreMoyen < 40 ? "var(--coral-l)" : "var(--amber)";

  const bgBadge =
    scoreMoyen >= 80 ? "rgba(61,214,191,0.1)" :
    scoreMoyen < 40 ? "rgba(239,110,90,0.1)" : "rgba(245,200,64,0.1)";

  const borderBadge =
    scoreMoyen >= 80 ? "rgba(61,214,191,0.25)" :
    scoreMoyen < 40 ? "rgba(239,110,90,0.25)" : "rgba(245,200,64,0.25)";

  const emoji =
    scoreMoyen >= 80 ? "🟢" :
    scoreMoyen < 40 ? "🔴" : "🟡";

  return (
    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        display: "inline-block",
        fontFamily: "var(--f-head)",
        fontWeight: 700,
        fontSize: "0.72rem",
        padding: "2px 8px",
        borderRadius: "var(--r-pill)",
        background: bgBadge,
        color: couleurTexte,
        border: `1px solid ${borderBadge}`,
        alignSelf: "flex-start",
      }}>
        {emoji} {scoreMoyen}% · {nombreQuiz} quiz
      </span>
      <div style={{
        width: "100%",
        height: 4,
        background: "rgba(255,255,255,0.07)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div
          style={{
            height: "100%",
            background: couleurBarre,
            borderRadius: 2,
            width: `${scoreMoyen}%`,
            transition: "width .7s ease",
          }}
        />
      </div>
    </div>
  );
}
