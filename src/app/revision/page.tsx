import type { Metadata } from "next";
import RevisionIntelligente from "@/components/revision/RevisionIntelligente";

export const metadata: Metadata = {
  title: "Révision intelligente · Révioria",
  description: "Système de répétition espacée — révise les questions difficiles au bon moment.",
};

export default function PageRevision() {
  return <RevisionIntelligente />;
}
