import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DM_Serif_Display, Nunito, Quicksand } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/engagement/ServiceWorkerRegistrar";
import BandeauCookies from "@/components/legal/BandeauCookies";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-display",
});

const nunito = Nunito({
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--f-head",
});

const quicksand = Quicksand({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--f-body",
});

export const metadata: Metadata = {
  title: "Révioria — Révise avec l'IA",
  description: "Application de quiz IA pour réviser les programmes du lycée général et technologique : Seconde, Première et Terminale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${dmSerif.variable} ${nunito.variable} ${quicksand.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <ServiceWorkerRegistrar />
        {children}
        <BandeauCookies />
      </body>
    </html>
  );
}
