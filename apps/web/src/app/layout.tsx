import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "GameFolio — Ton identité gaming",
    template: "%s · GameFolio",
  },
  description:
    "Construis ton portfolio gaming : jeux, statistiques, rangs, achievements, badges. Exporte en PDF, partage ton profil. Local-first.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:12000",
  ),
  openGraph: {
    title: "GameFolio — Ton identité gaming",
    description:
      "Construis ton portfolio gaming : jeux, statistiques, rangs, achievements, badges. Exporte en PDF, partage ton profil.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
