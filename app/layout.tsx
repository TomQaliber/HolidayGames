import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Holiday Games",
  description: "Dagelijkse familiespelletjes — plezier in de zon!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF8E7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${fredoka.variable} ${nunito.variable} antialiased`}>
        <div className="bunting" />
        <div className="mx-auto min-h-dvh max-w-[480px]">{children}</div>
        <MusicPlayer />
      </body>
    </html>
  );
}
