import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/engagement/ServiceWorkerRegistrar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuizLycée — Révise avec l'IA",
  description: "Application de quiz IA pour réviser les programmes du lycée général et technologique : Seconde, Première et Terminale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.className}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
