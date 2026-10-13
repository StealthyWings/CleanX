import type { Metadata, Viewport } from "next";
import { Oswald, Poppins } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

const poppins = Poppins({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

// Tall condensed display face for headings, nav and buttons
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: {
    default: "CleanX — Smart Garbage Hotspot Reporter",
    template: "%s · CleanX",
  },
  description:
    "Report, track, and clean garbage hotspots in your city. AI-powered severity detection, real-time volunteer coordination, and smart city dashboard.",
  keywords: ["garbage", "waste management", "civic tech", "smart city", "cleanup", "volunteer"],
};

export const viewport: Viewport = {
  themeColor: "#7a8b3f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${oswald.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
