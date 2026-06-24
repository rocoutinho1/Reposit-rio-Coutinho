import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proposta Maker",
  description: "Gerador de propostas comerciais audiovisuais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-black antialiased">{children}</body>
    </html>
  );
}
